// var {nb,studio,widget,markdown} = jb.ns('nb,studio,widget,markdown')

jb.component('nb.notebook', {
  type: 'control',
  params: [
    {id: 'elements', type: 'nb.elem[]'}
  ],
  impl: itemlist({
    items: '%$elements%',
    controls: group({
      title: 'item',
      layout: layout.horizontal('10'),
      controls: [
        editableBoolean({
          databind: '%$editMode%',
          style: editableBoolean.mdcXV('edit', 'edit'),
          features: css.margin('6', '3')
        }),
        group({
          title: 'editor',
          controls: [
            '%$notebookElem.editor()%'
          ],
          features: [hidden('%$editMode%'), watchRef('%$editMode%')]
        }),
        group({
          title: 'preview',
          controls: [
            remote.widget(group({controls: (ctx,{path}) => {
                      const ret = jb.core.run( new jb.core.jbCtx(ctx, { profile: jb.studio.valOfPath(path), forcePath: path, path: 'control' }), {type: 'control'})
                      return ret.result(ctx)
                  }, features: followUp.flow(source.watchableData(studio.ref('%$path%'), 'yes'), sink.refreshCmp())}), jbm.notebookWorker())
          ],
          features: [hidden(not('%$editMode%')), watchRef('%$editMode%')]
        })
      ],
      features: [
        variable('idx', ({},{index}) => index -1),
        variable('path', '%$studio/project%.notebook~impl~elements~%$idx%'),
        watchable('editMode')
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
//        remote.widget(markdown(pipeline('%$profileContent%','%markdown%')), jbm.notebookWorker()),
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
        //     jb.core.run( new jb.core.jbCtx(ctx, { profile: profileContent.control, forcePath: path, path: 'control' }), {type: 'control'}),

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
