using('ui-common')

component('editableText.xButton', {
  type: 'feature',
  category: 'editableText:80',
  impl: features(
    method('cleanValue', writeValue('%$$model/databind()%', '')),
    templateModifier(({},{vdom,databind}) => jb.ui.h('div', {},[
        vdom,
        ...(databind ? [jb.ui.h('button', { class: 'delete', onclick: 'cleanValue' } ,'×')]  : [])
    ])),
    css(
      `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
    )
  )
})

component('editableText.textarea', {
  type: 'editable-text-style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: customStyle({
    template: (cmp,{databind,rows,cols},h) => h('textarea', {
        rows: rows, cols: cols, value: databind, onchange: true, onkeyup: true, onblur: true  }),
    features: field.databindText(0, '%$oneWay%')
  })
})

component('editableText.expandable', {
  description: 'label that changes to editable class on double click',
  type: 'editable-text-style',
  params: [
    {id: 'buttonFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'editableFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'buttonStyle', type: 'button-style', dynamic: true, defaultValue: button.href()},
    {id: 'editableStyle', type: 'editable-text-style', dynamic: true, defaultValue: editableText.input()},
    {id: 'onToggle', type: 'action', dynamic: true}
  ],
  impl: styleByControl({
    control: group({
      controls: [
        editableText({
          databind: '%$editableTextModel/databind%',
          style: call('editableStyle'),
          features: [
            watchRef('%$editable%', { allowSelfRefresh: true }),
            hidden('%$editable%'),
            method('exitEditable', runActions(writeValue('%$editable%', false), call('onToggle'))),
            method('regainFocus', action.focusOnCmp()),
            frontEnd.flow(source.frontEndEvent('blur'), sink.BEMethod('exitEditable')),
            frontEnd.flow(
              source.frontEndEvent('keyup'),
              rx.filter(or('%keyCode%==13','%keyCode%==27')),
              sink.BEMethod('exitEditable')
            ),
            (ctx,{},{editableFeatures}) => editableFeatures(ctx)
          ]
        }),
        button({
          title: '%$editableTextModel/databind%',
          action: runActions(
            writeValue('%$editable%', true),
            (ctx,{expandableContext}) => expandableContext.regainFocus && expandableContext.regainFocus(),
            call('onToggle')
          ),
          style: call('buttonStyle'),
          features: [
            watchRef('%$editable%', { allowSelfRefresh: true }),
            hidden(not('%$editable%')),
            (ctx,{},{buttonFeatures}) => buttonFeatures(ctx)
          ]
        })
      ],
      features: [
        watchable('editable'),
        variable('expandableContext', obj())
      ]
    }),
    modelVar: 'editableTextModel'
  })
})