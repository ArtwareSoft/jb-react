dsl('zui')

component('fillColor', {
  type: 'feature',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale', defaultValue: index()},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: colorScaleAtt('fillColor', '%$unitScale()%', '%$colorScale%')
})

component('borderColor', {
  type: 'feature',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale', defaultValue: index()},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: colorScaleAtt('borderColor', '%$unitScale()%', '%$colorScale%')
})

component('colorScaleAtt', {
  type: 'feature',
  macroByValue: true,
  params: [
    {id: 'glVar', as: 'string', description: 'e.g. fillColor', defaultValue: 'fillColor'},
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale', defaultValue: index()},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: (ctx,glVar,unitScaleF,colorScale) => {
        const unitScale = unitScaleF()
        const glAtt = ({ glVar, size: 3, glType: 'vec3', calc: ctx2 => ctx2.vars.items.map(calcColor) })
        return ({glAtt, srcPath: ctx.path})

        function calcColor(item) {
            const index = Math.floor(unitScale(item) * colorScale.length *0.9999)
            return colorScale[index] ? colorScale[index].color.map(x=>x/255) : [1,1,1]
        }
    }
})

component('unitScale', {
  type: 'unit_scale',
  params: [
    {id: 'att', as: 'string', defaultValue: 'index' },
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
  ],
  impl: (ctx, _att, calc) => {
    const items = ctx.vars.items || []
    const att = `fixed_${_att}`
    items.forEach((item,i) => item[att] = calc.profile ? calc(ctx.setData(item)) : _att == 'index' ? i : +item[_att] )
    items.sort((i1,i2) => i1[att] - i2[att])
    const range = [items[0][att] || 0,items.slice(-1)[0][att] || 0]
    if (range[0] == range[1]) {
        jb.logError(`zui empty range for ${att}`,{ctx})
        return () => 0
    }
    return item=> ((+item[att] || 0)-range[0])/(range[1]-range[0])
  }
})

component('index', {
    type: 'unit_scale',
    impl: unitScale('index')
})

component('fixedFillColor', {
  type: 'feature',
  params: [
    {id: 'color', mandatory: true, as: 'string'}
  ],
  impl: uniforms(vec3('fillColor', zui.colorToRGB('%$color%')))
})

component('fixedBorderColor', {
  type: 'feature',
  params: [
    {id: 'color', mandatory: true, as: 'string'}
  ],
  impl: features(uniforms(vec3('borderColor', zui.colorToRGB('%$color%'))), elemBorder())
})

component('zui.colorToRGB', {
  params: [
    {id: 'color', as: 'string'}
  ],
  impl: ({},color) => {
    const mctx = jb.zui.measureCanvasCtx('500 16px Arial')
    mctx.fillStyle = color
    mctx.fillRect(0,0,1,1)
    return mctx.getImageData(0,0,1,1).data
  }
})

component('good5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60], description: 'very bad' }, // Bright red
    { from: 0.2, color: [230, 126, 34], description: 'bad' },    // Orange
    { from: 0.4, color: [244, 208, 63], description: 'neutral' }, // Yellow
    { from: 0.6, color: [169, 223, 191], description: 'good' },   // Light green
    { from: 0.8, color: [46, 204, 113], description: 'very good' } // Bright green
  ]
});

component('success5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [192, 57, 43], description: 'failure' },  // Dark red
    { from: 0.25, color: [211, 84, 0], description: 'partial failure' }, // Dark orange
    { from: 0.5, color: [244, 208, 63], description: 'neutral' },// Yellow
    { from: 0.75, color: [40, 180, 99], description: 'success' },// Green
    { from: 1, color: [29, 131, 72], description: 'full success' } // Dark green
  ]
});

component('distinct5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] }, // Red
    { from: 0.2, color: [52, 152, 219] }, // Blue
    { from: 0.4, color: [46, 204, 113] }, // Green
    { from: 0.6, color: [241, 196, 15] }, // Yellow
    { from: 0.8, color: [155, 89, 182] }  // Purple
  ]
});

component('distinct10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] },  // Red
    { from: 0.1, color: [52, 152, 219] }, // Blue
    { from: 0.2, color: [46, 204, 113] }, // Green
    { from: 0.3, color: [241, 196, 15] }, // Yellow
    { from: 0.4, color: [155, 89, 182] }, // Purple
    { from: 0.5, color: [230, 126, 34] }, // Orange
    { from: 0.6, color: [26, 188, 156] }, // Teal
    { from: 0.7, color: [52, 73, 94] }, // Dark Gray
    { from: 0.8, color: [189, 195, 199] }, // Light Gray
    { from: 0.9, color: [142, 68, 173] }  // Violet
  ]
});

component('green10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [208, 240, 192] },  // Tea Green
    { from: 0.1, color: [152, 255, 152] }, // Mint Green
    { from: 0.2, color: [163, 230, 53] }, // Lime Green
    { from: 0.3, color: [119, 221, 119] }, // Pastel Green
    { from: 0.4, color: [46, 204, 113] }, // Bright Green
    { from: 0.5, color: [46, 204, 64] }, // Emerald Green
    { from: 0.6, color: [0, 255, 127] }, // Spring Green
    { from: 0.7, color: [46, 139, 87] }, // Sea Green
    { from: 0.8, color: [34, 139, 34] }, // Forest Green
    { from: 0.9, color: [0, 100, 0] }  // Dark Green
  ]
});

component('gray5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [224, 224, 224] }, // Very Light Gray
    { from: 0.25, color: [189, 189, 189] }, // Light Gray
    { from: 0.5, color: [158, 158, 158] }, // Medium Gray
    { from: 0.75, color: [97, 97, 97] }, // Dark Gray
    { from: 1, color: [33, 33, 33] }  // Very Dark Gray
  ]
});

component('gray10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [245, 245, 245] }, // Very Light Gray
    { from: 0.1, color: [224, 224, 224] },
    { from: 0.2, color: [204, 204, 204] },
    { from: 0.3, color: [189, 189, 189] },
    { from: 0.4, color: [158, 158, 158] },
    { from: 0.5, color: [125, 125, 125] }, // Medium Gray
    { from: 0.6, color: [97, 97, 97] },
    { from: 0.7, color: [66, 66, 66] },
    { from: 0.8, color: [48, 48, 48] },
    { from: 0.9, color: [33, 33, 33] }  // Very Dark Gray
  ]
});

component('coolToWarm10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [44, 123, 182] }, // Deep Blue
    { from: 0.1, color: [83, 158, 204] }, // Blue
    { from: 0.2, color: [137, 196, 210] }, // Light Blue
    { from: 0.3, color: [171, 217, 233] }, // Very Light Blue
    { from: 0.4, color: [225, 238, 241] }, // Pale Cool
    { from: 0.5, color: [254, 224, 144] }, // Yellow
    { from: 0.6, color: [253, 174, 97] }, // Orange
    { from: 0.7, color: [244, 109, 67] }, // Light Red-Orange
    { from: 0.8, color: [215, 48, 39] }, // Red
    { from: 0.9, color: [165, 0, 38] }  // Deep Red
  ]
});

// component('greens', {
//   type: 'color_scale',
//   impl: () => x => [0,x,0]
// })
// component('blues', {
//   type: 'color_scale',
//   impl: () => x => [0,0,x]
// })