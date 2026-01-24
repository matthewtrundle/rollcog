/**
 * @fileoverview AI Chat API route for roofing expert chatbot
 * @module app/api/chat/route
 */

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Use Vercel AI Gateway
const gateway = createOpenAI({
  baseURL: 'https://api.vercel.ai/v1',
  apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
});

// System prompt for the roofing expert
const SYSTEM_PROMPT = `You are an expert commercial roofing consultant for Rollcog Roofs, a GAF-certified commercial roofing contractor with 27+ years of experience based in Oak Brook, Illinois.

Your expertise includes:
- TPO (Thermoplastic Polyolefin) roofing systems
- Modified Bitumen (Mod-Bit) roofing
- EPDM rubber roofing
- Flat roof repair and replacement
- Commercial and industrial roofing
- Roof inspections and maintenance
- GAF warranty programs

Key company information:
- Service areas: Chicagoland, Indiana, Ohio, West Virginia, Kentucky, Tennessee, North Carolina, South Carolina, Georgia
- GAF Master Certified and GAF Authorized Commercial contractor
- 24-hour estimate delivery
- Emergency repairs within 5 days
- Free inspections

Guidelines:
- Be helpful, professional, and knowledgeable
- Provide accurate information about commercial roofing
- When asked about pricing, explain that estimates require an on-site inspection
- Encourage users to request a free estimate for specific projects
- Keep responses concise but informative (2-3 paragraphs max)
- If you don't know something specific, recommend contacting Rollcog directly
- Never make up specific prices or timelines without noting they are estimates`;

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: gateway('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
