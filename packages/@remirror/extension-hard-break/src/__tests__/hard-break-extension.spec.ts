import { isExtensionValid } from '@remirror/testing';

import { HardBreakExtension } from '..';

test('`HardBreakExtension`: is valid', () => {
  expect(isExtensionValid(HardBreakExtension)).toBeTrue();
});
