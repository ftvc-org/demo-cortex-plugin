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
import { useEffect, useState } from "react";

const SCORECARD_TAG = "empty-scorecard-with-levels"; 
// TODO: replace with your actual Scorecard tag

const EntityDetails: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag ?? "";

  const { entity, isLoading: isEntityLoading } = useEntityDescriptor({ entityTag });
  const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({ entityTag });
  const { customEvents, isLoading: isCustomEventsLoading } = useEntityCustomEvents({ entityTag });

  // -------------------------------
  // NEW: next-step state
  // -------------------------------
  const [nextSteps, setNextSteps] = useState<any | null>(null);
  const [isNextStepsLoading, setIsNextStepsLoading] = useState(false);
  const [nextStepsError, setNextStepsError] = useState<string | null>(null);

  // -------------------------------
  // NEW: fetch next steps
  // -------------------------------
  useEffect(() => {
    if (!entityTag) return;

    const fetchNextSteps = async () => {
      try {
        setIsNextStepsLoading(true);
        setNextStepsError(null);

        const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
          SCORECARD_TAG
        )}/next-steps?entityTag=${encodeURIComponent(entityTag)}`;

        // Cortex plugin fetch is auto‑proxied through the plugin proxy
        // which attaches Authorization headers.  [1](https://www.npmjs.com/package/@cortexapps/plugin-core/v/2.1.3)
        const response = await fetch(url);

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Error ${response.status}: ${body}`);
        }

        const json = await response.json(); // Shape documented by Scorecards API [2](https://docs.cortex.io/api/readme/scorecards)
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

  // -------------------------------
  // LOADING
  // -------------------------------
  if (isLoading) {
    return <Loader size="large" />;
  }

  // -------------------------------
  // NO ENTITY
  // -------------------------------
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

      {/* ------------------ NEW: NEXT STEPS ------------------ */}
      <div className="mt-4">
        <strong>Scorecard Next Steps (Scorecard: {SCORECARD_TAG}):</strong>
      </div>

      {nextStepsError && (
        <div style={{ color: "crimson" }}>
          Failed to load next steps: {nextStepsError}
        </div>
      )}

      {nextSteps && (
        <JsonView data={nextSteps} theme={context.theme} />
      )}
    </Section>
  );
};

export default EntityDetails;
