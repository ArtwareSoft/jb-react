jb.ns('d3g,d3Scatter,d3Histogram')

jb.component('d3g.histogram', {
  type: 'control',
  category: 'group:80,common:70',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'pivot', type: 'd3g.pivot', mandatory: true, dynamic: true},
    {id: 'frame', type: 'd3g.frame', defaultValue: d3g.frame({width: 1400, height: 500, top: 30, right: 50, bottom: 40, left: 60})},
    {id: 'itemTitle', as: 'string', dynamic: true},
    {id: 'ticks', as: 'number', defaultValue: 5},
    {id: 'axes', type: 'd3g.axes', dynamic: true, as: 'array', defaultValue: {'$': 'd3g.buttom-and-left-axes'}},
    {id: 'style', type: 'd3g.histogram-style', dynamic: true, defaultValue: {'$': 'd3-histogram.plain'}},
    {id: 'features', type: 'd3-feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx,{
        featuresOptions: ctx.params.axes()
      })
})

jb.component('d3Histogram.plain', {
  type: 'd3g.histogram-style',
  impl: customStyle({
    template: (cmp,state,h) => h('svg',{width: cmp.width, height: cmp.height},
    	  h('g', { transform: 'translate(' + cmp.left + ',' + cmp.top + ')' },
    		[
    			h('g',{ class: 'x axis', transform: 'translate(0,' + cmp.innerHeight + ')'}),
    		].concat(
    		state.bins.map((bin,index)=> h('g',{ class: 'bar', transform: 'translate(' + 0 + ',' + cmp.yScale(bin.length) + ')' },[
              h('title',{},bin.length + ' of ' + cmp.items.length + ' items '),
              h('rect',{x: cmp.xScale(bin.x0), width: cmp.xScale.bandwidth() -1,
                y: 0 , height: cmp.innerHeight - cmp.yScale(bin.length) }),
              h('rect',{ class: 'for-click', x: cmp.xScale(bin.x0), width: cmp.xScale.bandwidth() -1,
                y: -30 , height: 30 }),
            ]	))))),
    css: `>g>.bar rect { fill: steelblue; }
      >g>.bar rect.for-click { fill-opacity: 0 }
      `,
    features: d3Histogram.init()
  })
})

jb.component('d3Histogram.init', {
  type: 'd3-feature',
  impl: feature.init(
    (ctx,{cmp}) => {
        cmp.pivot = ctx.vars.$model.pivot();
        if (!cmp.pivot) return;
        cmp.items = calcItems().filter(cmp.pivot.valFunc);
        Object.assign(cmp,ctx.vars.$model.frame);
        cmp.state.bins = d3.histogram()
          .thresholds(d3.scaleLinear().domain(d3.extent(cmp.items.map(cmp.pivot.valFunc))).ticks(5))
          .value(cmp.pivot.valFunc)(cmp.items);
        cmp.xAxis = cmp.xScale = d3.scaleBand().rangeRound([0, cmp.innerWidth]).padding(0.1)
        //d3.scaleLinear().rangeRound([0, cmp.innerWidth])
          .domain(cmp.state.bins.map(x=> '' + x.x0));
        //d3.extent(cmp.items,cmp.pivot.valFunc));
        cmp.barWidth = cmp.xScale(cmp.state.bins[0].x1-cmp.state.bins[0].x0);
        cmp.yScale = d3.scaleLinear()
          .domain([0, d3.max(cmp.state.bins, x=>x.length)])
          .range([cmp.innerHeight, 0]);

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          cmp.sortItems && cmp.sortItems();
          return cmp.items;
        }
  }
  )
})

jb.component('d3g.buttomAndLeftAxes', {
  type: 'd3g.axes',
  impl: ctx => ({
      afterViewInit: cmp => {
        cmp.xAxis && d3.select(cmp.base.querySelector('.x.axis')).call(d3.axisBottom().scale(cmp.xAxis).ticks(5).tickFormat(d3.format(".2s")));
        cmp.yAxis && d3.select(cmp.base.querySelector('.y.axis')).call(d3.axisLeft().scale(cmp.yAxis));
      }
  })
})

jb.component('d3g.itemIndicator', {
  type: 'd3-feature',
  params: [
    {id: 'item', as: 'single'}
  ],
  impl: (ctx,item) => ({
    templateModifier: (vdom,cmp,state,h) => {
        var bin = cmp.state.bins.filter(bin=>bin.indexOf(item) != -1)[0];
        if (!bin) return;
        vdom.children[0].children.push( h('g',{ class: 'indicator'},
          h('rect',{ x: cmp.xScale(bin.x0), 
                width: cmp.xScale.bandwidth() -1, 
                y: cmp.innerHeight + 20 , 
                height: 6 })))
      },
      css: `>g>.indicator rect { fill: grey; }`
  })
})
