using('ui-mdc-styles')

component('workspace.popup', {
  type: 'dialog-style',
  impl: customStyle({
    template: (cmp,{contentComp},h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h('button.dialog-close', {onclick: 'dialogClose' },'×'),
        h(contentComp),
      ]),
    css: `{ background: var(--jb-editor-background); position: absolute }
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
      maxZIndexOnClick(),
      closeWhenClickingOutside(),
      unique('workspace.popup'),
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

component('workspace.floating', {
  type: 'dialog-style',
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
      dragTitle('%$id%', true),
      unique('%$id%'),
      maxZIndexOnClick(5000),
      workspace.popupLocation()
    ]
  })
})

component('workspace.popupLocation', {
  type: 'dialog-feature',
  impl: templateModifier(({},{vdom}) => { 
    const id = (vdom.getAttribute('id')||'').replace(/\s/g,'_')
    if (id && !jb.utils.sessionStorage(id))
      vdom.addClass(`default-location ${id}`)
  })
})

component('workspace.completions', {
  type: 'picklist-style',
  impl: styleByControl({
    control: itemlist({
      items: '%$picklistModel/options%',
      controls: text('%text%', { features: css.padding({ left: '3', right: '2' }) }),
      visualSizeLimit: 30,
      features: [
        itemlist.selection('%$picklistModel/databind%', {
          onDoubleClick: runActions(Var('cmp', '%$helperCmp%'), action.runBEMethod('onEnter'))
        }),
        itemlist.keyboardSelection({ autoFocus: false }),
        css.height('500', 'scroll', { minMax: 'max' }),
        css.width('300', 'auto', { minMax: 'min' }),
        css('{ position: absolute; z-index:1000; background: var(--jb-dropdown-bg) }'),
        css.border('1', { color: 'var(--jb-dropdown-border)' }),
        css.padding('2', '3', { selector: 'li' }),
        //itemlist.infiniteScroll()
      ]
    }),
    modelVar: 'picklistModel'
  })
})

component('editableText.floatingInput', {
  type: 'editable-text-style',
  impl: styleWithFeatures(editableText.mdcInput(), {
    features: css('~ .mdc-text-field { width: 100%; margin-right: 13px;}')
  })
})