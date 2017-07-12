
jb.component('studio.open-jb-editor', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string' },
    { id: 'newWindow', type: 'boolean', as: 'boolean' }
  ], 
  impl :{$: 'open-dialog',
    $vars: { 
      dialogId: {$if : '%$newWindow%', then: '', else: 'jb editor'},
    },
    features :{$: 'var', name: 'jbEditor_selection', mutable: true },
    style :{$: 'dialog.studio-floating', id: '%$dialogId%', width: '750', height: '400' }, 
    content :{$: 'studio.jb-editor', path: '%$path%' }, 
    menu :{$: 'button', 
      action :{$: 'studio.open-jb-editor-menu', path: '%$jbEditor_selection%' }, 
      style :{$: 'button.mdl-icon', icon: 'menu' }
    }, 
    title :{$: 'studio.path-hyperlink', path: '%$path%', prefix: 'Inteliscript' }
  }
})

jb.component('studio.open-component-in-jb-editor', {
  type: 'action', 
  params: [{ id: 'path', as: 'string' }], 
  impl : {
   $vars: {
    compPath: {$: 'split', text: '%$path%', separator: '~', part: 'first'},
   }, 
    $runActions: [
  {$: 'open-dialog',
    features :{$: 'var', name: 'jbEditor_selection', mutable: true },
    style :{$: 'dialog.studio-floating', id: 'jb editor', width: '750', height: '400' }, 
    content :{$: 'studio.jb-editor', path: '%$compPath%' }, 
    menu :{$: 'button', 
      action :{$: 'studio.open-jb-editor-menu', path: '%$jbEditor_selection%' }, 
      style :{$: 'button.mdl-icon', icon: 'menu' }
    }, 
    title :{$: 'studio.path-hyperlink', path: '%$compPath%', prefix: 'Inteliscript' }
  }
  ]}
})

jb.component('studio.jb-editor', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    title: 'main', 
    style :{$: 'layout.horizontal', align: 'space-between', direction: '', spacing: 3 }, 
    controls: [
      {$: 'tree', 
        nodeModel :{$: 'studio.jb-editor.nodes', path: '%$path%' }, 
        features: [
          {$: 'css.class', class: 'jb-editor jb-control-tree' }, 
          {$: 'tree.selection', 
            onDoubleClick :{$: 'studio.open-jb-edit-property', path: '%$jbEditor_selection%' }, 
            databind: '%$jbEditor_selection%', 
            autoSelectFirst: true
          }, 
          {$: 'tree.keyboard-selection', 
            onEnter :{$: 'studio.open-jb-edit-property', path: '%$jbEditor_selection%' }, 
            onRightClickOfExpanded :{$: 'studio.open-jb-editor-menu', path: '%%' }, 
            autoFocus: true, 
            applyMenuShortcuts :{$: 'studio.jb-editor-menu', path: '%%' }
          }, 
          {$: 'tree.drag-and-drop' }, 
          {$: 'css.width', width: '500', selector: 'jb-editor' }, 
          {$: 'studio.watch-script-changes' }
        ]
      }, 
      {$: 'group', 
        title: 'watch selection', 
        controls: [
          {$: 'group', 
            title: 'hide if selection empty', 
            controls: [
              {$: 'group', 
                title: 'watch selection content', 
                controls :{$: 'group', 
                  title: 'wait for probe', 
                  controls :{$: 'group', 
                    controls: [
                      {$: 'label', 
                        title: '{? closest Path: %$probeResult/closestPath% ?}', 
                        features :{$: 'css', css: '{ color: red}' }
                      }, 
                      {$: 'label', 
                        title: 'circuit %$probeResult/circuitType%: %$probeResult/circuit.$%, time: %$probeResult/totalTime% mSec'
                      }, 
                      {$: 'label', 
                        title: 'action circuits are not supported', 
                        features :{$: 'hidden', 
                          showCondition: '%$probeResult/circuitType% == "action"'
                        }
                      }, 
                      {$: 'table', 
                        items :{
                          $pipeline: [
                            '%$probeResult/result%', 
                            {$: 'slice', end: '5' }
                          ]
                        }, 
                        fields: [
                          {$: 'field.control', 
                            title :{
                              $pipeline: [
                                {$: 'count', items: '%$probeResult/result%' }, 
                                'in (%%)'
                              ]
                            }, 
                            control :{$: 'studio.data-browse', obj: '%in/data%' }, 
                            width: '100'
                          }, 
                          {$: 'field.control', 
                            title: 'out', 
                            control :{$: 'studio.data-browse', obj: '%out%' }, 
                            width: '100'
                          }
                        ], 
                        style :{$: 'table.mdl', 
                          classForTable: 'mdl-data-table', 
                          classForTd: 'mdl-data-table__cell--non-numeric'
                        }, 
                        features: [{$: 'css', css: '{white-space: normal}' }]
                      }
                    ]
                  }, 
                  features :{$: 'group.wait', 
                    for :{$: 'studio.probe', path: '%$jbEditor_selection%' }, 
                    loadingControl :{$: 'label', title: 'calculating...' }, 
                    resource: 'probeResult'
                  }
                }, 
                features :{$: 'watch-ref', 
                  ref :{$: 'studio.ref', path: '%$jbEditor_selection%' }
                }
              }
            ], 
            features :{$: 'feature.if', showCondition: '%$jbEditor_selection%' }
          }
        ], 
        features: [
          {$: 'watch-ref', ref: '%$jbEditor_selection%' }, 
          {$: 'studio.watch-script-changes' }
        ]
      }
    ], 
    features :{$: 'css.padding', top: '10' }
  }
})

