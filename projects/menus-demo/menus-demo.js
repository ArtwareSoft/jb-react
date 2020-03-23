jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('menusDemo.main', {
  type: 'control',
  impl: group({
    
  })
})

jb.component('menusDemo.pulldown', {
  type: 'control',
  impl: menu.control({
    menu: menu.menu({
      options: [
        menu.menu({
          title: 'File',
          options: [
            menu.action({
              title: 'Open',
              action: openDialog({content: group({}), title: 'open'}),
              shortcut: 'o',
              showCondition: true
            }),
            menu.action({title: 'Save', showCondition: true})
          ]
        }),
        menu.menu({
          title: 'Edit',
          options: [
            menu.action({title: 'Copy', showCondition: true}),
            menu.action({title: 'Paste', showCondition: true}),
            menu.separator(),
            menu.menu({
              title: 'Change case',
              options: [
                menu.action({title: 'uppercase', showCondition: true}),
                menu.action({title: 'lowercase', showCondition: true})
              ]
            })
          ]
        })
      ]
    }),
    style: {'$': 'menu-style.pulldown'}
  })
})

jb.component('menusDemo.popup', {
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'open menu',
        action: menu.openContextMenu({
          menu: menu.menu({
            title: 'Edit',
            options: [
              menu.action({
                title: 'Copy',
                action: openDialog({content: group({}), title: 'hello'}),
                shortcut: 'c',
                showCondition: true
              }),
              menu.action({title: 'Paste', showCondition: true}),
              menu.menu({
                title: 'Change case',
                options: [
                  menu.action({title: 'uppercase', showCondition: true}),
                  menu.action({title: 'lowercase', showCondition: true})
                ]
              })
            ]
          })
        }),
        style: button.mdc()
      })
    ]
  }),
  controls: [
    button({title: 'click me', style: button.mdc()})
  ],
  title: ''
})

jb.component('menusDemo.dynamic', {
  type: 'control',
  impl: menu.control({
    menu: menu.menu({
      options: {
        '$': 'menu.dynamic-options',
        items: '%$people%',
        genericOption: menu.menu({
          title: pipeline('%$menuData/name%', {'$': 'to-uppercase', text: '%%'}),
          options: [
            menu.action({title: '%$menuData/name% name', showCondition: true}),
            menu.action({title: 'show address', showCondition: true})
          ]
        })
      }
    }),
    style: {'$': 'menu-style.pulldown'}
  })
})
