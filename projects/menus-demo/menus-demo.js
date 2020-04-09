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
    style: menuStyle.pulldown()
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
                icon: icon({icon: 'ContentCopy', type: 'mdi'}),
                shortcut: 'c',
                showCondition: true
              }),
              menu.action({
                title: 'Paste',
                icon: icon({icon: 'ContentPaste', type: 'mdi'}),
                showCondition: true
              }),
              menu.menu({
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
      }),
      button({
        title: 'click me',
        style: button.mdcIcon(
          icon({
            icon: '3d_rotation',
            scale: '',
            style: icon.material(),
            features: css('transform: translate(10px,0px) !important')
          }),
          '0.8'
        ),
        features: feature.icon({
          icon: 'more_vert',
          type: 'mdc',
          scale: '',
          features: css('transform: translate(3px,0px) !important')
        })
      }),
      button({
        title: 'more',
        style: button.mdcIcon(
          icon({
            icon: 'ArrowDownDropCircle',
            type: 'mdi',
            features: css('transform: translate(0px,10px) !important')
          })
        )
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
      options: menu.dynamicOptions({
        items: '%$people%',
        genericOption: menu.menu({
          title: pipeline('%$menuData/name%', toUpperCase()),
          options: [
            menu.action({title: '%$menuData/name% name', showCondition: true}),
            menu.action({title: 'show address', showCondition: true})
          ]
        })
      })
    }),
    style: menuStyle.pulldown()
  })
})
