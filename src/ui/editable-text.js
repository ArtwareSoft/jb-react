var {editableText} = jb.ns('editableText')

jb.component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editableText.xButton', {
  type: 'feature',
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
