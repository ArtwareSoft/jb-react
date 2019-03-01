jb.resource('person',{
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
});


jb.resource('people-array', { "people": [
  { "name": "Homer Simpson" ,"age": 42 , "male": true},
  { "name": "Marge Simpson" ,"age": 38 , "male": false},
  { "name": "Bart Simpson"  ,"age": 12 , "male": true}
  ]
})

jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.const('sample-text1','#start hello world #end');

jb.resource('globals', { });

jb.resource('group-with-custom-style',
  {$: 'group',
    title: 'main',
    style : {$: 'customStyle',
    template: `<div class="jb-group">
        <div *ngFor="let ctrl of ctrls" class="group-item"><div *jbComp="ctrl"></div></div>
      </div>`,
      css: `.group-item { margin-bottom: %$spacing%px; display: block }
        .group-item:last-child { margin-bottom:0 }`,
    features :{$: 'group.init-group'}
  },
    controls : [
    {$: 'group', title: '2.0', controls :
       [
      { $: 'label', title: '2.1' },
      { $: 'button', title: '2.2' },
      ]
    },
    {$: 'label', title: '1.0' },
  ]}
)

// fake current path
jb.component('studio-helper.parser1', {
  type: 'data',
  sampleInput: '%$sample-text1%',
  impl :{$: 'extract-text', 
    text: '%%',
    startMarkers: '#start', endMarker: '#end'}
})

jb.component('studio-helper.event-tracker', {
  type: 'control',
  impl :{$: 'group',
    title: '',
    style :{$: 'layout.vertical', spacing: 3 },
    controls: [
      {$: 'editable-text',
        databind: '%$globals/test1%',
        style :{$: 'editable-text.mdl-input' }
      },
      {$: 'label',
        title: '%$globals/test1%',
        style :{$: 'label.span' }
      },
      {$: 'studio.event-tracker' }
    ]
  }
})

jb.component('studio-helper.top-bar', {
  type: 'control',
  impl :{$: 'studio.top-bar' }
})

jb.component('studio-helper.pages', {
  type: 'control',
  impl :{$: 'studio.pages' }
})

jb.component('studio-helper.control-tree', {
  type: 'control',
  params: [{ id: 'path', defaultValue: 'studio-helper-sample.control' }],
  impl :{$: 'studio.control-tree',
    $vars: { simulateProfilePath: '%$path%' }
  }
})

jb.component('studio-helper.pick-profile', {
  type: 'control',
  impl :{$: 'studio.pick-profile', path: 'studio-helper-sample.button~action' }
})

jb.component('studio-helper.jb-editor', {
  type: 'control',
  params: [{ id: 'path', defaultValue: 'studio-helper-sample.component-header' }],
  impl :{$: 'group',
    title: 'main',
    style :{$: 'layout.flex', align: 'flex-start' },
    controls: [
      {$: 'studio.jb-editor',
        path: 'studio-helper-sample.properties-params-prof'
      },
      {$: 'group',
        controls: [
          {$: 'label',
            title: 'aa -%$jbEditor_selection%',
            style :{$: 'label.span' }
          },
          {$: 'editable-text',
            databind :{$: 'studio.profile-as-text', path: '%$jbEditor_selection%' },
            style :{$: 'editable-text.textarea' },
            features: [
              {$: 'css.width', width: '300' },
              {$: 'css.height', height: '200' },
              {$: 'css.margin', left: '10' }
            ]
          }
        ],
        features: [
          {$: 'watch-ref',
            path: '%$jbEditor_selection%',
            ref: '%$jbEditor_selection%'
          }
        ]
      }
    ],
    features: [
      {$: 'css', css: '{ height: 200px; padding: 50px }' },
      {$: 'var',
        name: 'jbEditor_selection',
        value: 'studio-helper-sample.properties-params-prof',
        mutable: true
      },
      {$: 'var',
        name: 'circuit',
        value: 'studio-helper-sample.properties-params-prof'
      }
    ]
  }
})

jb.component('studio-helper.inteli-tree', {
  type: 'control',
  params: [{ id: 'path', defaultValue: 'studio-helper.empty-group' }],
  impl :{$: 'group',
    title: 'main',
    style :{$: 'layout.flex', align: 'flex-start' },
    controls: [
      {$: 'studio.jb-editor-inteli-tree',
        path: '%$path%~impl~controls'
      },
    ],
    features: [
      {$: 'css', css: '{ height: 200px; padding: 50px }' },
      {$: 'var',
        name: 'jbEditor_selection',
        value: '%$path%',
        mutable: true
      },
      {$: 'var',
        name: 'circuit',
        value: '%$path%'
      }
    ]
  }
})

jb.component('studio-helper-dummy.simple-label', {
  type: 'control',
  impl :{$: 'label',
    $vars: { check: 2 },
    title: 'hello',
    style :{$: 'label.h1' },
    features: [
      {$: 'css', css: '{ color: red }' },
      {$: 'css.padding', top: '20', left: '160' }
    ]
  }
})

