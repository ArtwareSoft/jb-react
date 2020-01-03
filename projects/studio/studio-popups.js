jb.component('dialog.edit-source-style', { /* dialog.editSourceStyle */
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100},
    {id: 'onUpdate', type: 'action', dynamic: true},
  ],
  impl: customStyle({
			template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: cmp.id},[
				h('div',{class: 'dialog-title noselect'},state.title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(state.contentComp)),
				h('div',{class: 'dialog-buttons'},[
					...(cmp.dialog.gotoEditor ? [h('button',{class: 'mdc-button', onclick: 'dialog.gotoEditor' },'goto editor')] : []),
					h('button',{class: 'mdc-button', onclick: 'dialog.refresh' },'refresh'),
					h('button',{class: 'mdc-button', onclick: 'dialogCloseOK' },'ok'),
				].filter(x=>x) ),
			]),
			features: [
					{$: 'dialog-feature.drag-title', id: '%$id%'},
					{$: 'dialog-feature.unique-dialog', id: '%$id%', remeberLastLocation: true },
					{$: 'dialog-feature.max-zIndex-on-click', minZIndex: 5000 },
					{$: 'studio-dialog-feature.refresh-title' },
					{$: 'studio-dialog-feature.studio-popup-location' },
			],
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
				>.dialog-close:hover { opacity: .5 }`

	})
})

jb.component('studio.dialog-particle-style', { 
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
	  css: `{ position: fixed; z-index: 6000 !important; width: 20px; height: 20px;}
	  >* { display: inline-block; }`
	})
})


jb.component('dialog.show-source-style', {
	type: 'dialog.style',
	params: [
	  {id: 'id', as: 'string'},
	  {id: 'width', as: 'number', defaultValue: 600},
	  {id: 'height', as: 'number', defaultValue: 600},
	],
	impl: customStyle({
			  template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: cmp.id},[
				  h('div',{class: 'dialog-title noselect'},state.title),
				  h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				  h('div',{class: 'jb-dialog-content-parent stretchedToMargin'},h(state.contentComp)),
			  ]),
			  features: [
					  {$: 'dialog-feature.drag-title', id: '%$id%'},
					  {$: 'dialog-feature.unique-dialog', id: '%$id%', remeberLastLocation: true },
					  {$: 'dialog-feature.max-zIndex-on-click', minZIndex: 5000 },
					  {$: 'studio-dialog-feature.studio-popup-location' },
					  dialogFeature.resizer(true)
			 ],
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
				  >.dialog-close:hover { opacity: .5 }`
	  })
})

jb.component('studio-dialog-feature.studio-popup-location', { /* studioDialogFeature.studioPopupLocation */
  type: 'dialog-feature',
  impl: ctx => ({
		afterViewInit: cmp => {
			var dialog = cmp.dialog;
			var id = (dialog.id||'').replace(/\s/g,'_');
			if (id && !sessionStorage[id]) {
				dialog.el.classList.add(id);
				dialog.el.classList.add('default-location')
			}
		}
	})
})

jb.component('studio-dialog-feature.refresh-title', { /* studioDialogFeature.refreshTitle */
  type: 'dialog-feature',
  impl: ctx => ({
		afterViewInit: cmp =>
			jb.studio.scriptChange.takeUntil( cmp.destroyed ).subscribe(e=>
				cmp.recalcTitle && cmp.recalcTitle(e,ctx))
	})
})

jb.component('studio.code-mirror-mode', { /* studio.codeMirrorMode */
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

jb.component('studio.open-multiline-edit', { /* studio.openMultilineEdit */
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

jb.component('dialog.studio-floating', { /* dialog.studioFloating */
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: cmp.id},[
				h('div',{class: 'dialog-title noselect'},state.title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(state.contentComp)),
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

jb.component('studio.open-responsive-phone-popup', { /* studio.openResponsivePhonePopup */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    style: dialog.studioFloating('responsive'),
    content: group({
		style: group.tabs(),
		controls : dynamicControls({
        controlItems: asIs(
          [
            {
              width: {min: 320, max: 479, default: 400},
              height: {min: 300, max: 700, default: 600},
              id: 'phone'
            },
            {
              width: {min: 480, max: 1024, default: 600},
              height: {min: 300, max: 1440, default: 850},
              id: 'tablet'
            },
            {
              width: {min: 1024, max: 2048, default: 1280},
              height: {min: 300, max: 1440, default: 520},
              id: 'desktop'
            }
          ]
        ),
        genericControl: group({
          title: '%$controlItem/id%',
          layout: layout.horizontal('70'),
          controls: [
            editableNumber({
              databind: '%$studio/responsive/{%$controlItem/id%}/width%',
              title: 'width',
              style: editableText.mdcInput(),
              min: '%$controlItem/width/min%',
              max: '%$controlItem/width/max%',
              features: [
                field.default('%$controlItem/width/default%'),
                field.subscribe(studio.setPreviewSize('%%'), true)
              ]
            }),
            editableNumber({
              databind: '%$studio/responsive/{%$controlItem/id%}/height%',
              title: 'height',
              style: editableText.mdcInput(),
              min: '%$controlItem/height/min%',
              max: '%$controlItem/height/max%',
              features: [
                field.default('%$controlItem/height/default%'),
                field.subscribe(studio.setPreviewSize(undefined, '%%'), true)
              ]
            })
          ],
          features: [css('{ padding-left: 12px; padding-top: 7px }')]
        })
      }),
    }),
    title: 'responsive'
  })
})
