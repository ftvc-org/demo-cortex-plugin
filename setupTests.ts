import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from "util";

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

const mockContext = {
  apiBaseUrl: "https://api.cortex.dev",
  entity: {
    definition: null,
    description: null,
    groups: null,
    name: "Inventory planner",
    ownership: {
      emails: [
        {
          description: null,
          email: "nikhil@cortex.io",
          inheritance: null,
          id: 1,
        },
      ],
    },
    tag: "inventory-planner",
    type: "service",
  },
  location: "ENTITY",
  user: {
    email: "ganesh@cortex.io",
    name: "Ganesh Datta",
    role: "ADMIN",
  },
  tag: "example",
};

jest.mock("@cortexapps/plugin-core/components", () => {
  const originalModule = jest.requireActual(
    "@cortexapps/plugin-core/components"
  );
  return {
    ...originalModule,
    usePluginContext: () => {
      return mockContext;
    },
    PluginProvider: ({ children }) => {
      return children;
    },
  };
});

jest.mock("@cortexapps/plugin-core", () => {
  const originalModule = jest.requireActual("@cortexapps/plugin-core");
  return {
    ...originalModule,
    CortexApi: {
      ...originalModule.CortexApi,
      getContext: async () => {
        return mockContext;
      },
    },
  };
});
