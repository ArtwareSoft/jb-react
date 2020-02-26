aa_lmcApi_registerPlugin({
  id: 'javascript',
  title: 'javascript',
  editor: {
    js(object,settingsRef) {
      var editor_elem = object.el.querySelector('#scriptEditor')
      if (!editor_elem) return
      editor_elem.value = settingsRef()
      editor_elem.addEventListener("blur", () => settingsRef(editor_elem.value))
    },
    html: '<textarea id="scriptEditor" rows="10" cols="80"/>',
    css: '#this { }',
    defaultWidgetData: 'enter your script here',
    files: []
},
  runtime: {
    js(object,data) {
      eval(data)
    },
    html: '',
    css: '',
    files: []
},   
})

aa_lmcWidget_javascript = true