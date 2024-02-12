
component('probeUI.probeLogView', {
  description: 'using probeResult variable',
  type: 'control',
  params: [
    {id: 'logs', defaultValue: '%%'}
  ],
  impl: button('click me')
})