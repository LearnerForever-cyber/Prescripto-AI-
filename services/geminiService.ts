import { MedicalAnalysis } from "../types";

/**
 * Calls the Netlify Function /.netlify/functions/analyze
 * The Gemini API key lives ONLY in the Netlify Function — never in the browser bundle.
 */
export const analyzeMedicalDocument = async (
  extractedText: string,
  mode: "basic" | "pro"
): Promise<MedicalAnalysis> => {
  const response = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extractedText, mode }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json() as Promise<MedicalAnalysis>;
};
