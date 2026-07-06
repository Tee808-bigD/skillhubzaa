const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

const authClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 90;

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  account_type: z.enum(['client', 'professional']).optional(),
  bio: z.string().trim().max(500).optional().nullable(),
  skill: z.string().trim().max(120).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  avatar_url: z.string().url().max(500).optional().nullable()
});

const postSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  attachments: z.array(z.string().url().max(1000)).max(6).default([])
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(800)
});

const reactionSchema = z.object({
  reaction: z.enum(['like', 'heart', 'laugh', 'wow', 'sad', 'angry'])
});

const serviceSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(1200),
  category: z.string().trim().min(2).max(80),
  price_cents: z.number().int().min(0).max(10_000_000).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable()
});

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  scheduled_for: z.string().datetime().optional().nullable(),
  note: z.string().trim().max(800).optional().nullable()
});

const messageSchema = z.object({
  recipient_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000)
});

exports.handler = async (event) => {
  try {
    const origin = event.headers.origin || '';
    const headers = securityHeaders(origin);

    if (event.httpMethod === 'OPTIONS') {
      return response(204, null, headers);
    }

    if (!isAllowedOrigin(origin)) {
      return response(403, { error: 'Origin is not allowed' }, headers);
    }

    if (!rateLimit(event)) {
      return response(429, { error: 'Too many requests' }, headers);
    }

    const path = normalizePath(event.path);
    const method = event.httpMethod;

    if (method === 'GET' && path === '/config') {
      return response(200, { supabaseUrl, supabaseAnonKey: anonKey }, headers);
    }

    if (method === 'GET' && path === '/health') {
      return response(200, { ok: true }, headers);
    }

    const user = await requireUser(event);

    if (method === 'GET' && path === '/me') {
      const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'PATCH' && path === '/me') {
      const input = parseJson(event, profileSchema);
      const { data, error } = await db.from('profiles').update(input).eq('id', user.id).select('*').single();
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'GET' && path === '/professionals') {
      const search = (event.queryStringParameters?.search || '').trim();
      let query = db.from('profiles')
        .select('id, full_name, avatar_url, bio, skill, location, rating_avg, rating_count')
        .eq('account_type', 'professional')
        .order('rating_avg', { ascending: false })
        .limit(50);
      if (search) {
        query = query.or(`full_name.ilike.%${escapeLike(search)}%,skill.ilike.%${escapeLike(search)}%,location.ilike.%${escapeLike(search)}%`);
      }
      const { data, error } = await query;
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'GET' && path === '/posts') {
      const { data, error } = await db.from('post_feed').select('*').limit(50);
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'POST' && path === '/posts') {
      const input = parseJson(event, postSchema);
      const { data, error } = await db.from('posts').insert({ author_id: user.id, ...input }).select('*').single();
      throwIf(error);
      return response(201, data, headers);
    }

    const commentMatch = path.match(/^\/posts\/([0-9a-f-]+)\/comments$/i);
    if (method === 'POST' && commentMatch) {
      const input = parseJson(event, commentSchema);
      const { data, error } = await db.from('comments').insert({ post_id: commentMatch[1], author_id: user.id, ...input }).select('*').single();
      throwIf(error);
      return response(201, data, headers);
    }

    const reactionMatch = path.match(/^\/posts\/([0-9a-f-]+)\/reactions$/i);
    if (method === 'POST' && reactionMatch) {
      const input = parseJson(event, reactionSchema);
      const { data, error } = await db.from('reactions').upsert({ post_id: reactionMatch[1], user_id: user.id, reaction: input.reaction }, { onConflict: 'post_id,user_id' }).select('*').single();
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'GET' && path === '/services') {
      const { data, error } = await db.from('services_with_provider').select('*').eq('is_active', true).limit(100);
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'POST' && path === '/services') {
      const input = parseJson(event, serviceSchema);
      const profile = await getProfile(user.id);
      if (profile.account_type !== 'professional') return response(403, { error: 'Only professionals can create services' }, headers);
      const { data, error } = await db.from('services').insert({ provider_id: user.id, ...input }).select('*').single();
      throwIf(error);
      return response(201, data, headers);
    }

    if (method === 'POST' && path === '/bookings') {
      const input = parseJson(event, bookingSchema);
      const { data, error } = await db.from('bookings').insert({ client_id: user.id, ...input }).select('*').single();
      throwIf(error);
      return response(201, data, headers);
    }

    if (method === 'GET' && path === '/messages') {
      const { data, error } = await db.from('messages_with_profiles').select('*').or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).limit(100);
      throwIf(error);
      return response(200, data, headers);
    }

    if (method === 'POST' && path === '/messages') {
      const input = parseJson(event, messageSchema);
      if (input.recipient_id === user.id) return response(400, { error: 'Cannot message yourself' }, headers);
      const { data, error } = await db.from('messages').insert({ sender_id: user.id, ...input }).select('*').single();
      throwIf(error);
      return response(201, data, headers);
    }

    return response(404, { error: 'Not found' }, headers);
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status >= 500 ? 'Internal server error' : error.message;
    return response(status, { error: message }, securityHeaders(event.headers.origin || ''));
  }
};

function normalizePath(path) {
  return path
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '') || '/';
}

function parseJson(event, schema) {
  if (!event.body || event.body.length > 32_000) {
    const error = new Error('Request body is missing or too large');
    error.statusCode = 400;
    throw error;
  }
  const json = JSON.parse(event.body);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    error.statusCode = 400;
    throw error;
  }
  return parsed.data;
}

async function requireUser(event) {
  const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    const authError = new Error('Invalid or expired session');
    authError.statusCode = 401;
    throw authError;
  }
  return data.user;
}

async function getProfile(id) {
  const { data, error } = await db.from('profiles').select('*').eq('id', id).single();
  throwIf(error);
  return data;
}

function throwIf(error) {
  if (!error) return;
  const e = new Error(error.message || 'Database error');
  e.statusCode = 400;
  throw e;
}

function securityHeaders(origin) {
  const allowOrigin = isAllowedOrigin(origin) ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return origin === allowedOrigin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
}

function rateLimit(event) {
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(ip, bucket);
  return bucket.count <= MAX_REQUESTS;
}

function response(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: body === null ? '' : JSON.stringify(body)
  };
}

function escapeLike(value) {
  return value.replace(/[%,]/g, '').slice(0, 80);
}
