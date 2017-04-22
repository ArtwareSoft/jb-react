jb.type('sidenav.style');

jb.component('sidenav', {
  type: 'control', category: 'group:50',
  params: [
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'sidenav.style', defaultValue: { $: 'sidenav.md' }, essential: true , dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jbart.comps.group.impl(ctx)
})
