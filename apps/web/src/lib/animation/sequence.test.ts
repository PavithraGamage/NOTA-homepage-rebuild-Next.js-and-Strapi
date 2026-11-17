import { describe, expect, it } from 'vitest';
import { frameIds } from './sequence';

describe('frameIds', () => {
  it('maps every frame to the image layer shown on it', () => {
    const layers = [
      { refId: 'image_0', ip: 0, op: 2 },
      { refId: 'image_1', ip: 2, op: 3 },
      { refId: 'image_2', ip: 3, op: 4 },
    ];
    expect(frameIds({ op: 4, layers })).toEqual(['image_0', 'image_0', 'image_1', 'image_2']);
  });

  it('holds the previous image across gaps', () => {
    const layers = [
      { refId: 'image_0', ip: 0, op: 1 },
      { refId: 'image_1', ip: 2, op: 3 },
    ];
    expect(frameIds({ op: 3, layers })).toEqual(['image_0', 'image_0', 'image_1']);
  });
});
