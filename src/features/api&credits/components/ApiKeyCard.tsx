import React from "react";

const ApiKeyCard = React.memo(({ keyObj, index, onCopy }: { keyObj: any; index: number; onCopy: (key: string) => void }) => (
  <section
    className={`flex flex-col justify-center gap-2 sm:gap-3 p-4 sm:p-6 w-full bg-[#fafbfe] rounded-xl border border-solid border-[#cbd5ff] items-center ${keyObj.revoked ? 'opacity-50' : ''}`}
    aria-labelledby={`key-${index}-label`}
  >
    <div className="flex items-center gap-2 sm:gap-3 w-full justify-center">
      <div
        className="[font-family:'Archivo',Helvetica] font-medium text-black text-base sm:text-2xl tracking-[-0.72px] leading-[normal] break-all text-center"
        aria-label={`${keyObj.type} value`}
      >
        {keyObj.key}
      </div>

      {!keyObj.revoked && (
        <button
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0"
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
      className="[font-family:'Archivo',Helvetica] font-normal text-sm sm:text-base tracking-[-0.48px] leading-[23.2px] flex items-center gap-2"
    >
      <span className="text-[#6b7280]">{keyObj.type}</span>
      {keyObj.revoked && (
        <span className="text-[#ef4444] font-medium">Revoked</span>
      )}
    </div>
  </section>
));

ApiKeyCard.displayName = "ApiKeyCard";

export default ApiKeyCard;