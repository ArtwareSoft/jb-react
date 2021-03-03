(function() {
const st = jb.studio;

jb.component('studio.pick', {
  type: 'action',
  impl: openDialog({
    id: 'studio.pick',
    style: dialog.studioPickDialog('preview'),
    content: text(''),
  })
})

jb.component('studio.pickAndOpen', {
  type: 'action',
  params: [
    {id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'}
  ],
  impl: openDialog({
    id: 'studio.pick',
    style: dialog.studioPickDialog('%$from%'),
    content: text(''),
    onOK: runActions(
      writeValue('%$studio/profile_path%', '%$dialogData/path%'),
      studio.openControlTree(),
      //studio.openProperties(true)
    )
  })
})

jb.component('studio.pickTitle', {
   type: 'control',
   impl: text({
        text: studio.shortTitle('%$dialogData/path%'),
        features: css('display: block; margin-top: -20px; background: white')
   })
})

jb.component('dialogFeature.studioPick', {
  type: 'dialog-feature',
  params: [
    {id: 'from', as: 'string', options: 'preview,studio'}
  ],
  impl: features(
    frontEnd.var('from','%$from%'),
    frontEnd.var('projectPrefix', studio.currentPagePath()),
    frontEnd.var('testHost', ctx => ['tests','studio-helper'].indexOf(ctx.exp('%$studio/project%')) != -1),
    frontEnd.prop('_window', ({},{from, el}) => {
      if (from === 'studio') st.initStudioEditing()
      const _window = from == 'preview' ? st.previewWindow : window
      Object.assign(el.vars, { _window })
    }),
    frontEnd.prop('eventToElemPredicate',({},{from, projectPrefix, testHost}) => from == 'preview' ?
      (path => testHost || path.indexOf(projectPrefix) == 0) : (path => st.isStudioCmp(path.split('~')[0]))),
    frontEnd.prop('cover', ({},{cmp,_window}) => {
      if (!cmp.cover) {
        const cover = cmp.cover = _window.document.querySelector('.jb-cover') || _window.document.createElement('div')
        cover.className = 'jb-cover'
        cover.style.position= 'absolute'; cover.style.width= '100%'; cover.style.height= '100%'; cover.style.background= 'white'; cover.style.opacity= '0'; cover.style.top= 0; cover.style.left= 0;
        _window.document.body.appendChild(cover)
      }
      return cmp.cover
    }),
    frontEnd.onDestroy(({},{cmp,from})=> {
      const _window = from == 'preview' ? st.previewWindow : window
      cmp.cover.parentElement == _window.document.body && _window.document.body.removeChild(cmp.cover)
    }),

    method('hoverOnElem', (ctx,{},{from}) => {
      const el = ctx.data
      const _window = from == 'preview' ? st.previewWindow : window
      const elemCtx = _window.jb.ctxDictionary[el.getAttribute('pick-ctx') || el.getAttribute('jb-ctx')]
      if (!elemCtx) return
      Object.assign(ctx.vars.dialogData,{ elem: el, ctx: elemCtx, path: elemCtx.path })
      ctx.run(touch('%$studio/refreshPick%')) // trigger for refreshing the dialog
    }),
    method('endPick', runActions(
      writeValue('%$studio/pickSelectionCtxId%', '%$dialogData.ctx.id%'),
      dialog.closeDialog(true)
    )),
    frontEnd.flow(
      source.event('mousemove','%$_window/document%', obj(prop('capture',true))),
      rx.debounceTime(50),
      rx.reduce({
        varName: 'moveRight',
        value: ({data},{moveRight,prev}) => {
          const dir = prev && prev.clientX < data.clientX ? 'right' : 'left'
          return {dir, count: (moveRight.dir == dir) ? moveRight.count+1 : 1}
        },
        initialValue: obj(prop('count',0),prop('dir',''))
      }),
      rx.skip(1),      
      rx.map( (ctx,{_window,cmp,moveRight}) => eventToElem(ctx.data,_window,moveRight,cmp.eventToElemPredicate)),
      // rx.filter('%el/getAttribute%'),
      // rx.distinctUntilChanged(equals('%el%','%$prev/el%')),
      rx.filter('%getAttribute%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('hoverOnElem')
    ),
    frontEnd.flow(
      rx.merge(
        rx.merge(
          source.event('mousedown', ()=>jb.frame.document, obj(prop('capture',true))),
          source.event('mousedown','%$_window/document%', obj(prop('capture',true))),
        ),
        rx.pipe(
          rx.merge(
            source.event('keyup',()=>jb.frame.document, obj(prop('capture',true))),
            source.event('keyup','%$_window/document%', obj(prop('capture',true))),
          ),
          rx.filter('%keyCode% == 27')
      )),
      rx.takeUntil('%$cmp.destroyed%'),
      sink.BEMethod('endPick')
    )
  )
})

jb.component('dialog.studioPickDialog', {
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
      css(pipeline( (ctx,{dialogData},{from}) => {
        if (!dialogData.elem) return {}
        const _window = from == 'preview' ? st.previewWindow : window;
        const _body = _window.document.body
        const elemRect = dialogData.elem.getBoundingClientRect()
        const zoom = +_body.style.zoom || 1
        const top = (from == 'preview' ? jb.ui.studioFixYPos() : 0) + elemRect.top*zoom
        const left = (from == 'preview' ? jb.ui.studioFixXPos() : 0) + elemRect.left*zoom
        return { top: `top: ${top}px`, left: `left: ${left}px`, width: `width: ${elemRect.width*zoom}px`, 
            height: `height: ${elemRect.height*zoom}px`, widthVal: `${elemRect.width*zoom}px`, heightVal: `${elemRect.height*zoom}px`
          }
        },
        `{ %top%; %left% } ~ .pick-toolbar { margin-top: -20px }
        >.top, >span { %width% } >.left{ %height% } >.right{ left: %widthVal%;  %height% } >.bottom{ top: %heightVal%; %width% }`
      )),
      watchRef({ref: '%$studio/refreshPick%', allowSelfRefresh: true}),
      dialogFeature.studioPick('%$from%'),
      dialogFeature.closeWhenClickingOutside(),
    ]
  })
})

function eventToElem(e,_window, moveRight, predicate) {
  const mousePos = { x: e.pageX - _window.pageXOffset, y: e.pageY  - _window.pageYOffset }
  const elems = _window.document.elementsFromPoint(mousePos.x, mousePos.y);
  const results = jb.utils.unique(elems.flatMap(el=>jb.ui.parents(el,{includeSelf: true}))
      .filter(e => e && e.getAttribute)
      .map( el => ({el, ctxId: checkCtxId(el.getAttribute('pick-ctx')) || checkCtxId(el.getAttribute('jb-ctx')) }))
      .filter(({ctxId}) =>  ctxId), ({ctxId}) => ctxId)
  if (results.length == 0) return [];

  let index = moveRight.dir == 'right' ? 1 + Math.floor(moveRight.count / 10) : 0
  if (index >= results.length) index = results.length-1

  jb.log('studio pick eventToElem result',{results,index,results,elems})
  return results[index].el // { el: results[index].el , index };

  function checkCtxId(ctxId) {
    return ctxId && predicate(_window.jb.ctxDictionary[ctxId].path) && ctxId
  }
}

Object.assign(st, {
  getOrCreateHighlightBox(sampleElem) {
    const doc = sampleElem.ownerDocument
    if (!doc.querySelector('#preview-box')) {
      const elem = doc.createElement('div');
      elem.setAttribute('id','preview-box');
      !doc.body.appendChild(elem);
    }
    return doc.querySelector('#preview-box');
  },
  highlightCtx(ctx) {
      ctx && [st.previewWindow,window].forEach(win=> win &&
        st.highlightElems(Array.from(win.document.querySelectorAll(`[jb-ctx="${ctx.id}"]`))))
  },
  highlightByScriptPath(path) {
      const pathStr = Array.isArray(path) ? path.join('~') : path;
      const result = st.closestCtxInPreview(pathStr)
      st.highlightCtx(result.ctx)
  },
  highlightElemsEm: jb.callbag.subject(),
  highlightElems(elems) {
    elems && elems.length && st.highlightElemsEm.next(elems)

    if (!st.highlightElemsEm._initialized) {
      st.highlightElemsEm._initialized = true
      const {pipe,throttleTime,subscribe} = jb.callbag
      pipe(st.highlightElemsEm,
        throttleTime(300),
        subscribe(elems => st.doHighlightElems(elems) ))
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

    const box = st.getOrCreateHighlightBox(elems[0]);
    jb.ui.removeClass(box,'jb-fade-3s-transition');
    box.innerHTML = html;
    jb.delay(1).then(()=> jb.ui.addClass(box,'jb-fade-3s-transition'));
    jb.delay(1000).then(()=>st.getOrCreateHighlightBox(elems[0]).innerHTML = ''); // clean after the fade animation
  },
  refreshStudioComponent(path) { // editing the studio...
    jb.comps[path[0]] = st.previewjb.comps[path[0]]
    const pathStr = Array.isArray(path) ? path.join('~') : path;
    const {elem, ctx} = st.findElemsByCtxCondition(ctx => pathStr.indexOf(ctx.path) == 0, window)[0] || {}
    if (!ctx) return
    ctx.profile = jb.path(jb.comps,ctx.path.split('~'))
    const cmp = ctx.profile.$ == 'openDialog' ? ctx.run({$: 'dialog.buildComp'}) : ctx.runItself()
    cmp && jb.ui.applyNewVdom(elem, jb.ui.h(cmp), {strongRefresh: true, ctx})
    jb.exec({ $: 'animate.refreshElem', elem: () => elem })
  },
  findElemsByCtxCondition(condition,win) {
    const winToUse = win || st.previewWindow
    return [winToUse].filter(x=>x).flatMap(win =>
      Array.from(win.document.querySelectorAll('[jb-ctx]'))
        .map(elem=>({elem, ctx: win.jb.ctxDictionary[elem.getAttribute('jb-ctx')]}))
        .filter(e => e.ctx && condition(e.ctx))
    )
  },
  closestCtxInPreview(_path) {
      const path = _path.split('~fields~')[0]; // field is passive..
      const candidates = st.findElemsByCtxCondition(ctx => path.indexOf(ctx.path) == 0)
      return candidates.sort((e2,e1) => 1000* (e1.ctx.path.length - e2.ctx.path.length) + (e1.ctx.id - e2.ctx.id) )[0] || {ctx: null, elem: null}
  }
})

jb.component('studio.highlightByPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const elems = st.findElemsByCtxCondition(_ctx => {
      const callerPath = _ctx && _ctx.cmpCtx && _ctx.cmpCtx.callerPath;
      return callerPath == path || (_ctx && _ctx.path == path);
    }).map(e=>e.elem)

    st.highlightElems(elems);
  }
})

})()
