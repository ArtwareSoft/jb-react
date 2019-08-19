
jb.component('studio.data-resources', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'itemlist', 
        items: '%$samples%', 
        controls: [
          {$: 'button', 
            title: '%%', 
            style :{$: 'button.mdl-flat-ripple' }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        watchItems: true, 
        itemVariable: 'item'
      }, 
      {$: 'button', 
        title: 'add resource', 
        style :{$: 'button.mdl-icon', icon: 'add', size: 20 }
      }, 
      {$: 'group', 
        style :{$: 'group.section' }, 
        controls: [
          {$: 'itemlist', 
            items :{$: 'list', items: ['1', '2', '3'] }, 
            style :{$: 'itemlist.ul-li' }, 
            watchItems: true, 
            itemVariable: 'item'
          }
        ], 
        features :{$: 'var', name: 'selected_in_itemlist', mutable: true }
      }
    ], 
    features :{$: 'group.wait', 
      for :{$: 'level-up.entries', 
        db :{$: 'level-up.file-db', rootDirectory: '/projects/data-tests/samples' }
      }, 
      resource: 'samples', 
      mapToResource: '%%'
    }
  }
})

jb.component('studio.open-resource', {
	type: 'action',
	params: [
	    { id: 'resource', type: 'data' },
	    { id: 'id', as: 'string' }
	], 
	impl :{$: 'open-dialog',
		title: '%$id%',
		style :{$: 'dialog.studio-floating', id: 'resource %$id%', width: 500 },
		content :{$: 'tree',
		    nodeModel :{$: 'tree.json-read-only', 
		      object: '%$resource%', rootPath: '%$id%' 
		    },
		    features: [
	   	        { $: 'css.class', class: 'jb-control-tree'},
		        { $: 'tree.selection' },
		        { $: 'tree.keyboard-selection'} 
		    ] 
		 },
	}
})

jb.component('studio.data-resource-menu', {
  type: 'menu.option', 
  impl :{$: 'menu.menu', 
    title: 'Data', 
    options: [
      {$: 'dynamic-controls', 
        controlItems :{
          $pipeline: [
            ctx => jb.studio.previewjb.resources, 
            {$: 'keys', obj: '%%' }, 
            {$: 'filter', 
              filter :{$: 'not-contains', inOrder: true, text: ':', allText: '%%' }
            }
          ]
        }, 
        genericControl :{$: 'menu.action', 
          title: '%$controlItem%', 
          action :{$: 'studio.open-resource', 
            resource: function (ctx) {
                     return jb.path(jb, ['previewWindow', 'jbart_widgets', ctx.exp('%$studio/project%'), 'resources', ctx.exp('%$controlItem%')]);
                }, 
            id: '%$controlItem%'
          }
        }
      }
    ]
  }
})

