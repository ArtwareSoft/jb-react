  
component('studio.propertyPrimitive', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableText({
    databind: tgp.ref('%$path%'),
    style: editableText.studioPrimitiveText(),
    features: [
      feature.onKey('Right', suggestions.applyOption('/')),
      editableText.picklistHelper({
        options: suggestions.calcFromProbePreview('%$path%', true),
        picklistStyle: studio.suggestionList(),
        picklistFeatures: picklist.allowAsynchOptions(),
        showHelper: suggestions.shouldShow(true),
        onEnter: suggestions.applyOption()
      })
    ]
  })
})

component('studio.jbFloatingInput', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    layout: layout.horizontal('20'),
    controls: [
      control.icon({
        icon: 'FunctionVariant',
        title: "hit '=' to calculate with function",
        features: [css.margin('25')]
      }),
      button({
        title: 'set to false',
        action: writeValue({to: tgp.boolRef('%$path%'), value: false}),
        style: button.mdcIcon(icon({icon: 'cancel', type: 'mdc'}), '24'),
        features: [
          feature.if(tgp.isOfType('%$path%', 'boolean')),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button({
        title: 'set to true',
        action: writeValue(tgp.boolRef('%$path%'), true),
        style: button.mdcIcon(icon({icon: 'done', type: 'mdc'}), '24'),
        features: [
          feature.if(tgp.isOfType('%$path%', 'boolean')),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button({
        title: 'choose icon',
        action: studio.openPickIcon('%$path%'),
        style: button.mdcIcon(),
        features: [
          feature.if(
            and(
              inGroup(list('feature.icon', 'icon'), tgp.compName(tgp.parentPath('%$path%'))),
              equals('icon', pipeline(tgp.paramDef('%$path%'), '%id%'))
            )
          ),
          css.transformScale('1', '0.8'),
          css.margin('15'),
          feature.icon('all_out')
        ]
      }),
      group({
        title: '',
        layout: layout.vertical(),
        controls: [
          editableText({
            title: tgp.propName('%$path%'),
            databind: tgp.profileValueAsText('%$path%'),
            updateOnBlur: true,
            style: editableText.floatingInput(),
            features: [
              watchRef({ref: tgp.ref('%$path%'), strongRefresh: true}),
              feature.onKey('Right', suggestions.applyOption('/')),
              feature.onKey(
                'Enter',
                runActions(suggestions.applyOption(), dialog.closeDialogById('studio-jb-editor-popup'), popup.regainCanvasFocus())
              ),
              feature.onKey('Esc', runActions(dialog.closeDialogById('studio-jb-editor-popup'), popup.regainCanvasFocus())),
              editableText.picklistHelper({
                options: suggestions.calcFromProbePreview('%$path%'),
                picklistStyle: studio.suggestionList(),
                picklistFeatures: picklist.allowAsynchOptions(),
                showHelper: suggestions.shouldShow()
              }),
              css.width('100%'),
              css('~ input { padding-top: 30px !important}')
            ]
          }),
          text({text: pipeline(tgp.paramDef('%$path%'), '%description%'), features: css('color: grey')})
        ],
        features: css.width('100%')
      })
    ],
    features: [
      css.padding({left: '4', right: '4'}),
      css.width('500')
    ]
  })
})

component('studio.suggestionList', {
  type: 'picklist.style',
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: text({
        text: pipeline('%text%', studio.unMacro()),
        features: [
          css.padding({left: '3', right: '2'}),
          feature.hoverTitle(pipeline(ctx => jb.comps[ctx.data.toPaste], '%description%'))
        ]
      }),
      visualSizeLimit: 30,
      features: [
        itemlist.selection({
          databind: '%$picklistModel/databind%',
          onDoubleClick: runActions(Var('cmp', '%$helperCmp%'), action.runBEMethod('onEnter'))
        }),
        itemlist.keyboardSelection(false),
        css.height({
          height: '500',
          overflow: 'scroll',
          minMax: 'max'
        }),
        css.width({
          width: '300',
          overflow: 'auto',
          minMax: 'min'
        }),
        css('{ position: absolute; z-index:1000; background: var(--jb-dropdown-bg) }'),
        css.border({width: '1', color: 'var(--jb-dropdown-border)'}),
        css.padding({
          top: '2',
          left: '3',
          selector: 'li'
        }),
        itemlist.infiniteScroll()
      ]
    }),
    'picklistModel'
  )
})

