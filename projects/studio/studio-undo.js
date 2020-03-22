(function () {
const st = jb.studio;

st.undoIndex = 0;

function setToVersion(versionIndex, ctx, after) {
  const version = st.compsHistory[versionIndex];
  if (!version || !version.opEvent) debugger;

  let opEvent = Object.assign({}, version.opEvent);
  opEvent.oldVal = version.opEvent.newVal;
  opEvent.newVal = version.opEvent.oldVal;
  opEvent.srcCtx = ctx;

  if (after) {
    st.previewjb.comps = version.after;
    st.compsRefHandler.resourceVersions = version.opEvent.resourceVersionsAfter;
  } else {
    st.previewjb.comps = version.before;
    st.compsRefHandler.resourceVersions = version.opEvent.resourceVersionsBefore;
  }

  st.compsRefHandler.resourceChange.next(opEvent)
  //st.scriptChange.next(opEvent);
}

jb.component('studio.undo', {
  type: 'action',
  impl: ctx => {
    if (st.undoIndex > 0)
      setToVersion(--st.undoIndex, ctx)
  }
})

jb.component('studio.cleanSelectionPreview', {
  type: 'action',
  impl: () => {
    if (st.compsHistory.length > 0)
      st.previewjb.comps = st.compsHistory.slice(-1)[0].after;
  }
})

jb.component('studio.revert', {
  type: 'action',
  params: [
    {id: 'toIndex', as: 'number'}
  ],
  impl: (ctx, toIndex) => {
    if (st.compsHistory.length == 0 || toIndex < 0) return;
    st.undoIndex = toIndex;
    st.compsHistory = st.compsHistory.slice(0, toIndex + 1);
    setToVersion(st.undoIndex, ctx)
  }
})

jb.component('studio.redo', {
  type: 'action',
  impl: ctx => {
    if (st.undoIndex < st.compsHistory.length)
      setToVersion(st.undoIndex++, ctx, true)
  }
})

jb.component('studio.copy', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) => {
    try {
      const val = st.valOfPath(path)
      st.clipboard = typeof val == 'string' ? val : eval('(' + jb.prettyPrint(val) + ')')
    } catch(e) {
      jb.logExecption(e,'copy')
    }
  }
})

jb.component('studio.paste', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) =>
    (st.clipboard != null) && jb.writeValue(st.refOfPath(path), st.clipboard, ctx)
})

jb.component('studio.scriptHistoryItems', {
  impl: ctx => st.compsHistory
})

jb.component('studio.compsUndoIndex', {
  impl: ctx => st.undoIndex - 1
})

jb.component('studio.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      table({
        items: studio.scriptHistoryItems(),
        fields: [
          field.control({
            title: 'changed',
            control: button({
              title: studio.nameOfRef('%opEvent/ref%'),
              action: studio.gotoPath(studio.pathOfRef('%opEvent/ref%')),
              style: button.href(),
              features: feature.hoverTitle(studio.pathOfRef('%opEvent/ref%'))
            }),
            width: '100'
          }),
          field({title: 'from', data: prettyPrint('%opEvent/oldVal%'), width: '200'}),
          field({title: 'to', data: prettyPrint('%opEvent/newVal%'), width: '200'}),
          field.control({
            title: 'undo/redo',
            control: button({
              title: 'revert to here',
              action: studio.revert('%undoIndex%'),
              style: button.href()
            }),
            width: '100'
          })
        ],
        style: table.plain()
      })
    ],
    features: [
      watchObservable(ctx => st.compsRefHandler.resourceChange, 500),
      css.height({height: '400', overflow: 'auto', minMax: 'max'})
    ]
  })
})

jb.component('studio.openScriptHistory', {
  type: 'action',
  impl: openDialog({
    style: dialog.studioFloating({id: 'script-history', width: '700', height: '400'}),
    content: studio.scriptHistory(),
    title: 'Script History'
  })
})

})()
