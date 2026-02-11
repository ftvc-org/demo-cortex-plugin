import type React from "react";
import { useState } from "react";

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Loader,
  Progress,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Typeahead,
} from "@cortexapps/react-plugin-ui";

import { Heading, Section, Subsection } from "./UtilityComponents";

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "wordpress",
    label: "WordPress",
  },
  {
    value: "express.js",
    label: "Express.js",
  },
  {
    value: "nest.js",
    label: "Nest.js",
  },
  // filler to overflow
  ...new Array(10).fill(null).map((_, index) => ({
    value: `some-framework-${index}`,
    label: `Some Framework ${index}`,
  })),
];

export const Components: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [values, setValues] = useState<string[]>([]);
  
  const onDashboard = () => alert("Dashboard clicked");
  const onAnalytics = () => console.log("Analytics clicked");
  const onSettings = () => {
    // Example: open a new tab or navigate in-app
    window.open("https://example.com/settings", "_blank");
  };
  const onReports = () => alert("Reports clicked");

  return ( 
      <div
          className="twp-root"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))",
            padding: 16,
          }}
        
      >
      <Card
        className="w-[320px]"
        style={{
          borderRadius: 12,
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)",
          background: "#fff", // keeps it readable in both light/dark themes injected by Cortex
        }}
        >
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Button onClick={onDashboard}>Add .fmk file</Button>
            <Button onClick={onAnalytics}>
              Protect Main Branch
            </Button>
            <Button onClick={onSettings}>
              Add README.md file
            </Button>
            <Button onClick={onReports}>
              Add Owners
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>   
  );
};

export default Components;
