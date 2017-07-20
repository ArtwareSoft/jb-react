jb.component('card', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'subTitle', as: 'string' },
    { id: 'text', as: 'string' },
    { id: 'image', type: 'image', essential: true, defaultValue:{$: 'image'} },
    { id: 'top-button', type: 'button' },
    { id: 'actions', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true, defaultValue: [] },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})
