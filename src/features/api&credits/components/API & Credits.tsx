import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
// removed remote analytics hook to avoid calling external analytics endpoint
import HistoryModal from "./HistoryModal";
import BuyCreditsModal from "./BuyCreditsModal";
import Transactions from "./Transactions";
import { useGenerateApiKeyMutation, useRegenerateApiKeyMutation, useRevokeApiKeyMutation } from "@/services/api-management";
import { useAppSelector } from "@/store";
import { useDashboardStatus } from "@/hooks";
import { getCookie } from "@/utils";
import { useCreditsAnalytics } from "@/features/shared/hooks";
import { PageLoader } from "@/components";
import { CreditsBarChart } from "@/features/shared";

import StatCard from "./StatCard";
import OverviewCard from "./OverviewCard";
import ApiKeyCard from "./ApiKeyCard";
import GenerateModal from "./GenerateModal";
import { BillingHistoryItem, RecentCreditHistoryItem, COLUMNS } from "./types";

const Api_credits = () => {
  // Fetch credits analytics via shared hook (DRY, uses configured endpoints)
  const { creditsAnalytics, loading: analyticsLoading } = useCreditsAnalytics();
  
  const [generateApiKey, { isLoading: isGenerating }] = useGenerateApiKeyMutation();
  const [regenerateApiKey, { isLoading: isRegenerating }] = useRegenerateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();
  const { loggedIn } = useAppSelector((state) => state.auth);

  // (fetching handled by hook)

    const analytics = useMemo(
    () => creditsAnalytics?.data || null,
    [creditsAnalytics]
  );
  // Memoize stat cards to avoid recreating on every render
  const statCards = [
    {
      icon: "📅",
      bgColor: "bg-[#fbf7f7]",
      label: "Calls Today",
      value: analytics?.callsToday
    },
    {
      icon: "🗓",
      bgColor: "bg-[#fcf2f2]",
      label: "Calls This Month",
      value: analytics?.callsThisMonth
    },
    {
      icon: "📞",
      bgColor: "bg-neutral-50",
      label: "Rate Limit",
      value: `${analytics?.avgCallsPerHr?? '0 '}calls/hr`,
    },
    {
      icon: "💯",
      bgColor: "bg-[#ffefef]",
      label: "Failures / Errors",
      value: `${analytics?.failureRate?? '0'}%`,
    },
  ];

  // Memoize overview cards
  const overviewCards = [
    {
      icon: "💳",
      bgColor: "bg-[#fcfbec]",
      label: "Available Balance",
      value: `${analytics?.creditBalance?? '0 '} credits`,
    },
    {
      icon: "👥",
      bgColor: "bg-[#f1f4f7]",
      label: "Credits Used This Month",
      value: analytics?.creditsUsedThisMonth,
    },
  ];

  // Memoize table data to avoid recalculation on every render
  const tableData: BillingHistoryItem[] = useMemo(() => {
    return analytics?.recentCreditHistory?.slice(0, 4)?.map((item: RecentCreditHistoryItem) => ({
      date: new Date(item.createdAt).toLocaleDateString(),
      action: item.transactionType,
      credits: item.credits.toString(),
      balance: item.balanceAfter.toString(),
    })) || [];
  }, [analytics?.recentCreditHistory]);

  const [apiKeys, setApiKeys] = useState<{ key: string; type: string; revoked?: boolean }[]>(() => {
    // Load API keys from localStorage on initial render
    const savedKeys = localStorage.getItem('apiKeys');
    return savedKeys ? JSON.parse(savedKeys) : [];
  });

  // Debounced localStorage save using useRef to avoid recreating the timeout on every render
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout to debounce localStorage writes
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }, 500); // Wait 500ms after last change

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [apiKeys]);

  // Full history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const openHistoryModal = useCallback(() => setShowHistoryModal(true), []);
  const closeHistoryModal = useCallback(() => setShowHistoryModal(false), []);

  // Buy Credits Modal state
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [txSelectedCredits, setTxSelectedCredits] = useState<number | string | null>(null);
  const [txSelectedAmount, setTxSelectedAmount] = useState<number | null>(null);
  
  const openBuyCreditsModal = useCallback(() => {
    setShowBuyCreditsModal(true);
  }, []);
  
  const closeBuyCreditsModal = useCallback(() => {
    setShowBuyCreditsModal(false);
  }, []);
  
  const closeTransactions = useCallback(() => {
    setShowTransactions(false);
  }, []);
  
  const openTransactions = useCallback((data?: { credits?: number; amount?: number }) => {
    if (data) {
      setTxSelectedCredits(typeof data.credits !== 'undefined' ? data.credits : null);
      setTxSelectedAmount(typeof data.amount !== 'undefined' ? data.amount : null);
    } else {
      setTxSelectedCredits(null);
      setTxSelectedAmount(null);
    }
    setShowTransactions(true);
  }, []);

  // Modal state for generating/regenerating keys
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [selectedEnvs, setSelectedEnvs] = useState<{ Live: boolean; Sandbox: boolean }>({
    Live: true,
    Sandbox: false,
  });
  const [modalStep, setModalStep] = useState<number>(1);
  const [lastGeneratedKeys, setLastGeneratedKeys] = useState<{ key: string; type: string }[] | null>(null);
  const [modalMode, setModalMode] = useState<'generate' | 'revoke'>('generate');
  const [lastRevokedEnvs, setLastRevokedEnvs] = useState<string[] | null>(null);

  const openGenerateModal = useCallback(() => {
    setSelectedEnvs({ Live: true, Sandbox: false });
    setModalStep(1);
    setModalMode('generate');
    setShowGenerateModal(true);
  }, []);

  const closeGenerateModal = useCallback(() => setShowGenerateModal(false), []);

  const openRevokeModal = useCallback(() => {
    setSelectedEnvs({ Live: false, Sandbox: false });
    setModalStep(1);
    setModalMode('revoke');
    setShowGenerateModal(true);
  }, []);

  const toggleEnv = useCallback((env: "Live" | "Sandbox") => {
    setSelectedEnvs((s) => ({ ...s, [env]: !s[env] }));
  }, []);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
  }, []);

  const handleRevokeSelected = useCallback(async (environments: ("Live" | "Sandbox")[]) => {
    if (!loggedIn) return;

    try {
      const promises = environments.map((env) => revokeApiKey({ environment: env }));
      await Promise.all(promises);

      setApiKeys(prev => {
        const typesToMark = environments.map((e) => `${e} Key`);
        return prev.map((k) => (typesToMark.includes(k.type) ? { ...k, revoked: true } : k));
      });

      setLastRevokedEnvs(environments);
      setModalStep(3);
    } catch (err) {
      console.error("Failed to revoke selected keys:", err);
    }
  }, [loggedIn, revokeApiKey]);

  const handleGenerateNewKey = useCallback(async (environments: ("Live" | "Sandbox")[] = ["Live", "Sandbox"]) => {
    if (!loggedIn || !getCookie("_tk")) return;

    try {
      const isRegenerating = apiKeys.length > 0;
      const promises: Promise<any>[] = [];
      const envOrder: ("Live" | "Sandbox")[] = [];
      
      for (const env of environments) {
        envOrder.push(env);
        promises.push(isRegenerating ? regenerateApiKey({ environment: env }) : generateApiKey({ environment: env }));
      }

      const results = await Promise.all(promises);
      const newKeys: { key: string; type: string; revoked?: boolean }[] = [];

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (!res.error && res.data?.status && res.data?.data?.apiKey) {
          newKeys.push({ key: res.data.data.apiKey, type: `${envOrder[i]} Key`, revoked: false });
        }
      }

      if (newKeys.length > 0) {
        setApiKeys(newKeys);
        setLastGeneratedKeys(newKeys);
        setModalStep(3);
      }
    } catch (error) {
      console.error("Failed to generate/regenerate API keys:", error);
    }
  }, [loggedIn, apiKeys.length, regenerateApiKey, generateApiKey]);

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

  // Memoize chart data
  const chartData = [
    { name: "Consumed", value: analytics?.creditsConsumed || 0 },
    { name: "Purchased", value: analytics?.creditsPurchased || 0 },
  ];

  const chartMax = Math.max(analytics?.creditsPurchased || 0, analytics?.creditsConsumed || 0) || 10;
  
  

  // Dashboard status (approval counts)
  const { dashboardData } = useDashboardStatus();
  const approvedDocumentsCount = dashboardData?.approvedDocumentsCount ?? 0;

  return (
    <>
      {analyticsLoading && <PageLoader />}
      <div className="w-full max-w-full overflow-x-hidden">
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
        
        <main className="flex flex-col items-start gap-[22px] relative w-full overflow-x-hidden">
          <section className="flex flex-col items-start gap-5 relative self-stretch w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
              {statCards.map((card, index) => (
                <StatCard key={index} card={card} />
              ))}
            </div>

            {/* API Keys area: show improved pending-approval UI when approvedDocumentsCount !== 4 */}
            <section className="flex flex-col gap-5 p-4 sm:p-6 w-full bg-white rounded-[28px] border border-solid border-[#efefef]">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg sm:text-xl tracking-[-0.60px] leading-[normal]">API Keys &amp; Access</h1>

              
                    
                    {approvedDocumentsCount === 4 && (
                      
                      <div className="inline-flex justify-center gap-1.5 px-2 py-1 bg-[#effff2] rounded-[999px] items-center" role="status" aria-label="Verification status">
                        <div className="w-1.5 h-1.5 bg-[#00a821] rounded-[3px]" aria-hidden="true" />
                        <div className="[font-family:'Archivo',Helvetica] font-normal text-[#00a821] text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">Verified</div>
                      </div>
                    )}
                
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
<button 
  className={`inline-flex w-full sm:w-auto justify-center gap-2.5 p-3 rounded-xl border border-solid shadow-[0px_2px_0px_#dcdcdc] items-center transition-all ${
    approvedDocumentsCount !== 4 
      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
      : 'bg-[#f0f0f0] border-[#dcdcdc] cursor-pointer hover:bg-[#f5f5f5] active:shadow-none active:translate-y-[2px]'
  }`}
  onClick={openRevokeModal}
  disabled={approvedDocumentsCount !== 4}
  aria-label="Revoke API key" 
  type="button"
>
  <span className="[font-family:'Archivo',Helvetica] font-medium text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">Revoke key</span>
</button>

                <button 
                  className={`inline-flex w-full sm:w-auto justify-center gap-2.5 p-3 rounded-xl border border-solid shadow-[0px_2px_0px_#dcdcdc] items-center transition-all ${
                    approvedDocumentsCount !== 4 
                      ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#0a51db] border-[#0844c4] cursor-pointer hover:bg-[#0a3fc9] active:shadow-none active:translate-y-[2px]'
                  }`}
                  onClick={openGenerateModal}
                  disabled={approvedDocumentsCount !== 4}
                  aria-label={apiKeys.length > 0 ? "Regenerate API key" : "Generate new API key"} 
                  type="button"
                >
                  <span className={`[font-family:'Archivo',Helvetica] font-medium text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap ${
                    approvedDocumentsCount !== 4 ? 'text-gray-500' : 'text-white'
                  }`}>
                    {approvedDocumentsCount !== 4 ? "Generate new key" : (apiKeys.length > 0 ? "Regenerate new key" : "Generate new key")}
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
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <p className="text-sm">No API keys generated yet</p>
                    </div>
                  ) : (
                    apiKeys.map((keyObj, index) => (
                      <ApiKeyCard key={index} keyObj={keyObj} index={index} onCopy={handleCopyKey} />
                    ))
                  )}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 w-full">
              <section className="flex flex-col gap-5 p-4 bg-white rounded-[28px] border border-[#efefef]">
                <h2 className="text-xl font-medium">Calls Overview</h2>
                <div className="flex flex-wrap gap-3 w-full">
                  {overviewCards.map((card, index) => (
                    <OverviewCard key={index} card={card} />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-5 p-4 bg-white rounded-[28px] border border-[#efefef]">
                <h2 className="text-xl font-medium">Credits purchased vs. consumed</h2>
                <CreditsBarChart max={chartMax} data={chartData} />
              </section>
            </div>
          </section>
          
          <HistoryModal 
            open={showHistoryModal} 
            onClose={closeHistoryModal} 
            onOpenBuyCredits={openBuyCreditsModal}
            history={analytics?.recentCreditHistory || []} 
            columns={COLUMNS} 
            pageSize={12} 
          />
          <BuyCreditsModal 
            open={showBuyCreditsModal} 
            onClose={closeBuyCreditsModal}
            onShowTransactions={openTransactions}
          />
          <Transactions 
            open={showTransactions}
            onClose={closeTransactions}
            history={analytics?.recentCreditHistory || []}
            selectedCredits={txSelectedCredits ?? undefined}
            selectedAmount={txSelectedAmount ?? undefined}
          />

          <section className="flex flex-col gap-5 p-6 w-full bg-white rounded-[36px] border border-[#efefef]">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
              <h2 className="text-lg sm:text-xl font-medium">Billing & History Table</h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button onClick={openHistoryModal} className="w-full sm:w-auto px-4 py-3 bg-gray-200 rounded-xl font-medium text-sm">View more</button>
                <button onClick={openBuyCreditsModal} className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm">Buy more credits</button>
              </div>
            </header>

            <div className="w-full overflow-x-auto">
              {tableData.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 w-full bg-white rounded-xl border border-[#f7f7f7]">
                  <img className="w-24 h-24" alt="No billing history" src="https://c.animaapp.com/0yfnJNzQ/img/fluent-color-receipt-32.svg" />
                  <p className="text-lg font-medium">No billing history</p>
                </div>
              ) : (
                <div className="flex bg-white rounded-xl border border-[#f7f7f7]">
                  {COLUMNS.map((column) => (
                    <div key={column.key} className="flex flex-col flex-1">
                      <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                        <div className="text-sm text-gray-600">{column.label}</div>
                      </div>
                      {tableData.map((row, index) => (
                        <div key={index} className="flex h-[55px] items-center gap-2.5 p-4 border-b border-[#f4f4f4]">
                          <div className="text-sm text-gray-600">{row[column.key as keyof typeof row]}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

const Api_creditsMemo = React.memo(Api_credits);
export default Api_creditsMemo;