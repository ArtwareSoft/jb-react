jb.component('studio.open-new-profile-dialog', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string', defaultValue :{$: 'studio.currentProfilePath' } },
    { id: 'type', as: 'string' }, 
    { id: 'mode', option: 'insert,insert-control,update', defaultValue: 'insert' }, 
    { id: 'onClose', type: 'action', dynamic: true}
  ], 
  impl :{$: 'open-dialog',
    style :{$: 'dialog.studio-floating' }, 
    content :{$: 'studio.select-profile', path: '%$path%' , 
      onSelect :{$if: '%$mode% == "insert-control"', 
          then : [
            {$: 'studio.insert-control', path: '%$path%', comp: '%%' },
            {$: 'on-next-timer', 
              action: [
                // {$: 'write-value', 
                //   to: '%$studio/profile_path%', 
                //   value: '%$modifiedPath%'
                // }, 
                {$: 'studio.open-properties' }, 
                {$: 'studio.open-control-tree' }, 
                {$: 'studio.refresh-preview' }
              ]
            }, 
          ],
          else :{$if: '%$mode% == "insert"', 
            then: {$: 'studio.add-array-item', path: '%$path%', toAdd: { $object: { $: '%%'} } },
            else: {$: 'studio.set-comp', path: '%$path%', comp: '%%' },
          },
        }, 
      type: '%$type%'
    }, 
    title: 'new %$type%', 
//    modal: true, 
    features: [
      {$: 'css.height', height: '430', overflow: 'hidden' }, 
      {$: 'css.width', width: '450', overflow: 'hidden' }, 
      {$: 'dialog-feature.drag-title', id: 'new %$type%' }, 
      {$: 'dialog-feature.near-launcher-position', offsetLeft: 0, offsetTop: 0 }, 
      {$: 'group.auto-focus-on-first-input' },
      {$: 'dialog-feature.onClose', action:{ $call: 'onClose'}},
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
                  'feature:95', 
                  'group:90', 
                  'tabs:0,label:0,picklist:0,mdl:0,studio:0,text:0,menu:0,flex-layout-container:0,mdl-style:0', 
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
          data :{$: 'pipeline', 
            items: [
              {$: 'list', items: [] }, 
            ]
          }, 
          action :{$: 'pipeline', 
            items: [
              {$: 'list', items: [] }, 
            ]
          }
        },
      '%{%$type%}%'
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
        style :{$: 'editable-text.mdl-input' }, 
        features :{$: 'feature.onEsc', 
          action :{$: 'dialog.close-containing-popup', 
            id: 'studio-jb-editor-popup', 
            OK: true
          }
        }
      }, 
      {$: 'group', 
        title: 'categories and items', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'picklist', 
            title: '', 
            databind: '%$SelectedCategory%', 
            options :{$: 'picklist.sorted-options', 
              options :{$: 'picklist.coded-options', 
                options :{$: 'studio.categories-of-type', type: '%$type%' }, 
                code: '%name%', 
                text: '%name%'
              }, 
              marks :{$: 'studio.categories-marks', type: '%$type%', path: '%$path%' }
            }, 
            style :{$: 'style-by-control', 
              control :{$: 'group', 
                controls :{$: 'itemlist', 
                  items: '%$picklistModel/options%', 
                  controls :{$: 'label', 
                    title: '%text%', 
                    style :{$: 'label.mdl-button' }, 
                    features: [
                      {$: 'css.width', width: '120' }, 
                      {$: 'css', css: '{text-align: left}' }
                    ]
                  }, 
                  style :{$: 'itemlist.ul-li' }, 
                  watchItems: false, 
                  features: [
                    {$: 'itemlist.selection', 
                      cssForActive: 'background: white', 
                      onSelection :{$: 'write-value', 
                        to: '%$picklistModel/databind%', 
                        value: '%code%'
                      }, 
                      autoSelectFirst: 'true', 
                      cssForSelected: 'box-shadow: 3px 0px 0 0 #304ffe inset; background: none !important'
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
          }, 
          {$: 'itemlist', 
            title: 'items', 
            items :{
              $pipeline: [
                '%$Categories%', 
                {$: 'filter', 
                  filter :{$: 'or', 
                    items: [
                      {$: 'equals', 
                        item1: '%name%', 
                        item2: '%$SelectedCategory%'
                      }, 
                      {$: 'and', 
                        items: [
                          {$: 'notEmpty', 
                            item: '%$itemlistCntrData/search_pattern%'
                          }, 
                          {$: 'not-equals', item1: 'all', item2: '%name%' }
                        ]
                      }
                    ]
                  }
                }, 
                '%pts%', 
                {$: 'itemlist-container.filter' }
              ]
            }, 
            controls: [
              {$: 'label', 
                action: [{$: 'dialog.close-containing-popup' }, { $call: 'onSelect' }], 
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
                onDoubleClick :{$: 'runActions', 
                  actions: [{$: 'dialog.close-containing-popup' }, { $call: 'onSelect' }]
                }, 
                autoSelectFirst: true
              }, 
              {$: 'itemlist.keyboard-selection', 
                onEnter :{$: 'runActions', 
                  actions: [{$: 'dialog.close-containing-popup' }, { $call: 'onSelect' }]
                }
              }, 
              {$: 'watch-ref', ref: '%$SelectedCategory%', strongRefresh: true }, 
              {$: 'watch-ref', 
                ref: '%$itemlistCntrData/search_pattern%', 
                strongRefresh: true
              }, 
              {$: 'css.margin', top: '3', selector: '>li' }
            ]
          }
        ]
      }
    ], 
    features: [
      {$: 'css.margin', top: '10', left: '20' }, 
      {$: 'var', 
        name: 'Categories', 
        value :{$: 'studio.categories-of-type', type: '%$type%' }
      }, 
      {$: 'var', 
        name: 'SelectedCategory', 
        value: '%$Categories[0]%', 
        mutable: true
      }, 
      {$: 'var', name: 'SearchPattern', value: '', mutable: true }, 
      {$: 'group.itemlist-container' }
    ]
  }
})

