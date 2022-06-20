private.increment({
    impl: ({data}) => +data +1
})

pub.increment2({
    impl: ({data}) => +data + 2
})

pub.increment3({
    impl: pipeline(increment, increment2)
})


module.button = {}

private.initAction({
    type: 'jb.ui.button.feature',
    impl: pipeline(increment, increment2)
})

pub.mdc = customStyle({
    type: 'button.style',
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true }, title),
    css: '.raised {font-weight: bold}',
    features: initAction()
})

