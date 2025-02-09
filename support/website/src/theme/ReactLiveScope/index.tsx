import React from 'react';

import { BoldExtension } from 'remirror/extension/bold';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { CorePreset } from 'remirror/preset/core';
import {
  createReactManager,
  RemirrorProvider,
  useExtension,
  useManager,
  usePositioner,
  usePreset,
  useRemirror,
} from 'remirror/react';
import { SocialEditor } from 'remirror/react/social';

const exampleUsers = [
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/tolu@adorable.io.png',
    displayName: 'Tolu',
    username: 'tolu',
    href: '//test.com/tolu',
    id: 'tolu',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/timi@adorable.io.png',
    displayName: 'Timi',
    username: 'timi',
    href: '//test.com/tolu',
    id: 'timi',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/olu@adorable.io.png',
    displayName: 'Olu',
    username: 'olu',
    href: '//test.com/olu',
    id: 'olu',
  },
  {
    avatarUrl: 'https://api.adorable.io/avatars/100/tope@adorable.io.png',
    displayName: 'Tope',
    username: 'tope',
    href: '//test.com/tope',
    id: 'tope',
  },
];

const exampleTags = [
  { tag: 'FunTime', href: '//test.com/funtime', id: 'funtime' },
  { tag: 'StaySafe', href: '//test.com/staysafe', id: 'staysafe' },
  { tag: 'MaskUp', href: '//test.com/maskup', id: 'maskup' },
  { tag: 'RollOut', href: '//test.com/rollup', id: 'rollup' },
  { tag: 'BeBold', href: '//test.com/bebold', id: 'bebold' },
  { tag: 'BeStrong', href: '//test.com/bestrong', id: 'bestrong' },
  { tag: 'YouAreMighty', href: '//test.com/youaremighty', id: 'youaremighty' },
  { tag: 'WelcomeChampion', href: '//test.com/welcomechampion', id: 'welcomechampion' },
];

/**
 * The globals available to the live editor scope.
 */
export default {
  React,
  ...React,
  SocialEditor,
  exampleUsers,
  exampleTags,
  useManager,
  useExtension,
  useRemirror,
  usePreset,
  usePositioner,
  RemirrorProvider,
  createReactManager,
  CorePreset,
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
};
