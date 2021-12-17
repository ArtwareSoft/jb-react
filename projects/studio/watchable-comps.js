jb.extension('watchableComps', {
  $phase: 30,
  initExtension() {
        const compsRef = val => typeof val == 'undefined' ? jb.comps : (jb.comps = val);
        compsRef.id = 'comps'
        const handler = new jb.watchable.WatchableValueByRef(compsRef)
        jb.db.addWatchableHandler(handler)
        return { handler }
  },
	forceLoad() {}
})

jb.extension('watchableComps', 'history', {
	$phase: 50,
  initExtension() {
    jb.utils.subscribe(jb.watchableComps.handler.resourceChange, e => jb.watchableComps.updateHistory(e))
    return {
        undoIndex: 0,
        lastSaveIndex: 0,
        historyWin: 5,
        compsHistory: [],
    }
  },
  updateLastSave() { jb.watchableComps.lastSaveIndex = jb.watchableComps.undoIndex },
  updateHistory(opEvent) {
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
//  jb.watchableComps.handler.resourceChange.next(opEvent) ???
})

jb.extension('watchableComps', 'studio', {
	$phase: 50,
	initExtension() {
		  jb.studio.scriptChange && jb.utils.subscribe(jb.watchableComps.handler.resourceChange, e => jb.watchableComps.scriptChangeHnadler(e))      
  },
	scriptChangeHnadler(e) {
		jb.log('watchable studio script changed',{ctx: e.srcCtx,e})
		jb.studio.scriptChange.next(e)
		writeValueToDataResource(e.path,e.newVal)
		if (jb.studio.isStudioCmp(e.path[0]))
			jb.studio.refreshStudioComponent(e.path)
		jb.studio.lastStudioActivity = new Date().getTime()
		e.srcCtx.run(writeValue('%$studio/lastStudioActivity%',() => jb.studio.lastStudioActivity))
	
		jb.studio.highlightByScriptPath(e.path)
	
		function writeValueToDataResource(path,value) {
			if (path.length > 1 && ['watchableData','passiveData'].indexOf(path[1]) != -1) {
				const resource = jb.db.removeDataResourcePrefix(path[0])
				const dataPath = '%$' + [resource, ...path.slice(2)].map(x=>isNaN(+x) ? x : `[${x}]`).join('/') + '%'
				return jb.exec(writeValue(dataPath,_=>value))
			}
		}
	},  
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

jb.component('studio.scriptChange', {
	type: 'rx',
	impl: source.callbag(() => jb.studio.scriptChange)
})

jb.component('studio.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: watchableComps.scriptHistoryItems(),
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
              action: watchableComps.revert('%undoIndex%'),
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

