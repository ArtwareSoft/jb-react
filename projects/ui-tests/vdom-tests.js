const h = jb.ui.h

jb.component('uiTest.applyVdomDiffText', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => h('div',{},'bb')
  )
})

jb.component('uiTest.applyVdomDiffTag', {
  impl: uiTest.applyVdomDiff(
    ctx => h('span',{},'aa'),
    ctx => h('div',{},'bb')
  )
})

jb.component('uiTest.applyVdomDiffToText', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => 'aa'
  )
})

jb.component('uiTest.applyVdomDiffMixed', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},'aa'),
    ctx => h('div',{},h('div',{},'bb'))
  )
})

jb.component('uiTest.applyVdomDiffMixed2', {
  impl: uiTest.applyVdomDiff(
    ctx => h('div',{},h('div',{},'bb')),
    ctx => h('div',{},'aa')
  )
})

jb.component('uiTest.applyVdomDiffDDTree1', {
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

jb.component('uiTest.applyVdomDiffDDTree2', {
  impl: uiTest.applyVdomDiff(
    {
      tag: 'div',
      attributes: {},
      children: [
        {tag: 'span', attributes: text('0'), children: undefined},
        {tag: 'span', attributes: text('1'), children: undefined},
        {
          tag: 'div',
          attributes: {},
          children: [
            {tag: 'span', attributes: text('1.1'), children: undefined},
            {tag: 'span', attributes: text('1.2'), children: undefined}
          ]
        },
        {tag: 'span', attributes: text('2'), children: undefined}
      ]
    },
    {
      tag: 'div',
      attributes: {},
      children: [
        {tag: 'span', attributes: text('1'), children: undefined},
        {
          tag: 'div',
          attributes: {},
          children: [
            {tag: 'span', attributes: text('0'), children: undefined},
            {tag: 'span', attributes: text('1.1'), children: undefined},
            {tag: 'span', attributes: text('1.2'), children: undefined}
          ]
        },
        {tag: 'span', attributes: text('2'), children: undefined}
      ]
    }
  )
})
