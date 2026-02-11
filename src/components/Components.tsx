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
    <div className="flex flex-col gap-4">
      <Section>
        <Heading>Badges Sample</Heading>
        <Subsection className="flex-row flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="secondary_outline">Secondary Outline</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="destructive_outline">Destructive Outline</Badge>
          <Badge variant="prominent_outline">Prominent Outline</Badge>
        </Subsection>
      </Section>

      <Section>
        <Heading>Buttons</Heading>
        <Subsection className="flex-row flex-wrap gap-2">
          <Button>Normal button</Button>
          <Button disabled>Disabled button</Button>
          <Button variant="secondary">Secondary button</Button>
          <Button variant="destructive">Destructive button</Button>
          <Button variant="ghost">Ghost button</Button>
          <Button variant="link">Link button</Button>
          <Button variant="outline">Outline button</Button>
        </Subsection>
      </Section>
      <Section>
        <Heading>Breadcrumbs</Heading>
        <Subsection className="">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Subsection>
      </Section>

      <Section>
        <Heading>Cards</Heading>
        <Subsection>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </Subsection>
      </Section>
      <Section>
        <Heading>Checkboxes</Heading>
        <Subsection>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={checked}
              onCheckedChange={() => {
                setChecked(!checked);
              }}
              id="terms"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Accept terms and conditions
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox disabled id="disabled-checkbox" />
            <label
              htmlFor="disabled-checkbox"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Disabled
            </label>
          </div>
        </Subsection>
      </Section>

      <Section>
        <Heading>Dialogs</Heading>
        <Subsection>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Show Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog with Close Button</DialogTitle>
                <DialogDescription>
                  This dialog includes an explicit close button.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Some content here...</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button>Action</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Subsection>
      </Section>
      <Section>
        <Heading>Inputs and Labels</Heading>
        <Subsection>
          <div className="flex flex-col gap-1">
            <Label htmlFor="normal-input">Normal label</Label>
            <Input id="normal-input" placeholder="Normal input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="disabled-input">Disabled label</Label>
            <Input id="disabled-input" placeholder="Disabled input" disabled />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="disabled-input">Error label</Label>
            <Input
              id="error-input"
              onChange={() => {}}
              value="Error input"
              variant="error"
            />
          </div>
        </Subsection>
      </Section>
      <Section>
        <Heading>Loaders</Heading>
        <Subsection>
          <Loader size="large" />
          <Loader size="medium" />
          <Loader size="small" />
          <Loader size="xs" />
        </Subsection>
      </Section>
      <Section>
        <Heading>Progress bars</Heading>
        <Subsection>
          <Progress value={75} />
        </Subsection>
      </Section>
      <Section>
        <Heading>Selects</Heading>
        <Subsection>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Food with groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Vegetables</SelectLabel>
                <SelectItem value="carrot">Carrot</SelectItem>
                <SelectItem value="potato">Potato</SelectItem>
                <SelectItem value="broccoli">Broccoli</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Subsection>
      </Section>
      <Section>
        <Heading>Tabs</Heading>
        <Subsection>See outer component for tab example</Subsection>
      </Section>
      <Section>
        <Heading>Typeahead</Heading>
        <Subsection>
          <div className="flex gap-1">
            <span>Selected values</span>
            {values.map((val, idx) => (
              <Badge key={idx}>{val}</Badge>
            ))}
          </div>
          <Typeahead
            placeholder="Pick a framework"
            value={values}
            onValueChange={(option) => {
              setValues((v) => {
                if (v.includes(option.value)) {
                  return v.filter((value) => value !== option.value);
                }
                return [...v, option.value];
              });
            }}
            options={FRAMEWORKS}
          >
            <Input className="border-[var(--cortex-plugin-border)]" />
          </Typeahead>
        </Subsection>
      </Section>
    </div>
  );
};

export default Components;
