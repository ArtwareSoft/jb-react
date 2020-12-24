jb.ns('nb')

jb.component('nb.notebook', {
    type: 'control',
    params: [
        { id: 'elements', type: 'nb.elem[]'}
    ],
    impl: group({
        controls: [ text('he')],
        features: [

        ]
    })
})

jb.component('nb.markdown', {
    type: 'nb.elem',
    params: [
        {id: 'markdown', as: 'string'}
    ],
    impl: nb.elemImpl(markdown('%$markdown%'), studio.editableSource('%$path%~markdown') )
})

jb.component('nb.control', {
    type: 'nb.elem',
    params: [
        {id: 'control', type: 'control', dynamic: true}
    ],
    impl: nb.elemImpl(group({controls: '%$control%'}), studio.jbEditor('%$path%~control') )    
})

jb.component('nb.data', {
    type: 'nb.elem',
    params: [
        {id: 'name', as: 'string', mandatory: true},
        {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
        {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
    ],
    impl: nb.elemImpl(text('%$value%'), studio.jbEditor('%$path%~value') )    
})

jb.component('nb.javascript', {
    type: 'nb.elem',
    params: [
        {id: 'code', as: 'string'}
    ],
    impl: nb.elemImpl(nb.evalCode('%$code%'), studio.editableSource('%$path%~code') )    
})