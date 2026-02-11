// import type React from "react";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import PluginProvider from "./RoutingPluginProvider";
// import ErrorBoundary from "./ErrorBoundary";
// import AppTabs from "./AppTabs";

// import "../baseStyles.css";

// const App: React.FC = () => {
//   const queryClient = new QueryClient();

//   return (
//     <ErrorBoundary>
//       <QueryClientProvider client={queryClient}>
//         <PluginProvider enableRouting initialEntries={["/basic"]}>
//           <AppTabs />
//         </PluginProvider>
//       </QueryClientProvider>
//     </ErrorBoundary>
//   );
// };

// export default App;

import React, { useEffect, useMemo, useState } from 'react';
import '@cortexapps/react-plugin-ui/index.css';
import { Tabs, Card, Button, Loader, Badge } from '@cortexapps/react-plugin-ui';
import { useEntityContext, fetchScorecardsForEntity, fetchEntityScoreForScorecard, reEvaluateScorecard } from './lib/cortex';
import type { EntityScore, ScorecardSummary } from 'types';

export default function App() {
  const entity = useEntityContext();
  const [loading, setLoading] = useState(true);
  const [scorecards, setScorecards] = useState<ScorecardSummary[]>([]);
  const [scores, setScores] = useState<Record<string, EntityScore>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!entity?.tag) return;
      setLoading(true);
      setError(null);
      try {
        const sc = await fetchScorecardsForEntity(entity.tag);
        if (cancelled) return;
        setScorecards(sc);

        const entries = await Promise.all(
          sc.map(async s => {
            const es = await fetchEntityScoreForScorecard(s.tag, entity.tag!);
            return es ? [s.tag, es] as const : null;
          })
        );
        if (cancelled) return;
        const byTag = Object.fromEntries(entries.filter(Boolean) as ReadonlyArray<[string, EntityScore]>);
        setScores(byTag);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [entity?.tag]);

  const hasAnyFailures = useMemo(() => {
    return Object.values(scores).some(es => es.rules.some(r => r.status === 'FAIL'));
  }, [scores]);

  if (!entity) return <div style={{ padding: 16 }}>No entity context.</div>;
  if (loading) return <div style={{ padding: 16 }}><Loader size="lg" /></div>;

  return (
    <div style={{ padding: 12 }}>
      <Card>
        <Card.Header>
          <Card.Title>
            {entity.name ?? entity.tag}
          </Card.Title>
          <Card.Actions>
            {hasAnyFailures ? (
              <>
                <Button appearance="primary" onClick={() => openFixNow(scores)}>Fix now</Button>
                <Button appearance="outline" onClick={() => openRequestExemption(scores)}>Request exemption</Button>
              </>
            ) : (
              <Button appearance="success" disabled>All checks passed</Button>
            )}
          </Card.Actions>
        </Card.Header>

        <Card.Content>
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="scorecards">Scorecards</Tabs.Trigger> {/* NEW TAB */}
            </Tabs.List>

            <Tabs.Content value="overview">
              <div style={{ paddingTop: 12 }}>
                {/* Your existing overview content */}
                Welcome to the plugin!
              </div>
            </Tabs.Content>

            <Tabs.Content value="scorecards">
              <div style={{ paddingTop: 12 }}>
                {error ? (
                  <div style={{ color: 'var(--cortex-color-danger)' }}>{error}</div>
                ) : (
                  <>
                    {scorecards.length === 0 && <div>No scorecards apply to this entity.</div>}
                    {scorecards.map(sc => {
                      const es = scores[sc.tag];
                      return (
                        <Card key={sc.tag} style={{ marginBottom: 12 }}>
                          <Card.Header>
                            <Card.Title>{sc.name}</Card.Title>
                            <Card.Actions>
                              <Button size="sm" onClick={() => doReevaluate(sc.tag, entity.tag!, setLoading)}>Re-evaluate</Button>
                            </Card.Actions>
                          </Card.Header>
                          <Card.Content>
                            {!es ? (
                              <div>No score yet.</div>
                            ) : (
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={{ textAlign: 'left' }}>Rule</th>
                                    <th>Status</th>
                                    <th>Level</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {es.rules.map(rule => (
                                    <tr key={rule.id ?? rule.title}>
                                      <td>{rule.title}</td>
                                      <td>
                                        {rule.status === 'PASS'
                                          ? <Badge appearance="success">PASS</Badge>
                                          : rule.status === 'FAIL'
                                            ? <Badge appearance="danger">FAIL</Badge>
                                            : <Badge>NOT EVALUATED</Badge>}
                                      </td>
                                      <td>{rule.level ?? '—'}</td>
                                      <td>
                                        {rule.status === 'FAIL' ? (
                                          <Button size="sm" onClick={() => openRuleFix(rule, sc, entity.tag!)}>
                                            Fix this rule
                                          </Button>
                                        ) : (
                                          <Button size="sm" disabled>OK</Button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </Card.Content>
                        </Card>
                      );
                    })}
                  </>
                )}
              </div>
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
    </div>
  );
}

function openFixNow(_scores: Record<string, EntityScore>) {
  // TODO: navigate to your internal workflow/runbook list, or open a modal
}

function openRequestExemption(_scores: Record<string, EntityScore>) {
  // TODO: deep link to Cortex UI Exemptions or call the Exemption API from here
  // Cortex docs explain rule exemptions and UI flow.
  // e.g., window.open('<your Cortex URL>/scorecards/<tag>', '_blank');
}

async function doReevaluate(scorecardTag: string, entityTag: string, setLoading: (b: boolean) => void) {
  try {
    setLoading(true);
    await reEvaluateScorecard(scorecardTag, entityTag);
    setTimeout(() => window.location.reload(), 1500);
  } finally {
    setLoading(false);
  }
}

function openRuleFix(_rule: EntityScore['rules'][number], _scorecard: ScorecardSummary, _entityTag: string) {
  // TODO: for a failed rule, guide the user to remediation steps,
  // e.g., open a TechDocs page or kick off a Cortex Workflow
}
