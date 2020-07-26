import {
  AddCustomHandler,
  AnyCombinedUnion,
  CustomHandlerKeyList,
  DefaultPresetOptions,
  getLazyArray,
  GetStaticAndDynamic,
  isEmptyObject,
  OnSetOptionsParameter,
  Preset,
  RemirrorManager,
} from '@remirror/core';
import { DocExtension, DocOptions } from '@remirror/extension-doc';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { ParagraphExtension, ParagraphOptions } from '@remirror/extension-paragraph';
import { PositionerExtension, PositionerOptions } from '@remirror/extension-positioner';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetOptions
  extends DocOptions,
    ParagraphOptions,
    PositionerOptions,
    HistoryOptions {}

export class CorePreset extends Preset<CorePresetOptions> {
  static defaultOptions: DefaultPresetOptions<CorePresetOptions> = {
    ...DocExtension.defaultOptions,
    ...ParagraphExtension.defaultOptions,
    ...HistoryExtension.defaultOptions,
  };

  static customHandlerKeys: CustomHandlerKeyList<CorePresetOptions> = ['positionerHandler'];

  get name() {
    return 'core' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<CorePresetOptions>) {
    const { pickChanged } = parameter;
    const changedParagraphOptions = pickChanged(['indentAttribute', 'indentLevels']);

    if (!isEmptyObject(changedParagraphOptions)) {
      this.getExtension(ParagraphExtension).setOptions(changedParagraphOptions);
    }
  }

  protected onAddCustomHandler: AddCustomHandler<CorePresetOptions> = (handlers) => {
    const { positionerHandler } = handlers;

    if (positionerHandler) {
      return this.getExtension(PositionerExtension).addCustomHandler(
        'positionerHandler',
        positionerHandler,
      );
    }

    return;
  };

  createExtensions() {
    const {
      content,
      indentAttribute,
      indentLevels,
      depth,
      getDispatch,
      getState,
      newGroupDelay,
    } = this.options;

    return [
      new HistoryExtension({ depth, getDispatch, getState, newGroupDelay }),
      new DocExtension({ content }),
      new TextExtension(),
      new ParagraphExtension({ indentAttribute, indentLevels }),
      new PositionerExtension(),
    ];
  }
}

export interface CreateCoreManagerOptions extends Remirror.ManagerSettings {
  /**
   * The core preset options.
   */
  core?: GetStaticAndDynamic<CorePresetOptions>;
}

/**
 * Create a manager with the core preset already applied.
 */
export function createCoreManager<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]),
  options: CreateCoreManagerOptions = {},
) {
  const { core, ...managerSettings } = options;

  return RemirrorManager.create(
    () => [...getLazyArray(combined), new CorePreset(core)],
    managerSettings,
  );
}
