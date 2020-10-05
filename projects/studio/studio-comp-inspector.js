jb.ns('chromeDebugger')

jb.component('studio.compInspector', {
  params: [
    {id: 'inspectedProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: group.sections(header.mdcHeadline6()),
      controls: [
        text('%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%', '%$inspectedCtx/profile/$%'),
        itemlist({
            title: 'state',
            items: unique({items: list(keys('%$inspectedCmp/state%'),keys('%$FEState%'))}),
            controls: [
             text('%%', ''),
             text('%$FEState/{%%}%', 'front end'),
             text('%$inspectedCmp/state/{%%}%', 'back end'),
            ],
            style: table.plain()
        }),
        itemlist({
          title: 'methods',
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
        }),
        editableText({
          title: 'source',
          databind: studio.profileAsText('%$inspectedCtx/path%'),
          style: editableText.codemirror({height: '100'})
        }),
        tableTree({
            title: 'rendering props',
            treeModel: tree.modelFilter(tree.json('%$inspectedCmp/renderProps%'), notContains('cmpHash')),
            leafFields: text('%val%', 'value'),
            chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        tree('raw', tree.json('%$inspectedCmp%'))
      ]
    }),
    features: [
      variable('cmpId', firstSucceeding('%$$state.cmpId%', '%$inspectedProps.cmpId%')),
      variable('frameUri', firstSucceeding('%$$state.frameUri%', '%$inspectedProps.frameUri%')),
      variable('FEState', firstSucceeding('%$$state.frontEndState%', '%$inspectedProps.frontEndState%')),
      variable('frameOfElem', ({},{frameUri}) => [self,self.parent,...Array.from(frames)].filter(x=>x.jbUri == frameUri)[0]),
      variable('elem', ({},{cmpId,frameOfElem}) => frameOfElem && frameOfElem.document.querySelector(`[cmp-id="${cmpId}"]`)),
      variable('inspectedCmp', ({},{frameOfElem, elem}) => 
            jb.path(elem && frameOfElem && frameOfElem.jb.ctxDictionary[elem.getAttribute('full-cmp-ctx')],'vars.cmp')),
      variable('inspectedCtx', '%$inspectedCmp/ctx%'),
      feature.init(({},{frameUri}) => frameUri == 'studio' && jb.studio.initStudioEditing()),
      chromeDebugger.refreshAfterSelection(),
      followUp.flow(
        source.callbag(({},{frameOfElem}) => frameOfElem && frameOfElem.jb.ui.BECmpsDestroyNotification),
        rx.filter(({data},{$props},{}) => data.cmps.find(_cmp => _cmp.cmpId == $props.cmpId)),
        sink.refreshCmp('%$$state%')
      )
    ]
  })
})
