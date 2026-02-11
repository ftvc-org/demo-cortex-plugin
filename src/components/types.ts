export type CortexEntityContext = {
  tag?: string;   // "service:payments/api" etc.
  cid?: string;
  type?: string;
  name?: string;
};

export type ScorecardSummary = {
  tag: string;    // scorecard identifier
  name: string;
  rules?: Array<{
    title?: string;
    level?: string;
    expression?: string;
    weight?: number;
    failureMessage?: string;
  }>;
};

export type EntityScore = {
  entityTag: string;
  scorecardTag: string;
  overall?: { level?: string; points?: number };
  rules: Array<{
    title?: string;
    id?: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    level?: string;
    failureMessage?: string;
  }>;
};