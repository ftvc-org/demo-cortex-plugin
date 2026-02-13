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
const SCORECARD_TAG = "code-quality-metrics"; 
const GITHUB_OWNER = "ftvc-org";                      
const GITHUB_REPO = "sample-java-ab";                 
const BRANCH_NAME = "main";                           

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
  nextLevel?: { level: { name: string; number: number } };
  rulesToComplete: RuleToComplete[];
};

type NextStepsResponse = {
  nextSteps: NextStepGroup[];
};

const CodeQuality: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag ?? "";

  const { entity, isLoading: isEntityLoading } = useEntityDescriptor({ entityTag });
  const { customData, isLoading: isCustomDataLoading } = useEntityCustomData({ entityTag });
  const { customEvents, isLoading: isCustomEventsLoading } = useEntityCustomEvents({ entityTag });

  const [nextSteps, setNextSteps] = useState<NextStepsResponse | null>(null);
  const [isNextStepsLoading, setIsNextStepsLoading] = useState(false);
  const [nextStepsError, setNextStepsError] = useState<string | null>(null);

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const fetchNextSteps = async (): Promise<NextStepsResponse> => {
    const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
      SCORECARD_TAG
    )}/next-steps?entityTag=${encodeURIComponent(entityTag)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Next-steps error ${res.status}: ${await res.text()}`);
    return (await res.json()) as NextStepsResponse;
  };

  const evaluateScorecard = async () => {
    const url = `https://api.getcortexapp.com/api/v1/scorecards/${encodeURIComponent(
      SCORECARD_TAG
    )}/entity/${encodeURIComponent(entityTag)}/scores`;
    const res = await fetch(url, { method: "POST" });
    if (res.status === 409) return;
    if (!res.ok) throw new Error(`Evaluate error ${res.status}: ${await res.text()}`);
  };

  const ensureBranchProtection = async () => {
    const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(
      GITHUB_REPO
    )}/branches/${encodeURIComponent(BRANCH_NAME)}/protection`;

    const policy = {
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
      },
      required_conversation_resolution: true,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(policy),
    });
    if (!res.ok) throw new Error(`Branch protection error ${res.status}: ${await res.text()}`);
    return res.json();
  };

  const pollNextStepsUntilUpdated = async (maxAttempts = 10, intervalMs = 1500) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const latest = await fetchNextSteps();
      setNextSteps(latest);

      const remaining =
        latest.nextSteps?.reduce((acc, g) => acc + (g.rulesToComplete?.length || 0), 0) || 0;

      if (remaining === 0) return latest;
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return await fetchNextSteps();
  };

  const handleRuleClick = async (rule: RuleToComplete) => {
    if (isRunningAction) return;

    const id = rule.identifier || rule.title || null;
    setSelectedRuleId(id);
    setIsRunningAction(true);

    try {
      if ((rule.title || "").trim().toLowerCase() === "branch protection") {
        
      }
      if ((rule.title || "").trim().toLowerCase() === "add .fmk file") {
        setShowModal(true);
      }

    } catch (e: any) {
      setActionStatus(`Failed: ${e?.message ?? e}`);
    } finally {
      setIsRunningAction(false);
      setTimeout(() => setActionStatus(null), 2000);
    }
  };

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

  const allRules = useMemo<RuleToComplete[]>(() => {
    if (!nextSteps?.nextSteps) return [];
    return nextSteps.nextSteps.flatMap((g) => g.rulesToComplete || []);
  }, [nextSteps]);

  const currentLevelName = nextSteps?.nextSteps?.[0]?.currentLevel?.level?.name ?? undefined;

  const noMoreSteps =
    !!nextSteps &&
    (nextSteps.nextSteps?.length === 0 ||
      nextSteps.nextSteps?.every((g) => (g.rulesToComplete?.length || 0) === 0));

  if (isLoading) return <Loader size="large" />;

  if (!entityTag) {
    return (
      <Section>
        <Heading>Entity Details</Heading>
        <Subsection>No entity selected.</Subsection>
      </Section>
    );
  }

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: isActive ? "2px solid #3b5bdb" : "1px solid #c9d1ff",
    background: isActive
      ? "linear-gradient(180deg, #e9edff 0%, #dfe7ff 100%)"
      : "linear-gradient(180deg, #eef2ff 0%, #e2e8ff 100%)",
    color: "#1f2a56",
    cursor: isRunningAction ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: isActive
      ? "0 6px 18px rgba(59, 91, 219, 0.25)"
      : "0 4px 12px rgba(59, 91, 219, 0.18)",
    transition: "transform 120ms ease, box-shadow 150ms ease, background 150ms ease",
    outline: "none",
    width: "40%",
  });

  const onButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget.style as any).transform = "translateY(1px) scale(0.99)";
    (e.currentTarget.style as any).boxShadow = "0 2px 8px rgba(59, 91, 219, 0.18)";
  };
  const onButtonMouseUpOrLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget.style as any).transform = "translateY(0) scale(1)";
    (e.currentTarget.style as any).boxShadow = "0 4px 12px rgba(59, 91, 219, 0.18)";
  };

  return (
    <Section>
      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 320,
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h5>Action Required</h5>
            <h6>Please follow the steps given in the page below to pass this rule.</h6>

            <a
              href="https://enterprise-confluence.onefiserv.net/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1a73e8", fontWeight: "bold" }}
            >
              Open Page
            </a>

            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#f6f8ff",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {actionStatus && (
        <div style={{ marginTop: 6, color: isRunningAction ? "#333" : "#5a5" }}>
          {actionStatus}
        </div>
      )}

      {nextStepsError && (
        <div style={{ color: "crimson" }}>Failed to load next steps: {nextStepsError}</div>
      )}

      {noMoreSteps && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "#f0fff4",
            border: "1px solid #b7ebc6",
            borderRadius: 6,
          }}
        >
          <strong>You have completed all the levels of this scorecard.</strong>
        </div>
      )}

      {!noMoreSteps && (
        <>
          {currentLevelName && (
            <div style={{ marginTop: 8 }}>
              <strong>Current level:</strong> {currentLevelName}
            </div>
          )}

          {/* ⭐ UPDATED: Buttons stacked vertically ⭐ */}
          {allRules.length > 0 && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "stretch",
                width: "100%",
              }}
            >
              {allRules.map((rule) => {
                const id = rule.identifier || rule.title || "";
                const label = rule.title || rule.identifier || "Untitled rule";
                const isActive = selectedRuleId === id;

                return (
                  <button
                    key={id}
                    onClick={() => handleRuleClick(rule)}
                    onMouseDown={onButtonMouseDown}
                    onMouseUp={onButtonMouseUpOrLeave}
                    onMouseLeave={onButtonMouseUpOrLeave}
                    disabled={isRunningAction}
                    style={{
                      ...getButtonStyle(isActive),
                      ...(isRunningAction
                        ? {
                            opacity: 0.7,
                            background: "linear-gradient(180deg, #f3f4f8 0%, #eceef7 100%)",
                          }
                        : {}),
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

export default CodeQuality;
