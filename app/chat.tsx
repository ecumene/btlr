"use client";

import { useLoader } from "@react-three/fiber";
import useVoice from "./useVoice";
import { blobToBase64 } from "./utils";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

type Props = {
  onRecordingStopped: (url: string) => Promise<string>;
};

export default function Chat({ onRecordingStopped }: Props) {
  const controller = useLoader(GLTFLoader, "/models/controller.gltf");
  const startButton = useLoader(GLTFLoader, "/models/startbutton.gltf");
  const stopButton = useLoader(GLTFLoader, "/models/stopbutton.gltf");

  const { isRecording, startRecording, stopRecording, isBlocked } = useVoice(
    async (_, event) => {
      const inBase64 = await blobToBase64(event.data);
      const outBase64 = await onRecordingStopped(inBase64);
      const audio = new Audio(outBase64);
      audio.play().catch((e) => console.error("Error playing audio:", e));
    }
  );

  return (
    <>
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
    </>
  );
}
