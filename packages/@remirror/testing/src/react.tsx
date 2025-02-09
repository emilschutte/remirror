import { render as originalRender, RenderOptions, RenderResult } from '@testing-library/react';
import React, { StrictMode } from 'react';

export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult {
  return originalRender(<StrictMode>{ui}</StrictMode>, options);
}

export { cleanup, act, fireEvent, render as nonStrictRender } from '@testing-library/react';
export type { RenderResult };
export {
  useRemirror,
  RemirrorProvider,
  useManager,
  useExtension,
  usePreset,
  createReactManager,
} from '@remirror/react';
