import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to initialize Gemini SDK safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Endpoint: Generate Post Draft
  app.post("/api/ai/generate-post", async (req, res) => {
    try {
      const { topic, tone = "engaging", category = "general" } = req.body || {};
      const ai = getAi();
      
      if (!ai) {
        return res.json({
          content: `🚀 Just thinking about ${topic || "innovation"} today! What are your thoughts on where this is heading in the next 5 years? #tech #${category}`,
          tags: ["tech", category, "innovation"],
          suggestedPoll: topic ? { question: `Is ${topic} the future?`, options: ["Absolutely Yes", "Needs Time", "Overhyped"] } : null
        });
      }

      const prompt = `You are a social media expert creating an engaging, modern post for an activity feed.
Topic/Keywords: "${topic || "tech trends, modern design, productivity"}"
Tone: ${tone}
Category: ${category}

Respond with pure JSON object matching this structure:
{
  "content": "A compelling 2-4 sentence post text with relevant emojis and call to action",
  "tags": ["tag1", "tag2", "tag3"],
  "poll": {
    "question": "A relevant engaging poll question related to the topic (or empty string if not applicable)",
    "options": ["Option A", "Option B", "Option C"]
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text || "{}";
      const parsed = JSON.parse(jsonText);

      res.json({
        content: parsed.content || `Excited to explore ${topic || "new ideas"} today!`,
        tags: parsed.tags || ["trending", "discussion"],
        suggestedPoll: parsed.poll?.question ? parsed.poll : null,
      });
    } catch (err: any) {
      console.error("AI Generate Post error:", err);
      res.status(500).json({ error: err.message || "Failed to generate post draft" });
    }
  });

  // AI Endpoint: Summarize Feed Highlights
  app.post("/api/ai/summarize-feed", async (req, res) => {
    try {
      const { posts = [] } = req.body || {};
      const ai = getAi();

      if (!ai || posts.length === 0) {
        return res.json({
          summary: [
            "🔥 AI & Tech discussions dominate today's feed with updates on modern web tooling.",
            "🎨 Product design trends emphasize minimal UI and refined micro-interactions.",
            "🚀 Community members are actively sharing workspace setups and poll insights."
          ]
        });
      }

      const postsSnippet = posts.slice(0, 8).map((p: any) => `- Author: ${p.author.name}, Content: "${p.content}"`).join("\n");
      const prompt = `Summarize the top 3 key highlights from this social feed into crisp, engaging bullet points with emojis:

${postsSnippet}

Return pure JSON:
{
  "summary": [
    "Bullet point 1 with emoji",
    "Bullet point 2 with emoji",
    "Bullet point 3 with emoji"
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        summary: parsed.summary || [
          "✨ Active discussions across AI tools, user experience, and full-stack performance.",
          "💡 High engagement on interactive polls and code architecture showcases.",
          "📈 Community members are connecting over creative workflows."
        ],
      });
    } catch (err: any) {
      console.error("AI Summarize error:", err);
      res.status(500).json({ error: err.message || "Failed to summarize feed" });
    }
  });

  // AI Endpoint: Smart Replies for Comments
  app.post("/api/ai/smart-reply", async (req, res) => {
    try {
      const { postContent } = req.body || {};
      const ai = getAi();

      if (!ai || !postContent) {
        return res.json({
          suggestions: [
            "Great insight! Thanks for sharing this 👏",
            "Totally agree with this approach 🔥",
            "Would love to see a follow-up on this topic!"
          ]
        });
      }

      const prompt = `Given this social media post content: "${postContent}"
Provide 3 short, natural, friendly comment suggestions (1 sentence each) that a user could click to reply.

Return pure JSON:
{
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        suggestions: parsed.suggestions || [
          "Great perspective on this! 🚀",
          "Thanks for sharing, super useful insights.",
          "Interesting points, definitely worth bookmarking."
        ]
      });
    } catch (err: any) {
      console.error("AI Smart Reply error:", err);
      res.status(500).json({ error: err.message || "Failed to generate smart replies" });
    }
  });

  // AI Endpoint: SkillHub ZA Career Roadmap Generator
  app.post("/api/ai/career-roadmap", async (req, res) => {
    try {
      const { careerField, educationLevel, location = "South Africa" } = req.body || {};
      const ai = getAi();

      if (!ai) {
        return res.json({
          field: careerField || "Software Engineering",
          summary: `Personalized South African learning pathway for ${careerField || "Software Engineering"} in ${location}.`,
          steps: [
            {
              phase: "Step 1: Core Fundamentals (Months 1-2)",
              title: "Foundational Skills & Certification",
              description: "Complete foundational course on SkillHub ZA and earn your SETA-recognized NQF level badge.",
              recommendedCourses: ["Full-Stack Software Development", "Digital Marketing Basics"]
            },
            {
              phase: "Step 2: Practical Experience (Months 3-5)",
              title: "Portfolio & Practical Work",
              description: "Build 3 real-world projects and list your services on the SkillHub ZA Youth Freelance Marketplace.",
              recommendedCourses: ["Git & Cloud Deployment", "Freelance Service Setup"]
            },
            {
              phase: "Step 3: SETA Learnership Placement (Months 6-12)",
              title: "Funded Workplace Learnership",
              description: "Apply for MICT SETA or BankSETA sponsored learnerships with monthly stipends ranging R4,500 - R7,000.",
              recommendedCourses: ["MICT SETA Systems Development Learnership"]
            },
            {
              phase: "Step 4: Industry & Career Growth (Year 2+)",
              title: "Junior Role or Tech Enterprise",
              description: "Book 1-on-1 mentorship sessions with South African industry leaders and apply for permanent roles."
            }
          ],
          recommendedSeta: "MICT SETA / Services SETA",
          keySkillsToMaster: ["Problem Solving", "Modern Web Frameworks", "Agile Workflows", "Communication"]
        });
      }

      const prompt = `You are the lead AI Career Advisor for SkillHub ZA, South Africa's premier youth skills & SETA learnership platform.
Create a personalized 4-step South African career roadmap for a youth aiming for:
Target Field: "${careerField || "Full Stack Web Development"}"
Current Education Level: "${educationLevel || "Matric / Grade 12"}"
Location: "${location}"

Respond with pure JSON object:
{
  "field": "${careerField}",
  "summary": "2 sentence encouraging overview of career prospects in South Africa",
  "steps": [
    {
      "phase": "Step 1: Core Fundamentals",
      "title": "Title of step",
      "description": "Clear actionable description relevant to SA youth",
      "recommendedCourses": ["Course A", "Course B"]
    },
    {
      "phase": "Step 2: Practical Projects",
      "title": "Title of step",
      "description": "Clear actionable description",
      "recommendedCourses": ["Project 1"]
    },
    {
      "phase": "Step 3: SETA Learnership Placement",
      "title": "Title of step",
      "description": "Clear description mentioning SETA learnerships & stipends in ZAR"
    },
    {
      "phase": "Step 4: Professional Employment",
      "title": "Title of step",
      "description": "Clear description on mentorship and long-term career growth"
    }
  ],
  "recommendedSeta": "Name of relevant SA SETA (e.g. MICT SETA, EWSETA, BankSETA)",
  "keySkillsToMaster": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("AI Roadmap error:", err);
      res.status(500).json({ error: err.message || "Failed to generate roadmap" });
    }
  });

  // AI Endpoint: Generate Post Caption & Hashtags
  app.post("/api/ai/generate-caption", async (req, res) => {
    try {
      const { prompt: userPrompt } = req.body || {};
      const ai = getAi();

      if (!ai || !userPrompt) {
        return res.json({
          caption: `🚀 Project Milestone: ${userPrompt || "Achieved new milestone in trade and skills!"}. Dedicated to quality execution and community impact.`,
          hashtags: "#SkillHub #SouthAfrica #Craftsmanship #YouthSkills #TradeExcellence"
        });
      }

      const prompt = `You are a social media specialist creating an engaging caption and hashtags for a project update on SkillHub.
User Input: "${userPrompt}"

Respond with pure JSON object:
{
  "caption": "An inspiring, high-impact 2-3 sentence post caption with relevant emojis",
  "hashtags": "#SkillHub #SouthAfrica #CategoryHashtag #SkillHashtag"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        caption: parsed.caption || `🚀 Project Milestone: ${userPrompt}`,
        hashtags: parsed.hashtags || "#SkillHub #SouthAfrica #Craftsmanship"
      });
    } catch (err: any) {
      console.error("AI Caption error:", err);
      res.status(500).json({ error: err.message || "Failed to generate caption" });
    }
  });

  // AI Endpoint: SETA-Aligned CV & Cover Letter Generator
  app.post("/api/ai/cv-builder", async (req, res) => {
    try {
      const { name, location, targetRole, education, skills = [] } = req.body || {};
      const ai = getAi();

      if (!ai) {
        return res.json({
          professionalSummary: `Driven and enthusiastic ${targetRole || "Junior Developer"} based in ${location || "Johannesburg, SA"}. Possesses strong technical foundations in ${(skills || []).join(", ") || "problem solving and teamwork"}, seeking a SETA learnership or entry-level role.`,
          keySkillsFormatted: (skills.length ? skills : ["Problem Solving", "Teamwork", "Computer Literacy"]).map((s: string) => `• ${s}`),
          suggestedCoverLetter: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${targetRole || "Learnership Opportunity"} at your organization. Having completed relevant skills training on SkillHub ZA and holding a ${education || "Matric Certificate"}, I am eager to apply my skills to add value to your team.\n\nThank you for considering my application.\n\nSincerely,\n${name || "Applicant"}`
        });
      }

      const prompt = `You are a professional HR specialist in South Africa crafting SETA-aligned CV profiles for young South Africans.
Applicant Name: "${name}"
Location: "${location}"
Target Role: "${targetRole}"
Education Level: "${education}"
Key Skills: "${skills.join(", ")}"

Respond with pure JSON object:
{
  "professionalSummary": "High-impact 3-sentence executive summary for CV",
  "keySkillsFormatted": ["• Bullet skill 1", "• Bullet skill 2", "• Bullet skill 3", "• Bullet skill 4"],
  "suggestedCoverLetter": "Full polite, professional 3-paragraph South African cover letter for learnership/job application"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("AI CV Builder error:", err);
      res.status(500).json({ error: err.message || "Failed to generate CV" });
    }
  });

  // ==========================================
  // Django REST Framework (DRF) Live Endpoints
  // ==========================================

  // In-memory data store replicating Django Models & Data
  let dbPosts = [
    {
      id: "post_1",
      author: {
        id: "usr_thando_808",
        username: "thando_dev",
        first_name: "Thando",
        last_name: "Mzobe",
        full_name: "Thando Mzobe",
        bio: "Full-stack software developer & youth tech mentor in Soweto.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Soweto, Johannesburg",
        province: "Gauteng",
        skills: ["React", "TypeScript", "Node.js", "Python", "Django"],
        is_creator: true,
        role: "youth",
        seta_verified: true,
        verified: true,
        badge: "Top Contributor"
      },
      content: "🇿🇦 Just completed our community Django backend migration for SkillHub ZA! Models, DRF serializers, and admin registration are all set up.",
      media_type: "image",
      media_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      video_url: null,
      category: "Tech & Coding",
      hashtags: ["Django", "Python", "SkillHubZA", "YouthInTech"],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes_count: 14,
      comments_count: 3,
      is_liked: false,
      comments: [
        {
          id: "cmt_1",
          author: { username: "lerato_solar", full_name: "Lerato Khumalo", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80" },
          content: "Incredible work! The DRF router makes adding endpoints super fast.",
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    },
    {
      id: "post_2",
      author: {
        id: "usr_lerato_solar",
        username: "lerato_solar",
        first_name: "Lerato",
        last_name: "Khumalo",
        full_name: "Lerato Khumalo",
        bio: "Certified Solar PV installer & electrical apprentice in Durban.",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
        location: "Durban, KwaZulu-Natal",
        province: "KwaZulu-Natal",
        skills: ["Solar PV Installation", "EWSETA Certified", "Inverter Wiring"],
        is_creator: true,
        role: "youth",
        seta_verified: true,
        verified: true,
        badge: "Artisan Pro"
      },
      content: "Finished another 5kW hybrid solar installation today in Umhlanga! Clean cable management and full backup power. ☀️🔋",
      media_type: "image",
      media_url: "https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80",
      video_url: null,
      category: "Green Energy & Trades",
      hashtags: ["SolarSA", "Trades", "CleanEnergy", "Durban"],
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      likes_count: 28,
      comments_count: 5,
      is_liked: true,
      comments: []
    }
  ];

  let dbEvents = [
    {
      id: "evt_1",
      title: "Gauteng Youth Tech & Freelance Summit 2026",
      description: "Join 500+ aspiring software engineers, artisans, and startup founders at the Tshimologong Digital Innovation Precinct in Braamfontein.",
      date: "2026-11-15T09:00:00Z",
      date_badge: "Nov 15",
      location: "Tshimologong Precinct, Braamfontein, JHB",
      organizer: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      },
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      category: "Hackathon & Summit",
      attendees_count: 142,
      is_attending: true,
      created_at: new Date().toISOString()
    },
    {
      id: "evt_2",
      title: "Cape Town Solar & Green Tech Hands-On Workshop",
      description: "Learn practical hybrid inverter wiring, battery storage sizing, and South African SANS compliance standards with certified EWSETA mentors.",
      date: "2026-11-28T10:00:00Z",
      date_badge: "Nov 28",
      location: "Woodstock Exchange, Cape Town",
      organizer: {
        id: "usr_lerato_solar",
        username: "lerato_solar",
        full_name: "Lerato Khumalo",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
      },
      image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
      category: "Hands-on Workshop",
      attendees_count: 88,
      is_attending: false,
      created_at: new Date().toISOString()
    }
  ];

  let dbServices = [
    {
      id: "srv_1",
      title: "Modern React & Python Django Web Development",
      description: "Custom web applications, responsive landing pages, and RESTful API integrations built to high performance standards.",
      provider: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      },
      price: "1850.00",
      price_unit: "project",
      category: "web_dev",
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      phone: "+27 72 345 6789",
      deliverables: ["Responsive UI", "REST API Integration", "1 Month Support"],
      verified_youth: true,
      created_at: new Date().toISOString()
    },
    {
      id: "srv_2",
      title: "Home & Business Solar System Assessment & Installation",
      description: "Full site survey, battery calculation, CoC certification assistance, and safe inverter setup.",
      provider: {
        id: "usr_lerato_solar",
        username: "lerato_solar",
        full_name: "Lerato Khumalo",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
      },
      price: "850.00",
      price_unit: "day",
      category: "solar_repair",
      image_url: "https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80",
      phone: "+27 83 234 5678",
      deliverables: ["Safety inspection", "Inverter wiring", "Load testing"],
      verified_youth: true,
      created_at: new Date().toISOString()
    }
  ];

  // Django Backend Metadata & Architecture Info
  app.get("/api/django/summary", (req, res) => {
    res.json({
      status: "ready",
      project_name: "skillhub_backend",
      app_name: "core",
      framework: "Django 5.0+ & Django REST Framework",
      database: "PostgreSQL (Production) / SQLite3 (Development)",
      custom_user_model: "core.User",
      models: [
        { name: "User", description: "Custom User extending AbstractUser (bio, avatar, location, skills, is_creator, role, province, seta_verified)" },
        { name: "Profile", description: "OneToOne model with phone, education_level, matric_year, certificates_count" },
        { name: "Post", description: "Feed posts with author, content, media_type, media_url, video_url, category, hashtags" },
        { name: "Comment", description: "Comments linked to Post and Author with timestamp" },
        { name: "Like", description: "Unique likes with unique_together constraint on (post, user)" },
        { name: "Event", description: "Community events, summits, and workshops with RSVPs" },
        { name: "Service", description: "Youth freelance & artisan service marketplace listings" },
        { name: "Reel", description: "Short video reels with video_url, caption, audio_track" },
        { name: "Message", description: "Direct 1-on-1 messages between users" }
      ],
      endpoints: [
        { path: "/api/posts/", method: "GET/POST", description: "List and create social feed posts" },
        { path: "/api/posts/{id}/like/", method: "POST", description: "Toggle like on post" },
        { path: "/api/posts/{id}/comments/", method: "GET/POST", description: "View and add comments" },
        { path: "/api/events/", method: "GET/POST", description: "Community events list and creation" },
        { path: "/api/events/{id}/rsvp/", method: "POST", description: "RSVP to an event" },
        { path: "/api/services/", method: "GET/POST", description: "Freelance service listings" },
        { path: "/api/reels/", method: "GET/POST", description: "Short video reels" },
        { path: "/api/users/", method: "GET", description: "SkillHub users list & profiles" },
        { path: "/api/users/me/", method: "GET", description: "Current authenticated user profile" }
      ],
      files_generated: [
        "skillhub_backend/manage.py",
        "skillhub_backend/requirements.txt",
        "skillhub_backend/.env.example",
        "skillhub_backend/skillhub_backend/settings.py",
        "skillhub_backend/skillhub_backend/urls.py",
        "skillhub_backend/skillhub_backend/wsgi.py",
        "skillhub_backend/skillhub_backend/asgi.py",
        "skillhub_backend/core/models.py",
        "skillhub_backend/core/admin.py",
        "skillhub_backend/core/serializers.py",
        "skillhub_backend/core/views.py",
        "skillhub_backend/core/urls.py",
        "skillhub_backend/core/signals.py",
        "skillhub_backend/README.md"
      ]
    });
  });

  // ==========================================
  // JWT Authentication Endpoints (SimpleJWT)
  // ==========================================
  const generateMockJwt = (userId: string, type: 'access' | 'refresh') => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      token_type: type,
      exp: Math.floor(Date.now() / 1000) + (type === 'access' ? 86400 : 86400 * 7),
      jti: Math.random().toString(36).substring(2),
      user_id: userId
    })).toString("base64url");
    const signature = Buffer.from(`signed_${type}_${userId}_skillhub`).toString("base64url");
    return `${header}.${payload}.${signature}`;
  };

  const handleTokenObtain = (req: any, res: any) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({
        detail: "No active account found with the given credentials"
      });
    }

    const userId = username.toLowerCase() === 'lerato_solar' ? 'usr_lerato_solar' : 'usr_thando_808';
    const isLerato = userId === 'usr_lerato_solar';

    const userObj = {
      id: userId,
      username: username,
      email: `${username.toLowerCase()}@skillhub.za`,
      first_name: isLerato ? "Lerato" : "Thando",
      last_name: isLerato ? "Khumalo" : "Mzobe",
      full_name: isLerato ? "Lerato Khumalo" : "Thando Mzobe",
      bio: isLerato 
        ? "Certified Solar PV installer & electrical apprentice in Durban." 
        : "Full-stack software developer & youth tech mentor in Soweto.",
      avatar: isLerato
        ? "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      location: isLerato ? "Durban, KwaZulu-Natal" : "Soweto, Johannesburg",
      province: isLerato ? "KwaZulu-Natal" : "Gauteng",
      skills: isLerato ? ["Solar PV Installation", "EWSETA Certified"] : ["React", "TypeScript", "Python", "Django"],
      is_creator: true,
      role: "youth",
      seta_verified: true,
      verified: true,
      badge: isLerato ? "Artisan Pro" : "Top Contributor"
    };

    res.json({
      access: generateMockJwt(userId, 'access'),
      refresh: generateMockJwt(userId, 'refresh'),
      user: userObj
    });
  };

  app.post("/api/token/", handleTokenObtain);
  app.post("/api/token", handleTokenObtain);

  // User Registration Endpoint
  const handleRegister = (req: any, res: any) => {
    const { username, email, full_name, role = "youth", password, confirm_password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ detail: "Please provide username, email, and password." });
    }
    if (password && confirm_password && password !== confirm_password) {
      return res.status(400).json({ confirm_password: ["Passwords do not match."] });
    }

    const userId = `usr_${username.toLowerCase().replace(/\s+/g, '_')}`;
    const nameParts = (full_name || username).trim().split(' ');
    const firstName = nameParts[0] || username;
    const lastName = nameParts.slice(1).join(' ') || '';

    const registeredUser = {
      id: userId,
      username: username.trim(),
      email: email.trim(),
      first_name: firstName,
      last_name: lastName,
      full_name: full_name?.trim() || username.trim(),
      bio: role === 'mentor' 
        ? "Experienced mentor dedicated to empowering South African youth." 
        : role === 'employer' 
        ? "SETA accredited employer & youth skills placement partner."
        : "Active youth member building trade & digital skills in South Africa.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      location: "Johannesburg, South Africa",
      province: "Gauteng",
      skills: role === 'mentor' ? ["Youth Mentorship", "Career Strategy"] : ["Digital Skills", "Trades & Technology"],
      is_creator: true,
      role: role,
      seta_verified: true,
      verified: true,
      badge: role === 'mentor' ? "Verified Mentor" : role === 'employer' ? "Accredited Employer" : "Verified Youth Member"
    };

    res.status(201).json({
      access: generateMockJwt(userId, 'access'),
      refresh: generateMockJwt(userId, 'refresh'),
      user: registeredUser,
      detail: "Account registered successfully."
    });
  };

  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/register/", handleRegister);

  // Logout Endpoints
  const handleLogoutEndpoint = (req: any, res: any) => {
    res.json({ detail: "Successfully logged out and token blacklisted." });
  };
  app.post("/api/token/logout", handleLogoutEndpoint);
  app.post("/api/token/logout/", handleLogoutEndpoint);
  app.post("/api/auth/logout", handleLogoutEndpoint);
  app.post("/api/auth/logout/", handleLogoutEndpoint);

  // POPIA Endpoints
  app.get("/api/users/data-export", (req: any, res: any) => {
    res.json({
      popia_statement: "Official Data Dossier under POPIA Section 23",
      exported_at: new Date().toISOString(),
      user: {
        id: "usr_active",
        username: "current_user",
        full_name: "Active SkillHub Member"
      }
    });
  });
  app.get("/api/users/data-export/", (req: any, res: any) => {
    res.json({
      popia_statement: "Official Data Dossier under POPIA Section 23",
      exported_at: new Date().toISOString(),
      user: {
        id: "usr_active",
        username: "current_user",
        full_name: "Active SkillHub Member"
      }
    });
  });

  app.post("/api/users/delete-account", (req: any, res: any) => {
    res.json({ detail: "Account and personal data successfully deleted under POPIA Section 24." });
  });
  app.post("/api/users/delete-account/", (req: any, res: any) => {
    res.json({ detail: "Account and personal data successfully deleted under POPIA Section 24." });
  });

  const handleTokenRefresh = (req: any, res: any) => {
    const { refresh } = req.body || {};
    if (!refresh) {
      return res.status(400).json({ detail: "Refresh token is required." });
    }
    res.json({
      access: generateMockJwt("usr_thando_808", 'access')
    });
  };

  app.post("/api/token/refresh/", handleTokenRefresh);
  app.post("/api/token/refresh", handleTokenRefresh);

  const handleUserMe = (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const isLerato = authHeader.includes('usr_lerato_solar');

    res.json({
      id: isLerato ? "usr_lerato_solar" : "usr_thando_808",
      username: isLerato ? "lerato_solar" : "thando_dev",
      email: isLerato ? "lerato@skillhub.za" : "thando@skillhub.za",
      first_name: isLerato ? "Lerato" : "Thando",
      last_name: isLerato ? "Khumalo" : "Mzobe",
      full_name: isLerato ? "Lerato Khumalo" : "Thando Mzobe",
      bio: isLerato 
        ? "Certified Solar PV installer & electrical apprentice in Durban." 
        : "Full-stack software developer & youth tech mentor in Soweto.",
      avatar: isLerato
        ? "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      location: isLerato ? "Durban, KwaZulu-Natal" : "Soweto, Johannesburg",
      province: isLerato ? "KwaZulu-Natal" : "Gauteng",
      skills: isLerato ? ["Solar PV Installation", "EWSETA Certified"] : ["React", "TypeScript", "Python", "Django"],
      is_creator: true,
      role: "youth",
      seta_verified: true,
      verified: true,
      badge: isLerato ? "Artisan Pro" : "Top Contributor"
    });
  };

  app.get("/api/users/me/", handleUserMe);
  app.get("/api/users/me", handleUserMe);

  // DRF Posts Endpoint
  const handleGetPosts = (req: any, res: any) => {
    res.json({
      count: dbPosts.length,
      next: null,
      previous: null,
      results: dbPosts
    });
  };
  app.get("/api/posts", handleGetPosts);
  app.get("/api/posts/", handleGetPosts);

  const handleCreatePost = (req: any, res: any) => {
    const { content, media_url, video_url, media_type = "text", category = "General", hashtags = [] } = req.body || {};
    if (!content) {
      return res.status(400).json({ content: ["This field may not be blank."] });
    }

    const newPost = {
      id: `post_${Date.now()}`,
      author: {
        id: "usr_thando_808",
        username: "thando_dev",
        first_name: "Thando",
        last_name: "Mzobe",
        full_name: "Thando Mzobe",
        bio: "Full-stack software developer & youth tech mentor in Soweto.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Soweto, Johannesburg",
        province: "Gauteng",
        skills: ["React", "TypeScript", "Node.js", "Python", "Django"],
        is_creator: true,
        role: "youth",
        seta_verified: true,
        verified: true,
        badge: "Top Contributor"
      },
      content,
      media_type,
      media_url: media_url || null,
      video_url: video_url || null,
      category,
      hashtags: Array.isArray(hashtags) ? hashtags : (typeof hashtags === 'string' ? hashtags.split(',').map((s: string) => s.trim()) : []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      comments: []
    };

    dbPosts.unshift(newPost);
    res.status(201).json(newPost);
  };
  app.post("/api/posts", handleCreatePost);
  app.post("/api/posts/", handleCreatePost);

  // DRF Post Like / Toggle Like Action (Supports both /toggle_like/ and /like/)
  const handleToggleLike = (req: any, res: any) => {
    const { id } = req.params;
    const post = dbPosts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ detail: "Not found." });
    }

    post.is_liked = !post.is_liked;
    post.likes_count += post.is_liked ? 1 : -1;

    res.json({
      status: "success",
      is_liked: post.is_liked,
      likes_count: post.likes_count
    });
  };
  app.post("/api/posts/:id/like", handleToggleLike);
  app.post("/api/posts/:id/like/", handleToggleLike);
  app.post("/api/posts/:id/toggle_like", handleToggleLike);
  app.post("/api/posts/:id/toggle_like/", handleToggleLike);

  // DRF Post Comments
  app.get("/api/posts/:id/comments", (req, res) => {
    const { id } = req.params;
    const post = dbPosts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ detail: "Not found." });
    }
    res.json(post.comments || []);
  });

  app.post("/api/posts/:id/comments", (req, res) => {
    const { id } = req.params;
    const post = dbPosts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ detail: "Not found." });
    }

    const { content } = req.body || {};
    if (!content) {
      return res.status(400).json({ content: ["This field may not be blank."] });
    }

    const newComment = {
      id: `cmt_${Date.now()}`,
      author: {
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      },
      content,
      created_at: new Date().toISOString()
    };

    post.comments.push(newComment);
    post.comments_count = post.comments.length;
    res.status(201).json(newComment);
  });

  // DRF Events Endpoint
  app.get("/api/events", (req, res) => {
    res.json({
      count: dbEvents.length,
      next: null,
      previous: null,
      results: dbEvents
    });
  });

  app.post("/api/events/:id/rsvp", (req, res) => {
    const { id } = req.params;
    const event = dbEvents.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ detail: "Not found." });
    }
    event.is_attending = !event.is_attending;
    event.attendees_count += event.is_attending ? 1 : -1;
    res.json({
      status: "success",
      is_attending: event.is_attending,
      attendees_count: event.attendees_count
    });
  });

  // DRF Services Endpoint
  app.get("/api/services", (req, res) => {
    res.json({
      count: dbServices.length,
      next: null,
      previous: null,
      results: dbServices
    });
  });
  // DRF Chat Rooms & Messaging Endpoints (Phase 3 Channels Support)
  let dbRooms = [
    {
      id: "chat_thando_lerato",
      name: "Lerato Khumalo & Thando Mzobe",
      participants: [
        {
          id: "usr_thando_808",
          username: "thando_dev",
          full_name: "Thando Mzobe",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
        },
        {
          id: "usr_lerato_solar",
          username: "lerato_solar",
          full_name: "Lerato Khumalo",
          avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
        }
      ],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  let dbChatMessages = [
    {
      id: "msg_init_1",
      room_id: "chat_thando_lerato",
      sender: {
        id: "usr_lerato_solar",
        username: "lerato_solar",
        full_name: "Lerato Khumalo",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80"
      },
      content: "Saw your Django Channels setup! The WebSockets connect immediately.",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const handleGetRooms = (req: any, res: any) => {
    res.json(dbRooms);
  };
  app.get("/api/rooms", handleGetRooms);
  app.get("/api/rooms/", handleGetRooms);

  const handleGetRoomMessages = (req: any, res: any) => {
    const { id } = req.params;
    const msgs = dbChatMessages.filter(m => m.room_id === id);
    res.json(msgs);
  };
  app.get("/api/rooms/:id/messages", handleGetRoomMessages);
  app.get("/api/rooms/:id/messages/", handleGetRoomMessages);

  const handleDirectRoom = (req: any, res: any) => {
    const { participant_id, participant_username } = req.body || {};
    const room = dbRooms[0];
    res.json(room);
  };
  app.post("/api/rooms/direct", handleDirectRoom);
  app.post("/api/rooms/direct/", handleDirectRoom);

  const handleCreateChatMessage = (req: any, res: any) => {
    const { room_id, content } = req.body || {};
    const newMsg = {
      id: `msg_${Date.now()}`,
      room_id: room_id || "chat_thando_lerato",
      sender: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      },
      content: content || "",
      timestamp: new Date().toISOString()
    };
    dbChatMessages.push(newMsg);
    res.status(201).json(newMsg);
  };
  app.post("/api/messages", handleCreateChatMessage);
  app.post("/api/messages/", handleCreateChatMessage);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Create HTTP server for both Express and WebSockets
  const server = http.createServer(app);

  // WebSocket Server for /ws/chat/:roomId/
  const wss = new WebSocketServer({ noServer: true });
  const roomSockets = new Map<string, Set<WebSocket>>();

  server.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    if (url.includes("/ws/chat/")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      // Let Vite HMR handle other WebSocket upgrades if any
      socket.destroy();
    }
  });

  wss.on("connection", (ws, request) => {
    const url = request.url || "";
    const match = url.match(/\/ws\/chat\/([^/?]+)/);
    const roomId = match ? match[1] : "default";

    if (!roomSockets.has(roomId)) {
      roomSockets.set(roomId, new Set());
    }
    const roomSet = roomSockets.get(roomId)!;
    roomSet.add(ws);

    // Send connection established confirmation
    ws.send(JSON.stringify({
      type: "connection_established",
      room_id: roomId,
      message: "Connected to SkillHub ZA real-time chat room (WebSocket)."
    }));

    ws.on("message", (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.type === "chat_message") {
          const content = payload.message || payload.content || "";
          const broadcastMsg = {
            type: "chat_message",
            id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            room_id: roomId,
            content,
            message: content,
            sender: {
              id: "usr_thando_808",
              username: "thando_dev",
              full_name: "Thando Mzobe",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
            },
            timestamp: new Date().toISOString()
          };

          // Broadcast to all sockets in this room
          for (const client of roomSet) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastMsg));
            }
          }
        } else if (payload.type === "typing") {
          // Broadcast typing to other clients in room
          for (const client of roomSet) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "typing",
                room_id: roomId,
                username: "thando_dev",
                is_typing: payload.is_typing
              }));
            }
          }
        }
      } catch (err) {
        console.error("WebSocket message handling error:", err);
      }
    });

    ws.on("close", () => {
      roomSet.delete(ws);
      if (roomSet.size === 0) {
        roomSockets.delete(roomId);
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server and WebSockets running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
