(function () {
  const { dataTest, pipeline, pipe, join, list, writeValue, contains, equals, and, not, assign, prop, assignWithIndex, object, obj, $if, count, runActions, delay, addToArray } = jb.macros
  const { uiTest, group, editableBoolean, label, field_initValue, hidden, watchRef, feature_if, id, uiAction_click, uiAction_keyboardEvent,
    editableBoolean_expandCollapse, refreshControlById, itemlist, 
    itemlistContainer_search, itemlistContainer_filter, highlight, itemlist_selection, itemlist_keyboardSelection, group_itemlistContainer, uiAction_setText, css_class} = jb.macros

  jb.resource('globals', {});

  jb.resource('mutable-people', [
    { "name": "Homer Simpson - mutable", age: 42, male: true },
    { "name": "Marge Simpson - mutable", age: 38, male: false },
    { "name": "Bart Simpson - mutable", age: 12, male: true }
  ]);

  jb.const('people', [
    { "name": "Homer Simpson", age: 42, male: true },
    { "name": "Marge Simpson", age: 38, male: false },
    { "name": "Bart Simpson", age: 12, male: true }
  ]);


  jb.resource('person', {
    name: "Homer Simpson",
    male: true,
    isMale: 'yes',
    age: 42
  });

  jb.resource('personWithAddress', {
    "name": "Homer Simpson",
    "address": {
      "city": "Springfield",
      "street": "742 Evergreen Terrace"
    }
  })

  jb.resource('personWithChildren', {
    name: "Homer Simpson",
    children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' }],
    friends: [{ name: 'Barnie' }],
  })

  jb.component('ui-test.label', {
    impl: {
      $: 'ui-test',
      control: { $: 'label', title: 'hello world' },
      expectedResult: { $: 'contains', text: 'hello world' }
    },
  })

  jb.component('ui-test.group', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls: [
          { $: 'label', title: 'hello world' },
          { $: 'label', title: '2' },
        ]
      },
      expectedResult: { $: 'contains', text: ['hello world', '2'] }
    },
  })

  jb.component('ui-test.wait-for', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        features: {
          $: 'group.wait',
          for: ctx => jb.delay(10).then(_ => 'hello'),
        },
        controls: { $: 'label', title: '%%' },
      },
      action: ctx => jb.delay(40),
      expectedResult: { $: 'contains', text: 'hello' }
    },
  })

  // jb.component('ui-test.asynch-label', {
  //    impl :{$: 'ui-test',
  //     control: {$:'label', title: ctx => jb.delay(10).then(_=>'hello') },
  //     action: ctx=> jb.delay(40),
  //     expectedResult :{$: 'contains', text: 'hello' }
  //   },
  // })
  //
  // jb.component('ui-test.asynch-label-with-pipeline1', {
  //    impl :{$: 'ui-test',
  //     control: {$:'label', title: {$pipeline: [ 'hello', ctx => jb.delay(10).then(ctx.data)] } },
  //     action: ctx=> jb.delay(40),
  //     expectedResult :{$: 'contains', text: 'hello' }
  //   },
  // })
  //
  // jb.component('ui-test.asynch-label-with-pipeline2', {
  //    impl :{$: 'ui-test',
  //     control: {$:'label', title: {$pipeline: [ ctx => jb.delay(10).then('hello'), '%%'] } },
  //     action: ctx=> jb.delay(40),
  //     expectedResult :{$: 'contains', text: 'hello' }
  //   },
  // })

  jb.component('ui-test.wait-for-with-var', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        features: {
          $: 'group.wait',
          for: ctx => jb.delay(10).then(_ => 'hello'),
          varName: 'txt'
        },
        controls: [
          { $: 'label', title: '%$txt%' },
        ]
      },
      action: ctx => jb.delay(40),
      expectedResult: { $: 'contains', text: 'hello' }
    },
  })

  jb.component('ui-test.button', {
    impl: {
      $: 'ui-test',
      control: { $: 'button', title: 'btn1', action: ctx => alert(1) },
      expectedResult: { $: 'contains', text: 'btn1' }
    },
  })

  jb.component('ui-test.button.mdl-icon', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button',
        title: 'btn1',
        style: { $: 'button.mdl-icon', icon: 'build' },
        action: ctx => alert(1)
      },
      expectedResult: { $: 'contains', text: 'build' }
    },
  })


  jb.component('ui-test.group2', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            { $: 'button', title: 'button1' },
            { $: 'label', title: 'label1' },
          ]
      },
      expectedResult: { $: 'contains', text: ['button1', 'label1'] }
    },
  })

  jb.component('ui-test.editable-text', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'editable-text',
        style: { $: 'editable-text.input' },
        title: 'name',
        databind: '%$person/name%'
      },
      expectedResult: { $: 'contains', text: ['input', 'Homer Simpson'] },
    },
  })

  jb.component('ui-test.editable-text-mdl', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'editable-text',
        style: { $: 'editable-text.mdl-input' },
        title: 'name',
        databind: '%$person/name%'
      },
      expectedResult: { $: 'contains', text: ['input', 'Homer Simpson'] },
    },
  })

  jb.component('ui-test.editable-text.x-button', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'editable-text',
        title: 'name',
        databind: '%$person/name%',
        features: [{ $: 'editable-text.x-button' }],
      },
      expectedResult: { $: 'contains', text: ['×', 'input', 'Homer Simpson'], inOrder: false },
    },
  })

  jb.component('ui-test.two-way-binding', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'editable-text',
            title: 'name',
            databind: '%$person/name%',
            features: { $: 'id', id: 'inp' }
          },
          { $: 'label', title: '%$person/name%' },
        ]
      },
      action: { $: 'ui-action.set-text', selector: '#inp', value: 'hello' },
      expectedResult: { $: 'contains', text: ['hello', 'hello'] },
    },
  })

  jb.component('ui-test.group-horizontal', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        style: { $: 'layout.horizontal' },
        controls:
          [
            { $: 'button', title: 'button1' },
            { $: 'label', title: 'label1' },
          ]
      },
      expectedResult: { $: 'contains', text: ['button1', 'label1'] }
    },
  })

  jb.component('ui-test.tree', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'tree',
        nodeModel: {
          $: 'tree.json-read-only',
          object: '%$personWithAddress%', rootPath: 'personWithAddress'
        },
        features: [
          { $: 'tree.selection' },
          { $: 'tree.keyboard-selection' },
        ]
      },
      expectedResult: { $: 'contains', text: ['address'] },
    },
  })

  jb.component('ui-test.tree-rightClick', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'tree',
        nodeModel: {
          $: 'tree.json-read-only',
          object: '%$personWithAddress%', rootPath: 'personWithAddress'
        },
        features: [
          {
            $: 'tree.selection',
            onRightClick: {
              $: 'open-dialog', title: 'hello',
              features: { $: 'dialog-feature.near-launcher-position' },
            },
          },
          { $: 'tree.keyboard-selection' },
        ]
      },
      expectedResult: { $: 'contains', text: ['address'] },
    },
  })

  jb.component('ui-test.tree-DD', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'tree',
        nodeModel: {
          $: 'tree.json',
          object: '%$personWithChildren%', rootPath: 'Homer'
        },
        features: [
          { $: 'tree.selection' },
          { $: 'tree.drag-and-drop' },
          { $: 'tree.keyboard-selection' }
        ]
      },
      action: ctx =>
        jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[0]%', 'ref')),
      expectedResult: {
        $: 'equals',
        item1: {
          $pipeline: [
            { $list: ['%$personWithChildren/children%', '%$personWithChildren/friends%'] },
            '%name%',
            { $: 'join' }
          ]
        },
        item2: 'Bart,Maggie,Lisa,Barnie',
      },
    }
  })

  jb.component('ui-test.tree-DD-after-last', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'tree',
        nodeModel: {
          $: 'tree.json',
          object: '%$personWithChildren%', rootPath: 'Homer'
        },
        features: [
          { $: 'tree.selection' },
          { $: 'tree.drag-and-drop' },
          { $: 'tree.keyboard-selection' }
        ]
      },
      action: ctx =>
        jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[1]%', 'ref')),
      expectedResult: {
        $: 'equals',
        item1: {
          $pipeline: [
            { $list: ['%$personWithChildren/children%', '%$personWithChildren/friends%'] },
            '%name%',
            { $: 'join' }
          ]
        },
        item2: 'Bart,Maggie,Barnie,Lisa',
      },
    }
  })

  jb.component('ui-test.open-dialog', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog', title: 'hello', id: 'hello',
          content: { $: 'group', controls: [{ $: 'label', title: 'jbart' }] },
          features: [
            { $: 'dialog-feature.near-launcher-position', offsetTop: ctx => Math.floor(Math.random() * 20 + 2) * 10 },
            { $: 'dialog-feature.resizer' }
          ]
        }
      },
      action: { $: 'ui-action.click', selector: 'button' },
      expectedResult: { $: 'contains', allText: { $: 'test.dialog-content', id: 'hello' }, text: ['hello', 'jbart'] },
    },
  })

  jb.component('ui-test.code-mirror-dialog-resizer', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog', title: 'resizer',
          content: {
            $: 'editable-text', databind: '%$person/name%',
            style: { $: 'editable-text.codemirror', mode: 'javascript' }
          },
          features: [
            { $: 'dialog-feature.near-launcher-position' },
            { $: 'dialog-feature.resizer', resizeInnerCodemirror: true }
          ]
        }
      },
      expectedResult: true,
    },
  })

  jb.component('ui-test.code-mirror-dialog-resizer-ok-cancel', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog', title: 'resizer',
          content: {
            $: 'editable-text', databind: '%$person/name%',
            style: { $: 'editable-text.codemirror', mode: 'javascript' }
          },
          style: { $: 'dialog.dialog-ok-cancel' },
          features: [
            { $: 'dialog-feature.near-launcher-position' },
            { $: 'dialog-feature.resizer', resizeInnerCodemirror: true }
          ]
        }
      },
      expectedResult: true,
    },
  })

  jb.component('ui-test.renderable', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog',
          title: { $: 'label', title: 'hello as label' }, id: 'hello',
          content: { $: 'label', title: 'jbart' },
        }
      },
      action: { $: 'ui-action.click', selector: 'button' },
      expectedResult: { $: 'contains', allText: { $: 'test.dialog-content', id: 'hello' }, text: 'hello as label' },
    },
  })

  var ui_test_dialog_isAttached = false;

  jb.component('ui-test.dialog-cleanup', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog', title: 'hello', id: 'hello',
          content: { $: 'label', title: 'world' },
          features: ctx => ({
            destroy: cmp =>
              ui_test_dialog_isAttached = cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode
          })
        }
      },
      action: [
        { $: 'ui-action.click', selector: 'button' },
        { $: 'dialog.close-all' }
      ],
      expectedResult: ctx =>
        !ui_test_dialog_isAttached
    },
  })

  jb.component('ui-test.dialog-cleanup-bug', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button', title: 'click me',
        action: {
          $: 'open-dialog', title: 'hello', id: 'hello',
          content: { $: 'label', title: 'world' },
        }
      },
      action: [
        { $: 'ui-action.click', selector: 'button' },
        { $: 'dialog.close-all' }
      ],
      expectedResult: ctx =>
        !jb.resources['jb_dialog_hello']
    },
  })

  jb.component('ui-test.group-flex', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        style: { $: 'layout.flex', direction: 'row' },
        controls:
          [
            { $: 'button', title: 'button1' },
            { $: 'label', title: 'label1' },
          ]
      },
      expectedResult: { $: 'contains', text: ['button1', 'label1'] }
    },
  })

  jb.component('ui-test.button-click', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button',
        //style :{$: 'button.x'},
        title: 'Click Me',
        action: () => alert(1)
      },
      expectedResult: true
    },
  })

  jb.component('ui-test.button-x', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button',
        style: { $: 'button.x' },
        title: 'Click Me',
        action: () => alert(1)
      },
      expectedResult: true
    },
  })

  jb.component('ui-test.resource', {
    impl: {
      $: 'ui-test',
      control: { $: 'button', title: '%$person.name%' },
      expectedResult: { $: 'contains', text: ['Homer'] },
    },
  })

  jb.component('ui-test.features-css', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label',
        title: 'Hello World2',
        features: { $css: '{color: cyan; font-weight: bold}' },
      },
      expectedResult: { $: 'contains', text: ['Hello'] }
    },
  })

  jb.component('ui-test.itemlist', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'itemlist', items: '%$people%',
        controls: { $: 'label', title: '%$item.name% - %name%' },
      },
      expectedResult: { $: 'contains', text: ['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'] },
    },
  })

  jb.component('ui-test.itemlist-with-select', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'itemlist', items: '%$people%',
        controls: { $: 'label', title: '%$item.name% - %name%' },
        features: { $: 'itemlist.selection' },
      },
      expectedResult: { $: 'contains', text: ['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'] },
    },
  })

  jb.component('ui-test.itemlist-DD', {
    impl: {
      $: 'ui-test', control: {
        $: 'group',
        controls: [
          {
            $: 'itemlist', items: '%$mutable-people%',
            controls: { $: 'label', title: '%name%', features: { $: 'css.class', class: 'drag-handle' } },
            features: [
              { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
              { $: 'itemlist.keyboard-selection', autoFocus: true },
              { $: 'itemlist.drag-and-drop' },
              { $: 'id', id: 'itemlist' },
            ],
          },
          {
            $: 'itemlist', items: '%$mutable-people%', watchItems: true,
            controls: { $: 'label', title: '%name%' }
          },
        ],
      },
      action: [ctx => jb.delay(10), { $: 'ui-action.keyboard-event', selector: '#itemlist', type: 'keydown', ctrl: 'ctrl', keyCode: 40 }], // ctrl keyDown
      expectedResult: { $: 'contains', text: ['Bart', 'Marge', 'Homer'] },
    },
  })

  jb.component('ui-test.itemlist-basic', {
    impl: {
      $: 'ui-test', control:
      {
        $: 'itemlist', items: '%$people%',
        controls: { $: 'label', title: '%name%' }
      },
      expectedResult: { $: 'contains', text: ['Homer Simpson', 'Bart Simpson'] },
    },
  })

  // jb.component('ui-test.itemlist-heading', {
  //   impl :{$: 'ui-test', control :{$: 'group', controls:
  //   [
  //     { $: 'itemlist-with-groups', items: '%$people%',
  //         controls :{$: 'label', title: '%name%' },
  //         groupBy :{$: 'itemlist-heading.group-by',
  //           itemToGroupID :{$if: '%male%', then: 'male', else: 'female'}
  //         },
  // //        headingCtrl :{$: 'label', title: '%title%' },
  //         features: [
  //             { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
  //             { $: 'itemlist.keyboard-selection', autoFocus: true },
  //             {$: 'css', css: '.jb-item:not(.heading) { margin-left: 30px }' }
  //         ],
  //     },
  //   ]},
  //   expectedResult: { $: 'contains', text: ['female', 'Marge', 'male', 'Homer Simpson', 'Bart Simpson'] },
  // }
  // })


  jb.component('ui-test.itemlist-add-button', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            {
              $: 'itemlist',
              items: '%$people%',
              controls: { $: 'label', title: '%$item.name% - %name%' },
            },
            {
              $: 'button', title: 'add',
              action: (ctx) => ctx.exp('%$people%').push({ name: "Magi" })
            }
          ]
      },
      expectedResult: { $: 'contains', text: ['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'] },
    },
  })

  jb.component('ui-test.itemlist-selection', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'itemlist', items: '%$people%',
        controls: { $: 'label', title: '%$item.name%' },
        features: [
          { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
        ],
      },
      expectedResult: { $: 'contains', text: ['Homer Simpson'] },
    },
  })

  jb.component('ui-test.itemlist-MD', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls:
          [
            {
              $: 'itemlist', items: '%$people%',
              controls: { $: 'label', title: '%$item.name%' },
              features: [
                { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
                { $: 'itemlist.keyboard-selection', autoFocus: true },
              ],
            },
            {
              $: 'label', title: '%$globals/selectedPerson/name% selected',
              features: { $: 'watch-ref', ref: '%$globals/selectedPerson%' }
            }
          ]
      },
      action: ctx => jb.delay(50),
      expectedResult: { $: 'contains', text: ['Homer Simpson', 'Homer Simpson selected'] },
    },
  })

  jb.component('ui-test.itemlist-container-search-ctrl', {
    type: 'control',
    impl: group({
      controls: [
        itemlistContainer_search(),
        itemlist({
          items: pipeline('%$people%',itemlistContainer_filter()),
          controls: label({
            title: highlight('%name%', '%$itemlistCntrData/search_pattern%' ),
            features: [
              css_class('label1'),
              watchRef({ref: '%$itemlistCntrData/search_pattern%', delay: 20})
            ]
          }),
          features: [
            itemlist_selection({autoSelectFirst: true}),
            itemlist_keyboardSelection({autoFocus: true, onEnter: writeValue('%$person/selected%','%name%')}),
            watchRef({ref: '%$itemlistCntrData/search_pattern%', delay: 20})
          ]})
      ],
      features:  group_itemlistContainer(),
    }),
  })

  jb.component('ui-test.itemlist-container-search', {
    impl: uiTest({
      control: {$: 'ui-test.itemlist-container-search-ctrl'},
      action: uiAction_setText('ho','.mdl-textfield'),
      expectedResult: and(contains(['Ho', 'mer']), not(contains('Marge')), not(contains('Homer')))
    })
  })

  jb.component('ui-test.itemlist-container-search-enter-on-li', {
    impl: uiTest({
      control: {$: 'ui-test.itemlist-container-search-ctrl'},
      action: runActions(uiAction_keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13})), // Enter
      expectedResult: equals('%$person/selected%','Homer Simpson')
    })
  })

  jb.component('ui-test.secondaryLink-set-bug', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'itemlist', items: '%$people%',
        controls: { $: 'label', title: '%name%' },
        features: { $: 'itemlist.selection', autoSelectFirst: true, databind: '%$globals/selected%' }
      },
      action: {
        $runActions: [
          { $: 'write-value', value: '%$people[1]%', to: '%$globals/selected%' },
          { $: 'write-value', value: '5', to: '%$globals/data1%' },
        ]
      },
      expectedResult: ctx => true,
    }
  })

  jb.component('ui-test.search-doesnot-create-ReactClass', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          { $: 'itemlist-container.search' },
          {
            $: 'itemlist',
            items: {
              $pipeline: [
                '%$people%',
                { $: 'itemlist-container.filter' },
              ]
            },
            controls: {
              $: 'label', title1: '%name%',
              title: {
                $: 'highlight',
                base: '%name%',
                highlight: '%$itemlistCntrData/search_pattern%',
              },
            },
            features: [
              { $: 'itemlist.selection', autoSelectFirst: true },
              { $: 'itemlist.keyboard-selection', autoFocus: true },
              { $: 'watch-ref', ref: '%$itemlistCntrData/search_pattern%', }
            ],
          },
        ],
        features: [
          { $: 'group.itemlist-container' },
        ]
      },
      action: { $: 'ui-action.set-text', value: 'ho', selector: '.mdl-textfield' },
      expectedResult: ctx => true,
      expectedCounters: ctx => ({ createReactClass: 6 })
    }
  })

  jb.component('ui-test.table', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'table', items: '%$people%',
        fields: [
          { $: 'field', data: '%name%', title: 'name' },
          { $: 'field', data: '%age%', title: 'age' },
        ],
        features: [
          { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
        ],
      },
      expectedResult: { $: 'contains', text: ['age', 'Homer Simpson', '12'] },
    },
  })

  jb.component('ui-test.table-DD', {
    impl: {
      $: 'ui-test', control: {
        $: 'group',
        controls: [
          {
            $: 'table', items: '%$mutable-people%', watchItems: true,
            fields: [
              { $: 'field', data: '%name%', title: 'name', class: 'drag-handle', width: 300 },
              { $: 'field', data: '%age%', title: 'age', width: 50 },
              {
                $: 'field.control', control: {
                  $: 'button',
                  title: 'delete',
                  style: { $: 'button.x' },
                  action: { $: 'remove-from-array', array: '%$people%', item: '%%' }
                }
              },
            ],
            features: [
              { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
              { $: 'itemlist.keyboard-selection', autoFocus: true },
              { $: 'itemlist.drag-and-drop' },
              //              { $: 'id', id: 'itemlist' },
            ],
          },
          {
            $: 'label',
            title: { $pipeline: ['%$people/name%', { $: 'join', separated: ', ' }] },
            features: { $: 'watch-ref', ref: '%$people%' }
          },
        ]
      },
      expectedResult: { $: 'contains', text: ['age', 'Homer Simpson', '12'] },
    },
  })

  jb.component('ui-test.table.button-field', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'table', items: '%$people%',
        fields: [
          { $: 'field', data: '%name%', title: 'name' },
          { $: 'field.button', buttonText: '%age%', title: 'age', action: ctx => alert(ctx.data) },
        ],
      },
      expectedResult: { $: 'contains', text: ['age', 'Homer Simpson', '12'] },
    },
  })

  // jb.component('ui-test.ngShow-label', {
  // //   impl :{$: 'ui-test',
  //   control :{$: 'label',
  //         title: 'Dan',
  //         features :{$ngAtts: {'[hidden]': '12==12'} }
  //    },
  //     expectedResult: { $contains: ['hidden' , 'Dan'] }
  // },
  // })

  // jb.component('ui-test.ngShow-list', {
  // //   impl :{$: 'ui-test',
  //   control :{$: 'itemlist',
  //       items: '%$people%',
  //       controls :{$: 'label',
  //         title: '%$item.name% - %age%',
  //         features :{ $ngAtts: {'[hidden]': '%age%==12'} }
  //       },
  //     },
  //     expectedResult: { $contains: ['Homer','Marge', 'hidden' , 'Bart'] }
  // },
  // })

  // jb.component('ui-test.ngIf', {
  // type: 'test',
  //   impl :{$: 'ui-test',
  //   control :{$: 'itemlist',
  //       items: '%$people%',
  //       controls :{$: 'label',
  //         title: '%$item.name% - %age%',
  //         atts: {'*ngIf': '%age%>12'}
  //       },
  //     },
  //     expectedResult :{$and:
  //       [
  //         { $contains: ['Homer','Marge'] },
  // //        { $not: { $contains: 'Bart'}}
  //       ]
  //     }
  // },
  // })

  jb.component('ui-test.editable-text-in-group', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          { $: 'editable-text', title: 'name', databind: '%$person/name%' },
          { $: 'editable-text', title: 'name', databind: '%$person/name%' },
          { $: 'label', title: '%$person/name%' }
        ],
      },
      expectedResult: { $: 'contains', text: ['Homer'] },
    },
  })

  jb.component('ui-test.editable-text-with-jb-val', {
    impl: {
      $: 'ui-test2',
      control: {
        $: 'group',
        $vars: {
          a1: ctx => {
            return {
              $jb_val: value => {
                if (value === undefined)
                  return jbart.__test_jb_val || 'Marge';
                else
                  jbart.__test_jb_val = value;
              }
            }
          }
        },
        controls: [
          { $: 'editable-text', title: 'name', databind: '%$a1%' },
          { $: 'editable-text', title: 'name', databind: '%$a1%' },
          {
            $: 'picklist', title: 'name', databind: '%$a1%',
            options: {
              $: 'picklist.optionsByComma',
              options: 'Homer,Marge'
            }
          },
          { $: 'label', title: '%$a1%' }
        ]
      },
      expectedResult: { $: 'contains', text: ['Homer'] },
    },
  })

  jb.component('ui-test.property-sheet.titles-above', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'group',
            style: { $: 'property-sheet.titles-above-float-left' },
            controls: [
              { $: 'editable-text', title: 'name', databind: '%$person/name%' },
              { $: 'editable-text', title: 'address', databind: '%$person/address%' },
            ]
          },
          { $: 'label', title: '%$person/name%' }
        ]
      },
      expectedResult: { $: 'contains', text: ['Homer'] },
    },
  })

  jb.component('ui-test.property-sheet.titles-left', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'group',
            style: { $: 'property-sheet.titles-left' },
            controls: [
              { $: 'editable-text', title: 'name', databind: '%$person/name%', style: { $: 'editable-text.input' } },
              { $: 'editable-text', title: 'address', databind: '%$person/address%', style: { $: 'editable-text.input' } },
            ]
          },
        ]
      },
      expectedResult: { $: 'contains', text: ['Homer'] },
    },
  })

  jb.component('ui-test.editable-number', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        style: { $: 'layout.vertical' },
        controls:
          [
            {
              $: 'editable-number', title: 'age',
              databind: '%$person/age%',
              style: { $: 'editable-number.slider-no-text' },
            },
            {
              $: 'editable-number', title: 'age',
              databind: '%$person/age%',
              style: { $: 'editable-number.slider' },
            },
            {
              $: 'editable-number', title: 'age',
              databind: '%$person/age%',
            },
            { $: 'label', title: '%$person/age%' }
          ]
      },
      expectedResult: { $: 'contains', text: ['42', '42'] },
    },

  })

  jb.component('ui-test.editable-number-slider', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'editable-number', title: 'age',
        databind: '%$person/age%',
        style: { $: 'editable-number.slider' },
      },
      expectedResult: { $: 'contains', text: '42' },
    },
  })

  jb.component('ui-test.editable-number-slider-empty', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'editable-number', title: 'age',
        databind: '%$person/age1%',
        style: { $: 'editable-number.slider' },
      },
      expectedResult: true,
    },
  })

  jb.component('ui-test.editable-boolean.all-styles', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            {
              $: 'editable-boolean',
              title: 'male',
              databind: '%$person/male%',
              style: { $: 'editable-boolean.checkbox' },
            },
            {
              $: 'editable-boolean',
              title: 'gender',
              databind: '%$person/male%',
              textForTrue: 'male',
              textForFalse: 'female',
              style: { $: 'editable-boolean.checkbox-with-title' },
            },
            {
              $: 'editable-boolean',
              title: 'male',
              databind: '%$person/male%',
              style: { $: 'editable-boolean.mdl-slide-toggle' },
            },
            {
              $: 'editable-boolean',
              title: 'male',
              databind: '%$person/male%',
              style: { $: 'editable-boolean.expand-collapse' },
            },
            { $: 'label', title: '%$person/male%' }
          ]
      },
      expectedResult: { $: 'contains', text: ['male'] },
    },
  })

  jb.component('ui-test.editable-boolean-settings', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            {
              $: 'editable-boolean',
              title: 'male',
              style: { $: 'editable-boolean.checkbox-with-title' },
              databind: '%$person/male%',
              textForTrue: 'male',
              textForFalse: 'female',
            },
          ]
      },
      expectedResult: { $: 'contains', text: 'male' },
    },
  })

  jb.component('ui-test.editable-boolean.expand-collapse', {
    impl: uiTest({
      control: group({
        controls: [
          editableBoolean({
            style: editableBoolean_expandCollapse(),
            databind: '%$expanded%',
            features: id('toggle')
          }),
          label({
            title: 'inner text',
            features: [feature_if('%$expanded%'), watchRef('%$expanded%')]
          })
        ],
        features: { $: 'var', name: 'expanded', mutable: true, value: false }
      }),
      action: uiAction_click('#toggle', 'toggle'),
      expectedResult: contains('inner text'),
    }),
  })

  jb.component('ui-test.expand-collapse-with-default-collapse', {
    type: 'control',
    impl: group({
      controls: [
        editableBoolean({
          title: 'default',
          databind: '%$default%',
          features: id('default')
        }),
        group({
          controls: [
            editableBoolean({
              title: 'expColl',
              style: editableBoolean_expandCollapse(),
              databind: '%$expanded%',
              features: [
                id('expCollapse'),
                field_initValue('%$default%'),
              ]
            }),
            label({
              title: 'inner text',
              features: [feature_if('%$expanded%'), watchRef('%$expanded%')]
            })
          ],
          features: [
            watchRef('%$default%')
          ]
        })
      ],
      features: [
        { $: 'var', name: 'expanded', mutable: true, value: null },
        { $: 'var', name: 'default', mutable: true, value: false }
      ]
    })
  })

  jb.component('ui-test.editable-boolean.expand-collapse-with-default-val', {
    impl: uiTest({
      control: { $: 'ui-test.expand-collapse-with-default-collapse' },
      action: runActions(
        uiAction_click('#default', 'toggle'),
      ),
      expectedResult: contains('inner text'),
    }),
  })

  jb.component('ui-test.editable-boolean.expand-collapse-with-default-collapse', {
    impl: uiTest({
      control: { $: 'ui-test.expand-collapse-with-default-collapse' },
      action: runActions(
        uiAction_click('#default', 'toggle'),
        uiAction_click('#expCollapse', 'toggle'),
      ),
      expectedResult: not(contains('inner text')),
    }),
  })


  jb.component('ui-test.code-mirror', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        $vars: {
          js: { $: 'object', text: 'function f1() { return 15 }' },
          css: { $: 'object', text: '{ width: 15px; }' },
          html: { $: 'object', text: '<div><span>hello</span></div>' },
        },
        controls:
          [
            {
              $: 'editable-text',
              databind: '%$js/text%',
              style: { $: 'editable-text.codemirror', mode: 'javascript' }
            },
            {
              $: 'editable-text',
              databind: '%$css/text%',
              style: { $: 'editable-text.codemirror', mode: 'css' }
            },
            {
              $: 'editable-text',
              databind: '%$html/text%',
              style: { $: 'editable-text.codemirror', mode: 'htmlmixed' }
            },
          ]
      },
      expectedResult: { $: 'contains', text: ['function', 'f1', '15'] },
    },
  })

  jb.component('ui-test.prettyPrintComp', {
    impl: {
      $: 'ui-test2', waitForPromise: { $delay: 50 },
      control: {
        $: 'group', controls: [
          {
            $: 'text',
            text: ctx => jb_prettyPrintComp('inner-label1-tst', jb.comps['inner-label1-tst']),
            style: { $: 'text.multi-line' }
          },
          {
            $: 'text',
            text: ctx => jb_prettyPrintComp('editable-text.codemirror', jb.comps['editable-text.codemirror']),
            style: { $: 'text.codemirror' }
          },
        ]
      },
      expectedResult: { $: 'contains', text: ["dynamic: true"] },
    },
  })

  jb.component('ui-test.picklist', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            {
              $: 'group',
              style: { $: 'property-sheet.titles-left' },
              controls: {
                $: 'picklist',
                title: 'city',
                databind: '%$personWithAddress/address/city%',
                options: {
                  $: 'picklist.optionsByComma',
                  options: 'Springfield,New York,Tel Aviv,London'
                }
              }
            },
            { $: 'label', title: '%$personWithAddress/address/city%' }
          ]
      },
      expectedResult: { $: 'contains', text: ['Springfield', 'New York'] },
    },
  })

  jb.component('ui-test.picklist-sort', {
    impl: {
      $: 'data-test',
      calculate: {
        $pipeline: [
          {
            $: 'picklist.sorted-options',
            options: { $: 'picklist.optionsByComma', options: 'a,b,c,d' },
            marks: {
              $pipeline: [
                'c:100,d:50,b:0,a:20',
                { $: 'split', separator: ',' },
                {
                  $: 'object',
                  code: { $: 'split', separator: ':', part: 'first' },
                  mark: { $: 'split', separator: ':', part: 'second' },
                }
              ]
            }
          },
          '%text%',
          { $: 'join' }
        ]
      },
      expectedResult: { $: 'contains', text: 'c,d,a' }
    },
  })

  jb.component('ui-test.picklist-groups', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group', controls:
          [
            {
              $: 'group',
              style: { $: 'property-sheet.titles-left' },
              controls: {
                $: 'picklist',
                style: { $: 'picklist.groups' },
                title: 'city',
                databind: '%$personWithAddress/address/city%',
                options: {
                  $: 'picklist.optionsByComma',
                  options: 'US.Springfield,US.New York,Israel.Tel Aviv,UK.London,mooncity'
                }
              }
            },
            { $: 'label', title: '%$personWithAddress/address/city%' }
          ]
      },
      expectedResult: { $: 'contains', text: ['Springfield', 'New York'] },
    },
  })

  jb.component('ui-test.dynamic-controls', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        style: { $: 'property-sheet.titles-left' },
        controls: {
          $: 'dynamic-controls',
          controlItems: { $list: ['name', 'age'] },
          genericControl: { $: 'editable-text', databind: '%$person/{%$controlItem%}%', title: '%$controlItem%' }
        }
      },
      expectedResult: { $: 'contains', text: ['name', 'age'] },
    },
  })

  jb.component('ui-test.inline-controls', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          { $: 'label', title: 'a1' },
          {
            $: 'inline-controls',
            controls: [{ $: 'label', title: 'a2' }, { $: 'label', title: 'a3' }]
          }
        ]
      },
      expectedResult: { $: 'contains', text: ['a1', 'a2', 'a3'] },
    },
  })

  jb.component('ui-test.tabs', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        style: { $: 'group.tabs' },
        controls: [
          { $: 'group', title: 'tab1', controls: { $: 'label', title: 'in tab1' } },
          { $: 'group', title: 'tab2', controls: { $: 'label', title: 'in tab2' } },
        ]
      },
      expectedResult: {
        $and: [
          { $: 'contains', text: ['tab1', 'in tab1'] },
          { $: 'contains', text: 'tab2' },
          { $not: { $: 'contains', text: 'in tab2' } }
        ]
      },
    },
  })

  jb.component('ui-test.group.accordion', {
    impl: {
      $: 'ui-test', disableChangeDetection: false,
      control: {
        $: 'group',
        style: { $: 'group.accordion' },
        controls: [
          { $: 'group', title: 'tab1', controls: { $: 'label', title: 'in tab1' } },
          { $: 'group', title: 'tab2', controls: { $: 'label', title: 'in tab2' } },
        ]
      },
      action: ctx => jb.delay(1),
      expectedResult: { $: 'contains', text: ['tab1', 'in tab1', 'tab2'] },
    },
  })

  jb.component('ui-test.inner-label', {
    impl: {
      $: 'ui-test',
      control: { $: 'inner-label3-tst', title: 'Hello World2' },
      expectedResult: { $: 'contains', text: 'Hello World2' }
    },
  })

  jb.component('ui-test.markdown', {
    impl: {
      $: 'ui-test2',
      control: {
        $: 'markdown', markdown: `| Day     | Meal    | Price |
| --------|---------|-------|
| Monday  | pasta   | $6    |
| Tuesday | chicken | $8    |    ` },
      expectedResult: { $: 'contains', text: 'table' }
    },
  })

  jb.component('ui-test.style-by-control', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label',
        title: 'Hello World',
        style: {
          $: 'style-by-control',
          modelVar: 'labelModel',
          control: {
            $: 'button',
            title: '%$labelModel/title%2',
          }
        }
      },
      expectedResult: { $: 'contains', text: 'Hello World2' }
    },
  })

  jb.component('ui-test.picklist-as-itemlist', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'picklist',
            style: { $: 'picklist.selection-list', width: '300' },
            databind: '%$personWithAddress/address/city%',
            options: {
              $: 'picklist.optionsByComma',
              options: 'Springfield,New York,Tel Aviv,London'
            },
          },
          { $: 'label', title: '%$personWithAddress/address/city%' }
        ]
      },
      expectedResult: { $: 'contains', text: ['Springfield', 'New York'] },
    },
  })

  jb.component('menu-test.menu1', {
    impl: {
      $: 'menu.menu',
      title: 'main',
      options: [
        {
          $: 'menu.menu', title: 'File',
          options: [
            { $: 'menu.action', title: 'New' },
            { $: 'menu.action', title: 'Open' },
            {
              $: 'menu.menu', title: 'Bookmarks',
              options: [
                { $: 'menu.action', title: 'Google' },
                { $: 'menu.action', title: 'Facebook' }
              ]
            },
            {
              $: 'menu.menu', title: 'Friends',
              options: [
                { $: 'menu.action', title: 'Dave' },
                { $: 'menu.action', title: 'Dan' }
              ]
            },
          ]
        },
        {
          $: 'menu.menu', title: 'Edit',
          options: [
            { $: 'menu.action', title: 'Copy' },
            { $: 'menu.action', title: 'Paste' }
          ]
        },
        {
          $: 'menu.dynamic-options',
          items: { $list: [1, 2, 3] },
          genericOption: { $: 'menu.action', title: 'dynamic-%%' },
        }
      ]
    }
  })

  jb.component('menu-test.pulldown', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'menu.control',
        style: { $: 'menu-style.pulldown' },
        menu: { $: 'menu-test.menu1' },
      },
      action: ctx => jb.delay(1),
      expectedResult: { $: 'contains', text: ['File', 'Edit', 'dynamic-1', 'dynamic-3'] },
    },
  })

  jb.component('menu-test.context-menu', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'menu.control',
        menu: { $: 'menu-test.menu1' }
      },
      action: ctx => jb.delay(1),
      expectedResult: { $: 'contains', text: ['File', 'Edit'] },
    },
  })

  jb.component('menu-test.open-context-menu', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'button',
        title: 'open',
        action: {
          $: 'menu.open-context-menu',
          menu: { $: 'menu-test.menu1' },
        }
      },
      expectedResult: { $: 'contains', text: 'open' },
    },
  })

  jb.component('ui-test.immutable-var', {
    impl: uiTest({
      control: label({ 
          title: '%$var1%',
          features: [
            { $: 'var', name: 'var1', value: 'hello', mutable: true },
            { $: 'feature.after-load', action: writeValue('%$var1%','foo') }
          ]
      }),
      action: ctx => jb.delay(1),
      expectedResult: contains('foo'),
    }),
  })

  jb.component('ui-test.refresh-control-by-id', {
    impl: uiTest({
      control: itemlist({
        items: '%$items%',
        controls: label({ title: '%title%' }),
        features: [
            { $: 'var', name: 'items', globalId: 'items', value: {$asIs: [ { title: 'i1'}, { title: 'i2'} ]}, mutable: true},
            id('itemlist')
        ]
      }),
      action: runActions(
        addToArray('%$items%', {$asIs: [ { title: 'i2'},{ title: 'i3'}]}),
        refreshControlById('itemlist'),
        delay(1),
      ),
      expectedResult: contains(['i1','i2','i3']),
    }),
  })


  // jb.component('ui-test.raw-vdom', {
  //   impl :{$: 'ui-test',
  //     control: ctx =>
  //       jb.ui.h('div',{},'hello world'),
  //     expectedResult :{$: 'contains', text: 'hello world' },
  //   },
  // })

  // jb.component('ui-test.raw-vdom-in-group', {
  //   impl :{$: 'ui-test',
  //     control: { $: 'group',
  //       controls: ctx =>
  //           jb.ui.h('div',{},'hello world')
  //     },
  //     expectedResult :{$: 'contains', text: 'hello world' },
  //   },
  // })

  jb.component('ui-test.mutable-var', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label', title: '%$var1%',
        features: [
          { $: 'var', name: 'var1', value: 'hello', mutable: true },
          { $: 'feature.after-load', action: { $: 'write-value', to: '%$var1%', value: 'foo' } }
        ]
      },
      action: ctx => jb.delay(1).then(_ => jb.delay(1)),
      expectedResult: { $: 'contains', text: 'foo' },
    },
  })

  jb.component('ui-test.mutable-var-with-global-id', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label', title: '%$var1%',
        features: [
          { $: 'var', name: 'var1', value: 'hello', mutable: true, globalId: 'globalVar1' },
          { $: 'feature.after-load', action: { $: 'write-value', to: '%$var1%', value: 'foo' } }
        ]
      },
      action: ctx => jb.delay(1).then(_ => jb.delay(1)),
      expectedResult: { $: 'contains', text: 'foo' },
    },
  })


  jb.component('ui-test.mutable-var-as-object', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label', title: '%$obj1/txt%',
        features: [
          { $: 'var', name: 'obj1', value: { $: 'object', txt: 'hello' }, mutable: true },
          { $: 'feature.after-load', action: { $: 'write-value', to: '%$obj1/txt%', value: 'foo' } }
        ]
      },
      action: ctx => jb.delay(1).then(_ => jb.delay(1)),
      expectedResult: { $: 'contains', text: 'foo' },
    },
  })

  jb.component('ui-test.mutable-var-as-array', {
    impl: uiTest({
      control: group({
        controls: label({ title: '%$items[1]/title%' }),
        features:
          { $: 'var', name: 'items', globalId: 'items', value: {$asIs: [{title: 'koo'},{title: 'foo'}]}, mutable: true },
      }),
      expectedResult: contains('foo'),
    }),
  })

  jb.component('ui-test.mutable-var-as-array-one-item', {
    impl: uiTest({
      control: group({
        controls: label({ title: '%$items[0]/title%' }),
        features:
          { $: 'var', name: 'items', globalId: 'items', value: {$asIs: [{title: 'foo'}]}, mutable: true },
      }),
      expectedResult: contains('foo'),
    }),
  })


  jb.component('ui-test.mutable-var-as-object-not-initialized', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label', title: '%$obj1/txt%',
        features: [
          { $: 'var', name: 'obj1', value: { $: 'object' }, mutable: true },
          { $: 'feature.after-load', action: { $: 'write-value', to: '%$obj1/txt%', value: 'foo' } }
        ]
      },
      action: ctx => jb.delay(1).then(_ => jb.delay(1)),
      expectedResult: { $: 'contains', text: 'foo' },
    },
  })

  jb.component('ui-test.calculated-var', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'editable-text',
            databind: '%$var1%',
            features: { $: 'id', id: 'var1' }
          },
          { $: 'editable-text', databind: '%$var2%' },
          { $: 'label', title: '%$var3%' }
        ],
        features: [
          { $: 'var', name: 'var1', value: 'hello', mutable: true },
          { $: 'var', name: 'var2', value: 'world', mutable: true },
          { $: 'calculated-var', name: 'var3', value: '%$var1% %$var2%', watchRefs: { $list: ['%$var1%', '%$var2%'] } },
        ]
      },
      action: { $: 'ui-action.set-text', selector: '#var1', value: 'hi' },
      expectedResult: { $: 'contains', text: 'hi world' },
    },
  })

  jb.component('ui-test.calculated-var-cyclic', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'editable-text',
            databind: '%$var1%',
            features: { $: 'id', id: 'var1' }
          },
          { $: 'editable-text', databind: '%$var2%' },
          { $: 'label', title: '%$var3%' }
        ],
        features: [
          //      {$:'var', name: 'var1', value: 'hello', mutable: true },
          { $: 'calculated-var', name: 'var1', value: 'xx%$var3%', watchRefs: '%$var3%' },
          { $: 'var', name: 'var2', value: 'world', mutable: true },
          { $: 'calculated-var', name: 'var3', value: '%$var1% %$var2%', watchRefs: { $list: ['%$var1%', '%$var2%'] } },
        ]
      },
      action: { $: 'ui-action.set-text', selector: '#var1', value: 'hi' },
      expectedResult: { $: 'contains', text: 'hi world' },
    },
  })

  jb.component('inner-label1-tst', {
    params: [
      { id: 'title', mandatory: true, dynamic: true },
    ],
    impl: { $: 'label', title: { $call: 'title' } }
  })

  jb.component('inner-label2-tst', {
    params: [
      { id: 'title', mandatory: true, dynamic: true },
    ],
    impl: { $: 'inner-label1-tst', title: { $call: 'title' } }
  })

  jb.component('inner-label3-tst', {
    params: [
      { id: 'title', mandatory: true, dynamic: true },
    ],
    impl: { $: 'inner-label2-tst', title: { $call: 'title' } }
  })

  jb.component('ui-test.control.first-succeeding', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          {
            $: 'control.first-succeeding',
            controls: [
              {
                $: 'control-with-condition',
                condition: '%$gender% == "male"',
                control: { $: 'label', title: 'male' }
              },
            ],
          },
          {
            $: 'control.first-succeeding',
            controls: [
              {
                $: 'control-with-condition',
                condition: '%$gender% == "female"',
                control: { $: 'label', title: 'female' }
              },
              {
                $: 'control-with-condition',
                condition: '%$gender% != "female"',
                control: { $: 'label', title: 'male2' }
              },
              {
                $: 'control-with-condition',
                condition: true,
                control: { $: 'label', title: 'second-succeeding' }
              }
            ],
          },
          {
            $: 'control.first-succeeding',
            controls: [
              {
                $: 'control-with-condition',
                condition: '%$gender% == "female"',
                control: { $: 'label', title: 'female' }
              },
              {
                $: 'control-with-condition',
                condition: '%$gender% == "lale"',
                control: { $: 'label', title: 'male2' }
              },
              { $: 'label', title: 'default' }
            ],
          }
        ],
        features: [{ $: 'var', name: 'gender', value: 'male' }]
      },
      expectedResult: and(contains(['male','male2','default']),not(contains('second-succeeding'))),
    },
  })

  jb.component('ui-test.first-succeeding.watch-refresh-on-ctrl-change', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'group',
        controls: [
          { $: 'editable-text', databind: '%$gender%' },
          { $: 'button', title: 'female', 
            action: { $: 'write-value', to: '%$gender%', value: 'female' },
            features: id('female')
          },
          {$: 'button', title: 'zee', action: { $: 'write-value', to: '%$gender%', value: 'zee' }, features: id('zee') },
          {$: 'control.first-succeeding',
            controls: [
              {
                $: 'control-with-condition',
                condition: '%$gender% == "male"',
                control: { $: 'label', title: 'male' }
              },
              {$: 'label', title: 'not male' }
            ],
            features: {$: 'first-succeeding.watch-refresh-on-ctrl-change', ref: '%$gender%' }
          },
        ],
        features: { $: 'var', name: 'gender', value: 'male', mutable: true }
      },
      action: runActions(uiAction_click('#female'),uiAction_click('#zee')),
      expectedResult: contains('not male'),
    },
  })

  jb.component('ui-test.boolean-not-reffable-true', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label',
        title: { $: 'is-of-type', type: 'string', obj: '123' },
      },
      expectedResult: { $: 'contains', text: 'true' },
    }
  })

  jb.component('ui-test.boolean-not-reffable-false', {
    impl: {
      $: 'ui-test',
      control: {
        $: 'label',
        title: { $: 'is-of-type', type: 'string2', obj: '123' },
      },
      expectedResult: { $: 'contains', text: 'false' },
    }
  })

})()