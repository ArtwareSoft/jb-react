// var { studioDialogFeature, runTransaction  } = jb.ns('studioDialogFeature')

jb.component('dialog.editSourceStyle', {
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', id},[
				h('div',{class: 'dialog-title noselect'},title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button.dialog-close', {onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
				h('div',{class: 'dialog-buttons'},[
//					...(cmp.dialog.gotoEditor ? [h('button',{class: 'mdc-button', onclick: 'dialog.gotoEditor' },'goto editor')] : []),
					h('button',{class: 'mdc-button', onclick: 'refresh' },'refresh'),
					h('button',{class: 'mdc-button', onclick: 'dialogCloseOK' },'ok'),
				].filter(x=>x) ),
			]),
    css: `{ position: fixed;
						width: %$width%px;
						min-height: %$height%px;
						overflow: auto;
						border-radius: 4px;
						padding: 0 12px 12px 12px;
						box-shadow: 0 0px 9px var(--jb-dropdown-shadow)
				}
				>.dialog-title { background: none; padding: 10px 5px; }
				>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }
				>.dialog-close {
						position: absolute;
						cursor: pointer;
						right: 4px; top: 4px;
						font: 21px sans-serif;
						border: none;
						color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); 
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-menu {
						position: absolute;
						cursor: pointer;
						right: 24px; top: 0;
						font: 21px sans-serif;
						border: none;
						color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); 
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }
				>.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle({id: '%$id%', useSessionStorage: true}),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
//      studioDialogFeature.refreshTitle(),
      studioDialogFeature.studioPopupLocation()
    ]
  })
})

jb.component('studio.dialogParticleStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
    css: `{ position: fixed; z-index: 6000 !important; width: 20px; height: 20px;}
	  >* { display: inline-block; }`
  })
})


jb.component('dialog.showSourceStyle', {
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 600},
    {id: 'height', as: 'number', defaultValue: 600}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', id},[
				  h('div',{class: 'dialog-title noselect'},title),
				  h('button.dialog-close', {onclick: 'dialogClose' },'×'),
				  h('div',{class: 'jb-dialog-content-parent stretchedToMargin'},h(contentComp)),
			  ]),
    css: `{ position: fixed;
						  width: %$width%px;
						  height: %$height%px;
						  overflow: auto;
						  border-radius: 4px;
						  padding: 0 12px 12px 12px;
						  box-shadow: 0 0px 9px var(--jb-dropdown-shadow)
				  }
				  >.dialog-title { background: none; padding: 10px 5px; }
				  >.jb-dialog-content-parent { padding: 0; overflow-y: hidden; overflow-x: hidden; top: 40px}
				  >.dialog-close {
						  position: absolute;
						  cursor: pointer;
						  right: 4px; top: 4px;
						  font: 21px sans-serif;
						  border: none;
						  color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); 
						  font-weight: 700;
						  opacity: .2;
				  }
				  >.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle({id: '%$id%', useSessionStorage: true}),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
      studioDialogFeature.studioPopupLocation(),
      dialogFeature.resizer(true)
    ]
  })
})

jb.component('studioDialogFeature.studioPopupLocation', {
  type: 'dialog-feature',
  impl: templateModifier( ({},{vdom}) => { 
    const id = (vdom.getAttribute('id')||'').replace(/\s/g,'_')
    if (id && !jb.utils.sessionStorage(id))
      vdom.addClass(`default-location ${id}`)
  })
})

jb.component('studioDialogFeature.refreshTitle', {
  type: 'dialog-feature',
  impl: frontEnd.flow(watchableComps.scriptChange(), rx.takeUntil( '%$cmp.destroyed%' ), sink.FEMethod('recalcTitle'))
})

jb.component('studio.codeMirrorMode', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		if (path.match(/css/))
			return 'css';
		if (path.match(/template/) || path.match(/html/))
			return 'htmlmixed';
		return 'javascript'
	}
})

