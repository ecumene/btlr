import { writeFileSync } from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const PROMPT = `You are an AI 'Butler' encyclopedia. You have interactive,\
friendly conversations with the user and provoke learning similar to a tutor.\
Keep responses short when chatting but go into detail when you have something\
interesting to share. If necessary, prompt the user for more relevant questions\
at the end or try to drive the conversation somewhere else entirely. Your\
purpose is to inspire, educate and relate.`;

async function* createOpenAIVoiceStream(content: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content },
    ],
    stream: true,
  });

  let textBuffer = "";

  let n = 1;
  for await (const chunks of completion) {
    const chunk = chunks.choices[0].delta.content;
    if (hasMoreThanNSentences(textBuffer, n)) {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "fable",
        input:
          textBuffer || "Uhh, something seems broken. Could you try again?",
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      yield "data:audio/mp3;base64," + buffer.toString("base64") + "\n";

      textBuffer = "";
      if (n < 3) n += 1;
    }

    if (chunk) textBuffer += chunk;
  }

  if (textBuffer) {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "fable",
      input: textBuffer || "Uhh, something seems broken. Could you try again?",
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    yield "data:audio/mp3;base64," + buffer.toString("base64") + "\n";
  }
}

function hasMoreThanNSentences(text: string, n: number): boolean {
  const sentenceDelimiters = /[.!?]+/g;
  const sentences = text.split(sentenceDelimiters);
  return sentences.filter(Boolean).length > n;
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteString = atob(base64.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([int8Array], { type: mimeType });
}

export const POST = async (request: Request) => {
  "use server";

  const url = await request.text();

  const blob = base64ToBlob(url, "audio/webm; codecs=opus");

  const file = new File([blob], "filename.webm", {
    type: "audio/webm; codecs=opus",
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  // Write the file to disk
  writeFileSync("filename.webm", buffer);

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const iterator = createOpenAIVoiceStream(response.text);
    for await (const item of iterator) {
      writer.write(encoder.encode("data: " + item + "\n\n"));
    }
    writer.close();
  })();

  return new Response(responseStream.readable, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  });
};
