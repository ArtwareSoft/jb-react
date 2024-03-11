using('ui-common')

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
    frontEnd.init((ctx,{el,text,cmp,simplemdeSettings}) => {
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
    frontEnd.onRefresh(({},{text,cmp}) => cmp.editor.setValue(text)),
    method('writeText', writeValue('%$$model/databind()%', '%%')),
    frontEnd.flow(
      source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('change', () => obs(cmp.simplemde.value())))),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.debounceTime('%$debounceTime%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('writeText', '%%')
    )
  )
})

