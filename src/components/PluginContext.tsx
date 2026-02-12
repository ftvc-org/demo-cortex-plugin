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

export interface NextStepsButtonsProps {
  /** Scorecard tag, e.g. "empty-scorecard-with-levels" */
  scorecardTag: string;
  /** Entity tag, e.g. "maven-service" */
  entityTag: string;
  /** Cortex Bearer token */
  token: string;
  /** Optional click handler when a rule button is clicked */
  onRuleClick?: (rule: RuleToComplete) => void;
}

const NextStepsButtons: React.FC<NextStepsButtonsProps> = ({
  scorecardTag,
  entityTag,
  token,
  onRuleClick,
}) => {
  const {
    rulesToComplete,
    currentLevel,
    nextLevel,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useScorecardNextSteps(
    { scorecardTag, entityTag },
    { token }
  );

  if (isLoading) return <div>Loading next steps…</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleClick = (rule: RuleToComplete) => {
    if (onRuleClick) {
      onRuleClick(rule);
    } else {
      // Default: log or navigate if you have a route per rule
      // e.g., window.open to docs or config page
      console.log("Rule clicked:", rule);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {(currentLevel || nextLevel) && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <strong>Level:</strong>
          <span>
            {currentLevel?.name ?? "—"} ({currentLevel?.number ?? "—"})
          </span>
          <span>→</span>
          <span>
            {nextLevel?.name ?? "—"} ({nextLevel?.number ?? "—"})
          </span>
          {isFetching && <small> Refreshing…</small>}
          <button onClick={refetch} style={{ marginLeft: "auto" }}>
            Refresh
          </button>
        </div>
      )}

      {rulesToComplete.length === 0 ? (
        <div>No rules to complete 🎉</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {rulesToComplete.map((rule) => (
            <button
              key={rule.identifier}
              onClick={() => handleClick(rule)}
              title={rule.description ?? rule.expression ?? rule.title}
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
        </div>
      )}
    </div>
  );
};

export default NextStepsButtons;
