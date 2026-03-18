type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

let recognition: SpeechRecognition | null = null;

export function isVoiceSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    window.SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition
  );
}

export function startListening(
  onResult: SpeechCallback,
  onError: ErrorCallback
): void {
  if (!isVoiceSupported()) {
    onError("Speech recognition is not supported in this browser.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition })
      .webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = "";
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        isFinal = true;
      }
    }
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "no-speech") {
      onError("No speech detected. Try again.");
    } else if (event.error === "not-allowed") {
      onError("Microphone access denied. Please enable it in your browser settings.");
    } else {
      onError(`Speech error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    recognition = null;
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
