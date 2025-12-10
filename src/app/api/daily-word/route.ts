import { NextRequest, NextResponse } from "next/server";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const MODEL = "sonar";

interface DailyWordResponse {
  word: string;
  hint: string;
  emoji: string;
}

export async function POST(request: NextRequest) {
  if (!PERPLEXITY_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { category } = await request.json();
    const randomSeed = Math.random().toString(36).substring(7);

    let categoryPrompt = "";
    let exampleWords = "";
    switch (category) {
      case "food":
        categoryPrompt = "Singapore food, hawker dishes, local cuisine, drinks, ingredients, or cooking terms. Include iconic dishes, snacks, desserts, and beverages that tourists and locals love";
        exampleWords = "LAKSA, SATAY, CHAR KWAY TEOW, ROTI PRATA, KAYA, MEE GORENG, ONDEH, BANDUNG, HOKKIEN, CHILLI CRAB, BAK KUT TEH";
        break;
      case "places":
        categoryPrompt = "places in Singapore - neighborhoods, landmarks, MRT stations, attractions, parks, beaches, buildings, streets, or famous spots. From Marina Bay to Sentosa to heartland gems";
        exampleWords = "BUGIS, ORCHARD, SENTOSA, MARINA BAY SANDS, JEWEL, CHINATOWN, LITTLE INDIA, CLARKE QUAY, BOTANIC GARDENS, HAJI LANE";
        break;
      case "singlish":
        categoryPrompt = "Singlish words, Singapore slang, colloquial expressions, Malay/Hokkien/Cantonese/Tamil words commonly used in Singapore English. Fun local expressions everyone uses";
        exampleWords = "SHIOK, KIASU, MAKAN, CHOPE, WALAO, BOJIO, LEPAK, CAN LAH, PAISEH, SIAO, ALAMAK, AIYOH, SEDAP, JIALAT";
        break;
      case "all":
        categoryPrompt = "anything uniquely Singaporean - food, places, Singlish, traditions, festivals, activities, or cultural references. Surprise the player with something fun";
        exampleWords = "LAKSA, SHIOK, ORCHARD, MERLION, CHOPE, DURIAN, SINGLISH, HAWKER, KOPITIAM, ANG MOH, VOID DECK, MRT";
        break;
      default:
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const systemPrompt = `You are a fun Singapore culture expert creating a Wordle-style guessing game. Be creative and pick interesting words!

RULES:
1. Word length can be 3-10 letters (short words are fun too!)
2. The word must relate to: ${categoryPrompt}
3. Pick words that are FUN to guess - well-known to Singaporeans and tourists alike
4. Use ONLY LETTERS (A-Z), no spaces, hyphens, or special characters
5. For multi-word concepts, pick just ONE key word (e.g., "KAYA" not "KAYA TOAST")

Example words for inspiration: ${exampleWords}

Respond ONLY in this exact JSON format:
{"word": "WORD", "hint": "A fun clue (max 12 words)", "emoji": "relevant emoji"}`;

    const userPrompt = `Generate a unique Singapore ${category === "all" ? "culture" : category} word for a guessing game! Random seed: ${randomSeed}

Be creative! Pick something DIFFERENT and FUN - could be short (3-4 letters) or longer (7-10 letters). Avoid overused words. Think of:
- Lesser known but recognizable terms
- Fun-to-guess words with interesting backstories
- Words that make players go "oooh I know this!"

Surprise me!`;

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
      console.error("Perplexity API error:", error);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json({ error: "Failed to generate word" }, { status: 500 });
    }

    const parsed: DailyWordResponse = JSON.parse(jsonMatch[0]);

    // Clean the word - remove any non-letter characters
    parsed.word = parsed.word.toUpperCase().replace(/[^A-Z]/g, "");

    // Validate word length (3-10 letters)
    if (parsed.word.length < 3 || parsed.word.length > 10) {
      console.error("Generated word has invalid length:", parsed.word);
      return NextResponse.json({ error: "Invalid word length" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Daily word route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}