/** @jsx jb.ui.h */

jb.component('mdl-style.init-dynamic', {
  type: 'feature',
  params: [
  	{id: 'query', as: 'string'}
  ],
  impl: (ctx,query) => 
    ({
      afterViewInit: cmp => {

        var elems = query ? cmp.base.querySelectorAll(query) : [cmp.base];
        cmp.refreshMdl = _ => {
          jb.delay(1).then(_ => elems.forEach(el=> {
            componentHandler.downgradeElements(el);
            componentHandler.upgradeElement(el);
          }))
        };
        jb.delay(1).then(_ =>
      	 elems.forEach(el=>
      	 	componentHandler.upgradeElement(el)))
      },
      destroy: cmp => 
      	 (query ? cmp.base.querySelectorAll(query) : [cmp.base]).forEach(el=>
      	 	componentHandler.downgradeElements(el))
    })
})

jb.component('mdl.ripple-effect', { 
  type: 'feature',
  description: 'add ripple effect to buttons',
  impl: ctx => ({ 
      templateModifier: (vdom,cmp,state) => {
        vdom.children.push(jb.ui.h('span',{class:'mdl-ripple'}));
        return vdom;
      },
      css: '{ position: relative; overflow:hidden }',
      afterViewInit: cmp => {
          cmp.base.classList.add('mdl-js-ripple-effect');
          componentHandler.upgradeElement(cmp.base);
      },
      destroy: cmp => 
          componentHandler.downgradeElements(cmp.base)
   }),
})


// ****** button styles

jb.component('button.mdl-raised', {
  type: 'button.style',
  impl :{$: 'custom-style', 
      template: (cmp,state) => 
        (<button class="mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect" onclick={_=>cmp.clicked()}>{state.title}</button>),
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-flat-ripple', {
  type: 'button.style',
  impl :{$: 'custom-style', 
      template: (cmp,state) => <button class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick={_=>cmp.clicked()}>{state.title}</button>,
      features :{$: 'mdl-style.init-dynamic'},
      css: '{ text-transform: none }'
  }
})

jb.component('button.mdl-icon', {
  type: 'button.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state) => (<button class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" onclick={_=>cmp.clicked()} title={state.title} tabIndex="-1">
  <i class="material-icons" >{cmp.icon}</i>
</button>),
      css: `{ border-radius: 2px} 
      >i {border-radius: 2px}`,
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-icon-12', {
  type: 'button.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style', 
      template: (cmp,state) => (<button class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" onclick={_=>cmp.clicked()} title={state.title} tabIndex="-1">
  <i class="material-icons" >{cmp.icon}</i>
</button>),
      css: `>.material-icons { font-size:12px;  }`,
      features:{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-allow-html', {
  type: 'button.style',
  description: 'used for search pattern highlight',
  impl :{$: 'custom-style',
      template: (cmp,state) => <button class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick={_=>cmp.clicked()}>{state.title}</button>,
      features:{$: 'mdl-style.init-dynamic'},
  }
})

// ****** label styles

jb.component('label.mdl-ripple-effect', {
    type: 'label.style',
    impl :{$: 'custom-style', 
        template: (cmp,state) => <div class="mdl-button mdl-js-button mdl-js-ripple-effect">{state.title}</div>,
        features :[
          {$: 'label.bind-title' },
          {$: 'mdl-style.init-dynamic'}
        ],
    }
});

jb.component('label.mdl-button', {
    type: 'label.style',
    impl :{$: 'custom-style', 
        template: (cmp,state) => <div class="mdl-button mdl-js-button">{state.title}</div>,
        features :[
          {$: 'label.bind-title' },
          {$: 'mdl-style.init-dynamic'}
        ],
    }
});

// *************** inputs 

jb.component('editable-text.mdl-search', {
  type: 'editable-text.style',
  impl :{$: 'custom-style', 
      template: (cmp,state) => (
  <div class="mdl-textfield mdl-js-textfield">
    <input value={cmp.jbModel()} onchange={cmp.jbModel($event.target.value)} onkeyup={cmp.jbModel($event.target.value,'keyup')} 
      class="mdl-textfield__input" type="text" id="search_{state.fieldId}"/>
    <label class="mdl-textfield__label" for="search_{state.fieldId}">{state.title}</label>
  </div>),
      features: [
          {$: 'field.databind' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-input', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style', 
   template: (cmp,state) => (<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
    <input value={cmp.jbModel()} type="text" onchange={e=>cmp.jbModel(e.target.value)} 
    onkeyup={e=>cmp.jbModel(e.target.value,'keyup')} 
      class="mdl-textfield__input" type="text" id={'input_'+state.fieldId}/>
    <label class="mdl-textfield__label" for={'input_'+state.fieldId}>{state.title}</label>
  </div>),
      css: '{ {?width: %$width%px?} }',
      features :[
          {$: 'field.databind' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-boolean.mdl-slide-toggle', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      template: (cmp,state) => (<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch_{state.fieldId}">
  <input type="checkbox" id="switch_{state.fieldId}" class="mdl-switch__input" value={cmp.jbModel()} 
  onchange="{cmp.jbModel($event.target.checked)}"/>
  <span class="mdl-switch__label">{state.text()}</span>
</label>),
      features :[
          {$: 'field.databind' },
          {$: 'editable-boolean.keyboard-support' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})
