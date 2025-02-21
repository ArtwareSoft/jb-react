using('ui-styles')

component('zui.itemPreview', {
  type: 'control',
  impl: group({
    controls: [
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/elemsLayoutProps%', properties()),
        genericControl: group({
          controls: dynamicControls({
            controlItems: pipeline('%$elemLayoutProps/val%', properties(), filter(not(inGroup(list('path','title','axis'), '%id%')))),
            genericControl: text(pipeline('%$prop/val%', formatNumber(), join()), '%$prop/id%'),
            itemVariable: 'prop'
          }),
          title: pipeline('%$elemLayoutProps/val/path% - %$elemLayoutProps/val/title%'),
          style: propertySheet.titlesAbove(),
          features: css.margin({ left: '30px' })
        }),
        itemVariable: 'elemLayoutProps'
      })
    ],
    style: group.sections(header.h3()),
    features: [css.width('400'), id('itemPreview')]
  }),
  circuit: 'zuiTest.itemlist'
})

component('zui.itemPreviewTable', {
  type: 'control',
  impl: group({
    controls: [
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/elemsLayoutProps%', properties()),
        genericControl: group({
          controls: dynamicControls({
            controlItems: pipeline('%$elemLayoutProps/val%', properties(), filter(not(inGroup(list('axis'), '%id%')))),
            genericControl: text(pipeline('%$prop/val%', formatNumber(), join()), '%$prop/id%'),
            itemVariable: 'prop'
          }),
          style: propertySheet.titlesAbove(),
          features: css.margin({ left: '30px' })
        }),
        itemVariable: 'elemLayoutProps'
      })
    ],
    style: group.sections(header.h3()),
    features: [css.width('400'), id('itemPreview')]
  }),
  circuit: 'zuiTest.itemlist'
})

component('zui.itemViewProps', {
  type: 'control',
  impl: group({
    controls: dynamicControls({
      controlItems: pipeline('%$zuiCtx/props/elemsLayoutProps/itemView%', properties()),
      genericControl: text(pipeline('%$prop/val%', formatNumber(), join()), '%$prop/id%'),
      itemVariable: 'prop'
    }),
    style: propertySheet.titlesAbove(),
    features: css.margin({ left: '30px' })
  }),
  circuit: 'zuiTest.itemlist'
})

component('zui.visualItemPreview', {
  type: 'control',
  impl: group({
    controls: [
      zui.itemViewProps(),
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/elemsLayoutProps%', values(), filter('%size/1%'), filter('%title% != group')),
        genericControl: text('%$box/title%', {
          style: text.span(),
          features: [
            css.width('%$box/size/0%px'),
            css.height('%$box/size/1%px'),
            feature.onHover(
              openDialog({
                title: '%$box/path% - %$box/title%',
                content: group({
                  controls: dynamicControls({
                    controlItems: pipeline('%$box%', properties(), filter(not(inGroup(list('path','title','axis'), '%id%')))),
                    genericControl: text(pipeline('%$prop/val%', formatNumber(), join()), '%$prop/id%'),
                    itemVariable: 'prop'
                  }),
                  style: propertySheet.titlesAbove(),
                  features: css.margin({ left: '30px' })
                }),
                features: [
                  nearLauncherPosition(),
                  unique('zui-preview')
                ]
              })
            ),
            css('position: absolute; background: red; opacity: 0.5; left: %$box/pos/0%px; top: %$box/pos/1%px')
          ]
        }),
        itemVariable: 'box'
      })
    ],
    features: [
      feature.if(() => !jb.ui.isMobile()),
      css.width('400'),
      id('itemPreview'),
      css('position: relative')
    ]
  }),
  circuit: 'zuiTest.itemlist'
})

component('zui.stateOfItemView', {
  params: [
    {id: 'itemView', type: 'view<zui>', dynamic: true, mandatory: true},
    {id: 'pos', as: 'string', description: 'top,left,width,height', defaultValue: '0,0,100,100'},
    {id: 'zoom', as: 'number', defaultValue: 4},
    {id: 'DIM', as: 'number', defaultValue: 128}
  ],
  impl: pipeline(
    Var('elemsLayoutProps', obj()),
    Var('$props', ({},{},{zoom,DIM}) => ({zoom, DIM})),
    (ctx,{},{itemView,pos,zoom}) => {
      const [top, left,width,height] = pos
      return itemView(ctx).layout({zoom,top, left,width,height})
    },
    '%$elemsLayoutProps%'
  )
})
