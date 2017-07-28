jb.component('studio.components-cross-ref',{
	type: 'data',
	impl: ctx => {
	  var _jb = jb.studio.previewjb;
	  jb.studio.scriptChange.subscribe(_=>_jb.statistics = null);
	  if (_jb.statistics) return _jb.statistics;

	  var refs = {}, comps = _jb.comps;

      Object.getOwnPropertyNames(comps).forEach(k=>
      	refs[k] = {
      		refs: calcRefs(comps[k].impl).filter((x,index,self)=>self.indexOf(x) === index) ,
      		by: []
      });
      Object.getOwnPropertyNames(comps).forEach(k=>
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
      	if (typeof profile != 'object') return [];
      	return Object.getOwnPropertyNames(profile).reduce((res,prop)=>
      		res.concat(calcRefs(profile[prop])),[_jb.compName(profile)])
      }
	}
})

jb.component('studio.references', {
	type: 'data',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => {
	  if (path.indexOf('~') != -1) return [];

    //debugger;refs(jb.studio.previewjb.comps['test.referer1']);

    var res = jb.entries(jb.studio.previewjb.comps)
    	.map(e=>({id: e[0], refs: refs(e[1].impl).map(obj=> e[0]+'~impl~'+ jb.studio.compsRefHandler.pathOfObject(obj,e[1].impl).join('~') ) }))
      .filter(e=>e.refs.length > 0)
    return res;

    function refs(profile) {
    	if (profile && typeof profile == 'object') {
        var subResult = Object.getOwnPropertyNames(profile).reduce((res,prop)=>
      		res.concat(refs(profile[prop])) ,[]);
      	return (profile.$ == path ? [profile] : []).concat(subResult);
      }
      return [];
    }
	}
})

jb.component('studio.goto-references-button', {
  type: 'control',
  params: [
    { id: 'path', as: 'string'},
  ],
  impl :{$: 'control-with-condition',
        $vars: {
          refs :{$: 'studio.references', path: '%$path%' },
          noOfReferences: ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0),
        },
        condition: '%$refs/length%',
        control :{$: 'button',
            title: '%$noOfReferences% references',
            action :{$: 'menu.open-context-menu',
              menu :{$: 'menu.menu', options :{$: 'studio.goto-references-options', path: '%$path%', refs: '%$refs%' } },
            }
        },
      },
})

jb.component('studio.goto-references-menu', {
  type: 'menu.option',
  params: [
    { id: 'path', as: 'string'},
  ],
  impl :{$if: '%$noOfReferences% > 0',
    $vars: {
      refs :{$: 'studio.references', path: '%$path%' },
      noOfReferences: ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0),
    },
    then: {$: 'menu.menu',
      title: '%$noOfReferences% references',
      options :{$: 'studio.goto-references-options', path: '%$path%', refs: '%$refs%' } ,
    },
    else: {$: 'menu.action', title: 'no references'}
  }
})

jb.component('studio.goto-references-options', {
  type: 'control',
  params: [
    { id: 'path', as: 'string'},
    { id: 'refs', as: 'array' },
  ],
  impl :{$: 'menu.dynamic-options',
        items : '%$refs%',
        genericOption :{$if: '%refs/length% > 1',
          then:{$: 'menu.menu',
            title: '%id% (%refs/length%)',
            options:{$: 'menu.dynamic-options',
              items : '%$menuData/refs%',
              genericOption :{$: 'menu.action',
                title: '%%',
                action :{$: 'studio.open-component-in-jb-editor', path: '%%', fromPath: '%$path%' }
              }
            }
          },
          else: {$: 'menu.action',
            $vars: { compName :{$: 'split', separator: '~', text: '%refs[0]%', part: 'first' } },
            title: '%$compName%',
            action :{$: 'studio.open-component-in-jb-editor', path: '%refs[0]%', fromPath: '%$path%' }
          },
        }
      }
})
