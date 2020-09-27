jb.component('studio.compInspector', {
  params: [
    {id: 'inspectorProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: group.sections(header.mdcHeadline6()),
      controls: [
        text('%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%', '%$inspectedCtx/profile/$%'),
        itemlist({
          title: 'methods',
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
        }),
        tableTree({
          title: 'rendering props',
          treeModel: tree.modelFilter(tree.json('%$inspectedCmp/renderProps%'), notContains('cmpHash')),
          leafFields: text('%val%', 'value'),
          chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        editableText({
          title: 'source',
          databind: studio.profileAsText('%$inspectedCtx/path%'),
          style: editableText.codemirror({height: '100'})
        }),
        tableTree({
          title: 'state props',
          treeModel: tree.json('%$inspectedCmp/state%'),
          leafFields: text('%val%', 'value'),
          chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        tree('raw', tree.json('%$inspectedCmp%'))
      ]
    }),
    features: [
      variable('cmpId', firstSucceeding('%$$state.cmpId%', '%$inspectorProps.cmpId%')),
      variable('frameUri', firstSucceeding('%$$state.frameUri%', '%$inspectorProps.frameUri%')),
      variable('frameOfElem', ({},{frameUri}) => [self,...Array.from(frames)].filter(x=>x.jbUri == frameUri)[0]),
      variable('elem', ({},{cmpId,frameOfElem}) => frameOfElem && frameOfElem.document.querySelector(`[cmp-id="${cmpId}"]`)),
      variable('inspectedCmp', ({},{frameOfElem, elem}) => 
            jb.path(elem && frameOfElem && frameOfElem.jb.ctxDictionary[elem.getAttribute('full-cmp-ctx')],'vars.cmp')),
      variable('inspectedCtx', '%$inspectedCmp/ctx%'),
      feature.init(({},{frameUri}) => frameUri == 'studio' && jb.studio.initStudioEditing()),
      method('refresh', action.refreshCmp('%%')),
      followUp.flow(
        source.callbag(({},{frameOfElem}) => frameOfElem && frameOfElem.jb.ui.BECmpsDestroyNotification),
        rx.filter(({data},{$props},{}) => data.cmps.find(_cmp => _cmp.cmpId == $props.cmpId)),
        sink.refreshCmp('%$$state%')
      )
    ]
  })
})
