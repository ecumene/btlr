"use client";

import { useLoader } from "@react-three/fiber";
import useVoice from "./useVoice";
import { blobToBase64 } from "./utils";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

type Props = {
  onRecordingStopped: (
    url: string,
    body: string
  ) => AsyncGenerator<string, void, unknown>;
};

export default function Chat({ onRecordingStopped }: Props) {
  const controller = useLoader(GLTFLoader, "/models/controller.gltf");
  const startButton = useLoader(GLTFLoader, "/models/startbutton.gltf");
  const stopButton = useLoader(GLTFLoader, "/models/stopbutton.gltf");

  const { isRecording, startRecording, stopRecording, isBlocked } = useVoice(
    async (_, event) => {
      const inBase64 = await blobToBase64(event.data);
      const outBase64 = await onRecordingStopped("/api", inBase64);

      const queue: HTMLAudioElement[] = [];
      for await (const out of outBase64) {
        const audio = new Audio(out);
        if (queue.length === 0) {
          audio.play();
        }

        queue.push(audio);

        audio.onended = () => {
          queue.splice(0, 1);
          if (queue.length === 0) return;
          const audio = queue[0];
          audio.play();
        };
      }
    }
  );

  return (
    <group position={[0, -2, 0]} scale={[0.8, 0.8, 0.8]}>
      <primitive object={controller.scene} />
      <primitive
        onClick={startRecording}
        object={startButton.scene}
        scale={[1, isRecording || isBlocked ? 0.5 : 1, 1]}
      />
      <primitive
        onClick={stopRecording}
        object={stopButton.scene}
        scale={[1, !isRecording ? 0.5 : 1, 1]}
      />
    </group>
  );
}
