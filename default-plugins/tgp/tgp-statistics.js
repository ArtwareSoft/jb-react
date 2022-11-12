
jb.extension('tgp', 'statistics', {
    $phase: 50,
    initExtension() {
      jb.watchableComps && jb.utils.subscribe(jb.watchableComps.source, () => jb.tgp.statistics = {})
      return { statistics: {} }
    },
    calcRefs() {
      if (Object.keys(jb.tgp.statistics).length) return
      const refs = {}, comps = jb.comps;
  
      Object.keys(comps).filter(k=>comps[k]).forEach(k=>
        refs[k] = {
          refs: calcRefs(comps[k].impl).filter((x,index,_self) => x && _self.indexOf(x) === index),
          by: []
      })
      Object.keys(comps).filter(k=>comps[k]).forEach(k=>
        refs[k].refs.forEach(cross=>
          refs[cross] && refs[cross].by.push(k))
      )
      jb.tgp.statistics = refs
  
      function calcRefs(profile) {
        if (profile == null || typeof profile != 'object') return [];
        return Object.values(profile).reduce((res,v)=> [...res,...calcRefs(v)], [jb.utils.compName(profile)])
      }    
    },
    circuitOptions(cmpId) {
      jb.tgp.calcRefs()
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
          jb.tgp.statistics[candidates[k]] && (jb.tgp.statistics[candidates[k]].by || []).forEach(caller=>candidates[caller] = true))
        return Object.keys(candidates).length > length_before
      }
    }
})

jb.component('tgp.circuitOptions', {
  params: [
    {id: 'path'}
  ],
  impl: ({},path) => jb.tgp.circuitOptions(path.split('~')[0])
})

jb.component('tgp.allComps', {
  type: 'data',
  impl: () => Object.keys(jb.comps)
})

jb.component('tgp.componentStatistics', {
  type: 'data',
  params: [
    {id: 'cmpId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,cmpId) => {
	  jb.tgp.calcRefs()

    const cmp = jb.comps[cmpId], refs = jb.tgp.statistics
    if (!cmp) return {}
    const asStr = '' //jb.utils.prettyPrint(cmp.impl || '',{comps: jb.comps})

    return {
      id: cmpId,
      file: (cmp[jb.core.CT].location || [])[0],
      lineInFile: +(cmp[jb.core.CT].location ||[])[1],
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

jb.component('tgp.references', {
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
