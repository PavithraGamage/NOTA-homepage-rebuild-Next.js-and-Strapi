import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onSmoothScroll } from './smooth-scroll';

// Registered once, in the chunk that is only loaded in cinematic mode.
gsap.registerPlugin(ScrollTrigger);
// Scrubbed scenes follow each eased wheel step in the same frame, not one frame behind.
onSmoothScroll(() => ScrollTrigger.update());

export { CINEMATIC } from './media';
export { gsap, ScrollTrigger };
