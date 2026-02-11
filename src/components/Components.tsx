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
  return ( 
  <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <button className="btn">Button One</button>
        <button className="btn">Button Two</button>
        <button className="btn">Button Three</button>
        <button className="btn">Button Four</button>
      </div>
  </div>
  );
};

export default Components;
