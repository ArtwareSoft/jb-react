jb.ns('label')

jb.component('text', { /* label */
  type: 'control',
  category: 'control:100,common:80',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'my title', dynamic: true},
    {id: 'style', type: 'label.style', defaultValue: label.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('label', {...jb.comps.text,type: 'depricated-control'} )

jb.component('label.bind-text', { /* label.bindText */
  type: 'feature',
  impl: ctx => ({
    watchAndCalcRefProp: { prop: 'text', toState: jb.ui.toVdomOrStr, strongRefresh: true },
    studioFeatures: label.editableContent()
  })
})

jb.component('label.allow-asynch-value', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      const textF = ctx.vars.$model.text 
      const textRef = textF(cmp.ctx);
      const val = jb.ui.toVdomOrStr(textRef)
      if (val && typeof val.then == 'function')
        refreshAsynchText(val)

      cmp.refresh = _ => refreshAsynchText(jb.ui.toVdomOrStr(textF(cmp.ctx)))

      function refreshAsynchText(textPromise) {
        Promise.resolve(textPromise).then(text => cmp.setState({text}))
      }
    }
  })
})

jb.component('label.htmlTag', { /* label.htmlTag */
  type: 'label.style',
  params: [
    {
      id: 'htmlTag',
      as: 'string',
      defaultValue: 'p',
      options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'
    },
    {id: 'cssClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h(cmp.htmlTag,{class: cmp.cssClass},state.text),
    features: label.bindText(),
  })
})

jb.component('label.no-wrapping-tag', { /* label.noWrappingTag() */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => state.text,
    features: label.bindText()
  })
})

jb.component('label.span', { /* label.span */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('span',{},state.text),
    features: label.bindText()
  })
})

jb.component('label.card-title', { /* label.cardTitle */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'mdl-card__title' },
    				h('h2',{ class: 'mdl-card__title-text' },	state.text)),
    features: label.bindText()
  })
})

jb.component('label.card-supporting-text', { /* label.cardSupportingText */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'mdl-card__supporting-text' },	state.text),
    features: label.bindText()
  })
})

jb.component('label.highlight', { /* label.highlight */
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--indigo-A700'}
  ],
  impl: (ctx,base,highlightF,cssClass) => {
    const h = highlightF(), b = base();
    if (!h || !b) return b;
    const highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return jb.ui.h('div',{},[  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)])
  }
})

jb.component('label.editable-content', {
  type: 'feature',
  impl: ({
    afterViewInit: () => {}, // keep the component
    init: cmp => {
      cmp.setScriptData = ev => {
        const resourceRef = cmp.toObserve.filter(e=>e.id == 'text').map(e=>e.ref)[0]
        const scriptRef = cmp.scriptRef()
        const val = ev.target.innerText
        if (resourceRef)
          jb.writeValue(resourceRef,val,cmp.ctx)
        else if (scriptRef)
          jb.studio.studioWindow.jb.writeValue(scriptRef,val,cmp.ctx)
      }
      cmp.onclickHandler = ev => {
        new jb.studio.studioWindow.jb.jbCtx().setVar('$launchingElement',{ el : ev.target})
          .run({$: 'content-editable.open-toolbar', path: cmp.ctx.path})
      }
      cmp.onkeydownHandler = cmp.onkeypressHandler = ev => {
        if (ev.keyCode == 13) {
          cmp.setScriptData(ev)
          if (!cmp._destroyed)
            cmp.strongRefresh()
          return false
        }
      }
      cmp.scriptRef = () => {
        const studioJb = jb.studio.studioWindow.jb
        const ref = studioJb.studio.refOfPath(cmp.ctx.path + '~text')
        const val = studioJb.val(ref)
        return typeof val === 'string' && ref
      }
      cmp.refOfText = () => cmp.toObserve.filter(e=>e.id == 'text').map(e=>e.ref)[0] || cmp.scriptRef()
    },
    templateModifier: (vdom,cmp) => {
      if (!cmp.refOfText()) return vdom
      vdom.attributes = vdom.attributes || {};
      Object.assign(vdom.attributes,{contenteditable: 'true', onblur: 'setScriptData', onclick: true, onkeypress: true, onkeydown: true})
      return vdom;
    }
  })
})
