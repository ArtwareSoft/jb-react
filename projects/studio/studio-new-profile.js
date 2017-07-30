jb.component('studio.open-new-profile-dialog', {
  type: 'action',
  params: [
    {
      id: 'path',
      as: 'string',
      defaultValue :{$: 'studio.currentProfilePath' }
    },
    { id: 'type', as: 'string' },
    {
      id: 'mode',
      option: 'insert,insert-control,update',
      defaultValue: 'insert'
    },
    { id: 'onClose', type: 'action', dynamic: true }
  ],
  impl :{$: 'open-dialog',
    style :{$: 'dialog.studio-floating' },
    content :{$: 'studio.select-profile',
      onSelect :{$: 'action.if',
        condition: '%$mode% == "insert-control"',
        then: {$: 'studio.insert-control', path: '%$path%', comp: '%%' },
        else :{
          $if: '%$mode% == "insert"',
          then :{$: 'studio.add-array-item',
            path: '%$path%',
            toAdd :{
              $object :{$: '%%' }
            }
          },
          else :{$: 'studio.set-comp', path: '%$path%', comp: '%%' }
        }
      },
      type: '%$type%',
      path: '%$path%'
    },
    title: 'new %$type%',
    features: [
      {$: 'css.height', height: '430', overflow: 'hidden' },
      {$: 'css.width', width: '450', overflow: 'hidden' },
      {$: 'dialog-feature.drag-title', id: 'new %$type%' },
      {$: 'dialog-feature.near-launcher-position', offsetLeft: 0, offsetTop: 0 },
      {$: 'dialog-feature.auto-focus-on-first-input' },
//			{$: 'var', name: 'initial-comps-index', value: {$: 'studio.comps-undo-index'}},
      {$: 'dialog-feature.onClose',
        action : [
					{ $if: {$not:'%%'},
	//					then: {$: 'studio.revert', toIndex: '%$initial-comps-index%' },
						else: [ {$:'studio.goto-last-edit'}, {$: 'studio.focus-on-first-property'}]
					},
					{ $call: 'onClose' }
				]
      }
    ]
  }
})

jb.component('studio.categories-marks', {
  params: [
    { id: 'type', as: 'string' },
    { id: 'path', as: 'string' },
  ],
  impl :{$: 'pipeline',
    items: [
        { $: 'object' ,
          control :{$: 'pipeline',
            items: [
              {$: 'list',
                items: [
                  'common:100',
                  'control:95',
                  'input:90',
                  'group:85',
                  'studio-helper:0,suggestions-test:0,studio:0,test:0,basic:0,ui-tests:0,studio-helper-dummy:0,itemlist-container:0'
                ]
              },
              {$: 'split', separator: ',' },
              {$: 'object',
                code: {$: 'split', separator: ':', part: 'first'  },
                mark: {$: 'split', separator: ':', part: 'second'  },
              }
            ]
          },
          feature :{$: 'pipeline',
            items: [
              {$: 'list',
                items: [
                  'css:100',
                  'watch:95',
									'lifecycle:90',
                  'events:85',
									'group:80',
									'all:20',
                  'feature:0,tabs:0,label:0,picklist:0,mdl:0,studio:0,text:0,menu:0,flex-layout-container:0,mdl-style:0,itemlist-container:0,editable-text:0,editable-boolean:0',
                  'mdl-style:0'
                ]
              },
              {$: 'split', separator: ',' },
              {$: 'object',
                code: {$: 'split', separator: ':', part: 'first'  },
                mark: {$: 'split', separator: ':', part: 'second'  },
              }
            ]
          },
		  'group.style' :{$: 'pipeline',
            items: [
              {$: 'list',
                items: [
                  'layout:100',
                  'group:90',
                  'tabs:0',
                ]
              },
              {$: 'split', separator: ',' },
              {$: 'object',
                code: {$: 'split', separator: ':', part: 'first'  },
                mark: {$: 'split', separator: ':', part: 'second'  },
              }
            ]
          },
        },
       {$firstSucceeding: [ ctx => ctx.data[ctx.exp('%$type%','string')], {$: 'object', code: 'all', mark: '100' }]}
    ]
  }
})

