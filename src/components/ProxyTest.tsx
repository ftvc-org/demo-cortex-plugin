import type React from "react";
import { useState, useMemo, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-themes-all";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cortexapps/react-plugin-ui";

import { usePluginContextProvider } from "./PluginContextProvider";
import { Section, Subsection, Heading } from "./UtilityComponents";
import HeadersPopover from "./HeadersPopover";
import JsonView from "./JsonView";

import "../baseStyles.css";

export const ProxyTest: React.FC = () => {
  const { apiBaseUrl, theme } = usePluginContextProvider();

  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Record<string, string>>({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  const [response, setResponse] = useState<object | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const errorText = useMemo(() => {
    if (!error) return null;
    try {
      return JSON.stringify(JSON.parse(error.message), null, 2);
    } catch (e) {
      return error.message;
    }
  }, [error]);

  const [body, setBody] = useState<object>({});
  const [bodyValue, setBodyValue] = useState<string>("{}");
  const [bodyError, setBodyError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const doHandleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
      ): Promise<void> => {
        const formData = new FormData(event.currentTarget);
        const url = formData.get("url-input") as string;

        setResponse(null);
        setError(null);

        const fetchOptions: RequestInit = {
          method,
          headers,
        };
        if (["PUT", "PATCH", "POST"].includes(method)) {
          fetchOptions.body = JSON.stringify(body);
        }

        try {
          const fetchResponse = await fetch(url, fetchOptions);
          const contentType = fetchResponse.headers.get("content-type");
          const data = contentType?.includes("application/json")
            ? await fetchResponse.json()
            : await fetchResponse.text();
          setResponse(data);
          setError(null);
        } catch (error) {
          console.error("error fetching", error);
          setError(error);
        }
      };

      void doHandleSubmit(event);
    },
    [method, headers, body]
  );

  const handleBodyChange = (value: string): void => {
    setBodyValue(value);
    try {
      const parsed = JSON.parse(value);
      setBody(parsed);
      setBodyError(null);
    } catch (e) {
      setBodyError("Invalid JSON");
    }
  };

  return (
    <Section className="min-h-[25rem]">
      <Subsection>
        <Heading>
          <CardTitle>Proxy Test</CardTitle>
        </Heading>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="flex flex-row gap-1 items-start justify-center align-center">
              <Select
                value={method}
                name="method-select"
                onValueChange={(value) => {
                  setMethod(value);
                }}
              >
                <SelectTrigger className="w-[10rem]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                size={100}
                id="url-input"
                name="url-input"
                placeholder="Type a URL to fetch"
                defaultValue={`${apiBaseUrl}/catalog?pageSize=10`}
              />
              <Button style={{ margin: "auto" }} type="submit">
                Fetch
              </Button>
              <HeadersPopover
                headers={headers}
                onSubmit={(newHeaders) => {
                  setHeaders(newHeaders);
                }}
              />
            </div>
          </div>
          {["PUT", "PATCH", "POST"].includes(method) && (
            <div className="mt-4">
              <label className="block mb-1 font-semibold">Request Body:</label>
              <CodeMirror
                value={bodyValue}
                height="200px"
                extensions={[json()]}
                theme={theme === "light" ? xcodeLight : xcodeDark}
                onChange={handleBodyChange}
              />
              {bodyError && (
                <span className="text-[var(--cortex-plugin-destructive)] text-xs mt-1 block">
                  {bodyError}
                </span>
              )}
            </div>
          )}
        </form>
      </Subsection>
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonView
              data={response}
              theme={theme === "light" ? "light" : "dark"}
            />
          </CardContent>
        </Card>
      )}
      {errorText && (
        <div className="card">
          <div className="card-header">Error</div>
          <div className="card-body">
            <pre>{errorText}</pre>
          </div>
        </div>
      )}
    </Section>
  );
};

export default ProxyTest;
