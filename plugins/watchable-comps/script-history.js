extension('scriptHistory', {
  $phase: 50,
  initExtension() {
    jb.utils.subscribe(jb.watchableComps.source, e => jb.scriptHistory.updateHistory(e))
    return {
        undoIndex: 0,
        lastSaveIndex: 0,
        historyWin: 5,
        compsHistory: [],
    }
  },
  updateLastSave() { jb.scriptHistory.lastSaveIndex = jb.scriptHistory.undoIndex },
  updateHistory(opEvent) {
      jb.log('update history',{opEvent})
      if (jb.path(opEvent.srcCtx,'vars.selectionPreview') || jb.path(opEvent.srcCtx,'probe')) 
        return

      const {historyWin, compsHistory} = jb.scriptHistory
      compsHistory.push({before: opEvent.before, after: opEvent.after, opEvent , undoIndex: jb.scriptHistory.undoIndex})
      if (compsHistory.length > historyWin)
        jb.scriptHistory.compsHistory = compsHistory.slice(compsHistory.length-historyWin)
      jb.scriptHistory.undoIndex = compsHistory.length
  },
  setToVersion(versionIndex, ctx, after) {
    const version = jb.scriptHistory.compsHistory[versionIndex]
    if (!version || !version.opEvent) debugger

    let opEvent = Object.assign({}, version.opEvent)
    opEvent.oldVal = version.opEvent.newVal
    opEvent.newVal = version.opEvent.oldVal
    opEvent.srcCtx = ctx

    if (after) {
      jb.comps = version.after
      jb.watchableComps.handler.resourceVersions = version.opEvent.resourceVersionsAfter
    } else {
      jb.comps = version.before
      jb.watchableComps.handler.resourceVersions = version.opEvent.resourceVersionsBefore
    }
  }
})

component('watchableComps.changedComps', {
  impl: () => jb.utils.unique((jb.scriptHistory.compsHistory || [])
		.slice(jb.scriptHistory.lastSaveIndex)
		.map(e=>jb.path(e,'opEvent.path.0'))).map(id=>({id, comp: jb.comps[id]}))
})

component('watchableComps.undo', {
  type: 'action',
  impl: ctx => {
    if (jb.scriptHistory.undoIndex > 0)
      jb.scriptHistory.setToVersion(--jb.scriptHistory.undoIndex, ctx)
  }
})

component('watchableComps.cleanSelectionPreview', {
  type: 'action',
  impl: () => {
    if (jb.scriptHistory.compsHistory.length > 0)
      jb.comps = jb.scriptHistory.compsHistory.slice(-1)[0].after;
  }
})

component('watchableComps.revert', {
  type: 'action',
  params: [
    {id: 'toIndex', as: 'number'}
  ],
  impl: (ctx, toIndex) => {
    if (jb.scriptHistory.compsHistory.length == 0 || toIndex < 0) return;
    jb.scriptHistory.undoIndex = toIndex;
    jb.scriptHistory.compsHistory = jb.scriptHistory.compsHistory.slice(0, toIndex + 1);
    jb.scriptHistory.setToVersion(jb.scriptHistory.undoIndex, ctx)
  }
})

component('watchableComps.redo', {
  type: 'action',
  impl: ctx => {
    if (jb.scriptHistory.undoIndex < jb.scriptHistory.compsHistory.length)
      jb.scriptHistory.setToVersion(jb.scriptHistory.undoIndex++, ctx, true)
  }
})

component('watchableComps.scriptHistoryItems', {
  impl: ctx => jb.scriptHistory.compsHistory
})