chrome.devtools.panels.create("jb logs",
    "FontPicker.png",
    "jb-logs.html",
    function(panel) {
      console.log('create panel')
    }
)

// chrome.devtools.panels.create("jb studio",
//     "FontPicker.png",
//     "jb-logs.html",
//     function(panel) {
//       // code invoked on panel creation
//     }
// )

chrome.devtools.panels.elements.createSidebarPane("jbComp",
    function(sidebar) {
      sidebar.setPage("jb-comp.html");
      sidebar.setHeight("8ex");
})