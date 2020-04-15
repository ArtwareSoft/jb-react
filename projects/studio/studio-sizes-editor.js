Object.assign(jb.ui, {
})

jb.component('studio.openSizesEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'elem'},
  ],
  impl: runActions(
    Var('inplaceElem', (ctx,{inplaceElem},{path,elem})=> {
        const el = elem || inplaceElem || (jb.studio.findElemsByCtxCondition(ctx => ctx.path == path)[0] || {}).elem
        if (!el) debugger
        return el
    }),
    Var('path','%$path%'),
    openDialog({
      id: 'sizesEditor',
      style: dialog.popup(),
      content: sizesEditor.editor(),
    }),
  )
})

jb.component('sizesEditor.cssSizes', {
    params: [
      {id: 'step', as: 'number', defaultValue: 30}
    ],
    impl: (ctx,step) => {
      const levels = ['margin','padding','inner']
      const background = ['#f9cc9d','#c3deb7','']
      const size = step * (levels.length * 2 + -1)
      const sides = {left: [0,0,0,1], top:[0,0,1,0], right:[1,0,1,1], bottom:[0,1,1,1]}
      return Object.keys(sides).flatMap(sideKey=>levels.map((levelKey,level)=>{
        const side = sides[sideKey]
        const length = level * step, other = size - length
        const left = side[0] ? other : length
        const top = side[1] ? other: length
        const width =  (side[2] - side[0]) ? size - 2 * length + step : step
        const height = (side[3] - side[1]) ? size - 2 * length + step : step
        return { side: sideKey, level: levelKey,
            css: `left:${left}px; top:${top}px; width:${width}px; height:${height}px; background: ${background[level]}`
        }
      })).filter(x=>x.level != 'inner')
    }
})

jb.component('sizesEditor.computedContent', {
    type: 'control',
    impl:ctx => {
        const style = jb.studio.previewWindow.getComputedStyle(ctx.vars.inplaceElem)
        return style[jb.macroName(ctx.exp('%level%-%side%'))]
    }
})

jb.component('sizesEditor.widthHeight', {
    type: 'control',
    params: [
        {id:'prop', as: 'string'},
        {id:'top', as: 'string'},
    ],
    impl: button({
        title: (ctx,{},{prop}) => `${prop}: ` + jb.studio.previewWindow.getComputedStyle(ctx.vars.inplaceElem)[prop],
        action: runActions(
          writeValue('%$studio/profile_path%', '%$path%'),
          studio.openProperties(
              true,
              studio.getOrCreateCompInArray('%$path%~features', 'css.%$prop%')
            ),
          dialog.closeContainingPopup()
        ),
        features: css(`{position: absolute; top: %$top%; left: 65px; font-size: 9px; width: 100px;} 
        ~:hover { font-size: 16px; background: white; z-index: 10000}`),
        style: button.href()
      })
})

jb.component('sizesEditor.prop', {
    type: 'control',
    params: [
        {id:'prop', as: 'string'},
        {id:'css', as: 'string'},
    ],
    impl: button({
        title: '%$prop%',
        action: runActions(
          writeValue('%$studio/profile_path%', '%$path%'),
          studio.openProperties(
              true,
              studio.getOrCreateCompInArray('%$path%~features', 'css.%$prop%')
            ),
          dialog.closeContainingPopup()
        ),
        features: css(`{position: absolute; %$css%; font-size: 9px; }`),
        style: button.href()
      })
})

jb.component('sizesEditor.editor', {
  type: 'control',
  impl: group({
    controls: [
        text({text:'', features: css('position: absolute; top: 65px; left: 65px; width: 60px; height: 60px; background: white') }),
        text({text:'', features: css('position: absolute; top: 175px; left: 0; width: 180px; height: 16px; background: white') }),
        sizesEditor.widthHeight('width','73px'),
        sizesEditor.widthHeight('height','85px'),
        sizesEditor.prop('boxShadow','top: 175px; left: 0px;'),
        sizesEditor.prop('border','top: 175px; left: 75px;'),
        sizesEditor.prop('borderRadius','top: 175px; left: 126px;'),
      dynamicControls({
        controlItems: sizesEditor.cssSizes(),
        genericControl: group({
          controls: [
            button({
              title: sizesEditor.computedContent(),
              action: runActions(
                writeValue('%$studio/profile_path%', '%$path%'),
                studio.openProperties(
                    true,
                    studio.getOrCreateCompInArray('%$path%~features', 'css.%level%')
                  ),
                dialog.closeContainingPopup()
              ),
              style: button.href()
            })
          ],
          features: [
            css(
              'position: absolute; display: flex; justify-content: center; align-items: center;%css%'
            ),
            feature.hoverTitle('%level%-%side%'),
            css('>a {font-size: 8px} ~:hover a { font-size: 16px; background: white}')
          ]
        })
      })
    ]
  })
})
