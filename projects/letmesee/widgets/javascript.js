aa_lmcApi_registerPlugin({
  id: 'javascript',
  title: 'javascript',
  agent: {
    js(object,settingsRef) {
      var editor_elem = object.el
      if (!editor_elem) return
      editor_elem.value = settingsRef()
      editor_elem.addEventListener("blur", () => settingsRef(editor_elem.value))
    },
    html: '<textarea id="scriptEditor" rows="10" cols="80"/>',
    css: '#this { }',
    defaultWidgetData: 'enter your script here',
    files: []
},
  visitor: {
    js(object,data) {
      if (!data || typeof data != 'string') return
      try {
        eval(data)
      } catch(e) {}
    },
    html: '',
    css: '',
    files: []
},   
})

aa_lmcWidget_javascript = true