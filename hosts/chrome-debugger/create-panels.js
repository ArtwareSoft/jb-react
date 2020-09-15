chrome.devtools.panels.create("jb logs",
    "FontPicker.png",
    "jb-logs.html",
    function(panel) {
      console.log('create panel',panel,self)
      panel.onShown.addListener(() => {
        chrome.runtime.sendMessage({shown: "shown"})
        console.log('shown',panel,self,self.jb)
      })
      // code invoked on panel creation
    }
)

// chrome.devtools.panels.create("jb studio",
//     "FontPicker.png",
//     "jb-logs.html",
//     function(panel) {
//       // code invoked on panel creation
//     }
// )

// chrome.devtools.panels.elements.createSidebarPane("jb Properties",
//     function(sidebar) {
//       sidebar.setPage("jb-logs.html");
//       sidebar.setHeight("8ex");
// })