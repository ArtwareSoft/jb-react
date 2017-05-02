jb.component('studio.open-project', {
  type: 'action', 
  impl :{$: 'open-dialog', 
    title: 'Open project', 
    style :{$: 'dialog.dialog-ok-cancel', okLabel: 'OK', cancelLabel: 'Cancel' }, 
    content :{$: 'studio.choose-project' }
  }
})


jb.component('studio.choose-project', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'itemlist-with-find', 
    controls: [
      {$: 'editable-text', 
        title: 'search', 
        databind: '%$studio/project_pattern%', 
        style :{$: 'editable-text.mdl-input', width: '260' }
      }, 
      {$: 'itemlist', 
        items :{
          $pipeline: [
            '%$projects%', 
            {$: 'search-filter', pattern: '%$studio/project_pattern%' }
          ]
        }, 
        controls :{$: 'button', 
          title: '%$project%', 
          action :{$: 'runActions', 
            actions :{$: 'runActions', 
              actions: [
                {$: 'goto-url', 
                  url: '/project/studio/%$project%', 
                  target: 'new tab'
                }, 
                {$: 'close-containing-popup' }
              ]
            }
          }, 
          style :{$: 'button.mdl-flat-ripple' }, 
          features :{$: 'css', css: '!button { text-align: left; width: 250px }' }
        }, 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'project'
      }
    ], 
    features: [
      {$: 'group.wait', 
        for :{$: 'http.get', url: '/?op=projects', json: 'true' }, 
        resource: 'projects', 
        mapToResource: '%projects%'
      }, 
      {$: 'css.padding', top: '15', left: '15' }
    ]
  }
})

