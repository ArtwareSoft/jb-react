component('studio.pick', {
  type: 'action',
  impl: openDialog({ content: text(''), style: dialog.studioPickDialog('preview'), id: 'studio.pick' })
})

component('studio.pickAndOpen', {
  type: 'action',
  params: [
    {id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'}
  ],
  impl: openDialog({
    content: text(''),
    style: dialog.studioPickDialog('%$from%'),
    onOK: runActions(writeValue('%$studio/profile_path%', '%$dialogData/path%'), studio.openControlTree()),
    id: 'studio.pick'
  })
})

component('studio.pickTitle', {
  type: 'control',
  impl: text(tgp.shortTitle('%$dialogData/path%'), {
    features: css('display: block; margin-top: -20px; background: white; opacity: 0.7')
  })
})

component('dialogFeature.studioPick', {
  type: 'dialog-feature',
  params: [
    {id: 'from', as: 'string', options: 'preview,studio'}
  ],
  impl: features(
    frontEnd.var('from', '%$from%'),
    frontEnd.var('circuitPlugin', studio.circuitPlugin()),
    frontEnd.var('testHost', ctx => ['tests','studio-helper'].indexOf(ctx.exp('%$studio/project%')) != -1),
    frontEnd.prop('eventToElemPredicate', ({},{from, circuitPlugin, testHost}) => from == 'preview' ?
      (path => testHost || jb.path(jb.comps,[path.split('~')[0],jb.core.CT,'plugin','id']) == circuitPlugin) : (path => jb.studio.isStudioCmp(path.split('~')[0]))),
    frontEnd.prop('cover', ({},{cmp}) => {
      if (!cmp.cover) {
        const cover = cmp.cover = document.querySelector('.jb-cover') || document.createElement('div')
        cover.className = 'jb-cover'
        cover.style.position= 'absolute'; cover.style.width= '100%'; cover.style.height= '100%'; cover.style.background= 'white'; cover.style.opacity= '0'; cover.style.top= 0; cover.style.left= 0;
        document.body.appendChild(cover)
      }
      return cmp.cover
    }),
    frontEnd.onDestroy(({},{cmp})=> {
      cmp.cover.parentElement == document.body.removeChild(cmp.cover)
    }),
    method('hoverOnElem', (ctx,{}) => {
      const el = ctx.data
      Object.assign(ctx.vars.dialogData,{ elem: el, cmpId: el.getAttribute('cmp-id'), path: jb.studio.pathOfElem(el) })
      ctx.run(toggleBooleanValue('%$studio/refreshPick%')) // trigger for refreshing the dialog
    }),
    method('endPick', runActions(writeValue('%$studio/pickSelectionCmpId%', '%$dialogData.cmpId%'), dialog.closeDialog(true))),
    frontEnd.flow(
      source.event('mousemove', () => jb.frame.document, obj(prop('capture', true))),
      rx.debounceTime(50),
      rx.reduce('moveRight', obj(prop('count', 0), prop('dir', '')), {
        value: ({data},{moveRight,prev}) => {
          const dir = prev && prev.clientX < data.clientX ? 'right' : 'left'
          return {dir, count: (moveRight.dir == dir) ? moveRight.count+1 : 1}
        }
      }),
      rx.skip(1),
      rx.map((ctx,{cmp,moveRight}) => jb.studio.eventToElem(ctx.data,moveRight,cmp.eventToElemPredicate)),
      rx.filter('%getAttribute%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('hoverOnElem')
    ),
    frontEnd.flow(
      source.merge(
        source.event('mousedown', () => jb.frame.document, obj(prop('capture', true))),
        rx.pipe(
          source.event('keyup', () => jb.frame.document, obj(prop('capture', true))),
          rx.filter('%keyCode% == 27')
        )
      ),
      rx.takeUntil('%$cmp.destroyed%'),
      sink.BEMethod('endPick')
    )
  )
})

component('dialog.studioPickDialog', {
  hidden: true,
  type: 'dialog.style',
  params: [
    {id: 'from', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{},h) => h('div.jb-dialog jb-pick',{},[
      h('div.edge top'), h('div.edge left'), h('div.edge right'), h('div.edge bottom'), h(cmp.ctx.run(studio.pickTitle()))
    ]),
    css: `{ display: block; position: absolute; width: 0; height:0; z-index: 10000 !important; }
    >.edge { position: absolute; box-shadow: 0 0 1px 1px gray; width: 1px; height: 1px; cursor: pointer; }`,
    features: [
      css(
        pipeline(
          (ctx,{dialogData},{from}) => {
        if (!dialogData.elem) return {}
        const elemRect = dialogData.elem.getBoundingClientRect()
        const zoom = +(document.body.style.zoom) || 1
        const top = (from == 'preview' ? jb.ui.studioFixYPos() : 0) + elemRect.top*zoom
        const left = (from == 'preview' ? jb.ui.studioFixXPos() : 0) + elemRect.left*zoom
        return { top: `top: ${top}px`, left: `left: ${left}px`, width: `width: ${elemRect.width*zoom}px`, 
            height: `height: ${elemRect.height*zoom}px`, widthVal: `${elemRect.width*zoom}px`, heightVal: `${elemRect.height*zoom}px`
          }
        },
          `{ %top%; %left% } ~ .pick-toolbar { margin-top: -20px }
        >.top, >span { %width% } >.left{ %height% } >.right{ left: %widthVal%;  %height% } >.bottom{ top: %heightVal%; %width% }`
        )
      ),
      watchRef('%$studio/refreshPick%', { allowSelfRefresh: true }),
      dialogFeature.studioPick('%$from%'),
      dialogFeature.closeWhenClickingOutside()
    ]
  })
})

extension('studio','pick', {
  eventToElem(e, moveRight, predicate) {
    const mousePos = { x: e.pageX - window.pageXOffset, y: e.pageY  - window.pageYOffset }
    const elems = window.document.elementsFromPoint(mousePos.x, mousePos.y);
    const results = jb.utils.unique(elems.flatMap(el=>jb.ui.parents(el,{includeSelf: true}))
        .filter(el => el && el.getAttribute && el.getAttribute('cmp-id') && predicate(jb.studio.pathOfElem(el))))

    // console.log(results1)
    if (results.length == 0) return [];
  
    let index = moveRight.dir == 'right' ? 1 + Math.floor(moveRight.count / 10) : 0
    if (index >= results.length) index = results.length-1
  
    jb.log('studio pick eventToElem result',{results,index,results,elems})
    return results[index] // { el: results[index].el , index };
  },
  pathOfElem(el) {
    return jb.path(el,'debug.path') || jb.path(jb.ui.cmpCtxOfElem(el),'path') || '' 
  }
})

extension('studio','highlight', {
  getOrCreateHighlightBox(sampleElem) {
    const doc = sampleElem.ownerDocument
    if (!doc.querySelector('#preview-box')) {
      const elem = doc.createElement('div')
      elem.setAttribute('id','preview-box')
      !doc.body.appendChild(elem)
    }
    return doc.querySelector('#preview-box')
  },
  highlightCmp: cmpId => jb.frame.document && jb.studio.highlightElems(Array.from(jb.frame.document.querySelectorAll(`[cmp-id="${cmpId}"]`))),
  highlightByScriptPath(path) {
      const pathStr = Array.isArray(path) ? path.join('~') : path
      const {elem} = jb.studio.closestCtxInPreview(pathStr)
      elem && jb.studio.highlightElems([elem])
  },
  highlightElemsEm: jb.callbag.subject(),
  highlightElems(elems) {
    elems && elems.length && jb.studio.highlightElemsEm.next(elems)

    if (!jb.studio.highlightElemsEm._initialized) {
      jb.studio.highlightElemsEm._initialized = true
      const {pipe,throttleTime,subscribe} = jb.callbag
      pipe(jb.studio.highlightElemsEm,
        throttleTime(300),
        subscribe(elems => jb.studio.doHighlightElems(elems) ))
    }
  },
  doHighlightElems(elems) {
      const html = elems.map(el => {
      const offset = jb.ui.offset(el)
      let width = jb.ui.outerWidth(el)
      if (width == jb.ui.outerWidth(document.body))
          width -= 10;
      return `<div style="opacity: 0.5; position: absolute; background: rgb(193, 224, 228); border: 1px solid blue; z-index: 10000;
          width: ${width}px; left: ${offset.left}px;top: ${offset.top}px; height: ${jb.ui.outerHeight(el)}px"></div>`
    }).join('');

    const box = jb.studio.getOrCreateHighlightBox(elems[0]);
    jb.ui.removeClass(box,'jb-fade-3s-transition');
    box.innerHTML = html;
    jb.delay(1).then(()=> jb.ui.addClass(box,'jb-fade-3s-transition'));
    jb.delay(1000).then(()=>jb.studio.getOrCreateHighlightBox(elems[0]).innerHTML = ''); // clean after the fade animation
  },
  refreshStudioComponent(path) { // editing the studio...
    jb.comps[path[0]] = jb.comps[path[0]]
    const pathStr = Array.isArray(path) ? path.join('~') : path;
    const {elem, cmp } = jb.studio.findElemsByPathCondition(path => pathStr.indexOf(path) == 0)[0] || {}
    const ctx = cmp && cmp.ctx
    if (!ctx) return
    ctx.profile = jb.path(jb.comps,ctx.path.split('~'))
    const dialogCmp = ctx.profile.$ == 'openDialog' ? ctx.run({$: 'dialog.buildComp'}) : ctx.runItself()
    dialogCmp && jb.ui.applyNewVdom(elem, jb.ui.h(dialogCmp), {strongRefresh: true, ctx})
  },
  findElemsByPathCondition: condition => Array.from(document.querySelectorAll('[cmp-id]'))
      .map(elem =>({elem, path: jb.path(elem,'debug.path'), callStack: jb.path(elem,'debug.callStack'), ctxId: jb.path(elem,'debug.ctxId') }))
        .filter(e => [e.path, ...(e.callStack ||[])].filter(x=>x).some(path => condition(path))),
  closestCtxInPreview(_path) {
      const path = _path.split('~fields~')[0]; // field is passive..
      const candidates = jb.studio.findElemsByPathCondition(p => p.indexOf(path) == 0)
      return candidates.sort((e2,e1) => 1000* (e1.path.length - e2.path.length) + e1.ctxId - e2.ctxId )[0] || {}
  }
})

component('studio.highlightByPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: ({},path) => jb.studio.highlightByScriptPath(path)
})
