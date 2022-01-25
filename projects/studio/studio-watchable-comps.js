
jb.extension('studio','watchableComps', {
	$phase: 50,
	initExtension() {
		  jb.utils.subscribe(jb.watchableComps.source, e => jb.studio.scriptChangeHnadler(e))      
  },
	scriptChangeHnadler(e) {
		jb.log('watchableComps studio handler',{ctx: e.srcCtx,e})
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

jb.component('studio.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: watchableComps.scriptHistoryItems(),
        controls: [
          button({
              title: tgp.nameOfRef('%opEvent/ref%'),
              action: studio.gotoPath(tgp.pathOfRef('%opEvent/ref%')),
              style: button.href(),
              features: feature.hoverTitle(tgp.pathOfRef('%opEvent/ref%'))
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
      followUp.watchObservable(watchableComps.scriptChange(), 500),
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

