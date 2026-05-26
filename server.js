import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Manual dotenv parser for maximum environment robustness
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const index = trimmed.indexOf("=");
        if (index > -1) {
          const key = trimmed.substring(0, index).trim();
          const value = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, "");
          if (key) {
            process.env[key] = value;
          }
        }
      }
    }
  }
} catch (err) {
  console.error("Error loading .env file manually:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini lazily
  let aiClient = null;
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  };

  // Initialize Resend lazily
  let resend = null;
  const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is missing. Using MOCK email delivery for local testing.");
      return {
        emails: {
          send: async (payload) => {
            console.log("[MOCK Resend] Sending email:", payload);
            return { data: { id: "mock_" + Math.random().toString(36).substr(2, 9) }, error: null };
          }
        }
      };
    }
    if (!resend) {
      resend = new Resend(apiKey);
    }
    return resend;
  };

  // Gemini API Route for generating invitations
  app.post("/api/gemini/invitation", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${prompt}. Provide 3 distinct options (Formal, Modern, and Poetic). Format the output as a JSON object with a key 'options' that is an array of strings.`,
        config: {
          systemInstruction: "You are a professional wedding invitation copywriter. Create elegant, warm, and inviting text for wedding cards. Use beautiful quotations where appropriate.",
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json({ options: JSON.parse(jsonMatch[0]).options });
      }
      return res.json({ options: [text] });
    } catch (error) {
      console.error("Error generating invitation content:", error);
      res.status(500).json({ error: error.message || "Failed to generate invitation content" });
    }
  });

  // Gemini API Route for generating itinerary
  app.post("/api/gemini/itinerary", async (req, res) => {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: "Config is required" });
    }
    try {
      const ai = getAI();
      const prompt = `Create a detailed 3-day wedding itinerary for a ${config.style} wedding. 
      Guest Count: ${config.guestCount}. Budget Range: ${config.budgetRange}. 
      Include ceremonies, timings, and special touches. Use Markdown for formatting.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: error.message || "Failed to generate wedding itinerary" });
    }
  });

  // Gemini API Route for AI Chat with Planner
  app.post("/api/gemini/chat", async (req, res) => {
    const { userInput, history } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: "User input is required" });
    }
    try {
      const ai = getAI();
      const contents = [
        ...(history || []).map(h => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        {
          role: "user",
          parts: [{ text: userInput }]
        }
      ];
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are Gathbandhan AI, a luxury wedding planner expert. Provide helpful, creative, and professional advice. At the end of your response, always provide 3 short relevant suggestions for the user to ask next, prefixed with 'Try asking:'."
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Error in AI planner chat:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Gemini API Route for Astrological analysis
  app.post("/api/gemini/astro", async (req, res) => {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: "Type and data are required" });
    }
    try {
      let prompt = "";
      if (type === "match") {
        prompt = `Perform a Gun Milap analysis for a match. 
        Groom: ${data.groomName}, born ${data.groomDob} at ${data.groomTime} in ${data.groomPlace}.
        Bride: ${data.brideName}, born ${data.brideDob} at ${data.brideTime} in ${data.bridePlace}.
        The calculated score is ${data.score}/36.
        
        Provide:
        1. A summary of their compatibility (stardust and karmic connection).
        2. Specific advice regarding any Doshas (like Manglik).
        3. A concluding blessing from the elders and the stars.
        
        Format the response as a JSON object with keys: "summary", "manglikAdvice", "blessing".`;
      } else if (type === "muhurut") {
        prompt = `Suggest why these dates are auspicious for a ${data.eventType} in ${data.month}.
        Date 1: 12th May 2026 (Pushya Nakshatra)
        Date 2: 18th May 2026 (Rohini Nakshatra)
        
        Provide:
        1. Detailed astral advice for these dates.
        2. Why Pushya is considered the king of Nakshatras.
        
        Format the response as a JSON object with keys: "advice", "wisdom".`;
      }

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an expert Vedic Astrologer (Jyotishi). 
          Your goal is to provide mystical, encouraging, and detailed astrological readings for wedding planning.
          Use terms like Gunas, Kundali, Dosha, Mars (Mangal), Jupiter (Guru), Venus (Shukra), and Nakshatras.
          Keep the tone professional, spiritual, and slightly poetic.`,
          responseMimeType: "application/json"
        }
      });
      const responseText = response.text;
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
      res.json({ summary: responseText, manglikAdvice: "Seek guidance from a local pundit.", blessing: "May the heavens bless you." });
    } catch (error) {
      console.error("Error in Astro tools analysis:", error);
      res.status(500).json({ error: error.message || "Failed astro analysis" });
    }
  });

  // API Route for sending invitations
  app.post("/api/send-invitation", async (req, res) => {
    const { guests, cardData, templateImage, inviteLink } = req.body;

    if (!guests || !Array.isArray(guests)) {
      return res.status(400).json({ error: "No guests provided" });
    }

    try {
      const resendClient = getResend();
      const results = [];

      for (const guest of guests) {
        // Personalize the link
        const personalizedLink = `${inviteLink}?g=${encodeURIComponent(guest.name)}`;
        
        // Skip if no email
        if (!guest.email || !guest.email.includes("@")) {
          results.push({ 
            email: guest.email || "No Email", 
            status: "failed", 
            error: "No valid email address provided." 
          });
          continue;
        }

        // Send email
        try {
          console.log(`[Resend] Sending to: ${guest.email}`);
          const resendResponse = await resendClient.emails.send({
            from: "Gathbandhan <onboarding@resend.dev>",
            to: guest.email,
            subject: `Wedding Invitation: ${cardData.groom} & ${cardData.bride}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fdf2f8;">
                <h2 style="color: #db2777; text-align: center; margin-bottom: 30px;">🕉️ Wedding Invitation</h2>
                <div style="text-align: center; margin: 30px 0; background-color: white; padding: 30px; border-radius: 20px;">
                  <p style="font-size: 16px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 2px;">Dearest ${guest.name},</p>
                  <h1 style="font-size: 36px; color: #111; margin: 15px 0;">${cardData.groom} & ${cardData.bride}</h1>
                  <p style="font-size: 16px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 2px;">request the honor of your presence</p>
                  <div style="margin-top: 25px; padding: 15px; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                    <p style="font-style: italic; color: #333; line-height: 1.6;">"${cardData.message}"</p>
                  </div>
                </div>
                
                <div style="margin: 20px 0; text-align: center;">
                  <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${cardData.date}</p>
                  <p style="margin: 10px 0;"><strong>📍 Venue:</strong> ${cardData.venue}</p>
                  <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${cardData.time}</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                  <a href="${personalizedLink}" style="background-color: #db2777; color: white; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">View My Personal Invite</a>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                   <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Sent via Gathbandhan - Celestial Wedding Planner</p>
                </div>
              </div>
            `,
          });

          const { data, error } = resendResponse;

          if (error) {
            let errorMessage = error.message;
            let isDomainLimit = false;

            // Check if it's a Resend validation/restriction error (common for unverified emails on free tier)
            if (
              error.name === 'validation_error' || 
              error.name === 'restricted_error' || 
              error.statusCode === 403 || 
              error.statusCode === 422
            ) {
              isDomainLimit = true;
              errorMessage = "DOMAIN_LIMITATION: Unverified Guest Email. Free Tier restricts recipients.";
            }

            results.push({ 
              email: guest.email, 
              status: "failed", 
              error: errorMessage,
              isDomainLimit
            });
          } else {
            results.push({ email: guest.email, status: "sent", id: data?.id });
          }
        } catch (emailErr) {
          console.error(`[Resend critical] Fatal for ${guest.email}:`, emailErr);
          results.push({ 
            email: guest.email, 
            status: "failed", 
            error: emailErr.message || "Unknown error during transmission" 
          });
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error("Backend Invitations Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to send invitations",
        setupNeeded: !process.env.RESEND_API_KEY 
      });
    }
  });

  // API Route for sending feedback emails
  app.post("/api/send-feedback", async (req, res) => {
    const { name, email, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const resendClient = getResend();
      const { data, error } = await resendClient.emails.send({
        from: "Gathbandhan <onboarding@resend.dev>",
        to: "manish847593@gmail.com", // Your designated email
        subject: `New App Feedback from ${name || 'Anonymous'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #db2777;">New Feedback Received</h2>
            <p><strong>Name:</strong> ${name || 'Not provided'}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 11px; color: #999; margin-top: 30px;">This is an automated notification from your Gathbandhan App.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Feedback Email Error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, id: data?.id });
    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
