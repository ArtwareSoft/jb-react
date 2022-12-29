jb.dsl('chartModel')

jb.component('chartModel', {
  type: 'feature<>',
  category: 'itemlist:80',
  params: [
    {id: 'pivots', type: 'field<chartModel>[]', dynamic: true, flattenArray: true, defaultValue: []},
    {id: 'axes', type: 'axis<chartModel>[]', dynamic: true, flattenArray: true },
    {id: 'matchingRules', type: 'rule<chartModel>[]', dynamic: true, flattenArray: true, defaultValue: byFields() }
  ],
  impl: calcProp('pivots','%$pivots()%')
})

jb.component('field', {
  type: 'field',
  params: [
    {id: 'preferedAxis', as: 'string', options:'x,y,shape,radius,fillColor,lineColor,lineFormat'},
    {id: 'data', mandatory: true, dynamic: true },
    {id: 'title', as: 'string' , description: 'default behavior uses the title as property name from data script'},
    {id: 'domain', type: 'domain', dynamic: true, defaultValue: byValues() },
    {id: 'overrideScale', type: 'scale', dynamic: true }
  ],
  impl: ({params}) => ({ ...params, title: params.title || ('' + jb.path(params,['data','profile'])).match(/([^%]*)%$/) || ['',''](1) })
})

jb.component('byFields', {
  type: 'rule',
  impl: ctx => {
    const { items, fields, axes, frame } = {}
    const res = {}
    fields.foreach(field => {
      const col = items.map(x=> field.data(ctx.setData(x)))
      const axis = axes.find(x=>x.id == field.preferedAxis)
      const scale = field.overrideScale || axis.defaultScale
      scale.init(col,{frame})
      res[axis.id] = { id: axis.id, title: field.title, valForIndex: i => scale(col[i]), ...axis.props }
    })
    return { axes: res }
  }
})

jb.component('scatter', {
  type: 'style<d3.scatter>',
  impl: customStyle({
    typeCast: 'style',
    template: (cmp,{items, frame,axes,itemsNote, itemTitle},h) =>
      h('svg',{width: frame.width, height: frame.height, onclick: true},
    	  h('g.chart', { transform: `translate(${frame.left},${frame.top})` },
    		[
    			axes.x && h('g.x',{ class: 'axis', transform: 'translate(0,' + frame.innerHeight + ')'}),
    			axes.y && h('g.y',{ class: 'axis', transform: 'translate(0,0)'}),
    			axes.y && axes.y.title && h('text.label', { x: 10, y: 10}, axes.y.title),
    			axes.y && axes.x.title && h('text.label', { x: frame.innerWidth, y: frame.innerHeight - 10, 'text-anchor': 'end'}, axes.x.title),
    			h('text.note', { x: frame.innerWidth, y: frame.height - frame.top, 'text-anchor': 'end' }, itemsNote(cmp.ctx.setData(items))),
    		].concat(
    		items.map((item,index)=> h( axes.shape.tag , {index, ...axes.shape.props({item,index,axes}),
    		}, h('title',{x: rPivot.scale(xPivot.valFunc(item))}, itemTitle(cmp.ctx.setData(item)) )
    	))))),
    css: `>g>.label { font-size: 15px; text-transform: capitalize }
>g>.note { font-size: 10px; }
.legend text,
.legend rect { fill-opacity: 0.75 }
.legend:hover rect { fill-opacity:1 }
>g>.axis text { font-size: 13px; fill: #333;  }
>g>.axis path,
>g>.axis line { fill: none;stroke-width: 1px; stroke: #777 }

>.chart>circle { fill-opacity: 0.3; stroke-width: 2px; }
>.chart>.bubble { opacity: 1;transition: opacity 0.3s }
>.chart>.bubble:hover text {opacity: 1 }
>.chart>.bubble:hover circle {	fill-opacity: 1 }
`,
    features: [
      //initScatter(),
      css('%$props/axes/shape/css%')
    ]
  })
})