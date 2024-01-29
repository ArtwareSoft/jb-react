
extension('studio', {
	PropertiesTree: class PropertiesTree {
		constructor(rootPath) {
			this.rootPath = rootPath;
			this.refHandler = jb.watchableComps.handler;
		}
		isArray(path) {
			return this.children(path).length > 0;
		}
		children(path) {
			if (jb.tgp.isOfType(path,'data'))
				return []
			if (Array.isArray(jb.tgp.valOfPath(path)))
				return jb.tgp.arrayChildren(path,false)
			return jb.tgp.paramsOfPath(path)
				.filter(p=>!jb.tgp.isControlType(p.type))
				.map(prop=>path + '~' + prop.id)
		}
		val(path) {
			return jb.tgp.valOfPath(path)
		}
		move(from,to,ctx) {
			return jb.tgp.moveFixDestination(from,to,ctx)
		}
		disabled(path) {
			return jb.tgp.isDisabled(path)
		}
		icon(path) {
			return jb.tgp.icon(path)
		}
	},
})

component('studio.properties', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'innerPath', as: 'string'},
    {id: 'focus', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: [
      tableTree({
        treeModel: (ctx,{},{path}) => Object.assign(new jb.studio.PropertiesTree(path),{maxDepth: 7}),
        commonFields: [
          group(studio.propField('%path%', '%expanded%'), {
            features: [
              field.columnWidth('300'),
              css.conditionalClass('jb-disabled', tgp.isDisabled('%$path%'))
            ]
          }),
          group(studio.propertyToolbar('%path%'), { features: [field.columnWidth('20')] })
        ],
        chapterHeadline: text({
          text: ({data}) => {
            const path = data.path
            const prop = path.split('~').pop()
            if (Array.isArray(jb.tgp.valOfPath(path)))
              return `${prop} (${jb.tgp.valOfPath(path).length})`
            if (isNaN(Number(prop)))
              return prop
            return Number(prop) + 1
          },
          features: [
            feature.hoverTitle(pipeline(tgp.paramDef('%path%'), '%description%'))
          ]
        }),
        style: tableTree.plain(true, 100, { noItemsCtrl: text('') }),
        features: [
          css(
            `>tbody>tr>td.headline { vertical-align: inherit; margin-bottom: 7px; }
            >tbody>tr>td>span>i { margin-bottom: 8px }`
          ),
          studio.watchPath('%$path%', 'structure', { allowSelfRefresh: true }),
          tableTree.expandPath(studio.lastEdit()),
          tableTree.expandPath('%$innerPath%'),
          tableTree.dragAndDrop(),
          tableTree.resizer()
        ]
      }),
      group({
        controls: [
          button('new feature', studio.openNewProfileDialog('%$path%~features', 'feature'), {
            style: button.href(),
            features: [
              feature.if(tgp.isOfType('%$path%~features', 'feature')),
              css.margin('20', '5'),
              css.width('100%')
            ]
          }),
          button('new icon', tgp.getOrCreateCompInArray('%$path%~features', 'feature.icon'), {
            style: button.mdcIcon({ buttonSize: '24' }),
            features: feature.icon('Creation', { type: 'mdi', size: '16' })
          }),
          button('new css', tgp.getOrCreateCompInArray('%$path%~features', 'css'), {
            style: button.mdcIcon({ buttonSize: '24' }),
            features: feature.icon('LanguageCss3', { type: 'mdi', size: '16' })
          }),
          button('size, padding & margin', studio.openSizesEditor('%$path%'), {
            style: button.mdcIcon({ buttonSize: '24' }),
            features: feature.icon('business', { type: 'mdc', size: '16' })
          })
        ],
        title: '',
        layout: layout.flex({ justifyContent: 'flex-end', alignItems: 'flex-end', spacing: '7' }),
        features: css.margin({ bottom: '10', right: '5' })
      })
    ],
    features: feature.byCondition(or('%$focus%', studio.lastEdit()), group.autoFocusOnFirstInput())
  })
})

