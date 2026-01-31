import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
// removed remote analytics hook to avoid calling external analytics endpoint
import HistoryModal from "./HistoryModal";
import BuyCreditsModal from "./BuyCreditsModal";
import Transactions from "./Transactions";
import { useGenerateApiKeyMutation, useRegenerateApiKeyMutation, useRevokeApiKeyMutation } from "@/services/api-management";
import { useAppSelector } from "@/store";
import { useDashboardStatus } from "@/hooks";
import { getCookie } from "@/utils";
import { PageLoader } from "@/components";
import { CreditsBarChart } from "@/features/shared";

// Move static data outside component
const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "action", label: "Action" },
  { key: "credits", label: "Credits" },
  { key: "balance", label: "Balance" },
];

interface BillingHistoryItem {
  date: string;
  action: string;
  credits: string;
  balance: string;
}

interface RecentCreditHistoryItem {
  id: number;
  credits: number;
  amount: number;
  balanceAfter: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

// Separate StatCard component to prevent re-renders
const StatCard = React.memo(({ card }: { card: any }) => (
  <article className="flex flex-col items-start gap-6 p-3 bg-white rounded-2xl border border-[#f7f7f7] shadow-sm">
    <div className={`flex w-[52px] h-[52px] items-center justify-center ${card.bgColor} rounded-full`}>
      <div className="text-xl">{card.icon}</div>
    </div>
    <div className="flex flex-col gap-1 w-full">
      <p className="text-sm text-gray-600">{card.label}</p>
      <p className="text-2xl font-semibold">{card.value}</p>
    </div>
  </article>
));

// Separate OverviewCard component
const OverviewCard = React.memo(({ card }: { card: any }) => (
  <article className="flex flex-col w-full sm:w-44 gap-6 p-3 bg-white rounded-2xl border border-[#f7f7f7] shadow-sm">
    <div className={`${card.bgColor} flex w-[52px] h-[52px] items-center justify-center rounded-full`}>
      <div className="text-xl">{card.icon}</div>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-600">{card.label}</p>
      <p className="text-2xl font-semibold">{card.value}</p>
    </div>
  </article>
));

// Separate ApiKeyCard component
const ApiKeyCard = React.memo(({ keyObj, index, onCopy }: { keyObj: any; index: number; onCopy: (key: string) => void }) => (
  <section
    className={`flex flex-col justify-center gap-3 p-6 w-full bg-[#fafbfe] rounded-xl border border-solid border-[#cbd5ff] items-center ${keyObj.revoked ? 'opacity-50' : ''}`}
    aria-labelledby={`key-${index}-label`}
  >
    <div className="inline-flex gap-3 items-center">
      <div
        className="[font-family:'Archivo',Helvetica] font-medium text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap"
        aria-label={`${keyObj.type} value`}
      >
        {keyObj.key}
      </div>

      {!keyObj.revoked && (
        <button
          className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => onCopy(keyObj.key)}
          aria-label={`Copy ${keyObj.type} to clipboard`}
          type="button"
        >
          <img
            className="w-full h-full"
            alt=""
            src="https://c.animaapp.com/CoPtyTgg/img/copy-02-1.svg"
            aria-hidden="true"
          />
        </button>
      )}
    </div>

    <div
      id={`key-${index}-label`}
      className="[font-family:'Archivo',Helvetica] font-normal text-base tracking-[-0.48px] leading-[23.2px] flex items-center gap-2"
    >
      <span className="text-[#6b7280]">{keyObj.type}</span>
      {keyObj.revoked && (
        <span className="text-[#ef4444] font-medium">Revoked</span>
      )}
    </div>
  </section>
));

