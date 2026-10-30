/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { QuestionServer, SkillDifficulty } from '../types';
import { getFallbackQuestions } from './questionBank';

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('[GeminiService] Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Generates technical multiple-choice questions using Gemini API server-side.
 * Falls back safely to curated question bank if Gemini is unavailable or errors out.
 */
export async function generateQuestionWithGemini(
  skill: string,
  difficulty: SkillDifficulty,
  existingQuestionTexts: string[] = []
): Promise<QuestionServer> {
  if (!aiClient) {
    console.log(`[GeminiService] AI client not configured. Using validated question bank for ${skill} (${difficulty}).`);
    const fallbackList = getFallbackQuestions(skill, difficulty, 5);
    const available = fallbackList.filter(q => !existingQuestionTexts.includes(q.question));
    return available[0] || fallbackList[0];
  }

  const prompt = `
Generate a single high-quality multiple choice question to assess a software developer's skill in "${skill}" at the "${difficulty}" level.
Avoid these previous questions: ${JSON.stringify(existingQuestionTexts.slice(-5))}

Requirements:
- Exactly 4 realistic, distinct options.
- Exactly 1 unambiguous correct answer.
- Optional short code snippet if relevant for testing coding skills.
- Clear technical explanation explaining why the correct answer is right and why others are wrong.
- Output ONLY valid JSON matching this schema:
{
  "question": "string",
  "codeSnippet": "string or empty",
  "options": ["string", "string", "string", "string"],
  "correctOptionIndex": 0, // integer 0, 1, 2, or 3
  "explanation": "string"
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const responseText = response.text?.trim() || '';
    const parsed = JSON.parse(responseText);

    if (
      typeof parsed.question === 'string' &&
      Array.isArray(parsed.options) &&
      parsed.options.length === 4 &&
      typeof parsed.correctOptionIndex === 'number' &&
      parsed.correctOptionIndex >= 0 &&
      parsed.correctOptionIndex <= 3 &&
      typeof parsed.explanation === 'string'
    ) {
      return {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        skill,
        difficulty,
        question: parsed.question,
        codeSnippet: parsed.codeSnippet && parsed.codeSnippet.trim() !== '' ? parsed.codeSnippet : undefined,
        options: parsed.options as [string, string, string, string],
        correctOptionIndex: parsed.correctOptionIndex,
        explanation: parsed.explanation,
        isAiGenerated: true
      };
    } else {
      throw new Error('Gemini response did not match expected schema');
    }
  } catch (error) {
    console.warn(`[GeminiService] Question generation error: ${(error as Error).message}. Falling back to question bank.`);
    const fallbackList = getFallbackQuestions(skill, difficulty, 5);
    const available = fallbackList.filter(q => !existingQuestionTexts.includes(q.question));
    return available[0] || fallbackList[0];
  }
}

/**
 * Generates an explainable match synthesis using Gemini based strictly on verified inputs.
 */
export async function generateMatchExplanationWithGemini(params: {
  projectTitle: string;
  requiredSkills: string[];
  userSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  score: number;
}): Promise<string> {
  if (!aiClient) {
    return `Score: ${params.score}%. Matches ${params.matchingSkills.length} of ${params.requiredSkills.length} required skills (${params.matchingSkills.join(', ')}).`;
  }

  const prompt = `
Generate a concise, professional 2-sentence explanation of why a candidate matches the project "${params.projectTitle}".
Data:
- Match score: ${params.score}%
- Candidate skills: ${params.userSkills.join(', ') || 'None listed'}
- Required project skills: ${params.requiredSkills.join(', ')}
- Overlapping skills: ${params.matchingSkills.join(', ') || 'None'}
- Missing required skills: ${params.missingSkills.join(', ') || 'None'}

Instructions:
- Base your analysis STRICTLY on the provided data.
- Mention specific matching strengths and one concrete skill or next step to focus on.
- Keep it under 50 words. Do not make up facts.
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    return response.text?.trim() || `Score: ${params.score}%. Matches ${params.matchingSkills.join(', ')}.`;
  } catch (error) {
    return `Score: ${params.score}%. Verified match for ${params.matchingSkills.join(', ')}.`;
  }
}
