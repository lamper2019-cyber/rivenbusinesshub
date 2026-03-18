"use client";

interface VoiceOverlayProps {
  state: "listening" | "processing" | "response";
  transcript: string;
  response: string;
  hasAction: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function VoiceOverlay({
  state,
  transcript,
  response,
  hasAction,
  onConfirm,
  onClose,
}: VoiceOverlayProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[90] flex items-end md:items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && state === "response") onClose();
      }}
    >
      <div className="w-full max-w-md bg-riven-card border border-riven-border rounded-t-2xl md:rounded-2xl p-6 animate-slide-up">
        {/* Listening state */}
        {state === "listening" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-riven-gold/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-riven-gold/40 animate-ping" />
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-riven-gold absolute"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <p className="text-riven-gold font-semibold mb-2">Listening...</p>
            {transcript && (
              <p className="text-white text-sm bg-white/5 rounded-lg p-3 min-h-[40px]">
                {transcript}
              </p>
            )}
          </div>
        )}

        {/* Processing state */}
        {state === "processing" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-riven-gold/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-riven-gold border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-riven-muted mb-2">Processing...</p>
            <p className="text-white text-sm bg-white/5 rounded-lg p-3">
              &quot;{transcript}&quot;
            </p>
          </div>
        )}

        {/* Response state */}
        {state === "response" && (
          <div>
            {transcript && (
              <p className="text-xs text-riven-muted mb-2">
                You said: &quot;{transcript}&quot;
              </p>
            )}
            <p className="text-white text-sm bg-white/5 rounded-lg p-3 mb-4">
              {response}
            </p>

            <div className="flex gap-2">
              {hasAction && (
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-riven-gold text-black text-sm font-semibold rounded-lg hover:bg-riven-gold-light transition-colors"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={onClose}
                className={`px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  hasAction
                    ? "bg-white/5 text-riven-muted hover:text-white border border-riven-border"
                    : "flex-1 bg-white/5 text-white border border-riven-border hover:bg-white/10"
                }`}
              >
                {hasAction ? "Cancel" : "Done"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
