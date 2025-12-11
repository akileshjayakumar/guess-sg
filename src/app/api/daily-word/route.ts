import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/lib/words";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const MODEL = "sonar";
const SEARCH_ENDPOINT = "https://api.perplexity.ai/search";
const MAX_GENERATION_ATTEMPTS = 5;
const SEARCH_TOP_K = 6;

interface DailyWordResponse {
  word: string;
  hint: string;
  emoji: string;
  category?: Category;
}

interface DailyWordRequest {
  category: Category;
  exclude?: string[];
}

const CATEGORY_DETAILS: Record<Category, { prompt: string; examples: string[]; queryTail: string }> = {
  food: {
    prompt: "Singapore food, hawker dishes, drinks, ingredients, or cooking terms. Include iconic dishes, snacks, desserts, and beverages that tourists and locals love.",
    examples: ["LAKSA", "SATAY", "ROJAK", "DURIAN", "OTAH", "NASI", "MILO", "KOPI", "ONDEH", "PRATA"],
    queryTail: "food dish hawker",
  },
  places: {
    prompt: "Places in Singapore - neighborhoods, landmarks, MRT stations, attractions, parks, islands, or iconic buildings.",
    examples: ["BUGIS", "BEDOK", "SENTOSA", "JEWEL", "MARINA", "TIONG", "ORCHARD", "SEMBAWANG", "PUNGGOL", "CHANGI"],
    queryTail: "landmark neighbourhood mrt",
  },
  singlish: {
    prompt: "Singlish words, Singapore slang, Malay/Hokkien/Cantonese/Tamil expressions commonly used in Singapore English.",
    examples: ["SHIOK", "KIASU", "CHOPE", "LEPAK", "PAISEH", "JIALAT", "SIAO", "ALAMAK", "SEDAP", "STEADY"],
    queryTail: "singlish slang expression",
  },
  all: {
    prompt: "Anything uniquely Singaporean - food, places, Singlish, traditions, festivals, or cultural references.",
    examples: ["MERLION", "KAMPONG", "KOPITIAM", "HDB", "VOIDDECK", "MRT", "ORCHARD", "DURIAN", "LIONCITY", "HAWKER"],
    queryTail: "singapore culture heritage",
  },
};

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  food: ["singapore", "food", "dish", "hawker", "cuisine", "eat"],
  places: ["singapore", "landmark", "district", "neighborhood", "neighbourhood", "mrt", "park", "island"],
  singlish: ["singapore", "singlish", "slang", "colloquial", "phrase", "expression"],
  all: ["singapore", "culture", "heritage", "tradition"],
};

export async function POST(request: NextRequest) {
  if (!PERPLEXITY_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { category, exclude = [] } = (await request.json()) as DailyWordRequest;

    if (!category || !CATEGORY_DETAILS[category]) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const excludeSet = new Set(
      (Array.isArray(exclude) ? exclude : [])
        .filter((word): word is string => typeof word === "string")
        .map(word => word.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 50),
    );

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const candidate = await generateCandidate(category, excludeSet);
      if (!candidate) {
        continue;
      }

      if (excludeSet.has(candidate.word)) {
        console.warn(`[daily-word] Candidate "${candidate.word}" was in the exclude list; retrying.`);
        continue;
      }

      const factChecked = await verifyCandidate(candidate.word, category);
      if (!factChecked) {
        console.warn(`[daily-word] Candidate "${candidate.word}" failed fact-checking.`);
        excludeSet.add(candidate.word);
        continue;
      }

      return NextResponse.json({ ...candidate, category });
    }

    return NextResponse.json(
      { error: "Unable to find a verified word right now. Please try again." },
      { status: 503 },
    );
  } catch (error) {
    console.error("Daily word route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateCandidate(category: Category, excludeSet: Set<string>): Promise<DailyWordResponse | null> {
  const details = CATEGORY_DETAILS[category];
  const randomSeed = Math.random().toString(36).slice(2, 10);
  const blockListPreview = Array.from(excludeSet).slice(0, 20);
  const blockListText = blockListPreview.length
    ? `Avoid these disallowed words: ${blockListPreview.join(", ")}.`
    : "";

  const systemPrompt = `You are a fun Singapore culture expert creating a Wordle-style guessing game. Be creative and pick interesting words!

RULES:
1. Word length must be 3-10 letters.
2. The word must relate to: ${details.prompt}
3. Pick words that are fun to guess - well-known to Singaporeans and tourists.
4. Use ONLY LETTERS (A-Z). No spaces, hyphens, apostrophes, or numbers.
5. For multi-word concepts, pick a single key word (e.g., "KAYA", not "KAYA TOAST").
6. Choose real words people in Singapore actually use.
${blockListText}

Example inspiration: ${details.examples.join(", ")}

Respond ONLY in JSON: {"word": "WORD", "hint": "fun clue (max 12 words)", "emoji": "relevant emoji"}`;

  const userPrompt = `Generate a unique Singapore ${category === "all" ? "culture" : category} word for a guessing game. Random seed: ${randomSeed}.
Keep it fresh, recognizable, and exciting. Surprise me!
${blockListText}`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 1.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Perplexity chat API error:", error);
    return null;
  }

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content || "";
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.warn("Unable to parse AI response:", aiResponse);
    return null;
  }

  const parsed: DailyWordResponse = JSON.parse(jsonMatch[0]);
  const cleaned = parsed.word?.trim() || "";

  if (!/^[A-Za-z]{3,10}$/.test(cleaned)) {
    console.warn("Rejected candidate with invalid word format:", parsed.word);
    return null;
  }

  const normalizedWord = cleaned.toUpperCase();
  return {
    word: normalizedWord,
    hint: parsed.hint?.trim() || "Guess the word!",
    emoji: parsed.emoji || "🦁",
  };
}

async function verifyCandidate(word: string, category: Category): Promise<boolean> {
  try {
    const response = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: buildSearchQuery(word, category),
        top_k: SEARCH_TOP_K,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Perplexity Search API error:", error);
      return false;
    }

    const payload = await response.json();
    const results = extractSearchResults(payload);
    if (!results.length) {
      return false;
    }

    const normalizedWord = word.toLowerCase();
    const keywords = CATEGORY_KEYWORDS[category] || [];

    return results.some(result => {
      const text = [result.title, result.snippet, result.content, result.text]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!text || !text.includes(normalizedWord)) {
        return false;
      }

      return keywords.some(keyword => text.includes(keyword));
    });
  } catch (error) {
    console.error("Search verification failed:", error);
    return false;
  }
}

function buildSearchQuery(word: string, category: Category): string {
  const tail = CATEGORY_DETAILS[category]?.queryTail ?? "singapore";
  return `${word} singapore ${tail}`.trim();
}

function extractSearchResults(payload: any): Array<{ title?: string; snippet?: string; content?: string; text?: string }> {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.top_results)) return payload.top_results;
  return [];
}