component('studio.propField', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'expanded', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: group({
      controls: [
        controlWithCondition({
          condition: and(
            inGroup(list('feature.icon','icon','control.icon'), tgp.compName(tgp.parentPath('%$path%'))),
            equals('icon', pipeline(tgp.paramDef('%$path%'), '%id%'))
          ),
          control: studio.pickIcon('%$path%')
        }),
        controlWithCondition({
          condition: studio.editAs('%$path%', 'numericCss', {
            anyParamIds: 'width,height,top,left,right,bottom,spacing,blurRadius,spreadRadius,horizontal,vertical,radius'
          }),
          control: studio.propertyNumbericCss('%$path%')
        }),
        controlWithCondition({
          condition: studio.editAs('%$path%', 'numericZeroToOne', { anyParamIds: 'opacity' }),
          control: studio.propertyNumbericZeroToOne('%$path%')
        }),
        controlWithCondition({
          condition: studio.editAs('%$path%', 'color', { anyParamIds: 'color,shadowColor' }),
          control: studio.colorPicker('%$path%')
        }),
        controlWithCondition({
          condition: and(
            tgp.isOfType('%$path%', 'data,boolean'),
            not(isOfType('string,number,boolean,undefined', '%$val%'))
          ),
          control: studio.propertyScript('%$path%')
        }),
        controlWithCondition({
          condition: and(tgp.isOfType('%$path%', 'action'), isOfType('array', '%$val%')),
          control: studio.propertyScript('%$path%')
        }),
        controlWithCondition('%$paramDef/options%', studio.propertyEnum('%$path%')),
        controlWithCondition({
          condition: and(
            '%$paramDef/as%=="boolean"',
            or(inGroup(list(true,false,'true','false'), '%$val%'), isEmpty('%$val%'))
          ),
          control: studio.propertyBoolean('%$path%')
        }),
        controlWithCondition(tgp.isOfType('%$path%', 'data,boolean'), studio.propertyPrimitive('%$path%')),
        controlWithCondition({
          condition: or('%$expanded%', isEmpty('%$val%'), not(tgp.isOfType('%$path%', 'data,boolean'))),
          control: studio.pickProfile('%$path%')
        }),
        studio.propertyScript('%$path%')
      ],
      features: [
        group.firstSucceeding(),
        studio.watchPath('%$path%', 'yes'),
        variable('paramDef', tgp.paramDef('%$path%')),
        variable('val', tgp.val('%$path%'))
      ]
    }),
    title: tgp.propName('%$path%'),
    features: [
      feature.keyboardShortcut('Ctrl+I', studio.openJbEditor('%$path%')),
      If({
        condition: not(isOfType('string,number,boolean,undefined', tgp.val('%$path%'))),
        then: studio.watchPath('%$path%', 'structure', { allowSelfRefresh: true })
      })
    ]
  })
})

component('studio.propertyToolbar', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button('more...', studio.openPropertyMenu('%$path%'), { style: studio.propertyToolbarStyle() })
})

component('studio.propertyScript', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button(prettyPrint(tgp.val('%$path%'), true), studio.openJbEditor('%$path%'), { style: button.studioScript() }),
    features: studio.watchPath('%$path%', 'yes')
  })
})

component('studio.propertyNumbericCss', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber(tgp.ref('%$path%'), {
    style: editableNumber.slider(),
    max: 20,
    features: css('~ .text-input {width: 40px} ~ .slider-input { width: 100% }')
  })
})

component('studio.propertyNumbericZeroToOne', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber(tgp.ref('%$path%'), {
    style: editableNumber.slider(),
    max: 1,
    step: 0.1,
    features: css('~ .text-input {width: 40px} ~ .slider-input { width: 100% }')
  })
})

component('studio.propertyBoolean', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableBoolean(tgp.ref('%$path%'), editableBoolean.mdcSlideToggle(), {
    features: css('{flex-direction: row;     display: flex;} ~ label {padding-left: 10px }')
  })
})

