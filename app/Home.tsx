import Scene from "./scene";
import Chat from "./chat";
import { openai } from "./page";

export default function Home() {
  const handleVoice = async (url: string) => {
    "use server";

    const audioBuffer = Buffer.from(url, "base64");
    const mimeType = "audio/webm";
    const blob = new Blob([audioBuffer], { type: mimeType });

    const file = new File([blob], "voice-recording", { type: blob.type });
    await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Scene />
      <Chat onRecordingStopped={handleVoice} />
    </main>
  );
}
