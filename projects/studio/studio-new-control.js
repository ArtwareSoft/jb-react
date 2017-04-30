(function() {
  var model = jb.studio.model;


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
            {$: 'studio.onNextModifiedPath', 
              action: [
                {$: 'write-value', 
                  to: '%$studio/profile_path%', 
                  value: '%$modifiedPath%'
                }, 
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
      {$: 'dialog-feature.dragTitle', id: 'new %$type%' }, 
      {$: 'dialog-feature.nearLauncherLocation', offsetLeft: 0, offsetTop: 0 }, 
      {$: 'group.auto-focus-on-first-input' },
      {$: 'dialog-feature.onClose', action:{ $call: 'onClose'}}
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
    { id: 'path', as: 'string' },
  ], 
  impl :{$: 'group', 
    title: 'itemlist-with-find', 
    style :{$: 'layout.vertical', spacing: 3 }, 
    controls: [
      {$: 'itemlist-container.search', 
        title: 'Search', 
        searchIn :{$: 'itemlist-container.search-in-all-properties' }, 
        databind: '%$itemlistCntr/filter_data/search%', 
        style :{$: 'editable-text.mdl-input', width: '155' }, 
        features: [
          {$: 'field.subscribe', 
            action :{$: 'write-value', to: '%$SelectedCategory%', value: 'all' }
          }, 
          {$: 'editable-text.x-button' }
        ]
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
                      onSelection :{$: 'write-value', 
                        to: '%$picklistModel/databind%', 
                        value: '%code%'
                      }, 
                      autoSelectFirst: 'true', 
                      cssForSelected: 'border-left: 2px #ccc solid; background: #eee', 
                      cssForActive: 'background: white'
                    }
                  ]
                }, 
                features :{$: 'group.itemlist-container' }
              }, 
              modelVar: 'picklistModel'
            }
          }, 
          {$: 'itemlist', 
            title: 'items', 
            items :{
              $pipeline: [
                '%$Categories%', 
                {$: 'filter', 
                  filter :{$: 'equals', item1: '%name%', item2: '%$SelectedCategory%' }
                }, 
                '%pts%', 
                {$: 'itemlist-container.filter' }
              ]
            }, 
            controls: [
              {$: 'button', 
                title :{$: 'highlight', 
                  base: '%%', 
                  highlight: '%$itemlistCntr/filter_data/search%', 
                  cssClass: 'highlight'
                }, 
                action: [{$: 'closeContainingPopup' }, { $call: 'onSelect' }], 
                style :{$: 'customStyle', 
                  template: '<button class="mdl-button mdl-js-button mdl-js-ripple-effect" (click)="clicked()" [innerHtml]="title"></button>', 
                  css: 'button { text-transform: none }', 
                  features :{$: 'mdl-style.init-dynamic', query: '.mdl-js-button' }
                }, 
                features :{$: 'css', css: '!button { text-align: left; width: 250px }' }
              }
            ], 
            watchItems: true, 
            itemVariable: 'item', 
            features: [
              {$: 'css.height', height: '300', overflow: 'auto', minMax: '' }, 
              {$: 'itemlist.selection', 
                onDoubleClick :{$: 'runActions', 
                  actions: [{$: 'closeContainingPopup' }, { $call: 'onSelect' }]
                }, 
                autoSelectFirst: true
              }, 
              {$: 'itemlist.keyboard-selection', 
                onEnter :{$: 'runActions', 
                  actions: [{$: 'closeContainingPopup' }, { $call: 'onSelect' }]
                }
              }
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
        value :{$: 'editable-primitive', 
          type: 'string', 
          initialValue: '%$Categories[0]%'
        }
      }, 
      {$: 'var', 
        name: 'SearchPattern', 
        value :{$: 'editable-primitive', type: 'string' }
      }, 
      {$: 'group.itemlist-container' }
    ]
  }
})

jb.component('studio.open-new-page', {
  type: 'action', 
  impl :{$: 'open-dialog', 
    modal: true, 
    title: 'New Page', 
    style :{$: 'dialog.dialog-ok-cancel', 
      features :{$: 'dialog-feature.autoFocusOnFirstInput' }
    }, 
    content :{$: 'group', 
      controls: [
        {$: 'editable-text', 
          databind: '%$dialogData/name%', 
          features :{$: 'feature.onEnter', 
            action :{$: 'closeContainingPopup' }
          }, 
          title: 'page name', 
          style :{$: 'editable-text.mdl-input' }
        }
      ], 
      features :{$: 'css.padding', top: '14', left: '11' }, 
      style :{$: 'group.div' }
    }, 
    onOK: function (ctx) {
        var id = ctx.exp('%$studio/project%.%$dialogData/name%');
        var profile = {
            type: 'control',
            impl: { $: 'group', title: ctx.exp('%$dialogData/name%') }
        };
        model.modify(model.newComp, id, { profile: profile }, ctx);
        ctx.run({ $: 'write-value', to: '%$studio/page%', value: '%$dialogData/name%' });
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


})()