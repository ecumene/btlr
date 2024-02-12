import { useState, useEffect, useRef } from "react";

const useVoice = (cb: (recorder: MediaRecorder, ev: BlobEvent) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>();

  useEffect(() => {}, []);

  const startRecording = async () => {
    mediaRecorderRef.current = await navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setIsBlocked(false);
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
        recorder.ondataavailable = (e) => cb(recorder, e);
        return recorder;
      })
      .catch(() => {
        console.error("Permission Denied");
        setIsBlocked(true);
        return undefined;
      });
    if (isBlocked || !mediaRecorderRef.current) {
      console.error("Permission Denied or MediaRecorder not initialized");
      return;
    }
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return { isRecording, startRecording, stopRecording, isBlocked };
};

export default useVoice;
