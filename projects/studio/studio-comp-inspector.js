jb.component('studio.compInspector', {
  params: [
    {id: '_cmpId'}
  ],
  type: 'control',
  impl: group({
    style: group.sections({titleStyle: header.mdcHeadline6()}),
    controls: [
      text({
        text: '%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%',
        title: '%$inspectedCtx/profile/$%'
      }),
    //   itemlist({
    //     title: 'methods',
    //     items: '%$inspectedCmp/method%',
    //     controls: [
    //       text({text: '%id%', title: 'method'}),
    //       group({
    //         controls: [
    //           studio.sourceCtxView('%ctx%')
    //         ]
    //       })
    //     ],
    //     style: table.plain(true)
    //   }),
    //   tableTree({
    //     title: 'rendering props',
    //     treeModel: tree.modelFilter(
    //       tree.json('%$inspectedCmp/renderProps%'),
    //       notContains('cmpHash')
    //     ),
    //     leafFields: [
    //       text({text: tree.lastPathElement('%path%'), title: 'render prop'}),
    //       text({text: '%val%', title: 'value'})
    //     ],
    //     chapterHeadline: text({
    //       text: pipeline(
    //         data.if(isOfType('array,object', '%val%'), [tree.lastPathElement('%path%')], '')
    //       ),
    //       title: 'my title'
    //     })
    //   }),
    //   editableText({
    //     title: 'source',
    //     databind: studio.profileAsText('%$inspectedCtx/path%'),
    //     style: editableText.codemirror({height: '100'})
    //   }),
    //   tableTree({
    //     title: 'state props',
    //     treeModel: tree.json('%$inspectedCmp/state%'),
    //     leafFields: [
    //       text({text: tree.lastPathElement('%path%'), title: 'state prop'}),
    //       text({text: '%val%', title: 'value'})
    //     ],
    //     chapterHeadline: text({text: tree.lastPathElement('%path%'), title: 'my title'})
    //   }),
    //   tree({title: 'raw', nodeModel: tree.json('%$inspectedCmp%')})
    ],
    features: [
      variable({
        name: 'cmpId',
        value: ({},{$state},{_cmpId}) => $state.cmpId || _cmpId
      }),
      variable({
        name: 'elem',
        value: ({},{cmpId}) => jb.studio.previewWindow.document.querySelector(`[cmp-id="${cmpId}"]`)
      }),
      variable({
        name: 'inspectedCmp',
        value: ({},{elem})=>jb.path (elem && jb.studio.previewjb.ctxDictionary[elem.getAttribute('full-cmp-ctx')],'vars.cmp')
      }),
      variable({name: 'inspectedCtx', value: '%$inspectedCmp/ctx%'}),
      method('refresh', action.refreshCmp({cmpId: ctx.data}))
    ]
  })
})