jb.component('studio.openMultilineEdit', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    style: dialog.studioMultilineEdit(),
    content: editableText({
      databind: tgp.ref('%$path%'),
      style: editableText.codemirror({mode: studio.codeMirrorMode('%$path%')})
    })
  })
})

jb.component('dialog.studioFloating', {
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', id},[
				h('div',{class: 'dialog-title noselect'},title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'}, h(cmp.menuComp)): '',
				h('button.dialog-close', {onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
			]),
    css: `{ position: fixed;
						width: %$width%px;
						min-height: %$height%px;
						overflow: auto;
						border-radius: 4px;
						padding: 0 12px 12px 12px;
						box-shadow: 0 0px 9px var(--jb-dropdown-shadow)
				}
				>.dialog-title { background: none; padding: 10px 5px; }
				>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }
				>.dialog-close {
						position: absolute;
						cursor: pointer;
						right: 4px; top: 4px;
						font: 21px sans-serif;
						border: none;
						color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); 
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-menu {
						position: absolute;
						cursor: pointer;
						right: 24px; top: 4px;
						font: 21px sans-serif;
						border: none;
						color: var(--jb-menu-fg); text-shadow: 0 1px 0 var(--jb-menu-bg); 
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle({id: '%$id%', useSessionStorage: true}),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
//      studioDialogFeature.refreshTitle(),
      studioDialogFeature.studioPopupLocation()
    ]
  })
})

jb.component('studio.openResponsivePhonePopup', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    style: dialog.popup(),
    content: group({
      layout: layout.vertical('10'),
      controls: [
        group({
          title: 'buttons',
          layout: layout.horizontal('10'),
          controls: [
            button({
              title: 'phone',
              action: runTransaction({actions:                [
                  writeValue('%$studio/preview/width%', '400'),
                  writeValue('%$studio/preview/height%', '600')
                ]
              }),
              style: button.mdcFloatingAction(true),
              features: feature.icon({icon: 'phone_android', title: '', type: 'mdc'})
            }),
            button({
              title: 'tablet',
              action: runActions(
                writeValue('%$studio/preview/width%', '600'),
                writeValue('%$studio/preview/height%', '850')
              ),
              style: button.mdcFloatingAction(true),
              features: feature.icon({icon: 'tablet', title: '', type: 'mdc'})
            }),
            button({
              title: 'desktop',
              action: runActions(
                writeValue('%$studio/preview/width%', '1280'),
                writeValue('%$studio/preview/height%', '520')
              ),
              style: button.mdcFloatingAction(true),
              features: feature.icon({icon: 'desktop_mac', type: 'mdc'})
            }),
            button({
              title: 'full screen',
              action: runActions(
                writeValue('%$studio/preview/width%', '100%'),
                writeValue('%$studio/preview/height%', '100%')
              ),
              style: button.mdcFloatingAction(true),
              features: feature.icon({icon: 'fullscreen', type: 'mdc'})
            })
          ],
          features: css.padding({top: '7', left: '4', right: '4'})
        }),
        // group({
        //   title: 'Zoom',
        //   style: propertySheet.titlesAbove({}),
        //   controls: [
        //     editableNumber({
        //       databind: '%$studio/preview/zoom%',
        //       title: 'zoom',
        //       style: editableNumber.mdcSliderNoText({}),
        //       symbol: '',
        //       min: '1',
        //       max: '20',
        //       displayString: '%%px'
        //     })
        //   ],
        //   features: css.margin({left: '10', bottom: '10'})
        // })
      ],
    }),
    title: 'responsive'
  })
})


// style: group.tabs(),
// controls: dynamicControls({
//   controlItems: asIs(
//     [
//       {
//         width: {min: 320, max: 479, default: 400},
//         height: {min: 300, max: 700, default: 600},
//         id: 'phone'
//       },
//       {
//         width: {min: 480, max: 1024, default: 600},
//         height: {min: 300, max: 1440, default: 850},
//         id: 'tablet'
//       },
//       {
//         width: {min: 1024, max: 2048, default: 1280},
//         height: {min: 300, max: 1440, default: 520},
//         id: 'desktop'
//       }
//     ]
//   ),
