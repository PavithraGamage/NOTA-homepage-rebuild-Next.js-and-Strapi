/**
 * Editor-facing copy for the admin: labels, help text and placeholders for every field, plus
 * the field each repeatable item is titled by ("main field"). Strapi stores this per view in
 * the database; keeping it here makes it versioned, reviewable and identical in every
 * environment (applied on boot by ./apply.ts).
 */
export type FieldCopy = { label: string; description?: string; placeholder?: string };
export type ViewCopy = {
  kind: 'content-type' | 'component';
  /** Field used to title an entry in lists and repeatable items. */
  mainField?: string;
  fields: Record<string, FieldCopy>;
};

const f = (label: string, description?: string, placeholder?: string): FieldCopy => ({ label, description, placeholder });

const LINE_BREAKS = 'Press Enter where the line should break on large screens. Phones wrap the text naturally.';
const ANCHOR_HELP = 'Lowercase words joined by hyphens. Navigation links scroll to the section with this anchor.';
const HIDDEN_HELP = 'Hide this section from the live page without deleting its content.';

const section = (anchorPlaceholder: string) => ({
  anchorId: f('Anchor', ANCHOR_HELP, anchorPlaceholder),
  isHidden: f('Hide section', HIDDEN_HELP),
});

export const EDITOR_COPY: Record<string, ViewCopy> = {
  // ---------- content types ----------
  'api::global.global': {
    kind: 'content-type',
    mainField: 'siteName',
    fields: {
      siteName: f('Site name', 'Used in the browser tab and as the brand name in SEO fallbacks.', 'NŌTA'),
      logo: f('Logo', 'The wordmark at the top left of the header. SVG recommended.'),
      brandMark: f('Brand mark', 'The small icon in the header panel next to the order button. SVG recommended.'),
      favicon: f('Favicon', 'Browser tab icon. Square SVG or PNG.'),
      navigation: f('Navigation', 'Links in the header, mobile menu and footer, in this order.'),
      orderCta: f('Order button', 'Opens the waitlist form. Shows the linked product’s name and price.'),
      mobileMenu: f('Mobile menu', 'Extra content of the full-screen menu on tablets and phones.'),
      preloader: f('Preloader', 'Loading screen on large screens.'),
      waitlistModal: f('Waitlist form', 'Copy of the "Stay ahead" form, including error and success messages.'),
      footer: f('Footer', 'Bottom of every page.'),
      defaultSeo: f('Default SEO', 'Used when a page has no SEO of its own.'),
    },
  },
  'api::homepage.homepage': {
    kind: 'content-type',
    fields: {
      seo: f('SEO', 'Title, description and share image for the homepage.'),
      sections: f('Sections', 'The homepage, top to bottom. Drag to reorder; each section keeps its own layout and animation.'),
    },
  },
  'api::product.product': {
    kind: 'content-type',
    mainField: 'name',
    fields: {
      name: f('Name', 'Shown on the order button, e.g. "Order · Nota One · $300".', 'Nota One'),
      slug: f('Slug', 'Generated from the name. Used internally.'),
      price: f('Price', 'Shown on the order button. Whole numbers display without decimals.', '300'),
      currency: f('Currency', 'Sets the currency symbol on the order button.'),
      colorways: f('Colorways', 'Shown in the colorways section, in this order.'),
    },
  },
  'api::waitlist-signup.waitlist-signup': {
    kind: 'content-type',
    mainField: 'email',
    fields: {
      email: f('Email', 'Submitted through the "Stay ahead" form. Each address is stored once.'),
      source: f('Source', 'Which button opened the form.'),
    },
  },

  // ---------- shared ----------
  'shared.seo': {
    kind: 'component',
    mainField: 'metaTitle',
    fields: {
      metaTitle: f('Meta title', 'Browser tab and search result title. Up to 60 characters.'),
      metaDescription: f('Meta description', 'Search result and link preview text. Up to 160 characters.'),
      ogImage: f('Share image', 'Shown when the page is shared on social media. 1200 × 630 recommended.'),
      canonicalUrl: f('Canonical URL', 'Optional. Full URL of the preferred version of this page.', 'https://'),
    },
  },
  'shared.responsive-image': {
    kind: 'component',
    mainField: 'alt',
    fields: {
      image: f('Image', 'Used on large screens, and on every size that has no crop of its own.'),
      max1439: f('Crop up to 1439 px', 'Optional crop for laptops (992–1439 px).'),
      max991: f('Crop up to 991 px', 'Optional crop for tablets (768–991 px).'),
      max767: f('Crop up to 767 px', 'Optional crop for large phones (480–767 px).'),
      max479: f('Crop up to 479 px', 'Optional crop for phones (up to 479 px).'),
      alt: f('Alt text', 'Describes the image for screen readers. Required.', 'Silver NŌTA pen, nib pointing left'),
    },
  },
  'shared.video': {
    kind: 'component',
    mainField: 'description',
    fields: {
      file: f('Video', 'MP4, muted, a few seconds long. Plays without sound.'),
      poster: f('Poster', 'Recommended: a still from the video, shown before it plays and for reduced motion. Without one, the first frame is used.'),
      description: f('Description', 'Optional. What the video shows, for screen readers.'),
    },
  },

  // ---------- elements ----------
  'elements.nav-link': {
    kind: 'component',
    mainField: 'label',
    fields: {
      label: f('Label', 'Text of the link.', 'Specifications'),
      targetAnchor: f('Scrolls to', 'The anchor of the section to scroll to.', 'specifications'),
    },
  },
  'elements.order-cta': {
    kind: 'component',
    mainField: 'label',
    fields: {
      label: f('Label', 'First word of the button.', 'Order'),
      product: f('Product', 'Its name and price appear on the button.'),
    },
  },
  'elements.text-item': { kind: 'component', mainField: 'text', fields: { text: f('Text', undefined, 'Fountain pen nib') } },
  'elements.spec-group': {
    kind: 'component',
    mainField: 'title',
    fields: {
      title: f('Title', 'Card heading.', 'Writing System'),
      items: f('Lines', 'One specification per line, up to six.'),
    },
  },
  'elements.paragraph': { kind: 'component', mainField: 'text', fields: { text: f('Text') } },
  'elements.audience-card': {
    kind: 'component',
    mainField: 'title',
    fields: {
      title: f('Title', 'Who it is for.', 'Students & Learners'),
      body: f('Description', 'Up to 400 characters.'),
    },
  },
  'elements.story-step': {
    kind: 'component',
    mainField: 'subheading',
    fields: {
      heading: f('Headline', `Top left of the screen. ${LINE_BREAKS}`),
      subheading: f('Card title', 'First card at the bottom right.', 'For the pen, it’s a precise map'),
      body: f('Card text', 'Second card at the bottom right.'),
      image: f('Image', 'Full-screen background for this step.'),
    },
  },
  'elements.product-item': {
    kind: 'component',
    mainField: 'name',
    fields: {
      name: f('Name', undefined, 'The NŌTA Smart Pen'),
      description: f('Description', 'Shown over the top left of the image. Press Enter for a new line.'),
      image: f('Image'),
    },
  },
  'elements.detail-tile': {
    kind: 'component',
    mainField: 'label',
    fields: {
      label: f('Label', 'Optional pill shown on the tile.', 'Aluminum body'),
      image: f('Image', 'Tile image. On a video tile it is the poster, and optional.'),
      video: f('Video', 'Optional. Plays on a loop instead of the image.'),
    },
  },
  'elements.colorway': {
    kind: 'component',
    mainField: 'name',
    fields: {
      name: f('Name', 'Left of the pen.', 'Graphite Black.'),
      tagline: f('Tagline', 'Right of the pen.', 'Clarity in silence.'),
      image: f('Image', 'Full-screen image of the pen in this colour, background included.'),
      textColor: f('Text colour', 'Colour of the name and tagline over this image.'),
      swatch: f('Swatch', 'Optional. The colour itself, for future colour pickers.'),
    },
  },
  'elements.credit-link': {
    kind: 'component',
    mainField: 'label',
    fields: {
      label: f('Label', undefined, 'Designed by Alice'),
      url: f('Link', 'Optional. Opens in a new tab.', 'https://'),
      opensTeamPopover: f('Opens team list', 'Clicking this credit shows the team names instead of following a link.'),
    },
  },
  'elements.person': { kind: 'component', mainField: 'name', fields: { name: f('Name') } },
  'elements.person-group': { kind: 'component', fields: { people: f('People', 'Groups are separated by a small gap.') } },

  // ---------- layout / forms ----------
  'layout.preloader': {
    kind: 'component',
    fields: { enabled: f('Show preloader', 'Turn off to reveal the page as soon as it loads.') },
  },
  'layout.mobile-menu': {
    kind: 'component',
    fields: { image: f('Image', 'Oval image behind the order button in the menu.') },
  },
  'layout.footer': {
    kind: 'component',
    fields: {
      tagline: f('Tagline', `Large text at the top left. ${LINE_BREAKS}`),
      navHeading: f('Navigation heading', undefined, 'Navigation'),
      yearLabel: f('Year label', undefined, 'Year'),
      yearValue: f('Year', undefined, '2026'),
      copyright: f('Copyright', 'Bottom left.', '@2026 Nōta Team'),
      credits: f('Credits', 'Bottom row, in this order.'),
      teamGroups: f('Team', 'Names in the popover opened by the credit marked "Opens team list".'),
      popoverCloseLabel: f('Close button label', 'Read by screen readers on the popover’s × button.', 'Close credits'),
    },
  },
  'forms.waitlist-modal': {
    kind: 'component',
    mainField: 'title',
    fields: {
      title: f('Title', undefined, 'Stay ahead'),
      subtitle: f('Subtitle', LINE_BREAKS),
      emailPlaceholder: f('Email placeholder', 'Also the field’s accessible label.', 'E-mail'),
      submitLabel: f('Button label', undefined, 'Notify me'),
      closeLabel: f('Close label', undefined, 'Close'),
      successTitle: f('Success title', 'Replaces the title after a successful signup.', 'You’re on the list'),
      successMessage: f('Success message', 'Shown after a successful signup.'),
      errorRequired: f('Error: empty email', undefined, 'Please enter your email'),
      errorInvalidEmail: f('Error: invalid email', undefined, 'Please enter a valid email address'),
      errorGeneric: f('Error: something failed', 'Shown when the signup could not be saved.', 'Something went wrong! Try again'),
    },
  },

  // ---------- sections ----------
  'sections.hero': {
    kind: 'component',
    mainField: 'heading',
    fields: {
      ...section('hero'),
      heading: f('Headline', `Bottom left on large screens. ${LINE_BREAKS}`),
      sequence: f('Pen animation', 'Lottie JSON played as the visitor scrolls (large screens only).'),
      image: f('Static image', 'Shown on tablets and phones, and instead of the animation for reduced motion.'),
    },
  },
  'sections.specs': {
    kind: 'component',
    mainField: 'heading',
    fields: {
      ...section('specifications'),
      headingMuted: f('Heading, grey line', undefined, 'Nota pen'),
      heading: f('Heading, black line', undefined, 'Specifications'),
      penImage: f('Pen image', 'Upright pen between the cards. Add a horizontal crop for phones.'),
      groups: f('Spec groups', 'Up to three cards, left to right.'),
    },
  },
  'sections.audience': {
    kind: 'component',
    mainField: 'eyebrow',
    fields: {
      ...section('who-its-for'),
      statement: f('Statement', 'Large text that lights up word by word as the visitor scrolls.'),
      eyebrow: f('Label', 'Small caps above the introduction.', 'WHO IT’S FOR:'),
      intro: f('Introduction', 'One to three paragraphs.'),
      cards: f('Audience cards', 'Who the product is for.'),
      video: f('Video', 'Grows to full width as the visitor scrolls, then plays once.'),
    },
  },
  'sections.smart-paper': {
    kind: 'component',
    mainField: 'heading',
    fields: {
      ...section('about'),
      headingMuted: f('Heading, grey line', undefined, 'Works with'),
      heading: f('Heading, black line', undefined, 'smart paper'),
      steps: f('Steps', 'Shown one after another while the section is pinned. Two to six steps.'),
    },
  },
  'sections.inside-box': {
    kind: 'component',
    mainField: 'heading',
    fields: {
      ...section('inside-the-box'),
      headingMuted: f('Heading, grey line', undefined, 'Inside'),
      heading: f('Heading, black line', undefined, 'the box'),
      kitTitle: f('Kit title', 'Top right of the box image.', 'A complete, ready-to-use set'),
      kitBody: f('Kit description'),
      kitImage: f('Box image', 'The full kit, shown large.'),
      statement: f('Statement', 'Centred text that darkens word by word as the visitor scrolls.'),
      items: f('Items', 'Up to two items shown side by side.'),
    },
  },
  'sections.details': {
    kind: 'component',
    fields: {
      ...section('details'),
      tiles: f('Tiles', 'Exactly six tiles. Their position in the grid follows this order.'),
    },
  },
  'sections.colorways': {
    kind: 'component',
    mainField: 'headingStart',
    fields: {
      ...section('colorways'),
      headingStart: f('Heading, left of the pen', undefined, 'Impossible to'),
      headingEnd: f('Heading, right of the pen', undefined, 'overthink'),
      introImage: f('Intro image', 'The pen before any colour is shown.'),
      product: f('Product', 'Its colorways are shown here.'),
    },
  },
};
