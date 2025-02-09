import {
  bool,
  CreatePluginReturn,
  DefaultExtensionOptions,
  EditorView,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  Handler,
  isUndefined,
  pick,
  PlainExtension,
  ResolvedPos,
  throttle,
} from '@remirror/core';
import { dropPoint, insertPoint } from '@remirror/pm/transform';
import { Decoration, DecorationSet } from '@remirror/pm/view';

interface OnInitParameter extends OnDestroyParameter {
  extension: DropCursorExtension;
}

interface OnDestroyParameter {
  blockElement: HTMLElement;
  inlineElement: HTMLElement;
}

export interface DropCursorOptions {
  /**
   * The main color of the component being rendered.
   *
   * This can be a named color from the theme such as `background`
   *
   * @defaultValue `primary`
   */
  color?: string;

  /**
   * The width of the inline drop cursor.
   *
   * @defaultValue '2px'
   */
  inlineWidth?: string | number;

  /**
   * The horizontal margin around the inline cursor.
   *
   * @defaultValue '10px'
   */
  inlineSpacing?: string | number;

  /**
   * The width of the block drop cursor.
   *
   * @defaultValue '100%'
   */
  blockWidth?: string | number;

  /**
   * The height of the block drop cursor.
   */
  blockHeight?: string | number;

  /**
   * The class name added to the block widget
   *
   * @defaultValue 'remirror-drop-cursor-block'
   */
  blockClassName?: string;

  /**
   * The class name added to the node that appears before the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-block'
   */
  beforeBlockClassName?: string;

  /**
   * The class name added to the node that appears after the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-block'
   */
  afterBlockClassName?: string;

  /**
   * The class name added to the inline drop cursor widget
   *
   * @defaultValue 'remirror-drop-cursor-inline'
   */
  inlineClassName?: string;

  /**
   * The class name added to the node that appears before the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-inline'
   */
  beforeInlineClassName?: string;

  /**
   * The class name added to the node that appears after the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-inline'
   */
  afterInlineClassName?: string;

  /**
   * When the plugin is first initialized.
   */
  onInit: Handler<(parameter: OnInitParameter) => void>;

  /**
   * Cleanup when the drop cursor plugin is destroyed. This happens when the
   * editor is unmounted.
   *
   * If you've attached a portal to the element then this is the place to handle
   * that.
   */
  onDestroy: Handler<(parameter: OnDestroyParameter) => void>;
}

/**
 * A drop cursor plugin which adds a decoration at the active drop location. The
 * decoration has a class and can be styled however you want.
 */
export class DropCursorExtension extends PlainExtension<DropCursorOptions> {
  static defaultOptions: DefaultExtensionOptions<DropCursorOptions> = {
    inlineWidth: '2px',
    inlineSpacing: '10px',
    blockWidth: '100%',
    blockHeight: '10px',
    color: 'primary',
    blockClassName: 'remirror-drop-cursor-block',
    beforeBlockClassName: 'remirror-drop-cursor-before-block',
    afterBlockClassName: 'remirror-drop-cursor-after-block',
    inlineClassName: 'remirror-drop-cursor-inline',
    beforeInlineClassName: 'remirror-drop-cursor-before-inline',
    afterInlineClassName: 'remirror-drop-cursor-after-inline',
  };

  static readonly handlerKeys = ['onInit', 'onDestroy'];

  get name() {
    return 'dropCursor' as const;
  }

  createHelpers() {
    return {
      /**
       * Check if the anything is currently being dragged over the editor.
       */
      isDragging: () => {
        return this.store.getPluginState<DropCursorState>(this.name).isDragging();
      },
    };
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  createPlugin(): CreatePluginReturn<DropCursorState> {
    const dropCursorState = new DropCursorState(this);

    return {
      view(editorView) {
        dropCursorState.init(editorView);
        return pick(dropCursorState, ['destroy']);
      },
      state: {
        init: () => dropCursorState,
        apply: () => dropCursorState,
      },
      props: {
        decorations: () => dropCursorState.decorationSet,
        handleDOMEvents: {
          dragover: (_, event) => {
            dropCursorState.dragover(event as DragEvent);
            return false;
          },
          dragend: () => {
            dropCursorState.dragend();
            return false;
          },
          drop: () => {
            dropCursorState.drop();
            return false;
          },
          dragleave: (_, event) => {
            dropCursorState.dragleave(event as DragEvent);
            return false;
          },
        },
      },
    };
  }
}

/**
 * This indicates whether the current cursor position is within a textblock or
 * between two nodes.
 */
export type DropCursorType = 'block' | 'inline';

class DropCursorState {
  /**
   * The set of all currently active decorations.
   */
  decorationSet = DecorationSet.empty;

  readonly #extension: DropCursorExtension;

  /**
   * The editor view.
   */
  private view!: EditorView;

  /**
   * The dom element which holds the block `Decoration.widget`.
   */
  private blockElement!: HTMLElement;

  /**
   * The dom element which holds the inline `Decoration.widget`.
   */
  private inlineElement!: HTMLElement;

