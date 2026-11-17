import type { MediaKey } from './media';

/**
 * The homepage content, transcribed from the reference (docs/reference-audit.md §2).
 * A newline in a heading is the desktop line break. Copy the reference does not expose
 * (success messages, English validation errors) is our own and marked as such.
 */
type MediaIds = Record<MediaKey, number>;

const responsive = (
  media: MediaIds,
  alt: string,
  image: MediaKey,
  crops: Partial<Record<'max1439' | 'max991' | 'max767' | 'max479', MediaKey>> = {},
) => ({
  image: media[image],
  max1439: crops.max1439 ? media[crops.max1439] : null,
  max991: crops.max991 ? media[crops.max991] : null,
  max767: crops.max767 ? media[crops.max767] : null,
  max479: crops.max479 ? media[crops.max479] : null,
  alt,
});

const SEO = {
  metaTitle: 'NŌTA | Writing Infrastructure for Modern Thinking',
  // The reference's description is ~300 characters; shortened to fit the 160 limit.
  metaDescription:
    'NŌTA is a smart writing system: a precision smart pen, intelligent paper and real-time sync for people who think better by hand.',
};

export const productSeed = (media: MediaIds) => ({
  name: 'Nota One',
  slug: 'nota-one',
  price: 300,
  currency: 'USD' as const,
  colorways: [
    { name: 'Graphite Black.', tagline: 'Clarity in silence.', textColor: '#FFFFFF', swatch: '#2B2D31', image: responsive(media, 'Graphite black NŌTA pen on a dark gradient', 'colorway-graphite') },
    { name: 'Mist Blue.', tagline: 'Light thinking.', textColor: '#FFFFFF', swatch: '#3D4F86', image: responsive(media, 'Mist blue NŌTA pen on a blue gradient', 'colorway-mist') },
    { name: 'Precision Red.', tagline: 'Form follows thought.', textColor: '#FFFFFF', swatch: '#C8402E', image: responsive(media, 'Precision red NŌTA pen on a red gradient', 'colorway-red') },
    { name: 'Bright Orange.', tagline: 'Steady focus.', textColor: '#5E1550', swatch: '#E5781E', image: responsive(media, 'Bright orange NŌTA pen on an orange and violet gradient', 'colorway-orange') },
  ],
});

export const globalSeed = (media: MediaIds, productDocumentId: string) => ({
  siteName: 'NŌTA',
  logo: media['nota-wordmark'],
  brandMark: media['nota-brand-mark'],
  favicon: media['nota-favicon'],
  navigation: [
    { label: 'Specifications', targetAnchor: 'specifications' },
    { label: "Who it's for", targetAnchor: 'who-its-for' },
    { label: 'About', targetAnchor: 'about' },
    { label: 'Inside the box', targetAnchor: 'inside-the-box' },
  ],
  orderCta: { label: 'Order', product: { documentId: productDocumentId } },
  mobileMenu: {
    image: responsive(media, 'Mist blue NŌTA pen, cap and nib in close-up', 'menu-pen', { max767: 'menu-pen-767', max479: 'menu-pen-479' }),
  },
  preloader: { enabled: true },
  waitlistModal: {
    title: 'Stay ahead',
    subtitle: 'Launching soon. Get early access\nand insider updates',
    emailPlaceholder: 'E-mail',
    submitLabel: 'Notify me',
    closeLabel: 'Close',
    // Ours: the reference's success state is only reachable by submitting a real address.
    successTitle: 'You’re on the list',
    successMessage: 'Thanks. We’ll email you as soon as NŌTA One is ready to order.',
    // Ours: the reference's "required" message is in Russian; invalid emails use the browser tooltip.
    errorRequired: 'Please enter your email',
    errorInvalidEmail: 'Please enter a valid email address',
    errorGeneric: 'Something went wrong! Try again',
  },
  footer: {
    tagline: 'NŌTA creates tools that respect the way people think and write.\nNatural handwriting, quietly connected to digital structure.',
    navHeading: 'Navigation',
    yearLabel: 'Year',
    yearValue: '2026',
    copyright: '@2026 Nōta Team',
    credits: [
      { label: 'Made in Taptop', url: 'https://taptop.pro/', opensTeamPopover: false },
      { label: 'Builded by NōtaTeam', url: null, opensTeamPopover: true },
      { label: 'Designed by Alice', url: 'https://www.behance.net/alicem', opensTeamPopover: false },
      { label: '& UPROCK Studio', url: 'https://www.uprock.ru/', opensTeamPopover: false },
    ],
    teamGroups: [
      { people: ['Alexandra Kazimirskaya', 'Daria Zubareva', 'Olga Kopyeva', 'Stefania Orlova', 'Dobrinya Karepin'].map((name) => ({ name })) },
      { people: ['Maya Melnichuk', 'Valeria Yalova-Chernova', 'Natalia Borovkova', 'Anastasia Voronova'].map((name) => ({ name })) },
    ],
    popoverCloseLabel: 'Close credits',
  },
  defaultSeo: { ...SEO, ogImage: media['nota-share-image'] },
});

