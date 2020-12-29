jb.component('markdown', {
    type: 'control', category: 'control:20',
    description: 'md markdown viewer',
    params: [
        { id: 'markdown', as: 'string', mandatory: true, dynamic: true },
        { id: 'style', type: 'markdown.style', defaultValue: { $: 'markdown.showdown' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'markdown' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('markdown.showdown', {
    type: 'markdown.style',
    impl: customStyle({
        template: ({},{html},h) => h('div',{$html: html.replace(/^(<[a-z0-9]*)/,'$1 jb_external="true"') }),
        features: calcProp('html',(ctx,{$model}) => 
            new showdown.Converter({tables:true}).makeHtml($model.markdown(ctx)) || '' )
    })  
})
