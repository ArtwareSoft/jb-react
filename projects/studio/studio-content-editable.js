jb.ns('content-editable')

jb.component('contentEditable.openToolbar', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: runActions(
    writeValue('%$studio/profile_path%', '%$path%'),
    openDialog({
        style: contentEditable.popupStyle(),
        content: contentEditable.toolbar(),
        features: [css('background: transparent; box-shadow: 0 0; border: 0')]
      })
  )
})

jb.component('contentEditable.popupStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: `{ position: absolute; background: white; padding: 6px;
              box-shadow: 2px 2px 3px #d5d5d5; border: 1px solid rgb(213, 213, 213); }
      `,
    features: [
      dialogFeature.dragTitle('','*'),
      dialogFeature.uniqueDialog('content-editable-toolbar'),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.nearLauncherPosition({
        offsetLeft: 100,
        offsetTop: ctx =>
          jb.ui.studioFixYPos() - jb.ui.computeStyle(jb.ui.contentEditable.current.base,'marginBottom')
      })
    ]
  })
})

jb.component('studio.openToolbarOfLastEdit', {
  type: 'action',
  impl: ctx => {
      const path = ctx.run(studio.lastEdit())
      jb.delay(500).then(()=>{
        const _window = jb.studio.previewWindow;
        const el = Array.from(_window.document.querySelectorAll('[jb-ctx]'))
          .filter(e=> jb.path(_window.jb.ctxDictionary[e.getAttribute('jb-ctx')],'path') == path)[0]
        if (el)
          new jb.jbCtx().setVar('$launchingElement',{ el }).run({$: 'content-editable.open-toolbar', path })
      })
    }
})

jb.component('contentEditable.deactivate', {
  type: 'action',
  impl: ctx => {
    jb.ui.contentEditable.current && jb.ui.contentEditable.current.refresh({contentEditableActive: false})
    jb.ui.dialogs.closePopups()
    jb.ui.contentEditable.current = null
  }
})

jb.component('contentEditable.toolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('-10'),
    controls: [
      button({
        title: 'Change Style',
        action: action.if(
          equals(studio.compName(studio.currentProfilePath()), 'image'),
          studio.openProperties(),
          studio.openPickProfile(
            join({separator: '~', items: list(studio.currentProfilePath(), 'style')})
          )
        ),
        style: button.mdcIcon(icon('style'), '0.6')
      }),
      button({
        title: 'Insert Control',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: studio.openToolbarOfLastEdit()
        }),
        style: button.mdcIcon(icon('add'), '0.6')
      }),
      button({
        title: 'Duplicate data item',
        action: ctx => jb.ui.contentEditable.duplicateDataItem(ctx),
        style: button.mdcIcon(icon({icon: 'PlusBoxOutline', type: 'mdi'}), '0.6'),
        features: [feature.if('%$sourceItem%')]
      }),
      button({
        vars: [
          Var(
            'parentLayout',
            ctx =>
          jb.studio.parents(ctx.run(studio.currentProfilePath())).find(path=> jb.studio.compNameOfPath(path) == 'group') + '~layout'
          )
        ],
        title: 'Layout',
        action: studio.openPickProfile('%$parentLayout%'),
        style: button.mdcIcon(icon('view_quilt'), '0.6')
      }),
      button({
        title: 'Properties',
        action: studio.openProperties(true),
        style: button.mdcIcon(icon('storage'), '0.6')
      }),
      button({
        title: 'Delete',
        action: studio.delete(studio.currentProfilePath()),
        style: button.mdcIcon(icon('delete'), '0.6')
      })
    ],
    features: variable({name: 'showTree', value: false, watchable: true})
  })
})

jb.ui.contentEditable = {
  setPositionScript(el,fullProp,value,ctx) {
      let {side,prop} = jb.ui.splitCssProp(fullProp)
      if (fullProp == 'height' || fullProp == 'width')
        side = prop = fullProp
      const featureComp = {$: `css.${prop}`, [side] : value }
      const originatingCtx = jb.studio.previewjb.ctxDictionary[el.getAttribute('jb-ctx')]
      let featuresRef = jb.studio.refOfPath(originatingCtx.path + '~features')
      let featuresVal = jb.val(featuresRef)
      if (!featuresVal) {
        jb.writeValue(featuresRef,featureComp,ctx)
      } else if (!Array.isArray(featuresVal) && featuresVal.$ == featureComp.$) {
        jb.writeValue(jb.studio.refOfPath(originatingCtx.path + `~features~${side}`),value,ctx)
      } else {
        if (!Array.isArray(featuresVal)) { // wrap with array
          jb.writeValue(featuresRef,[featuresVal],ctx)
          featuresRef = jb.studio.refOfPath(originatingCtx.path + '~features')
          featuresVal = jb.val(featuresRef)
        }
        const existingFeature = featuresVal.findIndex(f=>f.$ == featureComp.$)
        if (existingFeature != -1)
          jb.writeValue(jb.studio.refOfPath(originatingCtx.path + `~features~${existingFeature}~${side}`),value,ctx)
        else
          jb.push(featuresRef,featureComp,ctx)
      }
  },
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
  activate(cmp) {
    if (!this.isEnabled()) return
    this.current && this.current.refresh({contentEditableActive: false})
    this.current = cmp
    new jb.jbCtx().setVar('$launchingElement',{ el : cmp.base}).run(runActions(
//      delay(10),
      () => cmp.refresh({contentEditableActive: true}),
//      delay(10),
      contentEditable.openToolbar(cmp.ctx.path),
      contentEditable.openPositionThumbs('x'),
      contentEditable.openPositionThumbs('y'),
    ))
    cmp.base.focus()
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
  duplicateDataItem(ctx) {
    const st = jb.studio
    const item = ctx.vars.sourceItem
    const _jb = st.previewjb
    const ref = _jb.asRef(item)
    const handler = _jb.refHandler(ref)
    const path = handler.pathOfRef(ref)
    const parent_ref = handler.refOfPath(path.slice(0,-1))
    if (parent_ref && Array.isArray(_jb.val(parent_ref))) {
      const clone = st.previewWindow.JSON.parse(JSON.stringify(item));
      const index = Number(path.slice(-1));
      _jb.splice(parent_ref,[[index, 0,clone]],ctx);
      ctx.run(runActions(dialog.closeAll(), studio.refreshPreview()))
    }
  },
}

jb.component('feature.contentEditable', {
  type: 'feature',
  description: 'studio editing behavior',
  params: [
    {id: 'param', as: 'string', description: 'name of param mapped to the content editable element'}
  ],
  impl: features(
    feature.keyboardShortcut(
        'Alt+N',
        () => jb.frame.parent.jb.exec({$:'studio.pickAndOpen', from: 'studio'})
      ),
    htmlAttribute('ondragover', 'over'),
    htmlAttribute('ondrop', 'dropHtml'),
    defHandler('over', (ctx,{ev}) => ev.preventDefault()),
    defHandler(
        'dropHtml',
        (ctx,{cmp, ev},{onDrop}) => {
      ev.preventDefault();
      return Array.from(ev.dataTransfer.items).filter(x=>x.type.match(/html/))[0].getAsString(html => {
          const targetCtx = jb.studio.previewjb.ctxDictionary[ev.target.getAttribute('jb-ctx')]
          new jb.jbCtx().setVar('newCtrl',jb.ui.htmlToControl(html)).run(
                studio.extractStyle('%$newCtrl%', () => targetCtx && targetCtx.path ))
          })
    }
      ),
    interactive(
        ({},{cmp},{param}) => {
      const isHtml = param == 'html'
      const contentEditable = jb.ui.contentEditable
      if (contentEditable && contentEditable.isEnabled()) {
        cmp.onblurHandler = ev => contentEditable.setScriptData(ev,cmp,param,isHtml)
        if (!isHtml)
          cmp.onkeydownHandler = cmp.onkeypressHandler = ev => contentEditable.handleKeyEvent(ev,cmp,param)
        cmp.onmousedownHandler = ev => jb.ui.contentEditable.activate(cmp,ev)
      }
    }
      ),
    templateModifier(
        ({},{cmp,vdom},{param}) => {
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
    }
      ),
    css.dynamic(
        If(
          '%$cmp.state.contentEditableActive%',
          '{ border: 1px dashed grey; background-image: linear-gradient(90deg,rgba(243,248,255,.03) 63.45%,rgba(207,214,229,.27) 98%); border-radius: 3px;}'
        )
      )
  )
})
