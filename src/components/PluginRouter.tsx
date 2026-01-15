import type React from "react";
import { type ReactNode, useEffect, useMemo } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { usePluginContextProvider } from "./PluginContextProvider";

const toCamelCase = (str: string): string => {
  return str
    .split("-")
    .filter((segment) => segment.length > 0)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
};

/**
 * Custom hook that synchronizes the in-app route with the parent page’s URL.
 */
export const useParentRoutingSync = (): void => {
  const { tag } = usePluginContextProvider();
  const queryParamKey = useMemo(() => {
    return tag ? toCamelCase(tag) + "PluginRoute" : "unknownTagPluginRoute";
  }, [tag]);

  const location = useLocation();

  useEffect(() => {
    try {
      const parentUrl = new URL(window.parent.location.href);
      const newRoute = `${location.pathname}${location.search}${location.hash}`;
      parentUrl.searchParams.set(queryParamKey, newRoute);
      window.parent.history.replaceState(null, "", parentUrl.toString());
    } catch (error) {
      console.error("Error updating parent query param:", error);
    }
  }, [location, tag, queryParamKey]);
};

/**
 * Helper component to invoke the URL sync hook.
 */
const ParentRouterSync: React.FC = () => {
  useParentRoutingSync();
  return null;
};

interface PluginRouterProps {
  children: ReactNode;
  initialEntries?: string[];
}

/**
 * PluginRouter wraps your app's routing logic and sets the initial route
 * based on the parent page’s URL if no initial route is provided.
 */
export const PluginRouter: React.FC<PluginRouterProps> = ({
  children,
  initialEntries,
}) => {
  const { tag } = usePluginContextProvider();
  const queryParamValue = useMemo(() => {
    const queryParamKey = tag ? toCamelCase(tag) + "PluginRoute" : undefined;
    if (!queryParamKey) {
      return undefined;
    }
    try {
      const parentUrl = new URL(window.parent.location.href);
      return parentUrl.searchParams.get(queryParamKey);
    } catch (error) {
      console.error("Error reading parent query param:", error);
      return undefined;
    }
  }, [tag]);

  const defaultInitialEntries = useMemo((): string[] => {
    // If query param is provided, use it
    if (queryParamValue) {
      return [
        queryParamValue.startsWith("/")
          ? queryParamValue
          : "/" + queryParamValue,
      ];
    }
    // If initialEntries are provided, use them
    if (initialEntries && initialEntries.length > 0) {
      return initialEntries;
    }
    return ["/"];
  }, [initialEntries, queryParamValue]);

  return (
    <MemoryRouter initialEntries={defaultInitialEntries}>
      <ParentRouterSync />
      {children}
    </MemoryRouter>
  );
};

export default PluginRouter;
