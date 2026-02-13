import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  // If these exist in your UI package:
  // Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@cortexapps/react-plugin-ui";

import Components from "./Components";
import PluginContext from "./PluginContext";
import EntityDetails from "./EntityDetails";
import ColorSwatches from "./ColorSwatches";
import ProxyTest from "./ProxyTest";

import "../baseStyles.css";
import OnboardingScorecard from "./OnboardingScorecard";

interface TabRoute {
  label: string;
  path: string;
  element: JSX.Element;
}

export const AppTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabRoutes: TabRoute[] = [
    { label: "Test Scorecard", path: "/basic", element: <Components /> },
    { label: "Code Quality", path: "/context", element: <CodeQuality /> },
    // { label: "Entity", path: "/entity", element: <EntityDetails /> },
    // { label: "Colors", path: "/colors", element: <ColorSwatches /> },
    // { label: "Proxy", path: "/proxy", element: <ProxyTest /> },
  ];

  const currentPath =
    tabRoutes.find(r => r.path === location.pathname)?.path ?? tabRoutes[0].path;

  const activeRoute =
    tabRoutes.find(r => r.path === currentPath) ?? tabRoutes[0];

  return (
    <div className="flex flex-col p-1">
      <Card>
        <div className="p-3">
          {/* Replace below with your library's Select/Dropdown components if available */}
          {/* Example with Radix-like API */}
          {/* 
          <Select value={currentPath} onValueChange={(value) => navigate(value)}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {tabRoutes.map((route, idx) => (
                <SelectItem key={idx} value={route.path}>
                  {route.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          */}
          
          {/* Fallback simple select if your UI kit doesn't have Select */}
          <select
            className="border rounded px-2 py-1 text-sm"
            value={currentPath}
            onChange={(e) => navigate(e.target.value)}
          >
            {tabRoutes.map((route, idx) => (
              <option key={idx} value={route.path}>
                {route.label}
              </option>
            ))}
          </select>
        </div>

        <CardContent className="pt-0">
          <div style={{ minHeight: "100%" }}>{activeRoute.element}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppTabs;