import type React from "react";

import { CardTitle } from "@cortexapps/react-plugin-ui";

import { Heading, Section, Subsection } from "./UtilityComponents";
import JsonView from "./JsonView";

import { usePluginContextProvider } from "./PluginContextProvider";

const PluginContext: React.FC = () => {
  const context = usePluginContextProvider();

  return (
    <Section>
      <Heading>
        <CardTitle>Plugin Context</CardTitle>
      </Heading>
      <Subsection className="space-y-4">
        <div>
          Below is the plugin context object. This object is returned from the
          usePluginContextProvider hook available in the PluginContextProvider
          component.
        </div>
        {context && (
          <div>
            <JsonView data={context} theme={context.theme} />
          </div>
        )}
      </Subsection>
    </Section>
  );
};

export default PluginContext;





