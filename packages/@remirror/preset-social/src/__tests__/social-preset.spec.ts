import { isPresetValid } from '@remirror/testing';

import { SocialPreset } from '..';

test('`SocialPreset`: is valid', () => {
  expect(isPresetValid(SocialPreset, { matchers: [] })).toBeTrue();
});
