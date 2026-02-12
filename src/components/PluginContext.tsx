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

// src/index.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CortexApi } from '@cortexapps/plugin-core';

// TODO: set your Scorecard tag here (or make it configurable via query param / small UI).
const SCORECARD_TAG = 'production-readiness-scorecard';

type NextStep = {
  currentLevel?: { level: { name: string; number: number } };
  nextLevel?: { level: { name: string; number: number } };
  rulesToComplete: { identifier: string; title: string; description?: string; expression?: string }[];
};

const App: React.FC = () => {
  const [entityTag, setEntityTag] = useState<string | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1) Get context (entity tag)
        const ctx = await CortexApi.getContext();
        const { entity } = ctx;
        const tagFromContext = entity?.tag; // present in entity context pages
        if (!tagFromContext) {
          setError('No entity context found. Open this plugin from an entity page or supply an entityTag.');
          return;
        }
        setEntityTag(tagFromContext);

        // 2) Fetch next steps for this entity & scorecard
        setLoading(true);
        const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
          SCORECARD_TAG
        )}/next-steps?entityTag=${encodeURIComponent(tagFromContext)}`;

        const res = await fetch(url, {
          // No need to set Authorization here; proxy injects it if your proxy rule is configured.
          method: 'GET',
        });

        if (res.status === 404) {
          // Scorecard not found (or mis-tagged)
          setError(`Scorecard '${SCORECARD_TAG}' or entity '${tagFromContext}' not found (404).`);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Cortex API error ${res.status}: ${body}`);
        }

        const json = await res.json() as { nextSteps: NextStep[] };
        setNextSteps(json.nextSteps || []);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading next steps…</div>;
  if (error)   return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;
  if (!nextSteps) return null;

  return (
    <div style={{ padding: 16 }}>
      <h2>Scorecard next steps</h2>
      <div style={{ marginBottom: 8, color: '#666' }}>
        <strong>Scorecard:</strong> {SCORECARD_TAG} &nbsp;|&nbsp; <strong>Entity:</strong> {entityTag}
      </div>

      {nextSteps.length === 0 ? (
        <div>🎉 No outstanding rules — you’re at the highest level.</div>
      ) : (
        nextSteps.map((ns, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Current level:</strong> {ns.currentLevel?.level.name} &nbsp;→&nbsp;
              <strong>Next level:</strong> {ns.nextLevel?.level.name}
            </div>
            <ol style={{ marginTop: 8 }}>
              {ns.rulesToComplete.map(rule => (
                <li key={rule.identifier} style={{ marginBottom: 6 }}>
                  <div><strong>{rule.title || rule.identifier}</strong></div>
                  {rule.description && <div style={{ color: '#555' }}>{rule.description}</div>}
                  {rule.expression && (
                    <pre style={{
                      background: '#f9f9f9',
                      padding: 8,
                      borderRadius: 6,
                      overflowX: 'auto'
                    }}>{rule.expression}</pre>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);