export const homepageSeed = (media: MediaIds, productDocumentId: string) => ({
  title: 'Homepage',
  seo: { ...SEO, ogImage: media['nota-share-image'] },
  sections: [
    {
      __component: 'sections.hero',
      anchorId: 'hero',
      isHidden: false,
      heading: 'Smart pen\nfor real thinking',
      sequence: media['hero-sequence'],
      image: responsive(media, 'Silver NŌTA smart pen, nib pointing forward', 'hero-first-frame', { max991: 'hero-pen-991' }),
    },
    {
      __component: 'sections.specs',
      anchorId: 'specifications',
      isHidden: false,
      headingMuted: 'Nota pen',
      heading: 'Specifications',
      penImage: responsive(media, 'Silver NŌTA smart pen, nib up', 'specs-pen', { max991: 'specs-pen-991', max767: 'specs-pen-767' }),
      groups: [
        { title: 'Writing System', items: ['Fountain pen nib', 'Natural ink flow', 'Replaceable fountain-pen ink cartridge', 'Designed for precise, expressive handwriting'].map((text) => ({ text })) },
        { title: 'Capture Technology', items: ['High-precision optical tracking', 'Real-time stroke capture', 'Line-by-line accuracy', 'Supports handwriting, diagrams, sketches'].map((text) => ({ text })) },
        { title: 'Digital Continuity', items: ['Notes sync automatically', 'Searchable over time', 'Structured with ai support', 'Ready when you return'].map((text) => ({ text })) },
      ],
    },
    {
      __component: 'sections.audience',
      anchorId: 'who-its-for',
      isHidden: false,
      statement:
        'Some thoughts need time, space, and a physical trace to exist. Writing by hand creates focus, presence, and a deeper connection with ideas. This tool is built around that simple truth.',
      eyebrow: "WHO IT'S FOR:",
      intro: [
        { text: 'This tool is made for people who think on paper. It keeps handwriting natural and focused, letting you write the way you always have without distractions or screens getting in the way.' },
        { text: 'Everything you write syncs to the app, where your notes are organized, searchable, and ready to work with AI when you need more clarity or structure.' },
      ],
      cards: [
        {
          title: 'Students & Learners',
          body: 'Handwritten notes stay personal and intuitive, but become searchable, organized, and easy to study. Lectures, ideas, and revisions are captured as they are — then supported by AI summaries, text recognition, and quick navigation when it matters most.',
        },
        {
          title: 'Creators, Designers & Architects',
          body: 'Sketches, diagrams, concepts, and fragments of ideas belong on paper. This tool makes sure they don’t disappear. Everything drawn or written is safely stored, easy to revisit, and ready to evolve into something bigger — without interrupting the creative flow.',
        },
        {
          title: 'Managers & Product Thinkers',
          body: 'Meetings start on paper and end with structure. Notes turn into clear summaries, tasks, and follow-ups. The pen captures everything quietly, while the app helps organize decisions without pulling attention away from the room.',
        },
      ],
      video: { file: media['audience-video'], poster: null, description: 'Close-up of the NŌTA pen nib turning in soft light' },
    },
    {
      __component: 'sections.smart-paper',
      anchorId: 'about',
      isHidden: false,
      headingMuted: 'Works with',
      heading: 'smart paper',
      steps: [
        {
          heading: 'We use special paper\nwith a nearly invisible\npattern',
          subheading: "For the pen, it's a precise map",
          body: 'The pattern defines exact coordinates across the page, allowing the pen to capture every stroke with precision and consistency. For you, it feels like ordinary paper. For the system, it becomes a stable reference that turns handwriting into structured, accurate digital data.',
          image: responsive(media, 'Black NŌTA Smart Paper notebook with a red label', 'paper-1', { max991: 'paper-1-991', max767: 'paper-1-767', max479: 'paper-1-479' }),
        },
        {
          heading: 'Looks like paper.\nWorks like a system.',
          subheading: 'For you, it’s just a blank sheet',
          body: 'You write freely, without grids, guides, or visible markers. The paper feels clean and familiar, keeping your focus on ideas instead of tools. Nothing distracts you from the act of writing. Nothing changes in how you write — only what becomes possible after.',
          image: responsive(media, 'Smart Paper notebook lying at an angle', 'paper-2', { max991: 'paper-2-991', max767: 'paper-2-767', max479: 'paper-2-479' }),
        },
        {
          heading: 'No delays. No glitches.\nNo random effects.',
          subheading: 'AI-powered structure',
          body: 'Handwriting is processed in real time and enriched quietly in the background. AI recognizes text, structure, and context to organize notes, highlight key ideas, and connect thoughts over time. The technology stays invisible, so your focus remains fully on writing.',
          image: responsive(media, 'Open notebook with a handwritten to-do list', 'paper-3', { max991: 'paper-3-991', max767: 'paper-3-767', max479: 'paper-3-479' }),
        },
        {
          heading: 'Everything you write is synced\nto your phone in real time',
          subheading: 'Your notes. Already there.',
          body: 'Every note is instantly transferred to your device and safely stored in your personal space. Access your thoughts anytime, organize them effortlessly, and continue working across devices. Your handwriting becomes part of a system that is searchable, structured, and always available.',
          image: responsive(media, 'Phone showing the synced handwritten list in the NŌTA app', 'paper-4', { max991: 'paper-4-991', max479: 'paper-4-479' }),
        },
      ],
    },
    {
      __component: 'sections.inside-box',
      anchorId: 'inside-the-box',
      isHidden: false,
      headingMuted: 'Inside',
      heading: 'the box',
      kitTitle: 'A complete, ready-to-use set',
      kitBody: 'Smart pen, Smartpaper notepad, charging cable, and instructions — carefully packaged for a hassle-free start.',
      kitImage: responsive(media, 'Open NŌTA box with the Smart Paper notebook and pen', 'kit', { max1439: 'kit-1439', max479: 'kit-479' }),
      statement:
        'A precision smart pen with a solid aluminum body, designed for natural handwriting and accurate digital capture. Seamlessly connects to smart paper, translating every stroke into structured digital data — no screens, no distractions, just writing.',
      items: [
        {
          name: 'The NŌTA Smart Pen',
          description: 'Aluminum body, USB-C charging, physical control button, and Bluetooth connectivity.\nUp to 8 hours of active use with a lightweight, balanced design for everyday writing.',
          image: responsive(media, 'NŌTA smart pen in profile, nib to the left', 'box-pen', { max991: 'box-pen-991', max767: 'box-pen-767', max479: 'box-pen-479' }),
        },
        {
          name: 'Charging Adapter',
          description: 'Compact USB-C power adapter with stable output for everyday charging.\nDesigned for safe, efficient power delivery with minimal heat.',
          image: responsive(media, 'Silver USB-C charging adapter with cable', 'box-adapter', { max991: 'box-adapter-991', max767: 'box-adapter-767', max479: 'box-adapter-479' }),
        },
      ],
    },
    {
      __component: 'sections.details',
      anchorId: 'details',
      isHidden: false,
      tiles: [
        { label: 'Flush-fit precision cap', video: null, image: responsive(media, 'Pen cap seated flush against the barrel', 'detail-1', { max1439: 'detail-1-1439', max991: 'detail-1-991', max767: 'detail-1-767', max479: 'detail-1-479' }) },
        { label: 'Refined colors. Personal expression', video: null, image: responsive(media, 'Mist blue pen and cap on a blue gradient', 'detail-2', { max767: 'detail-2-767', max479: 'detail-2-479' }) },
        { label: null, video: null, image: responsive(media, 'Close-up of the pen’s control button', 'detail-3', { max991: 'detail-3-991' }) },
        { label: 'Durable metal nib, low-profile control button', video: media['detail-video'], image: null },
        { label: 'Aluminum body', video: null, image: responsive(media, 'Aluminum pen body in profile', 'detail-5', { max1439: 'detail-5-1439', max991: 'detail-5-991', max767: 'detail-5-767', max479: 'detail-5-479' }) },
        { label: null, video: null, image: responsive(media, 'End of the pen barrel in close-up', 'detail-6', { max991: 'detail-6-991', max479: 'detail-6-479' }) },
      ],
    },
    {
      __component: 'sections.colorways',
      anchorId: 'colorways',
      isHidden: false,
      headingStart: 'Impossible to',
      headingEnd: 'overthink',
      introImage: responsive(media, 'Silver NŌTA pen, nib down, on a grey gradient', 'colorway-intro'),
      product: { documentId: productDocumentId },
    },
  ],
});
