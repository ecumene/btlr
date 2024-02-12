"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import Chat from "./chat";

type Props = {
  onRecordingStopped: (url: string) => Promise<string>;
};

// function Box(props: any) {
//   // This reference gives us direct access to the THREE.Mesh object
//   const ref = useRef<THREE.Mesh>();
//   // Hold state for hovered and clicked events
//   const [hovered, hover] = useState(false);
//   const [clicked, click] = useState(false);
//   // Subscribe this component to the render-loop, rotate the mesh every frame
//   useFrame((state, delta) => {
//     if (ref.current) ref.current.rotation.x += delta;
//   });
//   // Return the view, these are regular Threejs elements expressed in JSX
//   return (
//     <mesh
//       {...props}
//       ref={ref}
//       scale={clicked ? 1.5 : 1}
//       onClick={() => click(!clicked)}
//       onPointerOver={() => hover(true)}
//       onPointerOut={() => hover(false)}
//     >
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
//     </mesh>
//   );
// }

export default function Scene({ onRecordingStopped }: Props) {
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
        <Chat onRecordingStopped={onRecordingStopped} />
      </Canvas>
    </div>
  );
}
