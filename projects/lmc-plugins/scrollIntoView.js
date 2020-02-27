aa_lmcApi_registerPlugin({
  id: 'scrollIntoView',
  title: 'scroll Into View',
  editor: {
    js(object,settingsRef) {
      try {
        var widgetData = JSON.parse(settingsRef() || '{}')
      } catch(e) {
        var widgetData = {}
        settingsRef(JSON.stringify(widgetData))
      }
      ['textToSearch','selector'].forEach(id=>{
        var elem = object.el.querySelector('#'+id)
        if (!elem) return
        elem.value = settingsRef()[id] || ''
        elem.addEventListener("blur", () => {
          widgetData[id] = elem.value
          settingsRef(JSON.stringify(widgetData))
        })
      })
    },
    html: `<div>
      <label for="textToSearch">Text to Search</label><input type="text" id="textToSearch"><br>
      <label for="textToSearch">Css Selector (div)</label><input type="text" id="selector">
    </div>
    `,
    css: `#this { display: flex; flex-direction: column; }
      #this>input { width: 340px; height: 26px; border: 1px solid #BDC7D8; background: #fff; font-size: 18px; padding: 6px 6px 2px 6px; font-family: arial;}
      #this>label { color: #666; font-size: 14px;}
    `,
    defaultWidgetData: '{ "selector": "div", "textToSearch": "my text" }',
    files: []
},
  runtime: {
    js(object,data) {
      var widgetData = JSON.parse(data)
      if (!widgetData) return
      var selector = widgetData.selector || 'div'
      setTimeout(() => 
            Array.from(document.querySelectorAll(selector))
                .filter(p=>p.innerHTML.indexOf(widgetData.textToSearch) != -1).slice(0,1)
                .forEach(p=>p.scrollIntoView())
        ,1)
    },
    html: '',
    css: '',
    files: []
},   
})

aa_lmcWidget_scrollIntoView = true