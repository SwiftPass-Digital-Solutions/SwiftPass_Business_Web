import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useBuyCreditsMutation, useGetCreditPackagesQuery, useCreateCustomPackageMutation } from "@/services/credits";

interface CreditPackage {
  id: number;
  label: string;
  emoji?: string;
  credits: string;
  price: string;
  badgeColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

interface PaymentMethod {
  id: string;
  emoji: string;
  label: string;
  backgroundColor: string;
}

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onShowTransactions?: (data?: { credits: number; amount: number }) => void;
}

// Packages fetched from API will populate this state

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    emoji: "💳",
    label: "Card (Visa, MasterCard)",
    backgroundColor: "#fefdf0",
  },
  {
    id: "bank",
    emoji: "🏦",
    label: "Bank Transfer",
    backgroundColor: "#f6f7f7",
  },
];

// package IDs come from the API; no static map needed

// Loading Spinner Component
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

// Memoized Credit Package Component
const CreditPackageOption = React.memo(({ 
  pkg, 
  isSelected, 
  onSelect 
}: { 
  pkg: CreditPackage; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`flex items-center justify-between p-4 rounded-lg border border-solid shadow-[0px_2px_14.7px_#ececec40] transition-all active:scale-[0.98] ${
      isSelected
        ? "bg-[#f1f7fe] border-[#147fea]"
        : "bg-[#fcfcfc] border-[#f2f2f2] hover:border-[#147fea]/50"
    }`}
  >
    <div className="inline-flex justify-center gap-2.5 items-center">
      <span
        className="inline-flex items-center justify-center gap-2.5 px-3 py-2 rounded-[27px] border border-solid"
        style={{
          backgroundColor: pkg.backgroundColor,
          borderColor: pkg.borderColor,
        }}
      >
        <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">
          {pkg.label}
        </span>
      </span>

      <span className="w-[110px] [font-family:'Archivo',Helvetica] font-normal text-black text-lg tracking-[-0.54px] leading-[normal]">
        {pkg.credits}
      </span>
    </div>

    <div className="w-1.5 h-1.5 bg-[#e6e6e6] rounded-[3px]" />

    <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-lg tracking-[-0.54px] leading-[normal] whitespace-nowrap">
      {pkg.price}
    </span>
  </button>
));

CreditPackageOption.displayName = "CreditPackageOption";

// Memoized Payment Method Component
const PaymentMethodOption = React.memo(({ 
  method, 
  isSelected, 
  onSelect 
}: { 
  method: PaymentMethod; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`flex flex-col items-start gap-6 p-3 flex-1 bg-white rounded-2xl border border-solid shadow-[0px_2px_12px_#d4d4d433] transition-all active:scale-[0.98] ${
      isSelected
        ? "border-[#147fea]"
        : "border-[#f7f7f7] hover:border-[#147fea]/50"
    }`}
  >
    <div
      className="flex w-[52px] h-[52px] items-center justify-center rounded-[52px]"
      style={{ backgroundColor: method.backgroundColor }}
    >
      <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-xl tracking-[-0.60px] leading-[29.0px]">
        {method.emoji}
      </span>
    </div>

    <div className="flex flex-col items-start gap-1 w-full">
      <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px]">
        {method.label}
      </span>
    </div>
  </button>
));

