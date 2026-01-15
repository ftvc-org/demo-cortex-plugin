import { useQuery } from "@tanstack/react-query";

import { usePluginContextProvider } from "../components/PluginContextProvider";

import { fetchPaginated } from "../util";

export interface UseEntityCustomDataProps {
  entityTag: string;
}

export interface UseEntityCustomDataReturn {
  customData: any;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const customDataListToDict = (
  customData: any[]
): Record<string, any> => {
  return customData.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

export const useEntityCustomData = ({
  entityTag,
}: UseEntityCustomDataProps): UseEntityCustomDataReturn => {
  const { apiBaseUrl } = usePluginContextProvider();

  const query = useQuery({
    queryKey: ["entityCustomData", entityTag],
    queryFn: async () => {
      return await fetchPaginated(
        `${apiBaseUrl}/catalog/${entityTag}/custom-data`
      );
    },
    enabled: !!apiBaseUrl,
    retry: false,
  });

  return {
    customData: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};

export default useEntityCustomData;
