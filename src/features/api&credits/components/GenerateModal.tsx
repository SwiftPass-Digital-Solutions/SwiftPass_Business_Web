import React from "react";

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
                  disabled={!selectedEnvs.Live}
                  className={`flex items-center justify-center gap-2.5 p-4 flex-1 rounded-xl border border-solid transition-colors active:shadow-none active:translate-y-1 ${
                    selectedEnvs.Live
                      ? 'bg-blue-600 border-blue-600 shadow-[0px_4px_0px_#0844c4] cursor-pointer hover:bg-blue-700'
                      : 'bg-transparent border-[#dcdcdc] cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Proceed to next step"
                >
                  <span className={`[font-family:'Archivo',Helvetica] font-medium text-base tracking-[0] leading-[23.2px] whitespace-nowrap ${
                    selectedEnvs.Live ? 'text-white' : 'text-[#4a4a4a]'
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
                      {selectedEnvs.Live ? `You are about to generate a new Live API key. For security, old keys remain active until you revoke them.` : ''}
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

export default GenerateModal;
