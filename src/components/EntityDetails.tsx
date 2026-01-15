import type React from "react";

import { CardTitle, Loader } from "@cortexapps/react-plugin-ui";

import { usePluginContextProvider } from "./PluginContextProvider";
import useEntityDescriptor from "../hooks/useEntityDescriptor";
import useEntityCustomData from "../hooks/useEntityCustomData";
import useEntityCustomEvents from "../hooks/useEntityCustomEvents";

import { Heading, Section, Subsection } from "./UtilityComponents";
import JsonView from "./JsonView";

const EntityDetails: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag ?? "";
  const { entity, isLoading: isEntityLoading } = useEntityDescriptor({
    entityTag,
  });
  const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({
    entityTag,
  });
  const { customEvents, isLoading: isCustomEventsLoading } =
    useEntityCustomEvents({ entityTag });

  const isLoading =
    isEntityLoading || isCustomDataLoading || isCustomEventsLoading;

  if (isLoading) {
    return <Loader size="large" />;
  }

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
        Below are the entity descriptor, entity custom data and entity custom
        events for the {context?.entity?.type} {entityTag}. These are fetched
        from the Cortex REST API and returned by the useEntityDescriptor,
        useEntityCustomData and useEntityCustomEvents hooks.
      </div>
      <div className="mt-4">
        <strong>Entity Descriptor:</strong>
      </div>
      <JsonView data={entity} theme={context.theme} />
      {customData && (
        <>
          <div className="mt-4">
            <strong>Custom Data:</strong>
          </div>
          <JsonView data={customData} theme={context.theme} />
        </>
      )}
      {customEvents && (
        <>
          <div className="mt-4">
            <strong>Custom Events:</strong>
          </div>
          <JsonView data={customEvents} theme={context.theme} />
        </>
      )}
    </Section>
  );
};

export default EntityDetails;
