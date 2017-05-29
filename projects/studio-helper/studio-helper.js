jb.resource('people-array', { "people": [
  { "name": "Homer Simpson" ,"age": 42 , "male": true},
  { "name": "Marge Simpson" ,"age": 38 , "male": false},
  { "name": "Bart Simpson"  ,"age": 12 , "male": true}
  ]
})

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


jb.component('studio-helper.control-tree', {
  type: 'control', 
  params: [
    { id: 'path', defaultValue: 'studio-helper.sample-control' }
  ],
  impl :{$: 'studio.control-tree',
    $vars: {
      simulateProfilePath: '%$path%'
    }
  } 
})

jb.component('studio-helper.jb-editor', {
  type: 'control', 
  params: [{ id: 'path', defaultValue: 'studio-helper-dummy.label' }], 
  impl :{$: 'group', 
    $vars: { circuit: 'studio-helper-dummy.label' }, 
    title: 'main %', 
    style :{$: 'layout.flex', align: 'flex-start' }, 
    controls: [
      {$: 'studio.jb-editor', path: '%$path%' }, 
      {$: 'editable-text', 
        databind :{$: 'studio.profile-as-text', path: '%$studio/jb_editor_selection%' }, 
        style :{$: 'editable-text.textarea' }, 
        features: [
          {$: 'watch-ref', ref: '%$studio/jb_editor_selection%' }, 
          {$: 'css.width', width: '450' }, 
          {$: 'css.height', height: '200' }, 
          {$: 'css.margin', left: '10' }
        ]
      }
    ], 
    features :{$: 'css', css: '{ height: 200px; padding: 50px }' }
  }
})


jb.component('studio-helper.studio-properties', {
  type: 'control', 
  impl :{$: 'group', 
    $vars: { circuit: 'studio-helper-dummy.simple-label' }, 
    title: '', 
    controls :{$: 'studio.properties', path: 'studio-helper-dummy.simple-label~impl' }
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

jb.component('studio-helper.sample-control', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'main', 
    controls: [
      {$: 'group', 
        title: '2.0', 
        controls: [
          {$: 'label', title: '2.1' }, 
          {$: 'button', title: '2.2' }
        ], 
        features :{$: 'css.padding', top: '33', left: '41', right: '22' }
      }, 
      {$: 'label', title: '1.00' }
    ]
  }
})

jb.component('studio-helper.edit-style', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        title: 'aaa', 
        databind: '%$group-with-custom-style/title%', 
        style :{$: 'editable-text.input' }
      }, 
      {$: 'tabs', 
        tabs: [
          {$: 'editable-text', 
            title: 'css', 
            databind: '%$group-with-custom-style/style/css%', 
            style :{$: 'editable-text.codemirror' }, 
            features :{$: 'css', css: '{ width: 700px }' }
          }, 
          {$: 'editable-text', 
            title: 'template', 
            databind: '%$group-with-custom-style/style/template%', 
            style :{$: 'editable-text.codemirror' }, 
            features :{$: 'css', css: '{ width: 700px }' }
          }
        ]
      }
    ]
  }
})


jb.component('studio-helper-dummy.label', {
  type: 'control', 
  impl :{$: 'label', 
    title :{
      $pipeline: ['%$people-array/people%', { $filter: '%age% == 42' }, '%name%aa']
    }, 
    features: [
      {$: 'css', 
        css: '{ position: absolute; margin-left: -20px; margin-top: 2px }'
      }, 
      {$: 'hidden', showCondition: true }
    ]
  }
})


jb.component('studio-helper.group-with-label', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'label', 
        title: {$pipeline: [ '%$people-array/people%', 
                {$filter: '%age% == 42'},
                '%name%'
        ]}
      }, 
    ]
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
    controls: [{$: 'studio.select-profile', type: 'feature' }]
  }
})

jb.component('studio-helper.features', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'features', 
    controls: [
      {$: 'studio.property-array', 
        path: 'studio-helper-dummy.simple-label~features'
      }
    ]
  }
})

jb.component('studio-helper.search', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'search', 
    controls: [
      {$: 'image', 
        url: 'http://image.prntscr.com/image/3b57301a16474f579d18556bb91d08f0.png', 
        units: 'px', 
        style :{$: 'image.default' }
      }, 
      {$: 'group', 
        title: 'search', 
        style :{$: 'layout.horizontal', spacing: '3' }, 
        controls: [
          {$: 'button', 
            title: 'menu icon', 
            style :{$: 'button.mdl-icon', icon: 'search' }, 
            features: [
              {$: 'css.width', width: '60' }, 
              {$: 'css.height', height: '46' }, 
              {$: 'css.opacity', opacity: '0.2' }
            ]
          }, 
          {$: 'itemlist-container.search', 
            title: 'Search', 
            searchIn :{$: 'itemlist-container.search-in-all-properties' }, 
            databind: '%$itemlistCntrData/search_pattern%', 
            style :{$: 'editable-text.mdl-input', width: '270' }, 
            features :{$: 'css.margin', top: '-10' }
          }, 
          {$: 'button', 
            title: 'menu icon', 
            style :{$: 'button.mdl-icon', icon: 'clear' }, 
            features: [
              {$: 'css.width', width: '60' }, 
              {$: 'css.height', height: '46' }, 
              {$: 'css.opacity', opacity: '0.2' }
            ]
          }
        ], 
        features: [
          {$: 'css.box-shadow', 
            blurRadius: '7', 
            spreadRadius: '2', 
            shadowColor: '#cdcdcd', 
            horizontal: '1', 
            vertical: '1'
          }, 
          {$: 'css.width', width: '390' }, 
          {$: 'css.height', height: '46' }
        ]
      }, 
      {$: 'studio.search-list' }, 
      {$: 'studio.search-component' }
    ], 
    features :{$: 'group.itemlist-container' }
  }
})

jb.component('studio-helper.sample-control', {
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

jb.component('studio-helper.sample-control', {
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
      {$: 'label', title: '1.000' }
    ]
  }
})

jb.component('studio-helper.sample-control', {
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
      {$: 'label', title: '1.0' }
    ]
  }
})

jb.component('studio-helper.sample-control', {
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
      {$: 'label', title: '1.000' }
    ]
  }
})

jb.component('studio-helper.sample-control', {
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

jb.component('studio-helper.sample-control', {
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
      {$: 'label', title: '1.0' }
    ]
  }
})

jb.component('studio-helper.sample-control', {
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


jb.component('studio-helper.studio-properties', {
  type: 'control', 
  remark: 1, 
  impl :{$: 'group', 
    $vars: { circuit: 'studio-helper-dummy.simple-label' }, 
    title: '', 
    controls :{$: 'studio.properties', path: 'studio-helper-dummy.simple-label~impl' }
  }
})
