jb.resource('studio',{});

jb.component('studio.all', {
  type: 'control',
  impl :{$: 'group',
    style :{$: 'layout.vertical', spacing: '0' },
    controls: [
      {$:'studio.top-bar' },
      {$: 'studio.preview-widget', width: 1280, height: 520,
        features :{$: 'watch-ref', ref: '%$studio/page%'}
      },
      {$: 'studio.pages' },
    ],
    features: [
      {$: 'group.data', data: '%$studio/project%', watch: true },
      {$: 'feature.init',
        action :[
            {$: 'studio.fix-invalid-url'},
            {$: 'url-history.map-url-to-resource',
          params: ['project', 'page', 'profile_path'],
          resource: 'studio', base: 'studio',
//          onUrlChange :{$: 'studio.refresh-preview' }
        }]
      }
    ]
  }
})

jb.component('studio.top-bar', {
  type: 'control',
  impl :{$: 'group',
    title: 'top bar',
    style :{$: 'layout.horizontal', spacing: '3' },
    controls: [
      {$: 'image',
        url: '/projects/studio/css/jbartlogo.png',
        imageHeight: '60',
        units: 'px',
        style :{$: 'image.default' },
        features :{$: 'css.margin', top: '15', left: '5' }
      },
      {$: 'group',
        title: 'title and menu',
        style :{$: 'layout.vertical', spacing: '17' },
        controls: [
          {$: 'label',
            title: 'message',
            style :{$: 'label.studio-message' }
          },
          {$: 'label',
            title :{$: 'replace', find: '_', replace: ' ', text: '%$studio/project%' },
            style :{$: 'label.span' },
            features :{$: 'css', css: '{ font: 20px Arial; margin-left: 6px; }' }
          },
          {$: 'group',
            title: 'menu and toolbar',
            style :{$: 'layout.flex', align: 'space-between' },
            controls: [
              {$: 'menu.control',
                menu :{$: 'studio.main-menu' },
                style :{$: 'menu-style.pulldown' },
                features :{$: 'css.height', height: '30' }
              },
              {$: 'studio.toolbar' },
              {$: 'studio.search-component',
                features :{$: 'css.margin', top: '-10' }
              }
            ],
            features: [{$: 'css.width', width: '1040' }]
          }
        ],
        features :{$: 'css', css: '{ padding-left: 18px; width: 100%; }' }
      }
    ],
    features :{$: 'css', css: '{ height: 90px; border-bottom: 1px #d9d9d9 solid}' }
  }
})

jb.component('studio.pages', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'pages', 
    style :{$: 'layout.horizontal' }, 
    controls: [
      {$: 'button', 
        title: 'new page', 
        action :{$: 'studio.open-new-page' }, 
        style :{$: 'button.mdl-icon-12', icon: 'add' }, 
        features :{$: 'css', css: '{margin: 5px}' }
      }, 
      {$: 'itemlist', 
        items :{$: 'studio.project-pages' }, 
        controls :{$: 'label', 
          title :{$: 'extract-suffix', separator: '.' }, 
          features :{$: 'css.class', class: 'studio-page' }
        }, 
        style :{$: 'itemlist.horizontal' }, 
        features: [
          {$: 'itemlist.selection', 
            databind: '%$studio/page%', 
            onSelection :{$: 'write-value', 
              to: '%$studio/profile_path%', 
              value: '{%$studio/project%}.{%$studio/page%}'
            }, 
            autoSelectFirst: true
          }, 
          {$: 'css', 
            css: `{ list-style: none; padding: 0;
              margin: 0; margin-left: 20px; font-family: "Arial"}
                  >* { list-style: none; display: inline-block; padding: 0 5px; font-size: 12px; border: 1px solid transparent; cursor: pointer;}
                  >* label { cursor: inherit; }
                  >*.selected { background: #fff;  border: 1px solid #ccc;  border-top: 1px solid transparent; color: inherit;  }`
          }
        ]
      }
    ], 
    features: [
      {$: 'css', 
        css: '{ background: #F5F5F5; position: absolute; bottom: 0; left: 0; width: 100%; border-top: 1px solid #aaa}'
      }, 
      {$: 'group.wait', 
        for :{$: 'studio.wait-for-preview-iframe' }, 
        loadingControl :{ $label: '...' }
      }, 
      {$: 'studio.watch-components' }
    ]
  }
})

jb.component('studio.currentProfilePath', {
	impl: { $firstSucceeding: [ '%$simulateProfilePath%','%$studio/profile_path%', '%$studio/project%.%$studio/page%'] }
})

jb.component('studio.is-single-test', {
	type: 'boolean',
	impl: ctx => {
		var page = location.href.split('/')[6];
		var profile_path = location.href.split('/')[7];
		return page == 'tests' && profile_path && profile_path.slice(-6) != '.tests';
  	}
})

jb.component('studio.cmps-of-project', {
  type: 'data',
  params: [
    { id: 'project', as: 'string'}
  ],
  impl: (ctx,prj) =>
      jb.studio.previewjb ? Object.getOwnPropertyNames(jb.studio.previewjb.comps)
              .filter(id=>id.split('.')[0] == prj) : []
})

jb.component('studio.project-pages', {
	type: 'data',
  impl: {$pipeline: [
          {$: 'studio.cmps-of-project', project: '%$studio/project%' },
          { $filter: {$: 'studio.is-of-type', type: 'control', path: '%%'} },
          {$: 'suffix', separator: '.' }
      ]}
})

jb.component('studio.main-menu', {
  type: 'menu.option',
  impl :{$: 'menu.menu',
    title: 'main',
    options: [
      {$: 'menu.menu',
        title: 'File',
        options: [
          {$: 'menu.action',
            title: 'New Project',
            action :{$: 'studio.open-new-project' },
            icon: 'new'
          },
          {$: 'menu.action',
            title: 'Open Project ...',
            action :{$: 'studio.open-project' }
          },
          {$: 'menu.action',
            title: 'Save',
            action :{$: 'studio.save-components' },
            icon: 'save',
            shortcut: 'Ctrl+S'
          },
          {$: 'menu.action',
            title: 'Force Save',
            action :{$: 'studio.save-components', force: true },
            icon: 'save'
          },
          {$: 'menu.action',
            title: 'Source ...',
            action :{$: 'studio.open-source-dialog' }
          }
        ]
      },
      {$: 'menu.menu',
        title: 'View',
        options: [
          {$: 'menu.action',
            title: 'Refresh Preview',
            action :{$: 'studio.refresh-preview' }
          },
          {$: 'menu.action',
            title: 'Redraw Studio',
            action :{$: 'studio.redraw-studio' }
          },
          {$: 'menu.action',
            title: 'Edit source',
            action :{$: 'studio.edit-source' }
          },
          {$: 'menu.action',
            title: 'Outline',
            action :{$: 'studio.open-control-tree' }
          },
          {$: 'menu.action',
            title: 'jbEditor',
            action :{$: 'studio.openjbEditor' }
          }
        ]
      },
      {$: 'studio.insert-control-menu' },
      {$: 'studio.data-resource-menu' }
    ],
    style :{$: 'menu.pulldown' },
    features :{$: 'css.margin', top: '3' }
  }
})
