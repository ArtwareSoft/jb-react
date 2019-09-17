jb.component('css', { /* css */
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (context,css) =>
    ({css:css})
})

jb.component('css.class', { /* css.class */
  type: 'feature,dialog-feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (context,clz) =>
    ({class :clz})
})

jb.component('css.width', { /* css.width */
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', mandatory: true, as: 'number'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${width}px ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', { /* css.height */
  type: 'feature,dialog-feature',
  params: [
    {id: 'height', mandatory: true, as: 'number'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${height}px ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.opacity', { /* css.opacity */
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'number', min: 0, max: 1, step: 0.1},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

jb.component('css.padding', { /* css.padding */
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'number'},
    {id: 'left', as: 'number'},
    {id: 'right', as: 'number'},
    {id: 'bottom', as: 'number'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `padding-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', { /* css.margin */
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'number'},
    {id: 'left', as: 'number'},
    {id: 'right', as: 'number'},
    {id: 'bottom', as: 'number'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.transform-rotate', { /* css.transformRotate */
  type: 'feature',
  params: [
    {id: 'angle', as: 'number', defaultValue: 0, from: 0, to: 360},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:rotate(${ctx.params.angle}deg)}`};
  }
})

jb.component('css.color', { /* css.color */
  type: 'feature',
  params: [
    {id: 'color', as: 'string'},
    {id: 'background', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,color) => {
		var css = ['color','background']
      .filter(x=>ctx.params[x])
      .map(x=> `${x}: ${ctx.params[x]}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

jb.component('css.transform-scale', { /* css.transformScale */
  type: 'feature',
  params: [
    {id: 'x', as: 'number', defaultValue: 100},
    {id: 'y', as: 'number', defaultValue: 100},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:scale(${ctx.params.x/100},${ctx.params.y/100})}`};
  }
})

jb.component('css.box-shadow', { /* css.boxShadow */
  type: 'feature,dialog-feature',
  params: [
    {id: 'blurRadius', as: 'number', defaultValue: 5},
    {id: 'spreadRadius', as: 'number', defaultValue: 0},
    {id: 'shadowColor', as: 'string', defaultValue: '#000000'},
    {id: 'opacity', as: 'number', min: 0, max: 1, defaultValue: 0.75, step: 0.01},
    {id: 'horizontal', as: 'number', defaultValue: 10},
    {id: 'vertical', as: 'number', defaultValue: 10},
    {id: 'selector', as: 'string'}
  ],
  impl: (context,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    var color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${horizontal}px ${vertical}px ${blurRadius}px ${spreadRadius}px rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', { /* css.border */
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', as: 'number', defaultValue: 1},
    {id: 'side', as: 'string', options: 'top,left,bottom,right'},
    {
      id: 'style',
      as: 'string',
      options: 'solid,dotted,dashed,double,groove,ridge,inset,outset',
      defaultValue: 'solid'
    },
    {id: 'color', as: 'string', defaultValue: 'black'},
    {id: 'selector', as: 'string'}
  ],
  impl: (context,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${width}px ${style} ${color} }`})
})
