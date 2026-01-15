import type React from "react";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-themes-all";

interface JsonViewProps {
  data: any;
  theme: string;
}

export const JsonView: React.FC<JsonViewProps> = ({ data, theme }) => {
  const isText = typeof data === "string";
  const isObject = typeof data === "object" && data !== null;

  if (!isText && !isObject) {
    return <div>Invalid JSON data</div>;
  }
  if (isText) {
    return (
      <CodeMirror
        value={data}
        extensions={[EditorView.lineWrapping]}
        readOnly
        height="auto"
        theme={theme === "light" ? xcodeLight : xcodeDark}
        width="100%"
      />
    );
  }

  return (
    <CodeMirror
      value={JSON.stringify(data, null, 2)}
      extensions={[json()]}
      readOnly
      height="auto"
      theme={theme === "light" ? xcodeLight : xcodeDark}
      width="100%"
    />
  );
};

export default JsonView;
