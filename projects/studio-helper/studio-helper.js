jb.ns('studioHelper,d3g')
jb.studio.initCompsRefHandler(jb)
jb.studio.previewWindow = jb.frame
// fake current path
jb.delay(100).then(()=>new jb.jbCtx().run(runActions(writeValue('%$studio/project%','studio-helper')),writeValue('%$studio/page%','topBar') ))

jb.component('dataTest.parseProjectHtml', {
  impl: dataTest({
    calculate: pipeline(
      list('%$html-dev%', '%$html-user%', '%$html-cloud%'),
      {'$': 'studio.parseProjectHtml', '$byValue': []},
      prettyPrint()
    ),
    expectedResult: true
  })
})

jb.component('studioHelper.topBar', {
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  type: 'control',
  impl: studio.topBar(
    Var('simulateProfilePath', '%$path%')
  )
})

jb.component('studioHelper.eventTracker', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical(3),
    controls: [
      editableText({databind: '%$globals/test1%', style: editableText.mdcInput()}),
      text({text: '%$globals/test1%', style: text.span()}),
      studio.eventTracker()
    ]
  })
})

jb.component('studioHelper.editableSource', {
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  type: 'control',
  impl: group({
    controls: studio.editableSource('%$path%')
  })
})

jb.component('studioHelper.pages', {
  type: 'control',
  impl: studio.pages(

  )
})

jb.component('studioHelper.controlTree', {
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  impl: studio.controlTree(
    Var('simulateProfilePath', '%$path%')
  )
})

jb.component('studioHelper.pickProfile', {
  type: 'control',
  impl: studio.pickProfile(
    'studioHelperSample.button~action'
  )
})

jb.component('studioHelper.jbEditor', {
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.componentHeader'}
  ],
  impl: group({
    title: 'main',
    layout: layout.flex('flex-start'),
    controls: [
      studio.jbEditor('studioHelperSample.propertiesParamsProf'),
      group({
        controls: [
          editableText({
            databind: studio.profileAsText('%$jbEditorCntrData/selected%'),
            style: editableText.textarea({}),
            features: [css.width('300'), css.height('200'), css.margin({left: '10'})]
          })
        ],
        features: [watchRef('%$jbEditorCntrData/selected%')]
      })
    ],
    features: [css('{ height: 200px; padding: 50px }'), studio.jbEditorContainer('helper')]
  })
})

jb.component('studioHelper.inteliTree', {
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studioHelper.emptyGroup'}
  ],
  impl: group({
    title: 'main',
    layout: layout.flex('flex-start'),
    controls: [
      studio.jbEditorInteliTree('%$path%~impl~controls')
    ],
    features: [css('{ height: 200px; padding: 50px }'), studio.jbEditorContainer('helper')]
  })
})

jb.component('studioHelper.contentEditablePosition', {
  type: 'control',
  impl: text({
    text: 'hello',
    style: header.mdcHeadline2(),
    features: [
      interactive((ctx,{cmp}) => jb.ui.contentEditable.activate(cmp.base)),
      css.height('100'),
      css.padding({top: '', bottom: '40'}),
      css('background: grey')
    ]
  })
})

jb.component('studioHelperDummy.simpleLabel', {
  type: 'control',
  impl: text({
    vars: [Var('check', 2)],
    title: 'hello',
    style: text.span(),
    features: [css('{ color: red }'), css.padding({top: '20', left: '160'})]
  })
})

jb.component('studioHelperSample.button', {
  type: 'control',
  impl: button(
    'btn1'
  ),
  action: dialog.closeAll(

  )
})

jb.component('studioHelperSample.control', {
  type: 'control',
  impl: group({
    title: pipeline('main'),
    controls: [
      group({
        title: '2.0',
        controls: [
          text('my label'),
          text('fdsfsdfd')
        ]
      }),
      text('1.00')
    ]
  })
})

jb.component('studioHelper.emptyGroup', {
  type: 'control',
  impl: group({
    controls: [
      text({text: pipeline(''), title: 'my title'})
    ]
  })
})

jb.component('studioHelper.selectControl', {
  type: 'control',
  impl: studio.selectProfile({
    type: 'control'
  })
})

jb.component('studioHelper.selectFeature', {
  type: 'control',
  impl: group({
    title: 'select-feature',
    layout: layout.horizontal('53'),
    controls: [
      studio.selectProfile({
        type: 'feature',
        path: 'studioHelperSample.picklist~impl~features~0'
      })
    ]
  })
})

jb.component('studioHelper.features', {
  type: 'control',
  impl: group({
    title: 'features',
    controls: [
      {
        '$': 'studio.propertyArray',
        '$byValue': ['studioHelperDummy.simpleLabel~impl~features']
      }
    ]
  })
})

