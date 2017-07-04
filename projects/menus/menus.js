jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('menus.main', {
  type: 'control', 
  impl :{$: 'group', 
  }
})

jb.component('menus.pulldown', {
  type: 'control', 
  impl :{$: 'menu.control', 
    menu :{$: 'menu.menu', 
      options: [
        {$: 'menu.menu', 
          title: 'File', 
          options: [
            {$: 'menu.action', title: 'Open', showCondition: true }, 
            {$: 'menu.action', title: 'Save', showCondition: true }
          ]
        }, 
        {$: 'menu.menu', 
          title: 'Edit', 
          options: [
            {$: 'menu.action', title: 'Copy', showCondition: true }, 
            {$: 'menu.action', title: 'Paste', showCondition: true }, 
            {$: 'menu.separator' }, 
            {$: 'menu.menu', 
              title: 'Change case', 
              options: [
                {$: 'menu.action', title: 'uppercase', showCondition: true }, 
                {$: 'menu.action', title: 'lowercase', showCondition: true }
              ]
            }
          ]
        }
      ]
    }, 
    style :{$: 'menu-style.pulldown' }
  }
})

jb.component('menus.popup', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'button', 
        title: 'open menu', 
        action :{$: 'menu.open-context-menu', 
          menu :{$: 'menu.menu', 
            title: 'Edit', 
            options: [
              {$: 'menu.action', title: 'Copy', showCondition: true }, 
              {$: 'menu.action', title: 'Paste', showCondition: true }, 
              {$: 'menu.menu', 
                title: 'Change case', 
                options: [
                  {$: 'menu.action', title: 'uppercase', showCondition: true }, 
                  {$: 'menu.action', title: 'lowercase', showCondition: true }
                ]
              }
            ]
          }
        }, 
        style :{$: 'button.mdl-raised' }
      }
    ]
  }, 
  controls: [
    {$: 'button', 
      title: 'click me', 
      style :{$: 'button.mdl-raised' }
    }
  ], 
  title: ''
})

jb.component('menus.dynamic', {
  type: 'control', 
  impl :{$: 'menu.control', 
    menu :{$: 'menu.menu', 
      options :{$: 'menu.dynamic-options', 
        items: '%$people%', 
        genericOption :{$: 'menu.menu', 
          showCondition: true, 
          title :{
            $pipeline: [
              '%$menuData/name%', 
              {$: 'to-uppercase', text: '%%' }
            ]
          }, 
          options: [
            {$: 'menu.action', 
              title: '%$menuData/name% name', 
              showCondition: true
            }, 
            {$: 'menu.action', title: 'show address', showCondition: true }
          ]
        }
      }
    }, 
    style :{$: 'menu-style.pulldown' }
  }
})
