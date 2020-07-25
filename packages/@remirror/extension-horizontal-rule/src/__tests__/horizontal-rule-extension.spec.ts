import { isExtensionValid } from '@remirror/testing';

import { HorizontalRuleExtension } from '..';

test('`HorizontalRuleExtension`: is valid', () => {
  expect(isExtensionValid(HorizontalRuleExtension)).toBeTrue();
});
