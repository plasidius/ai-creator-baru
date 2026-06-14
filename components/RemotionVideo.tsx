"use client";
import { Player } from "@remotion/player";
import RemotionVideo from "./RemotionVideo"; // sesuaikan path

export default function VideoPreview({ title }: { title: string }) {
  return (
    <Player
      component={RemotionVideo}
      inputProps={{ title }}
      durationInFrames={150}
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      style={{ width: "100%", height: "auto" }}
      controls
    />
  );
}