component('menuTest.menu1', {
    type: 'menu.option',
  impl: menu('main', {
    options: [
      menu('File', {
        options: [
          menu.action('New', () => alert(1)),
          menu.action('Open'),
          menu('Bookmarks', { options: [menu.action('Google'), menu.action('Facebook')] }),
          menu('Friends', { options: [menu.action('Dave'), menu.action('Dan')] })
        ]
      }),
      menu('Edit', { options: [menu.action('Copy'), menu.action('Paste')] }),
      menu.dynamicOptions(list(1,2,3), menu.action('dynamic-%%'))
    ]
  })
})

component('menuTest.toolbar', {
  impl: uiTest({
    control: menu({
      menu: menu({
        options: [
          menu.action('select', () => console.log('select'), { icon: icon('Selection', { type: 'mdi' }) })
        ],
        icon: icon('undo')
      }),
      style: menuStyle.toolbar()
    }),
    expectedResult: contains('button')
  })
})

component('menuTest.pulldown', {
  impl: uiTest(menu(menuTest.menu1(), menuStyle.pulldown()), contains('File','Edit','dynamic-1','dynamic-3'))
})

component('menuTest.pulldown.inner', {
  impl: uiTest({
    control: menu(menuTest.menu1(), menuStyle.pulldown()),
    expectedResult: and(contains('Open'), contains('Bookmarks')),
    uiAction: click('[$text="File"]', 'openPopup')
  })
})

component('menuTest.pulldown.clickToOpen', {
  impl: uiTest({
    control: menu(menuTest.menu1(), menuStyle.pulldown()),
    expectedResult: and(contains('Open'), contains('Bookmarks')),
    uiAction: click('[$text="File"]', 'openPopup'),
    emulateFrontEnd: true
  })
})

component('menuTest.contextMenu', {
  impl: uiTest(menu(menuTest.menu1()), contains('File','Edit'))
})

component('menuTest.openContextMenu', {
  impl: uiTest(button('open', menu.openContextMenu(menuTest.menu1())), contains('open'))
})