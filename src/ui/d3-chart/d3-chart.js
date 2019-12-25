jb.ns('d3g,d3Scatter,d3Histogram')

jb.component('d3g.chart-scatter', { /* d3g.chartScatter */
  type: 'control',
  description: 'chart, graph, diagram by d3',
  category: 'chart:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {
      id: 'frame',
      type: 'd3g.frame',
      defaultValue: d3g.frame({width: 1400, height: 500, top: 30, right: 50, bottom: 40, left: 60})
    },
    {id: 'pivots', type: 'd3g.pivot[]', templateValue: [], mandatory: true, dynamic: true, description: 'potential axis of the chart'},
    {id: 'itemTitle', as: 'string', dynamic: true},
    {id: 'onSelectItem', type: 'action', dynamic: true},
    {id: 'onSelectAxisValue', type: 'action', dynamic: true},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 1000},
    {
      id: 'style',
      type: 'd3g.scatter-style',
      dynamic: true,
      defaultValue: d3Scatter.plain()
    },
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx =>
    	jb.ui.ctrl(ctx)
})

jb.component('d3-scatter.plain', { /* d3Scatter.plain */
  type: 'd3g.scatter-style',
  impl: customStyle({
    template: (cmp,state,h) => h('svg',{width: cmp.width, height: cmp.height, onclick: 'clicked'},
    	  h('g', { transform: 'translate(' + cmp.left + ',' + cmp.top + ')' },
    		[
    			h('g',{ axisIndex: 0, class: 'x axis', transform: 'translate(0,' + cmp.innerHeight + ')'}),
    			h('g',{ axisIndex: 1, class: 'y axis', transform: 'translate(0,0)'}),
    			h('text', { class: 'label', x: 10, y: 10}, cmp.yPivot.title),
    			h('text', { class: 'label', x: cmp.innerWidth, y: cmp.innerHeight - 10, 'text-anchor': 'end'}, cmp.xPivot.title),
    			h('text', { class: 'note', x: cmp.innerWidth, y: cmp.height - cmp.top, 'text-anchor': 'end' }, '' + cmp.state.items.length + ' items'),
    		].concat(
    		state.items.map((item,index)=> h('circle',{
    			class: 'bubble', index,
    			cx: cmp.xPivot.scale(cmp.xPivot.valFunc(item)),
    			cy: cmp.yPivot.scale(cmp.yPivot.valFunc(item)),
    			r: cmp.rPivot.scale(cmp.rPivot.valFunc(item)),
    			fill: cmp.colorPivot.scale(cmp.colorPivot.valFunc(item)),
    		},h('title',{x: cmp.rPivot.scale(cmp.xPivot.valFunc(item))}, cmp.itemTitle(cmp.ctx.setData(item)) )
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

jb.component('d3-scatter.init', { /* d3Scatter.init */
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.state.items = calcItems();
        cmp.pivots = ctx.vars.$model.pivots();
        const x = cmp.pivots[0] || emptyPivot(),
              y = cmp.pivots[1] || emptyPivot(),
              radius = cmp.pivots[2] || emptyPivot(),
              color = cmp.pivots[3] || emptyPivot();

        const ctx2 = ctx.setVars({items: cmp.state.items, frame: ctx.vars.$model.frame});
        Object.assign(cmp, {
          xPivot: x.init(ctx2.setVars({xAxis: true})),
          yPivot: y.init(ctx2.setVars({yAxis: true})),
          rPivot: radius.init(ctx2.setVars({rAxis: true})),
          colorPivot: color.init(ctx2.setVars({colorAxis: true})),
          itemTitle: ctx.vars.$model.itemTitle
        }, ctx.vars.$model.frame );
        cmp.colorPivot.scale = d3.scaleOrdinal(d3.schemeAccent); //.domain(cmp.colorPivot.domain);

        cmp.refresh = _ =>
            cmp.setState({items: calcItems()})

        cmp.clicked = ev => {
          const elem = ev.target
          const index = elem.getAttribute('index')
          const parent = jb.path(elem, 'parentElement.parentElement')
          const axisIndex = parent && parent.getAttribute('axisIndex')
          if (axisIndex !== null) {
            const action = jb.ui.wrapWithLauchingElement(ctx.vars.$model.onSelectAxisValue, cmp.ctx, elem)
            action(ctx.setData({ pivot: cmp.pivots[axisIndex], value: elem.innerHTML}).setVars({event:ev}))
          }
          else if (index !== null) {
            const action = jb.ui.wrapWithLauchingElement(ctx.vars.$model.onSelectItem, cmp.ctx, elem)
            action(ctx.setData(cmp.items[index]).setVars({event:ev}))
          }
        }
	  
        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          cmp.sortItems && cmp.sortItems();
          return cmp.items.slice(0,ctx.vars.$model.visualSizeLimit);
        }
        function emptyPivot() { return cmp.ctx.run(d3g.pivot({title: 'empty', value: list('0', '1')})) }
    },
    afterViewInit: cmp => {
      d3.select(cmp.base.querySelector('.x.axis')).call(d3.axisBottom().scale(cmp.xPivot.scale));
      d3.select(cmp.base.querySelector('.y.axis')).call(d3.axisLeft().scale(cmp.yPivot.scale));
    }
  })
})

jb.component('d3g.frame', { /* d3g.frame */
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
