(function() {
const st = jb.studio
jb.studio.probeResultCustomizers = []

jb.component('studio.jb-editor-path-for-edit', {
  type: 'data',
  description: 'in case of array, use extra element path',
  params: [ { id: 'path', as: 'string' } ],
  impl: (ctx,path) => {
    var ar = jb.studio.valOfPath(path);
    if (Array.isArray(ar))
      return path + '~' + ar.length;
    return path;
  }
})

jb.component('studio.open-jb-editor-menu', {
  type: 'action',
  params: [
    { id: 'path', as: 'string' },
    { id: 'root', as: 'string' },
  ],
  impl :{$: 'menu.open-context-menu',
    menu :{$: 'studio.jb-editor-menu', path: '%$path%', root: '%$root%', $recursive: true } ,
    features :{$: 'dialog-feature.onClose',
      action :{$: 'tree.regain-focus'}
    },
  }
})

jb.component('studio.prob-result-customization', {
  type: 'data',
  params: [
    { id: 'probeResult', mandatory: true },
  ],
  impl: (ctx, probeResult) => {
    probeResult.result.forEach(res=> {
      //res.out = res.out && res.out.probeResultCustomization ? res.out.probeResultCustomization(ctx, res.out) : res.out
      (jb.studio.probeResultCustomizers||[]).forEach(customize => customize(ctx, res))
    })
    return probeResult;
  }
})

jb.component('studio.jb-editor-container', {
  type: 'feature', 
  params: [
    { id: 'id', as: 'string', mandatory: true },
		{ id: 'initialSelection', as: 'string', defaultValue: '%$path%' },
		{ id: 'circuit', as: 'single', description: 'path or ctx of circuit to run the probe' },
  ],
  impl :{$list : [
    {$: 'variable', name: 'jbEditorCntrData', value: {$: 'object', selected: '%$initialSelection%', circuit: '%$circuit%' } , 
        mutable: true },
  ]}
})

jb.component('studio.probe-results', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl: (ctx, path) => jb.delay(300).then(_ => {
    const inCtx = st.closestCtxByPath(path) || new jb.jbCtx()
    return [{in: inCtx.data, out: st.isOfType(path,'action') ? null : inCtx.runItself()}]
  })
})

jb.component('studio.data-browse', {
  type: 'control',
  params: [{ id: 'obj', mandatory: true, defaultValue: '%%' }, { id: 'title', as: 'string' }, { id: 'width', as: 'number', defaultValue: 200 }],
  impl :{$: 'group',
    title: '%$title%',
    controls :{$: 'group',
      controls: [
        {$: 'control.first-succeeding',
          controls: [
            {$: 'control-with-condition',
              condition :{$: 'in-group',
                obj: '%$obj%',
                group :{ $list: ['JbComponent', 'jbCtx'] },
                item :{$: 'class-name', obj: '%$obj%' }
              },
              control :{$: 'label',
                title :{$: 'class-name', obj: '%$obj%' }
              }
            },
            {$: 'control-with-condition',
              condition :{$: 'is-of-type', type: 'string,boolean,number', obj: '%$obj%' },
              control :{$: 'label', title: '%$obj%' }
            },
            {$: 'control-with-condition',
              condition :{$: 'is-of-type', type: 'array', obj: '%$obj%' },
              control :{$: 'table',
                items :{
                  $pipeline: [
                    '%$obj%',
                    {$: 'slice', end: '%$maxItems%' }
                  ]
                },
                fields :{$: 'field.control',
                  title :{ $pipeline: [{$: 'count', items: '%$obj%' }, '%% items'] },
                  control :{$: 'studio.data-browse', a: 'label', obj: '%%', width: 200, $recursive: true }
                },
                style :{$: 'table.mdl',
                  classForTable: 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
                  classForTd: 'mdl-data-table__cell--non-numeric'
                },
                features: [{$: 'watch-ref', ref: '%$maxItems%' }]
              }
            },
            {$: 'control-with-condition',
              condition :{$: 'isNull', obj: '%$obj%' },
              control :{$: 'label', title: 'null' }
            },
            {$: 'tree',
              nodeModel :{$: 'tree.json-read-only', object: '%$obj%', rootPath: '%$title%' },
              style :{$: 'tree.no-head' },
              features: [
                {$: 'css.class', class: 'jb-control-tree' },
                {$: 'tree.selection' },
                {$: 'tree.keyboard-selection' },
                {$: 'css.width', width: '%$width%', minMax: 'max' }
              ]
            }
          ]
        },
        {$: 'control-with-condition',
          style :{$: 'button.href' },
          condition :{
            $and: [
              '%$obj/length% > 100',
              {$: 'is-of-type', type: 'string', obj: '%$obj%' }
            ]
          },
          control :{$: 'button',
            title: 'open (%$obj/length%)',
            action :{$: 'open-dialog',
              style :{$: 'dialog.popup' },
              content :{$: 'editable-text',
                title: '',
                databind: '%$obj%',
                style :{$: 'editable-text.codemirror',
                  enableFullScreen: true,
                  height: '200',
                  mode: 'text',
                  debounceTime: 300,
                  lineNumbers: true,
                  readOnly: true
                }
              }
            },
            style :{$: 'button.href' }
          },
          title: 'long text'
        },
        {$: 'control-with-condition',
          style :{$: 'button.href' },
          condition :{
            $and: [
              '%$obj/length% > 5',
              {$: 'is-of-type', type: 'array', obj: '%$obj%' },
              '%$maxItems% == 5'
            ]
          },
          control :{$: 'button',
            title: 'show (%$obj/length%)',
            action :{$: 'write-value',
              to: '%$maxItems%',
              value: '100'
            },
            style :{$: 'button.href' },
            features: [
              {$: 'watch-ref', ref: '%$maxItems%' },
              {$: 'hidden', showCondition: '%$maxItems% == 5' }
            ]
          },
          title: 'large array'
        }
      ],
      features: [{$: 'variable', name: 'maxItems', value: '5', mutable: 'true' }]
    }
  }
})

jb.component('studio.probe-data-view', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl:{$: 'group', 
          controls: [ {$: 'table',
              items: '%$probeResult%',
              fields: [
                {$: 'field.control',  title: 'last in',  control :{$: 'studio.data-browse', obj: '%in%' }, width: '100' },
                {$: 'field.control',  title: 'out', control :{$: 'studio.data-browse', obj: '%out%' }, width: '100' }
              ],
              style :{$: 'table.mdl', classForTable: 'mdl-data-table', classForTd: 'mdl-data-table__cell--non-numeric' },
              features: [
                {$: 'css', css: '{white-space: normal}' },
              ]
            },
          ],
          features: [
            {$: 'group.wait',
              for :{$: 'studio.probe-results', path: '%$path%'},
              loadingControl :{$: 'label', title1: 'calculating...', title: '...' },
              varName: 'probeResult'
            },
          ]
      },
})

