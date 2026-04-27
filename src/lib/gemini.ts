import { GoogleGenAI } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is loaded
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// Lazy init the AI client to avoid crashing on start if the key is missing in Vite build.
// Also allows picking up a user-provided key.
let _aiClient: any = null;

export function getAIClient() {
  if (_aiClient) return _aiClient;
  
  let apiKey = process.env.GEMINI_API_KEY;
  
  // Also check if the user provided one in ProfilePage
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('vellum_gemini_key');
    if (savedKey) {
      try {
        const decoded = atob(savedKey);
        if (decoded) apiKey = decoded;
      } catch(e) {}
    }
  }

  if (!apiKey) {
    console.warn("Gemini API key is missing. AI features will fail. Using dummy key to prevent crash.");
    apiKey = 'DUMMY_KEY_TO_PREVENT_LOAD_CRASH';
  }

  _aiClient = new GoogleGenAI({ apiKey });
  return _aiClient;
}

export async function extractPDFText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    fullText += pageText + ' ';
    
    // Safety break, avoid string getting too enormous for the prompt
    if (fullText.length > 50000) {
       fullText = fullText.slice(0, 50000);
       break;
    }
  }
  
  return fullText.trim();
}

export async function* chatWithPDF(pdfText: string, conversationHistory: any[], userMessage: string) {
  // We use streaming chat approach
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3.1-flash-preview',
    config: {
      systemInstruction: `You are a PDF document assistant. The user has uploaded a PDF document. Here is the document content:\n\n${pdfText}\n\nAnswer questions about this document accurately. If something is not in the document, say so clearly.`,
      temperature: 0.2,
    }
  });

  const contents: string[] = [];
  for (const msg of conversationHistory) {
    if (msg.role !== 'system') {
      contents.push(msg.role === 'user' ? `User: ${msg.content}` : `Assistant: ${msg.content}`);
    }
  }
  contents.push(`User: ${userMessage}`);

  const stream = await chat.sendMessageStream({ message: contents.join('\n\n') });
  for await (const chunk of stream) {
    yield chunk;
  }
}

export async function summarizePDF(pdfText: string, style: 'brief'|'detailed'|'bullets') {
  const prompt = `Summarize the following document. Style: ${style}.
  ${style === 'bullets' ? 'Use bullet points for key points.' : ''}
  ${style === 'brief' ? 'Keep it under 150 words.' : ''}
  Document:\n\n${pdfText}`;
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-preview',
    contents: prompt
  });
  
  return response.text;
}

export async function translatePDF(pdfText: string, targetLanguage: string) {
  const prompt = `Translate the following document content to ${targetLanguage}. 
  Maintain formatting and structure. Document:\n\n${pdfText}`;
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-preview',
    contents: prompt
  });
  
  return response.text;
}

export async function extractKeyPoints(pdfText: string): Promise<string[]> {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-preview',
    contents: `Extract the main key points from this document. Document:\n\n${pdfText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY" as any,
        items: { type: "STRING" as any }
      }
    }
  });
  
  if (response.text) {
    try {
      return JSON.parse(response.text);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function suggestFilename(pdfText: string) {
  const prompt = `Based on this document, suggest a concise, professional filename (no extension, use hyphens). 
  Document preview:\n${pdfText.slice(0, 2000)}`;
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-preview',
    contents: prompt
  });
  
  return response.text?.trim() || 'document';
}
