// hooks/useCortexNextStepsUrlAndResponse.ts
import { useMemo } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { usePluginContextProvider } from "../components/PluginContextProvider";

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

export interface UseCortexNextStepsParams {
  /** e.g. "empty-scorecard-with-levels" */
  scorecardTag: string;
  /**
   * Optional: override entityTag if you don’t want to use context.entity.tag.
   * If omitted, we’ll use your PluginContextProvider’s entity tag.
   */
  entityTag?: string;
}

export interface UseCortexNextStepsOptions {
  /** Cortex Cloud token (Bearer) */
  token: string;
  /** React Query options passthrough */
  queryOptions?: Omit<
    UseQueryOptions<NextStepsResponse, Error>,
    "queryKey" | "queryFn" | "enabled"
  >;
}

export interface UseCortexNextStepsReturn {
  /** The exact URL being called */
  url: string;
  /** Raw API response object */
  data: NextStepsResponse | undefined;
  /** Flattened list of rules */
  rulesToComplete: RuleToComplete[];
  currentLevel?: ScoreLevel;
  nextLevel?: ScoreLevel;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCortexNextStepsUrlAndResponse = (
  params: UseCortexNextStepsParams,
  options: UseCortexNextStepsOptions
): UseCortexNextStepsReturn => {
  const { scorecardTag } = params;
  const { token, queryOptions } = options;

  const { entity } = usePluginContextProvider(); // assuming your provider exposes entity
  const resolvedEntityTag = params.entityTag ?? entity?.tag ?? "";

  const url = useMemo(() => {
    if (!scorecardTag || !resolvedEntityTag) return "";
    return `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
      scorecardTag
    )}/next-steps?entityTag=${encodeURIComponent(resolvedEntityTag)}`;
  }, [scorecardTag, resolvedEntityTag]);

  const query = useQuery<NextStepsResponse, Error>({
    queryKey: ["cortexNextSteps", url, Boolean(token)],
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
          `Failed to fetch Next Steps (${resp.status} ${resp.statusText}) ${text || ""}`.trim()
        );
      }
      const json = (await resp.json()) as NextStepsResponse;
      if (!Array.isArray(json?.nextSteps)) return { nextSteps: [] };
      return json;
    },
    ...queryOptions,
  });

  const nextSteps = query.data?.nextSteps ?? [];

  const rulesToComplete =
    nextSteps.flatMap(ns => ns.rulesToComplete ?? []) ?? [];

  const currentLevel = nextSteps[0]?.currentLevel?.level;
  const nextLevel = nextSteps[0]?.nextLevel?.level;

  return {
    url,
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

export default useCortexNextStepsUrlAndResponse;