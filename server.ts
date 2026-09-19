import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
