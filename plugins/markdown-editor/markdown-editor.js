using('ui-common','ui-styles')

// https://github.com/sparksuite/simplemde-markdown-editor

component('markdown.editor', {
  type: 'control',
  params: [
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'simplemdeSettings', as: 'single'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: editableText('%$title()%', '%$databind()%', {
    style: editableText.markdown({ simplemdeSettings: '%$simplemdeSettings%' })
  })
})

component('editableText.markdown', {
  type: 'editable-text-style',
  params: [
    {id: 'simplemdeSettings', as: 'single', byName: true},
    {id: 'debounceTime', as: 'number', defaultValue: 300}
  ],
  impl: features(
    frontEnd.requireExternalLibrary('codemirror.js','css/codemirror.css'),
    frontEnd.requireExternalLibrary('simplemde.js','css/simplemde.css'),
    calcProp('text', '%$$model/databind()%'),
    frontEnd.var('text', '%$$props/text%'),
    css.class('md-editor'),
    css('.md-editor .CodeMirror, .CodeMirror-scroll {  min-height: 50px; }'),
    () => ({ template: ({},{},h) => h('div.simple-mde') }),
    frontEnd.var('simplemdeSettings', '%$simplemdeSettings%'),
    frontEnd.init((ctx,{el,text,cmp,simplemdeSettings,FELifeCycle}) => {
        el.innerHTML = `<div jb_external="true"/>`
        const wrapper = el.firstChild
        wrapper.innerHTML = `<textarea>${text}</textarea>`
        const defaultSettings = {
            spellChecker: false,
            // promptURLs: true,
             renderingConfig: {
            //     singleLineBreaks: false,
                 codeSyntaxHighlighting: true,
            }
        }
        cmp.simplemde = new SimpleMDE({ element: wrapper.firstChild, ...simplemdeSettings, ...defaultSettings})
        cmp.editor = cmp.simplemde.codemirror
        jb.ui.addClass(cmp.editor.getWrapperElement(),'autoResizeInDialog')
    }),
    method('writeText', (ctx,{cmp}) => jb.ui.writeFieldData(ctx,cmp,ctx.data,true)),
    frontEnd.flow(
      source.codeMirrorText(),
      rx.debounceTime('%$debounceTime%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('writeText', '%%')
    ),
    frontEnd.method('setText', ({data},{cmp,el}) => cmp.editor ? cmp.editor.setValue(data) : el.setAttribute('value',data)),
    frontEnd.method('regainFocus', (ctx,{cmp}) => {
      jb.log('codemirror regain focus',{ctx,cmp})
      if (!cmp.editor) return // test
      cmp.editor.focus()
      jb.log('codemirror regain focus', { ctx })
      cmp.editor.setSelection(cmp.editor.getCursor(true), cmp.editor.getCursor(false))
    }),
    frontEnd.method('selectRange', ({data},{cmp}) => cmp.editor && cmp.editor.setSelection({ line: data.start.line, ch: data.start.col }, { line: data.end.line, ch: data.end.col })),
    css(({},{},{height}) => `{width: 100% }
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

/*
@font-face {
  font-family: 'FontAwesome';
  src: url('fontawesome-webfont.woff2?v=4.7.0') format('woff2');
  font-weight: normal;
  font-style: normal;
}
*/