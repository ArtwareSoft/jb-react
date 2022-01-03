jb.extension('watchableComps', {
  $phase: 30,
  initExtension() {
      return { source: jb.callbag.subject() }
  },
  startWatch() {
    if (jb.watchableComps.handler)
      return jb.watchableComps.handler
    jb.log('watchableComps startWatch',{})
    const compsRef = val => typeof val == 'undefined' ? jb.comps : (jb.comps = val);
    compsRef.id = 'comps'
    const handler = jb.watchableComps.handler = new jb.watchable.WatchableValueByRef(compsRef)
    jb.db.addWatchableHandler(handler)
    jb.utils.subscribe(handler.resourceChange, e => jb.watchableComps.source.next(e))
    return handler
  }
})

jb.component('watchableComps.scriptChange', {
	type: 'rx',
  category: 'source',
	impl: source.callbag(() => jb.watchableComps.source),
})

jb.extension('watchableComps', 'history', {
	$phase: 50,
  initExtension() {
    jb.utils.subscribe(jb.watchableComps.source, e => jb.watchableComps.updateHistory(e))
    return {
        undoIndex: 0,
        lastSaveIndex: 0,
        historyWin: 5,
        compsHistory: [],
    }
  },
  updateLastSave() { jb.watchableComps.lastSaveIndex = jb.watchableComps.undoIndex },
  updateHistory(opEvent) {
      jb.log('watchableComps update history',{opEvent})
      if (jb.path(opEvent.srcCtx,'vars.selectionPreview') || jb.path(opEvent.srcCtx,'probe')) 
        return

      const {historyWin, compsHistory} = jb.watchableComps
      compsHistory.push({before: opEvent.before, after: opEvent.after, opEvent , undoIndex: jb.watchableComps.undoIndex})
      if (compsHistory.length > historyWin)
        jb.watchableComps.compsHistory = compsHistory.slice(compsHistory.length-historyWin)
      jb.watchableComps.undoIndex = compsHistory.length
  },
  setToVersion(versionIndex, ctx, after) {
    const version = jb.watchableComps.compsHistory[versionIndex]
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

jb.component('watchableComps.changedComps', {
	impl: () => jb.utils.unique((jb.watchableComps.compsHistory || [])
		.slice(jb.watchableComps.lastSaveIndex)
		.map(e=>jb.path(e,'opEvent.path.0'))).map(id=>({id, comp: jb.comps[id]})),
})

jb.component('watchableComps.undo', {
  type: 'action',
  impl: ctx => {
    if (jb.watchableComps.undoIndex > 0)
      jb.watchableComps.setToVersion(--jb.watchableComps.undoIndex, ctx)
  }
})

jb.component('watchableComps.cleanSelectionPreview', {
  type: 'action',
  impl: () => {
    if (jb.watchableComps.compsHistory.length > 0)
      jb.comps = jb.watchableComps.compsHistory.slice(-1)[0].after;
  }
})

jb.component('watchableComps.revert', {
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

jb.component('watchableComps.redo', {
  type: 'action',
  impl: ctx => {
    if (jb.watchableComps.undoIndex < jb.watchableComps.compsHistory.length)
      jb.watchableComps.setToVersion(jb.watchableComps.undoIndex++, ctx, true)
  }
})

jb.component('watchableComps.scriptHistoryItems', {
  impl: ctx => jb.watchableComps.compsHistory
})