PaymentMethodOption.displayName = "PaymentMethodOption";

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ open, onClose, onShowTransactions }) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [showCustomAmount, setShowCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customCredits, setCustomCredits] = useState<string>("");
  const [showPaystack, setShowPaystack] = useState<boolean>(false);

  const { data: packagesResponse, isLoading: packagesLoading, error: packagesErrorRaw } = useGetCreditPackagesQuery(undefined);
  const packagesErrorMessage = (packagesErrorRaw as any)?.data?.message || (packagesErrorRaw ? 'Failed to load packages' : null);

  const [buyCredits, { isLoading }] = useBuyCreditsMutation();
  const [createCustomPackage, { isLoading: creatingCustom }] = useCreateCustomPackageMutation();

  // Memoized callbacks to prevent recreation
  const handleSelectPackage = useCallback((packageId: number) => {
    setSelectedPackage(packageId);
  }, []);

  const handleSelectPayment = useCallback((paymentId: string) => {
    setSelectedPayment(paymentId);
  }, []);

  const handleToggleCustomAmount = useCallback(() => {
    setShowCustomAmount(prev => !prev);
  }, []);

  const handleCustomAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
  }, []);

  const handleCustomCreditsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCredits(e.target.value);
  }, []);

  const handleShowPaystack = useCallback(() => {
    setShowPaystack(true);
  }, []);

  const handleSaveCustomPackage = useCallback(async () => {
    const amount = Number(customAmount || 0);
    const credits = Number(customCredits || 0);
    if (!amount || !credits) {
      alert('Please enter valid amount and credits');
      return;
    }

    try {
      const res = await createCustomPackage({ id: 0, name: `Custom ${credits}`, credits, amount }).unwrap();
      const created = res?.data;
      setShowCustomAmount(false);
      setCustomAmount('');
      setCustomCredits('');
      if (created && typeof created.id !== 'undefined') {
        setSelectedPackage(Number(created.id));
      }
    } catch (err: any) {
      alert((err as any)?.data?.message || 'Failed to create custom package');
    }
  }, [customAmount, customCredits, createCustomPackage]);

  const handleBuyCredits = useCallback(async () => {
    const payload = showCustomAmount
      ? { packageId: 0, customAmount: Number(customAmount) || 0 }
      : { packageId: selectedPackage || 0, customAmount: 0 };

    // determine credits and amount to pass to transactions
    let creditsToPass = 0;
    let amountToPass = 0;
    if (showCustomAmount) {
      creditsToPass = Number(customCredits) || 0;
      amountToPass = Number(customAmount) || 0;
    } else {
      const raw = (packagesResponse && Array.isArray(packagesResponse.data)) ? packagesResponse.data : [];
      const found = raw.find((p: any) => Number(p.id) === selectedPackage);
      if (found) {
        creditsToPass = Number(found.credits ?? 0);
        amountToPass = Number(found.amount ?? 0);
      }
    }

    try {
      const res = await buyCredits(payload).unwrap();
      // on success, close this modal and show transactions (pass selected values)
      onClose();
      if (typeof onShowTransactions === "function") {
        onShowTransactions({ credits: creditsToPass, amount: amountToPass });
      }
    } catch (err: any) {
      // handle error (showing a simple alert here)
      if (err?.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to initiate purchase. Please try again.");
      }
    }
  }, [showCustomAmount, customAmount, customCredits, selectedPackage, buyCredits, onClose, onShowTransactions, packagesResponse]);

  // Memoize package options render
  

  // Map API response into UI-friendly package objects (safe access)
  const _raw = packagesResponse?.data;
  const _rawPackages = Array.isArray(_raw) ? _raw : [];
  const creditPackages: CreditPackage[] = _rawPackages.map((p: any, idx: number) => ({
    id: Number(p.id),
    label: String(p.name || `Package ${p.id}`),
    credits: `${p.credits ?? 0} Credits`,
    price: `₦${Number(p.amount ?? 0).toLocaleString()}`,
    emoji: idx === 0 ? '👋' : idx === 1 ? '💃' : '🔥',
    badgeColor: idx === 0 ? '#b9b8b8' : idx === 1 ? '#147fea' : '#ff1212',
    borderColor: idx === 0 ? '#b9b8b8' : idx === 1 ? '#147fea' : '#ff1212',
    backgroundColor: idx === 0 ? '#fcfcfc' : idx === 1 ? '#f0f7fd' : '#fff4f4',
  }));

  // Initialize selected package once packages load
  useEffect(() => {
    if (selectedPackage === null && creditPackages.length > 0) {
      setSelectedPackage(creditPackages[0].id);
    }
  }, [creditPackages, selectedPackage]);

  // Memoize package options render
  const packageOptions = useMemo(() => (
    creditPackages.map((pkg) => (
      <CreditPackageOption
        key={pkg.id}
        pkg={pkg}
        isSelected={selectedPackage === pkg.id}
        onSelect={() => handleSelectPackage(pkg.id)}
      />
    ))
  ), [creditPackages, selectedPackage, handleSelectPackage]);

  // Memoize payment method options render
  const paymentOptions = useMemo(() => (
    PAYMENT_METHODS.map((method) => (
      <PaymentMethodOption
        key={method.id}
        method={method}
        isSelected={selectedPayment === method.id}
        onSelect={() => handleSelectPayment(method.id)}
      />
    ))
  ), [selectedPayment, handleSelectPayment]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-4 right-4 bottom-4 w-full sm:w-[640px] bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-8">
          <header className="flex flex-col items-start gap-4 mb-8">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center p-3.5 bg-white rounded-xl border border-solid border-[#ededed] shadow-[0px_2px_5.6px_#dbdbdb40] hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap">
                Buy More Credits Flow
              </h1>
            </div>

            <p className="[font-family:'Archivo',Helvetica] font-normal text-[#6b7280] text-xl tracking-[-0.60px] leading-[29.0px]">
              Keep your services running smoothly. Add credits to continue
              verifying customers without interruptions
            </p>
          </header>

          <div className="flex flex-col gap-6 mb-8">
            <section className="flex flex-col gap-3 p-3 rounded-3xl border border-solid border-[#dcdcdc]">
              <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-xl tracking-[-0.60px] leading-[29.0px]">
                Choose Credit Package
              </h2>

              <div className="flex flex-col gap-4">
                {packagesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LoadingSpinner />
                    <span>Loading packages...</span>
                  </div>
                ) : packagesErrorMessage ? (
                  <div className="text-sm text-red-500">{packagesErrorMessage}</div>
                ) : (
                  packageOptions
                )}

                {!showCustomAmount && (
                  <button 
                    onClick={handleToggleCustomAmount}
                    className="flex items-center justify-center gap-2.5 p-3 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_2px_0px_#dcdcdc] hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                      Add custom amount
                    </span>
                  </button>
                )}

                {showCustomAmount && (
                  <div className="flex flex-col items-start gap-3 p-4 bg-white rounded-xl border border-solid border-[#f2f2f2]">
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 [font-family:'Archivo',Helvetica]">
                          Custom amount
                        </label>
                        <input
                          type="text"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          className="px-4 py-3 rounded-lg border border-solid border-[#e6e6e6] text-gray-700 placeholder:text-gray-400 [font-family:'Archivo',Helvetica] focus:outline-none focus:border-[#147fea] transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 [font-family:'Archivo',Helvetica]">
                          Credit
                        </label>
                        <input
                          type="text"
                          placeholder="Credit no"
                          value={customCredits}
                          onChange={handleCustomCreditsChange}
                          className="px-4 py-3 rounded-lg border border-solid border-[#e6e6e6] text-gray-700 placeholder:text-gray-400 [font-family:'Archivo',Helvetica] focus:outline-none focus:border-[#147fea] transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveCustomPackage}
                      disabled={creatingCustom}
                      className={`text-sm [font-family:'Archivo',Helvetica] self-center transition-colors ${creatingCustom ? 'text-gray-400 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}>
                      {creatingCustom ? (
                        <span className="inline-flex items-center gap-2">
                          <LoadingSpinner />
                          <span>Saving...</span>
                        </span>
                      ) : (
                        'Save new amount'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3 p-3 rounded-3xl border border-solid border-[#dcdcdc]">
              <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-xl tracking-[-0.60px] leading-[29.0px]">
                Payment Method
              </h2>

              {!showPaystack ? (
                <div className="flex items-center gap-5 w-full">
                  {paymentOptions}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-solid border-[#f2f2f2]">
                  <div className="flex items-center justify-center w-6 h-6">
                    <div className="w-5 h-5 rounded-full border-2 border-[#147fea] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#147fea]" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="#00C3F7"/>
                      <path d="M7 12h3M7 9h3M7 15h3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="13" y="8" width="4" height="8" rx="1" fill="white"/>
                    </svg>
                    <span className="text-lg font-semibold text-black [font-family:'Archivo',Helvetica]">
                      paystack
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <footer className="flex items-center gap-2 w-full">
            {!showPaystack ? (
              <>
                <button 
                  onClick={onClose}
                  className="flex items-center justify-center gap-2.5 p-3 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_2px_0px_#dcdcdc] hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Revoke access
                  </span>
                </button>

                <button 
                  onClick={handleShowPaystack}
                  className="flex items-center justify-center gap-2.5 p-3 flex-1 bg-[#0a51db] rounded-xl border border-solid border-[#0844c4] shadow-[0px_2px_0px_#dcdcdc] hover:bg-blue-600 active:scale-95 transition-all"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Buy
                  </span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleBuyCredits}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2.5 p-4 w-full rounded-xl shadow-[0px_2px_0px_#0037cc] active:scale-95 transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0047FF] hover:bg-[#0039dd]'}`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                      Processing...
                    </span>
                  </>
                ) : (
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                    Buy Credits
                  </span>
                )}
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default React.memo(BuyCreditsModal);