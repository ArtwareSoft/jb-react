jb.initLibs('db', {
    resources: {}, consts: {},
    simpleValueByRefHandler: {
        val(v) {
          if (v && v.$jb_val) return v.$jb_val()
          return v && v.$jb_parent ? v.$jb_parent[v.$jb_property] : v
        },
        writeValue(to,value,srcCtx) {
          jb.log('writeValue jbParent',{value,to,srcCtx})
          if (!to) return
          if (to.$jb_val)
            to.$jb_val(this.val(value))
          else if (to.$jb_parent)
            to.$jb_parent[to.$jb_property] = this.val(value)
          return to
        },
        push(ref,toAdd) {
          const arr = jb.asArray(jb.val(ref))
          jb.toarray(toAdd).forEach(item => arr.push(item))
        },
        asRef(value) {
          return value
        },
        isRef(value) {
          return value && (value.$jb_parent || value.$jb_val || value.$jb_obj)
        },
        objectProperty(obj,prop) {
            if (this.isRef(obj[prop]))
              return obj[prop];
            else
              return { $jb_parent: obj, $jb_property: prop };
        },
        pathOfRef: () => [],
        doOp: () => {}
    },
    resource: (id,val) => { 
        if (typeof val !== 'undefined')
          jb.db.resources[id] = val
        jb.db.mainWatchableHandler && jb.db.mainWatchableHandler.resourceReferred(id)
        return jb.db.resources[id]
    },
    passiveSym: Symbol.for('passive'),
    passive: (id,val) => typeof val == 'undefined' ? jb.db.consts[id] : (jb.db.consts[id] = jb.db.markAsPassive(val || {})),
    markAsPassive: obj => {
      if (obj && typeof obj == 'object') {
        obj[jb.db.passiveSym] = true
        Object.values(obj).forEach(v=>jb.db.markAsPassive(v))
      }
      return obj
    },
    extraWatchableHandlers: [],
    extraWatchableHandler: (handler,oldHandler) => { 
      jb.db.extraWatchableHandlers.push(handler)
      const oldHandlerIndex = jb.db.extraWatchableHandlers.indexOf(oldHandler)
      if (oldHandlerIndex != -1)
        jb.db.extraWatchableHandlers.splice(oldHandlerIndex,1)
      jb.db.watchableHandlers = [jb.db.mainWatchableHandler, ...jb.db.extraWatchableHandlers].map(x=>x)
      return handler
    },
    initExtraWatchableHandler(resources, {oldHandler, initUIObserver} = {}) {
      const res = jb.db.extraWatchableHandler(new jb.db.WatchableValueByRef(resources),oldHandler)
      initUIObserver && jb.ui && jb.ui.subscribeToRefChange(res)
      return res
    },
    setMainWatchableHandler: handler => { 
      jb.db.mainWatchableHandler = handler
      jb.db.watchableHandlers = [jb.db.mainWatchableHandler, ...jb.db.extraWatchableHandlers].map(x=>x)
    },
    watchableHandlers: [],
    safeRefCall: (ref,f) => {
      const handler = jb.db.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler: ref => {
      if (ref && ref.handler) return ref.handler
      if (jb.db.simpleValueByRefHandler.isRef(ref)) 
        return jb.db.simpleValueByRefHandler
      return jb.db.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.db.refHandler(obj) || jb.db.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.db.simpleValueByRefHandler,
    asRef: obj => {
      const watchableHanlder = jb.db.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.db.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx,noNotifications) => !srcCtx.probe && jb.db.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.db.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    doOp: (ref,op,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.doOp(ref,op,srcCtx)),
    isRef: ref => jb.db.refHandler(ref),
    isWatchable: () => false, // overriden by the watchable-ref.js (if loaded)
    isValid: ref => jb.db.safeRefCall(ref, h=>h.isValid(ref)),
    //refreshRef: ref => jb.db.safeRefCall(ref, h=>h.refresh(ref)),    
    pathOfRef: ref => jb.db.safeRefCall(ref, h=>h.pathOfRef(ref)),
    refOfPath: path => jb.db.watchableHandlers.reduce((res,h) => res || h.refOfPath(path),null),
})

