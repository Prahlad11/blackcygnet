import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCallScript = async (lead: Lead, userDetails: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key is missing. Please check your configuration.";

  try {
    const prompt = `
      You are an expert sales representative for **Black Cygnet**, a premier provider of elite Life Insurance solutions.
      Generate a concise, persuasive, and professional call script specifically for the lead below.
      
      **My Details (Caller):** ${userDetails}
      
      **Lead Details:**
      Name: ${lead.name}
      Phone: ${lead.phone}
      Company: ${lead.company}
      Role: ${lead.role || 'N/A'}
      Notes: ${lead.notes || 'No prior notes'}

      **Goal:** Book a 15-minute consultation to discuss protecting their family/business assets.

      **Black Cygnet Value Proposition:**
      1.  **Elite Protection:** Custom-tailored life insurance policies for high-net-worth individuals and families.
      2.  **Financial Legacy:** Securing generational wealth and peace of mind.
      3.  **Personalized Service:** We don't just sell policies; we build financial safety nets.

      **Script Structure:**
      1.  **Opening:** Professional greeting, identify yourself as calling from Black Cygnet.
      2.  **The Hook:** Acknowledge their role/company (if applicable) and mention why you are calling (referencing any notes if available).
      3.  **Value Pitch:** Briefly state how Black Cygnet can help secure their future.
      4.  **Objection Handling (Brief):** Anticipate a "busy" or "not interested" response with a polite pivot.
      5.  **The Ask:** Ask for a brief time to chat (Next Tuesday/Thursday).

      Keep the tone confident, empathetic, and sophisticated.
      Format the output in clear Markdown with bold headers for sections (e.g., **Introduction**, **Pitch**, **Closing**).
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate script.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating script. Please try again.";
  }
};