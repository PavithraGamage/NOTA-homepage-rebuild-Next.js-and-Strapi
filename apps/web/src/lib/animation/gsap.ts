import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registered once, in the chunk that is only loaded in cinematic mode.
gsap.registerPlugin(ScrollTrigger);

export { CINEMATIC } from './media';
export { gsap, ScrollTrigger };
