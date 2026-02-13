import React, { useMemo, useCallback, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useDashboardStatusQuery } from "@/services/dashboard";

interface TransactionsProps {
  open: boolean;
  onClose: () => void;
  history: Array<any>;
  selectedCredits?: number | string;
  selectedAmount?: number;
  checkoutUrl?: string;
  onPaymentSuccess?: () => void; // ← NEW: triggers billing history refetch
}

interface FrameProps {
  onClose: () => void;
  onGoHome: () => void;
}

const Frame: React.FC<FrameProps> = ({ onClose, onGoHome }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = () => {
    setIsProcessing(true);
    onClose();
  };

  const handleGoHome = () => {
    setIsProcessing(true);
    onGoHome();
  };

  return (
    <div
      className="inline-flex flex-col items-center gap-6 p-4 sm:p-8 relative bg-white w-full sm:w-full"
      data-model-id="139:305"
      role="dialog"
      aria-labelledby="success-title"
      aria-describedby="success-description"
    >
      <div
        className="flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 bg-[#f8f2fb] rounded-[52px] aspect-[1] flex relative"
        role="img"
        aria-label="Party celebration emoji"
      >
        <div className="relative w-fit [font-family:'Archivo',Helvetica] font-normal text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap">
          🎉
        </div>
      </div>

      <div className="flex-col w-full sm:w-[280px] items-center gap-1 flex-[0_0_auto] flex relative">
        <h1
          id="success-title"
          className="relative self-stretch mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-dark-dark-1000 text-lg text-center tracking-[-0.54px] leading-[26.1px]"
        >
          Successful buy
        </h1>

        <p
          id="success-description"
          className="relative w-fit [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-neutral-850 text-xs tracking-[0] leading-[17.4px] whitespace-nowrap"
        >
          You have successfully bought more credits!
        </p>
      </div>

      <div className="flex flex-col-reverse w-full gap-3 sm:flex-row sm:w-[411px] sm:items-start sm:flex-[0_0_auto] relative">
        <button
          className="all-[unset] box-border flex items-center justify-center gap-2.5 p-4 relative flex-1 grow bg-primitives-neutral-neutral-500 rounded-xl border border-solid border-primitives-neutral-neutral-600 shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCancel}
          disabled={isProcessing}
          type="button"
          aria-label="Cancel and close dialog"
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
            Cancel
          </span>
        </button>

        <button
          className="all-[unset] box-border items-center justify-center gap-2.5 p-4 flex-1 grow bg-[#0C39ED] rounded-xl border border-solid border-primitives-primary-blue-300 shadow-[0px_4px_0px_#3d61f1] flex relative cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#3d61f1] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGoHome}
          disabled={isProcessing}
          type="button"
          aria-label="Go to home page"
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-neutral-50 text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
            Yay, go home
          </span>
        </button>
      </div>
    </div>
  );
};

