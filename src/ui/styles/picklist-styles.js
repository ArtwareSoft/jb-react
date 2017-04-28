
jb.component('picklist.native', {
  type: 'picklist.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('select', { value: cmp.jbModel(), onchange: e => cmp.jbModel(e.target.value) },
          state.options.map(option=>h('option',{value: option.code},option.text))
        ),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
::-webkit-input-placeholder { color: #999; }`
  }
})

jb.component('picklist.selection-list', {
  type: 'picklist.style',
  params: [
    { id: 'width', as : 'number' },
  ],
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'picklistModel',
    control :{$: 'itemlist',
      watchItems: false, 
      items: '%$picklistModel/options%',
      style :{ $: 'itemlist.ul-li' },
      controls :{$: 'label', 
        title: '%text%', 
        style :{$: 'label.mdl-ripple-effect' }, 
        features: [
          {$: 'css.width', width: '%$width%' }, 
          {$: 'css', css: '{text-align: left}' }
        ]
      },
      features :{$: 'itemlist.selection', 
        onSelection :{$: 'writeValue', value: '%code%', to: '%$picklistModel/databind%' } 
      }
    }
  }
})

jb.component('picklist.groups', {
  type: 'picklist.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('select', { value: cmp.jbModel(), onchange: e => cmp.jbModel(e.target.value) },
          (state.hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            state.groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(option=>h('option',{value: option.code},option.text))
              ))
      )),
    css: `
 { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
select:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
select::-webkit-input-placeholder { color: #999; }`
  }
})
