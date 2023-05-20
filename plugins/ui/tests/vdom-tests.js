const h = jb.ui.h

component('uiTest.applyVdomDiffText', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => h('div',{},'bb')
  )
})

component('uiTest.applyVdomDiffTag', {
  impl: uiTest.applyVdomDiff(
    ctx => h('span',{},'aa'),
    ctx => h('div',{},'bb')
  )
})

component('uiTest.applyVdomDiffToText', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => 'aa'
  )
})

component('uiTest.applyVdomDiffMixed', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => h('div',{},h('div',{},'bb'))
  )
})

component('uiTest.applyVdomDiffMixed2', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},h('div',{},'bb')),
    ctx => h('div',{},'aa')
  )
})

component('uiTest.applyVdomDiffDDTree1', {
  impl: uiTest.applyVdomDiff(
    group({
      controls: [
        text('0'),
        text('1'),
        group({
          controls: [
            text('1.1'),
            text('1.2')
          ]
        }),
        text('2')
      ]
    }),
    group({
      controls: [
        text('1'),
        group({
          controls: [
            text('0'),
            text('1.1'),
            text('1.2')
          ]
        }),
        text('2')
      ]
    })
  )
})

component('uiTest.applyVdomDiff.TableTree', {
  impl: uiTest.applyVdomDiff(
    tableTree({
      treeModel: tree.json(() => ({ names: ["Homer Simpson", "Marge Simpson", "Bart Simpson"] })),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    }),
    tableTree({
      treeModel: tree.json(() => ({ name: 'mukki'})),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    })
  )
})

component('uiTest.applyVdomDiff.TableTree2', {
  impl: uiTest.applyVdomDiff(
    tableTree({
      treeModel: tree.json(() => ({ name: 'mukki'})),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    }),
    tableTree({
      treeModel: tree.json(() => ({ names: ["Homer Simpson", "Marge Simpson", "Bart Simpson"] })),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    }),
  )
})

component('uiTest.applyVdomDiff.TableTo.toAppendInTheMiddle', {
  impl: uiTest.applyVdomDiff(
    tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain(),
      features: tableTree.expandPath('~friends~0')
    }),
    tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain(),
      features: tableTree.expandPath(list('~children~0','~friends~0'))
    }),
  )
})