import { useQuery } from "@tanstack/react-query";

import { usePluginContextProvider } from "../components/PluginContextProvider";

import { fetchPaginated } from "../util";

export interface UseEntityCustomEventsProps {
  entityTag: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UseEntityCustomEventsReturn {
  customEvents: any[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const useEntityCustomEvents = ({
  entityTag,
  startDate,
  endDate,
}: UseEntityCustomEventsProps): UseEntityCustomEventsReturn => {
  const { apiBaseUrl } = usePluginContextProvider();

  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 7);
  const start = startDate ?? defaultStartDate;

  const query = useQuery({
    queryKey: ["entityCustomEvents", entityTag],
    queryFn: async () => {
      const params = new URLSearchParams({
        startTime: start.toISOString().split(".")[0],
      });
      if (endDate) {
        params.set("endTime", endDate.toISOString().split(".")[0]);
      }
      return await fetchPaginated(
        `${apiBaseUrl}/catalog/${entityTag}/custom-events?${params.toString()}`
      );
    },
    enabled: !!apiBaseUrl,
    retry: false,
  });

  return {
    customEvents: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};

export default useEntityCustomEvents;
