
component('probeUI.probeLogView', {
  description: 'using probeResult variable',
  type: 'control',
  params: [
    {id: 'logs', defaultValue: '%%'}
  ],
  impl: group(itemlist({ items: '%$logs/logs' }), button('click me'))
})