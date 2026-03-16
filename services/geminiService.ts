
import { GoogleGenAI, Type } from "@google/genai";
import { MedicalAnalysis } from "../types.ts";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING },
    summary: { type: Type.STRING },
    simplifiedTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jargon: { type: Type.STRING },
          meaning: { type: Type.STRING },
          importance: { type: Type.STRING }
        }
      }
    },
    criticalFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING },
          description: { type: Type.STRING },
          action: { type: Type.STRING }
        }
      }
    },
    genericAlternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          brandedName: { type: Type.STRING },
          genericName: { type: Type.STRING },
          approxBrandedPrice: { type: Type.STRING },
          approxGenericPrice: { type: Type.STRING },
          savingsPercentage: { type: Type.STRING }
        }
      }
    },
    costInsights: {
      type: Type.OBJECT,
      properties: {
        procedureName: { type: Type.STRING },
        billedAmount: { type: Type.STRING },
        expectedRange: {
          type: Type.OBJECT,
          properties: {
            privateLow: { type: Type.STRING },
            privateHigh: { type: Type.STRING },
            government: { type: Type.STRING }
          }
        },
        isOvercharged: { type: Type.BOOLEAN },
        tierComparison: { type: Type.STRING }
      },
      required: ['procedureName', 'expectedRange', 'isOvercharged', 'tierComparison']
    },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['documentType', 'summary', 'simplifiedTerms', 'criticalFindings', 'nextSteps']
};

export const analyzeMedicalDocument = async (
  base64Data: string,
  mimeType: string,
  cityTier: string = 'Tier-1'
): Promise<MedicalAnalysis> => {
  try {
    // CRITICAL: New instance before call ensures latest credentials
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Analyze this medical document. 
            Context: Patient is in a ${cityTier} city in India.
            1. Determine Document Type (Prescription, Bill, Lab, Insurance Rejection).
            2. Explain medical jargon in simple English.
            3. If Prescription: Identify BRANDED medicines and suggest Jan Aushadhi (Generic) alternatives with estimated price difference in INR (₹).
            4. If Bill: Benchmark costs against Indian averages for ${cityTier}. 
               Standard surgery ranges for reference: Cataract ₹20k-40k, C-Section ₹60k-1L, Dialysis ₹2.5k-5k.
            5. Flag any unusually high charges or unnecessary "miscellaneous" fees like excessive RMO charges or consumable overheads.
            6. Recommend actionable next steps.
            ALWAYS add a clear disclaimer: 'Consult your doctor before making changes to medication.'
            Format output strictly as JSON.`
          }
        ]
      },
      config: {
        systemInstruction: "You are an expert Indian Medical Consultant specializing in simplifying complex medical documents for patients. You provide accurate, empathetic, and actionable insights while strictly adhering to the requested JSON format.",
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) {
      console.error('Gemini response text is empty');
      throw new Error("No analysis generated from the document.");
    }
    
    try {
      return JSON.parse(text) as MedicalAnalysis;
    } catch {
      console.error('Failed to parse Gemini JSON:', text);
      throw new Error("The analysis result was invalid. Please try again.");
    }
  } catch (err) {
    console.error('Gemini Analysis Error:', err);
    throw err;
  }
};
