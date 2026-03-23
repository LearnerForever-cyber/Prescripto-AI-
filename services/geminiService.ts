import { MedicalAnalysis } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('Groq API key not configured. Set VITE_GROQ_API_KEY in your environment.');
}

type AnalysisMode = 'basic' | 'pro';

// Truncate OCR text to avoid hitting token limits
const truncateText = (text: string, maxChars = 3000): string => {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n[... document truncated for processing ...]';
};

const getBasicPrompt = (text: string, cityTier: string) => `You are an expert Indian medical consultant. Analyze this medical document and return ONLY valid JSON with no markdown or backticks.

Required JSON format:
{
  "documentType": "PRESCRIPTION",
  "summary": "2-3 sentence plain English summary",
  "simplifiedTerms": [
    { "jargon": "term", "meaning": "plain English", "importance": "why it matters" }
  ],
  "criticalFindings": [
    { "issue": "title", "description": "description", "action": "what patient should do" }
  ],
  "nextSteps": ["step 1", "step 2"]
}

Rules:
- documentType must be one of: PRESCRIPTION, HOSPITAL_BILL, LAB_REPORT, INSURANCE_REJECTION
- Patient city tier: ${cityTier}
- Use rupee symbol for currency
- Return raw JSON only, no markdown

Document:
${truncateText(text)}`;

const getProPrompt = (text: string, cityTier: string) => `You are an expert Indian medical consultant. Analyze this medical document deeply and return ONLY valid JSON with no markdown or backticks.

Required JSON format:
{
  "documentType": "PRESCRIPTION",
  "summary": "2-3 sentence plain English summary",
  "simplifiedTerms": [
    { "jargon": "term", "meaning": "plain English", "importance": "why it matters" }
  ],
  "criticalFindings": [
    { "issue": "title", "description": "description", "action": "what patient should do" }
  ],
  "genericAlternatives": [
    {
      "brandedName": "Brand Name",
      "genericName": "Jan Aushadhi generic",
      "approxBrandedPrice": "Rs.450",
      "approxGenericPrice": "Rs.90",
      "savingsPercentage": "80%"
    }
  ],
  "costInsights": {
    "procedureName": "procedure name",
    "billedAmount": "Rs.X,XXX",
    "expectedRange": {
      "privateLow": "Rs.X,XXX",
      "privateHigh": "Rs.XX,XXX",
      "government": "Rs.X,XXX"
    },
    "isOvercharged": false,
    "tierComparison": "brief note about cost vs city tier"
  },
  "nextSteps": ["step 1", "step 2", "step 3"]
}

Rules:
- documentType: PRESCRIPTION, HOSPITAL_BILL, LAB_REPORT, or INSURANCE_REJECTION
- City tier: ${cityTier} (Tier-1=Metro, Tier-2=mid cities, Tier-3=smaller towns)
- Surgery ranges Tier-1: Cataract Rs.20k-40k, C-Section Rs.60k-1L, Knee Replacement Rs.1.5L-3L
- For prescriptions: fill genericAlternatives for every branded medicine found
- For bills: fill costInsights with real benchmarks
- BD=twice daily, TDS=3x daily, OD=once daily
- Return raw JSON only, no markdown

Document:
${truncateText(text)}`;

export const analyzeMedicalDocument = async (
  extractedText: string,
  mode: AnalysisMode = 'basic',
  cityTier: string = 'Tier-1'
): Promise<MedicalAnalysis> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY in your environment settings.');
  }

  if (!extractedText || extractedText.trim().length < 5) {
    throw new Error('No text could be extracted from the image. Please try a clearer photo.');
  }

  const prompt = mode === 'pro' ? getProPrompt(extractedText, cityTier) : getBasicPrompt(extractedText, cityTier);

  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a medical document analyzer for Indian patients. Respond with valid JSON only. No markdown, no code blocks, no extra text — just the raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });
  } catch {
    throw new Error('Network error: could not reach the AI service. Please check your connection.');
  }

  if (!response.ok) {
    let errBody = '';
    try { errBody = await response.text(); } catch { /* ignore */ }
    console.error('Groq API error:', response.status, errBody);

    if (response.status === 400) {
      throw new Error('AI request rejected (400). The document may be too large. Try a clearer, cropped image.');
    } else if (response.status === 401) {
      throw new Error('Invalid Groq API key. Please check VITE_GROQ_API_KEY in your environment settings.');
    } else if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    } else {
      throw new Error(`AI service error (${response.status}). Please try again.`);
    }
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from AI. Please try again.');
  }

  // Strip any accidental markdown fences
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed: MedicalAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse Groq response as JSON:', content);
    parsed = {
      documentType: 'PRESCRIPTION',
      summary: 'The AI returned an unexpected format. Please try again with a clearer image.',
      simplifiedTerms: [],
      criticalFindings: [],
      nextSteps: ['Please take a clearer photo and try again.', 'Consult your doctor for further guidance.'],
    };
  }

  if (!parsed.simplifiedTerms)  parsed.simplifiedTerms  = [];
  if (!parsed.criticalFindings) parsed.criticalFindings = [];
  if (!parsed.nextSteps)        parsed.nextSteps        = [];

  return parsed;
};
