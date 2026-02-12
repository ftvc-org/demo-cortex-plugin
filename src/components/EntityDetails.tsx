// import type React from "react";

// import { CardTitle, Loader } from "@cortexapps/react-plugin-ui";

// import { usePluginContextProvider } from "./PluginContextProvider";
// import useEntityDescriptor from "../hooks/useEntityDescriptor";
// import useEntityCustomData from "../hooks/useEntityCustomData";
// import useEntityCustomEvents from "../hooks/useEntityCustomEvents";

// import { Heading, Section, Subsection } from "./UtilityComponents";
// import JsonView from "./JsonView";

// const EntityDetails: React.FC = () => {
//   const context = usePluginContextProvider();
//   const entityTag = context?.entity?.tag ?? "";
//   const { entity, isLoading: isEntityLoading } = useEntityDescriptor({
//     entityTag,
//   });
//   const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({
//     entityTag,
//   });
//   const { customEvents, isLoading: isCustomEventsLoading } =
//     useEntityCustomEvents({ entityTag });

//   const isLoading =
//     isEntityLoading || isCustomDataLoading || isCustomEventsLoading;

//   if (isLoading) {
//     return <Loader size="large" />;
//   }

//   if (!entityTag) {
//     return (
//       <Section>
//         <Heading>Entity Details</Heading>
//         <Subsection>No entity selected.</Subsection>
//       </Section>
//     );
//   }

//   return (
//     <Section>
//       <Heading>
//         <CardTitle>Entity Details</CardTitle>
//       </Heading>
//       <div>
//         Below are the entity descriptor, entity custom data and entity custom
//         events for the {context?.entity?.type} {entityTag}. These are fetched
//         from the Cortex REST API and returned by the useEntityDescriptor,
//         useEntityCustomData and useEntityCustomEvents hooks.
//       </div>
//       <div className="mt-4">
//         <strong>Entity Descriptor:</strong>
//       </div>
//       <JsonView data={entity} theme={context.theme} />
//       {customData && (
//         <>
//           <div className="mt-4">
//             <strong>Custom Data:</strong>
//           </div>
//           <JsonView data={customData} theme={context.theme} />
//         </>
//       )}
//       {customEvents && (
//         <>
//           <div className="mt-4">
//             <strong>Custom Events:</strong>
//           </div>
//           <JsonView data={customEvents} theme={context.theme} />
//         </>
//       )}
//     </Section>
//   );
// };

// export default EntityDetails;


import type React from "react";

import { CardTitle, Loader } from "@cortexapps/react-plugin-ui";

import { usePluginContextProvider } from "./PluginContextProvider";
import useEntityDescriptor from "../hooks/useEntityDescriptor";
import useEntityCustomData from "../hooks/useEntityCustomData";
import useEntityCustomEvents from "../hooks/useEntityCustomEvents";

import { Heading, Section, Subsection } from "./UtilityComponents";
import JsonView from "./JsonView";
import { useEffect, useMemo, useState } from "react";

const SCORECARD_TAG = "empty-scorecard-with-levels"; 
// TODO: replace with your actual Scorecard tag

type RuleToComplete = {
  identifier: string;
  title?: string;
  description?: string;
  expression?: string;
};

type NextStepGroup = {
  currentLevel?: { level: { name: string; number: number } };
  nextLevel?: { level: { name: string; number: number } };
  rulesToComplete: RuleToComplete[];
};

type NextStepsResponse = {
  nextSteps: NextStepGroup[];
};

