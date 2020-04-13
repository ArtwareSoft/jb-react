jb.ns('helloWorld')

jb.component('dataResource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homer Simpson1',
      age: 42,
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: 38,
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: 12, male: false, children: []}
  ]
})

jb.component('dataResource.room', { /* dataResource.room */
  passiveData: ''
})

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical('3'),
    controls: [
      button({
        title: 'add',
        action: menu.openContextMenu({
          menu: menu.menu({
            options: [
              menu.action({title: 'add', icon: icon('account_balance')}),
              menu.action({title: 'add', icon: icon('account_balance')}),
              menu.action({title: 'add', icon: icon('account_balance')})
            ]
          }),
          menuStyle: menuStyle.toolbar()
        }),
        style: button.mdcIcon(undefined, '16'),
        features: [feature.icon({icon: 'add', size: '12'})]
      }),
      button({
        title: 'remove',
        style: button.mdcIcon(undefined, '16'),
        features: [feature.icon({icon: 'remove', size: '12'})]
      }),
      menu.control({
        menu: menu.menu({
          options: [
            menu.action({title: 'add', icon: icon('account_balance')}),
            menu.action({title: 'add', icon: icon('account_balance')}),
            menu.action({title: 'add', icon: icon('account_balance')})
          ]
        }),
        style: menuStyle.toolbar()
      })
    ]
  })
})

jb.component('helloWorld.f1', {
  type: 'data',
  impl: pipeline(
    'dsdsds',
    'bbbb'
  ),
  testData: 'asdsaasd asdas'
})

jb.component('dataResource.projectSettings', {
  watchableData: {
    project: 'itemlists',
    libs: 'common,ui-common,material,dragula,md-icons',
    jsFiles: ['file23.js', 'file.js', 'file.js']
  }
})

jb.component('dataResource.studio', {
  watchableData: {
    libToAdd: 'inner-html',
    libsAsArray: ['common', 'ui-common', 'material', 'dragula', 'md-icons']
  }
})
