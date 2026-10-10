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
        id: "usr_elena",
        username: "elena_design",
        first_name: "Elena",
        last_name: "Rostova",
        full_name: "Elena Rostova",
        bio: "Top Rated Lead Brand & UI/UX Designer in Berlin, Germany.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        location: "Berlin, Germany",
        province: "Berlin",
        skills: ["Brand Identity", "Figma", "Logo Design", "Design Systems"],
        is_creator: true,
        role: "mentor",
        seta_verified: true,
        verified: true,
        badge: "Top Rated Pro"
      },
      content: "Just finished a brand identity package for a fintech startup in London. Loved working on this modern logo! 🎨 #Branding #Figma #DesignSystems",
      media_type: "image",
      media_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80",
      video_url: null,
      category: "Design & Creative",
      hashtags: ["Branding", "Figma", "DesignSystems", "Fintech"],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes_count: 84,
      comments_count: 12,
      is_liked: false,
      comments: [
        {
          id: "cmt_1",
          author: { username: "david_cloud", full_name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
          content: "The typography choice is immaculate! Clean and modern.",
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
    const { 
      username, 
      email, 
      full_name, 
      first_name: reqFirstName,
      last_name: reqLastName,
      role = "youth", 
      password, 
      confirm_password,
      password2: reqPassword2,
      date_of_birth
    } = req.body || {};

    const confirmationPassword = confirm_password || reqPassword2;

    if (!username || !email || !password) {
      return res.status(400).json({ detail: "Please provide username, email, and password." });
    }
    if (password && confirmationPassword && password !== confirmationPassword) {
      return res.status(400).json({ confirm_password: ["Passwords do not match."] });
    }

    const userId = `usr_${username.toLowerCase().replace(/\s+/g, '_')}`;
    let firstName = reqFirstName;
    let lastName = reqLastName;
    if (!firstName && !lastName) {
      const nameParts = (full_name || username).trim().split(' ');
      firstName = nameParts[0] || username;
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const registeredUser = {
      id: userId,
      username: username.trim(),
      email: email.trim(),
      first_name: firstName,
      last_name: lastName,
      full_name: full_name?.trim() || `${firstName} ${lastName}`.trim() || username.trim(),
      date_of_birth: date_of_birth || null,
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

  // DRF Users Endpoint with django-filter simulation
  const handleGetUsers = (req: any, res: any) => {
    const { 
      search, 
      category, 
      location, 
      is_creator, 
      rating__gte, 
      rating, 
      hourly_rate__gte, 
      hourly_rate__lte 
    } = req.query || {};

    let users = [
      {
        id: "usr_thando_808",
        username: "thando_dev",
        first_name: "Thando",
        last_name: "Mzobe",
        full_name: "Thando Mzobe",
        bio: "Full-stack software developer & cloud systems engineer.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Johannesburg, South Africa",
        country: "South Africa",
        province: "Gauteng",
        skills: ["React", "TypeScript", "Node.js", "Python", "Django", "PostgreSQL"],
        is_creator: true,
        role: "youth",
        seta_verified: true,
        verified: true,
        rating: 4.95,
        hourly_rate: 65.0,
        badge: "Top Rated Professional"
      },
      {
        id: "usr_sarah",
        username: "sarah_chen",
        first_name: "Sarah",
        last_name: "Chen",
        full_name: "Sarah Chen",
        bio: "Lead FullStack Engineer specializing in high-concurrency cloud systems.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        location: "London, UK",
        country: "United Kingdom",
        province: "Greater London",
        skills: ["React", "TypeScript", "Node.js", "GraphQL", "Docker"],
        is_creator: true,
        role: "mentor",
        seta_verified: true,
        verified: true,
        rating: 4.98,
        hourly_rate: 75.0,
        badge: "Top Rated Pro"
      },
      {
        id: "usr_elena",
        username: "elena_design",
        first_name: "Elena",
        last_name: "Rostova",
        full_name: "Elena Rostova",
        bio: "Senior Brand & UI/UX Designer in Berlin, Germany.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        location: "Berlin, Germany",
        country: "Germany",
        province: "Berlin",
        skills: ["Brand Identity", "Figma", "UI/UX", "Design Systems"],
        is_creator: true,
        role: "mentor",
        seta_verified: true,
        verified: true,
        rating: 4.97,
        hourly_rate: 70.0,
        badge: "Top Rated Pro"
      },
      {
        id: "usr_michael",
        username: "michael_botha",
        first_name: "Michael",
        last_name: "Botha",
        full_name: "Michael Botha",
        bio: "Smart Home & Commercial Solar PV Specialist.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        location: "Toronto, Canada",
        country: "Canada",
        province: "Ontario",
        skills: ["Solar PV", "Smart Home", "Energy Storage", "Electrical"],
        is_creator: true,
        role: "mentor",
        seta_verified: true,
        verified: true,
        rating: 4.95,
        hourly_rate: 85.0,
        badge: "Artisan Pro"
      },
      {
        id: "usr_amara",
        username: "amara_ai",
        first_name: "Amara",
        last_name: "Okafor",
        full_name: "Amara Okafor",
        bio: "AI Engineer & PyTorch/LLM fine-tuning specialist.",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
        location: "Lagos, Nigeria",
        country: "Nigeria",
        province: "Lagos",
        skills: ["AI & Data Science", "Python", "PyTorch", "LLM", "NLP"],
        is_creator: true,
        role: "youth",
        seta_verified: true,
        verified: true,
        rating: 4.89,
        hourly_rate: 60.0,
        badge: "AI Specialist"
      }
    ];

    if (search) {
      const q = String(search).toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (category) {
      const cat = String(category).toLowerCase();
      users = users.filter(u => 
        u.skills.some(s => s.toLowerCase().includes(cat)) ||
        u.bio.toLowerCase().includes(cat)
      );
    }

    if (location) {
      const loc = String(location).toLowerCase();
      users = users.filter(u => 
        u.location.toLowerCase().includes(loc) ||
        u.country.toLowerCase().includes(loc)
      );
    }

    if (is_creator !== undefined) {
      const isC = String(is_creator).toLowerCase() === 'true';
      users = users.filter(u => u.is_creator === isC);
    }

    const minR = parseFloat(rating__gte || rating);
    if (!isNaN(minR)) {
      users = users.filter(u => u.rating >= minR);
    }

    const minP = parseFloat(hourly_rate__gte);
    if (!isNaN(minP)) {
      users = users.filter(u => u.hourly_rate >= minP);
    }

    const maxP = parseFloat(hourly_rate__lte);
    if (!isNaN(maxP)) {
      users = users.filter(u => u.hourly_rate <= maxP);
    }

    res.json({
      count: users.length,
      next: null,
      previous: null,
      results: users
    });
  };

  app.get("/api/users", handleGetUsers);
  app.get("/api/users/", handleGetUsers);

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

  // DRF Privacy-First Map Pins Endpoint
  app.get(["/api/map/pins", "/api/map/pins/"], (req, res) => {
    const defaultPublicPins = [
      {
        id: "usr_pin_1",
        username: "thando_dev",
        business_name: "Thando Cloud & Solar Tech",
        business_latitude: -26.2041,
        business_longitude: 28.0473,
        category: "Solar & Inverter Tech",
        rating: 4.95,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        show_on_map: true
      },
      {
        id: "usr_pin_2",
        username: "khaya_plumb",
        business_name: "Soweto Artisan Workshop",
        business_latitude: -26.2678,
        business_longitude: 27.8585,
        category: "Plumbing & Piping",
        rating: 4.88,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        show_on_map: true
      },
      {
        id: "usr_pin_3",
        username: "elena_design",
        business_name: "Creative Hub Studio",
        business_latitude: -26.1458,
        business_longitude: 28.0444,
        category: "Brand & UI/UX Design",
        rating: 4.98,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        show_on_map: true
      }
    ];

    res.json({
      count: defaultPublicPins.length,
      next: null,
      previous: null,
      results: defaultPublicPins
    });
  });

  // DRF Reviews Endpoint
  let dbReviews = [
    {
      id: "rev_1",
      reviewer: { id: "usr_elena", username: "elena_design", full_name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
      reviewee: "usr_thando_808",
      rating: 5.0,
      comment: "Thando was fantastic! Delivered the project ahead of schedule and communicated perfectly.",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: "rev_2",
      reviewer: { id: "usr_sarah", username: "sarah_chen", full_name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" },
      reviewee: "usr_thando_808",
      rating: 5.0,
      comment: "Exceptional engineer. We hired Thando to build a real-time event streaming pipeline and REST API.",
      created_at: new Date(Date.now() - 86400000 * 14).toISOString()
    }
  ];

  app.get("/api/reviews", (req, res) => {
    res.json({ count: dbReviews.length, results: dbReviews });
  });
  app.get("/api/reviews/", (req, res) => {
    res.json({ count: dbReviews.length, results: dbReviews });
  });

  app.post("/api/reviews", (req, res) => {
    const { reviewee, rating, comment } = req.body || {};
    const newRev = {
      id: `rev_${Date.now()}`,
      reviewer: { id: "usr_client", username: "client_user", full_name: "Verified Client", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
      reviewee: reviewee || "usr_thando_808",
      rating: parseFloat(rating) || 5.0,
      comment: comment || "",
      created_at: new Date().toISOString()
    };
    dbReviews.unshift(newRev);
    res.status(201).json(newRev);
  });
  app.post("/api/reviews/", (req, res) => {
    const { reviewee, rating, comment } = req.body || {};
    const newRev = {
      id: `rev_${Date.now()}`,
      reviewer: { id: "usr_client", username: "client_user", full_name: "Verified Client", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
      reviewee: reviewee || "usr_thando_808",
      rating: parseFloat(rating) || 5.0,
      comment: comment || "",
      created_at: new Date().toISOString()
    };
    dbReviews.unshift(newRev);
    res.status(201).json(newRev);
  });

  // DRF Portfolio Endpoint
  let dbPortfolio = [
    {
      id: "port_1",
      user: "usr_thando_808",
      title: "Fintech Analytics Platform",
      description: "A global multi-currency payment analytics dashboard with high-frequency charting, automated reconciliation, and dark-mode UI.",
      media_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    }
  ];

  app.get("/api/portfolio", (req, res) => {
    res.json({ count: dbPortfolio.length, results: dbPortfolio });
  });
  app.get("/api/portfolio/", (req, res) => {
    res.json({ count: dbPortfolio.length, results: dbPortfolio });
  });

  app.post("/api/portfolio", (req, res) => {
    const { title, description, media_url } = req.body || {};
    const newItem = {
      id: `port_${Date.now()}`,
      user: "usr_thando_808",
      title: title || "New Project",
      description: description || "",
      media_url: media_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString()
    };
    dbPortfolio.unshift(newItem);
    res.status(201).json(newItem);
  });
  app.post("/api/portfolio/", (req, res) => {
    const { title, description, media_url } = req.body || {};
    const newItem = {
      id: `port_${Date.now()}`,
      user: "usr_thando_808",
      title: title || "New Project",
      description: description || "",
      media_url: media_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString()
    };
    dbPortfolio.unshift(newItem);
    res.status(201).json(newItem);
  });

  // DRF External Course Discovery Endpoints
  let dbExternalCourses = [
    {
      id: "ext_crs_1",
      title: "Meta Front-End Developer Professional Certificate",
      provider_name: "Coursera",
      provider_logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
      external_url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      description: "Launch your career as a front-end developer. Build job-ready skills in React, JavaScript, HTML/CSS, UI/UX design, and Git version control from Meta engineers.",
      category: "Coding",
      skill_tags: ["React", "JavaScript", "HTML/CSS", "Git", "UI/UX"],
      course_type: "certification",
      price_type: "paid",
      price_amount: 49.0,
      duration: "1-3 months",
      level: "beginner",
      language: "English",
      region: "Global",
      rating: 4.8,
      reviews_count: 14820,
      enrolled_count: 184500,
      is_approved: true,
      is_flagged: false,
      banner_image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-01-15T10:00:00Z"
    },
    {
      id: "ext_crs_2",
      title: "CS50's Introduction to Computer Science",
      provider_name: "edX",
      provider_logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80",
      external_url: "https://www.edx.org/cs50",
      description: "An introduction to the intellectual enterprises of computer science and the art of programming. Covers algorithms, data structures, and web development.",
      category: "Coding",
      skill_tags: ["C", "Python", "SQL", "Algorithms", "Computer Science"],
      course_type: "course",
      price_type: "free",
      price_amount: 0,
      duration: "3+ months",
      level: "beginner",
      language: "English",
      region: "Global",
      rating: 4.95,
      reviews_count: 32400,
      enrolled_count: 4200000,
      is_approved: true,
      is_flagged: false,
      banner_image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-01-18T14:30:00Z"
    },
    {
      id: "ext_netacad_1",
      title: "Cisco NetAcad: Cybersecurity Awareness Month & Defense Pathways",
      provider_name: "Cisco Networking Academy",
      provider_logo_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80",
      external_url: "http://nsmail.netacad.com/MDU5LVZGWi04MzQAAAGksP17m3azQKzNq4QmCg_irH9xXRrHCI04r_gcL_bTWsLM6UIHlCkWbtTXCfpQswbcZ5-YHfg=",
      description: "Special Cybersecurity Awareness Month official track by Cisco. Learn how to defend against modern digital threats, social engineering, ransomware, and vulnerabilities.",
      category: "Cybersecurity",
      skill_tags: ["Cybersecurity", "Threat Defense", "Network Security", "Ethical Hacking", "Cisco"],
      course_type: "certification",
      price_type: "free",
      price_amount: 0,
      duration: "4-6 weeks",
      level: "beginner",
      language: "English",
      region: "Global",
      rating: 4.93,
      reviews_count: 42100,
      enrolled_count: 850000,
      banner_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      is_approved: true,
      is_flagged: false,
      created_at: "2026-03-22T08:00:00Z"
    },
    {
      id: "ext_netacad_2",
      title: "Cisco NetAcad: Networking Catalog & CCNA Certification Track",
      provider_name: "Cisco Networking Academy",
      provider_logo_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=120&auto=format&fit=crop&q=80",
      external_url: "https://www.netacad.com/catalogs/learn/networking?utm_medium=email&utm_source=marketo&utm_campaign=en_brand&utm_content=GLBL-Annc-FY27-CybersecurityAwarenessMonth&utm_team=demand_gen",
      description: "Industry-standard foundational and associate networking curriculum. Master routing, switching, wireless essentials, IP addressing, and enterprise network architecture.",
      category: "Coding",
      skill_tags: ["Networking", "CCNA", "Routing & Switching", "TCP/IP", "Subnetting", "Cisco IOS"],
      course_type: "certification",
      price_type: "free",
      price_amount: 0,
      duration: "1-3 months",
      level: "intermediate",
      language: "English",
      region: "Global",
      rating: 4.96,
      reviews_count: 89000,
      enrolled_count: 2100000,
      banner_image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
      is_approved: true,
      is_flagged: false,
      created_at: "2026-03-22T08:30:00Z"
    }
  ];

  let dbSavedCourses: { [userId: string]: string[] } = {
    "usr_thando_808": ["ext_crs_1", "ext_crs_2"]
  };

  const handleGetCourses = (req: any, res: any) => {
    const { category, search, course_type, price_type } = req.query || {};
    let results = dbExternalCourses.filter(c => c.is_approved);

    if (category && category !== "all") {
      results = results.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
    }
    if (course_type && course_type !== "all") {
      results = results.filter(c => c.course_type.toLowerCase() === String(course_type).toLowerCase());
    }
    if (price_type && price_type !== "all") {
      results = results.filter(c => c.price_type.toLowerCase() === String(price_type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.provider_name.toLowerCase().includes(q) ||
        c.skill_tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({ count: results.length, results });
  };

  app.get("/api/courses", handleGetCourses);
  app.get("/api/courses/", handleGetCourses);
  app.get("/api/external-courses", handleGetCourses);
  app.get("/api/external-courses/", handleGetCourses);

  app.post("/api/courses", (req: any, res: any) => {
    const newCourse = {
      id: `ext_crs_${Date.now()}`,
      ...req.body,
      is_approved: false, // Moderated by admin
      is_flagged: false,
      rating: 5.0,
      reviews_count: 1,
      enrolled_count: 1,
      created_at: new Date().toISOString()
    };
    dbExternalCourses.unshift(newCourse);
    res.status(201).json(newCourse);
  });
  app.post("/api/courses/", (req: any, res: any) => {
    const newCourse = {
      id: `ext_crs_${Date.now()}`,
      ...req.body,
      is_approved: false,
      is_flagged: false,
      rating: 5.0,
      reviews_count: 1,
      enrolled_count: 1,
      created_at: new Date().toISOString()
    };
    dbExternalCourses.unshift(newCourse);
    res.status(201).json(newCourse);
  });

  app.post("/api/courses/:id/save", (req: any, res: any) => {
    const courseId = req.params.id;
    const userId = "usr_thando_808";
    if (!dbSavedCourses[userId]) dbSavedCourses[userId] = [];
    const list = dbSavedCourses[userId];
    const exists = list.includes(courseId);
    if (exists) {
      dbSavedCourses[userId] = list.filter(id => id !== courseId);
      res.json({ status: "unsaved", is_saved: false });
    } else {
      list.push(courseId);
      res.status(201).json({ status: "saved", is_saved: true });
    }
  });

  app.post("/api/courses/:id/report", (req: any, res: any) => {
    const course = dbExternalCourses.find(c => c.id === req.params.id);
    if (course) {
      course.is_flagged = true;
    }
    res.json({ status: "flagged", message: "Report received for moderator inspection" });
  });

  // DRF Reels Endpoints (Portfolio & Skills Showcase)
  let dbReels = [
    {
      id: "reel_1",
      author: {
        id: "usr_sarah",
        username: "sarah_chen",
        full_name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        location: "London, UK 🇬🇧",
        rating: 4.98,
        verified: true,
        hourly_rate: 75.0,
        badges: ["Verified Pro", "Top Rated"]
      },
      caption: "Just deployed a full-stack e-commerce app for a UK client. Check out the dashboard! 🚀 #React #WebDev #TypeScript",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4",
      audio_track: "Ambient Tech - Sarah Studio",
      category: "web_dev",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      is_portfolio_piece: true,
      views_count: 2450,
      likes_count: 428,
      comments_count: 38,
      shares_count: 54,
      is_liked: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "reel_2",
      author: {
        id: "usr_elena",
        username: "elena_design",
        full_name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        location: "Berlin, Germany 🇩🇪",
        rating: 4.97,
        verified: true,
        hourly_rate: 70.0,
        badges: ["Verified Pro", "Top Rated"]
      },
      caption: "Brand identity & dark-mode design system deliverable for a London FinTech startup. Figma tokens in action! 🎨 #Branding #Figma #UIUX",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-graphic-designer-working-on-a-digital-tablet-41586-large.mp4",
      audio_track: "Minimalist Beats - Elena Design",
      category: "design",
      skills: ["Figma", "UI/UX Design", "Design Systems", "Branding"],
      is_portfolio_piece: true,
      views_count: 3820,
      likes_count: 615,
      comments_count: 49,
      shares_count: 88,
      is_liked: false,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: "reel_3",
      author: {
        id: "usr_michael",
        username: "michael_botha",
        full_name: "Michael Botha",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        location: "Toronto, Canada 🇨🇦",
        rating: 4.95,
        verified: true,
        hourly_rate: 85.0,
        badges: ["Verified Pro", "Top Rated"]
      },
      caption: "Commissioning an 85kW commercial solar rooftop array with smart inverters and live telemetry. ☀️🔋 #SolarPV #CleanEnergy #Electrical",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-carpenter-measuring-wood-41584-large.mp4",
      audio_track: "Trades & Innovations - Michael Botha",
      category: "trades",
      skills: ["Solar PV", "Smart Inverters", "Electrical", "CAD"],
      is_portfolio_piece: true,
      views_count: 1940,
      likes_count: 345,
      comments_count: 29,
      shares_count: 42,
      is_liked: false,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ];

  const handleGetReels = (req: any, res: any) => {
    let results = [...dbReels];
    const category = req.query.category;
    if (category && category !== 'for_you' && category !== 'trending') {
      const catNorm = String(category).toLowerCase().replace('-', '_');
      results = results.filter(r => r.category === catNorm);
    }
    res.json({
      count: results.length,
      next: null,
      previous: null,
      results
    });
  };

  app.get("/api/reels", handleGetReels);
  app.get("/api/reels/", handleGetReels);

  app.post("/api/reels", (req, res) => {
    const { caption, video_url, category, skills, is_portfolio_piece, audio_track } = req.body || {};
    if (!video_url) {
      return res.status(400).json({ video_url: ["This field is required."] });
    }
    const newReel = {
      id: `reel_${Date.now()}`,
      author: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Johannesburg, South Africa 🇿🇦",
        rating: 4.95,
        verified: true,
        hourly_rate: 65.0,
        badges: ["Verified Pro", "Top Rated"]
      },
      caption: caption || "",
      video_url,
      audio_track: audio_track || "Original Audio",
      category: category || "web_dev",
      skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(",").map(s => s.trim()) : []),
      is_portfolio_piece: is_portfolio_piece !== undefined ? Boolean(is_portfolio_piece) : true,
      views_count: 1,
      likes_count: 1,
      comments_count: 0,
      shares_count: 0,
      is_liked: true,
      created_at: new Date().toISOString()
    };
    dbReels.unshift(newReel);
    res.status(201).json(newReel);
  });
  app.post("/api/reels/", (req, res) => {
    const { caption, video_url, category, skills, is_portfolio_piece, audio_track } = req.body || {};
    if (!video_url) {
      return res.status(400).json({ video_url: ["This field is required."] });
    }
    const newReel = {
      id: `reel_${Date.now()}`,
      author: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Johannesburg, South Africa 🇿🇦",
        rating: 4.95,
        verified: true,
        hourly_rate: 65.0,
        badges: ["Verified Pro", "Top Rated"]
      },
      caption: caption || "",
      video_url,
      audio_track: audio_track || "Original Audio",
      category: category || "web_dev",
      skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(",").map(s => s.trim()) : []),
      is_portfolio_piece: is_portfolio_piece !== undefined ? Boolean(is_portfolio_piece) : true,
      views_count: 1,
      likes_count: 1,
      comments_count: 0,
      shares_count: 0,
      is_liked: true,
      created_at: new Date().toISOString()
    };
    dbReels.unshift(newReel);
    res.status(201).json(newReel);
  });

  app.delete("/api/reels/:id", (req, res) => {
    const { id } = req.params;
    const initialLen = dbReels.length;
    dbReels = dbReels.filter(r => r.id !== id);
    if (dbReels.length < initialLen) {
      return res.status(204).send();
    }
    return res.status(404).json({ detail: "Reel not found." });
  });

  // DRF Live Sessions & Masterclasses Endpoints
  let dbSessions = [
    {
      id: "session_live_1",
      title: "Solar Inverter Sizing & Load-Shedding Backup Blueprint",
      subtitle: "Live trade breakdown: sizing hybrid inverters, lithium battery bank calculations, and SANS CoC safety compliance.",
      description: "Join master solar technicians for an open workshop. We take real domestic and commercial blueprints, calculate peak surge vs continuous wattage, and discuss wiring safety standards.",
      category: "Trades",
      agenda: [
        "PV system sizing calculations & panel string voltage formulas",
        "Lithium LiFePO4 battery selection & C-rate discharge curves",
        "Load-shedding automated switchover and SANS wiring compliance",
        "Live Q&A: troubleshooting error codes on Deye & Sunsynk systems"
      ],
      host: {
        id: "usr_sbusiso_solar",
        username: "sbusiso_solar",
        full_name: "Sbusiso Dlamini",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        role: "Master Solar Technician & Installer",
        rating: 4.95,
        verified: true,
        is_top_rated: true
      },
      status: "live",
      speakers_count: 3,
      listeners_count: 64,
      duration: "60 mins",
      is_paid: false,
      price_amount: 0,
      price_currency: "$",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "session_live_2",
      title: "From Junior Dev to $4,000/mo Remote Contracts: The Global Playbook",
      subtitle: "Proven tactics on landing international software clients from Africa, structuring contracts, and timezone management.",
      description: "An exclusive, paid intimate session breaking down cold outreach that converts, GitHub portfolio auditing, and payment protection with escrow.",
      category: "Tech",
      agenda: [
        "Positioning your GitHub and LinkedIn for US & European recruiters",
        "The 3-tier freelance proposal that beats low-ball bids",
        "Tax compliance, foreign currency accounts, and international wire handling",
        "Direct resume and portfolio teardown for 4 live participants"
      ],
      host: {
        id: "usr_thandiwe_dr",
        username: "thandiwe_tech",
        full_name: "Dr. Thandiwe Khumalo",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        role: "Engineering Director & Tech Career Coach",
        rating: 4.98,
        verified: true,
        is_top_rated: true
      },
      status: "live",
      speakers_count: 2,
      listeners_count: 118,
      duration: "75 mins",
      is_paid: true,
      price_amount: 25,
      price_currency: "$",
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  app.get("/api/sessions", (req, res) => {
    const { status, category, search } = req.query;
    let list = [...dbSessions];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (category && category !== "All") {
      list = list.filter(s => s.category === category);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.host.full_name.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q))
      );
    }
    res.json(list);
  });
  app.get("/api/sessions/", (req, res) => {
    res.json(dbSessions);
  });

  app.post("/api/sessions", (req, res) => {
    const data = req.body || {};
    const newSession = {
      id: `session_${Date.now()}`,
      title: data.title || "Untitled Session",
      subtitle: data.subtitle || "",
      description: data.description || "",
      category: data.category || "Tech",
      agenda: data.agenda || ["Overview & Discussion"],
      host: {
        id: "usr_thando_808",
        username: "thando_dev",
        full_name: "Thando Mzobe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        role: "Full-Stack Engineer & Creator",
        rating: 5.0,
        verified: true,
        is_top_rated: true
      },
      status: data.status || "live",
      speakers_count: 1,
      listeners_count: data.status === "live" ? 1 : 0,
      duration: data.duration || "60 mins",
      is_paid: !!data.is_paid,
      price_amount: data.price_amount || 0,
      price_currency: "$",
      created_at: new Date().toISOString()
    };
    dbSessions.unshift(newSession);
    res.status(201).json(newSession);
  });
  app.post("/api/sessions/", (req, res) => {
    res.status(201).json(dbSessions[0]);
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
