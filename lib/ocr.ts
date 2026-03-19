import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js
 * @param file The image file to extract text from
 * @returns The extracted text
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(file);
    
    // Clean OCR text: remove extra spaces and normalize line breaks
    const cleanedText = text
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with a single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      .trim();
      
    return cleanedText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Unable to read image. Please ensure the photo is clear.');
  } finally {
    await worker.terminate();
  }
};
