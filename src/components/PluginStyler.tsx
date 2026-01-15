import type React from "react";
import { usePluginContextProvider } from "./PluginContextProvider";

interface PluginStylerProps {
  children: React.ReactNode;
}

const PluginStyler: React.FC<PluginStylerProps> = ({ children }) => {
  const context = usePluginContextProvider();
  const style = context?.style;

  // Build an inline style object that includes your CSS variables
  const inlineStyles: React.CSSProperties = {};

  if (style) {
    Object.entries(style).forEach(([key, value]) => {
      // CSS variables can be directly set as properties on the style object
      inlineStyles[key as any] = value;
      document.body.style.setProperty(key, value);
      document.documentElement.style.setProperty(key, value);
      if (context?.theme) {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(context.theme);
      }
    });
  }

  return <div style={inlineStyles}>{children}</div>;
};

export default PluginStyler;