jb.component('studio.select-profile', {
  type: 'control', 
  params: [
    { id: 'onSelect', type: 'action', dynamic: true }, 
    { id: 'type', as: 'string' }, 
    { id: 'path', as: 'string' }
  ], 
  impl :{$: 'group', 
    title: 'itemlist-with-find', 
    style :{$: 'layout.vertical', spacing: 3 }, 
    controls: [
      {$: 'itemlist-container.search', 
        title :{$: 'studio.prop-name', path: '%$path%' }, 
        searchIn :{$: 'itemlist-container.search-in-all-properties' }, 
        databind: '%$itemlistCntrData/search_pattern%', 
        style :{$: 'editable-text.mdl-input', width: '200' }, 
        features :{$: 'feature.onEsc', 
          action :{$: 'dialog.close-containing-popup', 
            id: 'studio-jb-editor-popup', 
            OK: false
          }
        }
      }, 
      {$: 'group', 
        title: 'categories and items', 
        style :{$: 'layout.horizontal', spacing: '33' }, 
        controls: [
          {$: 'itemlist', 
            title: 'items', 
            items :{
              $pipeline: [
                '%$Categories%', 
                {$: 'filter', 
                  filter :{$: 'or', 
                    items: [
                      {$: 'equals', 
                        item1: '%code%', 
                        item2: '%$SelectedCategory%'
                      }, 
                      {$: 'notEmpty', 
                        item: '%$itemlistCntrData/search_pattern%'
                      }
                    ]
                  }
                }, 
                '%pts%', 
                {$: 'itemlist-container.filter' }, 
                {$: 'unique', id: '%%', items: '%%' }
              ]
            }, 
            controls: [
              {$: 'label', 
                title :{$: 'highlight', 
                  base: '%%', 
                  highlight: '%$itemlistCntrData/search_pattern%'
                }, 
                style :{$: 'label.span', level: 'h3' }, 
                features: [
                  {$: 'css', css: '{ text-align: left; }' }, 
                  {$: 'css.padding', 
                    top: '0', 
                    left: '4', 
                    right: '4', 
                    bottom: '0'
                  }, 
                  {$: 'css.width', width: '250', minMax: 'min' }
                ]
              }
            ], 
            itemVariable: 'item', 
            features: [
              {$: 'css.height', height: '300', overflow: 'auto', minMax: '' }, 
              {$: 'itemlist.selection', 
                databind: '%$itemlistCntrData/selected%', 
                onSelection :{
                  $runActions: [
                    {
                      $if :{$: 'contains', 
                        text: ['control', 'style'], 
                        allText: '%$type%'
                      }, 
                      then :{
                        $call: 'onSelect', 
                        $vars: { selectionPreview: true }
                      }
                    }
                  ]
                }, 
                onDoubleClick :{
                  $runActions: [
                    {$: 'studio.clean-selection-preview' }, 
                    { $call: 'onSelect' }, 
                    {$: 'dialog.close-containing-popup' }
                  ]
                }, 
                autoSelectFirst: true
              }, 
              {$: 'itemlist.keyboard-selection', 
                onEnter :{
                  $runActions: [
                    {$: 'studio.clean-selection-preview' }, 
                    { $call: 'onSelect' }, 
                    {$: 'dialog.close-containing-popup' }
                  ]
                }
              }, 
              {$: 'watch-ref', ref: '%$SelectedCategory%' }, 
              {$: 'watch-ref', ref: '%$itemlistCntrData/search_pattern%' }, 
              {$: 'css.margin', top: '3', selector: '>li' }, 
              {$: 'css.width', width: '200' }
            ]
          }, 
          {$: 'picklist', 
            title: '', 
            databind: '%$SelectedCategory%', 
            options: '%$Categories%', 
            style :{$: 'style-by-control', 
              control :{$: 'group', 
                controls :{$: 'itemlist', 
                  items: '%$picklistModel/options/code%', 
                  controls :{$: 'label', 
                    title :{
                      $pipeline: [
                        '%$Categories%', 
                        {$: 'filter', filter: '%code% == %$item%' }, 
                        '%code% (%pts/length%)'
                      ]
                    }, 
                    style :{$: 'label.span' }, 
                    features: [
                      {$: 'css.width', width: '120' }, 
                      {$: 'css', css: '{text-align: left}' }, 
                      {$: 'css.padding', left: '10' }
                    ]
                  }, 
                  style :{$: 'itemlist.ul-li' }, 
                  watchItems: false, 
                  features: [
                    {$: 'itemlist.selection', 
                      cssForActive: 'background: white', 
                      databind: '%$SelectedCategory%', 
                      cssForSelected: 'box-shadow: 3px 0px 0 0 #304ffe inset; color: black !important; background: none !important; !important'
                    }
                  ]
                }, 
                features :{$: 'group.itemlist-container' }
              }, 
              modelVar: 'picklistModel'
            }, 
            features :{$: 'picklist.onChange', 
              action :{$: 'write-value', to: '%$itemlistCntrData/search_pattern%' }
            }
          }
        ]
      }, 
      {$: 'label', 
        title :{
          $pipeline: [
            '%$itemlistCntrData/selected%', 
            {$: 'studio.val', path: '%%' }, 
            '%description%'
          ]
        }, 
        style :{$: 'label.span' }
      }
    ], 
    features: [
      {$: 'css.margin', top: '10', left: '20' }, 
      {$: 'var', 
        name: 'unsortedCategories', 
        value :{$: 'studio.categories-of-type', type: '%$type%', path: '%$path%' }
      }, 
      {$: 'var', 
        name: 'Categories', 
        value :{$: 'picklist.sorted-options', 
          options: '%$unsortedCategories%', 
          marks :{$: 'studio.categories-marks', type: '%$type%', path: '%$path%' }
        }
      }, 
      {$: 'var', 
        name: 'SelectedCategory', 
        value :{
          $if :{$: 'studio.val', path: '%$path%' }, 
          then: 'all', 
          else: '%$Categories[0]/code%'
        }, 
        mutable: true
      }, 
      {$: 'var', name: 'SearchPattern', value: '', mutable: true }, 
      {$: 'group.itemlist-container', 
        initialSelection :{$: 'studio.comp-name', path: '%$path%' }
      }
    ]
  }
})

