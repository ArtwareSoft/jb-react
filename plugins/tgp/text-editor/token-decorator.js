





// component('codeMirror.visitInfo', {
//     type: 'overlay',
//     params: [
//         {id: 'fixedCss', as: 'string' },
//     ],
//     impl: ctx => ({
//         applyDecorations(ranges, style, {editor} = {}) {
//             if (this.overlay)
//                 editor.removeOverlay(this.overlay)

//             this.overlay = { token: stream => {
//                 const token = stream.next()
//                 const line = stream.lineOracle.line, start = stream.start, end = stream.pos
//                 if (ranges.find(({from}) => line == from.line && from.col <= start && end <= from.col ))
//                     return style
//             }}
//             editor.addOverlay(this.overlay)
//         }

//         removeDecorations({editor} = {}) {
//             if (this.overlay) {
//             editor.removeOverlay(this.overlay)
//             this.overlay = null
//             }
//         }
//     })
// })

// // Class for VSCode
// class VSCodeDecorator extends EditorDecorator {
//   constructor(editor) {
//     super()
//     editor = editor
//     this.decorations = []
//   }

//   applyDecorations(ranges, style) {
//     this.removeDecorations()

//     const decorationType = vscode.window.createTextEditorDecorationType(style)
//     this.decorations.push(decorationType)

//     const vsRanges = ranges.map(range => new vscode.Range(range.startLine, range.startCharacter, range.endLine, range.endCharacter))
//     editor.setDecorations(decorationType, vsRanges)
//   }

//   removeDecorations() {
//     this.decorations.forEach(decoration => {
//       editor.setDecorations(decoration, [])
//       decoration.dispose()
//     })
//     this.decorations = []
//   }
// }

// // For CodeMirror
// const cmEditor = CodeMirror.fromTextArea(document.getElementById('myTextarea'), {})
// const cmDecorator = new CodeMirrorDecorator(cmEditor)
// cmDecorator.applyDecorations(ranges, 'myStyleClass')
// // Later, when you want to remove the decorations
// cmDecorator.removeDecorations()

// // For VSCode
// const vscodeEditor = vscode.window.activeTextEditor
// const vscodeDecorator = new VSCodeDecorator(vscodeEditor)
// vscodeDecorator.applyDecorations(ranges, { backgroundColor: 'lightblue' })
// // Later, when you want to remove the decorations
// vscodeDecorator.removeDecorations()
