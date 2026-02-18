import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  lazy,
  Suspense,
} from "react";

// ─── Lazy-load heavy modals so they don't block initial navigation ───────────
const HistoryModal = lazy(() => import("./HistoryModal"));
const BuyCreditsModal = lazy(() => import("./BuyCreditsModal"));
const Transactions = lazy(() => import("./Transactions"));
const GenerateModal = lazy(() => import("./GenerateModal"));
// ─────────────────────────────────────────────────────────────────────────────

import {
  useGenerateApiKeyMutation,
  useRegenerateApiKeyMutation,
  useRevokeApiKeyMutation,
} from "@/services/api-management";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { useDashboardStatus } from "@/hooks";
import { getCookie } from "@/utils";
import { useCreditsAnalytics } from "@/features/shared/hooks";
import { PageLoader } from "@/components";
import { CreditsBarChart } from "@/features/shared";

import StatCard from "./StatCard";
import OverviewCard from "./OverviewCard";
import ApiKeyCard from "./ApiKeyCard";
import { BillingHistoryItem, RecentCreditHistoryItem, COLUMNS } from "./types";

// Mobile Transaction Card Component for billing history
const BillingCard = React.memo(({ row }: { row: BillingHistoryItem }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <div className="text-sm font-medium text-gray-900 mb-3 [font-family:'Archivo',Helvetica]">
      {row.date}
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">
          Action
        </span>
        <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">
          {row.action}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">
          Credits
        </span>
        <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">
          {row.credits}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">
          Balance
        </span>
        <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">
          {row.balance}
        </span>
      </div>
    </div>
  </div>
));

BillingCard.displayName = "BillingCard";

// Memoize the chart component to prevent re-renders

