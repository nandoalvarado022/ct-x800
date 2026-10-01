import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { expertSystemPrompt } from "@/lib/expert";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_HITS = 20;
const hits = new Map<string, { count: number; reset: number }>();

type ChatTurn = {
  role: "user" | "model";
  parts: [{ text: string }];
};

function tooMany(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const slot = hits.get(ip);
  if (!slot || now > slot.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  slot.count += 1;
  return slot.count > MAX_HITS;
}

function toHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: ChatTurn[] = [];

  for (const entry of value.slice(-8)) {
    if (typeof entry !== "object" || entry === null) continue;
    const role = "role" in entry ? entry.role : undefined;
    const text = "text" in entry ? entry.text : undefined;
    if ((role !== "user" && role !== "expert") || typeof text !== "string") continue;
    const clean = text.trim().slice(0, 2000);
    if (!clean) continue;
    turns.push({
      role: role === "expert" ? "model" : "user",
      parts: [{ text: clean }],
    });
  }

  while (turns[0]?.role === "model") turns.shift();
  return turns;
}

export async function POST(request: Request) {
  if (tooMany(request)) {
    return NextResponse.json(
      { error: "Demasiadas preguntas seguidas. Espera un momento." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const message = "message" in payload ? payload.message : undefined;
  const history = "history" in payload ? payload.history : undefined;

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Escribe una pregunta." }, { status: 400 });
  }

  if (message.trim().length > 2000) {
    return NextResponse.json({ error: "La pregunta es demasiado larga." }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "El experto no está configurado. Añade AI_API_KEY y AI_MODEL en .env.local y reinicia el servidor.",
      },
      { status: 503 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: expertSystemPrompt,
    });
    const turns = toHistory(history);
    const chat = model.startChat(turns.length > 0 ? { history: turns } : {});
    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text().trim();

    if (!reply) {
      return NextResponse.json({ error: "El modelo no devolvió texto." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("chat", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "No se pudo consultar el modelo. Revisa AI_API_KEY y AI_MODEL." },
      { status: 502 },
    );
  }
}
