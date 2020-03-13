(function() {
const st = jb.studio;

function initStudioEditing() {
  if (st.previewjb.comps['dialog.studio-pick-dialog']) return
  jb.entries(jb.comps).filter(e=>st.isStudioCmp(e[0]) || !st.previewjb.comps[e[0]]).forEach(e=>
    st.previewjb.comps[e[0]] = { ...e[1], [jb.location] : [e[1][jb.location][0].replace(/!st!/,''), e[1][jb.location][1]]})
}

jb.component('dialog-feature.studio-pick', { /* dialogFeature.studioPick */
  type: 'dialog-feature',
  params: [
    {id: 'from', as: 'string'}
  ],
  impl: (ctx,from) => ({
    afterViewInit: cmp=> {
      if (from === 'studio')
        initStudioEditing()
      const _window = from == 'preview' ? st.previewWindow : window;
      const previewOffset = from == 'preview' ? document.querySelector('#jb-preview').getBoundingClientRect().top : 0;
      cmp.titleBelow = false;

      const projectPrefix = ctx.exp('%$studio/project%.%$studio/page%')
      const testHost = ctx.exp('%$queryParams/host%') == 'test'
      const eventToElemPredicate = from == 'preview' ? 
        (path => testHost || path.indexOf(projectPrefix) == 0) : (path => st.isStudioCmp(path.split('~')[0]))
      const cover = _window.document.createElement('div')
      cover.className = 'jb-cover'
      cover.style.position= 'absolute'; cover.style.width= '100%'; cover.style.height= '100%'; cover.style.background= 'white'; cover.style.opacity= '0'; cover.style.top= 0; cover.style.left= 0;
      _window.document.body.appendChild(cover);
      const mouseMoveEm = jb.rx.Observable.fromEvent(_window.document, 'mousemove');
      let userPick = jb.rx.Observable.fromEvent(document, 'mousedown');
      let keyUpEm = jb.rx.Observable.fromEvent(document, 'keyup');
      if (st.previewWindow) {
          userPick = userPick.merge(jb.rx.Observable.fromEvent(st.previewWindow.document, 'mousedown'));
          keyUpEm = keyUpEm.merge(jb.rx.Observable.fromEvent(st.previewWindow.document, 'keyup'));
      }
      mouseMoveEm.debounceTime(50)
          .takeUntil(keyUpEm.filter(e=>e.keyCode == 27).merge(userPick))
          .map(e=> eventToElem(e,_window,eventToElemPredicate))
          .filter(x=>x && x.getAttribute)
          .do(profElem=> {
            ctx.exp('%$pickSelection%').elem = profElem
            showBox(cmp,profElem,_window,previewOffset)
          })
          .last() // esc or user pick
          .subscribe(profElem=> {
              const pickSelection = ctx.exp('%$pickSelection%')
              pickSelection.ctx = _window.jb.ctxDictionary[profElem.getAttribute('pick-ctx') || profElem.getAttribute('jb-ctx')];
              pickSelection.elem = profElem;
              // inform watchers
              ctx.run(writeValue('%$studio/pickSelectionCtxId%',(pickSelection.ctx || {}).id))

              ctx.vars.$dialog.close({OK: true});
              _window.document.body.removeChild(cover);
          })
    }
  })
})

jb.component('dialog.studio-pick-dialog', { /* dialog.studioPickDialog */
  hidden: true,
  type: 'dialog.style',
  params: [
    {id: 'from', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{width,height,top,left,titleTop,titleLeft,titleBelow},h) => h('div',{ class: 'jb-dialog' },[
      h('div',{ class: 'edge top', style: { width: width + 'px', top: top + 'px', left: left + 'px' }}) ,
      h('div',{ class: 'edge left', style: { height: height +'px', top: top + 'px', left: left + 'px' }}),
      h('div',{ class: 'edge right', style: { height: height +'px', top: top + 'px', left: (left + width) + 'px' }}) ,
      h('div',{ class: 'edge bottom', style: { width: width + 'px', top: (top + height) +'px', left: left + 'px' }}) ,
      h('div',{ class: 'title' + (titleBelow ? ' bottom' : ''), style: { top: titleTop + 'px', left: titleLeft + 'px'} },
      [
          h(cmp.ctx.run(studio.pickToolbar())),
          h('div',{ class: 'triangle'}),
    ])]),
    css: `
>.edge {
    z-index: 6001;
    position: absolute;
    background: red;
    box-shadow: 0 0 1px 1px gray;
    width: 1px; height: 1px;
    cursor: pointer;
}
>.title {
    z-index: 6001;
    position: absolute;
    font: 14px arial; padding: 0; cursor: pointer;
    transition:top 100ms, left 100ms;
}
>.title .triangle {	width:0;height:0; border-style: solid; 	border-color: #e0e0e0 transparent transparent transparent; border-width: 6px; margin-left: 14px;}
>.title .text {	background: #e0e0e0; font: 14px arial; padding: 3px; }
>.title.bottom .triangle { background: #fff; border-color: transparent transparent #e0e0e0 transparent; transform: translateY(-28px);}
>.title.bottom .text { transform: translateY(6px);}
                `,
    features: [dialogFeature.studioPick('%$from%')]
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

function showBox(cmp,profElem,_window,previewOffset) {
  const profElem_offset = jb.ui.offset(profElem);
  if (profElem_offset == null || jb.ui.offset(document.querySelector('#jb-preview')) == null)
    return;

    cmp.refresh({
        top: previewOffset + profElem_offset.top,
        left: profElem_offset.left,
        width: jb.ui.outerWidth(profElem) == jb.ui.outerWidth(_window.document.body) ? jb.ui.outerWidth(profElem) -10 : cmp.width = jb.ui.outerWidth(profElem),
        height: jb.ui.outerHeight(profElem),
//        pickTitle: st.shortTitle(pathFromElem(_window,profElem)),
        titleTop: previewOffset + profElem_offset.top - 20,
        titleLeft: profElem_offset.left
    })
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
    const cmp = ctx.profile.$ == 'open-dialog' ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself()
    cmp && jb.ui.applyVdomDiff(elem, jb.ui.h(cmp), {strongRefresh: true, ctx})
    jb.exec({ $: 'animate.refresh-elem', elem: () => elem })
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

jb.component('studio.highlight-by-path', { /* studio.highlightByPath */
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

jb.component('studio.pick', { /* studio.pick */
  type: 'action',
  params: [
    {id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'},
    {id: 'onSelect', type: 'action', dynamic: true}
  ],
  impl: openDialog({
    style: dialog.studioPickDialog('%$from%'),
    content: text(''),
    onOK: ctx => ctx.componentContext.params.onSelect(ctx.setData(ctx.exp('%$pickSelection/ctx%')))
  })
})

jb.component('studio.pick-toolbar', { /* studio.pickToolbar */
  type: 'control',
  impl: button({
    title: join({
      separator: '',
      items: list(
        studio.shortTitle('%$path%'),
        '(',
        split({separator: '~', part: 'first'}),
        ')'
      )
    }),
    action: studio.gotoPath('%$path%'),
    style: button.href(),
    features: [
      css('{background: white} :hover {color: black}'),
      variable({
        name: 'path',
        value: ctx =>{
          const elem = ctx.exp('%$pickSelection/elem%')
          if (!elem) return ''
          const _jb = elem.ownerDocument === jb.frame.document ? jb : st.previewjb
          const res = elem ? [elem.getAttribute('pick-ctx'), elem.getAttribute('jb-ctx')]
              .map(id=>_jb.ctxDictionary[id])
              .filter(x=>x)
              .map(ctx=>ctx.path).slice(0,1) : []
          return res
        }
      })
    ]
  })
})

})()
