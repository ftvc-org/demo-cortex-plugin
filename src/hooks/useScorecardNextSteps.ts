// hooks/useScorecardNextSteps.ts
import { useMemo } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface ScoreLevel {
  name: string;
  number: number;
}

export interface LevelWrapper {
  level: ScoreLevel;
}

export interface RuleToComplete {
  identifier: string;
  title: string;
  description?: string | null;
  expression?: string;
}

export interface NextStep {
  rulesToComplete: RuleToComplete[];
  currentLevel?: LevelWrapper;
  nextLevel?: LevelWrapper;
}

export interface NextStepsResponse {
  nextSteps: NextStep[];
}

export interface UseScorecardNextStepsParams {
  /** Scorecard tag, e.g. "empty-scorecard-with-levels" */
  scorecardTag: string;
  /** Entity tag, e.g. "maven-service" */
  entityTag: string;
  /** Cortex cloud base URL; defaults to official */
  baseUrl?: string; // default: https://api.getcortexapp.com/api/v1
}

export interface UseScorecardNextStepsOptions {
  /** Bearer token for Cortex Cloud (required) */
  token: string;
  /** React Query overrides (staleTime, retry, etc.) */
  queryOptions?: Omit<
    UseQueryOptions<NextStepsResponse, Error>,
    "queryKey" | "queryFn" | "enabled"
  >;
}

export interface UseScorecardNextStepsReturn {
  /** Full API payload */
  data: NextStepsResponse | undefined;
  /** Flattened list of rules across all nextSteps entries */
  rulesToComplete: RuleToComplete[];
  /** Convenience meta */
  currentLevel?: ScoreLevel;
  nextLevel?: ScoreLevel;
  /** React Query state */
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches "next steps" (rules to complete) for a scorecard+entity from Cortex Cloud.
 * GET https://api.getcortexapp.com/api/v1/scorecards/{scorecardTag}/next-steps?entityTag={entityTag}
 */
export const useScorecardNextSteps = (
  params: UseScorecardNextStepsParams,
  options: UseScorecardNextStepsOptions
): UseScorecardNextStepsReturn => {
  const { scorecardTag, entityTag, baseUrl = "https://api.getcortexapp.com/api/v1" } = params;
  const { token, queryOptions } = options;

  const url = useMemo(() => {
    if (!scorecardTag || !entityTag) return "";
    const encodedScorecard = encodeURIComponent(scorecardTag);
    const encodedEntity = encodeURIComponent(entityTag);
    return `${baseUrl}/scorecards/${encodedScorecard}/next-steps?entityTag=${encodedEntity}`;
  }, [baseUrl, scorecardTag, entityTag]);

  const query = useQuery<NextStepsResponse, Error>({
    queryKey: ["scorecardNextSteps", url, Boolean(token)],
    enabled: Boolean(url && token),
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(
          `Failed to fetch next steps (${resp.status} ${resp.statusText}) ${text || ""}`.trim()
        );
      }

      const json = (await resp.json()) as NextStepsResponse;
      // Normalize shape defensively
      if (!Array.isArray(json?.nextSteps)) {
        return { nextSteps: [] };
      }
      return json;
    },
    ...queryOptions,
  });

  const nextSteps = query.data?.nextSteps ?? [];

  // Flatten all rules from all "nextSteps" items
  const rulesToComplete: RuleToComplete[] = useMemo(
    () =>
      nextSteps.flatMap((ns) =>
        Array.isArray(ns.rulesToComplete) ? ns.rulesToComplete : []
      ),
    [nextSteps]
  );

  // If you want to show a single pair of levels, take them from the first item
  const currentLevel = nextSteps[0]?.currentLevel?.level;
  const nextLevel = nextSteps[0]?.nextLevel?.level;

  return {
    data: query.data,
    rulesToComplete,
    currentLevel,
    nextLevel,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: () => query.refetch(),
  };
};

export default useScorecardNextSteps;