jb.component('studio.open-jb-edit-property', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'action.switch',
    $vars: {
      actualPath :{$: 'studio.jb-editor-path-for-edit', path: '%$path%' },
      paramDef :{$: 'studio.param-def', path: '%$actualPath%' }
    },
    cases: [
      {$: 'action.switch-case',
        condition :{$: 'ends-with',
          type: 'array',
          obj :{$: 'studio.val', path: '%$actualPath%' },
          endsWith: '$vars',
          text: '%$path%'
        }
      },
      {$: 'action.switch-case',
        condition: '%$paramDef/options%',
        action :{$: 'open-dialog',
          style :{$: 'dialog.studio-jb-editor-popup' },
          content :{$: 'group',
            controls: [{$: 'studio.jb-floating-input-rich', path: '%$actualPath%' }],
            features: [
              {$: 'feature.onEsc',
                action :{$: 'dialog.close-containing-popup', OK: true }
              },
              {$: 'feature.onEnter',
                action: [
                  {$: 'dialog.close-containing-popup', OK: true },
                  {$: 'tree.regain-focus' }
                ]
              }
            ]
          },
          features: [
            {$: 'dialog-feature.auto-focus-on-first-input' },
            {$: 'dialog-feature.onClose',
              action :{$: 'tree.regain-focus' }
            }
          ]
        }
      },
      {$: 'action.switch-case',
        condition :{$: 'is-of-type',
          type: 'function',
          obj :{$: 'studio.val', path: '%$actualPath%' }
        },
        action :{$: 'studio.edit-source', path: '%$actualPath%' }
      },
      {$: 'action.switch-case',
        condition :{$: 'studio.is-of-type', path: '%$actualPath%', type: 'data,boolean' },
        action :{$: 'open-dialog',
          style :{$: 'dialog.studio-jb-editor-popup' },
          content :{$: 'studio.jb-floating-input', path: '%$actualPath%' },
          features: [
            {$: 'dialog-feature.auto-focus-on-first-input' },
            {$: 'dialog-feature.onClose',
              action :{
                $runActions: [
                  {$: 'toggle-boolean-value',
                    of: '%$studio/jb_preview_result_counter%'
                  },
                  {$: 'tree.regain-focus' }
                ]
              }
            }
          ]
        }
      },
      {$: 'action.switch-case',
        $vars: {
          ptsOfType :{$: 'studio.PTs-of-type',
            type :{$: 'studio.param-type', path: '%$actualPath%' }
          }
        },
        condition: '%$ptsOfType/length% == 1',
        action :{$: 'studio.set-comp', path: '%$path%', comp: '%$ptsOfType[0]%' }
      }
    ],
    defaultAction :{$: 'studio.open-new-profile-dialog',
      path: '%$actualPath%',
      type :{$: 'studio.param-type', path: '%$actualPath%' },
      mode: 'update',
      onClose :{$: 'tree.regain-focus' }
    }
  }
})

