jb.ns('contentEditable')

jb.ui.contentEditable = {
  setScriptData(ev,cmp,prop,isHtml) {
    const val = isHtml ? ev.innerHTML : ev.innerText
    const resourceRef = cmp.toObserve.filter(e=>e.id == prop).map(e=>e.ref)[0]
    if (resourceRef) {
      jb.studio.previewjb.db.writeValue(resourceRef,val,cmp.ctx)
    } else {
      const scriptRef = this.scriptRef(cmp,prop)
      scriptRef && jb.db.writeValue(scriptRef,val,cmp.ctx)
    }
  },
  isEnabled() {
    return new jb.jbCtx().exp('%$studio/settings/contentEditable%')
  },
  activate(cmp,ev) {
    if (!this.isEnabled()) return
    const ctx = jb.ui.extendWithServiceRegistry().setVars({ev})
    const previewCtx = new jb.studio.previewjb.jbCtx()
    const jbUi = jb.studio.previewjb.ui
    const el = jb.ui.elemOfCmp(previewCtx,cmp.cmpId)
    ctx.run(inplaceEdit.activate(cmp.ctx.path,el))
    if (this.current == el) return
    if (this.current)
        jbUi.refreshElem(this.current,{contentEditableActive: false})
        
    jbUi.refreshElem(el,{contentEditableActive: true})
    this.current = el
    jb.ui.focus(el,'contentEditable activate',ctx)
  },
  scriptRef(cmp,prop) {
    const ref = jb.studio.refOfPath(cmp.originatingCtx().path + '~' + prop)
    const val = jb.val(ref)
    return typeof val === 'string' && cmp.ctx.exp(val) === val && ref
  },
  refOfProp(cmp,prop) {
    return cmp.toObserve.filter(e=>e.id == prop).map(e=>e.ref)[0] || this.scriptRef(cmp,prop)
  },
}

jb.component('feature.contentEditable', {
  type: 'feature',
  description: 'studio editing behavior',
  params: [
    {id: 'param', as: 'string', description: 'name of param mapped to the content editable element'}
  ],
  impl: If(()=> jb.ui.contentEditable.isEnabled(), features(
    method('activate',({},{cmp,ev}) => jb.ui.contentEditable.activate(cmp,ev)),
    frontEnd.flow(source.frontEndEvent('mousedown'), rx.filter(not('%$cmp.state.contentEditableActive%')),frontEnd.addUserEvent(), 
      sink.BEMethod('activate')),
    If('%$$state.contentEditableActive%', features(
      method('execProfile',({data}) => jb.ui.parentFrameJb() && jb.ui.parentFrameJb().exec({$: data, from: 'studio'})),
      method('setScriptData',({},{ev,cmp},{param}) => jb.ui.contentEditable.setScriptData(ev,cmp,param,param == 'html') ),
      method('onEnter', ({},{ev,cmp},{param}) => {
        jb.ui.contentEditable.setScriptData(ev,cmp,param)
        new jb.jbCtx().run(runActions(
          delay(1), // can not wait for script change delay
          contentEditable.deactivate()
        ))
      }),
      feature.keyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.keyboardShortcut('Ctrl+Z', action.runBEMethod('execProfile','studio.undo')),
      feature.keyboardShortcut('Ctrl+Y', action.runBEMethod('execProfile','studio.redo')),
      frontEnd.enrichUserEvent(({},{ev}) => ({ innerText: ev.target.innerText, innerHTML: ev.target.innerText})),
      frontEnd.flow(source.frontEndEvent('blur'), rx.filter('%$cmp.state.contentEditableActive%'), frontEnd.addUserEvent(), 
        sink.BEMethod('setScriptData')),
      frontEnd.onRefresh(({},{$state,el}) => el.onkeydown = $state.contentEditableActive ? 
          ev => {
            if (ev.keyCode == 13) {
              jb.studio.previewjb.ui.runBEMethod(el,'onEnter',null,{ev: jb.ui.buildUserEvent(ev, el)})
              return false
            }
            return true
          } : null
      ),
      templateModifier(({},{cmp,vdom},{param}) => {
        const contentEditable = jb.ui.contentEditable
        if (!contentEditable || !contentEditable.isEnabled() || param && !contentEditable.refOfProp(cmp,param)) return vdom // jb.frame.isWorker || 
        const attsToInject = cmp.state.contentEditableActive ? {contenteditable: 'true'} : {} // onkeypress: true
        // fix spacebar bug in button
        if (vdom.tag && vdom.tag.toLowerCase() == 'button' && vdom.children && vdom.children.length == 1 && typeof vdom.children[0] == 'string') {
          vdom.children[0] = jb.ui.h('span',attsToInject,vdom.children[0])
          return vdom
        } else if (vdom.tag && vdom.tag.toLowerCase() == 'button' && jb.ui.find(vdom,'.mdc-button__label')) {
          const atts = jb.ui.find(vdom,'.mdc-button__label').attributes || {}
          Object.assign(atts,attsToInject,{style: [(atts.style || ''),'z-index: 100'].filter(x=>x).join(';') })
          return vdom
        }
        vdom.attributes = vdom.attributes || {};
        Object.assign(vdom.attributes,attsToInject)
        return vdom;
      }),
      css('{ border: 1px dashed grey; background-image: linear-gradient(90deg,rgba(243,248,255,.03) 63.45%,rgba(207,214,229,.27) 98%); border-radius: 3px;}')
    ))
  ))
})

jb.component('contentEditable.deactivate', {
  type: 'action',
  impl: ctx => {
    const previewUI = jb.studio.previewjb.ui
    jb.ui.contentEditable.current && previewUI.refreshElem(jb.ui.contentEditable.current,{contentEditableActive: false})
    jb.ui.contentEditable.current = null
  }
})
