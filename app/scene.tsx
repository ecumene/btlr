"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import Chat from "./chat";
import { SSE as EventSource } from "sse.js";

async function* fetchStreamingText(url: string, body: string) {
  const eventSource = new EventSource(url, {
    method: "POST",
    payload: body,
  });

  try {
    while (true) {
      const event = await new Promise((resolve, reject) => {
        eventSource.onmessage = (e) => resolve(e.data);
        eventSource.onerror = (e) => reject(e);
      });

      yield event as string;
    }
  } finally {
    eventSource.close();
  }
}

export default function Scene() {
  return (
    <div className="w-screen h-screen">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 10, 0], fov: 20 }}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.25}
          penumbra={5}
          decay={0}
          intensity={Math.PI * 2}
        />
        <pointLight
          position={[10, 10, 10]}
          decay={0}
          intensity={Math.PI * 10}
        />
        <Chat onRecordingStopped={fetchStreamingText} />
      </Canvas>
    </div>
  );
}
