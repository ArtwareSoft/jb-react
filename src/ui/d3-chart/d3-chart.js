jb.ns('d3g,d3Scatter,d3Histogram')

jb.component('d3g.chartScatter', {
  type: 'control',
  description: 'chart, graph, diagram by d3',
  category: 'chart:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'frame', type: 'd3g.frame', defaultValue: d3g.frame({width: 1400, height: 500, top: 30, right: 50, bottom: 40, left: 60})},
    {id: 'pivots', type: 'd3g.pivot[]', templateValue: [], mandatory: true, dynamic: true, description: 'potential axis of the chart'},
    {id: 'itemTitle', as: 'string', dynamic: true},
    {id: 'onSelectItem', type: 'action', dynamic: true},
    {id: 'onSelectAxisValue', type: 'action', dynamic: true},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 1000},
    {id: 'style', type: 'd3g.scatter-style', dynamic: true, defaultValue: d3Scatter.plain()},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx =>
    	jb.ui.ctrl(ctx)
})

jb.component('d3Scatter.plain', {
  type: 'd3g.scatter-style',
  impl: customStyle({
    template: (cmp,{items, frame,xPivot,yPivot,rPivot,colorPivot,itemTitle},h) =>
      h('svg',{width: frame.width, height: frame.height, onclick: true},
    	  h('g', { transform: `translate(${frame.left},${frame.top})` },
    		[
    			h('g',{ axisIndex: 0, class: 'x axis', transform: 'translate(0,' + frame.innerHeight + ')'}),
    			h('g',{ axisIndex: 1, class: 'y axis', transform: 'translate(0,0)'}),
    			h('text', { class: 'label', x: 10, y: 10}, yPivot.title),
    			h('text', { class: 'label', x: frame.innerWidth, y: frame.innerHeight - 10, 'text-anchor': 'end'}, xPivot.title),
    			h('text', { class: 'note', x: frame.innerWidth, y: frame.height - frame.top, 'text-anchor': 'end' }, '' + items.length + ' items'),
    		].concat(
    		items.map((item,index)=> h('circle',{
    			class: 'bubble', index,
    			cx: xPivot.scale(xPivot.valFunc(item)),
    			cy: yPivot.scale(yPivot.valFunc(item)),
    			r: rPivot.scale(rPivot.valFunc(item)),
    			fill: colorPivot.scale(colorPivot.valFunc(item)),
    		},h('title',{x: rPivot.scale(xPivot.valFunc(item))}, itemTitle(cmp.ctx.setData(item)) )
    	))))),
    css: `>g>.label { font-size: 15px; text-transform: capitalize }
>g>.note { font-size: 10px; }
.legend text,
.legend rect { fill-opacity: 0.75 }
.legend:hover rect { fill-opacity:1 }
>g>.axis text { font-size: 13px; fill: #333;  }
>g>.axis path,
>g>.axis line { fill: none;stroke-width: 1px; stroke: #777 }
>g>circle { fill-opacity: 0.3; stroke-width: 2px; }
>g>.bubble { opacity: 1;transition: opacity 0.3s }
>g>.bubble:hover text {opacity: 1 }
>g>.bubble:hover circle {	fill-opacity: 1 }
`,
    features: d3Scatter.init()
  })
})

jb.component('d3Scatter.init', {
  type: 'feature',
  impl: features(
    calcProp({
        id: 'items',
        value: (ctx,{cmp,$model,itemlistCntr}) => {
      const items = jb.toarray(jb.val($model.items(ctx)));
      if (itemlistCntr)
          itemlistCntr.items = items;
      cmp.sortItems && cmp.sortItems();
      return items.slice(0,$model.visualSizeLimit);
    }}),
    calcProp({id: 'frame', value: '%$$model/frame%'}),
    calcProp({id: 'pivots', value: ctx => ctx.exp('%$$model/pivots%')}),
    calcProp({
        id: 'emptyPivot',
        value: d3g.pivot({title: 'empty', value: list('0', '1')})
      }),
    calcProp({
        id: 'x',
        value: firstSucceeding('%$$props/pivots[0]%', '%$$props/emptyPivot%')
      }),
    calcProp({
        id: 'y',
        value: firstSucceeding('%$$props/pivots[1]%', '%$$props/emptyPivot%')
      }),
    calcProp({
        id: 'radius',
        value: firstSucceeding('%$$props/pivots[2]%', '%$$props/emptyPivot%')
      }),
    calcProp({
        id: 'color',
        value: firstSucceeding('%$$props/pivots[3]%', '%$$props/emptyPivot%')
      }),
    calcProps((ctx,{cmp,$model})=> {
      const ctx2 = ctx.setVars({frame: ctx.vars.$props.frame, items: ctx.vars.$props.items})
      const res = {
        xPivot: cmp.renderProps.x.init(ctx2.setVar('xAxis',true)),
        yPivot: cmp.renderProps.y.init(ctx2.setVar('yAxis',true)),
        rPivot: cmp.renderProps.radius.init(ctx2.setVars({rAxis: true})),
        colorPivot: cmp.renderProps.color.init(ctx2.setVars({colorAxis: true})),
        itemTitle: $model.itemTitle
      }
      res.colorPivot.scale = d3.scaleOrdinal(d3.schemeAccent); //.domain(cmp.colorPivot.domain);
      return res
    }),
    interactive((ctx,{cmp}) => {
      cmp.base.innerHTML = cmp.base.innerHTML +'' // ???
      const renderProps = cmp.ctx.runItself().calcRenderProps()
      d3.select(cmp.base.querySelector('.x.axis')).call(d3.axisBottom().scale(renderProps.xPivot.scale));
      d3.select(cmp.base.querySelector('.y.axis')).call(d3.axisLeft().scale(renderProps.yPivot.scale));

      cmp.clicked = ({event,ctx,cmp}) => {
        const {pivots,items} = renderProps
        const elem = event.target
        const index = elem.getAttribute('index')
        const parent = jb.path(elem, 'parentElement.parentElement')
        const axisIndex = parent && parent.getAttribute('axisIndex')
        if (axisIndex !== null) {
          const action = jb.ui.wrapWithLauchingElement(ctx.vars.$model.onSelectAxisValue, ctx, elem)
          action(ctx.setData({ pivot: pivots[axisIndex], value: elem.innerHTML}).setVars({event:ev}))
        }
        else if (index !== null) {
          const action = jb.ui.wrapWithLauchingElement(ctx.vars.$model.onSelectItem, ctx, elem)
          action(ctx.setData(items[index]).setVars({event}))
        }
      }
    }
      )
  )
})

jb.component('d3g.frame', {
  type: 'd3g.frame',
  params: [
    {id: 'width', as: 'number', defaultValue: 900},
    {id: 'height', as: 'number', defaultValue: 600},
    {id: 'top', as: 'number', defaultValue: 20},
    {id: 'right', as: 'number', defaultValue: 20},
    {id: 'bottom', as: 'number', defaultValue: 20},
    {id: 'left', as: 'number', defaultValue: 20}
  ],
  impl: ctx => Object.assign({},ctx.params,{
			innerWidth: ctx.params.width - ctx.params.left - ctx.params.right,
			innerHeight: ctx.params.height - ctx.params.top - ctx.params.bottom,
	})
})