const Api_credits = () => {
  // Fetch credits analytics via shared hook (DRY, uses configured endpoints)
  const {
    creditsAnalytics,
    loading: analyticsLoading,
    refetch: refetchCredits,
  } = useCreditsAnalytics();

  const [generateApiKey, { isLoading: isGenerating }] =
    useGenerateApiKeyMutation();
  const [regenerateApiKey, { isLoading: isRegenerating }] =
    useRegenerateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();
  const { loggedIn } = useAppSelector((state) => state.auth);

  const analytics = useMemo(
    () => creditsAnalytics?.data || null,
    [creditsAnalytics],
  );

  // Memoize stat cards to avoid recreating on every render
  const statCards = useMemo(
    () => [
      {
        icon: "📅",
        bgColor: "bg-[#fbf7f7]",
        label: "Calls Today",
        value: analytics?.callsToday,
      },
      {
        icon: "🗓",
        bgColor: "bg-[#fcf2f2]",
        label: "Calls This Month",
        value: analytics?.callsThisMonth,
      },
      {
        icon: "📞",
        bgColor: "bg-neutral-50",
        label: "Rate Limit",
        value: `${analytics?.avgCallsPerHr ?? "0 "}calls/hr`,
      },
      {
        icon: "💯",
        bgColor: "bg-[#ffefef]",
        label: "Failures / Errors",
        value: `${analytics?.failureRate ?? "0"}%`,
      },
    ],
    [
      analytics?.callsToday,
      analytics?.callsThisMonth,
      analytics?.avgCallsPerHr,
      analytics?.failureRate,
    ],
  );

  // Memoize overview cards
  const overviewCards = useMemo(
    () => [
      {
        icon: "💳",
        bgColor: "bg-[#fcfbec]",
        label: "Available Balance",
        value: `${analytics?.creditBalance ?? "0 "} credits`,
      },
      {
        icon: "👥",
        bgColor: "bg-[#f1f4f7]",
        label: "Credits Used This Month",
        value: analytics?.creditsUsedThisMonth,
      },
    ],
    [analytics?.creditBalance, analytics?.creditsUsedThisMonth],
  );

  // Memoize table data to avoid recalculation on every render
  const tableData: BillingHistoryItem[] = useMemo(() => {
    return (
      analytics?.recentCreditHistory
        ?.slice(0, 4)
        ?.map((item: RecentCreditHistoryItem) => ({
          date: new Date(item.createdAt).toLocaleDateString(),
          action: item.transactionType,
          credits: item.credits.toString(),
          balance: item.balanceAfter.toString(),
        })) || []
    );
  }, [analytics?.recentCreditHistory]);

  const [apiKeys, setApiKeys] = useState<
    { key: string; type: string; revoked?: boolean }[]
  >([]);

  // Persists across reloads so we can show "key exists but hidden" after session loss
  const [hasExistingApiKey, setHasExistingApiKey] = useState<boolean>(
    () => localStorage.getItem("hasApiKey") === "true",
  );

  // Track when chart has finished rendering
  const [chartRendered, setChartRendered] = useState(false);

  // Full history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const openHistoryModal = useCallback(() => setShowHistoryModal(true), []);
  const closeHistoryModal = useCallback(() => setShowHistoryModal(false), []);

  // Buy Credits Modal state
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [txSelectedCredits, setTxSelectedCredits] = useState<
    number | string | null
  >(null);
  const [txSelectedAmount, setTxSelectedAmount] = useState<number | null>(null);
  // Stores the payment callback passed from BuyCreditsModal → Transactions
  const [txOnProceed, setTxOnProceed] = useState<
    (() => Promise<boolean>) | null
  >(null);

  const openBuyCreditsModal = useCallback(() => {
    setShowBuyCreditsModal(true);
  }, []);

  const closeBuyCreditsModal = useCallback(() => {
    setShowBuyCreditsModal(false);
  }, []);

  const closeTransactions = useCallback(() => {
    setShowTransactions(false);
    setTxOnProceed(null);
  }, []);

  const openTransactions = useCallback(
    (data?: {
      credits?: number;
      amount?: number;
      onProceed?: () => Promise<boolean>;
    }) => {
      if (data) {
        setTxSelectedCredits(
          typeof data.credits !== "undefined" ? data.credits : null,
        );
        setTxSelectedAmount(
          typeof data.amount !== "undefined" ? data.amount : null,
        );
        // Wrap in updater form: () => fn so React stores fn, not calls it as updater
        setTxOnProceed(() => data.onProceed ?? null);
      } else {
        setTxSelectedCredits(null);
        setTxSelectedAmount(null);
        setTxOnProceed(null);
      }
      setShowTransactions(true);
    },
    [],
  );

  // Modal state for generating/regenerating keys
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  type Env = "Live" | "Sandbox";
  const [selectedEnvs, setSelectedEnvs] = useState<Record<Env, boolean>>({
    Live: true,
    Sandbox: false,
  });
  const [modalStep, setModalStep] = useState<number>(1);
  const [lastGeneratedKeys, setLastGeneratedKeys] = useState<
    { key: string; type: string }[] | null
  >(null);
  const [modalMode, setModalMode] = useState<"generate" | "revoke">("generate");
  const [lastRevokedEnvs, setLastRevokedEnvs] = useState<string[] | null>(null);

  const openGenerateModal = useCallback(() => {
    setSelectedEnvs({ Live: true, Sandbox: true });
    setModalStep(1);
    setModalMode("generate");
    setShowGenerateModal(true);
  }, []);

  const closeGenerateModal = useCallback(() => setShowGenerateModal(false), []);

  const openRevokeModal = useCallback(() => {
    setSelectedEnvs({ Live: false, Sandbox: false });
    setModalStep(1);
    setModalMode("revoke");
    setShowGenerateModal(true);
  }, []);

  const toggleEnv = useCallback((env: Env = "Live") => {
    setSelectedEnvs((s) => ({ ...s, [env]: !s[env] }) as Record<Env, boolean>);
  }, []);

  const maskApiKey = useCallback((key: string): string => {
    if (!key || key.length <= 16) return key;

    const visibleStart = key.substring(0, 12);
    const visibleEnd = key.substring(key.length - 4);
    const maskedMiddle = "*".repeat(key.length - 16);

    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
  }, []);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
  }, []);

  const handleRevokeSelected = useCallback(
    async (environments: ("Live" | "Sandbox")[]) => {
      if (!loggedIn) return;

      try {
        const promises = environments.map((env) =>
          revokeApiKey({ environment: env }),
        );
        const results = await Promise.all(promises as Promise<any>[]);

        // Show any error messages from the API
        results.forEach((res: any) => {
          const message =
            res?.data?.message ||
            res?.error?.data?.message ||
            res?.error?.message;
          if (message && !res?.data?.status) {
            toast.error(message);
          }
        });

        // mark keys revoked locally if API calls succeeded
        setApiKeys((prev) => {
          const typesToMark = environments.map((e) => `${e} Key`);
          return prev.map((k) =>
            typesToMark.includes(k.type) ? { ...k, revoked: true } : k,
          );
        });

        // Clear the persisted flag since keys have been revoked
        localStorage.removeItem("hasApiKey");
        setHasExistingApiKey(false);

        setLastRevokedEnvs(environments);
        setModalStep(3);
      } catch (err) {
        console.error("Failed to revoke selected keys:", err);
        toast.error((err as any)?.message || "Failed to revoke selected keys");
      }
    },
    [loggedIn, revokeApiKey],
  );

  const handleGenerateNewKey = useCallback(
    async (environments: ("Live" | "Sandbox")[] = ["Live"]) => {
      if (!loggedIn || !getCookie("_tk")) return;

      try {
        const isRegenerating = apiKeys.length > 0;
        const promises: Promise<any>[] = [];
        const envOrder: ("Live" | "Sandbox")[] = [];
        const newKeys: { key: string; type: string; revoked?: boolean }[] = [];

        // Separate Live and Sandbox environments
        const liveEnvs = environments.filter((env) => env === "Live");
        const sandboxEnvs = environments.filter((env) => env === "Sandbox");

        // Handle Live keys from backend
        for (const env of liveEnvs) {
          envOrder.push(env);
          promises.push(
            isRegenerating
              ? regenerateApiKey({ environment: env })
              : generateApiKey({ environment: env }),
          );
        }

        // Generate Sandbox keys on frontend
        sandboxEnvs.forEach(() => {
          // Generate a mock sandbox key in format: sk-test_{8-hex}_{32-alphanumeric}
          const generateHex = (length: number) => {
            let result = "";
            const characters = "0123456789abcdef";
            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * characters.length),
              );
            }
            return result;
          };

          const generateAlphanumeric = (length: number) => {
            let result = "";
            const characters =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * characters.length),
              );
            }
            return result;
          };

          const hexPart = generateHex(8);
          const alphaPart = generateAlphanumeric(32);
          const mockSandboxKey = `sk-test_${hexPart}_${alphaPart}`;

          newKeys.push({
            key: mockSandboxKey,
            type: "Test Key",
            revoked: false,
          });
        });

        // Process backend results for Live keys
        if (promises.length > 0) {
          const results = await Promise.all(promises as Promise<any>[]);

          for (let i = 0; i < results.length; i++) {
            const res = results[i];
            if (!res.error && res.data?.status && res.data?.data?.apiKey) {
              newKeys.push({
                key: res.data.data.apiKey,
                type: `${envOrder[i]} Key`,
                revoked: false,
              });
            } else {
              // Show API error message if present
              const message =
                res?.data?.message ||
                res?.error?.data?.message ||
                res?.error?.message;
              if (message) toast.error(message);
            }
          }
        }

        if (newKeys.length > 0) {
          setApiKeys(newKeys);
          setLastGeneratedKeys(newKeys);
          // Persist flag so we can show "hidden" state after reload
          localStorage.setItem("hasApiKey", "true");
          setHasExistingApiKey(true);
          setModalStep(3);
        }
      } catch (error) {
        console.error("Failed to generate/regenerate API keys:", error);
        toast.error(
          (error as any)?.message || "Failed to generate/regenerate API keys",
        );
      }
    },
    [loggedIn, apiKeys.length, regenerateApiKey, generateApiKey],
  );

  // Memoize the modal close handler to avoid recreating function
  const handleModalClose = useCallback(() => {
    setLastGeneratedKeys(null);
    setLastRevokedEnvs(null);
    setShowGenerateModal(false);
    setModalStep(1);
  }, []);

  // Memoized handlers for modal
  const handleModalNext = useCallback(() => setModalStep(2), []);

  const handleModalGenerateKey = useCallback(async () => {
    const envs: ("Live" | "Sandbox")[] = [];
    if (selectedEnvs.Live) envs.push("Live");
    if (selectedEnvs.Sandbox) envs.push("Sandbox");
    if (envs.length === 0) return;
    await handleGenerateNewKey(envs);
  }, [selectedEnvs, handleGenerateNewKey]);

  const handleModalRevokeKey = useCallback(async () => {
    const envs: ("Live" | "Sandbox")[] = [];
    if (selectedEnvs.Live) envs.push("Live");
    if (selectedEnvs.Sandbox) envs.push("Sandbox");
    if (envs.length === 0) return;
    await handleRevokeSelected(envs);
  }, [selectedEnvs, handleRevokeSelected]);

  // Memoize chart data with specific dependencies
  const chartData = useMemo(
    () => [
      { name: "Consumed", value: analytics?.creditsConsumed || 0 },
      { name: "Purchased", value: analytics?.creditsPurchased || 0 },
    ],
    [analytics?.creditsConsumed, analytics?.creditsPurchased],
  );

  // Dashboard status (approval counts)
  const { dashboardData } = useDashboardStatus();
  const approvedDocumentsCount = dashboardData?.approvedDocumentsCount ?? 0;

  // Memoize history for modals to prevent re-renders
  const creditHistory = useMemo(
    () => analytics?.recentCreditHistory || [],
    [analytics?.recentCreditHistory],
  );

  // Wait for chart to finish rendering before hiding loader
  useEffect(() => {
    if (!analyticsLoading && chartData && chartData.length > 0) {
      // Use setTimeout with longer delay to ensure chart fully renders
      const timer = setTimeout(() => {
        setChartRendered(true);
      }, 1000); // 1 second - ensures Recharts fully renders and paints

      return () => clearTimeout(timer);
    } else {
      // Reset when loading starts
      setChartRendered(false);
    }
  }, [analyticsLoading, chartData]);

  // Show loader until both data is loaded AND chart is rendered
  const isLoading = analyticsLoading || !chartRendered;

  return (
    <>
      {isLoading && <PageLoader />}

      <div className="w-full max-w-full overflow-x-hidden">
        {/* Only render content when data is ready AND chart is rendered */}
        {!isLoading && (
          <>
            {/* GenerateModal: only mount (and lazy-load) when opened */}
            {showGenerateModal && (
              <Suspense fallback={null}>
                <GenerateModal
                  showGenerateModal={showGenerateModal}
                  modalStep={modalStep}
                  modalMode={modalMode}
                  selectedEnvs={selectedEnvs}
                  lastGeneratedKeys={lastGeneratedKeys}
                  lastRevokedEnvs={lastRevokedEnvs}
                  isGenerating={isGenerating}
                  isRegenerating={isRegenerating}
                  isRevoking={isRevoking}
                  onClose={closeGenerateModal}
                  onToggleEnv={toggleEnv}
                  onNext={handleModalNext}
                  onGenerateKey={handleModalGenerateKey}
                  onRevokeKey={handleModalRevokeKey}
                  onCopyKey={handleCopyKey}
                  onModalClose={handleModalClose}
                />
              </Suspense>
            )}

            <main className="flex flex-col items-start gap-[22px] relative w-full overflow-x-hidden">
              <section className="flex flex-col items-start gap-5 relative self-stretch w-full">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
                  {statCards.map((card, index) => (
                    <StatCard key={index} card={card} />
                  ))}
                </div>

                {/* API Keys area */}
                <section className="flex flex-col gap-5 p-4 sm:p-6 w-full bg-white rounded-[18px] sm:rounded-[28px] border border-solid border-[#efefef]">
                  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg sm:text-xl tracking-[-0.60px] leading-[normal]">
                        API Keys &amp; Access
                      </h1>

                      {approvedDocumentsCount === 4 && (
                        <div
                          className="inline-flex justify-center gap-1.5 px-2 py-1 bg-[#effff2] rounded-[999px] items-center"
                          role="status"
                          aria-label="Verification status"
                        >
                          <div
                            className="w-1.5 h-1.5 bg-[#00a821] rounded-[3px]"
                            aria-hidden="true"
                          />
                          <div className="[font-family:'Archivo',Helvetica] font-normal text-[#00a821] text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                            Verified
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row gap-2 items-center w-full sm:w-auto">
                      <button
                        className={`inline-flex flex-1 sm:flex-initial sm:w-auto justify-center gap-2.5 px-3 py-2.5 sm:p-3 rounded-xl border border-solid shadow-[0px_2px_0px_#dcdcdc] items-center transition-all ${
                          approvedDocumentsCount !== 4
                            ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                            : "bg-[#f0f0f0] border-[#dcdcdc] cursor-pointer hover:bg-[#f5f5f5] active:shadow-none active:translate-y-[2px]"
                        }`}
                        onClick={openRevokeModal}
                        disabled={approvedDocumentsCount !== 4}
                        aria-label="Revoke API key"
                        type="button"
                      >
                        <span className="[font-family:'Archivo',Helvetica] font-medium text-xs sm:text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                          Revoke key
                        </span>
                      </button>

                      <button
                        className={`inline-flex flex-1 sm:flex-initial sm:w-auto justify-center gap-2.5 px-3 py-2.5 sm:p-3 rounded-xl border border-solid shadow-[0px_2px_0px_#dcdcdc] items-center transition-all ${
                          approvedDocumentsCount !== 4
                            ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                            : "bg-[#0a51db] border-[#0844c4] cursor-pointer hover:bg-[#0a3fc9] active:shadow-none active:translate-y-[2px]"
                        }`}
                        onClick={openGenerateModal}
                        disabled={approvedDocumentsCount !== 4}
                        aria-label={
                          apiKeys.length > 0
                            ? "Regenerate API key"
                            : "Generate new API key"
                        }
                        type="button"
                      >
                        <span
                          className={`[font-family:'Archivo',Helvetica] font-medium text-xs sm:text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap ${
                            approvedDocumentsCount !== 4
                              ? "text-gray-500"
                              : "text-white"
                          }`}
                        >
                          {approvedDocumentsCount !== 4
                            ? "Generate new key"
                            : apiKeys.length > 0
                              ? "Regenerate new key"
                              : "Generate new key"}
                        </span>
                      </button>
                    </div>
                  </header>

                  {approvedDocumentsCount !== 4 ? (
                    <div className="border-2 border-blue-500 rounded-lg bg-blue-50/30 p-8 sm:p-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        {/* Blurred API Key */}
                        <div className="mb-4 sm:mb-6">
                          <div className="text-xl sm:text-2xl font-mono text-gray-300 blur-[6px] select-none mb-1">
                            sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxx
                          </div>
                        </div>

                        {/* Hourglass Emoji */}
                        <div className="mb-4 sm:mb-6 text-2xl sm:text-3xl">
                          ⌛️
                        </div>

                        {/* Message Text */}
                        <p className="text-base sm:text-lg text-gray-700 font-normal">
                          These will be generated as soon as you're approved!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 w-full">
                      {apiKeys.length === 0 ? (
                        hasExistingApiKey ? (
                          // Key was generated before but isn't in memory (e.g. after page reload)
                          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 bg-[#fafbfe] rounded-xl border border-dashed border-[#cbd5ff]">
                            <div className="text-3xl">🔑</div>
                            <div className="flex flex-col items-center gap-1 text-center">
                              <p className="text-sm font-medium text-gray-800 [font-family:'Archivo',Helvetica]">
                                You have an active API key
                              </p>
                              <p className="text-xs text-gray-400 [font-family:'Archivo',Helvetica]">
                                It's hidden for security. Use{" "}
                                <span className="font-semibold text-gray-500">
                                  Revoke key
                                </span>{" "}
                                to revoke and generate a fresh one.
                              </p>
                            </div>
                          </div>
                        ) : (
                          // Truly no key has ever been generated
                          <div className="flex items-center justify-center py-8 text-gray-400">
                            <p className="text-sm">No API keys generated yet</p>
                          </div>
                        )
                      ) : (
                        apiKeys.map((keyObj, index) => (
                          <ApiKeyCard
                            key={index}
                            keyObj={{
                              ...keyObj,
                              key: maskApiKey(keyObj.key),
                            }}
                            index={index}
                            onCopy={() => handleCopyKey(keyObj.key)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 w-full">
                  <section className="flex flex-col gap-5 p-4 bg-white rounded-[28px] border border-[#efefef]">
                    <h2 className="text-lg sm:text-xl font-medium">
                      Calls Overview
                    </h2>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {overviewCards.map((card, index) => (
                        <OverviewCard key={index} card={card} />
                      ))}
                    </div>
                  </section>

                  <section className="flex flex-col gap-5 p-4 bg-white rounded-[28px] border border-[#efefef]">
                    <h2 className="text-lg sm:text-xl font-medium">
                      Credits purchased vs. consumed
                    </h2>
                    <CreditsBarChart
                      max={10}
                      data={[
                        {
                          name: "Consumed",
                          value: analytics?.creditsConsumed || 0,
                        },
                        {
                          name: "Purchased",
                          value: analytics?.creditsPurchased || 0,
                        },
                      ]}
                    />
                  </section>
                </div>
              </section>

              {/* HistoryModal: only mount (and lazy-load) when opened */}
              {showHistoryModal && (
                <Suspense fallback={null}>
                  <HistoryModal
                    open={showHistoryModal}
                    onClose={closeHistoryModal}
                    onOpenBuyCredits={openBuyCreditsModal}
                    history={creditHistory}
                    columns={COLUMNS}
                    pageSize={12}
                  />
                </Suspense>
              )}

              {/* BuyCreditsModal: only mount (and lazy-load) when opened */}
              {showBuyCreditsModal && (
                <Suspense fallback={null}>
                  <BuyCreditsModal
                    open={showBuyCreditsModal}
                    onClose={closeBuyCreditsModal}
                    onShowTransactions={openTransactions}
                    onPaymentSuccess={() => {
                      try {
                        refetchCredits?.();
                      } catch (e) {
                        // ignore
                      }
                    }}
                  />
                </Suspense>
              )}

              {/* Transactions: only mount (and lazy-load) when opened */}
              {showTransactions && (
                <Suspense fallback={null}>
                  <Transactions
                    open={showTransactions}
                    onClose={closeTransactions}
                    history={creditHistory}
                    selectedCredits={txSelectedCredits ?? undefined}
                    selectedAmount={txSelectedAmount ?? undefined}
                    onProceed={txOnProceed ?? undefined}
                  />
                </Suspense>
              )}

              <section className="flex flex-col gap-5 p-4 sm:p-6 w-full bg-white rounded-[28px] sm:rounded-[36px] border border-[#efefef]">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
                  <h2 className="text-lg sm:text-xl font-medium">
                    Billing & History Table
                  </h2>
                  <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={openHistoryModal}
                      className="flex-1 sm:flex-initial sm:w-auto px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-200 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap"
                    >
                      View more
                    </button>
                    <button
                      onClick={openBuyCreditsModal}
                      className="flex-1 sm:flex-initial sm:w-auto px-3 py-2.5 sm:px-4 sm:py-3 bg-blue-600 text-white rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap"
                    >
                      Buy more credits
                    </button>
                  </div>
                </header>

                {tableData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 w-full bg-white rounded-xl border border-[#f7f7f7]">
                    <img
                      className="w-24 h-24"
                      alt="No billing history"
                      src="https://c.animaapp.com/0yfnJNzQ/img/fluent-color-receipt-32.svg"
                    />
                    <p className="text-lg font-medium">No billing history</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:flex w-full overflow-x-auto">
                      <div className="flex bg-white rounded-xl border border-[#f7f7f7] w-full">
                        {COLUMNS.map((column) => (
                          <div
                            key={column.key}
                            className="flex flex-col flex-1"
                          >
                            <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                              <div className="text-xs sm:text-sm text-gray-600">
                                {column.label}
                              </div>
                            </div>
                            {tableData.map((row, index) => (
                              <div
                                key={index}
                                className="flex h-[55px] items-center gap-2.5 p-4 border-b border-[#f4f4f4]"
                              >
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {row[column.key as keyof typeof row]}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden flex flex-col gap-3">
                      {tableData.map((row, index) => (
                        <BillingCard key={index} row={row} />
                      ))}
                    </div>
                  </>
                )}
              </section>
            </main>
          </>
        )}
      </div>
    </>
  );
};

export default React.memo(Api_credits);
