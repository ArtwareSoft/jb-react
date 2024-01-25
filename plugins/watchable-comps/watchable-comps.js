using('rx')

extension('watchableComps', {
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

component('watchableComps.scriptChange', {
  type: 'rx',
  category: 'source',
  impl: source.callbag(() => jb.watchableComps.source)
})


