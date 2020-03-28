jb.component('studio.allComps', {
  type: 'data',
  impl: (ctx,cmpId) => Object.keys(jb.studio.previewjb.comps)
})

jb.component('studio.componentStatistics', {
  type: 'data',
  params: [
    {id: 'cmpId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,cmpId) => {
	  const _jb = jb.studio.previewjb;
	  jb.subscribe(jb.studio.scriptChange, _=>_jb.statistics = null);
	  if (!_jb.statistics) {
      const refs = {}, comps = _jb.comps;

      Object.keys(comps).filter(k=>comps[k]).forEach(k=>
        refs[k] = {
          refs: calcRefs(comps[k].impl).filter((x,index,self)=>self.indexOf(x) === index) ,
          by: []
      });
      Object.keys(comps).filter(k=>comps[k]).forEach(k=>
        refs[k].refs.forEach(cross=>
          refs[cross] && refs[cross].by.push(k))
      );

      _jb.statistics = refs;
    }

    const cmp = _jb.comps[cmpId], refs = _jb.statistics
    if (!cmp) return {}
    const asStr = '' //jb.prettyPrint(cmp.impl || '',{comps: _jb.comps})

    return {
      id: cmpId,
      file: (cmp[_jb.location] || [])[0],
      lineInFile: +(cmp[_jb.location] ||[])[1],
      linesOfCode: (asStr.match(/\n/g)||[]).length,
      refs: refs[cmpId].refs,
      referredBy: refs[cmpId].by,
      type: cmp.type || 'data',
      implType: typeof cmp.impl,
      refCount: refs[cmpId].by.length,
      size: asStr.length
    }

    function calcRefs(profile) {
      if (profile == null || typeof profile != 'object') return [];
      return Object.keys(profile).reduce((res,prop)=>
        res.concat(calcRefs(profile[prop])),[_jb.compName(profile)])
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

    //debugger;refs(jb.studio.previewjb.comps['test.referer1']);
    var res = jb.entries(jb.studio.previewjb.comps)
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
    {
      '$if': '%refs/length% > 1',
      then: menu.menu({
        title: '%id% (%refs/length%)',
        options: menu.dynamicOptions(
          '%$menuData/refs%',
          menu.action({
            title: '%%',
            action: studio.openComponentInJbEditor('%%', '%$path%')
          })
        )
      }),
      else: menu.action({
        vars: [Var('compName', split({separator: '~', text: '%refs[0]%', part: 'first'}))],
        title: '%$compName%',
        action: studio.openComponentInJbEditor('%refs[0]%', '%$path%')
      })
    }
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
  impl: {
    '$if': '%$noOfReferences% > 0',
    '$vars': {
      refs: studio.references('%$path%'),
      noOfReferences: ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0)
    },
    then: menu.menu({
      title: '%$noOfReferences% references for %$path%',
      options: studio.gotoReferencesOptions('%$path%', '%$refs%')
    }),
    else: menu.action('no references for %$path%')
  }
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
