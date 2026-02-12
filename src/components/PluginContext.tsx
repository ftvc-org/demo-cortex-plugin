// import type React from "react";

// import { CardTitle } from "@cortexapps/react-plugin-ui";

// import { Heading, Section, Subsection } from "./UtilityComponents";
// import JsonView from "./JsonView";

// import { usePluginContextProvider } from "./PluginContextProvider";

// const PluginContext: React.FC = () => {
//   const context = usePluginContextProvider();

//   return (
//     <Section>
//       <Heading>
//         <CardTitle>Plugin Context</CardTitle>
//       </Heading>
//       <Subsection className="space-y-4">
//         <div>
//           Below is the plugin context object. This object is returned from the
//           usePluginContextProvider hook available in the PluginContextProvider
//           component.
//         </div>
//         {context && (
//           <div>
//             <JsonView data={context} theme={context.theme} />
//           </div>
//         )}
//       </Subsection>
//     </Section>
//   );
// };

// export default PluginContext;


// components/NextStepsButtons.tsx
import React from "react";
import useScorecardNextSteps, {
  RuleToComplete,
} from "../hooks/useScorecardNextSteps";

// components/NextStepsDebugPanel.tsx
import React from "react";
import useCortexNextStepsUrlAndResponse, {
  RuleToComplete,
} from "../hooks/useCortexNextStepsUrlAndResponse";

export interface NextStepsDebugPanelProps {
  scorecardTag: string;
  /** If omitted, hook will use context.entity.tag */
  entityTag?: string;
  /** Bearer token */
  token: string;
  /** Optional click handler for rule buttons */
  onRuleClick?: (rule: RuleToComplete) => void;
}

const NextStepsDebugPanel: React.FC<NextStepsDebugPanelProps> = ({
  scorecardTag,
  entityTag,
  token,
  onRuleClick,
}) => {
  const {
    url,
    data,
    rulesToComplete,
    currentLevel,
    nextLevel,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCortexNextStepsUrlAndResponse(
    { scorecardTag, entityTag },
    { token }
  );

  if (isLoading) return <div>Loading next steps…</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Exact URL being called */}
      <div>
        <strong>URL:</strong>{" "}
        <code style={{ wordBreak: "break-all" }}>{url || "—"}</code>
        <button style={{ marginLeft: 8 }} onClick={refetch}>
          Refresh
        </button>
        {isFetching && <small style={{ marginLeft: 8 }}>Refreshing…</small>}
      </div>

      {/* Level summary */}
      {(currentLevel || nextLevel) && (
        <div>
          <strong>Level:</strong>{" "}
          {currentLevel?.name ?? "—"} ({currentLevel?.number ?? "—"}) →{" "}
          {nextLevel?.name ?? "—"} ({nextLevel?.number ?? "—"})
        </div>
      )}

      {/* Rule buttons using title as label */}
      <div>
        <strong>Rules to complete ({rulesToComplete.length})</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {rulesToComplete.map((rule) => (
            <button
              key={rule.identifier}
              title={rule.description ?? rule.expression ?? rule.title}
              onClick={() => (onRuleClick ? onRuleClick(rule) : console.log("Rule:", rule))}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d0d7de",
                background: "#f6f8fa",
                cursor: "pointer",
              }}
            >
              {rule.title}
            </button>
          ))}
          {rulesToComplete.length === 0 && <div>No pending rules 🎉</div>}
        </div>
      </div>

      {/* Pretty JSON response */}
      <details open>
        <summary><strong>Raw response</strong></summary>
        <pre
          style={{
            background: "#0b1021",
            color: "#e6edf3",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
{JSON.stringify(data ?? {}, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default NextStepsDebugPanel;
