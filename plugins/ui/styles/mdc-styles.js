extension('mdIcons', {
  $requireLibs: ['/dist/md-icons.js']
})

component('mdcStyle.initDynamic', {
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: features(
    frontEnd.requireExternalLibrary('material-components-web.js','css/font.css','css/material.css'),
    frontEnd.init(async ({},{cmp}) => {
      if (cmp.base.constructor.name == 'VNode') return
      const mdc = jb.frame.mdc
      if (!mdc) return jb.logError('please load mdc library')
      cmp.mdc_comps = cmp.mdc_comps || [];
      const module = { switch: 'switchControl', 'chip-set': 'chips', 'tab-bar': 'tabBar', 'text-field': 'textField' }
      ;['switch','chip-set','tab-bar','slider','select','text-field'].forEach(cmpName => {
        const elm = jb.ui.findIncludeSelf(cmp.base,`.mdc-${cmpName}`)[0]
        if (elm) {
          const name1 = cmpName.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
          const name = name1[0].toUpperCase() + name1.slice(1)
          const m = mdc[cmpName] ? cmpName : module[cmpName]
          cmp.mdc_comps.push({mdc_cmp: new mdc[m][`MDC${name}`](elm), cmpName})
          jb.log(`mdc frontend init ${cmpName}`,{cmp})
        }
      })
      if (cmp.base.classList.contains('mdc-button') || cmp.base.classList.contains('mdc-fab')) {
        cmp.mdc_comps.push({mdc_cmp: new mdc.ripple.MDCRipple(cmp.base), cmpName: 'ripple' })
        jb.log('mdc frontend init ripple',{cmp})
      }
    }),
    frontEnd.onDestroy(({},{cmp}) => (cmp.mdc_comps || []).forEach(({mdc_cmp,cmpName}) => {
      mdc_cmp.destroy()
      jb.log(`mdc frontend destroy ${cmpName}`,{cmp})
    }))
  )
})

component('feature.mdcRippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: () => ({
      templateModifier: vdom => vdom.addClass('mdc-ripple-surface mdc-ripple-radius-bounded mdc-states mdc-states-base-color(red)')
   })
})

component('label.mdcRippleEffect', {
  type: 'text.style',
  impl: customStyle({
    template: ({},{text},h) => h('button.mdc-button',{},[
      h('div.mdc-button__ripple'),
      h('span.mdc-button__label',{}, text),
    ]),
    css: '>span { text-transform: none; }',
    features: [text.bindText(), mdcStyle.initDynamic()]
  })
})
