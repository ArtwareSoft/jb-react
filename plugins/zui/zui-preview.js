
jb.component('zui.itemPreview', {
  type: 'control',
  impl: group({
    style: group.sections(header.h3()),
    controls: [
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/zuiState%', keys()),
        genericControl: group({
          title: pipeline(tgp.shortCompName('%$path%')),
          style: propertySheet.titlesAbove(),
          controls: dynamicControls({
            controlItems: pipeline('%$zuiCtx/props/zuiState%', property('%$path%'), entries()),
            genericControl: text(pipeline('%$prop/1%', formatNumber(), join()), '%$prop/0%'),
            itemVariable: 'prop'
          }),
          features: css.margin({left: '30px'})
        }),
        itemVariable: 'path'
      })
    ],
    features: [id('itemPreview'), css.width('400')]
  }),
  circuit1: 'zuiTest.itemlist'
})

jb.component('zui.stateOfItemView', {
  params: [
    {id: 'itemView', type: 'view<zui>', dynamic: true, mandatory: true},
    {id: 'pos', as: 'string', description: 'top,left,width,height', defaultValue: '0,0,100,100'},
    {id: 'zoom', as: 'number', defaultValue: 4},
    {id: 'DIM', as: 'number', defaultValue: 128},
  ],
  impl: pipeline(Var('zuiState', obj()), Var('$props',({},{},{zoom,DIM}) => ({zoom, DIM})),
    (ctx,{},{itemView,pos,zoom}) => {
      const [top, left,width,height] = pos
      return itemView(ctx).layout({zoom,top, left,width,height})
    }, '%$zuiState%')
})
