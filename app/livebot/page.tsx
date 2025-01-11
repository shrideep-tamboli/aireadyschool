/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use client";

import { useRef, useState, useEffect } from "react";
import "./live.css";
import { LiveAPIProvider, useLiveAPIContext } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set NEXT_PUBLIC_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null!);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isBotTalking, setIsBotTalking] = useState(false);
  const { client } = useLiveAPIContext();
  const [botTranscript, setBotTranscript] = useState("");

  useEffect(() => {
    const handleContent = (data: any) => {
      if (data?.modelTurn?.parts) {
        const textParts = data.modelTurn.parts
          .filter((p: any) => p.text)
          .map((p: any) => p.text)
          .join(" ");
        if (textParts) {
          setBotTranscript((prev) =>
            prev ? prev + "\n" + textParts : textParts
          );
        }
      }
    };
    client.on("content", handleContent);
    return () => {
      client.off("content", handleContent);
    };
  }, [client]);

  return (
    <div className="font-['Space_Mono'] bg-white" suppressHydrationWarning>
      <div className="flex h-screen w-screen bg-neutral-100 text-gray-900">
        <SidePanel />
        <main className="relative flex flex-1 flex-col items-center justify-center gap-4 max-w-full overflow-hidden">
          <div className="flex flex-1 items-center justify-center">
            <Altair talking={isBotTalking} />
            <video
              className={cn("flex-1 max-w-[90%] rounded-3xl", {
                hidden: !videoRef.current || !videoStream,
              })}
              ref={videoRef}
              autoPlay
              playsInline
            />
          </div>
          <div className="p-4 text-sm text-gray-800 whitespace-pre-line">
            {botTranscript}
          </div>
          <ControlTray
            videoRef={videoRef}
            supportsVideo={true}
            onVideoStreamChange={setVideoStream}
          >
            {/* put your own buttons here */}
          </ControlTray>
        </main>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <LiveAPIProvider url={uri} apiKey={API_KEY}>
      <App />
    </LiveAPIProvider>
  );
}