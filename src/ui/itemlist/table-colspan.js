jb.component('table.expandToEndOfRow', {
  type: 'feature',
  description: 'allows expandToEndOfRow in itemlist with table style',
  impl: templateModifier( ({},{$props,vdom}) => ((vdom.querySelector('.jb-items-parent') || vdom).children || []).forEach((tr,i) =>{
        const expandIndex = $props.ctrls[i] ? $props.ctrls[i].findIndex(ctrl=> ctrl.renderProps.expandToEndOfRow) : -1
        if (expandIndex != -1) {
            tr.children = tr.children.slice(0,expandIndex+1)
            tr.children[expandIndex].setAttribute('colspan','10') //($props.ctrls[0] || []).length - expandIndex)
        }
    })),
})

jb.component('feature.expandToEndOfRow', {
    type: 'feature',
    description: 'put on a field to expandToEndOfRow by condition',
    params: [
        {id: 'condition', as: 'boolean', dynamic: true}
    ],
    impl: calcProp('expandToEndOfRow','%$condition()%')
})
  