jb.component('dialog.edit-source-style',  /* dialog_editSourceStyle */ {
  type: 'dialog.style',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 100},
    {id: 'onUpdate', type: 'action', dynamic: true}
  ],
  impl: ctx => ctx.run({$: 'custom-style',
			template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: cmp.id},[
				h('div',{class: 'dialog-title noselect'},state.title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick:
					_=> cmp.dialogClose() },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(state.contentComp)),
				h('div',{class: 'dialog-buttons'},[
					h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _ => ctx.params.onUpdate(cmp.ctx) },'update'),
					h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: false}) },'cancel'),
					h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: true}) },'ok'),
				]),
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
						max-width: 1200px;
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

jb.component('studio-dialog-feature.studio-popup-location',{
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

jb.component('studio-dialog-feature.refresh-title', {
	type: 'dialog-feature',
	impl: ctx => ({
		afterViewInit: cmp =>
			jb.studio.scriptChange.subscribe(e=>
				cmp.recalcTitle && cmp.recalcTitle(e,ctx))
	})
})

jb.component('studio.code-mirror-mode', { /* studio.codeMirrorMode */
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: function(ctx,path) {
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

jb.component('dialog.studio-floating',  /* dialog_studioFloating */ {
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
				h('button',{class: 'dialog-close', onclick:
					_=> cmp.dialogClose() },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(state.contentComp)),
			]),
    css: "{ position: fixed;\n\t\t\t\t\t\tbackground: #F9F9F9;\n\t\t\t\t\t\twidth: %$width%px;\n\t\t\t\t\t\tmax-width: 1200px;\n\t\t\t\t\t\tmin-height: %$height%px;\n\t\t\t\t\t\toverflow: auto;\n\t\t\t\t\t\tborder-radius: 4px;\n\t\t\t\t\t\tpadding: 0 12px 12px 12px;\n\t\t\t\t\t\tbox-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)\n\t\t\t\t}\n\t\t\t\t>.dialog-title { background: none; padding: 10px 5px; }\n\t\t\t\t>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }\n\t\t\t\t>.dialog-close {\n\t\t\t\t\t\tposition: absolute;\n\t\t\t\t\t\tcursor: pointer;\n\t\t\t\t\t\tright: 4px; top: 4px;\n\t\t\t\t\t\tfont: 21px sans-serif;\n\t\t\t\t\t\tborder: none;\n\t\t\t\t\t\tbackground: transparent;\n\t\t\t\t\t\tcolor: #000;\n\t\t\t\t\t\ttext-shadow: 0 1px 0 #fff;\n\t\t\t\t\t\tfont-weight: 700;\n\t\t\t\t\t\topacity: .2;\n\t\t\t\t}\n\t\t\t\t>.dialog-menu {\n\t\t\t\t\t\tposition: absolute;\n\t\t\t\t\t\tcursor: pointer;\n\t\t\t\t\t\tright: 24px; top: 0;\n\t\t\t\t\t\tfont: 21px sans-serif;\n\t\t\t\t\t\tborder: none;\n\t\t\t\t\t\tbackground: transparent;\n\t\t\t\t\t\tcolor: #000;\n\t\t\t\t\t\ttext-shadow: 0 1px 0 #fff;\n\t\t\t\t\t\tfont-weight: 700;\n\t\t\t\t\t\topacity: .2;\n\t\t\t\t}\n\t\t\t\t>.dialog-close:hover { opacity: .5 }",
    features: [
      dialogFeature_dragTitle('%$id%'),
      dialogFeature_uniqueDialog('%$id%', true),
      dialogFeature_maxZIndexOnClick(5000),
      studioDialogFeature_refreshTitle(),
      studioDialogFeature_studioPopupLocation()
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
    content: tabs({
      tabs: dynamicControls({
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
          style: propertySheet.titlesLeft({vSpacing: 20, hSpacing: 20, titleWidth: 100}),
          controls: [
            editableNumber({
              databind: '%$studio/responsive/{%$controlItem/id%}/width%',
              title: 'width',
              style: editableNumber.slider(),
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
              style: editableNumber.slider(),
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
      style: tabs.simple()
    }),
    title: 'responsive'
  })
})
