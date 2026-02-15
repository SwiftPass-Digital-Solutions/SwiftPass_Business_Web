import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useBuyCreditsMutation,
  useGetCreditPackagesQuery,
  useCreateCustomPackageMutation,
} from "@/services/credits";

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
  onShowTransactions?: (data?: {
    credits: number;
    amount: number;
    onProceed?: () => Promise<boolean>;
    onPaymentSuccess?: () => void;
    checkoutUrl?: string;
  }) => void;
  onPaymentSuccess?: () => void;
}

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

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const CreditPackageOption = React.memo(
  ({
    pkg,
    isSelected,
    onSelect,
  }: {
    pkg: CreditPackage;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] w-full ${
        isSelected
          ? "bg-white border-blue-500"
          : "bg-white border-transparent hover:border-blue-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal border [font-family:'Archivo',Helvetica]"
          style={{
            backgroundColor: pkg.backgroundColor,
            borderColor: pkg.borderColor,
            color: "#000",
          }}
        >
          {pkg.label}
        </span>
        <span className="text-base font-medium [font-family:'Archivo',Helvetica]">
          {pkg.credits}
        </span>
      </div>

      <div className="text-xl font-semibold [font-family:'Archivo',Helvetica]">
        {pkg.price}
      </div>
    </button>
  ),
);

CreditPackageOption.displayName = "CreditPackageOption";

const PaymentMethodOption = React.memo(
  ({
    method,
    isSelected,
    onSelect,
  }: {
    method: PaymentMethod;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] w-full ${
        isSelected
          ? "bg-white border-blue-500"
          : "bg-white border-transparent hover:border-blue-200"
      }`}
    >
      <span className="text-2xl">{method.emoji}</span>
      <span className="[font-family:'Archivo',Helvetica] font-normal text-black text-base">
        {method.label}
      </span>
    </button>
  ),
);

PaymentMethodOption.displayName = "PaymentMethodOption";

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  open,
  onClose,
  onShowTransactions,
  onPaymentSuccess: _onPaymentSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [showCustomAmount, setShowCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customCredits, setCustomCredits] = useState<string>("");

  const {
    data: packagesResponse,
    isLoading: packagesLoading,
    error: packagesErrorRaw,
  } = useGetCreditPackagesQuery(undefined);

  const packagesErrorMessage =
    (packagesErrorRaw as any)?.data?.message ||
    (packagesErrorRaw ? "Failed to load packages" : null);

  const [buyCredits, { isLoading }] = useBuyCreditsMutation();
  const [createCustomPackage, { isLoading: creatingCustom }] =
    useCreateCustomPackageMutation();

  const handleSelectPackage = useCallback((packageId: number) => {
    setSelectedPackage(packageId);
  }, []);

  const handleSelectPayment = useCallback((paymentId: string) => {
    setSelectedPayment(paymentId);
  }, []);

  const handleToggleCustomAmount = useCallback(() => {
    setShowCustomAmount((prev) => !prev);
  }, []);

  const handleCustomAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomAmount(e.target.value);
    },
    [],
  );

  const handleCustomCreditsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomCredits(e.target.value);
    },
    [],
  );

  const handleSaveCustomPackage = useCallback(async () => {
    const amount = Number(customAmount || 0);
    const credits = Number(customCredits || 0);
    if (!amount || !credits) {
      toast.error("Please enter valid amount and credits");
      return;
    }

    try {
      const res = await createCustomPackage({
        id: 0,
        name: `Custom ${credits}`,
        credits,
        amount,
      }).unwrap();
      const created = res?.data;
      setShowCustomAmount(false);
      setCustomAmount("");
      setCustomCredits("");
      if (created && typeof created.id !== "undefined") {
        setSelectedPackage(Number(created.id));
      }
    } catch (err: any) {
      toast.error(
        (err as any)?.data?.message || "Failed to create custom package",
      );
    }
  }, [customAmount, customCredits, createCustomPackage]);

  // The actual payment call — passed as onProceed to Transactions.
  // Returns true on success so Transactions can show the success popup.
  const handleBuyCredits = useCallback(async (): Promise<boolean> => {
    const payload = showCustomAmount
      ? { packageId: 0, customAmount: Number(customAmount) || 0 }
      : { packageId: selectedPackage || 0, customAmount: 0 };

    try {
      const res = await buyCredits(payload).unwrap();

      if (res && (res as any).status === false) {
        const msg =
          (res as any).message ||
          "Failed to initiate purchase. Please try again.";
        toast.error(msg);
        return false;
      }

      const redirectUrl =
        (res as any)?.data?.checkoutUrl || (res as any)?.data?.redirectUrl;

      if (redirectUrl) {
        const urlStr = String(redirectUrl);
        try {
          const newWin = window.open(urlStr, "_blank");
          if (newWin) newWin.opener = null;
        } catch {
          try {
            window.location.assign(urlStr);
          } catch {
            toast.error("Failed to open checkout page");
            return false;
          }
        }
        return true; // ← signal success to Transactions
      }

      toast.error("No checkout URL received. Please try again.");
      return false;
    } catch (err: any) {
      if (err?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        const message =
          (err as any)?.data?.message ||
          "Failed to initiate purchase. Please try again.";
        toast.error(message);
      }
      return false;
    }
  }, [showCustomAmount, customAmount, selectedPackage, buyCredits]);

  const creditPackages: CreditPackage[] = useMemo(() => {
    const _raw = packagesResponse?.data;
    const _rawPackages = Array.isArray(_raw) ? _raw : [];
    return _rawPackages.map((p: any, idx: number) => ({
      id: Number(p.id),
      label: String(p.name || `Package ${p.id}`),
      credits: `${p.credits ?? 0} Credits`,
      price: `₦${Number(p.amount ?? 0).toLocaleString()}`,
      emoji: idx === 0 ? "👋" : idx === 1 ? "💃" : "🔥",
      badgeColor: idx === 0 ? "#b9b8b8" : idx === 1 ? "#147fea" : "#ff1212",
      borderColor: idx === 0 ? "#b9b8b8" : idx === 1 ? "#147fea" : "#ff1212",
      backgroundColor:
        idx === 0 ? "#fcfcfc" : idx === 1 ? "#f0f7fd" : "#fff4f4",
    }));
  }, [packagesResponse]);

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  useEffect(() => {
    if (selectedPackage === null && creditPackages.length > 0) {
      const first = creditPackages[0];
      if (first) setSelectedPackage(first.id);
    }
  }, [creditPackages, selectedPackage]);

  const canProceed = selectedPackage !== null || (showCustomAmount && !!customAmount && !!customCredits);

  // Step 1 → Step 2: move to Paystack confirmation screen
  const handleNextStep = useCallback(() => {
    if (!canProceed) return;
    setStep(2);
  }, [canProceed]);

  // Opens Transactions with the correct credits/amount and passes handleBuyCredits as onProceed
  const handleOpenTransactions = useCallback(() => {
    const pkg = creditPackages.find((p) => p.id === selectedPackage);
    const creditsNum = pkg
      ? Number(String(pkg.credits).replace(/[^0-9]/g, ""))
      : 0;
    const amountNum = pkg
      ? Number(String(pkg.price).replace(/[₦,]/g, ""))
      : 0;

    onShowTransactions?.({
      credits: creditsNum,
      amount: amountNum,
      onProceed: handleBuyCredits,
    });

    onClose(); // close BuyCreditsModal so Transactions slides in
  }, [
    creditPackages,
    selectedPackage,
    onShowTransactions,
    handleBuyCredits,
    onClose,
  ]);

  const packageOptions = useMemo(
    () =>
      creditPackages.map((pkg) => (
        <CreditPackageOption
          key={pkg.id}
          pkg={pkg}
          isSelected={selectedPackage === pkg.id}
          onSelect={() => handleSelectPackage(pkg.id)}
        />
      )),
    [creditPackages, selectedPackage, handleSelectPackage],
  );

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => (
        <PaymentMethodOption
          key={method.id}
          method={method}
          isSelected={selectedPayment === method.id}
          onSelect={() => handleSelectPayment(method.id)}
        />
      )),
    [selectedPayment, handleSelectPayment],
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop View */}
      <div
        className={`hidden sm:block fixed top-4 right-4 bottom-4 w-full sm:w-[640px] bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-8">
          <header className="flex flex-col items-start gap-4 mb-8">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={step === 2 ? () => setStep(1) : onClose}
                className="inline-flex items-center justify-center p-3.5 bg-white rounded-xl border border-solid border-[#ededed] shadow-[0px_2px_5.6px_#dbdbdb40] hover:bg-gray-50 active:scale-95 transition-all"
                aria-label={step === 2 ? "Go back to payment method" : "Close"}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                  <div className="text-sm text-red-500">
                    {packagesErrorMessage}
                  </div>
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
                      className={`text-sm [font-family:'Archivo',Helvetica] self-center transition-colors ${
                        creatingCustom
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {creatingCustom ? (
                        <span className="inline-flex items-center gap-2">
                          <LoadingSpinner />
                          <span>Saving...</span>
                        </span>
                      ) : (
                        "Save new amount"
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
              {step === 1 ? (
                <div className="flex items-center gap-5 w-full">
                  {paymentOptions}
                </div>
              ) : (
                /* Step 2 — Paystack confirmation (matches design image) */
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-blue-500 w-full">
                  {/* Selected radio */}
                  <div className="flex items-center justify-center w-6 h-6 shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-[#147fea] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#147fea]" />
                    </div>
                  </div>
                  {/* Paystack logo */}
                  <div className="flex items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="0" y="1"  width="20" height="4" rx="1.5" fill="#00C3F7" />
                      <rect x="0" y="7"  width="20" height="4" rx="1.5" fill="#0BA4DB" />
                      <rect x="0" y="13" width="16" height="4" rx="1.5" fill="#0074A8" />
                      <rect x="0" y="19" width="12" height="4" rx="1.5" fill="#00415F" />
                    </svg>
                    <span className="[font-family:'Archivo',Helvetica] font-bold text-[#011B33] text-xl tracking-tight">
                      paystack
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Desktop Footer */}
          <footer className="flex items-center gap-2 w-full mt-auto">
            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2.5 p-3 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_2px_0px_#dcdcdc] hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Cancel
                  </span>
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!canProceed}
                  className={`flex items-center justify-center gap-2.5 p-3 flex-1 rounded-xl border border-solid shadow-[0px_2px_0px_#dcdcdc] active:scale-95 transition-all ${
                    !canProceed
                      ? "bg-gray-300 border-gray-400 cursor-not-allowed opacity-60"
                      : "bg-[#0a51db] border-[#0844c4] hover:bg-[#0a3fc9]"
                  }`}
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Buy
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2.5 p-3 flex-1 bg-[#f0f0f0] rounded-xl border border-solid border-[#dcdcdc] shadow-[0px_2px_0px_#dcdcdc] hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-black text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Back
                  </span>
                </button>
                <button
                  onClick={handleOpenTransactions}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2.5 p-3 flex-1 rounded-xl border border-solid shadow-[0px_2px_0px_#0037cc] active:scale-95 transition-all ${
                    isLoading
                      ? "bg-gray-400 border-gray-500 cursor-not-allowed opacity-60"
                      : "bg-[#0047FF] border-[#0844c4] hover:bg-[#0039dd]"
                  }`}
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Buy Credits
                  </span>
                </button>
              </>
            )}
          </footer>
        </div>
      </div>

      {/* Mobile View */}
      <div
        className={`sm:hidden fixed inset-0 bg-white z-[70] transform transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col min-h-full p-4">
          <div className="mb-6">
            <button
              onClick={step === 2 ? () => setStep(1) : onClose}
              className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl hover:bg-gray-50 active:scale-95 transition-all mb-4"
              aria-label={step === 2 ? "Go back to payment method" : "Close"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="[font-family:'Archivo',Helvetica] font-medium text-black text-2xl tracking-[-0.72px] leading-[34.8px] mb-1">
              Buy More Credits Flow
            </h1>

            <p className="[font-family:'Archivo',Helvetica] font-normal text-gray-400 text-sm leading-relaxed">
              Keep your services running smoothly. Add credits to continue
              verifying customers without interruptions
            </p>
          </div>

          <section className="flex flex-col gap-4 p-4 rounded-3xl border-2 border-gray-700 mb-4">
            <h2 className="[font-family:'Archivo',Helvetica] font-medium text-gray-500 text-base">
              Choose Credit Package
            </h2>

            <div className="flex flex-col gap-3">
              {packagesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <LoadingSpinner />
                  <span>Loading packages...</span>
                </div>
              ) : packagesErrorMessage ? (
                <div className="text-sm text-red-400">
                  {packagesErrorMessage}
                </div>
              ) : (
                packageOptions
              )}

              <button
                onClick={handleToggleCustomAmount}
                className="flex items-center justify-center gap-2.5 p-4 bg-white rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
              >
                <span className="[font-family:'Archivo',Helvetica] font-normal text-gray-600 text-base">
                  Add custom amount
                </span>
              </button>

              {showCustomAmount && (
                <div className="flex flex-col items-start gap-3 p-4 bg-white rounded-2xl">
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
                    className={`text-sm [font-family:'Archivo',Helvetica] self-center transition-colors ${
                      creatingCustom
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {creatingCustom ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        <span>Saving...</span>
                      </span>
                    ) : (
                      "Save new amount"
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 p-4 rounded-3xl border-2 border-gray-700 mb-6">
            <h2 className="[font-family:'Archivo',Helvetica] font-medium text-gray-500 text-base">
              Payment Method
            </h2>
            {step === 1 ? (
              <div className="flex flex-col gap-3">{paymentOptions}</div>
            ) : (
              /* Step 2 — Paystack confirmation */
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-blue-500 w-full">
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <div className="w-5 h-5 rounded-full border-2 border-[#147fea] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#147fea]" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="0" y="1"  width="20" height="4" rx="1.5" fill="#00C3F7" />
                    <rect x="0" y="7"  width="20" height="4" rx="1.5" fill="#0BA4DB" />
                    <rect x="0" y="13" width="16" height="4" rx="1.5" fill="#0074A8" />
                    <rect x="0" y="19" width="12" height="4" rx="1.5" fill="#00415F" />
                  </svg>
                  <span className="[font-family:'Archivo',Helvetica] font-bold text-[#011B33] text-xl tracking-tight">
                    paystack
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Mobile Footer */}
          <div className="flex flex-col gap-3 mt-auto">
            {step === 1 ? (
              <>
                <button
                  onClick={handleNextStep}
                  disabled={!canProceed}
                  className={`flex items-center justify-center gap-2.5 py-4 w-full rounded-2xl transition-all ${
                    !canProceed
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-[#0047FF] hover:bg-[#0039dd] active:scale-95"
                  }`}
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base">
                    Buy
                  </span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center py-4 w-full"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-normal text-gray-400 text-base">
                    Cancel
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleOpenTransactions}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2.5 py-4 w-full rounded-2xl transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-[#0047FF] hover:bg-[#0039dd] active:scale-95"
                  }`}
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base">
                    Buy Credits
                  </span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center py-4 w-full"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-normal text-gray-400 text-base">
                    Back
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(BuyCreditsModal);