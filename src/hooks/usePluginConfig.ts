import { useQuery } from "@tanstack/react-query";

import { usePluginContextProvider } from "../components/PluginContextProvider";
import useEntityDescriptor from "./useEntityDescriptor";

export interface UsePluginConfigReturn {
  pluginConfigEntity: any;
  pluginEntity: any;
  pluginProxy: any;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const usePluginConfig = (): UsePluginConfigReturn => {
  const { apiBaseUrl, tag } = usePluginContextProvider();
  const apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : "";
  const internalBaseUrl = apiOrigin ? `${apiOrigin}/api/internal/v1` : "";

  const {
    entity: pluginConfigEntity,
    isLoading: isPluginConfigEntityLoading,
    isFetching: isPluginConfigEntityFetching,
  } = useEntityDescriptor({ entityTag: tag ? `${tag}-config` : "" });

  const query = useQuery({
    queryKey: ["pluginConfig", tag],
    queryFn: async () => {
      const pluginResponse = await fetch(`${apiBaseUrl}/plugins/${tag ?? ""}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const pluginEntity = await pluginResponse.json();

      let pluginProxy = {};
      try {
        const pluginProxyTag = pluginEntity?.proxyTag;
        const pluginProxiesResponse = await fetch(
          `${internalBaseUrl}/proxies`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const pluginProxies = await pluginProxiesResponse.json();
        pluginProxy = pluginProxies.proxies?.find(
          (proxy: any) => proxy.tag === pluginProxyTag
        );
      } catch (e) {
        console.error("Error fetching plugin proxies:", e);
      }
      return {
        pluginEntity,
        pluginProxy,
      };
    },
    enabled: !!apiBaseUrl,
    retry: false,
  });

  return {
    pluginConfigEntity,
    pluginEntity: query.data?.pluginEntity,
    pluginProxy: query.data?.pluginProxy,
    isLoading: query.isLoading || isPluginConfigEntityLoading,
    isFetching: query.isFetching || isPluginConfigEntityFetching,
    error: query.error,
  };
};

export default usePluginConfig;
