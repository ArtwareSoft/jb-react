jb.type('divider.style');

jb.component('divider', {
    type: 'control',
    params: [
        { id: 'style', type: 'divider.style', defaultValue: { $: 'divider.br' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'divider' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => 
        jb_ui.ctrl(ctx)
})

jb.component('divider.br', {
    type: 'divider.style',
    params: [
    ],
    impl :{$: 'customStyle', 
        template: '<div></div>',
        css: `{ border-top-color: rgba(0,0,0,0.12); display: block; border-top-width: 1px; border-top-style: solid;margin-top: 10px; margin-bottom: 10px;} `
    }
})

jb.component('divider.flexAutoGrow', {
    type: 'divider.style',
    impl :{$: 'customStyle', 
        template: '<div></div>',
        css: `{ flex-grow: 10 } `
    }
})
