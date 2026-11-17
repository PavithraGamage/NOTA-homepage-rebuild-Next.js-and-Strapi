import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Registered once for every client component that animates; tree-shaking keeps the rest out.
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { CINEMATIC } from './media';
export { gsap, ScrollTrigger, useGSAP };
