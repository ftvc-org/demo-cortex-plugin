import { CortexApi, useCortexContext } from '@cortexapps/plugin-core';
import type { CortexEntityContext, ScorecardSummary, EntityScore } from 'types';

const CORTEX_API_BASE = 'https://api.getcortexapp.com'; // change if self-hosted

export function useEntityContext(): CortexEntityContext | null {
  const ctx = useCortexContext();
  if (!ctx?.entity) return null;
  const { tag, cid, type, name } = ctx.entity;
  return { tag, cid, type, name };
}

/**
 * List scorecards that apply to this entity.
 * GET /api/v1/scorecards?entities=<entityTag>
 */
export async function fetchScorecardsForEntity(entityTag: string): Promise<ScorecardSummary[]> {
  const url = `${CORTEX_API_BASE}/api/v1/scorecards?entities=${encodeURIComponent(entityTag)}&page=0&pageSize=1000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`List scorecards failed: ${res.status}`);
  const data = await res.json();
  return (data?.scorecards ?? data ?? []).map((s: any) => ({
    tag: s.tag ?? s.id ?? s.slug,
    name: s.name,
    rules: s.rules,
  }));
}

/**
 * Get current (evaluated) score results for (scorecard, entity).
 * Tries two GET patterns for compatibility.
 */
export async function fetchEntityScoreForScorecard(scorecardTag: string, entityTag: string): Promise<EntityScore | null> {
  // Pattern A
  {
    const urlA = `${CORTEX_API_BASE}/api/v1/scorecards/${encodeURIComponent(scorecardTag)}/entity/${encodeURIComponent(entityTag)}/scores`;
    const resA = await fetch(urlA);
    if (resA.ok) {
      const data = await resA.json();
      return normalizeEntityScore(scorecardTag, entityTag, data);
    }
  }
  // Pattern B
  {
    const urlB = `${CORTEX_API_BASE}/api/v1/scorecards/${encodeURIComponent(scorecardTag)}/scores?entities=${encodeURIComponent(entityTag)}`;
    const resB = await fetch(urlB);
    if (resB.ok) {
      const data = await resB.json();
      const first = Array.isArray(data?.scores) ? data.scores[0] : (Array.isArray(data) ? data[0] : null);
      if (first) return normalizeEntityScore(scorecardTag, entityTag, first);
    }
  }
  return null;
}

/**
 * Re-evaluate this entity for a scorecard now.
 * POST /api/v1/scorecards/{tag}/entity/{entityTag}/scores
 */
export async function reEvaluateScorecard(scorecardTag: string, entityTag: string): Promise<void> {
  const url = `${CORTEX_API_BASE}/api/v1/scorecards/${encodeURIComponent(scorecardTag)}/entity/${encodeURIComponent(entityTag)}/scores`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Re-evaluate failed: ${res.status}`);
}

function normalizeEntityScore(scorecardTag: string, entityTag: string, payload: any): EntityScore {
  const rules: EntityScore['rules'] = (payload?.rules ?? payload?.ruleResults ?? []).map((r: any) => ({
    title: r.title ?? r.ruleTitle ?? r.id,
    id: r.id ?? r.ruleId,
    status: (r.status ?? r.result ?? 'NOT_EVALUATED').toUpperCase(),
    level: r.level,
    failureMessage: r.failureMessage ?? r.message,
  }));
  return {
    entityTag,
    scorecardTag,
    overall: payload?.overall ?? { level: payload?.level, points: payload?.points },
    rules,
  };
}