const Transactions: React.FC<TransactionsProps> = ({
  open,
  onClose,
  history,
  selectedCredits,
  selectedAmount,
  checkoutUrl,
  onPaymentSuccess, // ← NEW
}) => {
  const [showSuccessFrame, setShowSuccessFrame] = useState(false);
  const tx = history && history.length > 0 ? history[0] : null;
  const { data: statusResp } = useDashboardStatusQuery(undefined, {
    skip: !open,
  });
  const fetchedEmail = statusResp?.data?.email ?? null;

  const formattedDate = useMemo(() => {
    const d = new Date(tx?.createdAt ?? tx?.date ?? Date.now());
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [tx?.createdAt, tx?.date]);

  const tempTransactionId = useMemo(
    () =>
      `pending_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    [],
  );

  const formatAmount = useCallback((amt: any) => {
    const n = Number(amt ?? 0);
    return `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const handleClose = useCallback(() => onClose(), [onClose]);

  // ─── Shared Paystack callback logic ────────────────────────────────────────
  const handlePaystackCallback = useCallback(
    async (response: any) => {
      // eslint-disable-next-line no-console
      console.log("Paystack payment successful", response);

      const callbackUrl = import.meta.env.VITE_PAYSTACK_CALLBACK_URL as string;

      try {
        const res = await fetch(
          `${callbackUrl}?reference=${response.reference}`,
          {
            method: "GET",
          },
        );

        const data = await res.json();
        // eslint-disable-next-line no-console
        console.log("Server verification response", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error verifying payment on server", err);
      } finally {
        // ✅ Always refetch billing history after payment — even if our
        //    verification endpoint is temporarily unreachable, Paystack
        //    already confirmed the charge on their end.
        onPaymentSuccess?.();
        setShowSuccessFrame(true);
      }
    },
    [onPaymentSuccess],
  );

  const startPayment = useCallback(() => {
    // If a hosted checkout URL was provided, open it only when the user
    // clicks `Proceed` (user requested behavior).
    if (checkoutUrl) {
      try {
        const newWin = window.open(String(checkoutUrl), "_blank");
        if (newWin) newWin.opener = null;
      } catch {
        try {
          window.location.assign(String(checkoutUrl));
        } catch {
          // ignore
        }
      }
      return;
    }
    const publicKey =
      (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || "";
    if (!publicKey) {
      // eslint-disable-next-line no-console
      console.warn("Missing VITE_PAYSTACK_PUBLIC_KEY environment variable");
      return;
    }

    const email =
      fetchedEmail ?? tx?.customerEmail ?? tx?.email ?? "customer@example.com";
    const amountNaira =
      typeof selectedAmount !== "undefined" && selectedAmount !== null
        ? selectedAmount
        : (tx?.amount ?? tx?.total ?? 0);
    const amountKobo = Math.round(Number(amountNaira) * 100);

    const paystackConfig = {
      key: publicKey,
      email,
      amount: amountKobo,
      ref: `sp_${Date.now()}`,
      onClose: () => {
        // eslint-disable-next-line no-console
        console.log("Paystack payment closed");
      },
      // ✅ Use shared handler — no more duplicated callback blocks
      callback: handlePaystackCallback,
    };

    const paystackInstance = new (PaystackPop as any)();
    const handler = paystackInstance.setup
      ? paystackInstance.setup(paystackConfig)
      : (PaystackPop as any).setup(paystackConfig);

    if (handler && typeof handler.open === "function") {
      handler.open();
    } else if (handler && typeof (handler as any).openIframe === "function") {
      (handler as any).openIframe();
    } else {
      // eslint-disable-next-line no-console
      console.warn("Paystack handler does not expose open/openIframe methods");
    }
  }, [checkoutUrl, fetchedEmail, selectedAmount, tx, handlePaystackCallback]);

  if (!open) return null;

  const orderDetails = [
    { label: "Transaction Date", value: formattedDate },
    {
      label: "Transaction ID",
      value: tx?.transactionId ?? tx?.id ?? tempTransactionId,
    },
    {
      label: "Customer Email",
      value: fetchedEmail ?? tx?.customerEmail ?? tx?.email ?? " - ",
    },
    { label: "Customer Name", value: tx?.customerName ?? tx?.name ?? " - " },
    {
      label: "Credit Unit",
      value: String(selectedCredits ?? tx?.credits ?? tx?.creditUnit ?? " - "),
    },
    {
      label: "Total Amount",
      value:
        typeof selectedAmount !== "undefined" && selectedAmount !== null
          ? formatAmount(selectedAmount)
          : tx
            ? formatAmount(tx.amount ?? tx.total ?? 0)
            : " - ",
    },
    {
      label: "Payment Partners",
      value: tx?.paymentPartner ?? tx?.paymentMethod ?? "Paystack",
    },
  ];

  return (
    <>
      {!showSuccessFrame && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {!showSuccessFrame && (
        <div
          className={`fixed top-4 left-4 right-4 bottom-4 sm:left-auto sm:right-4 sm:w-[640px] bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 sm:p-8">
              <div className="flex flex-col w-full max-w-[609px] items-start justify-between relative self-stretch">
                <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
                    <header className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="inline-flex items-center justify-center gap-3 relative flex-[0_0_auto]">
                        <button
                          onClick={handleClose}
                          className="inline-flex items-center justify-center gap-2 p-3.5 relative flex-[0_0_auto] bg-white rounded-xl border border-solid border-[#ededed] shadow-[0px_2px_5.6px_#dbdbdb40]"
                          aria-label="Go back"
                        >
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M15 18l-6-6 6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <h1 className="relative w-fit [font-family:'Archivo',Helvetica] font-medium text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap">
                          Order Preview
                        </h1>
                      </div>
                    </header>

                    <section className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
                      <dl className="flex flex-col items-start gap-3 p-3 relative self-stretch w-full flex-[0_0_auto] rounded-3xl border border-solid border-[#efefef]">
                        {orderDetails.map((detail, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 relative self-stretch w-full flex-[0_0_auto] rounded-lg shadow-[0px_2px_14.7px_#ececec40] gap-2"
                          >
                            <dt className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                              <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-sm sm:text-lg tracking-[-0.54px] leading-[normal] whitespace-nowrap">
                                {detail.label}
                              </span>
                            </dt>

                            <div
                              className="relative w-1.5 h-1.5 bg-[#e6e6e6] rounded-[3px] aspect-[1] shrink-0"
                              aria-hidden="true"
                            />

                            <dd className="relative mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-sm sm:text-lg tracking-[-0.54px] leading-[normal] text-right break-all sm:whitespace-nowrap sm:break-normal">
                              {detail.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  </div>

                  <aside className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Archivo',Helvetica] font-semibold text-black text-xl tracking-[-0.60px] leading-[29.0px]">
                      Note:
                    </h2>
                    <p className="relative self-stretch [font-family:'Archivo',Helvetica] font-normal text-gray-500 text-sm sm:text-lg tracking-[-0.60px] leading-[29.0px]">
                      We neither collect nor store your card details. All
                      payments are made directly through the selected payment
                      partner.
                    </p>
                  </aside>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
                <button
                  onClick={startPayment}
                  className="flex items-center justify-center gap-2.5 p-3 relative flex-1 grow bg-[#0047FF] rounded-xl border border-solid border-[#0844c4] shadow-[0px_2px_0px_#dcdcdc]"
                >
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Proceed
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessFrame && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[80] transition-opacity duration-300"
            onClick={() => setShowSuccessFrame(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="w-full sm:w-auto rounded-3xl overflow-hidden [animation:fadeIn_0.2s_ease-out]">
              <Frame
                onClose={() => setShowSuccessFrame(false)}
                onGoHome={() => {
                  setShowSuccessFrame(false);
                  onClose();
                }}
              />
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes mobileSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default React.memo(Transactions);