jb.component('studio.data-browse', {
  type: 'control', 
  params: [
    { id: 'obj', essential: true, defaultValue: '%%' }, 
    { id: 'title', as: 'string' }, 
    { id: 'width', as: 'number', defaultValue: 200 }
  ], 
  impl :{$: 'group', 
    title: '%$title%', 
    controls :{$: 'group', 
      controls: [
        {$: 'control.first-succeeding', 
          controls: [
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
                    {$: 'slice', end: '5' }
                  ]
                }, 
                fields :{$: 'field.control', 
                  title :{ $pipeline: [{$: 'count', items: '%$obj%' }, '%% items'] }, 
                  control :{$: 'studio.data-browse', a: 'label', obj: '%%', width: 200 }
                }, 
                style :{$: 'table.mdl', 
                  classForTable: 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp', 
                  classForTd: 'mdl-data-table__cell--non-numeric'
                }
              }
            }, 
            {$: 'control-with-condition', 
              condition :{$: 'isNull', obj: '%$obj%' }, 
              control :{$: 'label', title: 'null' }
            }, 
            {$: 'tree', 
              nodeModel :{$: 'tree.json-read-only', 
                object: '%$obj%', 
                rootPath: '%$title%'
              }, 
              style :{$: 'tree.no-head' }, 
              features: [
                {$: 'css.class', class: 'jb-control-tree' }, 
                {$: 'tree.selection' }, 
                {$: 'tree.keyboard-selection' }, 
                {$: 'css.width', width: '%$width%', minMax: 'max' }
              ]
            }
          ]
        }
      ]
    }
  }
})

jb.component('studio.open-jb-edit-property', {
  type: 'action', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{
      $vars: {
          actualPath: {$: 'studio.jb-editor-path-for-edit', path: '%$path%'}
      },
      $runActions: [{ // $vars can not be used with $if
        $if :{$: 'studio.is-of-type', type: 'data,boolean', path: '%$actualPath%' },
        then :{$: 'open-dialog',
          style :{$: 'dialog.studio-jb-editor-popup' }, 
          content :{$: 'studio.jb-floating-input', path: '%$actualPath%' }, 
          features: [
            {$: 'dialog-feature.auto-focus-on-first-input' }, 
            {$: 'dialog-feature.onClose', 
              action : {$runActions: [
                {$: 'toggle-boolean-value', of: '%$studio/jb_preview_result_counter%'},
                {$: 'tree.regain-focus' }
              ]}
            }
          ],
        },
        else :{$: 'studio.open-new-profile-dialog', 
          path: '%$actualPath%', 
          mode: 'update',
          type :{$: 'studio.param-type', path: '%$actualPath%'},
          onClose :{$: 'tree.regain-focus' }
        }
      }]
  }
})

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
    { id: 'path', as: 'string' }
  ], 
  impl :{$: 'menu.open-context-menu', 
    menu :{$: 'studio.jb-editor-menu', path: '%$path%' } ,
    features :{$: 'dialog-feature.onClose', 
      action :{$: 'tree.regain-focus'}
    },
  }
})

