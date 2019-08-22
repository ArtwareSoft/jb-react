jb.component('dialog.studio-jb-editor-popup',  /* dialog_studioJbEditorPopup */ {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h('button',{class: 'dialog-close', onclick: _=> cmp.dialogClose() },'×'),
        h(state.contentComp),
      ]),
    css: "{ background: #fff; position: absolute }\n        >.dialog-close {\n            position: absolute; \n            cursor: pointer; \n            right: 0;\n            font: 21px sans-serif; \n            border: none; \n            background: transparent; \n            color: #000; \n            text-shadow: 0 1px 0 #fff; \n            font-weight: 700; \n            opacity: .2;\n        }\n        >.dialog-close:hover { opacity: .5 }\n        ",
    features: [
      dialogFeature_maxZIndexOnClick(),
      dialogFeature_closeWhenClickingOutside(),
      dialogFeature_nearLauncherPosition({}),
      dialogFeature_uniqueDialog('studio-jb-editor-popup'),
      css_boxShadow({
        blurRadius: 5,
        spreadRadius: 0,
        shadowColor: '#000000',
        opacity: 0.75,
        horizontal: 0,
        vertical: 0
      })
    ]
  })
})

jb.component('dialog.studio-suggestions-popup',  /* dialog_studioSuggestionsPopup */ {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h(state.contentComp),
      ]),
    css: '{ background: #fff; position: absolute; padding: 3px 5px }',
    features: [
      dialogFeature_maxZIndexOnClick(),
      dialogFeature_closeWhenClickingOutside(),
      dialogFeature_cssClassOnLaunchingElement(),
      dialogFeature_nearLauncherPosition({}),
      dialogFeature_uniqueDialog('studio-suggestions-popup'),
      css_boxShadow({
        blurRadius: 5,
        spreadRadius: 0,
        shadowColor: '#000000',
        opacity: 0.75,
        horizontal: 0,
        vertical: 0
      })
    ]
  })
})
