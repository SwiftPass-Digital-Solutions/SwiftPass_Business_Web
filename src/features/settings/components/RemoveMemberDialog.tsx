import { useState } from "react";

export const RemoveMemberDialog = ({
  memberName,
  isRemoving,
  onCancel,
  onConfirm,
}: {
  memberName: string;
  isRemoving?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const [internalRemoving] = useState(false);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
    >
      <div
        className="inline-flex flex-col items-center gap-6 p-4 sm:p-8 relative bg-white w-full sm:w-auto rounded-3xl shadow-lg"
        data-model-id="134:478"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div
          className="flex-col w-[72px] h-[72px] items-center justify-center gap-2.5 p-3 bg-[#ffefef] rounded-[52px] aspect-[1] flex relative"
          aria-hidden="true"
        >
          <div className="relative w-fit [font-family:'Archivo',Helvetica] font-normal text-black text-2xl tracking-[-0.72px] leading-[34.8px] whitespace-nowrap">
            ❌
          </div>
        </div>

        <div className="flex-col w-full sm:w-[280px] items-center gap-1 flex-[0_0_auto] flex relative">
          <h2
            id="dialog-title"
            className="relative self-stretch mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-dark-dark-1000 text-lg text-center tracking-[-0.54px] leading-[26.1px]"
          >
            Remove user
          </h2>

          <p
            id="dialog-description"
            className="relative self-stretch [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-neutral-850 text-xs text-center tracking-[0] leading-[17.4px]"
          >
            Are you sure you want to revoke {memberName}?
          </p>
        </div>

        <div className="flex flex-col-reverse w-full gap-3 sm:flex-row sm:w-[411px] sm:items-start sm:flex-[0_0_auto] relative">
          <button
            className="all-[unset] box-border flex items-center justify-center gap-2.5 p-4 relative flex-1 grow bg-primitives-neutral-neutral-500 rounded-xl border border-solid border-primitives-neutral-neutral-600 shadow-[0px_4px_0px_#dcdcdc] cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#dcdcdc] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            type="button"
            aria-label="Cancel user removal"
          >
            <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
              Cancel
            </span>
          </button>

          <button
            className="all-[unset] box-border items-center justify-center gap-2.5 p-4 flex-1 grow bg-[#CC0E0E] rounded-xl border border-solid border-primitives-red-red-400 shadow-[0px_4px_0px_#ff1212] flex relative cursor-pointer hover:opacity-90 active:shadow-[0px_2px_0px_#ff1212] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            type="button"
            disabled={isRemoving || internalRemoving}
            aria-label="Confirm user removal"
          >
            <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-neutral-50 text-base tracking-[0] leading-[23.2px] whitespace-nowrap">
              {isRemoving || internalRemoving ? "Removing..." : "Yes, remove"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMemberDialog;
