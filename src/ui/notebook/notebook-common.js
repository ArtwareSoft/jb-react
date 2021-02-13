var {nb,studio,widget,markdown} = jb.ns('nb,studio,widget,markdown')

jb.component('nb.notebook', {
  type: 'control',
  params: [
    {id: 'elements', type: 'nb.elem[]'}
  ],
  impl: itemlist({
    items: '%$elements%',
    controls: group({
      layout: layout.horizontal('10'),
      controls: [
        button({raised: false, features: feature.icon({icon: 'CardText', type: 'mdi'})}),
        '%$notebookElem.editor()%',
        widget.twoTierWidget(        
          group({
            controls: (ctx,{path}) => {
                const ret = jb.run( new jb.jbCtx(ctx, { profile: jb.studio.valOfPath(path), forcePath: path, path: 'control' }), {type: 'control'})
                return ret.result(ctx)
            },
            features: followUp.flow(
                source.watchableData(studio.ref('%$path%'), 'yes'),
                sink.refreshCmp()
            )
          }), jbm.notebookWorker()),
      ],
      features: [
            variable('idx', ({},{index}) => index -1), 
            variable('path', '%$studio/project%.notebook~impl~elements~%$idx%')
        ]
    }),
    itemVariable: 'notebookElem'
  })
})

jb.component('studio.notebookElem', {
    type: 'nb.elem',
    params: [
        { id: 'result', type: 'control', dynamic: true},
        { id: 'editor', type: 'control', dynamic: true},
    ],
    impl: ctx => ctx.params
})

jb.component('nb.markdown', {
    type: 'nb.elem',
    params: [
        {id: 'markdown', as: 'string'}
    ],
    impl: studio.notebookElem(
        markdown('%$markdown%'),
//        widget.twoTierWidget(markdown(pipeline('%$profileContent%','%markdown%')), jbm.notebookWorker()),
        editableText({
            databind: studio.profileAsText('%$path%~markdown'),
            style: editableText.markdown(),
        }),
    )
})

jb.component('nb.control', {
    type: 'nb.elem',
    params: [
        {id: 'control', type: 'control', dynamic: true}
    ],
    impl: studio.notebookElem(
        '%$control()%',
        // (ctx,{profileContent,path}) => 
        //     jb.run( new jb.jbCtx(ctx, { profile: profileContent.control, forcePath: path, path: 'control' }), {type: 'control'}),

        group({ 
            controls: studio.jbEditorInteliTree('%$path%~control'),
            features: studio.jbEditorContainer('comp-in-jb-editor')
        }))
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