const EntityDetails: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag ?? "";

  const { entity, isLoading: isEntityLoading } = useEntityDescriptor({ entityTag });
  const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({ entityTag });
  const { customEvents, isLoading: isCustomEventsLoading } = useEntityCustomEvents({ entityTag });

  // next-steps state
  const [nextSteps, setNextSteps] = useState<NextStepsResponse | null>(null);
  const [isNextStepsLoading, setIsNextStepsLoading] = useState(false);
  const [nextStepsError, setNextStepsError] = useState<string | null>(null);

  // NEW: which rule is selected (to show details below the buttons)
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Fetch next steps
  useEffect(() => {
    if (!entityTag) return;

    const fetchNextSteps = async () => {
      try {
        setIsNextStepsLoading(true);
        setNextStepsError(null);
        setSelectedRuleId(null);

        const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
          SCORECARD_TAG
        )}/next-steps?entityTag=${encodeURIComponent(entityTag)}`;

        // In Cortex plugins, fetch() is proxied and authorized automatically. [2](https://www.npmjs.com/package/@cortexapps/plugin-core/v/2.1.3)
        const response = await fetch(url);

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Error ${response.status}: ${body}`);
        }

        const json = (await response.json()) as NextStepsResponse; // per Scorecards API [1](https://docs.cortex.io/api/readme/scorecards)
        setNextSteps(json);
      } catch (err: any) {
        setNextStepsError(err?.message ?? "Unknown error");
      } finally {
        setIsNextStepsLoading(false);
      }
    };

    fetchNextSteps();
  }, [entityTag]);

  const isLoading =
    isEntityLoading ||
    isCustomDataLoading ||
    isCustomEventsLoading ||
    isNextStepsLoading;

  // convenience: flatten all rules from all next-step groups
  const allRules = useMemo<RuleToComplete[]>(() => {
    if (!nextSteps?.nextSteps) return [];
    return nextSteps.nextSteps.flatMap(group => group.rulesToComplete || []);
  }, [nextSteps]);

  // the currently selected rule details
  const selectedRule = useMemo(() => {
    if (!selectedRuleId) return null;
    return allRules.find(r => (r.identifier || r.title) === selectedRuleId) || null;
  }, [selectedRuleId, allRules]);

  // LOADING
  if (isLoading) {
    return <Loader size="large" />;
  }

  // NO ENTITY
  if (!entityTag) {
    return (
      <Section>
        <Heading>Entity Details</Heading>
        <Subsection>No entity selected.</Subsection>
      </Section>
    );
  }

  return (
    <Section>
      <Heading>
        <CardTitle>Entity Details</CardTitle>
      </Heading>

      <div>
        Below are the entity descriptor, custom data, custom events, and
        scorecard next steps for the {context?.entity?.type} <strong>{entityTag}</strong>.
        These are fetched from the Cortex REST API.
      </div>

      {/* ------------------ ENTITY DESCRIPTOR ------------------ */}
      <div className="mt-4">
        <strong>Entity Descriptor:</strong>
      </div>
      <JsonView data={entity} theme={context.theme} />

      {/* ------------------ CUSTOM DATA ------------------ */}
      {customData && (
        <>
          <div className="mt-4">
            <strong>Custom Data:</strong>
          </div>
          <JsonView data={customData} theme={context.theme} />
        </>
      )}

      {/* ------------------ CUSTOM EVENTS ------------------ */}
      {customEvents && (
        <>
          <div className="mt-4">
            <strong>Custom Events:</strong>
          </div>
          <JsonView data={customEvents} theme={context.theme} />
        </>
      )}

      {/* ------------------ NEXT STEPS ------------------ */}
      <div className="mt-4">
        <strong>Scorecard Next Steps (Scorecard: {SCORECARD_TAG}):</strong>
      </div>

      {nextStepsError && (
        <div style={{ color: "crimson" }}>
          Failed to load next steps: {nextStepsError}
        </div>
      )}

      {/* Buttons with rule titles */}
      {allRules.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allRules.map((rule) => {
            const id = rule.identifier || rule.title || "";
            const label = rule.title || rule.identifier || "Untitled rule";
            const isActive = selectedRuleId === id;

            return (
              <button
                key={id}
                onClick={() => setSelectedRuleId(isActive ? null : id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: isActive ? "2px solid #4a74f5" : "1px solid #ccc",
                  background: isActive ? "#eef2ff" : "#fff",
                  cursor: "pointer",
                  fontSize: 13
                }}
                title={rule.description || label}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected rule details (toggle display) */}
      {selectedRule && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafafa"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {selectedRule.title || selectedRule.identifier}
          </div>
          {selectedRule.description && (
            <div style={{ marginBottom: 6 }}>{selectedRule.description}</div>
          )}
          {selectedRule.expression && (
            <pre
              style={{
                background: "#f5f5f5",
                padding: 8,
                borderRadius: 6,
                overflowX: "auto",
                margin: 0
              }}
            >
              {selectedRule.expression}
            </pre>
          )}
        </div>
      )}

      {/* Raw JSON (optional—kept for debugging/visibility) */}
      {nextSteps && (
        <>
          <div className="mt-4">
            <strong>Raw Next Steps JSON:</strong>
          </div>
          <JsonView data={nextSteps} theme={context.theme} />
        </>
      )}
    </Section>
  );
};

export default EntityDetails;
