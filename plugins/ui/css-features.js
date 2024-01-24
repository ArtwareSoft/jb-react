component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: _ctx => jb.ui.fixCssLine(css(_ctx))})
})

component('css.class', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({class: clz})
})

component('css.width', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${jb.ui.withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

component('css.height', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'height', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${jb.ui.withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

component('css.opacity', {
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

component('css.padding', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != '')
      .map(x=> `padding-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

component('css.margin', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em, -20'},
    {id: 'left', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

component('css.marginAllSides', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'value', as: 'string', mandatory: true, description: 'e.g. 20, 20%, 0.4em'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,value,selector) => ({css: `${selector} margin: ${jb.ui.withUnits(value)}`})
})

component('css.marginVerticalHorizontal', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'vertical', as: 'string', mandatory: true},
    {id: 'horizontal', as: 'string', mandatory: true},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,vertical,horizontal,selector) =>
    ({css: `${selector} margin: ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(horizontal)}`})
})

component('css.transformRotate', {
  type: 'feature',
  params: [
    {id: 'angle', as: 'string', description: '0-360'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,angle,selector) => ({css: `${selector} {transform:rotate(${angle}deg)}`})
})

component('css.color', {
  type: 'feature',
  params: [
    {id: 'color', as: 'string', dynamic: true},
    {id: 'background', as: 'string', editAs: 'color', dynamic: true},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
		const css = ['color','background']
      .filter(x=>ctx.params[x](ctx))
      .map(x=> `${x}: ${ctx.params[x](ctx)}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

component('css.transformScale', {
  type: 'feature',
  params: [
    {id: 'x', as: 'string', description: '0-1'},
    {id: 'y', as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:scale(${ctx.params.x},${ctx.params.y})}`})
})

component('css.transformTranslate', {
  type: 'feature',
  description: 'margin, move, shift, offset',
  params: [
    {id: 'x', as: 'string', description: '10px', defaultValue: '0'},
    {id: 'y', as: 'string', description: '20px', defaultValue: '0'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:translate(${jb.ui.withUnits(ctx.params.x)},${jb.ui.withUnits(ctx.params.y)})}`})
})

component('css.bold', {
  type: 'feature',
  impl: ctx => ({css: `{font-weight: bold}`})
})

component('css.underline', {
  type: 'feature',
  impl: ctx => ({css: `{text-decoration: underline}`})
})

component('css.boxShadow', {
  type: 'feature,dialog-feature',
  params: [
    {
      id: 'inset',
      as: 'boolean',
      description: 'the box is raised or content is depressed inside the box',
      type: 'boolean'
    },
    {id: 'blurRadius', as: 'string', defaultValue: '5', description: 'bigger and lighter shadow'},
    {id: 'spreadRadius', as: 'string', defaultValue: '0', description: 'just bigger shadow'},
    {id: 'shadowColor', as: 'string', defaultValue: '#000000'},
    {id: 'opacity', as: 'string', defaultValue: 0.5, description: '0-1'},
    {id: 'horizontal', as: 'string', defaultValue: '10', description: 'offset-x'},
    {id: 'vertical', as: 'string', defaultValue: '10', description: 'offset-y'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,inset, blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    const color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${inset?'inset ':''}${jb.ui.withUnits(horizontal)} ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(blurRadius)} ${jb.ui.withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
  }
})

component('css.border', {
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
  impl: (ctx,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${jb.ui.withUnits(width)} ${style} ${color} }`})
})

component('css.borderRadius', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'radius', as: 'string', defaultValue: '5'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,radius,selector) => ({css: `${selector} { border-radius: ${jb.ui.withUnits(radius)}}`})
})

component('css.lineClamp', {
  type: 'feature',
  description: 'ellipsis after X lines',
  params: [
    {id: 'lines', mandatory: true, as: 'string', templateValue: 3, description: 'no of lines to clump'},
    {id: 'selector', as: 'string'}
  ],
  impl: css(
    '%$selector% { overflow: hidden; text-overflow: ellipsis; -webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: %$lines% }'
  )
})

component('css.valueOfCssVar',{
  description: 'value of css variable --var under element',
  params: [
    {id: 'varName', description: 'without the -- prefix'},
    {id: 'parent', description: 'html element under which to check the var, default is document.body' }
  ],
  impl: (ctx,varName,parent) => jb.ui.valueOfCssVar(varName,parent)
})

component('css.conditionalClass', {
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        vdom.addClass(cssClass())
      return vdom
    }
  })
})

 jb.defComponents('layout,typography,detailedBorder,detailedColor,gridArea'.split(','), 
  id => component(`css.${id}`, ({
    autoGen: true,
    type: 'feature:0',
    params: [
      {id: 'css', mandatory: true, as: 'string'}
    ],
    impl: (ctx,css) => ({css: jb.ui.fixCssLine(css)})
})))

