dsl('zui')

component('card', {
  type: 'control',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'description', as: 'string', dynamic: true},
    {id: 'style', type: 'card-style', defaultValue: card(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('card', {
  type: 'card-style',
  params: [],
  impl: features(
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
      const fontSize = Math.floor(Math.min(14,Math.sqrt(itemSize[0])))
      jb.zui.setCss(`dynamic-${cmp.clz}`, `.${cmp.clz}>.title { font-size: ${fontSize+2}px; }
      .${cmp.clz}>.description { font-size: ${fontSize}px; }` )
    }),
    css(`
    .%$cmp/clz% { padding: 2px 3px;
      margin: 2px 5px;
      border-radius: 10px;
      background-color: #efefef; }
    .%$cmp/clz%>.description { padding-right: 3px}`),
    htmlOfItem(`<div class="%$cmp/clz%">
    <div class="title">%$$model/title()%</div> <div class="description">%$$model/description()%</div>
    </div>`)
  )
})
