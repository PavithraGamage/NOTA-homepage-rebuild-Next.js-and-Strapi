import { describe, expect, it, vi } from 'vitest';
import { toQueryString } from '@/lib/strapi/query';
import { absoluteUrl, createMappers, formatPrice, mapSections, toLines } from './mappers';

const m = createMappers('https://cms.example.app');
const media = (url: string, mime = 'image/jpeg') => ({ url, width: 100, height: 50, mime, alternativeText: null });
const responsive = (url: string) => ({
  image: media(url),
  max1439: null,
  max991: media(`${url}-991`),
  max767: null,
  max479: null,
  alt: 'Pen',
});

describe('helpers', () => {
  it('splits headings on desktop line breaks and drops blank lines', () => {
    expect(toLines('Smart pen\nfor real thinking\n')).toEqual(['Smart pen', 'for real thinking']);
  });

  it('formats whole prices without decimals', () => {
    expect(formatPrice(300, 'USD')).toBe('$300');
    expect(formatPrice(299.5, 'USD')).toBe('$299.50');
    expect(formatPrice(300, 'EUR')).toBe('€300');
  });

  it('makes upload URLs absolute but leaves absolute ones alone', () => {
    expect(absoluteUrl('/uploads/a.jpg', 'https://cms.example.app')).toBe('https://cms.example.app/uploads/a.jpg');
    expect(absoluteUrl('https://cdn.example.com/a.jpg', 'https://cms.example.app')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });

  it('serialises nested populate objects into Strapi bracket syntax', () => {
    expect(
      toQueryString({ populate: { sections: { on: { 'sections.hero': { populate: '*' } } } }, fields: ['a', 'b'] }),
    ).toBe('populate[sections][on][sections.hero][populate]=*&fields[0]=a&fields[1]=b');
  });
});

describe('mapSections', () => {
  const hero = {
    __component: 'sections.hero',
    anchorId: 'hero',
    isHidden: false,
    heading: 'Smart pen\nfor real thinking',
    sequence: null,
    image: responsive('/uploads/hero.jpg'),
  };

  it('maps a valid section to its view model with absolute URLs', () => {
    const [section] = mapSections([hero], m);
    expect(section).toMatchObject({ type: 'hero', id: 'hero', heading: ['Smart pen', 'for real thinking'] });
    expect(section.type === 'hero' && section.image.max991?.url).toBe('https://cms.example.app/uploads/hero.jpg-991');
  });

  it('skips and logs unknown or invalid sections instead of failing the page', () => {
    const log = vi.fn();
    const sections = mapSections(
      [{ __component: 'sections.unknown' }, { __component: 'sections.hero', heading: 1 }, hero],
      m,
      log,
    );
    expect(sections).toHaveLength(1);
    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toContain('unknown section "sections.unknown"');
    expect(log.mock.calls[1][0]).toContain('invalid sections.hero');
  });

  it('drops hidden sections silently', () => {
    const log = vi.fn();
    expect(mapSections([{ ...hero, isHidden: true }], m, log)).toEqual([]);
    expect(log).not.toHaveBeenCalled();
  });

  it('reads colorways from the linked product, and copes with no product', () => {
    const base = {
      __component: 'sections.colorways',
      anchorId: null,
      isHidden: false,
      headingStart: 'Impossible to',
      headingEnd: 'overthink',
      introImage: responsive('/i.jpg'),
    };
    const colorway = {
      name: 'Mist Blue.',
      tagline: 'Light thinking.',
      textColor: '#FFFFFF',
      image: responsive('/m.jpg'),
    };
    const [withProduct] = mapSections(
      [{ ...base, product: { name: 'Nota One', price: '300', currency: 'USD', colorways: [colorway] } }],
      m,
    );
    const [withoutProduct] = mapSections([{ ...base, product: null }], m);
    expect(withProduct.type === 'colorways' && withProduct.colorways.map((c) => c.name)).toEqual(['Mist Blue.']);
    expect(withoutProduct.type === 'colorways' && withoutProduct.colorways).toEqual([]);
  });
});
