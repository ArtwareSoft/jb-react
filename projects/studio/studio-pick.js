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
    onOK: ctx => ctx.run(runActions(
      writeValue('%$studio/profile_path%', '%$dialogData/path%'),
      studio.openControlTree(),
      studio.openProperties(true)
    ))
  })
})

jb.component('studio.pickToolbar', {
  type: 'control',
  impl: group({
    features: css.class('pick-toolbar'),
    layout: layout.horizontal(),
    controls: [
      button({
        title: studio.compName('%$dialogData/path%'),
        action: '%$$dialog/endPick%',
        style: button.href(),
        features: feature.hoverTitle('%$dialogData/path%')
      }),
      button({
        title: '...',
        style: button.href(),
        action: studio.showStack({ 
          ctx: '%$dialogData/ctx%', 
          onSelect: ctx => ctx.componentContext.vars.$dialog.endPick(ctx.data.ctx) 
        })
      })
    ]
  })
})

jb.component('dialogFeature.studioPick', {
  type: 'dialog-feature',
  params: [
    {id: 'from', as: 'string'}
  ],
  impl: (ctx,from) => ({
    destroy: cmp => {
      const _window = from == 'preview' ? st.previewWindow : window;
      cmp.cover.parentElement == _window.document.body && _window.document.body.removeChild(cmp.cover);
    },
    afterViewInit: cmp=> {
      const {pipe,filter, Do, map,debounceTime, subscribe,distinctUntilChanged,merge} = jb.callbag
      if (from === 'studio') st.initStudioEditing()
      const _window = from == 'preview' ? st.previewWindow : window;
      const projectPrefix = ctx.run(studio.currentPagePath())
      const testHost = ctx.exp('%$queryParams/host%') == 'test'
      const eventToElemPredicate = from == 'preview' ?
        (path => testHost || path.indexOf(projectPrefix) == 0) : (path => st.isStudioCmp(path.split('~')[0]))

      const cover = cmp.cover = _window.document.querySelector('.jb-cover') || _window.document.createElement('div')
      cover.className = 'jb-cover'
      cover.style.position= 'absolute'; cover.style.width= '100%'; cover.style.height= '100%'; cover.style.background= 'white'; cover.style.opacity= '0'; cover.style.top= 0; cover.style.left= 0;
      _window.document.body.appendChild(cover);

      ctx.vars.$dialog.endPick = function(pickedCtx) {
        if (pickedCtx)
          Object.assign(ctx.vars.dialogData,{ ctx: pickedCtx, path: pickedCtx.path })
        ctx.run(writeValue('%$studio/pickSelectionCtxId%',(pickedCtx || ctx.vars.dialogData.ctx || {}).id))
        ctx.vars.$dialog.close({OK: true})
      }
      cmp.counter = 0

      let userPick = jb.ui.fromEvent(cmp, 'mousedown', document)
      let keyUpEm = jb.ui.fromEvent(cmp, 'keyup', document)
      if (jb.studio.previewWindow) {
        userPick = merge(userPick, jb.ui.fromEvent(cmp, 'mousedown', jb.studio.previewWindow.document))
        keyUpEm = merge(keyUpEm, jb.ui.fromEvent(cmp, 'keyup', jb.studio.previewWindow.document))
      }
      pipe(merge(pipe(keyUpEm,filter(e=>e.keyCode == 27)), userPick), subscribe(() => ctx.vars.$dialog.endPick()))

      const mouseMoveEm = jb.ui.fromEvent(cmp,'mousemove',_window.document);
      pipe(mouseMoveEm,
          debounceTime(50),
          map(e=> eventToElem(e,_window,eventToElemPredicate)),
          filter(x=>x && x.getAttribute),
          distinctUntilChanged(),
          Do(profElem=> {
            const elemCtx = _window.jb.ctxDictionary[profElem.getAttribute('pick-ctx') || profElem.getAttribute('jb-ctx')]
            if (!elemCtx) return
            Object.assign(ctx.vars.dialogData,{ elem: profElem, ctx: elemCtx, path: elemCtx.path })
            ctx.run(writeValue('%$studio/refreshPick%',() => cmp.counter++))
          }),
          subscribe(() => {})
      )
    }
  })
})

