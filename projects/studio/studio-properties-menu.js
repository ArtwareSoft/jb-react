jb.component('studio.property-toolbar-feature', {
  type: 'feature', 
  params: [
    { id: 'path', as: 'string' }
  ], 
  impl :{$: 'field.toolbar', 
        toolbar :{$: 'studio.property-toolbar', path: '%$path%' } 
    }
}) 

jb.component('studio.property-toolbar', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'button', 
    title: 'more...', 
    action :{$: 'studio.open-property-menu', path: '%$path%' }, 
    style :{$: 'button.mdl-icon-12', icon: 'more_vert' }, 
    features :{$: 'css.margin', top: '5', left: '4' }
  }
})

