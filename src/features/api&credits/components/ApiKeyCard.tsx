import React from "react";

const ApiKeyCard = React.memo(
  ({
    keyObj,
    index,
    onCopy,
    actualKey,
    isVisible = false,
    onToggleVisibility,
  }: {
    keyObj: any;
    index: number;
    onCopy: (key: string) => void;
    actualKey?: string;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
  }) => {
    const keyToCopy = actualKey || keyObj.key;

    return (
      <section
        className={`flex flex-col justify-center gap-2 sm:gap-3 p-4 sm:p-6 w-full bg-[#fafbfe] rounded-xl border border-solid border-[#cbd5ff] items-center ${keyObj.revoked ? "opacity-50" : ""}`}
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
            <>
              {onToggleVisibility && (
                <button
                  className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0"
                  onClick={onToggleVisibility}
                  aria-label={
                    isVisible ? `Hide ${keyObj.type}` : `Show ${keyObj.type}`
                  }
                  type="button"
                >
                  {isVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              )}

              <button
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0"
                onClick={() => onCopy(keyToCopy)}
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
            </>
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
    );
  },
);

ApiKeyCard.displayName = "ApiKeyCard";

export default ApiKeyCard;
