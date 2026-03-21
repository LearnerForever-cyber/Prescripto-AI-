import { MedicalAnalysis } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('Groq API key not configured. Set VITE_GROQ_API_KEY in your environment.');
}

type AnalysisMode = 'basic' | 'pro';

const getBasicPrompt = (text: string) => `
You are an expert Indian medical consultant. Analyze this medical document and return ONLY valid JSON — no markdown, no explanation, just JSON.

Required JSON format:
{
  "documentType": "PRESCRIPTION",
  "summary": "2-3 sentence plain English summary of the document",
  "simplifiedTerms": [
    { "jargon": "medical term", "meaning": "plain English explanation", "importance": "why it matters for the patient" }
  ],
  "criticalFindings": [
    { "issue": "issue title", "description": "description", "action": "what the patient should do" }
  ],
  "nextSteps": ["step 1", "step 2"]
}

documentType must be one of: PRESCRIPTION, HOSPITAL_BILL, LAB_REPORT, INSURANCE_REJECTION

Document text:
${text}
`;

const getProPrompt = (text: string) => `
You are an expert Indian medical consultant. Analyze this medical document deeply and return ONLY valid JSON — no markdown, no explanation, just JSON.

Required JSON format:
{
  "documentType": "PRESCRIPTION",
  "summary": "2-3 sentence plain English summary",
  "simplifiedTerms": [
    { "jargon": "medical term", "meaning": "plain English explanation", "importance": "why it matters" }
  ],
  "criticalFindings": [
    { "issue": "issue title", "description": "description", "action": "what the patient should do" }
  ],
  "genericAlternatives": [
    {
      "brandedName": "Brand Name",
      "genericName": "Generic / Jan Aushadhi equivalent",
      "approxBrandedPrice": "₹450",
      "approxGenericPrice": "₹90",
      "savingsPercentage": "80%"
    }
  ],
  "costInsights": {
    "procedureName": "name of procedure or treatment",
    "billedAmount": "₹X,XXX",
    "expectedRange": {
      "privateLow": "₹X,XXX",
      "privateHigh": "₹XX,XXX",
      "government": "₹X,XXX"
    },
    "isOvercharged": false,
    "tierComparison": "This cost is within the typical range for a Tier-1 city private hospital."
  },
  "nextSteps": ["step 1", "step 2", "step 3"]
}

documentType must be one of: PRESCRIPTION, HOSPITAL_BILL, LAB_REPORT, INSURANCE_REJECTION
For prescriptions, always populate genericAlternatives.
For bills, always populate costInsights.

Document text:
${text}
`;

export const analyzeMedicalDocument = async (
  extractedText: string,
  mode: AnalysisMode = 'basic'
): Promise<MedicalAnalysis> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY.');
  }

  const prompt = mode === 'pro' ? getProPrompt(extractedText) : getBasicPrompt(extractedText);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content:
            'You are a medical document analyzer for Indian patients. Always respond with valid JSON only. Never add markdown code blocks or explanations outside the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Groq API error:', errText);
    throw new Error(`Groq API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from AI');
  }

  // Strip any accidental markdown fences
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  let parsed: MedicalAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse Groq response as JSON:', content);
    // Return a safe fallback so the app doesn't crash
    parsed = {
      documentType: 'PRESCRIPTION',
      summary: content.slice(0, 300),
      simplifiedTerms: [],
      criticalFindings: [],
      nextSteps: ['Please consult your doctor for further guidance.'],
    };
  }

  // Ensure required arrays are present
  if (!parsed.simplifiedTerms) parsed.simplifiedTerms = [];
  if (!parsed.criticalFindings) parsed.criticalFindings = [];
  if (!parsed.nextSteps) parsed.nextSteps = [];

  return parsed;
};
