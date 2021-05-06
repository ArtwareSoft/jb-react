jb.extension('studio', 'statistics', {
  initExtension_phase40() {
    jb.utils.subscribe(jb.watchableComps.handler.resourceChange, () => jb.studio.statistics = {})
    return { statistics: {} }
  },
  calcRefs() {
    if (Object.keys(jb.studio.statistics).length) return
    const refs = {}, comps = jb.comps;

    Object.keys(comps).filter(k=>comps[k]).forEach(k=>
      refs[k] = {
        refs: calcRefs(comps[k].impl).filter((x,index,_self)=>_self.indexOf(x) === index),
        by: []
    })
    Object.keys(comps).filter(k=>comps[k]).forEach(k=>
      refs[k].refs.forEach(cross=>
        refs[cross] && refs[cross].by.push(k))
    )
    jb.studio.statistics = refs

    function calcRefs(profile) {
      if (profile == null || typeof profile != 'object') return [];
      return Object.values(profile).reduce((res,v)=> [...res,...calcRefs(v)], [jb.utils.compName(profile)])
    }    
  },
  circuitOptions(cmpId) {
    jb.studio.calcRefs()
    const candidates = {[cmpId]: true}
    while (expand()) {}
    const comps = Object.keys(candidates).filter(k => (jb.comps[k].params || []).length == 0)
    return comps.sort((x,y) => mark(y) - mark(x))

    function mark(cmpId) {
      if (cmpId.match(/test|tst/i)) return 10
      return 0
    }

    function expand() {
      const length_before = Object.keys(candidates).length
      Object.keys(candidates).forEach(k=> 
        jb.studio.statistics[candidates[k]] && (jb.studio.statistics[candidates[k]].by || []).forEach(caller=>candidates[caller] = true))
      return Object.keys(candidates).length > length_before
    }
  }
})

jb.component('studio.circuitOptions', {
  params: [
    {id: 'path'}
  ],
  impl: (ctx,path) => jb.studio.circuitOptions(path.split('~')[0])
})

jb.component('studio.allComps', {
  type: 'data',
  impl: () => Object.keys(jb.comps)
})

jb.component('studio.componentStatistics', {
  type: 'data',
  params: [
    {id: 'cmpId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,cmpId) => {
	  jb.studio.calcRefs()

    const cmp = jb.comps[cmpId], refs = jb.studio.statistics
    if (!cmp) return {}
    const asStr = '' //jb.utils.prettyPrint(cmp.impl || '',{comps: jb.comps})

    return {
      id: cmpId,
      file: (cmp[jb.core.location] || [])[0],
      lineInFile: +(cmp[jb.core.location] ||[])[1],
      linesOfCode: (asStr.match(/\n/g)||[]).length,
      refs: refs[cmpId].refs,
      referredBy: refs[cmpId].by,
      type: cmp.type || 'data',
      implType: typeof cmp.impl,
      refCount: refs[cmpId].by.length,
      size: asStr.length
    }
	}
})

jb.component('studio.references', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
	  if (path.indexOf('~') != -1) return [];

    var res = jb.entries(jb.comps)
    	.map(e=>({id: e[0], refs: refs(e[1].impl,`${e[0]}~impl`)}))
      .filter(e=>e.refs.length > 0)
    return res;

    function refs(profile, parentPath) {
    	if (profile && typeof profile == 'object') {
        var subResult = Object.keys(profile).reduce((res,prop)=>
      		res.concat(refs(profile[prop],`${parentPath}~${prop}`)) ,[]);
      	return (profile.$ == path ? [parentPath] : []).concat(subResult);
      }
      return [];
    }
	}
})

jb.component('studio.gotoReferencesOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'refs', as: 'array'}
  ],
  impl: menu.dynamicOptions(
    '%$refs%',
      If('%refs/length% > 1',
      menu.menu({
        title: '%id% (%refs/length%)',
        options: menu.dynamicOptions(
          '%$menuData/refs%',
          menu.action({
            title: '%%',
            action: studio.openComponentInJbEditor('%%', '%$path%')
          })
        )
      }),
      menu.action({
        vars: [Var('compName', split({separator: '~', text: '%refs[0]%', part: 'first'}))],
        title: '%$compName%',
        action: studio.openComponentInJbEditor('%refs[0]%', '%$path%')
      }))
  )
})

jb.component('studio.gotoReferencesButton', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: controlWithCondition(
    Var('refs', studio.references('%$path%')),
    Var(
        'noOfReferences',
        ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0)
      ),
    '%$refs/length%',
    button({
      title: '%$noOfReferences% references',
      action: menu.openContextMenu({
        menu: menu.menu({options: studio.gotoReferencesOptions('%$path%', '%$refs%')})
      })
    })
  )
})

jb.component('studio.gotoReferencesMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: If({
    condition: '%$noOfReferences% > 0',
    vars: [
      Var('refs', studio.references('%$path%')),
      Var('noOfReferences', ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0))
    ],
    then: menu.menu({
      title: '%$noOfReferences% references for %$path%',
      options: studio.gotoReferencesOptions('%$path%', '%$refs%')
    }),
    Else: menu.action('no references for %$path%')
  })
})

jb.component('studio.componentsList', {
  type: 'control',
  impl: group({
    controls: [
      tableTree({
        treeModel: tree.jsonReadOnly(studio.cmpsOfProjectByFiles(), ''),
        leafFields: [
          text({
            text: pipeline(studio.componentStatistics('%val%'), '%size%'),
            title: 'size',
            features: [field.columnWidth('80')]
          }),
          button({
            title: pipeline(studio.componentStatistics('%val%'), '%refCount%.', split('.')),
            action: menu.openContextMenu({
              menu: menu.menu({
                options: [studio.gotoReferencesOptions('%val%', studio.references('%val%'))]
              })
            }),
            style: button.href(),
            features: [field.title('refs'), field.columnWidth('40')]
          }),
          button({
            title: 'delete',
            action: openDialog({
              vars: [Var('compId', pipeline('%path%', split({separator: '~', part: 'last'})))],
              style: dialog.dialogOkCancel(),
              content: group({}),
              title: 'delete %$compId%',
              onOK: runActions(
                studio.delete('%$compId%'),
                ctx => delete jb.studio.comps[ctx.vars.compId],
                refreshControlById('component-list')
              ),
              features: [css('z-index: 6000 !important'), dialogFeature.nearLauncherPosition({})]
            }),
            style: button.x(),
            features: [
              field.columnWidth('20'),
              itemlist.shownOnlyOnItemHover(),
              field.columnWidth('40')
            ]
          })
        ],
        chapterHeadline: text({
          text: pipeline('%path%', split({separator: '~', part: 'last'})),
          title: ''
        }),
        style: tableTree.plain({hideHeaders: false, gapWidth: '130', expColWidth: '10'})
      })
    ],
    features: [
      css.padding({top: '4', right: '5'}),
      css.height({height: '400', overflow: 'auto', minMax: ''}),
      id('component-list')
    ]
  })
})

jb.component('studio.cmpsOfProjectByFiles', {
  type: 'data',
  impl: dynamicObject({
    items: () => st.projectFiles(),
    propertyName: '%%',
    value: pipeline(
      Var('file', '%%'),
      () => st.projectCompsAsEntries(),
      filter(
          equals(
            pipeline(
              ({data}) => jb.studio.previewjb.comps[data][jb.core.location][0],
              split({separator: '/', part: 'last'})
            ),
            '%$file%'
          )
        ),
      '%[0]%',
      aggregate(dynamicObject({items: '%%', propertyName: '%%', value: '%%'}))
    )
  }),
  testData: 'sampleData'
})