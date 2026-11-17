import { gsap } from '../gsap';
import { part, parts, sceneTimeline } from '../timeline';
import { revealWords, showWhenPinned } from './reveal';

/** Blind stripes are 33 design px apart (measured); they close as each card scrolls in. */
const STRIPE = 33;

/**
 * Inside the box: the heading fades in on the white circle and holds, then everything scrolls
 * in normal flow. The kit and product cards are revealed through closing horizontal "blinds",
 * their captions fade in, and the statement reveals word by word (light grey → black).
 */
export function insideBoxScene(section: HTMLElement) {
  // The section (white) slides in while the circle grows, so it stays hidden until it pins.
  showWhenPinned(section);
  const intro = part(section, 'intro');
  const heading = part(section, 'heading');
  if (intro && heading) {
    sceneTimeline(intro).fromTo(heading, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.33 }, 0);
  }

  parts(section, 'blinds').forEach((card) => {
    gsap.fromTo(
      card,
      { '--blind': STRIPE },
      {
        '--blind': 0,
        ease: 'sine.inOut',
        scrollTrigger: { trigger: card, start: 'top 99%', end: 'top 33%', scrub: true },
      },
    );
    const caption = part(card, 'caption');
    if (caption) {
      gsap.fromTo(
        caption,
        { autoAlpha: 0, yPercent: 20 },
        {
          autoAlpha: 1,
          yPercent: 0,
          ease: 'power1.out',
          scrollTrigger: { trigger: card, start: 'top 70%', end: 'top 45%', scrub: true },
        },
      );
    }
  });

  const statement = part(section, 'statement');
  if (statement) {
    revealWords(parts(statement, 'word'), '#dddddd', '#000000', {
      trigger: statement,
      start: 'top 75%',
      end: 'top 30%',
    });
  }
}
