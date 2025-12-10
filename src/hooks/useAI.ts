import { useState, useCallback } from "react";

type AIRequestType = "hint" | "explain" | "funfact" | "reaction";

interface UseAIOptions {
  word: string;
  category: string;
  hint?: string;
}

export function useAI({ word, category, hint }: UseAIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAI = useCallback(async (
    type: AIRequestType,
    options?: { userMessage?: string; guessNumber?: number; won?: boolean }
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          word,
          category,
          hint,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, [word, category, hint]);

  const getHint = useCallback((userMessage?: string) => 
    askAI("hint", { userMessage }), [askAI]);

  const getExplanation = useCallback(() => 
    askAI("explain"), [askAI]);

  const getFunFact = useCallback(() => 
    askAI("funfact"), [askAI]);

  const getReaction = useCallback((won: boolean, guessNumber: number) => 
    askAI("reaction", { won, guessNumber }), [askAI]);

  return {
    loading,
    error,
    getHint,
    getExplanation,
    getFunFact,
    getReaction,
  };
}