jb.component('studio.jb-editor-inteli-tree', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'group',
    title: 'main',
    style :{$: 'layout.horizontal-fixed-split', align: 'space-between', direction: '', leftWidth: '350', rightWidth: '500', spacing: 3 },
    controls: [
      {$: 'tree',
        nodeModel :{$: 'studio.jb-editor.nodes', path: '%$path%' },
        features: [
          {$: 'css.class', class: 'jb-editor jb-control-tree' },
          {$: 'tree.selection',
            onDoubleClick :{$: 'studio.open-jb-edit-property', path: '%$jbEditorCntrData/selected%' },
            databind: '%$jbEditorCntrData/selected%',
            autoSelectFirst: true,
            onRightClick:{$: 'studio.open-jb-editor-menu', path: '%%', root: '%$path%' },
          },
          {$: 'tree.keyboard-selection',
            onEnter :{$: 'studio.open-jb-edit-property', path: '%$jbEditorCntrData/selected%' },
            onRightClickOfExpanded :{$: 'studio.open-jb-editor-menu', path: '%%', root: '%$path%' },
            autoFocus: true,
            applyMenuShortcuts :{$: 'studio.jb-editor-menu', path: '%%', root: '%$path%', $recursive: true }
          },
          {$: 'tree.drag-and-drop' },
          {$: 'css.width', width: '500', selector: 'jb-editor' },
          {$: 'studio.watch-script-changes' }
        ]
    }],
  }
})

jb.component('studio.jb-editor', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    title: 'main', 
    style :{$: 'layout.horizontal-fixed-split', align: 'space-between', direction: '', leftWidth: '350', rightWidth: '500', spacing: 3 }, 
    controls: [
      {$: 'studio.jb-editor-inteli-tree', path: '%$path%' }, 
      {$: 'group', 
        //$disabled: true, 
        title: 'inteli preview', 
        controls: [
          {$: 'group', 
            title: 'hide if selection empty', 
            controls: [
              {$: 'group', 
                title: 'watch selection content', 
                controls :{$: 'studio.probe-data-view', path: '%$jbEditorCntrData/selected%' }, 
                features :{$: 'watch-ref', 
                  ref :{$: 'studio.ref', path: '%$jbEditorCntrData/selected%' }
                }
              }
            ], 
            features :{$: 'feature.if', showCondition: '%$jbEditorCntrData/selected%' }
          }
        ], 
        features: [
          {$: 'watch-ref', ref: '%$jbEditorCntrData/selected%' }, 
          {$: 'studio.watch-script-changes' }
        ]
      }
    ], 
    features: [
      {$: 'css.padding', top: '10' }, 
      {$: 'css.height', height: '800', minMax: 'max' }
    ]
  }
})

jb.component('studio.open-jb-editor', {
  type: 'action',
  params: [
    { id: 'path', as: 'string' },
    { id: 'fromPath', as: 'string' },
    { id: 'newWindow', type: 'boolean', as: 'boolean' }
  ],
  impl :{$: 'open-dialog',
    $vars: {
      dialogId :{ $if: '%$newWindow%', then: '', else: 'jb-editor' },
      fromPath: '%$fromPath%',
      pickSelection :{$: 'object' }
    },
    style :{$: 'dialog.studio-floating',
      id: '%$dialogId%',
      width: '860',
      height: '400'
    },
    content :{$: 'studio.jb-editor', path: '%$path%' },
    menu :{$: 'button',
      action :{$: 'studio.open-jb-editor-menu',
        path: '%$path%',
        root: '%$path%'
      },
      style :{$: 'button.mdl-icon', icon: 'menu' }
    },
    title :{$: 'studio.path-hyperlink', path: '%$path%', prefix: 'Inteliscript' },
    features: [
      {$: 'studio.jb-editor-container', id: 'jb-editor'},
      {$: 'dialog-feature.resizer' }
    ]
  }
})

