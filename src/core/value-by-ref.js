Object.assign(jb, {
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
        pathOfRef: () => []
    },
    resource: (id,val) => { 
        if (typeof val !== 'undefined')
          jb.resources[id] = val
        jb.mainWatchableHandler && jb.mainWatchableHandler.resourceReferred(id)
        return jb.resources[id]
    },
    passiveSym: Symbol.for('passive'),
    passive: (id,val) => typeof val == 'undefined' ? jb.consts[id] : (jb.consts[id] = jb.markAsPassive(val || {})),
    markAsPassive: obj => {
      if (obj && typeof obj == 'object') {
        obj[jb.passiveSym] = true
        Object.values(obj).forEach(v=>jb.markAsPassive(v))
      }
      return obj
    },
    extraWatchableHandlers: [],
    extraWatchableHandler: (handler,oldHandler) => { 
      jb.extraWatchableHandlers.push(handler)
      const oldHandlerIndex = jb.extraWatchableHandlers.indexOf(oldHandler)
      if (oldHandlerIndex != -1)
        jb.extraWatchableHandlers.splice(oldHandlerIndex,1)
      jb.watchableHandlers = [jb.mainWatchableHandler, ...jb.extraWatchableHandlers].map(x=>x)
      return handler
    },
    setMainWatchableHandler: handler => { 
      jb.mainWatchableHandler = handler
      jb.watchableHandlers = [jb.mainWatchableHandler, ...jb.extraWatchableHandlers].map(x=>x)
    },
    watchableHandlers: [],
    safeRefCall: (ref,f) => {
      const handler = jb.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler: ref => {
      if (ref && ref.handler) return ref.handler
      if (jb.simpleValueByRefHandler.isRef(ref)) 
        return jb.simpleValueByRefHandler
      return jb.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.refHandler(obj) || jb.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.simpleValueByRefHandler,
    asRef: obj => {
      const watchableHanlder = jb.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.writeValue(ref,value,srcCtx)),
    objectProperty: (obj,prop,srcCtx) => jb.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    isRef: ref => jb.refHandler(ref),
    isWatchable: () => false, // overriden by the watchable-ref.js (if loaded)
    isValid: ref => jb.safeRefCall(ref, h=>h.isValid(ref)),
    refreshRef: ref => jb.safeRefCall(ref, h=>h.refresh(ref)),    
})