jb.component('studio-helper-sample.button', {
  type: 'control',
  impl :{$: 'button', title: 'btn1' },
  action :{$: 'dialog.close-all', delay: 200, OK: true }
})

jb.component('studio-helper-sample.control', {
  type: 'control',
  impl :{$: 'group',
    title: 'main',
    controls: [
      {$: 'button', title: '1.0' },
      {$: 'group',
        title: '2.0',
        controls: [
          {$: 'label', title: '2.1' },
          {$: 'button', title: '2.2' }
        ],
        features :{$: 'css.padding', top: '33', left: '41', right: '22' }
      },
    ]
  }
})

jb.component('studio-helper-dummy.label', {
  type: 'control',
  impl :{$: 'label',
    title :{
      $pipeline: [
        '%%',
        '%$people-array/people%',
        '%name% aa aa a a a a a sa fds ds f sd fsd fsd fsd fs sdf faaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        {$: 'object', dd: '%%', mkmk: '' }
      ]
    },
    features: [
      {$: 'css',
        css: '{ position: absolute; margin-left: -20px; margin-top: 2px }'
      },
      {$: 'hidden', showCondition: true }
    ]
  },
})


jb.component('studio-helper.group-with-label', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        remark: 'adsas', 
        controls: [
          {$: 'label', 
            title :{ $pipeline: ['%$people-array/people%', { $filter: '%age% == 42' }, '%name%'] }
          }, 
          {$: 'editable-text' }, 
          {$: 'table', 
            items: '%$people%', 
            fields: [{$: 'field', title: 'name', data: '%name%' }], 
            style :{$: 'table.with-headers' }, 
            visualSizeLimit: 100
          }
        ]
      }
    ]
  }
})

jb.component('studio-helper.empty-group', {
  type: 'control', 
  impl :{$: 'group', 
    controls: []
  }
})

jb.component('studio-helper.data-resources', {
  type: 'control',
  impl :{$: 'group',
    controls: [
      {$: 'studio.data-resources' },
      {$: 'button',
        style :{$: 'button.mdl-flat-ripple' }
      },
      {$: 'button',
        style :{$: 'button.mdl-flat-ripple' }
      }
    ]
  }
})

jb.component('studio-helper.select-control', {
  type: 'control',
  impl :{$: 'studio.select-profile', type: 'control' }
})


jb.component('studio-helper.select-feature', {
  type: 'control',
  impl :{$: 'group',
    title: 'select-feature',
    style :{$: 'layout.horizontal', spacing: '53' },
    controls: [{$: 'studio.select-profile', type: 'feature', path: 'studio-helper-sample.picklist~impl~features~0' }]
  }
})

jb.component('studio-helper.features', {
  type: 'control',
  impl :{$: 'group',
    title: 'features',
    controls: [
      {$: 'studio.property-array',
        path: 'studio-helper-dummy.simple-label~impl~features'
      }
    ]
  }
})

jb.component('studio-helper-sample.control', {
  type: 'control',
  impl :{$: 'group',
    title: 'main',
    controls :[
      {$: 'group',
        title: '2.0',
        controls: [
          {$: 'label', title: '2.1' },
          {$: 'button', title: '2.2' }
        ]
      },
      {$: 'label', title: '1.00' }
    ]
  }
})

jb.component('studio-helper-sample.table', {
  type: 'control',
  impl :{$: 'table',
    items: '%$people%',
    fields: [
      {$: 'field', title: 'name', data: '%name%', width: '400' },
      {$: 'field', title: 'age', data: '%age%' }
    ]
  }
})

jb.component('studio-helper-sample.picklist', {
  type: 'control',
  impl :{$: 'picklist',
    title :{ $pipeline: ['aa'] },
    databind: 'ada',
    options :{$: 'picklist.options', options: '%' },
    style :{$: 'custom-style',
      template: (cmp,state,h) => h('div',{ class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height'},[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model,
            readonly: true,
            tabIndex: -1
        }),
        h('label',{for: 'input_' + state.fieldId},
          h('i',{class: 'mdl-icon-toggle__label material-icons'},'keyboard_arrow_down')
        ),
//        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title),
        h('ul',{for: 'input_' + state.fieldId, class: 'mdl-menu mdl-menu--bottom-left mdl-js-menu',
            onclick: e =>
              cmp.jbModel(e.target.getAttribute('code'))
          },
          state.options.map(option=>h('li',{class: 'mdl-menu__item', code: option.code},option.text))
        )
      ]),
      css: '>label>i {float: right; margin-top: -30px;}',
      features: [
        {$: 'field.databind' },
        {$: 'mdl-style.init-dynamic' }
      ]
    },
    features: [
			{$: 'feature.onKey' },
      {$: 'css.padding' },
      {$: 'css.padding' },
      {$: 'css.width' }
    ]
  }
})


jb.component('studio-helper.studio-properties-rich', {
  type: 'control',
  impl :{$: 'group',
    $vars: { circuit: 'studio-helper-sample.properties-params-prof' },
    controls :{$: 'studio.properties', path: 'studio-helper-sample.properties-params-prof~impl' }
  }
})

