using('ui-misc')

component('inIframe.dragTitle', {
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'},
    {id: 'useSessionStorage', as: 'boolean', type: 'boolean', byName: 'true'},
    {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
  ],
  impl: features(
    calcProp('sessionStorageId', 'dialogPos-%$id%'),
    calcProp('posFromSessionStorage', If('%$useSessionStorage%', getSessionStorage('%$$props/sessionStorageId%'))),
    css('>%$selector% { cursor: pointer; user-select: none }'),
    frontEnd.method('setPos', ({data},{cmp}) => {
        cmp.iframe.style.top = data.top + 'px'
        cmp.iframe.style.left = data.left +'px' 
    }),
    frontEnd.var('selector', '%$selector%'),
    frontEnd.var('useSessionStorage', '%$useSessionStorage%'),
    frontEnd.var('sessionStorageId', '%$$props/sessionStorageId%'),
    frontEnd.var('posFromSessionStorage', '%$$props/posFromSessionStorage%'),
    frontEnd.init(({},{cmp, posFromSessionStorage, el}) => {
        jb.ui.parents(el)
        cmp.iframe = window.parent.document.getElementById(jb.ui.parents(el).pop().iframeId)
        if (posFromSessionStorage) {
            cmp.iframe.style.top = posFromSessionStorage.top + 'px'
            cmp.iframe.style.left = posFromSessionStorage.left +'px'
        }
    }),
    frontEnd.prop('titleElem', ({},{el,selector}) => el.querySelector(selector)),
    frontEnd.flow(
      source.event('mousedown', '%$cmp/titleElem%'),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.var('offsetFromDialog', ({data},{cmp, el}) => ({
          left: data.clientX - el.getBoundingClientRect().left,
          top:  data.clientY - el.getBoundingClientRect().top
	  })),
      rx.flatMap(rx.pipe(
        source.event('mousemove'),
        rx.takeWhile('%buttons%!=0'),
        rx.var('ev'),
        rx.map(({data},{offsetFromDialog,cmp}) => { 
            const iframeRect = cmp.iframe.getBoundingClientRect()
            return {
                left: Math.max(0, data.clientX - offsetFromDialog.left + iframeRect.left),
                top: Math.max(0, data.clientY - offsetFromDialog.top + iframeRect.top),
  		}})
      )),
      sink.action(runActions(
        action.runFEMethod('setPos'),
        If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%', '%%'))
      ))
    )
  )
})

component('inIframe.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'padding', as: 'number', defaultValue: 0},
  ],
  impl: features(
    templateModifier(({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
    css(`>.jb-resizer { cursor: pointer; position: absolute; right: %$padding%px; bottom: %$padding%px; content:url("${jbHost.baseUrl}/dist/css/resizer.gif") }`),
    frontEnd.var('padding', '%$padding%'),
    frontEnd.method('setSize', ({data},{cmp,padding}) => {
        cmp.iframe.style.height = data.top +'px'
        cmp.iframe.style.width = data.left +'px'
        const autoResizeOffsets = [...document.querySelectorAll('.autoResizeInDialog')].map(innerElemToResize=>({
          elem: innerElemToResize,
          offset: innerElemToResize.getBoundingClientRect().top - cmp.main.getBoundingClientRect().top
            + (cmp.main.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)}))

        autoResizeOffsets.forEach(({elem,offset}) => elem.style.height = (data.top-offset-padding*2) +'px')
	  }),
    frontEnd.init(({},{cmp, padding, el}) => // wait for libs to load
       jb.delay(100).then(() => cmp.iframe.style.height = el.getBoundingClientRect().height+padding*2 +'px')
    ),
    frontEnd.prop('resizerElem', ({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
    frontEnd.flow(
      source.event('mousedown', '%$cmp.resizerElem%'),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.var('offset', ({},{el}) => ({ left: el.getBoundingClientRect().left,	top:  el.getBoundingClientRect().top }) ),
      rx.flatMap(
        rx.pipe(
          source.event('mousemove'),
          rx.takeWhile('%buttons%!=0'),
          rx.map(({data},{offset}) => ({ left: Math.max(0, data.clientX - offset.left),	top: Math.max(0, data.clientY - offset.top) }))
        )
      ),
      sink.FEMethod('setSize')
    )
  )
})

component('inIframe.Floating', {
  type: 'dialog-style<>',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300, byName: true},
    {id: 'height', as: 'number', defaultValue: 100},
    {id: 'padding', as: 'number', defaultValue: 10},
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog', id},[
				h('div',{class: 'dialog-title noselect'},title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'}, h(cmp.menuComp)): '',
				h('button.dialog-close', {onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
			]),
    css: '{ overflow: auto; border-radius: 4px; padding1: 0 12px 12px 12px;background: white;box-shadow: 0px 0px 7px 8px gray; }',
    features: [
      css('>.dialog-title { background: white !important;  padding: 10px 5px;}'),
      css('>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }'),
      css('>.dialog-close {position: absolute;cursor: pointer;right: %$padding%px; top: %$padding%px;font: 21px sans-serif;border: none;color: var(--jb-menu-fg);text-shadow: 0 1px 0 var(--jb-menu-bg); font-weight: 700;opacity: .2; }'),
      css('>.dialog-menu {position: absolute;cursor: pointer;right: 24px; top: 4px;font: 21px sans-serif; border: none;color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); font-weight: 700;opacity: .2; } '),
      css('>.dialog-close:hover { opacity: .5 }'),
      inIframe.dragTitle('%$id%', { useSessionStorage: true }),
      frontEnd.var('width', '%$width%'),
      frontEnd.var('height', '%$height%'),
      frontEnd.var('padding', '%$padding%'),

      frontEnd.init(({},{cmp, width, height, padding, el}) => {
        jb.ui.parents(el).forEach(el=>el.style && (el.style.overflow = 'hidden'))
        cmp.main = jb.ui.parents(el)[0]
        cmp.main.style.padding = padding + 'px'
        cmp.iframe = window.parent.document.getElementById(jb.ui.parents(el).pop().iframeId)
        cmp.iframe.style.height = height +'px'
        cmp.iframe.style.width = width +'px'
      }),      
      dialogFeature.uniqueDialog('%$id%'),
      dialogFeature.maxZIndexOnClick(5000),
      popupLocation(),
      inIframe.resizer('%$padding%')
    ]
  })
})