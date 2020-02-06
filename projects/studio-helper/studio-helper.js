jb.ns('studio-helper')
jb.studio.initCompsRefHandler(jb)
jb.studio.previewWindow = window
// fake current path
jb.delay(100).then(()=>new jb.jbCtx().run(runActions(writeValue('%$studio/project%','studio-helper')),writeValue('%$studio/page%','topBar') ))

jb.component('data-test.parse-project-html', {
  impl: dataTest({
    calculate: pipeline(
      list('%$html-dev%', '%$html-user%', '%$html-cloud%'), studio.parseProjectHtml(), prettyPrint()),
    expectedResult: true
  })
})

jb.component('studio-helper.top-bar', { /* studioHelper.topBar */
  params: [
    {id: 'path', defaultValue: 'studio-helper-sample.control'}
  ],
  type: 'control',
  impl: studio.topBar(
    Var('simulateProfilePath', '%$path%')
  )
})

jb.component('studio-helper.event-tracker', { /* studioHelper.eventTracker */
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical(3),
    controls: [
      editableText({databind: '%$globals/test1%', style: editableText.mdcInput()}),
      label({text: '%$globals/test1%', style: label.span()}),
      studio.eventTracker()
    ]
  })
})

jb.component('studio-helper.editable-source', { /* studioHelper.editableSource */
  params: [
    {id: 'path', defaultValue: 'studio-helper-sample.control'}
  ],
  type: 'control',
  impl: group({
    controls: studio.editableSource('%$path%')
  })
})

jb.component('studio-helper.pages', { /* studioHelper.pages */
  type: 'control',
  impl: studio.pages()
})

jb.component('studio-helper.control-tree', { /* studioHelper.controlTree */
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studio-helper-sample.control'}
  ],
  impl: studio.controlTree(
    Var('simulateProfilePath', '%$path%')
  )
})

jb.component('studio-helper.pick-profile', { /* studioHelper.pickProfile */
  type: 'control',
  impl: studio.pickProfile(
    'studio-helper-sample.button~action'
  )
})

jb.component('studio-helper.jb-editor', { /* studioHelper.jbEditor */
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studio-helper-sample.component-header'}
  ],
  impl: group({
    title: 'main',
    layout: layout.flex('flex-start'),
    controls: [
      studio.jbEditor('studio-helper-sample.properties-params-prof'),
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

jb.component('studio-helper.inteli-tree', { /* studioHelper.inteliTree */
  type: 'control',
  params: [
    {id: 'path', defaultValue: 'studio-helper.empty-group'}
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

jb.component('studio-helper.content-editable-position', { /* studioHelper.contentEditablePosition */
  type: 'control',
  impl: text({
    text: 'hello',
    style: header.mdcHeadline2(),
    features: [
      interactive(
        (ctx,{cmp}) => jb.ui.contentEditable.activate(cmp)
      ),
      css.height('100'),
      css.padding({top: '', bottom: '40'}),
      css('background: grey')
    ]
  })
})

jb.component('studio-helper-dummy.simple-label', { /* studioHelperDummy.simpleLabel */
  type: 'control',
  impl: label({
    vars: [Var('check', 2)],
    title: 'hello',
    style: label.span(),
    features: [css('{ color: red }'), css.padding({top: '20', left: '160'})]
  })
})

jb.component('studio-helper-sample.button', { /* studioHelperSample.button */
  type: 'control',
  impl: button(
    'btn1'
  ),
  action: dialog.closeAll(

  )
})

jb.component('studio-helper-sample.control', { /* studioHelperSample.control */
  type: 'control',
  impl: group({
    title: pipeline('main'),
    controls: [
      group({
        title: '2.0',
        controls: [
          label('my label'),
          label('fdsfsdfd')
        ]
      }),
      label('1.00')
    ]
  })
})

jb.component('studio-helper-dummy.label', { /* studioHelperDummy.label */
  type: 'control',
  impl: label({
    title: pipeline(
      '%%',
      '%$people-array/people%',
      '%name% aa aa a a a a a sa fds ds f sd fsd fsd fsd fs sdf faaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      {'$': 'object', dd: '%%', mkmk: ''}
    ),
    features: [
      css('{ position: absolute; margin-left: -20px; margin-top: 2px }'),
      hidden(true)
    ]
  })
})

jb.component('studio-helper.group-with-label', { /* studioHelper.groupWithLabel */
  type: 'control',
  impl: group({
    title: '',
    controls: label('hello')
  })
})

jb.component('studio-helper.empty-group', { /* studioHelper.emptyGroup */
  type: 'control',
  impl: group({
    controls: [
      text({text: pipeline(''), title: 'my title'})
    ]
  })
})

jb.component('studio-helper.data-resources', { /* studioHelper.dataResources */
  type: 'control',
  impl: group({
    controls: [
      {'$': 'studio.data-resources'},
      button({style: button.mdc()}),
      button({style: button.mdc()})
    ]
  })
})

jb.component('studio-helper.select-control', { /* studioHelper.selectControl */
  type: 'control',
  impl: studio.selectProfile({
    type: 'control'
  })
})


jb.component('studio-helper.select-feature', { /* studioHelper.selectFeature */
  type: 'control',
  impl: group({
    title: 'select-feature',
    layout: layout.horizontal('53'),
    controls: [
      studio.selectProfile({
        type: 'feature',
        path: 'studio-helper-sample.picklist~impl~features~0'
      })
    ]
  })
})

jb.component('studio-helper.features', { /* studioHelper.features */
  type: 'control',
  impl: group({
    title: 'features',
    controls: [
      studio.propertyArray('studio-helper-dummy.simple-label~impl~features')
    ]
  })
})

jb.component('studio-helper-sample.control', {
  type: 'control',
  impl: group({
    title: 'main',
    controls: [
      group({title: '2.0', controls: label('my label')}),
      label('1.00')
    ]
  })
})

jb.component('studio-helper-sample.table', { /* studioHelperSample.table */
  type: 'control',
  impl: table({
    items: '%$people%',
    fields: [
      field({title: 'name', data: '%name%', width: '400'}),
      field({title: 'age', data: '%age%'})
    ]
  })
})

jb.component('studio-helper.studio-properties-rich', { /* studioHelper.studioPropertiesRich */
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studio-helper-sample.properties-params-prof')],
    controls: studio.properties('studio-helper-sample.properties-params-prof~impl')
  })
})

jb.component('studio-helper.studio-properties', { /* studioHelper.studioProperties */
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studio-helper-sample.properties-tgp')],
    controls: studio.properties('studio-helper-sample.properties-tgp~impl')
  })
})

jb.component('studio-helper1.studio-properties', { /* studioHelper1.studioProperties */
  type: 'control',
  impl: group({
    vars: [Var('circuit', 'studio-helper-sample.picklist')],
    controls: studio.properties('studio-helper-sample.picklist~impl')
  })
})

jb.component('studio-helper.script-history', { /* studioHelper.scriptHistory */
  type: 'control',
  impl: group({
    controls: [
      studioHelper.studioProperties(),
      studio.scriptHistory()
    ]
  })
})

jb.component('studio-helper.edit-file', { /* studioHelper.editFile */
  type: 'control',
  impl: editableText({
    databind: ctx => jb.studio.host.getFile('/projects/studio-helper/studio-helper.js'),
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
    features: textEditor.init()
  })
})

jb.component('studio-helper-sample.properties-params', { /* studioHelperSample.propertiesParams */
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
    {id: 'features', type: 'feature[]'},
  ],
  impl: group({

  })
})

jb.component('studio-helper-sample.properties-params-prof', { /* studioHelperSample.propertiesParamsProf */
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
    features: [label.bindText(), mdcStyle.initDynamic()]
  }),
  '$vars': {

  }
})

