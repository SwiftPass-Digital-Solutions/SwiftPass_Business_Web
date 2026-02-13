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
  onShowTransactions?: (data?: { credits: number; amount: number }) => void;
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
}) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [showCustomAmount, setShowCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customCredits, setCustomCredits] = useState<string>("");
  const [showPaystack, setShowPaystack] = useState<boolean>(false);

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

  const handleShowPaystack = useCallback(() => {
    setShowPaystack(true);
  }, []);

  const handleSaveCustomPackage = useCallback(async () => {
    const amount = Number(customAmount || 0);
    const credits = Number(customCredits || 0);
    if (!amount || !credits) {
      alert("Please enter valid amount and credits");
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
      alert((err as any)?.data?.message || "Failed to create custom package");
    }
  }, [customAmount, customCredits, createCustomPackage]);

  const handleBuyCredits = useCallback(async () => {
    const payload = showCustomAmount
      ? { packageId: 0, customAmount: Number(customAmount) || 0 }
      : { packageId: selectedPackage || 0, customAmount: 0 };

    let creditsToPass = 0;
    let amountToPass = 0;
    if (showCustomAmount) {
      creditsToPass = Number(customCredits) || 0;
      amountToPass = Number(customAmount) || 0;
    } else {
      const raw =
        packagesResponse && Array.isArray(packagesResponse.data)
          ? packagesResponse.data
          : [];
      const found = raw.find((p: any) => Number(p.id) === selectedPackage);
      if (found) {
        creditsToPass = Number(found.credits ?? 0);
        amountToPass = Number(found.amount ?? 0);
      }
    }

    try {
      const res = await buyCredits(payload).unwrap();

      // If backend signals failure in a 200 response via ResponseBody.status
      if (res && (res as any).status === false) {
        const msg =
          (res as any).message ||
          "Failed to initiate purchase. Please try again.";
        toast.error(msg);
        return;
      }

      onClose();
      if (typeof onShowTransactions === "function") {
        onShowTransactions({ credits: creditsToPass, amount: amountToPass });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        const message =
          (err as any)?.data?.message ||
          "Failed to initiate purchase. Please try again.";
        toast.error(message);
      }
    }
  }, [
    showCustomAmount,
    customAmount,
    customCredits,
    selectedPackage,
    buyCredits,
    onClose,
    onShowTransactions,
    packagesResponse,
  ]);

  // ✅ Memoize credit packages mapping
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
    if (selectedPackage === null && creditPackages.length > 0) {
      const first = creditPackages[0];
      if (first) setSelectedPackage(first.id);
    }
  }, [creditPackages, selectedPackage]);

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

      {/* Desktop View - Original Design */}
      <div
        className={`hidden sm:block fixed top-4 right-4 bottom-4 w-full sm:w-[640px] bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-hidden ${
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
                      className={`text-sm [font-family:'Archivo',Helvetica] self-center transition-colors ${creatingCustom ? "text-gray-400 cursor-not-allowed" : "text-gray-400 hover:text-gray-600"}`}
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
                      <rect
                        x="0"
                        y="0"
                        width="20"
                        height="4"
                        rx="1"
                        fill="#00A8E8"
                      />
                      <rect
                        x="0"
                        y="6"
                        width="20"
                        height="4"
                        rx="1"
                        fill="#00A8E8"
                      />
                      <rect
                        x="0"
                        y="12"
                        width="16"
                        height="4"
                        rx="1"
                        fill="#00A8E8"
                      />
                      <rect
                        x="0"
                        y="18"
                        width="12"
                        height="4"
                        rx="1"
                        fill="#00A8E8"
                      />
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
                className={`flex items-center justify-center gap-2.5 p-4 w-full rounded-xl shadow-[0px_2px_0px_#0037cc] active:scale-95 transition-all ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0047FF] hover:bg-[#0039dd]"}`}
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

      {/* Mobile View - New Design */}
      <div
        className={`sm:hidden fixed inset-0 bg-white z-[70] transform transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col min-h-full p-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl hover:bg-gray-50 active:scale-95 transition-all mb-4"
              aria-label="Go back"
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

          {/* Choose Credit Package */}
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
                    className={`text-sm [font-family:'Archivo',Helvetica] self-center transition-colors ${creatingCustom ? "text-gray-400 cursor-not-allowed" : "text-gray-400 hover:text-gray-600"}`}
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

          {/* Payment Method */}
          <section className="flex flex-col gap-4 p-4 rounded-3xl border-2 border-gray-700 mb-6">
            <h2 className="[font-family:'Archivo',Helvetica] font-medium text-gray-500 text-base">
              Payment Method
            </h2>

            <div className="flex flex-col gap-3">{paymentOptions}</div>
          </section>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleBuyCredits}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2.5 py-4 w-full rounded-2xl transition-all ${isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-[#0047FF] hover:bg-[#0039dd] active:scale-95"}`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base">
                    Processing...
                  </span>
                </>
              ) : (
                <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-base">
                  Buy
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center py-4 w-full"
            >
              <span className="[font-family:'Archivo',Helvetica] font-normal text-gray-400 text-base">
                Revoke access
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(BuyCreditsModal);
