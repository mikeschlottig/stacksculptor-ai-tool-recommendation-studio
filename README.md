# StackSculptor — AI Tool Recommendation Studio

StackSculptor is a subscription-based AI-assisted platform designed for newcomers to the AI industry who feel overwhelmed by the sheer number of tools, marketing hype, and conflicting options. For just $20/month, users receive personalized recommendations that save them hundreds of dollars and dozens of hours. By sharing their use case and ambitions, the platform generates a custom AI tool stack, tailored workflows, a step-by-step starter guide, and ongoing support.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/stacksculptor-ai-tool-recommendation-studio)

## Overview

StackSculptor streamlines AI adoption by converting user goals, constraints, and preferences into actionable recommendations. It features an elegant onboarding wizard, a visual recommendation canvas with tool cards, session management, and integrated support chat powered by Cloudflare Agents. The platform emphasizes visual excellence, responsive design, and smooth interactions, built on a modern tech stack for rapid deployment and scalability.

### Key Features

- **Onboarding Wizard**: A 4-step form collecting use case, ambitions, budget, and preferences using React Hook Form and Zod for validation.
- **Recommendation Engine**: Leverages Cloudflare Agents and AI models (via Cloudflare AI Gateway) to generate JSON-structured recommendations with streaming UX.
- **Recommendation Canvas**: Stunning, animated cards displaying tools, rationales, costs, confidence scores, and starter checklists. Expandable for workflows and code snippets.
- **Session Management**: List, switch, rename, and delete sessions using Durable Objects for persistence.
- **Support Chat**: Slide-over interface for follow-up questions with the AI agent, including tool usage visualization and request limits.
- **Mock Subscription Flow**: Simulates $20/month opt-in with state management; ready for real billing integration.
- **Visual Polish**: Modern UI with Tailwind CSS, shadcn/ui components, Framer Motion animations, and Lucide icons. Fully responsive and accessible.
- **Export Functionality**: Generate markdown starter guides from recommendations.

Future phases include user persistence, billing (Stripe), templates, analytics, and marketplace integrations.

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v3, shadcn/ui (Radix primitives), Framer Motion (animations), Lucide React (icons), React Hook Form + Zod (forms/validation), Recharts (visualizations), Sonner (toasts), Zustand (state management).
- **Backend**: Cloudflare Workers, Hono (routing), Cloudflare Agents SDK (Durable Objects), OpenAI SDK (via Cloudflare AI Gateway), Model Context Protocol (MCP) for tools, Pino (logging).
- **Tools & Integrations**: SerpAPI (web search), MCP-remote (server integrations), Immer (immutable updates).
- **Development**: Bun (package manager), ESLint (linting), Wrangler (deployment).

## Prerequisites

- Node.js (via Bun) installed: [Install Bun](https://bun.sh/)
- Cloudflare account with Workers enabled.
- API keys: Cloudflare AI Gateway, SerpAPI (for web search tools).
- Environment variables: Set `CF_AI_BASE_URL`, `CF_AI_API_KEY`, and `SERPAPI_KEY` in your Worker environment.

## Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd stacksculptor
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. Configure environment variables:
   - Create a `.dev.vars` file in the root (for local dev):
     ```
     CF_AI_BASE_URL=https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
     CF_AI_API_KEY={your_ai_gateway_key}
     SERPAPI_KEY={your_serpapi_key}
     ```
   - For production, set these via Wrangler secrets or Cloudflare dashboard.

4. Generate TypeScript types from Wrangler:
   ```
   bun run cf-typegen
   ```

## Usage

### Local Development

Start the development server:
```
bun run dev
```

The app runs on `http://localhost:3000` (or your configured port). It includes hot module replacement for fast iteration.

#### Key Endpoints (Backend)
- **Chat Sessions**: 
  - `POST /api/sessions` - Create a new session.
  - `GET /api/sessions` - List sessions.
  - `DELETE /api/sessions/:sessionId` - Delete a session.
- **Chat Interactions**:
  - `POST /api/chat/:sessionId/chat` - Send message (supports streaming).
  - `GET /api/chat/:sessionId/messages` - Get session messages.
  - `DELETE /api/chat/:sessionId/clear` - Clear messages.
  - `POST /api/chat/:sessionId/model` - Update AI model.

#### Frontend Components
- **OnboardingWizard**: Multi-step form for user profile collection.
- **RecommendationCanvas**: Grid of expandable cards rendering AI-generated stacks.
- **SupportChat**: Sheet-based chat using the existing chatService.
- **PricingPage**: Mock subscription toggle with benefits explanation.

Example: To test recommendation generation, navigate to the onboarding flow, submit a profile (e.g., "Content creation with AI, $50 budget"), and observe the streamed AI response parsed into visual cards.

### User Flow
1. **Home/Onboarding**: Complete the wizard to generate a profile JSON.
2. **Generate Recommendation**: Prompt the AI agent via `/api/chat` to produce a structured JSON response.
3. **View Canvas**: Render tools as cards with costs, rationales, and checklists.
4. **Support**: Open chat for refinements using the same session.
5. **Sessions Dashboard**: Manage multiple recommendations.
6. **Subscribe**: Mock opt-in for $20/month access.

## Development Instructions

### Adding Features
- **Frontend**: Modify `src/pages/` for views (e.g., `HomePage.tsx` for onboarding). Use shadcn/ui components from `@/components/ui/`. Extend `chatService` in `src/lib/chat.ts` for API interactions.
- **Backend**: Add routes in `worker/userRoutes.ts`. Extend `ChatAgent` in `worker/agent.ts` for custom logic. Tools are in `worker/tools.ts`; MCP integrations via `worker/mcp-client.ts`.
- **State Management**: Use Zustand for global state (e.g., subscription status). Follow primitive selectors to avoid re-render issues.
- **Styling**: Leverage Tailwind utilities and custom animations in `tailwind.config.js`. Ensure responsive design with mobile-first breakpoints.
- **Testing**: Lint with `bun run lint`. Test AI prompts manually via the chat interface.

### AI Request Limits
Note: This platform uses Cloudflare AI Gateway, which has usage quotas across all apps. Monitor requests via Cloudflare dashboard. Exceeding limits may trigger errors—handle gracefully in UI.

### Common Pitfalls
- Always create a session via `chatService.createSession()` before messaging.
- Parse AI responses as JSON with fallbacks (e.g., regex for malformed output).
- Stick to preinstalled dependencies; no new packages without approval.

## Deployment

Deploy to Cloudflare Workers for global edge performance:

1. Build the frontend:
   ```
   bun run build
   ```

2. Deploy with Wrangler:
   ```
   bun run deploy
   ```

This bundles the Worker and static assets, serving the React app at your custom domain or Workers subdomain.

For production:
- Set secrets: `wrangler secret put CF_AI_API_KEY` (repeat for others).
- Configure bindings in `wrangler.jsonc` (no modifications needed for core DOs).
- Enable observability for logs and metrics.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/stacksculptor-ai-tool-recommendation-studio)

## Contributing

Contributions are welcome! Fork the repo, create a feature branch, and submit a PR. Focus on visual excellence, error handling, and performance. Ensure code follows TypeScript best practices and UI non-negotiables (e.g., responsive gutters).

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, open a GitHub issue. For AI tool recommendations, use the platform's support chat. Questions? Contact the development team via Cloudflare Workers community forums.