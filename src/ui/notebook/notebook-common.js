jb.ns('nb,studio')

jb.component('nb.notebook', {
    type: 'control',
    params: [
        { id: 'elements', type: 'nb.elem[]' }
    ],
    impl: itemlist({ 
        items: '%$elements%', 
        itemVariable: 'notebookElem', 
        controls: group({
            controls: [ 
                (ctx,{notebookElem}) => ctx.run(notebookElem.editor),
                group({
                    controls: (ctx,{notebookElem}) => ctx.run(notebookElem.result),
                    features: [
                        watchRef({ ref: studio.ref('%$path%'), includeChildren: 'yes'}),
                        variable('profileContent',studio.val('%$path%~markdown'))
                    ]
                })
            ],
            features: [
                variable('idx', ({},{index}) => index -1),
                variable('path', '%$studio/project%.notebook~impl~elements~%$idx%')
            ]
        })
    })
})

jb.component('studio.notebookElem', {
    type: 'nb.elem',
    params: [
        { id: 'result', type: 'control', dynamic: true},
        { id: 'editor', type: 'control', dynamic: true},
    ],
    impl: (_ctx,result,editor) => ({
        result: ctx => result(ctx),
        editor: ctx => editor(ctx),
    })
})

jb.component('nb.markdown', {
    type: 'nb.elem',
    params: [
        {id: 'markdown', as: 'string'}
    ],
    impl: studio.notebookElem(
        widget.twoTierWidget(markdown('%$profileContent%'), remote.notebookWorker()), 
        studio.editableSource('%$path%~markdown',70)
    )
})

jb.component('nb.control', {
    type: 'nb.elem',
    params: [
        {id: 'control', type: 'control', dynamic: true}
    ],
    impl: studio.notebookElem(group({controls: '%$control%'}), studio.jbEditor('%$path%~control') )    
})

jb.component('nb.data', {
    type: 'nb.elem',
    params: [
        {id: 'name', as: 'string', mandatory: true},
        {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
        {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
    ],
    impl: studio.notebookElem(text('%$value%'), studio.jbEditor('%$path%~value') )    
})

jb.component('nb.javascript', {
    type: 'nb.elem',
    params: [
        {id: 'code', as: 'string'}
    ],
    impl: studio.notebookElem(nb.evalCode('%$code%'), studio.editableSource('%$path%~code') )    
})