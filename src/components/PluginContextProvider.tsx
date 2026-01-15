import type React from "react";
import { createContext, useContext } from "react";
import usePluginContext, {
  type IPluginContext,
} from "../hooks/usePluginContext";

const AltPluginContext = createContext<IPluginContext | null>(null);

export const usePluginContextProvider = (): IPluginContext => {
  const context = useContext(AltPluginContext);
  if (!context) {
    throw new Error(
      "usePluginContextProvider must be used within a PluginContextProvider"
    );
  }
  return context;
};

export interface PluginContextProviderProps {
  children: React.ReactNode;
  loaderComponent?: React.ReactElement;
}

export const PluginContextProvider: React.FC<PluginContextProviderProps> = ({
  children,
  loaderComponent,
}) => {
  const context = usePluginContext();

  if (!context) {
    return loaderComponent ?? <div>Loading PluginContext...</div>;
  }

  return (
    <AltPluginContext.Provider value={context}>
      {children}
    </AltPluginContext.Provider>
  );
};
