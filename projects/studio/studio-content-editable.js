jb.ns('content-editable')

jb.component('content-editable.open-toolbar', {
    type: 'action',
    params: [
        {id: 'path', as: 'string'},
    ],
    impl: runActions(
        writeValue('%$studio/profile_path%','%$path%'),
        openDialog({
            style: contentEditable.popupStyle(),
            content: contentEditable.toolbar()
    }))
})

jb.component('content-editable.open-layout', {
  type: 'action',
  params: [
      {id: 'path', as: 'string'},
  ],
  impl: runActions(
      writeValue('%$studio/profile_path%','%$path%'),
      openDialog({
          content: contentEditable.toolbar()
  }))
})

jb.component('content-editable.popup-style', {
    type: 'dialog.style',
    impl: customStyle({
      template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
      css: `{ position: absolute; background: white; padding: 6px; opacity: 0.7;
              box-shadow: 2px 2px 3px #d5d5d5; border: 1px solid rgb(213, 213, 213); }
          ~:hover { opacity: 1}
          >*>* { width: 0 }
          ~:hover >*>* { width: 24px }
          >*>*:first-child { width: 24px;}
      `,
      features: [
        css(''),
        dialogFeature.uniqueDialog('content-editable-toolbar'),
        dialogFeature.maxZIndexOnClick(),
        dialogFeature.closeWhenClickingOutside(),
        dialogFeature.nearLauncherPosition({offsetLeft: 100, offsetTop: () => document.querySelector('#jb-preview').getBoundingClientRect().top})
      ]
   })
})

jb.component('studio.open-toolbar-of-last-edit', { /* studio.openToolbarOfLastEdit */
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

jb.component('content-editable.toolbar', { /* contentEditable.toolbar */
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      button({
        title: 'Edit Style',
        action: action.if(equals(studio.compName(studio.currentProfilePath()), 'image'),
          studio.openProperties(),
          studio.openPickProfile(
            join({separator: '~', items: list(studio.currentProfilePath(), 'style')})
          )
        ),
        style: button.mdcIcon('border_color')
      }),
      button({
        title: 'Insert Control',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: studio.openToolbarOfLastEdit()
        }),
        style: button.mdcIcon('add')
      }),
      button({
        title: 'Duplicate data item',
        action: ctx => jb.ui.contentEditable.duplicateDataItem(ctx),
        style: button.mdcIcon('control_point'),
        features: feature.if('%$sourceItem%')
      }),
      button({
        vars: Var('parentLayout', ctx =>
          jb.studio.parents(ctx.run(studio.currentProfilePath())).find(path=> jb.studio.compNameOfPath(path) == 'group') + '~layout'),
        title: 'Layout',
        action: studio.openPickProfile('%$parentLayout%'),
        style: button.mdcIcon('view_quilt')
      }),
      button({
        title: 'Properties',
        action: studio.openProperties(true),
        style: button.mdcIcon('storage')
      }),
      button({
        title: 'Delete',
        action: studio.delete(studio.currentProfilePath()),
        style: button.mdcIcon('delete')
      })
     ],
    features: variable({name:'showTree', value: false, watchable: true})
  })
})

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
    openToolbar(ev,path,item) { 
        new jb.jbCtx().setVar('$launchingElement',{ el : ev.target}).setVar('sourceItem',item)
            .run({$: 'content-editable.open-toolbar',path})
    },
    handleKeyEvent(ev,cmp,prop) {
        if (ev.keyCode == 13) {
            this.setScriptData(ev,cmp,prop)
            jb.delay(1).then(() => cmp.refresh()) // can not wait for script change delay
            return false // does not work..
        }
    },
    scriptRef(cmp,prop) {
        const ref = jb.studio.refOfPath(cmp.ctx.path + '~' + prop)
        const val = jb.val(ref)
        return typeof val === 'string' && ref
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
