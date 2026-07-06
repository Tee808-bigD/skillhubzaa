let supabaseClient;
let currentUser;
let currentProfile;

const $ = (id) => document.getElementById(id);
const views = ['feed', 'services', 'professionals', 'messages'];

init().catch((error) => showAuthMessage(error.message));

async function init() {
  const config = await request('/api/config');
  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  bindAuth();
  bindApp();

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) await enterApp(data.session.user);
}

function bindAuth() {
  $('loginTab').addEventListener('click', () => setAuthMode('login'));
  $('registerTab').addEventListener('click', () => setAuthMode('register'));

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    showAuthMessage('');
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: $('loginEmail').value.trim(),
      password: $('loginPassword').value
    });
    if (error) return showAuthMessage(error.message);
    await enterApp(data.user);
  });

  $('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    showAuthMessage('');
    const { data, error } = await supabaseClient.auth.signUp({
      email: $('registerEmail').value.trim(),
      password: $('registerPassword').value,
      options: {
        data: {
          full_name: $('registerName').value.trim(),
          account_type: $('registerType').value
        }
      }
    });
    if (error) return showAuthMessage(error.message);
    if (!data.session) return showAuthMessage('Check your email to confirm your account, then log in.');
    await enterApp(data.user);
  });
}

function bindApp() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  $('logoutButton').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    $('appView').classList.add('hidden');
    $('authView').classList.remove('hidden');
    $('logoutButton').classList.add('hidden');
  });

  $('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/me', {
      method: 'PATCH',
      body: {
        skill: $('profileSkill').value.trim() || null,
        location: $('profileLocation').value.trim() || null,
        bio: $('profileBio').value.trim() || null
      }
    });
    await loadMe();
    showAppMessage('Profile saved.');
  });

  $('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/posts', { method: 'POST', body: { body: $('postBody').value.trim(), attachments: [] } });
    $('postBody').value = '';
    await loadPosts();
  });

  $('serviceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/services', {
      method: 'POST',
      body: {
        title: $('serviceTitle').value.trim(),
        category: $('serviceCategory').value.trim(),
        location: $('serviceLocation').value.trim() || null,
        price_cents: $('servicePrice').value ? Number($('servicePrice').value) : null,
        description: $('serviceDescription').value.trim()
      }
    });
    event.target.reset();
    await loadServices();
  });

  $('professionalSearch').addEventListener('input', debounce(loadProfessionals, 300));

  $('messageForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/messages', {
      method: 'POST',
      body: {
        recipient_id: $('messageRecipient').value.trim(),
        body: $('messageBody').value.trim()
      }
    });
    $('messageBody').value = '';
    await loadMessages();
  });
}

async function enterApp(user) {
  currentUser = user;
  $('authView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('logoutButton').classList.remove('hidden');
  await loadMe();
  await Promise.all([loadPosts(), loadServices(), loadProfessionals(), loadMessages()]);
}

async function loadMe() {
  currentProfile = await api('/api/me');
  $('profileAvatar').src = currentProfile.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(currentProfile.email)}`;
  $('profileAvatar').alt = `${currentProfile.full_name} avatar`;
  $('profileName').textContent = currentProfile.full_name;
  $('profileMeta').textContent = `${currentProfile.account_type}${currentProfile.skill ? ` • ${currentProfile.skill}` : ''}`;
  $('profileSkill').value = currentProfile.skill || '';
  $('profileLocation').value = currentProfile.location || '';
  $('profileBio').value = currentProfile.bio || '';
}

async function loadPosts() {
  const posts = await api('/api/posts');
  $('postsList').replaceChildren(...posts.map(renderPost));
}

function renderPost(post) {
  const card = el('article', 'card');
  card.append(
    el('div', 'meta', `${post.author.full_name} • ${new Date(post.created_at).toLocaleString()}`),
    el('p', '', post.body),
    el('div', 'meta', `${post.reaction_count} reactions • ${post.comment_count} comments`)
  );
  const actions = el('div', 'actions');
  ['like', 'heart', 'laugh', 'wow'].forEach((reaction) => {
    const button = el('button', '', reaction);
    button.addEventListener('click', async () => {
      await api(`/api/posts/${post.id}/reactions`, { method: 'POST', body: { reaction } });
      await loadPosts();
    });
    actions.append(button);
  });
  const input = document.createElement('input');
  input.placeholder = 'Write a comment';
  const send = el('button', '', 'Comment');
  send.addEventListener('click', async () => {
    if (!input.value.trim()) return;
    await api(`/api/posts/${post.id}/comments`, { method: 'POST', body: { body: input.value.trim() } });
    input.value = '';
    await loadPosts();
  });
  actions.append(input, send);
  card.append(actions);
  return card;
}

async function loadServices() {
  const services = await api('/api/services');
  $('servicesList').replaceChildren(...services.map((service) => {
    const card = el('article', 'card');
    card.append(
      el('h3', '', service.title),
      el('div', 'meta', `${service.category} • ${service.provider.full_name}`),
      el('p', '', service.description),
      el('div', 'meta', `${service.location || 'Remote/local'}${service.price_cents ? ` • R${(service.price_cents / 100).toFixed(2)}` : ''}`)
    );
    const book = el('button', 'secondary', 'Request booking');
    book.addEventListener('click', async () => {
      await api('/api/bookings', { method: 'POST', body: { service_id: service.id, note: 'Booking request from SkillHubZA app' } });
      showAppMessage('Booking request sent.');
    });
    card.append(el('div', 'actions')).lastChild.append(book);
    return card;
  }));
}

async function loadProfessionals() {
  const query = encodeURIComponent($('professionalSearch').value.trim());
  const people = await api(`/api/professionals${query ? `?search=${query}` : ''}`);
  $('professionalsList').replaceChildren(...people.map((person) => {
    const card = el('article', 'card');
    card.append(
      el('h3', '', person.full_name),
      el('div', 'meta', `${person.skill || 'Professional'} • ${person.location || 'Location not set'}`),
      el('p', '', person.bio || 'No bio yet.'),
      el('div', 'meta', `User ID: ${person.id}`)
    );
    return card;
  }));
}

async function loadMessages() {
  const messages = await api('/api/messages');
  $('messagesList').replaceChildren(...messages.map((message) => {
    const other = message.sender_id === currentUser.id ? message.recipient.full_name : message.sender.full_name;
    const card = el('article', 'card');
    card.append(
      el('div', 'meta', `${other} • ${new Date(message.created_at).toLocaleString()}`),
      el('p', '', message.body)
    );
    return card;
  }));
}

function showView(view) {
  views.forEach((name) => {
    $(`${name}View`).classList.toggle('active-view', name === view);
    document.querySelector(`[data-view="${name}"]`).classList.toggle('active', name === view);
  });
}

function setAuthMode(mode) {
  const isLogin = mode === 'login';
  $('loginForm').classList.toggle('hidden', !isLogin);
  $('registerForm').classList.toggle('hidden', isLogin);
  $('loginTab').classList.toggle('active', isLogin);
  $('registerTab').classList.toggle('active', !isLogin);
  showAuthMessage('');
}

async function api(path, options = {}) {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) throw new Error('Please log in again.');
  return request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(options.headers || {})
    }
  });
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showAuthMessage(message) { $('authMessage').textContent = message; }
function showAppMessage(message) {
  $('appMessage').textContent = message;
  window.setTimeout(() => { $('appMessage').textContent = ''; }, 3500);
}
function debounce(fn, wait) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
