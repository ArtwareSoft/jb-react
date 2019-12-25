(function() {
const withUnits = jb.ui.withUnits
const fixCssLine = jb.ui.fixCssLine

jb.component('css', { /* css */
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: fixCssLine(css)})
})

jb.component('css.dynamic', {
  description: 'recalc the css on refresh/watchRef. e.g. {color: %$color%}',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,css) => ({dynamicCss: ctx2 => css(ctx2)})
})

jb.component('css.with-condition', {
  description: 'css with dynamic condition. e.g. .myclz {color: red}',
  type: 'feature,dialog-feature',
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true},
    {id: 'css', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,cond,css) => ({dynamicCss: ctx2 => cond(ctx2) ? fixCssLine(css(ctx2)) : ''})
})

jb.component('css.class', { /* css.class */
  type: 'feature,dialog-feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({class: clz})
})

jb.component('css.width', { /* css.width */
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', mandatory: true, as: 'string'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', { /* css.height */
  type: 'feature,dialog-feature',
  params: [
    {id: 'height', mandatory: true, as: 'string'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.opacity', { /* css.opacity */
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'string' , description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

jb.component('css.padding', { /* css.padding */
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `padding-${x}: ${withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', { /* css.margin */
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.transform-rotate', { /* css.transformRotate */
  type: 'feature',
  params: [
    {id: 'angle', as: 'string', description: '0-360'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
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
    {id: 'x', as: 'string', description: '0-1'},
    {id: 'y', as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:scale(${ctx.params.x},${ctx.params.y})}`})
})

jb.component('css.bold', { 
  type: 'feature',
  impl: ctx => ({css: `{font-weight: bold}`})
})

jb.component('css.underline', { 
  type: 'feature',
  impl: ctx => ({css: `{text-decoration: underline}`})
})

jb.component('css.box-shadow', { /* css.boxShadow */
  type: 'feature,dialog-feature',
  params: [
    {id: 'blurRadius', as: 'string', templateValue: '5'},
    {id: 'spreadRadius', as: 'string', templateValue: '0'},
    {id: 'shadowColor', as: 'string', templateValue: '#000000'},
    {id: 'opacity', as: 'string', templateValue: 0.5, description: '0-1'},
    {id: 'horizontal', as: 'string', templateValue: '10'},
    {id: 'vertical', as: 'string', templateValue: '10'},
    {id: 'selector', as: 'string'}
  ],
  impl: (context,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    var color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${withUnits(horizontal)} ${withUnits(vertical)} ${withUnits(blurRadius)} ${withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', { /* css.border */
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', as: 'string', defaultValue: '1'},
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
    ({css: `${selector} { border${side?'-'+side:''}: ${withUnits(width)} ${style} ${color} }`})
})

})()