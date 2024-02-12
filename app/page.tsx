import Scene from "./scene";
import Chat from "./chat";
import { handleVoice } from "./actions";

export default function Home() {
  return (
    <main className="">
      <Scene onRecordingStopped={handleVoice} />
    </main>
  );
}
