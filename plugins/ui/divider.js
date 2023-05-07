// var { divider } = jb.ns('divider')

jb.component('divider', {
    type: 'control',
    params: [
        { id: 'style', type: 'divider.style', defaultValue: divider.br() , dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'divider' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('divider.br', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: `{ border-top-color: var(--jb-menu-separator-fg); display: block; border-top-width: 1px; border-top-style: solid;margin-top: 10px; margin-bottom: 10px;} `
    })
})

jb.component('divider.vertical', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: `{ border-left-color: var(--jb-menu-separator-fg); display: block; border-left-width: 1px; border-left-style: solid;margin-left: 10px; margin: 5px 5px;} `
    })
})

jb.component('divider.flexAutoGrow', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: '{ flex-grow: 10 }'
    })
})
