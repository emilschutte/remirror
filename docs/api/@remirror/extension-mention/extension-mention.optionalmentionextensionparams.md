<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@remirror/extension-mention](./extension-mention.md) &gt; [OptionalMentionExtensionParams](./extension-mention.optionalmentionextensionparams.md)

## OptionalMentionExtensionParams interface

<b>Signature:</b>

```typescript
export interface OptionalMentionExtensionParams 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [appendText](./extension-mention.optionalmentionextensionparams.appendtext.md) | <code>string</code> | The text to append to the replacement. |
|  [name](./extension-mention.optionalmentionextensionparams.name.md) | <code>string</code> | The name of the matched char |
|  [range](./extension-mention.optionalmentionextensionparams.range.md) | <code>FromToEndParams</code> | The range of the requested selection. |
|  [replacementType](./extension-mention.optionalmentionextensionparams.replacementtype.md) | <code>SuggestReplacementType</code> | The type of replacement to use. By default the command will only replace text up the the cursor position.<!-- -->To force replacement of the whole match regardless of where in the match the cursor is placed set this to <code>full</code>. |
