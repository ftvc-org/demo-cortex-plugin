import type React from "react";

import { CardTitle, Loader } from "@cortexapps/react-plugin-ui";

import { usePluginContextProvider } from "./PluginContextProvider";
import useEntityDescriptor from "../hooks/useEntityDescriptor";
import useEntityCustomData from "../hooks/useEntityCustomData";
import useEntityCustomEvents from "../hooks/useEntityCustomEvents";

import { Heading, Section, Subsection } from "./UtilityComponents";
import JsonView from "./JsonView";
import { useEffect, useMemo, useState } from "react";

// -------------------------------
// CONFIG: update these for your env
// -------------------------------
const SCORECARD_TAG = "empty-scorecard-with-levels";  // scorecard tag to evaluate
const GITHUB_OWNER  = "ftvc-org";            // <-- set
const GITHUB_REPO   = "sample-java-ab";                   // <-- set
const BRANCH_NAME   = "main";                        // <-- protect this branch

// -------------------------------
// TYPES for next-steps
// -------------------------------
type RuleToComplete = {
  identifier: string;
  title?: string;
  description?: string | null;
  expression?: string | null;
};

type NextStepGroup = {
  currentLevel?: { level: { name: string; number: number } };
  nextLevel?:   { level: { name: string; number: number } };
  rulesToComplete: RuleToComplete[];
};

type NextStepsResponse = {
  nextSteps: NextStepGroup[];
};

