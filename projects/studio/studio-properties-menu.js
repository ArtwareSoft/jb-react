jb.component('studio.open-property-menu', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'menu.open-context-menu',
    menu :{$: 'menu.menu',
		$vars: {
	      compName :{$: 'studio.comp-name', path: '%$path%' }
	    },
      options: [
        {$: 'studio.style-editor-options', path: '%$path%' },
        {$: 'menu.action',
          title: 'multiline edit',
          action :{$: 'studio.open-multiline-edit', path: '%$path%' },
          showCondition :{$: 'equals',
            item1 :{ $pipeline: [{$: 'studio.param-def', path: '%$path%' }, '%as%'] },
            item2: 'string'
          }
        },
        {$: 'menu.action',
          title: 'Goto %$compName%',
          action :{$: 'studio.goto-path', path: '%$compName%' },
          showCondition: '%$compName%'
        },
        {$: 'menu.action',
          title: 'Inteliscript editor',
          action :{$: 'studio.open-jb-editor', path: '%$path%' },
          shortcut: 'Ctrl+I',
          icon: 'code'
        },
        {$: 'menu.action',
          title: 'Javascript editor',
          action :{$: 'studio.edit-source', path: '%$path%' },
          icon: 'code',
          shortcut: 'Ctrl+J'
        },
        {$: 'studio.goto-editor-options', path: '%$path%' },
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
          shortcut: 'Ctrl+X'
        }
      ]
    }
  }
})

jb.component('studio.jb-editor-menu', {
  type: 'menu.option', 
  params: [{ id: 'path', as: 'string' }, { id: 'root', as: 'string' }], 
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
                      {$: 'tree.redraw' }, 
                      {$: 'tree.regain-focus' }
                    ]
                  }
                ]
              }
            ], 
            features :{$: 'css.padding', top: '9', left: '20', right: '20' }
          }, 
          title: 'Add Property', 
          modal: 'true', 
          features: [
            {$: 'variable', name: 'name', mutable: true }, 
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
        action :{$: 'studio.add-variable', path: '%$path%' }, 
        showCondition :{$: 'ends-with', endsWith: '~$vars', text: '%$path%' }
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
                {$: 'tree.redraw' }, 
                {$: 'dialog.close-containing-popup' }, 
                {$: 'write-value', to: '%$jbEditorCntrData/selected%', value: '%%' }, 
                {$: 'studio.open-jb-edit-property', path: '%%' }
              ]
            }
          }
        }
      }, 
      {$: 'menu.action', 
        title: 'Variables', 
        action: [
          {$: 'write-value', 
            to :{$: 'studio.ref', path: '%$path%~$vars' }, 
            value :{$: 'object' }
          }, 
          {$: 'write-value', to: '%$jbEditorCntrData/selected%', value: '%$path%~$vars' }, 
          {$: 'tree.redraw' }, 
          {$: 'studio.add-variable', path: '%$path%~$vars' }
        ], 
        showCondition :{
          $and: [
            {
              $isEmpty :{$: 'studio.val', path: '%$path%~$vars' }
            }, 
            {$: 'is-of-type', 
              type: 'object', 
              obj :{$: 'studio.val', path: '%$path%' }
            }
          ]
        }
      }, 
      {$: 'studio.style-editor-options', path: '%$path%' }, 
      {$: 'menu.end-with-separator', 
        options: [
          {$: 'menu.action', 
            $vars: {
              compName :{$: 'split', separator: '~', text: '%$root%', part: 'first' }
            }, 
            title: 'Goto parent', 
            action :{$: 'studio.open-component-in-jb-editor', path: '%$path%', fromPath: '%$fromPath%' }, 
            showCondition :{$: 'contains', text: '~', allText: '%$root%' }
          }, 
          {$: 'menu.action', 
            $vars: {
              compName :{$: 'studio.comp-name', path: '%$path%' }
            }, 
            title: 'Goto %$compName%', 
            action :{$: 'studio.open-jb-editor', path: '%$compName%', fromPath: '%$path%' }, 
            showCondition: '%$compName%'
          }, 
          {$: 'menu.action', 
            $vars: {
              compName :{$: 'split', separator: '~', text: '%$fromPath%', part: 'first' }
            }, 
            title: 'Back to %$compName%', 
            action :{$: 'studio.open-component-in-jb-editor', path: '%$fromPath%', fromPath: '%$path%' }, 
            showCondition: '%$fromPath%'
          }
        ]
      }, 
      {$: 'studio.goto-editor-options', path: '%$path%' }, 
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
        shortcut: 'Ctrl+D', 
        showCondition :{$: 'studio.is-array-item', path: '%$path%' }
      }, 
      {$: 'menu.separator' }, 
      {$: 'menu.menu', 
        title: 'More', 
        options: [
          {$: 'menu.action', 
            title: 'Pick context', 
            action :{$: 'studio.pick' }
          }, 
          {$: 'studio.goto-references-menu', 
            path :{$: 'split', separator: '~', text: '%$path%', part: 'first' }
          }, 
          {$: 'menu.action', 
            title: 'Remark', 
            action :{$: 'open-dialog', 
              id: 'add property', 
              style :{$: 'dialog.popup' }, 
              content :{$: 'group', 
                controls: [
                  {$: 'editable-text', 
                    title: 'remark', 
                    databind: '%$remark%', 
                    style :{$: 'editable-text.mdl-input' }, 
                    features: [
                      {$: 'feature.onEnter', 
                        action: [
                          {$: 'write-value', 
                            to :{$: 'studio.ref', path: '%$path%~remark' }, 
                            value: '%$remark%'
                          }, 
                          {$: 'dialog.close-containing-popup', OK: true }, 
                          {$: 'tree.redraw' }, 
                          {$: 'tree.regain-focus' }
                        ]
                      }
                    ]
                  }
                ], 
                features :{$: 'css.padding', top: '9', left: '20', right: '20' }
              }, 
              title: 'Remark', 
              modal: 'true', 
              features: [
                {$: 'variable', 
                  name: 'remark', 
                  value :{$: 'studio.val', path: '%$path%~remark' }, 
                  mutable: true
                }, 
                {$: 'dialog-feature.near-launcher-position' }, 
                {$: 'dialog-feature.auto-focus-on-first-input' }
              ]
            }, 
            showCondition :{$: 'is-of-type', 
              type: 'object', 
              obj :{$: 'studio.val', path: '%$path%' }
            }
          }, 
          {$: 'menu.action', 
            title: 'Javascript', 
            action :{$: 'studio.edit-source', path: '%$path%' }, 
            icon: 'code', 
            shortcut: 'Ctrl+J'
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
            shortcut: 'Ctrl+X'
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
        ], 
        optionsFilter: '%%'
      }
    ]
  }
})