jb.component('studio.jb-editor-menu', {
  type: 'menu.option', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'menu.menu', 
    style :{$: 'menu.context-menu' }, 
    features :{$: 'group.menu-keyboard-selection', autoFocus: true }, 
    options: [
      {$: 'menu.action', 
        title: 'Add property', 
        action :{$: 'open-dialog', 
          id: 'add property', 
          style :{$: 'dialog.popup', okLabel: 'OK', cancelLabel: 'Cancel' }, 
          content :{$: 'group', 
            controls: [
              {$: 'editable-text', 
                title: 'property name', 
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
                      {$: 'tree.regain-focus' }
                    ]
                  }
                ]
              }
            ], 
            features :{$: 'css.padding', top: '9', left: '20', right: '20' }
          }, 
          title: 'Add Property', 
          onOK :{$: 'write-value', 
            to :{$: 'studio.ref', path: '%$path%~%$name%' }, 
            value: ''
          }, 
          modal: 'true', 
          features: [
            {$: 'var', name: 'name', mutable: true }, 
            {$: 'dialog-feature.near-launcher-position' }, 
            {$: 'dialog-feature.auto-focus-on-first-input' }
          ]
        }, 
        showCondition :{$: 'equals', 
          item1 :{$: 'studio.comp-name', path: '%$path%' }, 
          item2: 'object'
        }
      }, 
      {$: 'menu.action', 
        title: 'Add variable', 
        action :{$: 'open-dialog', 
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
                      {$: 'tree.regain-focus' }
                    ]
                  }
                ]
              }
            ], 
            features :{$: 'css.padding', top: '9', left: '20', right: '20' }
          }, 
          title: 'New variable', 
          onOK :{$: 'write-value', 
            to :{$: 'studio.ref', path: '%$path%~%$name%' }, 
            value: ''
          }, 
          modal: 'true', 
          features: [
            {$: 'var', name: 'name', mutable: true }, 
            {$: 'dialog-feature.near-launcher-position' }, 
            {$: 'dialog-feature.auto-focus-on-first-input' }
          ]
        }, 
        showCondition :{$: 'ends-with', endsWith: '~$vars', text: '%$path%' }
      }, 
      {$: 'menu.action', 
        title: 'Variables', 
        action :{$: 'write-value', 
            to :{$: 'studio.ref', path: '%$path%~$vars' }, 
            value: {$: 'object'}
        }, 
        showCondition : {$and: [ 
          {$isEmpty: {$: 'studio.val', path: '%$path%~$vars' } }, 
          {$: 'is-of-type', obj: {$: 'studio.val', path: '%$path%' }, type: 'object' } ] }
      }, 
      {$: 'menu.end-with-separator', 
        options :{$: 'menu.dynamic-options', 
          endsWithSeparator: true, 
          items :{$: 'studio.more-params', path: '%$path%' }, 
          genericOption :{$: 'menu.action', 
            title :{$: 'suffix', separator: '~' }, 
            action :{$: 'runActions', 
              actions: [
                {$: 'studio.add-property', path: '%%' }, 
                {$: 'dialog.close-containing-popup' }, 
                {$: 'write-value', to: '%$jbEditor_selection%', value: '%%' }, 
                {$: 'studio.open-jb-edit-property', path: '%%' }
              ]
            }
          }
        }
      }, 
      {$: 'menu.action', 
        $vars: {
          compName :{$: 'studio.comp-name', path: '%$path%' }
        }, 
        title: 'Goto %$compName%', 
        action :{$: 'studio.open-jb-editor', path: '%$compName%' }, 
        showCondition: '%$compName%'
      }, 
      {$: 'menu.end-with-separator', 
        options :{$: 'studio.goto-sublime', path: '%$path%' }
      }, 
      {$: 'menu.studio-wrap-with', 
        path: '%$path%', 
        type: 'control', 
        components :{$: 'list', items: ['group'] }
      }, 
      {$: 'menu.studio-wrap-with', 
        path: '%$path%', 
        type: 'data', 
        components :{$: 'list', items: ['pipeline', 'list', 'firstSucceeding'] }
      }, 
      {$: 'menu.studio-wrap-with', 
        path: '%$path%', 
        type: 'boolean', 
        components :{$: 'list', items: ['and', 'or', 'not'] }
      }, 
      {$: 'menu.studio-wrap-with', 
        path: '%$path%', 
        type: 'action', 
        components :{$: 'list', items: ['runActions', 'runActionOnItems'] }
      }, 
      {$: 'menu.studio-wrap-with-array', path: '%$path%' }, 
      {$: 'menu.action', 
        title: 'Duplicate', 
        action :{$: 'studio.duplicate-array-item', path: '%$path%' },
        showCondition: {$: 'studio.is-array-item', path: '%$path%'}
      }, 
      {$: 'menu.separator' }, 
      {$: 'menu.end-with-separator', 
        options :{$: 'studio.goto-references', path: '%$path%' }
      }, 
      {$: 'menu.action', 
        title: 'Javascript', 
        action :{$: 'studio.edit-source', path: '%$path%' }, 
        icon: 'code'
      }, 
      {$: 'menu.action', 
        title: 'Delete', 
        action :{$: 'studio.delete', path: '%$path%' }, 
        icon: 'delete', 
        shortcut: 'Delete'
      }, 
      {$: 'menu.action', 
        title :{
          $if :{$: 'studio.disabled', path: '%$path%' }, 
          then: 'Enable', 
          else: 'Disable'
        }, 
        action :{$: 'studio.toggle-disabled', path: '%$path%' }, 
        icon: 'do_not_disturb', 
        shortcut: 'Ctrl+D'
      }, 
      {$: 'menu.action', 
        title: 'Copy', 
        action :{$: 'studio.copy', path: '%$path%' }, 
        icon: 'copy', 
        shortcut: 'Ctrl+C'
      }, 
      {$: 'menu.action', 
        title: 'Paste', 
        action :{$: 'studio.paste', path: '%$path%' }, 
        icon: 'paste', 
        shortcut: 'Ctrl+V'
      }, 
      {$: 'menu.action', 
        title: 'Undo', 
        action :{$: 'studio.undo' }, 
        icon: 'undo', 
        shortcut: 'Ctrl+Z'
      }, 
      {$: 'menu.action', 
        title: 'Redo', 
        action :{$: 'studio.redo' }, 
        icon: 'redo', 
        shortcut: 'Ctrl+Y'
      }
    ]
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


jb.component('studio.goto-references', {
  type: 'menu.option', 
  params: [
    { id: 'path', as: 'string'},
    { id: 'action', type: 'action', dynamic: 'true', 
      defaultValue :{$: 'studio.open-component-in-jb-editor', path: '%%' } 
    },
  ], 
  impl :{$: 'menu.dynamic-options',
    items :{$: 'studio.references', path: '%$path%' }, 
    genericOption :{$: 'menu.action', 
          title: 'Goto ref %%',
          action :{$call: 'action'}, 
    },
  }
})

jb.component('studio.expand-and-select-first-child-in-jb-editor', {
  type: 'action',
  impl: ctx => {
    var ctxOfTree = ctx.vars.$tree ? ctx : jb.ctxDictionary[$('.jb-editor').attr('jb-ctx')];
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
