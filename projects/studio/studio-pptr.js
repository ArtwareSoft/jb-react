jb.component('studio.pptrToolbar', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'expanded', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: [
      controlWithCondition('%val.$%==pptr.session%', text('run icon')),
      controlWithCondition(
        tgp.isOfType('%$path%', 'pptr'),
        text('runninng indicator')
      ),
      text('')
    ],
    features: [
      group.firstSucceeding(),
      studio.watchPath({path: '%$path%', includeChildren: 'yes', recalcVars: true}),
      variable({name: 'paramDef', value: tgp.paramDef('%$path%')}),
      variable({name: 'val', value: tgp.val('%$path%')})
    ]
  })
})