jb.component('studio-helper-sample.properties-PT-for-tgp', { /* studioHelperSample.propertiesPTForTgp */
  type: 'control',
  params: [
    {id: 'style1', type: 'button.style'},
    {id: 'style2', type: 'button.style'}
  ],
  impl: group({

  })
})

jb.component('studio-helper-sample.properties-tgp', { /* studioHelperSample.propertiesTgp */
  type: 'xx',
  impl: studioHelperSample.propertiesPTForTgp(
    button.x(),
    button.x()
  )
})

jb.component('studio-helper.edit-style', { /* studioHelper.editStyle */
  type: 'control',
  impl: group({
    controls: [
      studio.styleEditor('studio-helper-sample.custom-style-comp~impl~style')
    ]
  })
})

jb.component('studio-helper-sample.component-header', { /* studioHelperSample.componentHeader */
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title12', as: 'string', dynamic: true},
    {
      id: 'style11',
      type: 'group.style',
      defaultValue: layout.vertical(),
      mandatory: true,
      dynamic: true
    },
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ''
})


jb.component('studio-helper-sample.control', { /* studioHelperSample.control */
  type: 'control',
  impl: group({
    title: pipeline('main'),
    controls: [
      group({title: '2.0', controls: [label('my label'), label('fdsfsdfd')]}),
      label('1.00')
    ]
  })
})


jb.component('studio-helper.comps-chart', { /* studioHelper.compsChart */
  type: 'control',
  impl: group({
    controls: [
      d3g.chartScatter({
        title: 'comps chart',
        items: pipeline(
          studio.allComps(),
          studio.componentStatistics('%%'),
          filter(contains({text: 'projects/studio', allText: '%file%'}))
        ),
        frame: d3g.frame({width: '2400', height: 500, top: 30, right: 50, bottom: 40, left: 60}),
        pivots: [
          d3g.pivot({
            title: 'file',
            value: pipeline(
              '%file%',
              pipeline(split({separator: '-', part: 'but first'}), join('-')),
              split({separator: '.js', part: 'first'})
            ),
            scale: d3g.bandScale({paddingInner: '1', align: '0.5'})
          }),
          d3g.pivot({title: 'line', value: '%lineInFile%', scale: d3g.linearScale()}),
          d3g.pivot({title: 'size', value: '%linesOfCode%', scale: d3g.linearScale()}),
          d3g.pivot({title: 'refs', value: '%refs%'})
        ],
        itemTitle: '%id%',
        onSelectItem: openDialog({content: editableText({databind: prettyPrint('%%')})}),
        onSelectAxisValue: openDialog({content: editableText({databind: prettyPrint('%%')})}),
        visualSizeLimit: '10000'
      })
    ]
  })
})

jb.component('studio-helper.parse-project-html', { /* studioHelper.parseProjectHtml */
  type: 'data',
  impl: obj(
    prop(
        'files',
        pipeline(
          extractText({
              startMarkers: ['<script', 'src=\"'],
              endMarker: '\"',
              repeating: 'true'
            }),
          filter(and(notContains(['/loader/']), notContains(['/dist/']))),
          extractSuffix('/')
        )
      ),
    prop(
        'libs',
        list(
          pipeline(
              extractText({startMarkers: ['modules=\"'], endMarker: '\"', repeating: 'true'}),
              split(','),
              filter(and(notEquals('common'), notEquals('ui-common'))),
              '%%.js'
            ),
          pipeline(
              extractText({startMarkers: ['/dist/'], endMarker: '\"', repeating: 'true'}),
              filter(notEquals('jb-react-all.js')),
              filter(notEquals('material.css'))
            )
        )
      )
  )
})