const EntityDetails: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag ?? "";

  // (Keep your existing detail hooks if you still want them)
  const { entity, isLoading: isEntityLoading } = useEntityDescriptor({ entityTag });
  const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({ entityTag });
  const { customEvents, isLoading: isCustomEventsLoading } = useEntityCustomEvents({ entityTag });

  // next-steps state
  const [nextSteps, setNextSteps] = useState<NextStepsResponse | null>(null);
  const [isNextStepsLoading, setIsNextStepsLoading] = useState(false);
  const [nextStepsError, setNextStepsError] = useState<string | null>(null);

  // selection + action status
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // -------------------------------
  // Cortex helpers
  // -------------------------------
  const fetchNextSteps = async (): Promise<NextStepsResponse> => {
    const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
      SCORECARD_TAG
    )}/next-steps?entityTag=${encodeURIComponent(entityTag)}`;
    const res = await fetch(url); // proxied by Cortex plugin runtime
    if (!res.ok) throw new Error(`Next-steps error ${res.status}: ${await res.text()}`);
    return (await res.json()) as NextStepsResponse; // per Scorecards API
  };

  const evaluateScorecard = async () => {
    const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
      SCORECARD_TAG
    )}/entity/${encodeURIComponent(entityTag)}/scores`;
    const res = await fetch(url, { method: "POST" }); // 200 or 409 (already evaluating)
    if (res.status === 409) return;
    if (!res.ok) throw new Error(`Evaluate error ${res.status}: ${await res.text()}`);
  };

  // -------------------------------
  // GitHub: Branch Protection
  // -------------------------------
  // PUT /repos/{owner}/{repo}/branches/{branch}/protection
  // See REST API docs for schema & headers. Requires admin.  (Use proxy to inject token+version header)
  const ensureBranchProtection = async () => {
    const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(
      GITHUB_REPO
    )}/branches/${encodeURIComponent(BRANCH_NAME)}/protection`;

    // Minimal, sensible defaults; extend as needed
    const policy = {
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false
      },
      required_conversation_resolution: true,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify(policy)
    });
    if (!res.ok) throw new Error(`Branch protection error ${res.status}: ${await res.text()}`);
    return res.json();
  };

  // -------------------------------
  // Poll until fresh next steps are available / empty
  // -------------------------------
  const pollNextStepsUntilUpdated = async (maxAttempts = 10, intervalMs = 1500) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const latest = await fetchNextSteps();
      setNextSteps(latest);

      const remaining =
        latest.nextSteps?.reduce((acc, g) => acc + (g.rulesToComplete?.length || 0), 0) || 0;

      if (remaining === 0) return latest; // completed
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    // final read
    return await fetchNextSteps();
  };

  // -------------------------------
  // One-click handler
  // -------------------------------
  const handleRuleClick = async (rule: RuleToComplete) => {
    if (isRunningAction) return;

    const id = rule.identifier || rule.title || null;
    setSelectedRuleId(id);
    setIsRunningAction(true);

    try {
      // 1) If title is "Branch Protection" → apply protection on 'main'
      if ((rule.title || "").trim().toLowerCase() === "branch protection") {
        setActionStatus(`Applying branch protection to ${GITHUB_OWNER}/${GITHUB_REPO}@${BRANCH_NAME}…`);
        await ensureBranchProtection(); // GitHub branch protection  [1](https://docs.cortex.io/streamline/plugins)
      }

      // 2) Re-evaluate scorecard
      setActionStatus("Triggering scorecard evaluation…");
      await evaluateScorecard(); // Cortex evaluate  [3](https://www.codegenes.net/blog/basic-http-and-bearer-token-authentication/)

      // 3) Poll for fresh next steps
      setActionStatus("Refreshing next steps…");
      await pollNextStepsUntilUpdated();

      setActionStatus("Done.");
    } catch (e: any) {
      setActionStatus(`Failed: ${e?.message ?? e}`);
    } finally {
      setIsRunningAction(false);
      setTimeout(() => setActionStatus(null), 2000);
    }
  };

  // Initial load
  useEffect(() => {
    if (!entityTag) return;
    (async () => {
      try {
        setIsNextStepsLoading(true);
        setNextStepsError(null);
        setSelectedRuleId(null);
        const json = await fetchNextSteps();
        setNextSteps(json);
      } catch (err: any) {
        setNextStepsError(err?.message ?? "Unknown error");
      } finally {
        setIsNextStepsLoading(false);
      }
    })();
  }, [entityTag]);

  const isLoading =
    isEntityLoading || isCustomDataLoading || isCustomEventsLoading || isNextStepsLoading;

  // Flatten all rules across groups
  const allRules = useMemo<RuleToComplete[]>(() => {
    if (!nextSteps?.nextSteps) return [];
    return nextSteps.nextSteps.flatMap((g) => g.rulesToComplete || []);
  }, [nextSteps]);

  // Current level name from first group (your example shows one group)
  const currentLevelName =
    nextSteps?.nextSteps?.[0]?.currentLevel?.level?.name ?? undefined;

  // No more steps?
  const noMoreSteps =
    !!nextSteps &&
    (
      nextSteps.nextSteps?.length === 0 ||
      nextSteps.nextSteps?.every((g) => (g.rulesToComplete?.length || 0) === 0)
    );

  if (isLoading) return <Loader size="large" />;

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

      {actionStatus && (
        <div style={{ marginTop: 6, color: isRunningAction ? "#333" : "#5a5" }}>
          {actionStatus}
        </div>
      )}

      {nextStepsError && (
        <div style={{ color: "crimson" }}>Failed to load next steps: {nextStepsError}</div>
      )}

      {/* Completed state */}
      {noMoreSteps && (
        <div style={{ marginTop: 10, padding: 10, background: "#f0fff4", border: "1px solid #b7ebc6", borderRadius: 6 }}>
          <strong>You have completed all the levels of this scorecard.</strong>
        </div>
      )}

      {/* When we have steps to complete */}
      {!noMoreSteps && (
        <>
          {currentLevelName && (
            <div style={{ marginTop: 8 }}>
              <strong>Current level:</strong> {currentLevelName}
            </div>
          )}

          {/* Buttons for rule titles */}
          {allRules.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allRules.map((rule) => {
                const id = rule.identifier || rule.title || "";
                const label = rule.title || rule.identifier || "Untitled rule";
                const isActive = selectedRuleId === id;

                return (
                  <button
                    key={id}
                    onClick={() => handleRuleClick(rule)}
                    disabled={isRunningAction}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: isActive ? "2px solid #4a74f5" : "1px solid #ccc",
                      background: isRunningAction ? "#f3f3f3" : isActive ? "#eef2ff" : "#fff",
                      cursor: isRunningAction ? "not-allowed" : "pointer",
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
        </>
      )}
    </Section>
  );
};

export default EntityDetails;