jb.component('studio.open-component-in-jb-editor', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }, { id: 'fromPath', as: 'string' }],
  impl :{
    $vars: {
      compPath :{$: 'split', separator: '~', text: '%$path%', part: 'first' },
      fromPath: '%$fromPath%',
      pickSelection :{$: 'object' }
    },
    $runActions: [
      {$: 'open-dialog',
        style :{$: 'dialog.studio-floating',
          id: 'jb-editor',
          width: '860',
          height: '400'
        },
        content :{$: 'studio.jb-editor', path: '%$compPath%' },
        menu :{$: 'button',
          action :{$: 'studio.open-jb-editor-menu',
            path: '%$jbEditorCntrData/selected%',
            root: '%$path%'
          },
          style :{$: 'button.mdl-icon', icon: 'menu' }
        },
        title :{$: 'studio.path-hyperlink',
          path: '%$compPath%',
          prefix: 'Inteliscript'
        },
        features: [
          {$: 'studio.jb-editor-container', id: 'comp-in-jb-editor'},
          {$: 'dialog-feature.resizer' }
        ]
      }
    ]
  }
})

jb.component('studio.expand-and-select-first-child-in-jb-editor', {
  type: 'action',
  impl: ctx => {
    var ctxOfTree = ctx.vars.$tree ? ctx : jb.ctxDictionary[document.querySelector('.jb-editor').getAttribute('jb-ctx')];
    var tree = ctxOfTree.vars.$tree;
    if (!tree) return;
    tree.expanded[tree.selected] = true;
    jb.delay(100).then(()=>{
      var firstChild = tree.nodeModel.children(tree.selected)[0];
      if (firstChild) {
        tree.selectionEmitter.next(firstChild);
        tree.regainFocus && tree.regainFocus();
//        jb_ui.apply(ctx);
//        jb.delay(100);
      }
    })
  }
})

jb.component('menu.studio-wrap-with', {
  type: 'menu.option',
  params: [
    { id: 'path', as: 'string'},
    { id: 'type', as: 'string' },
    { id: 'components', as: 'array' },
  ],
  impl :{$: 'menu.dynamic-options',
    items : {
          $if: {$: 'studio.is-of-type', path: '%$path%', type: '%$type%' },
          then: '%$components%',
          else: {$list: [] }
    },
        genericOption :{$: 'menu.action',
          title: 'Wrap with %%',
          action : [
            {$: 'studio.wrap', path: '%$path%', comp: '%%' },
            {$:'studio.expand-and-select-first-child-in-jb-editor' }
          ]
    },
  }
})

jb.component('menu.studio-wrap-with-array', {
  type: 'menu.option',
  params: [
    { id: 'path', as: 'string'},
  ],
  impl :{ $if: {$: 'studio.can-wrap-with-array', path: '%$path%' },
        then :{$: 'menu.action',
          title: 'Wrap with array',
          action : [
            {$: 'studio.wrap-with-array', path: '%$path%' },
            {$:'studio.expand-and-select-first-child-in-jb-editor' }
          ]
    }, else: []
  }
})

jb.component('studio.add-variable', {
  type: 'action',
  params: [
    { id: 'path', as: 'string'},
  ],
  impl :{$: 'on-next-timer', action:{$: 'open-dialog',
    id: 'add variable',
    style :{$: 'dialog.popup', okLabel: 'OK', cancelLabel: 'Cancel' },
    content :{$: 'group',
      controls: [
        {$: 'editable-text',
          title: 'variable name',
          databind: '%$name%',
          style :{$: 'editable-text.mdl-input' },
          features: [
            {$: 'feature.onEnter',
              action: [
                {$: 'write-value',
                  to :{$: 'studio.ref', path: '%$path%~%$name%' },
                  value: ''
                },
                {$: 'dialog.close-containing-popup', OK: true },
                {$: 'write-value', to: '%$jbEditorCntrData/selected%', value: '%$path%~%$name%' },
                {$: 'tree.redraw', strong: true },
                {$: 'tree.regain-focus' }
              ]
            }
          ]
        }
      ],
      features :{$: 'css.padding', top: '9', left: '20', right: '20' }
    },
    title: 'New variable',
    // onOK :[
    //   {$: 'write-value',
    //     to :{$: 'studio.ref', path: '%$path%~%$name%' },
    //     value: ''
    //   },
    //   {$: 'write-value', to: '%$jbEditorCntrData/selected%', value: '%$path%~%$name%' },
    //   {$:'tree.redraw' },
    //   {$: 'tree.regain-focus' },
    // ],
    modal: 'true',
    features: [
      {$: 'variable', name: 'name', mutable: true },
      {$: 'dialog-feature.near-launcher-position' },
      {$: 'dialog-feature.auto-focus-on-first-input' }
    ]
  }}
})

})()