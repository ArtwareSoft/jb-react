using('ui-table-tree')

const h = jb.ui.h

component('vdomDiffTest.applyVdomDiffText', {
  impl: uiTest.applyVdomDiff(ctx => h('div',{},'aa'), ctx => h('div',{},'bb'))
})

component('vdomDiffTest.applyVdomDiffTag', {
  impl: uiTest.applyVdomDiff(ctx => h('span',{},'aa'), ctx => h('div',{},'bb'))
})

component('vdomDiffTest.applyVdomDiffToText', {
  impl: uiTest.applyVdomDiff(ctx => h('div',{},'aa'), ctx => 'aa')
})

component('vdomDiffTest.applyVdomDiffMixed', {
  impl: uiTest.applyVdomDiff(ctx => h('div',{},'aa'), ctx => h('div',{},h('div',{},'bb')))
})

component('vdomDiffTest.applyVdomDiffMixed2', {
  impl: uiTest.applyVdomDiff(ctx => h('div',{},h('div',{},'bb')), ctx => h('div',{},'aa'))
})

component('vdomDiffTest.applyVdomDiffDDTree1', {
  impl: uiTest.applyVdomDiff({
    controlBefore: group(text('0'), text('1'), group(text('1.1'), text('1.2')), text('2')),
    control: group(text('1'), group(text('0'), text('1.1'), text('1.2')), text('2'))
  })
})

component('vdomDiffTest.applyVdomDiff.TableTree', {
  impl: uiTest.applyVdomDiff({
    controlBefore: tableTree({
      treeModel: tree.json(() => ({ names: ["Homer Simpson", "Marge Simpson", "Bart Simpson"] })),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    }),
    control: tableTree({
      treeModel: tree.json(() => ({ name: 'mukki'})),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    })
  })
})

component('vdomDiffTest.applyVdomDiff.TableTree2', {
  impl: uiTest.applyVdomDiff({
    controlBefore: tableTree({
      treeModel: tree.json(() => ({ name: 'mukki'})),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    }),
    control: tableTree({
      treeModel: tree.json(() => ({ names: ["Homer Simpson", "Marge Simpson", "Bart Simpson"] })),
      leafFields: text('%val%', 'value'),
      chapterHeadline: text(tree.lastPathElement('%path%'))
    })
  })
})

component('vdomDiffTest.applyVdomDiff.TableTo.toAppendInTheMiddle', {
  impl: uiTest.applyVdomDiff({
    controlBefore: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text('%val%', 'name'),
      commonFields: text('%path%', 'path'),
      chapterHeadline: text(suffix('~', '%path%')),
      style: tableTree.plain(),
      features: tableTree.expandPath('~friends~0')
    }),
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text('%val%', 'name'),
      commonFields: text('%path%', 'path'),
      chapterHeadline: text(suffix('~', '%path%')),
      style: tableTree.plain(),
      features: tableTree.expandPath(list('~children~0','~friends~0'))
    })
  })
})

