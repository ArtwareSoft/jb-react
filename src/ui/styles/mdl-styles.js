jb.component('mdl-style.init-dynamic', { /* mdlStyle.initDynamic */
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: (ctx,query) =>
    ({
      afterViewInit: cmp => {
        if (typeof componentHandler === 'undefined') return
        var elems = query ? cmp.base.querySelectorAll(query) : [cmp.base];
        cmp.refreshMdl = _ => jb.delay(1).then(_ => elems.forEach(el=> {
            if (!jb.ui.inDocument(el))
              return;
            componentHandler.downgradeElements(el);
            componentHandler.upgradeElement(el);
          })).catch(e=>jb.logException(e,'mdlStyle.initDynamic',ctx))

        jb.delay(1).then(_ =>
      	 elems.forEach(el=>
           jb.ui.inDocument(el) && componentHandler.upgradeElement(el)))
            .catch(e=>jb.logException(e,'mdlStyle.initDynamic',ctx))
      },
      componentDidUpdate: cmp => {
       var input = cmp.base.querySelector('input');
       input && input.setCustomValidity && input.setCustomValidity(cmp.state.error||'');
       input && input.dispatchEvent(new Event('input'));
      },
      destroy: cmp => {
        if (typeof componentHandler === 'undefined') return
        try {
          typeof $ !== 'undefined' && $.contains(document.documentElement, cmp.base) &&
          (query ? cmp.base.querySelectorAll(query) : [cmp.base]).forEach(el=>
      	 	   jb.ui.inDocument(el) && componentHandler.downgradeElements(el))
        } catch(e) { jb.logException(e,'mdlStyle.initDynamic',ctx) }
       }
    })
})

jb.component('mdl.ripple-effect', { /* mdl.rippleEffect */
  type: 'feature',
  description: 'add ripple effect to buttons',
  impl: ctx => ({
      templateModifier1: (vdom,cmp,state) => {
        vdom.children = jb.asArray(vdom.children)
        vdom.children.push(jb.ui.h('span',{class:'mdl-ripple'}));
        return vdom;
      },
      css: '{ position: relative; overflow:hidden }',
      afterViewInit: cmp => {
          cmp.base.classList.add('mdl-js-ripple-effect');
          (typeof componentHandler !== 'undefined') && jb.ui.inDocument(cmp.base) && componentHandler.upgradeElement(cmp.base);
      },
      destroy: cmp =>
      (typeof componentHandler !== 'undefined') && jb.ui.inDocument(cmp.base) && componentHandler.downgradeElements(cmp.base)
   })
})

// ****** label styles

jb.component('label.mdl-ripple-effect', { /* label.mdlRippleEffect */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class:'mdl-button mdl-js-button mdl-js-ripple-effect'},state.text),
    features: [label.bindText(), mdlStyle.initDynamic()]
  })
})

jb.component('label.mdl-button', { /* label.mdlButton */
  type: 'label.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class:'mdl-button mdl-js-button'},state.text),
    css: '{? {width:%$width%px} ?}',
    features: [label.bindText(), mdlStyle.initDynamic()]
  })
})
