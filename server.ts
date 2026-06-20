import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create app
const app = express();
const PORT = 3000;

app.use(express.json());

// API route logic
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Endpoint to simulate any Arabic instruction into a structured simulator layout
app.post("/api/gemini/simulation-guide", async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction || typeof instruction !== "string") {
       return res.status(400).json({ error: "الرجاء إدخال نص التوجيه البيداغوجي." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert Physical Education (PE) & Physical Therapy teacher and tactical sports advisor.
Your goal is to parse any Arabic user instruction/game description for a school playground (width 580, height 370) and map it into a real-time tactical layout.

Playground boundaries and landmarks:
- Total width = 580 (usable x: 25 to 555)
- Total height = 370 (usable y: 25 to 345)
- Center spot of the field is exactly at x=290, y=185
- Left Goal/Basket area is around x=45, y=185
- Right Goal/Basket area is around x=535, y=185

Instructions details:
- You must arrange 1 Teacher (id: "T") and exactly 16 students (ids: 1 to 16) on the field in a logical, visual way that demonstrates the user's intent.
- Students format should be id: 1 to 16.
- Arrange students to reflect the tactical sport (e.g. for football, handball, lines, custom grid, volleyball layout, chase groups, concentric circles, etc.).
- Categorize the overall dynamic movement of pupils into one of the following "movementPattern":
  - 'stationary' (for non-dynamic situations, standby, standing guard on defensive lines, listening to teacher, line-ups, standing اصطفاف)
  - 'circulate' (for circular/running warmup, circular exercises)
  - 'shuttle' (for relay race, back and forth sprint)
  - 'chase_ball' (for soccer, basketball, handball, or any team ball game where closest student runs in a loop towards the ball and passes it)
  - 'random_drift' (for free warmup, unstructured game, or general fun roaming)

Return a structured JSON output with appropriate coordinates for all units, optional equipment props (balls, cones, plates), and an encouraging, highly descriptive coaching explanation in Arabic!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Instruction to simulate: "${instruction}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            notifyMessage: {
              type: Type.STRING,
              description: "A friendly and professional Arabic message explaining the sport/game set-up and guiding the teacher/students, e.g. 'تم تطبيق الوضعية البيداغوجية للعبة...'"
            },
            parsedMode: {
              type: Type.STRING,
              description: "The primary animation movement mode: 'walk' | 'run' | 'sit' | 'stand'"
            },
            movementPattern: {
              type: Type.STRING,
              description: "Classified movement pattern: 'stationary' (keep positional form) | 'circulate' (run in circle/orbit) | 'shuttle' (run back and forth) | 'chase_ball' (actively chase after ball and claim/pass it) | 'random_drift' (warmup or random drift around positions)"
            },
            teacher: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER, description: "Teacher x position (25 to 555)" },
                y: { type: Type.INTEGER, description: "Teacher y position (25 to 345)" },
                state: { type: Type.STRING, description: "'walk' | 'run' | 'sit' | 'stand'" }
              },
              required: ["x", "y", "state"]
            },
            students: {
              type: Type.ARRAY,
              description: "Must contain exactly 16 objects, representing students 1 to 16.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER, description: "Student number from 1 to 16" },
                  x: { type: Type.INTEGER, description: "Dynamic coordinate x (25 to 555) logical for the game" },
                  y: { type: Type.INTEGER, description: "Dynamic coordinate y (25 to 345) logical for the game" },
                  state: { type: Type.STRING, description: "Student's initial movement state 'walk' | 'run' | 'sit' | 'stand'" }
                },
                required: ["id", "x", "y", "state"]
              }
            },
            equipments: {
              type: Type.ARRAY,
              description: "Optional equipment props like balls, cones, plates placed on field to match the game.",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'ball' | 'cone' | 'plate'" },
                  x: { type: Type.INTEGER, description: "Coordinate x (25 to 555)" },
                  y: { type: Type.INTEGER, description: "Coordinate y (25 to 345)" },
                  color: { type: Type.STRING, description: "Hex color code matching the prop, e.g. '#ea580c' for balls/cones" }
                },
                required: ["type", "x", "y", "color"]
              }
            }
          },
          required: ["notifyMessage", "parsedMode", "movementPattern", "teacher", "students", "equipments"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// Setup Vite or Serve Static Files
async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
