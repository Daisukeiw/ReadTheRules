import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { RoughEase, ExpoScaleEase } from "gsap/EasePack";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// ScrollSmoother fica de fora: a rolagem suave é do Lenis (ver main.tsx).
gsap.registerPlugin(useGSAP, Draggable, DrawSVGPlugin, Flip, MotionPathHelper, MotionPathPlugin, ScrollTrigger, TextPlugin, RoughEase, ExpoScaleEase, CustomEase, CustomBounce, CustomWiggle);

// Mesma curva do --ease-out do CSS, para CSS e GSAP se moverem igual.
CustomEase.create("rtr-out", "0.23, 1, 0.32, 1");

export const reduzMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP, Flip, ScrollTrigger };
