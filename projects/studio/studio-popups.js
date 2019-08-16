jb.component('studio.open-multiline-edit', {
	type: 'action',
	params: [
	    { id: 'path', as: 'string' }
	],
	impl: {
		$: 'open-dialog',
		style :{$: 'dialog.studio-multiline-edit' },
		content :{$: 'editable-text',
			databind :{$: 'studio.ref', path: '%$path%' },
			style :{$: 'editable-text.codemirror',
				mode :{$: 'studio.code-mirror-mode', path: '%$path%'}
			},
//			features: {$: 'studio.undo-support', path: '%$path%' },
		}
	}
})

jb.component('dialog.studio-floating', {
	type: 'dialog.style',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'width', as: 'number', defaultValue: 300},
		{ id: 'height', as: 'number', defaultValue: 100},
	],
	impl :{$: 'custom-style',
			template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog', dialogId: cmp.id},[
				h('div',{class: 'dialog-title noselect'},state.title),
				cmp.hasMenu ? h('div',{class: 'dialog-menu'},h(cmp.menuComp)): '',
				h('button',{class: 'dialog-close', onclick:
					_=> cmp.dialogClose() },'×'),
				h('div',{class: 'jb-dialog-content-parent'},h(state.contentComp)),
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
				>.dialog-close:hover { opacity: .5 }`
	}
})

jb.component('dialog.edit-source-style', {
	type: 'dialog.style',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'width', as: 'number', defaultValue: 300},
		{ id: 'height', as: 'number', defaultValue: 100},
		{ id: 'onUpdate', type: 'action', dynamic: true },
	],
	impl : ctx => ctx.run({$: 'custom-style',
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

jb.component('studio.code-mirror-mode',{
	params: [ {id: 'path', as: 'string' } ],
	impl: function(ctx,path) {
		if (path.match(/css/))
			return 'css';
		if (path.match(/template/) || path.match(/html/))
			return 'htmlmixed';
		return 'javascript'
	}
})

jb.component('studio.open-responsive-phone-popup', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'open-dialog',
    style :{$: 'dialog.studio-floating', id: 'responsive' },
    content :{$: 'tabs',
      tabs :{$: 'dynamic-controls',
        controlItems :{
          $asIs: [
            {
              width: { min: 320, max: 479, default: 400 },
              height: { min: 300, max: 700, default: 600 },
              id: 'phone'
            },
            {
              width: { min: 480, max: 1024, default: 600 },
              height: { min: 300, max: 1440, default: 850 },
              id: 'tablet'
            },
            {
              width: { min: 1024, max: 2048, default: 1280 },
              height: { min: 300, max: 1440, default: 520 },
              id: 'desktop'
            }
          ]
        },
        genericControl :{$: 'group',
          title: '%$controlItem/id%',
          style :{$: 'property-sheet.titles-left',
            vSpacing: 20,
            hSpacing: 20,
            titleWidth: 100
          },
        controls: [
            {$: 'editable-number',
              databind: '%$studio/responsive/{%$controlItem/id%}/width%',
              title: 'width',
              style :{$: 'editable-number.slider' },
              min: '%$controlItem/width/min%',
              max: '%$controlItem/width/max%',
              features: [
                {$: 'field.default', value: '%$controlItem/width/default%' },
                {$: 'field.subscribe',
                  action :{$: 'studio.set-preview-size', width: '%%' },
                  includeFirst: true
                }
              ]
            },
            {$: 'editable-number',
              databind: '%$studio/responsive/{%$controlItem/id%}/height%',
              title: 'height',
              style :{$: 'editable-number.slider' },
              min: '%$controlItem/height/min%',
              max: '%$controlItem/height/max%',
              features: [
                {$: 'field.default', value: '%$controlItem/height/default%' },
                {$: 'field.subscribe',
                  action :{$: 'studio.set-preview-size', height: '%%' },
                  includeFirst: true
                }
              ]
            }
          ],
          features: [{$: 'css', css: '{ padding-left: 12px; padding-top: 7px }' }]
        }
      },
      style :{$: 'tabs.simple' }
    },
    title: 'responsive'
  }
})
