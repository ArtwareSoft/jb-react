jb.ns('studioDialogFeature')

jb.component('dialog.editSourceStyle', {
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: id},[
				h('div',{class: 'dialog-title noselect'},title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
				h('div',{class: 'dialog-buttons'},[
					...(cmp.dialog.gotoEditor ? [h('button',{class: 'mdc-button', onclick: 'dialog.gotoEditor' },'goto editor')] : []),
					h('button',{class: 'mdc-button', onclick: 'refresh' },'refresh'),
					h('button',{class: 'mdc-button', onclick: 'dialogCloseOK' },'ok'),
				].filter(x=>x) ),
			]),
    css: `{ position: fixed;
						background: #F9F9F9;
						width: %$width%px;
						min-height: %$height%px;
						overflow: auto;
						border-radius: 4px;
						padding: 0 12px 12px 12px;
						box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)
				}
				>.dialog-title { background: none; padding: 10px 5px; }
				>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }
				>.dialog-close {
						position: absolute;
						cursor: pointer;
						right: 4px; top: 4px;
						font: 21px sans-serif;
						border: none;
						background: transparent;
						color: #000;
						text-shadow: 0 1px 0 #fff;
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-menu {
						position: absolute;
						cursor: pointer;
						right: 24px; top: 0;
						font: 21px sans-serif;
						border: none;
						background: transparent;
						color: #000;
						text-shadow: 0 1px 0 #fff;
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }
				>.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle('%$id%'),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
      studioDialogFeature.refreshTitle(),
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
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: id},[
				  h('div',{class: 'dialog-title noselect'},title),
				  h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				  h('div',{class: 'jb-dialog-content-parent stretchedToMargin'},h(contentComp)),
			  ]),
    css: `{ position: fixed;
						  background: #F9F9F9;
						  width: %$width%px;
						  height: %$height%px;
						  overflow: auto;
						  border-radius: 4px;
						  padding: 0 12px 12px 12px;
						  box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)
				  }
				  >.dialog-title { background: none; padding: 10px 5px; }
				  >.jb-dialog-content-parent { padding: 0; overflow-y: hidden; overflow-x: hidden; top: 40px}
				  >.dialog-close {
						  position: absolute;
						  cursor: pointer;
						  right: 4px; top: 4px;
						  font: 21px sans-serif;
						  border: none;
						  background: transparent;
						  color: #000;
						  text-shadow: 0 1px 0 #fff;
						  font-weight: 700;
						  opacity: .2;
				  }
				  >.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle('%$id%'),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
      studioDialogFeature.studioPopupLocation(),
      dialogFeature.resizer(true)
    ]
  })
})

jb.component('studioDialogFeature.studioPopupLocation', {
  type: 'dialog-feature',
  impl: interactive(
    (ctx,{cmp}) => {
			const dialog = cmp.dialog;
			const id = (dialog.id||'').replace(/\s/g,'_');
			if (id && !jb.sessionStorage(id)) {
				dialog.el.classList.add(id);
				dialog.el.classList.add('default-location')
			}
		}
  )
})

jb.component('studioDialogFeature.refreshTitle', {
  type: 'dialog-feature',
  impl: interactive(
    (ctx,{cmp}) => jb.callbag.pipe(
        jb.studio.scriptChange,
        jb.callbag.takeUntil( cmp.destroyed ),
  		  jb.callbag.subscribe(e=> cmp.recalcTitle && cmp.recalcTitle(e,ctx)))
  )
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
      databind: studio.ref('%$path%'),
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
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: id},[
				h('div',{class: 'dialog-title noselect'},title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
			]),
    css: `{ position: fixed;
						background: #F9F9F9;
						width: %$width%px;
						min-height: %$height%px;
						overflow: auto;
						border-radius: 4px;
						padding: 0 12px 12px 12px;
						box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)
				}
				>.dialog-title { background: none; padding: 10px 5px; }
				>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }
				>.dialog-close {
						position: absolute;
						cursor: pointer;
						right: 4px; top: 4px;
						font: 21px sans-serif;
						border: none;
						background: transparent;
						color: #000;
						text-shadow: 0 1px 0 #fff;
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-menu {
						position: absolute;
						cursor: pointer;
						right: 24px; top: 4px;
						font: 21px sans-serif;
						border: none;
						background: transparent;
						color: #000;
						text-shadow: 0 1px 0 #fff;
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-close:hover { opacity: .5 }`,
    features: [
      dialogFeature.dragTitle('%$id%'),
      dialogFeature.uniqueDialog('%$id%', true),
      dialogFeature.maxZIndexOnClick(5000),
      studioDialogFeature.refreshTitle(),
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
              action: runTransaction(
                [
                  writeValue('%$studio/preview/width%', '400'),
                  writeValue('%$studio/preview/height%', '600')
                ]
              ),
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
            })
          ],
          features: css.padding({top: '7', left: '4', right: '4'})
        }),
        group({
          title: 'width-height',
          layout: layout.horizontal(),
          controls: [
            editableNumber({
              databind: '%$studio/preview/width%',
              title: 'width',
              style: editableText.mdcInput({}),
              features: [watchRef('%$studio/preview/width%')]
            }),
            editableNumber({
              databind: '%$studio/preview/height%',
              title: 'height',
              style: editableText.mdcInput({}),
              features: watchRef('%$studio/preview/height%')
            })
          ],
          features: hidden()
        })
      ],
      features: feature.onDataChange({
        ref: '%$studio/preview%',
        includeChildren: 'yes',
        action: studio.setPreviewSize('%$studio/preview/width%', '%$studio/preview/height%')
      })
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