jb.component('studioHelperSample.control', {
  type: 'control',
  impl: group({
    title: 'main',
    controls: [
      group({title: '2.0', controls: text('my label')}),
      text('1.00')
    ]
  })
})

jb.component('studioHelperSample.table', {
  type: 'control',
  impl: table({
    items: '%$people%',
    fields: [
      field({title: 'name', data: '%name%', width: '400'}),
      field({title: 'age', data: '%age%'})
    ]
  })
})

jb.component('studioHelper.studioPropertiesRich', {
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studioHelperSample.propertiesParamsProf')],
    controls: studio.properties('studioHelperSample.propertiesParamsProf~impl')
  })
})

jb.component('studioHelper.studioProperties', {
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studioHelperSample.propertiesTgp')],
    controls: studio.properties('studioHelperSample.propertiesTgp~impl')
  })
})

jb.component('studioHelper.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      studioHelper.studioProperties(),
      studio.scriptHistory()
    ]
  })
})

jb.component('studioHelper.editFile', {
  type: 'control',
  impl: editableText({
    databind: ctx => jb.studio.host.getFile('/projects/studio-helper/studioHelper.js'),
    style: editableText.codemirror({
      cm_settings: {
        extraKeys: {
          'Ctrl-Enter': ctx => {
                  ctx.vars.editor().formatComponent()
                },
          'Ctrl-Space': ctx => {
                  const cmEditor = ctx.vars.editor().cmEditor
                  cmEditor.showHint({ hint: jb.textEditor.cm_hint })
                }
        }
      },
      height: '100%'
    }),
    features: {'$': 'textEditor.init', '$byValue': []}
  })
})

jb.component('studioHelperSample.propertiesParams', {
  type: 'control',
  params: [
    {id: 'simpleStr', as: 'string', description: 'simpler than str'},
    {id: 'strAsComp', as: 'string'},
    {id: 'strAsJs', as: 'string'},
    {id: 'enumStr', as: 'string', options: 'a,b,c'},
    {id: 'enumNum', as: 'number', options: '1,2,3'},
    {id: 'boolTrue', type: 'boolean', as: 'boolean'},
    {id: 'boolFalse', type: 'boolean', as: 'boolean', description: 'desc'},
    {id: 'boolAsComp', type: 'boolean', as: 'boolean'},
    {id: 'boolAsJs', type: 'boolean', as: 'boolean'},
    {id: 'boolAsExp', type: 'boolean', as: 'boolean'},
    {id: 'style', type: 'button.style', defaultValue: button.mdcIcon()},
    {id: 'groupStyle', type: 'group.style'},
    {id: 'action', type: 'action'},
    {id: 'features', type: 'feature[]'}
  ],
  impl: group({

  })
})

jb.component('studioHelperSample.propertiesParamsProf', {
  type: 'contsdfdswqeqweqwewqe',
  impl: studioHelperSample.propertiesParams({
    simpleStr: 'adasdas',
    strAsComp: pipeline(
      remark('asad'),
      split({separator: ',', text: '1,2,3,4,5,6,7,8'}),
      '%%',
      count('%%'),
      count('%%'),
      pipeline(pipeline(suffix(undefined, '%%')))
    ),
    strAsJs: ctx => ctx.vars.aa,
    enumStr: 'c',
    enumNum: '1',
    boolTrue: true,
    boolFalse: 'false',
    boolAsComp: pipeline('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '%%==\"a\"'),
    boolAsJs: ctx => ctx.vars.aa,
    boolAsExp: '%$person/male%',
    style: button.href(),
    features: [text.bindText(), mdcStyle.initDynamic()]
  }),
  '$vars': {

  }
})

jb.component('studioHelperSample.propertiesPTForTgp', {
  type: 'control',
  params: [
    {id: 'style1', type: 'button.style'},
    {id: 'style2', type: 'button.style'}
  ],
  impl: group({

  })
})

jb.component('studioHelperSample.propertiesTgp', {
  type: 'xx',
  impl: studioHelperSample.propertiesPTForTgp(
    button.x(),
    button.x()
  )
})

jb.component('studioHelper.editStyle', {
  type: 'control',
  impl: group({
    controls: [
      studio.styleEditor('studioHelperSample.customStyleComp~impl~style')
    ]
  })
})

jb.component('studioHelperSample.componentHeader', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title12', as: 'string', dynamic: true},
    {id: 'style11', type: 'group.style', defaultValue: layout.vertical(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ''
})


jb.component('studioHelperSample.control', { /* studioHelperSample.control */
  type: 'control',
  impl: group({
    title: pipeline('main'),
    controls: [
      group({title: '2.0', controls: [text('my label'), text('fdsfsdfd')]}),
      text('1.00')
    ]
  })
})

