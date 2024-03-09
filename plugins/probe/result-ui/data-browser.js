using('ui-common','ui-tree','ui-misc','ui-styles','pretty-print')

component('ui.dataBrowse', {
  type: 'control',
  params: [
    {id: 'objToShow', mandatory: true, as: 'value', defaultValue: '%%'},
    {id: 'width', as: 'number', defaultValue: 200},
    {id: 'depth', as: 'number'}
  ],
  impl: group({
    controls: [
      group({
        controls: [ 
          controlWithCondition(isNull('%$obj%'), text('null')),
          controlWithCondition(({},{obj}) => obj == null, text('null')),
          controlWithCondition({
            condition: ({},{obj}) => Array.isArray(obj) && obj.length == 1 && obj[0] == null,
            control: text('[null]')
          }),
          controlWithCondition(isOfType('string,boolean,number', '%$obj%'), text('%$obj%')),
          controlWithCondition(isOfType('function', '%$obj%'), text(({data}) => data.name || 'func')),
          controlWithCondition(isOfType('array', '%$obj%'), table({
            items: '%$obj%',
            controls: group(ui.dataBrowse('%%', 200), { title: '%$obj/length% items' }),
            style: table.mdc(),
            visualSizeLimit: 7,
            features: [
              itemlist.infiniteScroll(),
              css.height('400', { minMax: 'max' })
            ]
          })),
          controlWithCondition('%$obj/vars%', group(ui.dataBrowse('%$obj/data%'), { layout: layout.flex({ spacing: '10' }) })),
          tree({
            nodeModel: tree.jsonReadOnly('%$obj%', '%$title%'),
            style: tree.expandBox(),
            features: [
              css.class('jb-editor'),
              tree.selection(),
              tree.keyboardSelection(),
              css.width('%$width%', { minMax: 'max' })
            ]
          })
        ],
        features: group.firstSucceeding()
      }),
      controlWithCondition({
        condition: and('%$obj/length% > 100', isOfType('string', '%$obj%')),
        control: button({
          title: 'open (%$obj/length%)',
          action: openDialog({
            content: group({
              controls: [                
              text({
                text: '%$obj%',
                title: 'codemirror',
                style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'text' }),
                features: [codemirror.fold(), codemirror.lineNumbers()]
              }),
                html('%$obj%', 'html', { style: html.inIframe() })
              ],
              style: group.tabs(),
              features: css('{height: 100%} >div:last-child {height: 100%}')
            }),
            style: dialog.showSourceStyle('show-data')
          }),
          style: button.href()
        }),
        title: 'long text'
      })
    ],
    features: [
      variable('obj', '%$objToShow%'),
      css.height('400', 'auto', { minMax: 'max' }),
      css.width({ overflow: 'auto', minMax: 'max' }),
      group.eliminateRecursion(5)
    ]
  })
})

component('dialog.showSourceStyle', {
  type: 'dialog-style',
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
      dialogFeature.dragTitle('%$id%', true),
      dialogFeature.uniqueDialog('%$id%'),
      dialogFeature.maxZIndexOnClick(5000),
      dialogFeature.resizer(true)
    ]
  })
})