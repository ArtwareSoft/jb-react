
extension('tgp', 'statistics', {
    $phase: 50,
    initExtension() {
//      jb.watchableComps && jb.utils.subscribe(jb.watchableComps.source, () => jb.tgp.statistics = {})
      return { statistics: {} }
    },
    calcRefs() {
      if (Object.keys(jb.tgp.statistics).length) return
      const refs = {}, comps = jb.comps;
  
      Object.keys(comps).filter(k=>comps[k]).forEach(k=>
        refs[k] = {
          refs: [...calcRefs(comps[k].impl), ...calcRefs(comps[k].params|| [])].filter((x,index,_self) => x && _self.indexOf(x) === index),
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
    circuitOptions(compId) {
      jb.tgp.calcRefs()
      const shortId = compId.split('>').pop().split('.').pop()
      const candidates = {[compId]: true}
      while (expand()) {}
      const comps = Object.keys(candidates).filter(compId => noOpenParams(compId))
      return comps.sort((x,y) => mark(y) - mark(x)).map(id=>({id, shortId: id.split('>').pop(), location: jb.comps[id].$location}))
  
      function mark(id) {
        if (id.match(/^test<>/) && id.indexOf(shortId) != -1) return 20
        if (id.match(/^test<>/)) return 10
        return 0
      }

      function noOpenParams(id) {
        return (jb.comps[id].params || []).filter(p=>!p.defaultValue).length == 0
      }
  
      function expand() {
        const length_before = Object.keys(candidates).length
        Object.keys(candidates).forEach(k=> 
          jb.tgp.statistics[k] && (jb.tgp.statistics[k].by || []).forEach(caller=>candidates[caller] = true))
        return Object.keys(candidates).length > length_before
      }
    }
})

component('tgp.circuitOptions', {
  type: 'data',
  params: [
    {id: 'path'}
  ],
  impl: ({},path) => jb.tgp.circuitOptions(path.split('~')[0])
})

component('tgp.allComps', {
  type: 'data',
  impl: () => Object.keys(jb.comps)
})

component('tgp.componentStatistics', {
  type: 'data',
  params: [
    {id: 'cmpId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,cmpId) => {
	  jb.tgp.calcRefs()

    const cmp = jb.comps[cmpId]
    const cmpRefs = jb.tgp.statistics[cmpId] || {}
    if (!cmp) return {}
    const asStr = '' //jb.utils.prettyPrint(cmp.impl || '',{comps: jb.comps})

    return {
      id: cmpId,
      file: (cmp.$location || {}).path,
      lineInFile: +(cmp.$location ||{}).line,
      linesOfCode: (asStr.match(/\n/g)||[]).length,
      refs: cmpRefs.refs,
      referredBy: cmpRefs.by,
      type: cmp.type || 'data',
      implType: typeof cmp.impl,
      refCount: jb.path(cmpRefs.by,'length'),
      size: asStr.length
    }
	}
})

component('tgp.references', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
	  if (path.indexOf('~') != -1) return [];

    return jb.entries(jb.comps)
    	.map(e=>({id: e[0], refs: refs(e[1].impl,`${e[0]}~impl`)}))
      .filter(e=>e.refs.length > 0)

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