jb.component('studio-helper.studio-properties', {
  type: 'control',
  impl :{$: 'group',
    $vars: { circuit: 'studio-helper-sample.properties-tgp' },
    controls :{$: 'studio.properties', path: 'studio-helper-sample.properties-tgp~impl' }
  }
})

jb.component('studio-helper1.studio-properties', {
  type: 'control',
  impl :{$: 'group',
    $vars: { circuit: 'studio-helper-sample.picklist' },
    controls :{$: 'studio.properties', path: 'studio-helper-sample.picklist~impl' }
  }
})

jb.component('studio-helper.script-history', {
  type: 'control',
  impl :{$: 'group',
    controls :[
      {$: 'studio-helper.studio-properties'},
      {$: 'studio.script-history' }
    ]
  }
})

jb.component('studio-helper.editable-text-input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', {
        value: state.model,
        onchange: e => cmp.jbModel(e.target.value),
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
    css: '{height: 16px}'
  }
})

jb.component('studio-helper-sample.properties-params', {
  type: 'control',
  params: [
    { id: 'str', as: 'string' },
    { id: 'strAsComp', as: 'string' },
    { id: 'strAsJs', as: 'string' },
    { id: 'enumStr', as: 'string', options: 'a,b,c' },
    { id: 'enumNum', as: 'number', options: '1,2,3' },
    { id: 'bool', type: 'boolean', as: 'boolean' },
    { id: 'boolAsComp', type: 'boolean', as: 'boolean' },
    { id: 'boolAsJs', type: 'boolean', as: 'boolean' },
    { id: 'style', type: 'button.style', defaultValue:{$: 'button.mdl-icon'} },
    { id: 'action', type: 'action' },
  ],
  impl :{$: 'group' }
})

jb.component('studio-helper-sample.properties-params-prof', {
  type: 'contsdfdswqeqweqwewqe ', 
  impl :{$: 'studio-helper-sample.properties-params', 
    strAsComp :{ $pipeline: [{$: 'split', separator: ',', text: '1,2,3,4,5,6,7,8' }, '%%'], remark: 'asad' }, 
    strAsJs: ctx => ctx.vars.aa, 
    boolAsComp :{ $pipeline: ['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '%%==\"a\"'] }, 
    boolAsJs: ctx => ctx.vars.aa, 
    enumStr: 'c', 
    enumNum: '1', 
    bool :{ $or: [false] }, 
    style :{$: 'button.href' }, 
    features :{$: 'css.class' }
  }, 
  $vars: {  }
})

jb.component('studio-helper-sample.properties-PT-for-tgp', {
  type: 'control',
  params: [
    { id: 'style1', type: 'button.style'},
    { id: 'style2', type: 'button.style'},
  ],
  impl :{$: 'group' }
})

jb.component('studio-helper-sample.properties-tgp', {
  type: 'xx', 
  impl :{$: 'studio-helper-sample.properties-PT-for-tgp', 
    style1 :{$: 'button.x' }, 
    style2 :{$: 'button.x' }, 
    features: [{$: 'css.margin' }]
  }
})

jb.component('studio-helper-sample.custom-style-comp', {
  type: 'control',
  impl :{$: 'label',
    title: 'hello',
    style :{$: 'custom-style',
      template: `
h('div',{ class: 'demo-card-wide mdl-card mdl-shadow--2dp' },
  h('div',{ class: 'mdl-card__title' },
    h('h2',{ class: 'mdl-card__title-text' },
      'Welcome')),
  h('div',{ class: 'mdl-card__supporting-text' },
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sagittis pellentesque lacus eleifend lacinia...'),
  h('div',{ class: 'mdl-card__actions mdl-card--border' },
    h('a',{ class: 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' },
      'Get Started')),
  h('div',{ class: 'mdl-card__menu' },
    h('button',{ class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect' },
      h('i',{ class: 'material-icons' },
        'share'))))`,
      css: '',
      features: [
        {$: 'label.bind-title' },
        {$: 'mdl-style.init-dynamic' }
      ]
    }
  }
})

jb.component('studio-helper.edit-style', {
  type: 'control',
  impl :{$: 'group',
    controls: [
      {$: 'studio.style-editor',
        path: 'studio-helper-sample.custom-style-comp~impl~style'
      }
    ]
  }
})

jb.component('studio-helper-sample.component-header', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    { id: 'title12', as: 'string', dynamic: true },
    {
      id: 'style11',
      type: 'group.style',
      defaultValue :{$: 'layout.vertical' },
      essential: true,
      dynamic: true
    },
    {
      id: 'controls',
      type: 'control[]',
      essential: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    },
    { id: 'features', type: 'feature[]', dynamic: true }
  ],
  impl: ctx => ''
})

jb.component('studio-helper.component-header', {
  type: 'control',
  impl :{$: 'studio.component-header', component: 'studio-helper-sample.component-header' }
})
