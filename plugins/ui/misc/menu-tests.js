component('menuTest.menu1', {
    type: 'menu.option',
  impl: menu('main', {
    options: [
      menu('File', {
        options: [
          option('New', () => alert(1)),
          option('Open'),
          menu('Bookmarks', { options: [option('Google'), option('Facebook')] }),
          menu('Friends', { options: [option('Dave'), option('Dan')] })
        ]
      }),
      menu('Edit', { options: [option('Copy'), option('Paste')] }),
      menu.dynamicOptions(list(1,2,3), option('dynamic-%%'))
    ]
  })
})

component('menuTest.toolbar', {
  impl: uiTest({
    control: menu({
      menu: menu({
        options: [
          option('select', () => console.log('select'), { icon: icon('Selection', { type: 'mdi' }) })
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