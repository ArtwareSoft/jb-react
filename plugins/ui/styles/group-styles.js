component('group.section', {
  type: 'group-style',
  impl: group.htmlTag('section')
})

component('group.ulLi', {
  type: 'group-style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul.jb-itemlist',{},
        ctrls.map(ctrl=> h('li', {class: 'jb-item'} ,h(ctrl)))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: group.initGroup()
  })
})

component('group.accordion', {
  type: 'group-style',
  params: [
    {id: 'titleStyle', type: 'button-style', dynamic: true, defaultValue: button.href()},
    {id: 'sectionStyle', type: 'group-style', dynamic: true, defaultValue: group.section()},
    {id: 'innerGroupStyle', type: 'group-style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl({
    control: group({
      controls: dynamicControls({
        controlItems: '%$$sectionsModel/controls%',
        genericControl: group({
          controls: [
            button('%$section/field()/title()%', writeValue('%$selectedTab%', '%$sectionIndex%'), {
              style: call('titleStyle'),
              raised: '%$sectionIndex% == %$selectedTab%',
              features: [
                css.width('%$width%'),
                css('{justify-content: left}'),
                watchRef('%$selectedTab%'),
                ctx => ctx.run({ $: 'features', features: (ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x) }, 'feature<>')
              ]
            }),
            group('%$$sectionsModel/controls[{%$sectionIndex%}]%', {
              style: call('innerGroupStyle'),
              features: [
                feature.if('%$sectionIndex% == %$selectedTab%'),
                watchRef('%$selectedTab%')
              ]
            })
          ],
          style: call('sectionStyle')
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      }),
      features: watchable('selectedTab', 0)
    }),
    modelVar: '$sectionsModel'
  })
})

component('group.sections', {
  type: 'group-style',
  params: [
    {id: 'titleStyle', type: 'text-style', dynamic: true, defaultValue: header.mdcHeaderWithIcon()},
    {id: 'sectionStyle', type: 'group-style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group-style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl({
    control: group(
      dynamicControls({
        controlItems: '%$$sectionsModel/controls%',
        genericControl: group({
          controls: [
            text('%$section/field()/title()%', {
              style: call('titleStyle'),
              features: ctx => ctx.run({ $: 'features', features: (ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x) }, 'feature<>')
            }),
            group('%$section%', { style: call('innerGroupStyle') })
          ],
          title: '',
          style: call('sectionStyle')
        }),
        itemVariable: 'section'
      })
    ),
    modelVar: '$sectionsModel'
  })
})

component('group.sectionExpandCollapse', {
  type: 'group-style',
  params: [
    {id: 'titleCtrl', type: 'control', dynamic: true, defaultValue: text('%$$sectionsModel.title()%', { style: header.h2() })},
    {id: 'toggleStyle', type: 'editable-boolean-style', defaultValue: editableBoolean.expandCollapse()},
    {id: 'autoExpand', as: 'boolean', type: 'boolean'}
  ],
  impl: styleByControl({
    control: group({
      controls: [
        group(editableBoolean('%$sectionExpanded%', call('toggleStyle')), call('titleCtrl'), {
          layout: layout.flex('row', 'start', { alignItems: 'center' })
        }),
        group(controlWithCondition('%$sectionExpanded%', '%$$sectionsModel/controls%'), {
          features: watchRef('%$sectionExpanded%')
        })
      ],
      features: watchable('sectionExpanded', '%$autoExpand%')
    }),
    modelVar: '$sectionsModel'
  })
})

component('group.sectionsExpandCollapse', {
  type: 'group-style',
  params: [
    {id: 'autoExpand', as: 'boolean', type: 'boolean'},
    {id: 'titleStyle', type: 'text-style', dynamic: true, defaultValue: header.h2()},
    {id: 'toggleStyle', type: 'editable-boolean-style', defaultValue: editableBoolean.expandCollapse()},
    {id: 'titleGroupStyle', type: 'group-style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group-style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl({
    control: group(
      dynamicControls({
        controlItems: '%$$sectionsModel/controls%',
        genericControl: group({
          controls: [
            group({
              controls: [
                editableBoolean('%$sectionExpanded%', call('toggleStyle')),
                text('%$section/field()/title()%', { style: call('titleStyle') })
              ],
              layout: layout.flex('row', 'start', { alignItems: 'center' }),
              style: call('titleGroupStyle')
            }),
            group(controlWithCondition('%$sectionExpanded%', '%$$sectionsModel/controls[{%$sectionIndex%}]%'), {
              style: call('innerGroupStyle'),
              features: watchRef('%$sectionExpanded%')
            })
          ],
          features: watchable('sectionExpanded', '%$autoExpand%')
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      })
    ),
    modelVar: '$sectionsModel'
  })
})
