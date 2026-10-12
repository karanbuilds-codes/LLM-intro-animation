import React from "react";
import { Composition } from "remotion";
import { COMPOSITION_DURATION_IN_FRAMES, LLMExplainer } from "./Video";

export const RemotionRoot = () => (
  <Composition
    id="LLMExplainer"
    component={LLMExplainer}
    durationInFrames={COMPOSITION_DURATION_IN_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
);
