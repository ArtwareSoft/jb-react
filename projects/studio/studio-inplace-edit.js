
component('inplaceEdit.activate', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'elem'},
  ],
  impl: runActions(
    Var('inplaceElem', (ctx,{},{path,elem})=> {
        const el = elem || (jb.studio.findElemsByPathCondition(_path => _path == path)[0] || {}).elem
        if (!el) debugger
        return el
    }),
    Var('parentGroup', ctx => jb.tgp.pathParents(ctx.exp('%$path%'), true).find(path=>jb.tgp.compNameOfPath(path) == 'group')),
    Var('parentLayout', If('%$parentGroup%', tgp.compName('%$parentGroup%~layout'))),
    action.if( '%$parentLayout% == layout.grid', inplaceEdit.openGridEditor('%$parentGroup%')),
    writeValue('%$studio/profile_path%', '%$path%'),
    openDialog({
        style: inplaceEdit.popupStyle(),
        content: inplaceEdit.toolbar('%$path%'),
        features: [
          css('background: transparent; box-shadow: 0 0; border: 0'),
          dialogFeature.onClose(contentEditable.deactivate())
        ]
    })
  )
})

component('inplaceEdit.popupStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,{contentComp},h) => h('div.jb-dialog jb-popup',{}, h(contentComp)),
    css: `{ position: absolute; background: var(--jb-editor-background); padding: 6px;
              box-shadow: 2px 2px 3px #d5d5d5; border: 1px solid rgb(213, 213, 213); }`,
    features: [
      dialogFeature.dragTitle({ selector: '*'}),
      dialogFeature.uniqueDialog('inplace-edit-toolbar'),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.nearLauncherPosition({
        offsetLeft: 100,
        offsetTop: (ctx,{inplaceElem}) =>
          jb.ui.studioFixYPos() - jb.ui.computeStyle(inplaceElem,'marginBottom')
      })
    ]
  })
})

component('inplaceEdit.openToolbarOfLastEdit', {
  type: 'action',
  impl: ctx => {
      const path = ctx.run(studio.lastEdit())
      jb.delay(500).then(()=>{
        const _window = jb.studio.previewWindow();
        const el = Array.from(_window.document.querySelectorAll('[cmp-id]'))
          .filter(e=> jb.path(_window.jb.ui.cmps[e.getAttribute('cmp-id')],'ctx.path') == path)[0]
        if (el)
          jb.ui.extendWithServiceRegistry().run({$: 'inplaceEdit.openToolbar', path })
      })
    }
})

component('inplaceEdit.toolbar', {
  type: 'control',
  params: [
    {id: 'path'}
  ],
  impl: group({
    layout: layout.horizontal('3'),
    controls: [
      button({
        title: 'sizes',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('business'), '20')
      }),
      button({
        title: 'edit grid',
        action: inplaceEdit.activate('%$parentGroup%'),
        style: button.mdcIcon(icon({icon: 'grid_on', type: 'mdc'}), '20'),
        features: ctx => ctx.run(feature.if('%$parentLayout% == layout.grid'))
      }),
      button({
        title: 'Change Style',
        action: action.if(
          equals(tgp.compName('%$path%'), 'image'),
          studio.openProperties(),
          studio.openPickProfile('%$path%~style')
        ),
        style: button.mdcIcon(icon('style'), '20')
      }),
      button({
        title: 'Insert Control',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: inplaceEdit.openToolbarOfLastEdit()
        }),
        style: button.mdcIcon(icon('add'), '20')
      }),
      button({
        title: 'Duplicate data item',
        action: ctx => jb.ui.duplicateDataItem(ctx),
        style: button.mdcIcon(icon({icon: 'PlusBoxOutline', type: 'mdi'}), '20'),
        features: feature.if('%$sourceItem%')
      }),
      button({
        vars: [
          Var(
            'parentLayout',
            ctx => jb.tgp.parents(ctx.run('%$path%')).find(path=> jb.tgp.compNameOfPath(path) == 'group') + '~layout'
          )
        ],
        title: 'Layout',
        action: studio.openPickProfile('%$parentLayout%'),
        style: button.mdcIcon(icon('view_quilt'), '20')
      }),
      button({
        title: 'Properties',
        action: studio.openProperties(true),
        style: button.mdcIcon(icon('storage'), '20')
      }),
      button({
        title: 'Delete',
        action: tgp.delete('%$path%'),
        style: button.mdcIcon(icon('delete'), '20')
      })
    ]
  })
})

Object.assign(jb.ui, {
  setOrCreateArrayComp(path,newComp) {
    let arrayRef = jb.tgp.ref(path)
    let arrayVal = jb.val(arrayRef)
    if (!arrayVal) {
      jb.db.writeValue(arrayRef,newComp,ctx)
    } else if (!Array.isArray(arrayVal) && arrayVal.$ == newComp.$) {
      writeToExistingComp(path)
    } else {
      if (!Array.isArray(arrayVal)) { // wrap with array
        jb.db.writeValue(arrayRef,[arrayVal],ctx)
        arrayRef = jb.tgp.ref(path)
        arrayVal = jb.val(arrayRef)
      }
      const existingFeature = arrayVal.findIndex(f=>f.$ == newComp.$)
      if (existingFeature != -1)
        writeToExistingComp(`${path}~${existingFeature}`)
      else
        jb.db.push(arrayRef,newComp,ctx)
    }

    function writeToExistingComp(compPath) {
      Object.keys(newComp).filter(prop=>prop != '$').forEach(prop=>
        jb.db.writeValue(jb.tgp.ref(`${compPath}~${prop}`),newComp[prop],ctx))
    }
  },
  setPositionScript(el,fullProp,value,ctx) {
      let {side,prop} = jb.ui.splitCssProp(fullProp)
      if (fullProp == 'height' || fullProp == 'width')
        side = prop = fullProp
      const featureComp = {$: `css.${prop}`, [side] : value }
      const originatingCtx = jb.studio.previewjb.cmpCtxOfElem(el)
      jb.ui.setOrCreateArrayComp(originatingCtx.path+ '~features',featureComp,ctx)
  },
  duplicateDataItem(ctx) {
    const st = jb.studio
    const item = ctx.vars.sourceItem
    const _jb = st.previewjb
    const ref = _jb.db.asRef(item)
    const handler = _jb.db.refHandler(ref)
    const path = handler.pathOfRef(ref)
    const parent_ref = handler.refOfPath(path.slice(0,-1))
    if (parent_ref && Array.isArray(_jb.val(parent_ref))) {
      const clone = st.previewWindow.JSON.parse(JSON.stringify(item));
      const index = Number(path.slice(-1));
      _jb.db.splice(parent_ref,[[index, 0,clone]],ctx);
      ctx.run(runActions(dialog.closeAll(), studio.refreshPreview()))
    }
  },
})

component('inplaceEdit.thumbStyle', {
    type: 'dialog.style',
    impl: customStyle({
      template: (cmp,state,h) => h('div.jb-dialog jb-popup',{},h(state.contentComp)),
      css: '{ display: block; position: absolute; }',
      features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
    })
})