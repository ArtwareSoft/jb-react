using('ui-common')

component('editableText.markdown', {
  type: 'editable-text-style',
  params: [
    {id: 'simplemdeSettings', as: 'single'},
    {id: 'debounceTime', as: 'number', defaultValue: 300}
  ],
  impl: features(
    frontEnd.requireExternalLibrary('simplemde.js','css/simplemde.css'),
    calcProp('text', '%$$model/databind()%'),
    frontEnd.var('text', '%$$props/text%'),
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

