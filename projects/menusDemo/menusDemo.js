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
  impl: menu({
    menu: menu({
      options: [
        menu({
          title: 'File',
          options: [
            option({
              title: 'Open',
              action: openDialog({content: group({}), title: 'open'}),
              shortcut: 'o',
              showCondition: true
            }),
            option({title: 'Save', showCondition: true})
          ]
        }),
        menu({
          title: 'Edit',
          options: [
            option({title: 'Copy', showCondition: true}),
            option({title: 'Paste', showCondition: true}),
            menu.separator(),
            menu({
              title: 'Change case',
              options: [
                option({title: 'uppercase', showCondition: true}),
                option({title: 'lowercase', showCondition: true})
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
              option({
                title: 'Copy',
                action: openDialog({content: group({}), title: 'hello'}),
                icon: icon({icon: 'ContentCopy', type: 'mdi'}),
                shortcut: 'c',
                showCondition: true
              }),
              option({
                title: 'Paste',
                icon: icon({icon: 'ContentPaste', type: 'mdi'}),
                showCondition: true
              }),
              menu({
                title: 'Change case',
                options: [
                  option({title: 'uppercase', showCondition: true}),
                  option({title: 'lowercase', showCondition: true})
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
  impl: menu({
    menu: menu({
      options: menu.dynamicOptions(
        '%$people%',
        menu({
          title: pipeline('%name%', toUpperCase()),
          options: [
            option({title: '%name%', showCondition: true}),
            option({title: 'show address', showCondition: true})
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
    controls: menu(
      menu({options: [option({icon: icon('alarm')}), option({icon: icon('build')})]}),
      menuStyle.toolbar()
    )
  })
})