jb.component('studio.pick-profile', {
  description: 'picklist for picking a profile in a context',
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'button',
    title :{ $firstSucceeding: [{$: 'studio.comp-name', path: '%$path%' }, ''] },
    action :{$: 'open-dialog',
      style :{$: 'dialog.popup' },
      content :{$: 'studio.select-profile',
        onSelect :{$: 'studio.set-comp', path: '%$path%', comp: '%%' },
        type :{$: 'studio.param-type', path: '%$path%' },
        path: '%$path%'
      },
      features: [
        {$: 'dialog-feature.auto-focus-on-first-input' },
        {$: 'css.padding', right: '20' },
//				{$: 'var', name: 'initial-comps-index', value: {$: 'studio.comps-undo-index'}},
//	      {$: 'dialog-feature.onClose',
//	        action :{ $if: {$not:'%%'},	then: {$: 'studio.revert', toIndex: '%$initial-comps-index%' }}
//				},
      ]
    },
    style :{$: 'button.select-profile-style' },
    features :{$: 'studio.watch-path', path: '%$path%' }
  }
})

jb.component('studio.open-new-page', {
  type: 'action',
  impl :{$: 'open-dialog',
    style :{$: 'dialog.dialog-ok-cancel' },
		modal: true,
    features : [{$: 'var', name: 'name', mutable: true },
			{$: 'dialog-feature.auto-focus-on-first-input' }
		],
    content :{$: 'group',
      style :{$: 'group.div' },
      controls: [
        {$: 'editable-text',
          title: 'page name',
          databind: '%$name%',
          style :{$: 'editable-text.mdl-input' },
          features :{$: 'feature.onEnter',
            action :{$: 'dialog.close-containing-popup' }
          }
        }
      ],
      features :{$: 'css.padding', top: '14', left: '11' }
    },
    title: 'New Page',
    onOK: [
      {$: 'write-value',
        to :{$: 'studio.ref', path: '%$studio/project%.%$name%' },
        value :{$: 'json.parse',
          text: '{ "type": "control", "impl": {"$": "group", "title": "%$name%", "controls": []}}'
        }
      },
      //{$: 'studio.goto-path', path: '%$studio/project%.%$name%' },
      {$: 'write-value', to: '%$studio/profile_path%', value: '%$studio/project%.%$name%~impl' },
      {$: 'studio.open-control-tree'},
      {$: 'tree.regain-focus' },
      {$: 'on-next-timer',
        description: 'we need to wait for the itemlist to be updated with new page. However, the mutable name var is lost on next timer so we put it in context var as newName',
        $vars: { newName: '%$name%'},
        action: {$: 'write-value', to: '%$studio/page%', value: '%$newName%' },
      }
    ],
  }
})

jb.component('studio.insert-comp-option', {
  params: [
    { id: 'title', as: 'string' },
    { id: 'comp', as: 'string' },
  ],
  impl :{$: 'menu.action', title: '%$title%',
    action :{$: 'studio.insert-comp', comp: '%$comp%', type: 'control' },
  }
})

jb.component('studio.insert-control-menu', {
  impl :{$: 'menu.menu', title: 'Insert',
          options: [
          {$: 'menu.menu', title: 'Control', options: [
              {$: 'studio.insert-comp-option', title:'Label', comp: 'label'},
              {$: 'studio.insert-comp-option', title:'Button', comp: 'button'},
            ]
          },
          {$: 'menu.menu', title: 'Input', options: [
              {$: 'studio.insert-comp-option', title:'Editable Text', comp: 'editable-text'},
              {$: 'studio.insert-comp-option', title:'Editable Number', comp: 'editable-number'},
              {$: 'studio.insert-comp-option', title:'Editable Boolean', comp: 'editable-boolean'},
            ]
          },
          {$: 'menu.menu', title: 'Group', options: [
              {$: 'studio.insert-comp-option', title:'Group', comp: 'group'},
              {$: 'studio.insert-comp-option', title:'Itemlist', comp: 'itemlist'},
            ]
          },
          {$: 'menu.action',
              title: 'More...',
              action :{$: 'studio.open-new-profile-dialog', type: 'control', mode: 'insert-control' }
          }
          ]
        },
})

jb.studio.newControl = path =>
  new jb.jbCtx().run({$: 'studio.open-new-profile-dialog',
          path: path,
          type: 'control',
          mode: 'insert-control'
        });
