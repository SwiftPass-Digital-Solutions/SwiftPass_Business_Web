import React, { useMemo, useCallback } from "react";

interface TransactionsProps {
  open: boolean;
  onClose: () => void;
  history: Array<any>;
  selectedCredits?: number | string;
  selectedAmount?: number;
}

const Transactions: React.FC<TransactionsProps> = ({ open, onClose, history, selectedCredits, selectedAmount }) => {
  const tx = history && history.length > 0 ? history[0] : null;

  const formattedDate = useMemo(() => {
    const d = new Date(tx?.createdAt ?? tx?.date ?? Date.now());
    return d.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [tx?.createdAt, tx?.date]);

  const formatAmount = useCallback((amt: any) => {
    const n = Number(amt ?? 0);
    return `₦${n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  }, []);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!open) return null;

  const orderDetails = [
    { label: 'Transaction Date', value: tx ? formattedDate : ' - ' },
    { label: 'Transaction ID', value: tx?.transactionId ?? tx?.id ?? ' - ' },
    { label: 'Customer Email', value: tx?.customerEmail ?? tx?.email ?? ' - ' },
    { label: 'Customer Name', value: tx?.customerName ?? tx?.name ?? ' - ' },
    { label: 'Credit Unit', value: String(selectedCredits ?? (tx?.credits ?? tx?.creditUnit ?? ' - ')) },
    { label: 'Total Amount', value: (typeof selectedAmount !== 'undefined' && selectedAmount !== null) ? formatAmount(selectedAmount) : (tx ? formatAmount(tx.amount ?? tx.total ?? 0) : ' - ') },
    { label: 'Payment Partners', value: tx?.paymentPartner ?? tx?.paymentMethod ?? 'Paystack' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300" onClick={handleClose} aria-hidden="true" />

      <div className={`fixed top-4 right-4 bottom-4 w-full sm:w-[640px] bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="overflow-hidden p-8">
            <div className="flex flex-col w-[609px] items-start justify-between relative self-stretch">
              <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
                  <header className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="inline-flex items-center justify-center gap-3 relative flex-[0_0_auto]">
                      <button onClick={handleClose} className="inline-flex items-center justify-center gap-2 p-3.5 relative flex-[0_0_auto] bg-white rounded-xl border border-solid border-[#ededed] shadow-[0px_2px_5.6px_#dbdbdb40]" aria-label="Go back">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>

                      <h1 className="relative w-fit [font-family:'Archivo',Helvetica] font-medium text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap">Order Preview</h1>
                    </div>
                  </header>

                  <section className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
                    <dl className="flex flex-col items-start gap-3 p-3 relative self-stretch w-full flex-[0_0_auto] rounded-3xl border border-solid border-[#efefef]">
                      {orderDetails.map((detail, index) => (
                        <div key={index} className="flex items-center justify-between p-4 relative self-stretch w-full flex-[0_0_auto] rounded-lg shadow-[0px_2px_14.7px_#ececec40]">
                          <dt className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                            <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-lg tracking-[-0.54px] leading-[normal] whitespace-nowrap">{detail.label}</span>
                          </dt>

                          <div className="relative w-1.5 h-1.5 bg-[#e6e6e6] rounded-[3px] aspect-[1]" aria-hidden="true" />

                          <dd className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-lg tracking-[-0.54px] leading-[normal] whitespace-nowrap">{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                </div>

                <aside className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                  <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Archivo',Helvetica] font-semibold text-black text-xl tracking-[-0.60px] leading-[29.0px]">Note:</h2>

                  <p className="relative self-stretch [font-family:'Archivo',Helvetica] font-normal text-gray-500 text-lg tracking-[-0.60px] leading-[29.0px]">We neither collect nor store your card details. All payments are made directly through the selected payment partner.</p>
                </aside>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <button onClick={() => {}} className="flex items-center justify-center gap-2.5 p-3 relative flex-1 grow bg-[#0047FF] rounded-xl border border-solid border-[#0844c4] shadow-[0px_2px_0px_#dcdcdc]">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">Proceed</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Transactions);