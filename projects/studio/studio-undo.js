jb.extension('watchableComps', 'history', {
  initExtension_phase40() {
    jb.utils.subscribe(jb.watchableComps.handler.resourceChange, e => jb.watchableComps.updateHistory(e))
    return {
        undoIndex: 0,
        historyWin: 5,
        compsHistory: [],
    }
  },
  updateHistory(val, opEvent, source) {
      val.$jb_selectionPreview = opEvent && opEvent.srcCtx && opEvent.srcCtx.vars.selectionPreview
      if (val.$jb_selectionPreview || source == 'probe') return

      const {historyWin, compsHistory} = jb.watchableComps
      compsHistory.push({before: jbm.comps, after: val, opEvent: opEvent, undoIndex: jb.watchableComps.undoIndex})
      if (compsHistory.length > historyWin)
      jb.watchableComps.compsHistory = compsHistory.slice(-1*historyWin)
      if (opEvent)
          jb.watchableComps.undoIndex = compsHistory.length
  },
  setToVersion(versionIndex, ctx, after) {
    const version = jb.watchableComps.compsHistory[versionIndex];
    if (!version || !version.opEvent) debugger;

    let opEvent = Object.assign({}, version.opEvent);
    opEvent.oldVal = version.opEvent.newVal;
    opEvent.newVal = version.opEvent.oldVal;
    opEvent.srcCtx = ctx;

    if (after) {
      jb.comps = version.after
      jb.watchableComps.handler.resourceVersions = version.opEvent.resourceVersionsAfter
    } else {
      jb.comps = version.before;
      jb.watchableComps.handler.resourceVersions = version.opEvent.resourceVersionsBefore;
    }
  }
//  jb.watchableComps.handler.resourceChange.next(opEvent) ???
})

jb.component('studio.undo', {
  type: 'action',
  impl: ctx => {
    if (jb.watchableComps.undoIndex > 0)
      jb.watchableComps.setToVersion(--jb.watchableComps.undoIndex, ctx)
  }
})

jb.component('studio.cleanSelectionPreview', {
  type: 'action',
  impl: () => {
    if (jb.watchableComps.compsHistory.length > 0)
      jb.comps = jb.watchableComps.compsHistory.slice(-1)[0].after;
  }
})

jb.component('studio.revert', {
  type: 'action',
  params: [
    {id: 'toIndex', as: 'number'}
  ],
  impl: (ctx, toIndex) => {
    if (jb.watchableComps.compsHistory.length == 0 || toIndex < 0) return;
    jb.watchableComps.undoIndex = toIndex;
    jb.watchableComps.compsHistory = jb.watchableComps.compsHistory.slice(0, toIndex + 1);
    jb.watchableComps.setToVersion(jb.watchableComps.undoIndex, ctx)
  }
})

jb.component('studio.redo', {
  type: 'action',
  impl: ctx => {
    if (jb.watchableComps.undoIndex < jb.watchableComps.compsHistory.length)
      jb.watchableComps.setToVersion(jb.watchableComps.undoIndex++, ctx, true)
  }
})

jb.component('studio.copy', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) => {
    try {
      const val = jb.studio.valOfPath(path)
      jb.studio.clipboard = typeof val == 'string' ? val : eval('(' + jb.utils.prettyPrint(val,{noMacros: true}) + ')')
    } catch(e) {
      jb.logExecption(e,'copy',{ctx})
    }
  }
})

jb.component('studio.paste', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) =>
    jb.studio.clipboard && jb.db.writeValue(jb.studio.refOfPath(path), jb.studio.clipboard, ctx)
})

jb.component('studio.scriptHistoryItems', {
  impl: ctx => jb.watchableComps.compsHistory
})

jb.component('studio.compsUndoIndex', {
  impl: ctx => jb.watchableComps.undoIndex - 1
})

jb.component('studio.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: studio.scriptHistoryItems(),
        controls: [
          button({
              title: studio.nameOfRef('%opEvent/ref%'),
              action: studio.gotoPath(studio.pathOfRef('%opEvent/ref%')),
              style: button.href(),
              features: feature.hoverTitle(studio.pathOfRef('%opEvent/ref%'))
          }),
          text(prettyPrint('%opEvent/oldVal%')),
          text(prettyPrint('%opEvent/newVal%')),
          button({
              title: 'revert to here',
              action: studio.revert('%undoIndex%'),
              style: button.href()
          })
        ],
      })
    ],
    features: [
      followUp.watchObservable(studio.scriptChange(), 500),
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