jb.component('dialog.studioPickDialog', {
  hidden: true,
  type: 'dialog.style',
  params: [
    {id: 'from', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{},h) => h('div#jb-dialog jb-pick',{},[
      h('div#edge top'), h('div#edge left'), h('div#edge right'), h('div#edge bottom'), h(cmp.ctx.run(studio.pickToolbar()))
    ]),
    css: `{ display: block; position: absolute; width: 0; height:0; z-index: 10000 !important; }
    >.edge { position: absolute; box-shadow: 0 0 1px 1px gray; width: 1px; height: 1px; cursor: pointer; }`,    
    features: [
      css(pipeline( (ctx,{dialogData},{from}) => {
        if (!dialogData.elem) return {}
        const elemRect = dialogData.elem.getBoundingClientRect()
        const top = (from == 'preview' ? jb.ui.studioFixYPos() : 0) + elemRect.top
        return { top: `top: ${top}px`, left: `left: ${elemRect.left}px`, width: `width: ${elemRect.width}px`, 
            height: `height: ${elemRect.height}px`, widthVal: elemRect.width + 'px', heightVal: elemRect.height + 'px'
          }
        },
        `{ %top%; %left% } ~ .pick-toolbar { margin-top: -20px }
        >.top{ %width% } >.left{ %height% } >.right{ left: %widthVal%;  %height% } >.bottom{ top: %heightVal%; %width% }`
      )),
      watchRef('%$studio/refreshPick%'),
      dialogFeature.studioPick('%$from%'),
      dialogFeature.closeWhenClickingOutside(),
    ]
  })
})

function eventToElem(e,_window, predicate) {
  const mousePos = { x: e.pageX - _window.pageXOffset, y: e.pageY  - _window.pageYOffset }
  const elems = _window.document.elementsFromPoint(mousePos.x, mousePos.y);
  const results = elems.flatMap(el=>jb.ui.parents(el,{includeSelf: true}))
      .filter(e => e && e.getAttribute)
      .filter(e => checkCtxId(e.getAttribute('pick-ctx')) || checkCtxId(e.getAttribute('jb-ctx')) )
  if (results.length == 0) return [];

  // promote parents if the mouse is near the edge
  const first_result = results.shift(); // shift also removes first item from results!
  const edgeY = Math.max(3,Math.floor(jb.ui.outerHeight(first_result) / 10));
  const edgeX = Math.max(3,Math.floor(jb.ui.outerWidth(first_result) / 10));

  const orderedResults = results.filter(elem=>{
      return Math.abs(mousePos.y - jb.ui.offset(elem).top) < edgeY || Math.abs(mousePos.x - jb.ui.offset(elem).left) < edgeX;
  }).concat([first_result]);
  return orderedResults[0];

  function checkCtxId(ctxId) {
    return ctxId && predicate(_window.jb.ctxDictionary[ctxId].path)
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
      ctx && [st.previewWindow,window].forEach(win=>
        st.highlightElems(Array.from(win.document.querySelectorAll(`[jb-ctx="${ctx.id}"]`))))
  },
  highlightByScriptPath(path) {
      const pathStr = Array.isArray(path) ? path.join('~') : path;
      const result = st.closestCtxInPreview(pathStr)
      st.highlightCtx(result.ctx)
  },
  highlightElems(elems) {
    if (!elems || !elems.length) return
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
  refreshStudioComponent(path) {
    jb.comps[path[0]] = st.previewjb.comps[path[0]]
    const pathStr = Array.isArray(path) ? path.join('~') : path;
    const {elem, ctx} = st.findElemsByCtxCondition(ctx => pathStr.indexOf(ctx.path) == 0)[0] || {}
    if (!ctx) return
    ctx.profile = jb.path(jb.comps,ctx.path.split('~'))
    const cmp = ctx.profile.$ == 'openDialog' ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself()
    cmp && jb.ui.applyVdomDiff(elem, jb.ui.h(cmp), {strongRefresh: true, ctx})
    jb.exec({ $: 'animate.refreshElem', elem: () => elem })
  },
  findElemsByCtxCondition(condition) {
    return [st.previewWindow,window].filter(x=>x).flatMap(win =>
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
      const callerPath = _ctx && _ctx.componentContext && _ctx.componentContext.callerPath;
      return callerPath == path || (_ctx && _ctx.path == path);
    }).map(e=>e.elem)

    st.highlightElems(elems);
  }
})

})()
