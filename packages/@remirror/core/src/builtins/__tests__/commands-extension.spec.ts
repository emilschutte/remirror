import { isExtensionValid } from '@remirror/testing';

import { CommandsExtension } from '..';

test('`CommandsExtension`: is valid', () => {
  expect(isExtensionValid(CommandsExtension)).toBeTrue();
});
