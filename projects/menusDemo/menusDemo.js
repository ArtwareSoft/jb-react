component('dataResource.people', {
  passiveData: [
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]
})

component('menusDemo.main', {
  type: 'control',
  impl: group()
})

component('menusDemo.pulldown', {
  type: 'control',
  impl: menu.control({
    menu: menu({
      options: [
        menu({
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
        menu({
          title: 'Edit',
          options: [
            menu.action({title: 'Copy', showCondition: true}),
            menu.action({title: 'Paste', showCondition: true}),
            menu.separator(),
            menu({
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
    style: menuStyle.pulldown()
  })
})

component('menusDemo.popup', {
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'open menu',
        action: menu.openContextMenu({
          menu: menu({
            title: 'Edit',
            options: [
              menu.action({
                title: 'Copy',
                action: openDialog({content: group({}), title: 'hello'}),
                icon: icon({icon: 'ContentCopy', type: 'mdi'}),
                shortcut: 'c',
                showCondition: true
              }),
              menu.action({
                title: 'Paste',
                icon: icon({icon: 'ContentPaste', type: 'mdi'}),
                showCondition: true
              }),
              menu({
                title: 'Change case',
                options: [
                  menu.action({title: 'uppercase', showCondition: true}),
                  menu.action({title: 'lowercase', showCondition: true})
                ],
                icon: icon({icon: 'text_format', type: 'mdc'})
              })
            ],
            icon: icon({icon: 'edit', type: 'mdc'})
          }),
          popupStyle: dialog.contextMenuPopup({toolbar: true}),
          menuStyle: menuStyle.toolbar()
        }),
        style: button.mdcIcon(icon({icon: 'menu', type: 'mdc', scale: '1'})),
        features: css.transformScale({x: '0.8', y: '0.8'})
      })
    ]
  }),
  controls: [
    button({title: 'click me', style: button.mdc()})
  ],
  title: ''
})

component('menusDemo.dynamic', {
  type: 'control',
  impl: menu.control({
    menu: menu({
      options: menu.dynamicOptions(
        '%$people%',
        menu({
          title: pipeline('%name%', toUpperCase()),
          options: [
            menu.action({title: '%name%', showCondition: true}),
            menu.action({title: 'show address', showCondition: true})
          ]
        })
      )
    }),
    style: menuStyle.pulldown({}),
    features: [css.width('300')]
  })
})

component('menusDemo.iconToolbar', {
  type: 'control',
  impl: group({
    title: '',
    controls: menu.control(
      menu({options: [menu.action({icon: icon('alarm')}), menu.action({icon: icon('build')})]}),
      menuStyle.toolbar()
    )
  })
})