jb.component('studio.pick-profile', {
  description: 'picklist for picking a profile in a context', 
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'button', 
    title :{ $firstSucceeding: [{$: 'studio.comp-name', path: '%$path%' }, 'select'] }, 
    action :{$: 'open-dialog', 
      style :{$: 'dialog.popup' }, 
      content :{$: 'studio.select-profile', 
        onSelect :{$: 'studio.set-comp', path: '%$path%', comp: '%%' }, 
        type :{$: 'studio.param-type', path: '%$path%' },
        path: '%$path%'
      }, 
      features: [
        {$: 'group.auto-focus-on-first-input' }, 
        {$: 'css.padding', right: '20' }
      ]
    }, 
    style :{$: 'button.href' }, 
    features :{$: 'studio.watch-path', path: '%$path%' }
  }
})

jb.component('studio.open-new-page', {
  type: 'action', 
  impl :{$: 'open-dialog', 
    modal: true, 
    title: 'New Page', 
    features :{$: 'var', name: 'name', mutable: true },
    style :{$: 'dialog.dialog-ok-cancel', 
      features :{$: 'dialog-feature.auto-focus-on-first-input' }
    }, 
    content :{$: 'group', 
      controls: [
        {$: 'editable-text', 
          databind: '%$name%', 
          features :{$: 'feature.onEnter', 
            action :{$: 'dialog.close-containing-popup' }
          }, 
          title: 'page name', 
          style :{$: 'editable-text.mdl-input' }
        }
      ], 
      features :{$: 'css.padding', top: '14', left: '11' }, 
      style :{$: 'group.div' }
    }, 
    onOK: function (ctx) {
        var id = ctx.exp('%$studio/project%.%$name%');
        var profile = {
            type: 'control',
            impl: { $: 'group', title: ctx.exp('%$name%') }
        };
        jb.studio.newComp(id, profile);
        ctx.run({ $: 'write-value', to: '%$studio/page%', value: '%$name%' });
        ctx.run({ $: 'write-value', to: '%$studio/profile_path%', value: id });
    }
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