component('studio.propertyEnum', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: picklist({
    databind: tgp.ref('%$path%'),
    options: tgp.enumOptions('%$path%'),
    style: picklist.nativeMdLookOpen(),
    features: [
      css.width('100', { minMax: 'min' })
    ]
  })
})

component('studio.jbFloatingInputRich', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group(studio.propField('%$path%'), { features: css('{padding: 20px}') })
})

component('studio.editAs', {
  description: 'has editHas param',
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'},
    {id: 'type', as: 'string'},
    {id: 'anyParamIds', as: 'string'}
  ],
  impl: or(
    Var('paramDef', tgp.paramDef('%$path%')),
    equals('%$paramDef/editAs%', '%$type%'),
    inGroup(split({ text: '%$anyParamIds%' }), '%$paramDef/id%')
  )
})

component('studio.rawColorPicker', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button({
      title: prettyPrint(tgp.val('%$path%'), true),
      action: (ctx,{cmp},{path}) => {
          const parent = document.createElement('div')
          const elemRect = cmp.base.getBoundingClientRect()
          parent.style = `position: absolute; z-index: 10000; top: ${elemRect.top+ 10}px; left: ${elemRect.left+40}px;`
          document.body.appendChild(parent)
          const picker = new Picker({
            parent,
            color: jb.tgp.valOfPath(path),
            onChange: color => ctx.run(writeValue(tgp.ref(path),color.rgbaString)),
            onDone: () => { picker.destroy(); document.body.removeChild(parent) }
          })
          picker.show()
        },
      style: button.studioScript()
    }),
    features: studio.watchPath('%$path%', 'yes')
  })
})

component('studio.colorPicker', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button({
      title: prettyPrint(tgp.val('%$path%'), true),
      action: openDialog({
        content: itemlist('', {
          items: studio.colorVariables(),
          controls: group({
            controls: [
              control.icon('MoonFull', {
                type: 'mdi',
                features: css('~ svg { fill: %color%; stroke: black }')
              }),
              text('%varName%')
            ],
            title: '',
            layout: layout.flex({ alignItems: 'center', spacing: '5' }),
            features: css.width('300')
          }),
          features: itemlist.selection({ onSelection: writeValue(tgp.ref('%$path%'), 'var(--%varName%)') })
        }),
        style: dialog.studioJbEditorPopup(),
        features: studio.nearLauncherPosition()
      }),
      style: button.studioScript()
    }),
    features: studio.watchPath('%$path%', 'yes')
  })
})

component('studio.colorVariables', {
  impl: ctx => {
    const doc = jb.frame.document
    if (!doc) return []
    return ((doc.querySelector('[elemId="__defaultTheme"]') || {}).textContent || '').split('\n').filter(x=>x.match(/--/)).filter(x=>!x.match(/font/)).map(x=>x.split(':')[0].trim().slice(2))
      .map(varName=> ({ varName, color : jb.ui.valueOfCssVar(varName,doc.body) }))
    }
})

component('studio.openProperties', {
  type: 'action',
  params: [
    {id: 'focus', type: 'boolean', as: 'boolean'},
    {id: 'innerPath', as: 'string'}
  ],
  impl: runActions(
    Var('path', studio.currentProfilePath()),
    If(tgp.compName('%$path%'), openDialog({
      title: pipeline(
        {'$': 'object', title: tgp.shortTitle('%$path%'), comp: tgp.compName('%$path%')},
        If(equals('%comp%', '%title%'), '%comp%', '%comp% %title%'),
        'Properties of %%'
      ),
      content: studio.properties('%$path%', '%$innerPath%', { focus: '%$focus%' }),
      style: dialog.studioFloating('studio-properties', '520'),
      features: [
        feature.keyboardShortcut('Ctrl+Left', studio.openControlTree()),
        dialogFeature.resizer()
      ]
    }))
  )
})