  /**
   * The currently active timeout. This is used when removing the drop cursor to prevent any flicker.
   */
  #timeout?: any;

  /**
   * The current derived target position. This is cached to help prevent unnecessary re-rendering.
   */
  #target?: number;

  constructor(extension: DropCursorExtension) {
    this.#extension = extension;
    this.dragover = throttle(50, this.dragover);
  }

  init(view: EditorView) {
    const { blockClassName, inlineClassName } = this.#extension.options;

    this.view = view;
    this.blockElement = document.createElement('div');
    this.inlineElement = document.createElement('span');
    this.blockElement.classList.add(blockClassName);
    this.inlineElement.classList.add(inlineClassName);

    this.#extension.options.onInit({
      blockElement: this.blockElement,
      inlineElement: this.inlineElement,
      extension: this.#extension,
    });
  }

  /**
   * Called when the view is destroyed
   */
  destroy = () => {
    this.#extension.options.onDestroy({
      blockElement: this.blockElement,
      inlineElement: this.inlineElement,
    });
  };

  /**
   * Check if the editor is currently being dragged around.
   */
  isDragging = () =>
    bool(
      this.view.dragging ??
        (this.decorationSet !== DecorationSet.empty || !isUndefined(this.#target)),
    );

  /**
   * Called on every dragover event.
   *
   * Captures the current position and whether
   */
  dragover = (event: DragEvent) => {
    const pos = this.view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (pos) {
      const {
        dragging,
        state: { doc, schema },
      } = this.view;

      const target = dragging?.slice
        ? dropPoint(doc, pos.pos, dragging.slice) ?? pos.pos
        : insertPoint(doc, pos.pos, schema.image) ?? pos.pos;

      if (target === this.#target) {
        // This line resets the timeout.
        this.scheduleRemoval(100);
        return;
      }

      this.#target = target;
      this.updateDecorationSet();
      this.scheduleRemoval(100);
    }
  };

  /**
   * Called when the drag ends.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  dragend = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the element is dropped.
   *
   * ? Sometimes this event doesn't fire, is there a way to prevent this.
   */
  drop = () => {
    this.scheduleRemoval(100);
  };

  /**
   * Called when the drag leaves the boundaries of the prosemirror editor dom node.
   */
  dragleave = (event: DragEvent) => {
    if (event.target === this.view.dom || !this.view.dom.contains(event.relatedTarget as Node)) {
      this.scheduleRemoval(100);
    }
  };

  /**
   * Dispatch an empty transaction to trigger a decoration update.
   */
  private readonly triggerDecorationSet = () => this.view.dispatch(this.view.state.tr);

  /**
   * Removes the decoration and (by default) the current target value.
   */
  private readonly removeDecorationSet = (ignoreTarget = false) => {
    if (!ignoreTarget) {
      this.#target = undefined;
    }

    this.decorationSet = DecorationSet.empty;
    this.triggerDecorationSet();
  };

  /**
   * Removes the drop cursor decoration from the view after the set timeout.
   *
   * Sometimes the drag events don't automatically trigger so it's important to have this cleanup in place.
   */
  private scheduleRemoval(timeout: number, ignoreTarget = false) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }

    this.#timeout = setTimeout(() => {
      this.removeDecorationSet(ignoreTarget);
    }, timeout);
  }

  /**
   * Update the decoration set with a new position.
   */
  private readonly updateDecorationSet = () => {
    if (!this.#target) {
      return;
    }

    const {
      state: { doc },
    } = this.view;
    const $pos = doc.resolve(this.#target);
    const cursorIsInline = $pos.parent.inlineContent;

    this.decorationSet = DecorationSet.create(
      doc,
      cursorIsInline ? this.createInlineDecoration($pos) : this.createBlockDecoration($pos),
    );
    this.triggerDecorationSet();
  };

  /**
   * Create an inline decoration for the document which is rendered when the cursor position
   * is within a text block.
   */
  private createInlineDecoration($pos: ResolvedPos): Decoration[] {
    const dropCursor = Decoration.widget($pos.pos, this.inlineElement, {
      key: 'drop-cursor-inline',
    });

    return [dropCursor];
  }

  /**
   * Create a block decoration for the document which is rendered when the cursor position
   * is between two nodes.
   */
  private createBlockDecoration($pos: ResolvedPos): Decoration[] {
    const { beforeBlockClassName, afterBlockClassName } = this.#extension.options;
    const decorations: Decoration[] = [];

    const dropCursor = Decoration.widget($pos.pos, this.blockElement, {
      key: 'drop-cursor-block',
    });
    const before = findPositionOfNodeBefore($pos);
    const after = findPositionOfNodeAfter($pos);
    decorations.push(dropCursor);

    if (before) {
      const beforeDecoration = Decoration.node(before.pos, before.end, {
        class: beforeBlockClassName,
      });
      decorations.push(beforeDecoration);
    }

    if (after) {
      const afterDecoration = Decoration.node(after.pos, after.end, {
        class: afterBlockClassName,
      });
      decorations.push(afterDecoration);
    }

    return decorations;
  }
}
