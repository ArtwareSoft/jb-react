
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