// Separate Modal component
const GenerateModal = React.memo(({ 
  showGenerateModal, 
  modalStep, 
  modalMode, 
  selectedEnvs, 
  lastGeneratedKeys, 
  lastRevokedEnvs,
  isGenerating,
  isRegenerating,
  isRevoking,
  onClose,
  onToggleEnv,
  onNext,
  onGenerateKey,
  onRevokeKey,
  onCopyKey,
  onModalClose
}: any) => {
  if (!showGenerateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[92%] max-w-md bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          {modalStep !== 3 && (
            <div className={`flex flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 rounded-[52px] ${modalMode === 'generate' ? 'bg-[#fcf9f1]' : 'bg-[#ffefef]'}`}>
              {modalMode === 'generate' ? (
                <div className="text-2xl">🔐</div>
              ) : (
                <div className="text-2xl">❌</div>
              )}
            </div>
          )}

          {modalStep === 1 && (
            <>
              <div className="flex flex-col w-[280px] items-center gap-1">
                <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg text-center tracking-[-0.54px] leading-[26.1px]">
                  {modalMode === 'generate' ? 'Generate New API Key' : 'Revoke Key'}
                </h1>

                <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xs tracking-[0] leading-[17.4px]">
                  {modalMode === 'generate' ? 'Select the type you would like to generate' : 'Select the type(s) you would like to revoke'}
                </p>
              </div>

              <fieldset className="flex flex-col items-start gap-3 w-full">
                <legend className="sr-only">API Key Type Selection</legend>
                
                <label className="flex items-center justify-between p-3 w-full bg-[#f5f5f5] rounded-xl border border-solid border-[#dcdcdc] cursor-pointer hover:bg-[#eeeeee] transition-colors">
                  <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                    Sandbox Key (for testing)
                  </span>
                  <input 
                    type="checkbox" 
                    checked={selectedEnvs.Sandbox} 
                    onChange={() => onToggleEnv("Sandbox")}
                    className="w-5 h-5 cursor-pointer accent-green-600"
                    aria-label="Sandbox Key (for testing)"
                  />
                </label>

                <label className="flex items-center justify-between p-3 w-full bg-[#f5f5f5] rounded-xl border border-solid border-[#dcdcdc] cursor-pointer hover:bg-[#eeeeee] transition-colors">
                  <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                    Live Key (for production use)
                  </span>
                  <input 
                    type="checkbox" 
                    checked={selectedEnvs.Live} 
                    onChange={() => onToggleEnv("Live")}
                    className="w-5 h-5 cursor-pointer accent-green-600"
                    aria-label="Live Key (for production use)"
                  />
                </label>
              </fieldset>

              <div className="w-full flex items-start gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:bg-[#e5e5e5] transition-colors active:shadow-none active:translate-y-1"
                  aria-label="Cancel API key generation"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                    Cancel
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={!selectedEnvs.Live && !selectedEnvs.Sandbox}
                  className={`flex items-center justify-center gap-2.5 p-4 flex-1 rounded-xl border border-solid transition-colors active:shadow-none active:translate-y-1 ${
                    selectedEnvs.Live || selectedEnvs.Sandbox
                      ? 'bg-blue-600 border-blue-600 shadow-[0px_4px_0px_#0844c4] cursor-pointer hover:bg-blue-700'
                      : 'bg-transparent border-[#dcdcdc] cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Proceed to next step"
                >
                  <span className={`[font-family:'Archivo',Helvetica] font-medium text-base tracking-[0] leading-[23.2px] whitespace-nowrap ${
                    selectedEnvs.Live || selectedEnvs.Sandbox ? 'text-white' : 'text-[#4a4a4a]'
                  }`}>
                    Next
                  </span>
                </button>
              </div>
            </>
          )}

          {modalStep === 2 && (
            <>
              {modalMode === 'generate' ? (
                <>
                  <div className="flex flex-col items-center gap-1 w-full">
                    <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg text-center tracking-[-0.54px] leading-[26.1px]">
                      Generate New API Key
                    </h2>

                    <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xs text-center tracking-[0] leading-[17.4px]">
                      {(() => {
                        const parts: string[] = [];
                        if (selectedEnvs.Live) parts.push("Live");
                        if (selectedEnvs.Sandbox) parts.push("Sandbox");
                        const envText = parts.join(" and ");
                        return `You are about to generate a new ${envText} API key${parts.length > 1 ? 's' : ''}. For security, old keys remain active until you revoke them.`;
                      })()}
                    </p>
                  </div>

                  <div className="w-full flex items-start gap-3 mt-4">
                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:bg-[#f5f5f5] active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all"
                      onClick={onClose}
                      type="button"
                      aria-label="Cancel API key generation"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Cancel
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#0a51db] rounded-xl border border-solid border-[#0844c4] shadow-[0px_4px_0px_#3d61f1] cursor-pointer hover:bg-[#0a3ed5] active:shadow-[0px_2px_0px_#3d61f1] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onGenerateKey}
                      type="button"
                      disabled={isGenerating || isRegenerating}
                      aria-label="Generate new API key"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        {isGenerating || isRegenerating ? "Generating..." : "Generate key"}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-1 w-full">
                    <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg text-center tracking-[-0.54px] leading-[26.1px]">
                      Revoke Key
                    </h2>

                    <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xs text-center tracking-[0] leading-[17.4px]">
                      Are you sure you want to revoke this API key? Any integrations using this key will immediately stop working
                    </p>
                  </div>

                  <div className="w-full flex items-start gap-3 mt-4">
                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all"
                      onClick={onClose}
                      type="button"
                      aria-label="Cancel revoke action"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Cancel
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#dc2626] rounded-xl border border-solid border-[#b91c1c] shadow-[0px_4px_0px_#ff1212] cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#ff1212] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onRevokeKey}
                      type="button"
                      disabled={isRevoking}
                      aria-label="Confirm revoke action"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        {isRevoking ? "Revoking..." : "Yes, revoke"}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {modalStep === 3 && (
            <>
              {modalMode === 'generate' && lastGeneratedKeys && (
                <>
                  <div className="flex flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 bg-[#f3f0ff] rounded-[52px] mb-2">
                    <div className="text-2xl">🎉</div>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-full">
                    <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg text-center tracking-[-0.54px] leading-[26.1px]">
                      Successful
                    </h2>

                    <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xs text-center tracking-[0] leading-[17.4px]">
                      New API key generated successfully
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-3">
                    {lastGeneratedKeys.map((k: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-4 w-full bg-[#f5f5f5] rounded-xl border border-solid border-[#dcdcdc]">
                        <code className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[0] leading-[20px] break-all flex-1 overflow-hidden">
                          {k.key}
                        </code>
                        <button onClick={() => onCopyKey(k.key)} className="p-2 hover:opacity-70 transition-opacity flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="w-full flex items-start gap-3">
                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:bg-[#f5f5f5] active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all"
                      onClick={onModalClose}
                      type="button"
                      aria-label="Cancel and close"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Cancel
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#0a51db] rounded-xl border border-solid border-[#0844c4] shadow-[0px_4px_0px_#3d61f1] cursor-pointer hover:bg-[#0a3ed5] active:shadow-[0px_2px_0px_#3d61f1] active:translate-y-[2px] transition-all"
                      onClick={onModalClose}
                      type="button"
                      aria-label="Done and go home"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Yay, go home
                      </span>
                    </button>
                  </div>
                </>
              )}

              {modalMode === 'revoke' && lastRevokedEnvs && (
                <>
                  <div className="flex flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 bg-[#f8f2fb] rounded-[52px] mb-2">
                    <div className="text-2xl">🎉</div>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-full">
                    <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-lg text-center tracking-[-0.54px] leading-[26.1px]">
                      Revoked
                    </h2>

                    <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xs text-center tracking-[0] leading-[17.4px]">
                      API Key revoked successfully
                    </p>
                  </div>

                  <div className="w-full flex items-start gap-3 mt-4">
                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:bg-[#f5f5f5] active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all"
                      onClick={onModalClose}
                      type="button"
                      aria-label="Cancel and close dialog"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Cancel
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2.5 p-4 flex-1 bg-[#0a51db] rounded-xl border border-solid border-[#0844c4] shadow-[0px_4px_0px_#3d61f1] cursor-pointer hover:bg-[#0a3ed5] active:shadow-[0px_2px_0px_#3d61f1] active:translate-y-[2px] transition-all"
                      onClick={onModalClose}
                      type="button"
                      aria-label="Go to home page"
                    >
                      <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Go home
                      </span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const Api_credits = () => {
  // Use mocked analytics data to avoid calling external analytics endpoint
  const creditsAnalytics: any = {
    data: {
      callsToday: 128,
      callsThisMonth: 3420,
      avgCallsPerHr: 48,
      failureRate: 1.8,
      creditBalance: 1500,
      creditsUsedThisMonth: 320,
      creditsPurchased: 600,
      creditsConsumed: 280,
      recentCreditHistory: [
        { id: 1, credits: 100, amount: 10, balanceAfter: 1600, transactionType: "Buy", description: "Purchased credits", createdAt: new Date().toISOString() },
        { id: 2, credits: -50, amount: 0, balanceAfter: 1550, transactionType: "API Call", description: "API usage", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 3, credits: -30, amount: 0, balanceAfter: 1520, transactionType: "API Call", description: "API usage", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
        { id: 4, credits: 200, amount: 20, balanceAfter: 1720, transactionType: "Buy", description: "Purchased credits", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
      ],
    },
  };
  const analyticsLoading = false;
  const [generateApiKey, { isLoading: isGenerating }] = useGenerateApiKeyMutation();
  const [regenerateApiKey, { isLoading: isRegenerating }] = useRegenerateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();
  const { loggedIn } = useAppSelector((state) => state.auth);

  // Memoize stat cards to avoid recreating on every render
  const statCards = useMemo(() => [
    {
      icon: "📅",
      bgColor: "bg-[#fbf7f7]",
      label: "Calls Today",
      value: creditsAnalytics?.data?.callsToday?.toString(),
    },
    {
      icon: "🗓",
      bgColor: "bg-[#fcf2f2]",
      label: "Calls This Month",
      value: creditsAnalytics?.data?.callsThisMonth?.toString(),
    },
    {
      icon: "📞",
      bgColor: "bg-neutral-50",
      label: "Rate Limit",
      value: `${creditsAnalytics?.data?.avgCallsPerHr?.toString() ?? '0 '}calls/hr`,
    },
    {
      icon: "💯",
      bgColor: "bg-[#ffefef]",
      label: "Failures / Errors",
      value: `${creditsAnalytics?.data?.failureRate?.toString() ?? '0'}%`,
    },
  ], [creditsAnalytics?.data]);

  // Memoize overview cards
  const overviewCards = useMemo(() => [
    {
      icon: "💳",
      bgColor: "bg-[#fcfbec]",
      label: "Available Balance",
      value: `${creditsAnalytics?.data?.creditBalance?.toString() ?? '0 '} credits`,
    },
    {
      icon: "👥",
      bgColor: "bg-[#f1f4f7]",
      label: "Credits Used This Month",
      value: creditsAnalytics?.data?.creditsUsedThisMonth?.toString(),
    },
  ], [creditsAnalytics?.data]);

  // Memoize table data to avoid recalculation on every render
  const tableData: BillingHistoryItem[] = useMemo(() => {
    return creditsAnalytics?.data?.recentCreditHistory?.slice(0, 4)?.map((item: RecentCreditHistoryItem) => ({
      date: new Date(item.createdAt).toLocaleDateString(),
      action: item.transactionType,
      credits: item.credits.toString(),
      balance: item.balanceAfter.toString(),
    })) || [];
  }, [creditsAnalytics?.data?.recentCreditHistory]);

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
  const chartData = useMemo(() => [
    { name: "Consumed", value: creditsAnalytics?.data?.creditsConsumed || 0 },
    { name: "Purchased", value: creditsAnalytics?.data?.creditsPurchased || 0 },
  ], [creditsAnalytics?.data]);

  const chartMax = useMemo(() => 
    Math.max(creditsAnalytics?.data?.creditsPurchased || 0, creditsAnalytics?.data?.creditsConsumed || 0) || 10,
    [creditsAnalytics?.data]
  );

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
            <section className="flex flex-col gap-5 p-6 w-full bg-white rounded-[28px] border border-solid border-[#efefef]">
              <header className="flex justify-between w-full items-center">
                <div className="inline-flex justify-center gap-3 items-center">
                  <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-xl tracking-[-0.60px] leading-[normal] whitespace-nowrap">API Keys &amp; Access</h1>

                  <div className="inline-flex justify-center gap-1.5 px-2 py-1 bg-[#effff2] rounded-[999px] items-center" role="status" aria-label="Verification status">
                    <div className="w-1.5 h-1.5 bg-[#00a821] rounded-[3px]" aria-hidden="true" />
                    <div className="[font-family:'Archivo',Helvetica] font-normal text-[#00a821] text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">Verified</div>
                  </div>
                </div>

                <div className="inline-flex gap-2 items-center">
                  <button 
                    className="inline-flex justify-center gap-2.5 p-3 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_2px_0px_#dcdcdc] items-center cursor-pointer hover:bg-[#f5f5f5] active:shadow-none active:translate-y-[2px] transition-all" 
                    onClick={approvedDocumentsCount !== 4 ? undefined : openRevokeModal}
                    aria-label="Revoke API key" 
                    type="button"
                  >
                    <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">Revoke key</span>
                  </button>

                  <button 
                    className="inline-flex justify-center gap-2.5 p-3 bg-[#0a51db] rounded-xl border border-solid border-[#0844c4] shadow-[0px_2px_0px_#dcdcdc] items-center cursor-pointer hover:bg-[#0a3fc9] active:shadow-none active:translate-y-[2px] transition-all" 
                    onClick={approvedDocumentsCount !== 4 ? undefined : openGenerateModal}
                    aria-label={apiKeys.length > 0 ? "Regenerate API key" : "Generate new API key"} 
                    type="button"
                  >
                    <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                      {approvedDocumentsCount !== 4 ? "Generate new key" : (apiKeys.length > 0 ? "Regenerate new key" : "Generate new key")}
                    </span>
                  </button>
                </div>
              </header>

              {approvedDocumentsCount !== 4 ? (
        <div className="border-2 border-blue-500 rounded-lg bg-blue-50/30 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Blurred API Key */}
            <div className="mb-6">
              <div className="text-2xl font-mono text-gray-300 blur-[6px] select-none mb-1">
                sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxx
              </div>
              
            </div>

            {/* Hourglass Emoji */}
            <div className="mb-6 text-3xl">
              ⌛️
            </div>

            {/* Message Text */}
            <p className="text-lg text-gray-700 font-normal">
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
            history={creditsAnalytics?.data?.recentCreditHistory || []} 
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
            history={creditsAnalytics?.data?.recentCreditHistory || []}
            selectedCredits={txSelectedCredits ?? undefined}
            selectedAmount={txSelectedAmount ?? undefined}
          />

          <section className="flex flex-col gap-5 p-6 w-full bg-white rounded-[36px] border border-[#efefef]">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
              <h2 className="text-xl font-medium">Billing & History Table</h2>
              <div className="flex items-center gap-2">
                <button onClick={openHistoryModal} className="px-4 py-3 bg-gray-200 rounded-xl font-medium text-sm">View more</button>
                <button onClick={openBuyCreditsModal} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm">Buy more credits</button>
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