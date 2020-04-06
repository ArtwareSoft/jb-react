jb.ns('inplaceEdit')

jb.component('inplaceEdit.activate', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'elem'},
  ],
  impl: runActions(
    Var('inplaceElem', (ctx,{},{path,elem})=> {
        const el = elem || (jb.studio.findElemsByCtxCondition(ctx => ctx.path == path)[0] || {}).elem
        if (!el) debugger
        return el
    }),
    Var('parentGroup', ctx => jb.studio.pathParents(ctx.exp('%$path%'), true).find(path=>jb.studio.compNameOfPath(path) == 'group')),
    Var('parentLayout', studio.compName('%$parentGroup%~layout')),
    action.if( '%$parentLayout% == layout.grid', inplaceEdit.openGridEditor('%$parentGroup%')),
    writeValue('%$studio/profile_path%', '%$path%'),
    openDialog({
        style: inplaceEdit.popupStyle(),
        content: inplaceEdit.toolbar('%$path%'),
        features: [css('background: transparent; box-shadow: 0 0; border: 0')]
    })
  )
})

jb.component('inplaceEdit.popupStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: `{ position: absolute; background: white; padding: 6px;
              box-shadow: 2px 2px 3px #d5d5d5; border: 1px solid rgb(213, 213, 213); }
      `,
    features: [
      dialogFeature.dragTitle('','*'),
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

jb.component('inplaceEdit.openToolbarOfLastEdit', {
  type: 'action',
  impl: ctx => {
      const path = ctx.run(studio.lastEdit())
      jb.delay(500).then(()=>{
        const _window = jb.studio.previewWindow;
        const el = Array.from(_window.document.querySelectorAll('[jb-ctx]'))
          .filter(e=> jb.path(_window.jb.ctxDictionary[e.getAttribute('jb-ctx')],'path') == path)[0]
        if (el)
          new jb.jbCtx().setVar('$launchingElement',{ el }).run({$: 'inplaceEdit.openToolbar', path })
      })
    }
})

jb.component('inplaceEdit.toolbar', {
  type: 'control',
  params: [
    {id: 'path'}
  ],
  impl: group({
    layout: layout.horizontal('-10'),
    controls: [
      button({
        title: 'edit grid',
        action: inplaceEdit.activate('%$parentGroup%'),
        style: button.mdcIcon(icon({icon: 'grid_on', type: 'mdc'}), '0.6'),
        features: feature.if('%$parentLayout% == layout.grid')
      }),
      button({
        title: 'Change Style',
        action: action.if(
          equals(studio.compName('%$path%'), 'image'),
          studio.openProperties(),
          studio.openPickProfile('%$path%~style')
        ),
        style: button.mdcIcon(icon('style'), '0.6')
      }),
      button({
        title: 'Insert Control',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: inplaceEdit.openToolbarOfLastEdit()
        }),
        style: button.mdcIcon(icon('add'), '0.6')
      }),
      button({
        title: 'Duplicate data item',
        action: ctx => jb.ui.inplaceEdit.duplicateDataItem(ctx),
        style: button.mdcIcon(icon({icon: 'PlusBoxOutline', type: 'mdi'}), '0.6'),
        features: feature.if('%$sourceItem%')
      }),
      button({
        vars: [
          Var(
            'parentLayout',
            ctx => jb.studio.parents(ctx.run('%$path%')).find(path=> jb.studio.compNameOfPath(path) == 'group') + '~layout'
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
        action: studio.delete('%$path%'),
        style: button.mdcIcon(icon('delete'), '0.6')
      })
    ]
  })
})

jb.ui.inPlaceEdit = {
  setPositionScript(el,fullProp,value,ctx) {
      let {side,prop} = jb.ui.splitCssProp(fullProp)
      if (fullProp == 'height' || fullProp == 'width')
        side = prop = fullProp
      const featureComp = {$: `css.${prop}`, [side] : value }
      const originatingCtx = jb.studio.previewjb.ctxOfElem(el)
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

jb.component('feature.inplaceEditDropHtml', {
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

jb.component('inplaceEdit.thumbStyle', {
    type: 'dialog.style',
    impl: customStyle({
      template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
      css: '{ display: block; position: absolute; }',
      features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
    })
})