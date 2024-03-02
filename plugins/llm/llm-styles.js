component('llm.Floating', {
  type: 'dialog-style<>',
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
      dialogFeature.dragTitle('%$id%', true),
      dialogFeature.uniqueDialog('%$id%'),
      dialogFeature.maxZIndexOnClick(5000),
      popupLocation()
    ]
  })
})

component('popupLocation', {
  type: 'dialog-feature<>',
  impl: templateModifier(({},{vdom}) => { 
    const id = (vdom.getAttribute('id')||'').replace(/\s/g,'_')
    if (id && !jb.utils.sessionStorage(id))
      vdom.addClass(`default-location ${id}`)
  })
})