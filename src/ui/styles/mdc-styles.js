jb.ns('mdc,mdc-style')

jb.component('mdcStyle.initDynamic', {
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: ctx => ({
    afterViewInit: cmp => {
      if (!jb.ui.material) return jb.logError('please load mdc library')
      cmp.mdc_comps = cmp.mdc_comps || []
      const txtElm = jb.ui.findIncludeSelf(cmp.base,'.mdc-text-field')[0]
      if (txtElm) {
        cmp.mdc_comps.push(new jb.ui.material.MDCTextField(txtElm))
        cmp.onValueChange = value => (cmp.mdc_comps||[]).forEach(x=> x.label_ && x.label_.float(!!value))
      } else if (cmp.base.classList.contains('mdc-button') || cmp.base.classList.contains('mdc-fab'))
        cmp.mdc_comps.push(new jb.ui.material.MDCRipple(cmp.base))
      else if (cmp.base.classList.contains('mdc-switch'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSwitch(cmp.base))
      else if (cmp.base.classList.contains('mdc-chip-set'))
        cmp.mdc_comps.push(new jb.ui.material.MDCChipSet(cmp.base))
      else if (cmp.base.classList.contains('mdc-tab-bar'))
        cmp.mdc_comps.push(new jb.ui.material.MDCTabBar(cmp.base))
      else if (cmp.base.classList.contains('mdc-slider'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSlider(cmp.base))
      else if (cmp.base.classList.contains('mdc-select'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSelect(cmp.base))
    },
    destroy: cmp => (cmp.mdc_comps || []).forEach(mdc_cmp=>mdc_cmp.destroy())
  })
})

jb.component('mdc.rippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: ctx => ({
      templateModifier: vdom => {
        'mdc-ripple-surface mdc-ripple-radius-bounded mdc-states mdc-states-base-color(red)'.split(' ')
          .forEach(cl=>vdom.addClass(cl))
        return vdom;
      }
   })
})

jb.component('label.mdcRippleEffect', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class: 'mdc-button'},[
      h('div',{class:'mdc-button__ripple'}),
      h('span',{class:'mdc-button__label'},state.text),
    ]),
    css: '>span { text-transform: none; }',
    features: [text.bindText(), mdcStyle.initDynamic()]
  })
})



