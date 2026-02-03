import { useState } from "react";

export const InvitationSent = ({
  email,
  onClose,
}: {
  email: string;
  onClose?: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = () => {
    setIsProcessing(true);
    if (onClose) onClose();
  };

  const handleGoHome = () => {
    setIsProcessing(true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <section
        className="inline-flex flex-col items-center gap-6 p-8 relative bg-white rounded-lg shadow-lg"
        role="dialog"
        aria-labelledby="invitation-title"
        aria-describedby="invitation-description"
      >
        <header className="flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 bg-[#f8f2fb] rounded-[52px] aspect-[1] flex relative">
          <div
            className="relative w-fit [font-family:'Archivo',Helvetica] font-normal text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap"
            role="img"
            aria-label="Party popper celebration emoji"
          >
            🎉
          </div>
        </header>

        <div className="flex-col w-[411px] items-center gap-1 flex-[0_0_auto] flex relative">
          <h1
            id="invitation-title"
            className="relative self-stretch mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-dark-dark-1000 text-lg text-center tracking-[-0.54px] leading-[26.1px]"
          >
            Invitation sent
          </h1>

          <p
            id="invitation-description"
            className="relative self-stretch [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-neutral-850 text-xs text-center tracking-[0] leading-[17.4px]"
          >
            Invitation sent to {email}. They&apos;ll need to accept the invite to
            activate their account.
          </p>
        </div>

        <footer className="w-[411px] items-start gap-3 flex-[0_0_auto] flex relative">
          <button
            className="all-[unset] box-border flex items-center justify-center gap-2.5 p-4 relative flex-1 grow bg-primitives-neutral-neutral-500 rounded-xl border border-solid border-primitives-neutral-neutral-600 shadow-[0px_4px_0px_#dcdcdc]"
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
            className="items-center justify-center gap-2.5 p-4 flex-1 grow bg-[#0C39ED] rounded-xl border border-solid border-primitives-primary-blue-300 shadow-[0px_4px_0px_#3d61f1] flex relative"
            onClick={handleGoHome}
            disabled={isProcessing}
            type="button"
            aria-label="Confirm and go to home page"
          >
            <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-neutral-50 text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
              Yay, go home
            </span>
          </button>
        </footer>
      </section>
    </div>
  );
};

export default InvitationSent;
