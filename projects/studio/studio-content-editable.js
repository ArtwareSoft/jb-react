jb.ns('contentEditable')

jb.ui.contentEditable = {
  setScriptData(ev,cmp,prop,isHtml) {
      const vdomCmp = jb.studio.previewjb.ctxDictionary[cmp.base.getAttribute('jb-ctx')].runItself()
      vdomCmp.renderVdom()
      const resourceRef = vdomCmp.toObserve.filter(e=>e.id == prop).map(e=>e.ref)[0]
      const scriptRef = this.scriptRef(vdomCmp,prop)
      const val = isHtml ? ev.target.innerHTML : ev.target.innerText
      if (resourceRef)
          jb.studio.previewjb.writeValue(resourceRef,val,vdomCmp.ctx)
      else if (scriptRef)
          jb.writeValue(scriptRef,val,vdomCmp.ctx)
  },
  isEnabled() {
    return new jb.jbCtx().exp('%$studio/settings/contentEditable%')
  },
  activate(el) {
    if (!this.isEnabled()) return
    const ctx = new jb.jbCtx().setVar('$launchingElement',{ el })
    const jbUi = jb.studio.previewjb.ui
    ctx.run(inplaceEdit.activate(jbUi.ctxOfElem(el).path,el))
    if (this.current == el) return
    if (this.current)
        jbUi.refreshElem(this.current,{contentEditableActive: false})
        
    jbUi.refreshElem(el,{contentEditableActive: true})
    this.current = el
    jb.ui.focus(el,'contentEditable activate',ctx)
  },
  handleKeyEvent(ev,cmp,prop) {
    if (ev.keyCode == 13) {
        this.setScriptData(ev,cmp,prop)
        new jb.jbCtx().run(runActions(
          delay(1), // can not wait for script change delay
          contentEditable.deactivate()
        ))
        return false // stop propagation. sometimes does not work..
    }
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

jb.component('feature.contentEditableDropHtml', {
  type: 'feature',
  impl: features(
    htmlAttribute('ondragover', 'over'),
    htmlAttribute('ondrop', 'dropHtml'),
    defHandler('over', (ctx,{ev}) => ev.preventDefault()),
    defHandler('dropHtml',(ctx,{ev}) => { 
      ev.preventDefault();
      return Array.from(ev.dataTransfer.items).filter(x=>x.type.match(/html/))[0].getAsString(html => {
          const targetCtx = jb.studio.previewjb.ctxDictionary[ev.target.getAttribute('jb-ctx')]
          new jb.jbCtx().setVar('newCtrl',jb.ui.htmlToControl(html)).run(
                studio.extractStyle('%$newCtrl%', () => targetCtx && targetCtx.path ))
          })
    })
  )
})

jb.component('feature.contentEditable', {
  type: 'feature',
  description: 'studio editing behavior',
  params: [
    {id: 'param', as: 'string', description: 'name of param mapped to the content editable element'}
  ],
  impl: features(
    feature.keyboardShortcut('Alt+N', () => jb.frame.parent.jb.exec({$:'studio.pickAndOpen', from: 'studio'})),
    feature.keyboardShortcut('Ctrl+Z', () => jb.frame.parent.jb.exec({$:'studio.undo', from: 'studio'})),
    feature.keyboardShortcut('Ctrl+Y', () => jb.frame.parent.jb.exec({$:'studio.redo', from: 'studio'})),

    interactive(({},{cmp},{param}) => {
      const isHtml = param == 'html'
      const contentEditable = jb.ui.contentEditable
      if (contentEditable && contentEditable.isEnabled()) {
        cmp.onblurHandler = ev => contentEditable.setScriptData(ev,cmp,param,isHtml)
        if (!isHtml)
          cmp.onkeydownHandler = cmp.onkeypressHandler = ev => contentEditable.handleKeyEvent(ev,cmp,param)
        cmp.onmousedownHandler = () => jb.ui.contentEditable.activate(cmp.base)
      }
    }),
    templateModifier(({},{cmp,vdom},{param}) => {
      const contentEditable = jb.ui.contentEditable
      if (!contentEditable || cmp.ctx.vars.$runAsWorker || !contentEditable.isEnabled() || param && !contentEditable.refOfProp(cmp,param)) return vdom
      const attsToInject = cmp.state.contentEditableActive ? {contenteditable: 'true', onblur: true, onmousedown: true, onkeypress: true, onkeydown: true} : {onmousedown: true};
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
    css(
        If(
          '%$cmp.state.contentEditableActive%',
          '{ border: 1px dashed grey; background-image: linear-gradient(90deg,rgba(243,248,255,.03) 63.45%,rgba(207,214,229,.27) 98%); border-radius: 3px;}'
        )
      )
  )
})

jb.component('contentEditable.deactivate', {
  type: 'action',
  impl: ctx => {
    const previewUI = jb.studio.previewjb.ui
    jb.ui.contentEditable.current && previewUI.refreshElem(jb.ui.contentEditable.current,{contentEditableActive: false})
    jb.ui.contentEditable.current = null
  }
})
