import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, RecommendationStack } from './types';
import type { Env } from './core-utils';
// 🤖 AI Extension Point: Add session management features
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private recommendations = new Map<string, RecommendationStack>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<{
        sessions?: Record<string, SessionInfo>;
        recommendations?: Record<string, RecommendationStack>;
      }>('data') || {};
      this.sessions = new Map(Object.entries(stored.sessions || {}));
      this.recommendations = new Map(Object.entries(stored.recommendations || {}));
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('data', {
      sessions: Object.fromEntries(this.sessions),
      recommendations: Object.fromEntries(this.recommendations),
    });
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
  // Recommendation Methods
  async saveRecommendation(sessionId: string, rec: RecommendationStack): Promise<void> {
    await this.ensureLoaded();
    this.recommendations.set(sessionId, rec);
    await this.persist();
  }
  async getRecommendation(sessionId: string): Promise<RecommendationStack | null> {
    await this.ensureLoaded();
    return this.recommendations.get(sessionId) || null;
  }
  async listRecommendations(): Promise<(RecommendationStack & { sessionId: string })[]> {
    await this.ensureLoaded();
    return Array.from(this.recommendations.entries()).map(([sessionId, rec]) => ({
      ...rec,
      sessionId,
    }));
  }
  async deleteRecommendation(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.recommendations.delete(sessionId);
    if (deleted) {
      // Also delete the associated session
      this.sessions.delete(sessionId);
      await this.persist();
    }
    return deleted;
  }
}