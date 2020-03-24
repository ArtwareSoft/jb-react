jb.component('dialog.studioJbEditorPopup', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,{contentComp},h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
        h(contentComp),
      ]),
    css: `{ background: #fff; position: absolute }
        >.dialog-close {
            position: absolute;
            cursor: pointer;
            right: 0;
            font: 21px sans-serif;
            border: none;
            background: transparent;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            font-weight: 700;
            opacity: .2;
            z-index: 1000
        }
        >.dialog-close:hover { opacity: .5 }
        `,
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.nearLauncherPosition({}),
      dialogFeature.uniqueDialog('studio-jb-editor-popup'),
      css.boxShadow({
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

jb.component('studio.nearLauncherPosition', {
  type: 'dialog-feature',
  impl: dialogFeature.nearLauncherPosition({
    offsetLeft: (ctx,{cursorCoord}) => cursorCoord && cursorCoord.left || 0,
    offsetTop: (ctx,{cursorCoord}) => cursorCoord && cursorCoord.top || 0
  })
})

jb.component('dialog.studioSuggestionsPopup', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h(state.contentComp),
      ]),
    css: '{ background: #fff; position: absolute; padding: 3px 5px }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({}),
      dialogFeature.uniqueDialog('studio-suggestions-popup'),
      css.boxShadow({
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
