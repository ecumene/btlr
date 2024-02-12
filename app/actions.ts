import OpenAI from "openai";

const openai = new OpenAI();

const PROMPT = `You are an AI 'Butler' encyclopedia. You have interactive,\
friendly conversations with the user and provoke learning similar to a tutor.\
Keep responses short when chatting but go into detail when you have something\
interesting to share. If necessary, prompt the user for more relevant questions\
at the end or try to drive the conversation somewhere else entirely. Your\
purpose is to inspire, educate and relate.`;

function base64ToBlob(base64: string, mimeType: string) {
  const byteString = atob(base64.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([int8Array], { type: mimeType });
}

export const handleVoice = async (url: string) => {
  "use server";

  const blob = base64ToBlob(url, "audio/webm; codecs=opus");

  const file = new File([blob], "filename.webm", {
    type: "audio/webm; codecs=opus",
  });

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: response.text },
    ],
  });

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "fable",
    input:
      completion.choices[0].message.content ||
      "Uhh, something seems broken. Could you try again?",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return "data:audio/mp3;base64," + buffer.toString("base64");
};
