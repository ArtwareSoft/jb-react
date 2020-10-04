chrome.devtools.panels.create('jb logs',
    'FontPicker.png',
    'jb-logs.html',
    function(panel) {
      console.log('create panel')
    }
)

chrome.devtools.panels.elements.createSidebarPane('card',
    function(sidebar) {
      sidebar.setPage('card.html')
      sidebar.setHeight('8ex')
})


chrome.devtools.panels.elements.createSidebarPane('jbComp',
    function(sidebar) {
      sidebar.setPage('jb-comp.html')
      sidebar.setHeight('8ex')
})
