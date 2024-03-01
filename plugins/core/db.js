extension('db', 'onAddComponent', {
  $phase :2,
  initExtension() { 
    jb.val = ref => {
      if (ref == null || typeof ref != 'object') return ref
      const handler = jb.db.refHandler(ref)
      return handler ? handler.val(ref) : ref
    }
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.watchableData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)  
      }
    })
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.passiveData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)  
      }
    })
  },
  removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
  addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,
})

extension('db', {
    initExtension() { return { 
        passiveSym: Symbol.for('passive'),
        resources: {}, consts: {}, 
        watchableHandlers: [],
        isWatchableFunc: [], // assigned by watchable module, if loaded - must be put in array so the code loader will not pack it.
        simpleValueByRefHandler: jb.db._simpleValueByRefHandler()
      }
    },
    _simpleValueByRefHandler() { return {
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
        doOp() {},
    }},
    resource(id,val) { 
        if (typeof val !== 'undefined')
          jb.db.resources[id] = val
        jb.db.useResourcesHandler(h => h.makeWatchable(id))
        return jb.db.resources[id]
    },
    useResourcesHandler: f => jb.db.watchableHandlers.filter(x=>x.resources.id == 'resources').map(h=>f(h))[0],
    passive: (id,val) => typeof val == 'undefined' ? jb.db.consts[id] : (jb.db.consts[id] = jb.db.markAsPassive(val || {})),
    markAsPassive(obj) {
      if (obj && typeof obj == 'object') {
        obj[jb.db.passiveSym] = true
        Object.values(obj).forEach(v=>jb.db.markAsPassive(v))
      }
      return obj
    },
    addWatchableHandler: h => h && jb.db.watchableHandlers.push(h) ,
    removeWatchableHandler: h => jb.db.watchableHandlers = jb.db.watchableHandlers.filter(x=>x!=h),
    
    safeRefCall(ref,f) {
      const handler = jb.db.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler(ref) {
      if (ref && ref.handler) return ref.handler
      if (jb.db.simpleValueByRefHandler.isRef(ref)) 
        return jb.db.simpleValueByRefHandler
      return jb.db.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.db.refHandler(obj) || jb.db.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.db.simpleValueByRefHandler,
    asRef(obj) {
      const watchableHanlder = jb.db.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.db.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx,noNotifications) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.db.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    doOp: (ref,op,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.doOp(ref,op,srcCtx)),
    isRef: ref => jb.db.refHandler(ref),
    isWatchable: ref => jb.db.isWatchableFunc[0] && jb.db.isWatchableFunc[0](ref), // see remark at initExtension
    isValid: ref => jb.db.safeRefCall(ref, h=>h.isValid(ref)),
    pathOfRef: ref => jb.db.safeRefCall(ref, h=>h.pathOfRef(ref)),
    refOfPath: path => jb.db.watchableHandlers.reduce((res,h) => res || h.refOfPath(path),null),
    canChangeDB: ctx => !ctx.probe || ctx.vars.testID
})

component('isRef', {
  type: 'boolean',
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.isRef(obj)
})

component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.asRef(obj)
})
