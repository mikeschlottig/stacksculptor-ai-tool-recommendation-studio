import { chatService } from './chat';
// Define the structure for a single tool recommendation
export interface ToolRecommendation {
  toolName: string;
  role: 'Code Generation' | 'Agent Framework' | 'Vector Database' | 'LLM Provider' | 'Deployment' | 'Monitoring' | 'Data Processing' | 'Other';
  rationale: string;
  monthlyCost: number;
  confidence: number; // A score from 0 to 100
  starterPlan: {
    step1: string;
    step2: string;
    step3: string;
  };
  docsUrl: string;
  quickstartSnippet?: {
    language: string;
    code: string;
  };
}
// Define the structure for the entire recommendation stack
export interface RecommendationStack {
  title: string;
  summary: string;
  estimatedTotalMonthlyCost: number;
  tools: ToolRecommendation[];
}
// Define the user profile structure collected from the wizard
export interface UserProfile {
  useCase: string;
  ambition: string;
  budget: number;
  constraints: string[];
  integrations: string[];
}
/**
 * Constructs a detailed, deterministic prompt to guide the AI model.
 * This is crucial for getting reliable JSON output.
 * @param profile - The user's profile from the onboarding wizard.
 * @returns A string containing the full prompt for the AI model.
 */
function buildPrompt(profile: UserProfile): string {
  return `
    You are StackSculptor, an expert AI solutions architect. Your task is to analyze the user's requirements and recommend a tailored, actionable AI tool stack.
    **USER PROFILE:**
    - **Primary Use Case:** ${profile.useCase}
    - **Ambition/Success Criteria:** ${profile.ambition}
    - **Monthly Budget:** Up to $${profile.budget}
    - **Key Constraints:** ${profile.constraints.join(', ') || 'None'}
    - **Desired Integrations:** ${profile.integrations.join(', ') || 'None'}
    **YOUR TASK:**
    Based on the user profile, generate a complete AI tool stack.
    You MUST respond with ONLY a single, valid JSON object. Do not include any text, markdown, or explanation before or after the JSON object.
    **JSON SCHEMA:**
    The JSON object must conform to the following TypeScript interface:
    \`\`\`typescript
    interface ToolRecommendation {
      toolName: string;
      role: 'Code Generation' | 'Agent Framework' | 'Vector Database' | 'LLM Provider' | 'Deployment' | 'Monitoring' | 'Data Processing' | 'Other';
      rationale: string; // A concise, one-sentence explanation.
      monthlyCost: number; // Estimated monthly cost for a starter plan.
      confidence: number; // Your confidence in this recommendation (0-100).
      starterPlan: {
        step1: string; // Actionable first step.
        step2: string; // Actionable second step.
        step3: string; // Actionable third step.
      };
      docsUrl: string; // A valid URL to the official documentation.
      quickstartSnippet?: {
        language: string; // e.g., 'typescript', 'python'
        code: string; // A short, copyable code snippet.
      };
    }
    interface RecommendationStack {
      title: string; // A catchy title for the recommended stack.
      summary: string; // A 2-3 sentence overview of the stack and why it's a good fit.
      estimatedTotalMonthlyCost: number;
      tools: ToolRecommendation[]; // An array of 3-5 recommended tools.
    }
    \`\`\`
    **INSTRUCTIONS:**
    1.  **Analyze Deeply:** Carefully consider the user's use case, budget, and constraints.
    2.  **Select Tools:** Choose 3-5 appropriate tools that form a cohesive stack.
    3.  **Populate Fields:** Fill in all fields of the JSON schema accurately.
    4.  **Cost Estimation:** Provide realistic starter cost estimates. If a tool has a free tier, use 0.
    5.  **Actionable Plan:** The starter plan steps must be clear and concise.
    6.  **VALIDATE:** Ensure your entire response is a single, minified JSON object with no extra characters or formatting.
  `;
}
/**
 * Attempts to parse a JSON string, with a fallback to extract it from a larger text block.
 * @param raw - The raw string response from the AI.
 * @returns The parsed RecommendationStack object or null if parsing fails.
 */
export function parseRecommendation(raw: string): RecommendationStack | null {
  try {
    // First, try to parse the whole string directly.
    return JSON.parse(raw) as RecommendationStack;
  } catch (e) {
    // If that fails, try to find a JSON block within the text.
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        return JSON.parse(jsonString) as RecommendationStack;
      } catch (parseError) {
        console.error("Failed to parse extracted JSON:", parseError);
        return null;
      }
    }
  }
  console.error("No valid JSON found in the response.");
  return null;
}
/**
 * Generates a recommendation stack by sending a structured prompt to the AI.
 * @param profile - The user's profile.
 * @param onChunk - A callback to handle streaming text chunks for the UI.
 * @returns An object containing the raw AI response and the parsed stack.
 */
export async function generateRecommendation(
  profile: UserProfile,
  onChunk: (chunk: string) => void
): Promise<{ raw: string; parsed: RecommendationStack | null }> {
  const prompt = buildPrompt(profile);
  let fullResponse = "";
  // Create a new session for this recommendation
  const sessionRes = await chatService.createSession("StackSculptor Recommendation");
  if (sessionRes.success && sessionRes.data) {
    chatService.switchSession(sessionRes.data.sessionId);
  } else {
    // Fallback to default session if creation fails
    chatService.newSession();
  }
  await chatService.sendMessage(prompt, undefined, (chunk) => {
    fullResponse += chunk;
    onChunk(chunk); // Pass chunk to UI for live display
  });
  const parsed = parseRecommendation(fullResponse);
  return { raw: fullResponse, parsed };
}