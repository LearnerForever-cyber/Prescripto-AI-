const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("Groq API key not configured");
}

type AnalysisMode = "basic" | "pro";

export const analyzeMedicalDocument = async (
  extractedText: string,
  mode: AnalysisMode = "basic"
) => {
  try {
    const prompt = mode === "pro" ? getProPrompt(extractedText) : getBasicPrompt(extractedText);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // fast + powerful
        messages: [
          {
            role: "system",
            content:
              "You are a highly accurate medical assistant that explains prescriptions clearly in simple English. Never hallucinate unknown medicines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API request failed");
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Try parsing structured JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // fallback if model returns text
      parsed = fallbackParser(content);
    }

    return parsed;
  } catch (error) {
    console.error("Groq Analysis Error:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
};


// ------------------ PROMPTS ------------------

const getBasicPrompt = (text: string) => `
Analyze this medical prescription or document.

Return ONLY valid JSON in this format:

{
  "documentType": "prescription | lab_report | bill | other",
  "summary": "short simple summary",
  "medicines": [
    {
      "name": "medicine name",
      "purpose": "why it is used",
      "dosage": "how to take"
    }
  ]
}

Text:
${text}
`;

const getProPrompt = (text: string) => `
Analyze this medical document deeply.

Return ONLY valid JSON:

{
  "documentType": "prescription | lab_report | bill | other",
  "summary": "clear explanation",
  "medicines": [
    {
      "name": "medicine",
      "purpose": "use",
      "dosage": "instructions",
      "sideEffects": "common side effects"
    }
  ],
  "precautions": ["list of precautions"],
  "estimatedCost": "approx cost insight",
  "severity": "low | medium | high"
}

Text:
${text}
`;


// ------------------ FALLBACK PARSER ------------------

const fallbackParser = (text: string) => {
  return {
    documentType: "other",
    summary: text.slice(0, 200),
    medicines: [],
  };
};
