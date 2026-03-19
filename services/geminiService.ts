import { GoogleGenAI, Type } from "@google/genai";
import { MedicalAnalysis } from "../types";

// The Gemini API key is provided by the platform in the environment
const API_KEY = process.env.GEMINI_API_KEY || "";

export const analyzeMedicalDocument = async (
  extractedText: string,
  mode: "basic" | "pro"
): Promise<MedicalAnalysis> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const schema = {
    type: Type.OBJECT,
    properties: {
      documentType: {
        type: Type.STRING,
        description: "The type of document: PRESCRIPTION, HOSPITAL_BILL, LAB_REPORT, or INSURANCE_REJECTION",
      },
      summary: {
        type: Type.STRING,
        description: "A brief, simple summary of the document findings.",
      },
      simplifiedTerms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            jargon: { type: Type.STRING, description: "The medical term or jargon found." },
            meaning: { type: Type.STRING, description: "A simple, easy-to-understand explanation." },
            importance: { type: Type.STRING, description: "Why this matters to the patient." },
          },
          required: ["jargon", "meaning", "importance"],
        },
      },
      criticalFindings: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING, description: "The specific issue or finding." },
            description: { type: Type.STRING, description: "A detailed explanation of the finding." },
            action: { type: Type.STRING, description: "Recommended action for the patient." },
          },
          required: ["issue", "description", "action"],
        },
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
            savingsPercentage: { type: Type.STRING },
          },
          required: ["brandedName", "genericName", "approxBrandedPrice", "approxGenericPrice", "savingsPercentage"],
        },
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
              government: { type: Type.STRING },
            },
            required: ["privateLow", "privateHigh", "government"],
          },
          isOvercharged: { type: Type.BOOLEAN },
          tierComparison: { type: Type.STRING },
        },
        required: ["procedureName", "billedAmount", "expectedRange", "isOvercharged", "tierComparison"],
      },
      nextSteps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of clear, actionable next steps for the patient.",
      },
    },
    required: ["documentType", "summary", "simplifiedTerms", "criticalFindings", "nextSteps"],
  };

  const systemInstruction = `You are an expert medical document analyst for the Indian healthcare system.
Your goal is to simplify medical documents (prescriptions, bills, lab reports) for patients.
Explain jargon simply, identify potential overcharging in bills, and suggest generic medicine alternatives where applicable.
Always use the ₹ (Rupee) symbol for costs.
Be empathetic but professional.
If the document is a bill, provide cost insights based on typical Indian hospital rates.
If it's a prescription, provide generic alternatives for branded medicines.
Return the analysis in the specified JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: mode === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
      contents: `Analyze the following medical text extracted from a document: \n\n${extractedText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini API.");
    }

    const result = JSON.parse(response.text) as MedicalAnalysis;
    return result;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw new Error(error instanceof Error ? error.message : "AI analysis failed. Please try again.");
  }
};
