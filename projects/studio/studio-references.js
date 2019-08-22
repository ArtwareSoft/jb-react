jb.component('studio.path-hyperlink', {
  type: 'control',
  params: [
    { id: 'path', as: 'string', mandatory: true },
    { id: 'prefix', as: 'string' }
  ],
  impl :{$: 'group',
    style :{$: 'layout.horizontal', spacing: '9' },
    controls: [
      {$: 'label', title: '%$prefix%' },
      {$: 'button',
        title: ctx => {
	  		const path = ctx.componentContext.params.path;
	  		const title = jb.studio.shortTitle(path) || '',compName = jb.studio.compNameOfPath(path) || '';
	  		return title == compName ? title : compName + ' ' + title;
	  	},
        action :{$: 'studio.goto-path', path: '%$path%' },
        style :{$: 'button.href' },
        features :{$: 'feature.hover-title', title: '%$path%' }
      }
    ]
  }
})

jb.component('studio.components-cross-ref',  /* studio_componentsCrossRef */ {
  type: 'data',
  impl: ctx => {
	  var _jb = jb.studio.previewjb;
	  jb.studio.scriptChange.subscribe(_=>_jb.statistics = null);
	  if (_jb.statistics) return _jb.statistics;

	  var refs = {}, comps = _jb.comps;

      Object.getOwnPropertyNames(comps).filter(k=>comps[k]).forEach(k=>
      	refs[k] = {
      		refs: calcRefs(comps[k].impl).filter((x,index,self)=>self.indexOf(x) === index) ,
      		by: []
      });
      Object.getOwnPropertyNames(comps).filter(k=>comps[k]).forEach(k=>
      	refs[k].refs.forEach(cross=>
      		refs[cross] && refs[cross].by.push(k))
      );

      return _jb.statistics = jb.entries(comps).map(e=>({
          	id: e[0],
          	refs: refs[e[0]].refs,
          	referredBy: refs[e[0]].by,
          	type: e[1].type || 'data',
          	implType: typeof e[1].impl,
          	refCount: refs[e[0]].by.length
          	//text: jb_prettyPrintComp(comps[k]),
          	//size: jb_prettyPrintComp(e[0],e[1]).length
          }));


      function calcRefs(profile) {
      	if (profile == null || typeof profile != 'object') return [];
      	return Object.getOwnPropertyNames(profile).reduce((res,prop)=>
      		res.concat(calcRefs(profile[prop])),[_jb.compName(profile)])
      }
	}
})

jb.component('studio.references',  /* studio_references */ {
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

jb.component('studio.goto-references-options',  /* studio_gotoReferencesOptions */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'refs', as: 'array'}
  ],
  impl: menu_dynamicOptions(
    '%$refs%',
    {
      $if: '%refs/length% > 1',
      then: menu_menu({
        title: '%id% (%refs/length%)',
        options: menu_dynamicOptions(
          '%$menuData/refs%',
          menu_action({title: '%%', action: studio_openComponentInJbEditor('%%', '%$path%')})
        )
      }),
      else: menu_action({
        vars: [Var('compName', split({separator: '~', text: '%refs[0]%', part: 'first'}))],
        title: '%$compName%',
        action: studio_openComponentInJbEditor('%refs[0]%', '%$path%')
      })
    }
  )
})

jb.component('studio.goto-references-button',  /* studio_gotoReferencesButton */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: controlWithCondition(
    Var('refs', studio_references('%$path%')),
    Var(
        'noOfReferences',
        ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0)
      ),
    '%$refs/length%',
    button({
      title: '%$noOfReferences% references',
      action: menu_openContextMenu({menu: menu_menu({options: studio_gotoReferencesOptions('%$path%', '%$refs%')})})
    })
  )
})

jb.component('studio.goto-references-menu',  /* studio_gotoReferencesMenu */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: {
    $if: '%$noOfReferences% > 0',
    $vars: {
      refs: studio_references('%$path%'),
      noOfReferences: ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0)
    },
    then: menu_menu({
      title: '%$noOfReferences% references for %$path%',
      options: studio_gotoReferencesOptions('%$path%', '%$refs%')
    }),
    else: menu_action('no references for %$path%')
  }
})

