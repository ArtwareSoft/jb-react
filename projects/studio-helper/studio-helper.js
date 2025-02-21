studio.inspectedJb = jb.ui.parentFrameJb()

// component('dataTest.parseProjectHtml', {
//   impl: dataTest({
//     calculate: pipeline(
//       list('%$html-dev%', '%$html-user%', '%$html-cloud%'),
//       {'$': 'studio.parseProjectHtml'},
//       prettyPrint()
//     ),
//     expectedResult: true
//   })
// })

component('studioHelper.main', {
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  type: 'control',
  impl: studio.topBar(
    Var('simulateProfilePath', '%$path%')
  )
})

component('studioHelper.eventTracker', {
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

component('studioHelper.compInspector', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical(3),
    controls: [
      itemlist({
        items: list(1, 2, 3),
        controls: text('%%'),
        features: [id('itemlist1'), itemlist.selection()]
      }),
      group({controls: studio.compInspector(() => ({
          cmpId: document.querySelector('#itemlist1').getAttribute('cmp-id'),
          frameUri: 'preview'
        })), features: group.wait(delay(10))})
    ]
  })
})

component('studioHelper.editableSource', {
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  type: 'control',
  impl: group({
    controls: studio.editableSource('%$path%')
  })
})

component('studioHelper.pages', {
  type: 'control',
  impl: studio.pages(

  )
})

component('studioHelper.controlTree', {
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studioHelperSample.control'}
  ],
  impl: studio.controlTree(
    Var('simulateProfilePath', '%$path%')
  )
})

component('studioHelper.pickProfile', {
  type: 'control',
  impl: studio.pickProfile(
    'studioHelperSample.button~action'
  )
})

component('studioHelper.jbEditor', {
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
            databind: sourceEditor.profileAsText('%$jbEditorCntrData/selected%'),
            style: editableText.textarea({}),
            features: [css.width('300'), css.height('200'), css.margin({left: '10'})]
          })
        ],
        features: [watchRef('%$jbEditorCntrData/selected%')]
      })
    ],
    features: [css('{ height: 200px; padding: 50px }')]
  })
})

component('studioHelper.jbEditor.callbag', {
  type: 'control',
  impl: group({
    controls: [
      studio.jbEditor('dataTest.callbag.pipe~impl')
    ],
    features: [
      css('{ height: 200px; padding: 50px }'),
      //studio.jbEditorContainer({id: 'helper', initialSelection: 'dataTest.callbag.pipe~impl~calculate~items~0~elems~0', circuit: 'dataTest.callbag.pipe'})
    ]
  })
})

component('studioHelper.inteliTree', {
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
    features: [css('{ height: 200px; padding: 50px }')]
  })
})

component('studioHelper.contentEditablePosition', {
  type: 'control',
  impl: text({
    text: 'hello',
    style: header.mdcHeadline2(),
    features: [
      frontEnd.init(({},{cmp}) => jb.ui.contentEditable.activate(cmp.base)),
      css.padding({ bottom: '40'}),
    ]
  })
})

component('studioHelperDummy.simpleLabel', {
  type: 'control',
  impl: text({
    vars: [Var('check', 2)],
    title: 'hello',
    style: text.span(),
    features: [css('{ color: red }'), css.padding({top: '20', left: '160'})]
  })
})

component('studioHelperSample.button', {
  type: 'control',
  impl: button(
    'btn1'
  ),
  action: dialog.closeAll(

  )
})

component('studioHelperSample.control', {
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

component('studioHelper.emptyGroup', {
  type: 'control',
  impl: group({
    controls: [
      text({text: pipeline(''), title: 'my title'})
    ]
  })
})

component('studioHelper.selectControl', {
  type: 'control',
  impl: studio.selectProfile({
    type: 'control'
  })
})

component('studioHelper.selectFeature', {
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

component('studioHelper.features', {
  type: 'control',
  impl: group({
    title: 'features',
    controls: [
      {
        '$': 'studio.propertyArray',
        '$unresolved': ['studioHelperDummy.simpleLabel~impl~features']
      }
    ]
  })
})

component('studioHelperSample.control2', {
  type: 'control',
  impl: group({
    title: 'main',
    controls: [
      group({title: '2.0', controls: text('my label')}),
      text('1.00')
    ]
  })
})

component('studioHelperSample.table', {
  type: 'control',
  impl: table({
    items: '%$people%',
    fields: [
      field({title: 'name', data: '%name%', width: '400'}),
      field({title: 'age', data: '%age%'})
    ]
  })
})

// jb.component('studioHelper.studioPropertiesPptr', {
//   type: 'control',
//   impl: group({
//     vars: [Var('circuit', 'studioHelperSample.pptr')],
//     title: '',
//     controls: studio.properties('studioHelperSample.pptr'),
//     features: css.width('500')
//   })
// })

component('studioHelper.studioPropertiesRich', {
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studioHelperSample.propertiesParamsProf')],
    controls: studio.properties('studioHelperSample.propertiesParamsProf~impl')
  })
})

component('studioHelper.studioProperties', {
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studioHelperSample.propertiesTgp')],
    controls: studio.properties('studioHelperSample.propertiesTgp~impl')
  })
})

component('studioHelper.scriptHistory', {
  type: 'control',
  impl: group({
    controls: [
      studioHelper.studioProperties(),
      studio.scriptHistory()
    ]
  })
})

component('studioHelperSample.propertiesParams', {
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
    {id: 'style', type: 'button-style', defaultValue: button.mdcIcon()},
    {id: 'groupStyle', type: 'group-style'},
    {id: 'action', type: 'action'},
    {id: 'features', type: 'feature[]'}
  ],
  impl: group({

  })
})

component('studioHelperSample.propertiesParamsProf', {
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
})

// jb.component('studioHelperSample.pptr', {
//   impl: pptr.session({
//     showBrowser: true,
//     databindEvents: '%$events%',
//     actions: [
//       pptr.newPage({url: 'https://google.com/', waitUntil: 'networkidle0'}),
//       pptr.type({
//         text: 'vitamin',
//         selector: 'input[name=q]',
//         enterAtEnd: true,
//         delay: 100
//       }),
//       pptr.extractBySelector({selector: 'h3', extract: 'textContent', multiple: true})
//     ]
//   })
// })

component('studioHelperSample.propertiesPTForTgp', {
  type: 'control',
  params: [
    {id: 'style1', type: 'button-style'},
    {id: 'style2', type: 'button-style'}
  ],
  impl: group({

  })
})

component('studioHelperSample.propertiesTgp', {
  type: 'xx',
  impl: studioHelperSample.propertiesPTForTgp(
    button.x(),
    button.x()
  )
})

component('studioHelper.editStyle', {
  type: 'control',
  impl: group({
    controls: [
      studio.styleEditor('studioHelperSample.customStyleComp~impl~style')
    ]
  })
})

component('studioHelperSample.componentHeader', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title12', as: 'string', dynamic: true},
    {id: 'style11', type: 'group-style', defaultValue: layout.vertical(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ''
})


component('studioHelperSample.control3', { /* studioHelperSample.control */
  type: 'control',
  impl: group({
    title: pipeline('main'),
    controls: [
      group({title: '2.0', controls: [text('my label'), text('fdsfsdfd')]}),
      text('1.00')
    ]
  })
})

