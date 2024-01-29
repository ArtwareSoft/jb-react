  
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
      editableText.picklistHelper(suggestions.calcFromProbePreview('%$path%', true), studio.suggestionList(), {
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
      control.icon('FunctionVariant', `hit '=' to calculate with function`, {
        features: [css.margin('25')]
      }),
      button('set to false', writeValue(tgp.boolRef('%$path%'), false), {
        style: button.mdcIcon(icon('cancel', { type: 'mdc' }), '24'),
        features: [
          feature.if(tgp.isOfType('%$path%', 'boolean')),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button('set to true', writeValue(tgp.boolRef('%$path%'), true), {
        style: button.mdcIcon(icon('done', { type: 'mdc' }), '24'),
        features: [
          feature.if(tgp.isOfType('%$path%', 'boolean')),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button('choose icon', studio.openPickIcon('%$path%'), {
        style: button.mdcIcon(),
        features: [
          feature.if(
            and(
              inGroup(list('feature.icon','icon'), tgp.compName(tgp.parentPath('%$path%'))),
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
          editableText(tgp.propName('%$path%'), tgp.profileValueAsText('%$path%'), {
            updateOnBlur: true,
            style: editableText.floatingInput(),
            features: [
              watchRef(tgp.ref('%$path%'), { strongRefresh: true }),
              feature.onKey('Right', suggestions.applyOption('/')),
              feature.onKey('Enter', runActions(suggestions.applyOption(), dialog.closeDialogById('studio-jb-editor-popup'), popup.regainCanvasFocus())),
              feature.onKey('Esc', runActions(dialog.closeDialogById('studio-jb-editor-popup'), popup.regainCanvasFocus())),
              editableText.picklistHelper(suggestions.calcFromProbePreview('%$path%'), studio.suggestionList(), {
                picklistFeatures: picklist.allowAsynchOptions(),
                showHelper: suggestions.shouldShow()
              }),
              css.width('100%'),
              css('~ input { padding-top: 30px !important}')
            ]
          }),
          text(pipeline(tgp.paramDef('%$path%'), '%description%'), { features: css('color: grey') })
        ],
        features: css.width('100%')
      })
    ],
    features: [
      css.padding({ left: '4', right: '4' }),
      css.width('500')
    ]
  })
})

component('studio.suggestionList', {
  type: 'picklist.style',
  impl: styleByControl({
    control: itemlist({
      items: '%$picklistModel/options%',
      controls: text(pipeline('%text%', studio.unMacro()), {
        features: [
          css.padding({ left: '3', right: '2' }),
          feature.hoverTitle(pipeline(ctx => jb.comps[ctx.data.toPaste], '%description%'))
        ]
      }),
      visualSizeLimit: 30,
      features: [
        itemlist.selection('%$picklistModel/databind%', {
          onDoubleClick: runActions(Var('cmp', '%$helperCmp%'), action.runBEMethod('onEnter'))
        }),
        itemlist.keyboardSelection(false),
        css.height('500', 'scroll', { minMax: 'max' }),
        css.width('300', 'auto', { minMax: 'min' }),
        css('{ position: absolute; z-index:1000; background: var(--jb-dropdown-bg) }'),
        css.border('1', { color: 'var(--jb-dropdown-border)' }),
        css.padding('2', '3', { selector: 'li' }),
        itemlist.infiniteScroll()
      ]
    }),
    modelVar: 'picklistModel'
  })
})

