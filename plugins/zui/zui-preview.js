
jb.component('zui.itemPreview', {
  type: 'control',
  impl: group({
    style: group.sections(header.h3()),
    controls: [
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/renderProps%', keys()),
        genericControl: group({
          title: pipeline('%$path%', '%%-%$zuiCtx/props/renderProps/{%%}/title%'),
          style: propertySheet.titlesAbove(),
          controls: dynamicControls({
            controlItems: pipeline(
              '%$zuiCtx/props/renderProps%',
              property('%$path%'),
              properties(),
              filter(not(inGroup(list('path', 'title', 'axis'), '%id%')))
            ),
            genericControl: text(pipeline('%$prop/val%', formatNumber(), join()), '%$prop/id%'),
            itemVariable: 'prop'
          }),
          features: css.margin({left: '30px'})
        }),
        itemVariable: 'path'
      })
    ],
    features: [id('itemPreview'), css.width('400')]
  }),
  circuit: 'zuiTest.itemlist'
})

jb.component('zui.stateOfItemView', {
  params: [
    {id: 'itemView', type: 'view<zui>', dynamic: true, mandatory: true},
    {id: 'pos', as: 'string', description: 'top,left,width,height', defaultValue: '0,0,100,100'},
    {id: 'zoom', as: 'number', defaultValue: 4},
    {id: 'DIM', as: 'number', defaultValue: 128},
  ],
  impl: pipeline(Var('renderProps', obj()), Var('$props',({},{},{zoom,DIM}) => ({zoom, DIM})),
    (ctx,{},{itemView,pos,zoom}) => {
      const [top, left,width,height] = pos
      return itemView(ctx).layout({zoom,top, left,width,height})
    }, '%$renderProps%')
})
