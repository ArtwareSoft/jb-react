// var {vega} = jb.ns('vega')

vegaSample = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "description": "A simple bar chart with embedded data.",
    "data": {
      "values": [
        {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
        {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
        {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
      ]
    },
    "mark": "bar",
    "encoding": {
      "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
      "y": {"field": "b", "type": "quantitative"}
    }
}

jb.extension('vega', {
    initExtension() {
        return { jbData: Symbol.for('jb-vega-data'), counter: 0 }
    },
    cleanEmptyValues: obj => {
        if (typeof obj != 'object') return obj
        if (Array.isArray(obj)) return obj.map(v=>jb.vega.cleanEmptyValues(v))
        return jb.objFromEntries(jb.entries(obj).filter(e=>e[1] !== '' && e[1] != null).map(([k,v]) =>[k,jb.vega.cleanEmptyValues(v)]))
    },
    namedData: spec => spec.data && spec.data[jb.vega.jbData] ? [spec.data].map(e=>[e.name, e[jb.vega.jbData]]) : []
})

jb.component('vega.interactiveChart', {
  type: 'control',
  params: [
    {id: 'spec', type: 'vega.spec'},
    {id: 'showSpec', as: 'boolean', defaultValue: false}
  ],
  impl: group({
    controls: [
      html({
        html: '<div/>',
        features: [
          frontEnd.var('prettySpec', '%$prettySpec%'),
          frontEnd.var('vegaData', (ctx,{},{spec}) => jb.vega.namedData(spec)),
          frontEnd.init(({},{el,vegaData,prettySpec}) => {
              el.setAttribute('jb_external','true')
              const view = vegaEmbed.createView(el, eval(`(${prettySpec})`))
              vegaData.forEach(e => view.insert(e[0],e[1] ))
              view.run()
          }),
        ]
      }),
      controlWithCondition('%$showSpec%', editableText({databind: '%$prettySpec%', style: editableText.codemirror()})),
    ],
    features: [
        frontEnd.requireExternalLibrary(['vega-lite.js']),
        watchable('prettySpec', ({},{},{spec}) => jb.utils.prettyPrint(jb.vega.cleanEmptyValues(spec))),
    ]
  })
})

jb.component('vega.spec', {
  type: 'vega.spec',
  params: [
    {id: 'data', type: 'vega.data', mandatory: true},
    {id: 'transform', type: 'vega.transform[]', as: 'array'},
    {id: 'mark', type: 'vega.mark', defaultValue: vega.bar()},
    {id: 'encoding', type: 'vega.encoding' },
    {id: 'name', as: 'string'},
    {id: 'title', as: 'string'},
    {id: 'description', as: 'string'}
  ],
  impl: ctx => ctx.params
})

jb.component('vega.dataFromUrl', {
    type: 'vega.data',
    params: [
        {id: 'url', as: 'string', mandatory: true },
        {id: 'name', as: 'string'},
        {id: 'format', as: 'string', options: 'json,csv,tsv,dsv'},
    ],
    impl: ctx => ctx.params
})

jb.component('vega.jbData', {
    type: 'vega.data',
    params: [
        {id: 'items', as: 'array', mandatory: true },
    ],
    impl: (ctx,items) => {
        const name = 'data-' + (jb.vega.counter++)
        return {name, [jb.vega.jbData] : items}
    }
})

jb.component('vega.namedData', {
    type: 'vega.data',
    params: [
        {id: 'name', as: 'string', mandatory: true},
    ],
    impl: ctx => ctx.params
})

// ************ transform ***************

jb.component('vega.aggregate', {
    type: 'vega.transform',
    params: [
        {id: 'pipe', type: 'vega.aggPipeElem[]', mandatory: true },
        {id: 'groupby', as: 'array' },
    ],
    impl: (ctx,pipe,groupby) => ({ aggregate: pipe, groupby})
})

jb.component('vega.aggPipeElem', {
    type: 'vega.aggPipeElem',
    singleInType: true,
    params: [
        {id: 'op', as: 'string', options: 'count,valid,values,missing,distinct,sum,product,mean,average,variance,variancep,stdev,stdevp,stderr,median,q1,q3,ci0,ci1,min,max,argmin,argmax', mandatory: true },
        {id: 'field', as: 'string', mandatory: true },
        {id: 'as', as: 'string', mandatory: true },
    ],
    impl: ctx => ctx.params
})

jb.component('vega.calculate', {
    type: 'vega.transform',
    params: [
        {id: 'expression', as: 'string', mandatory: true, description: 'e.g: datum.x*2' },
        {id: 'as', as: 'array', mandatory: true },
    ],
    impl: (ctx,expression,as) => ({ calculate: expression, as })
})

jb.component('vega.filter', {
    type: 'vega.transform',
    params: [
        {id: 'filter', type: 'vega.boolean' },
    ],
    impl: (ctx,filter) => filter
})

jb.component('vega.filterExpression', {
    type: 'vega.boolean',
    params: [
        {id: 'filter', as: 'string', mandatory: true, description: 'e.g: datum.x>2' },
    ],
    impl: (ctx,filter) => ({ filter })
})

jb.defComponents('equal,lt,lte,gt,gte'.split(',') ,op=>`vega.${op}`, op => ({
    type: 'vega.boolean',
    params: [
        {id: 'field', as: 'string', mandatory: true },
        {id: 'value', as: 'string', mandatory: true },
    ],
    impl: (ctx,field,value) => ({ field, [op]: value })
}))

jb.defComponents('range,oneOf'.split(',') ,op=>`vega.${op}`, op => ({
        type: 'vega.boolean',
    params: [
        {id: 'field', as: 'string', mandatory: true },
        {id: 'values', as: 'array', mandatory: true },
    ],
    impl: (ctx,field,values) => ({ field, [op]: values })
}))

jb.component('vega.inSelection', {
  type: 'vega.boolean',
  params: [
    {id: 'selection', as: 'string', mandatory: true}
  ],
  impl: ctx => ctx.params
})
// TODO: more filter types: and, or, not
// TODO: more transform types: ...

// ************ mark ***************
// TODO: david: do one by one - more filter types: and, or, not

jb.defComponents('bar,circle,square,text,rule,point,geoshape,tick,errorband'.split(',') , type=>`vega.${type}`, type => ({
    type: 'vega.mark',
    params: [
        {id: 'props', type: 'vega.markProps[]', as: 'array' },
        {id: 'type', as: 'string', defaultValue: type },
    ],
    impl: (ctx,props,type) => props.length ? ({ type, ...props.reduce((acc,props) => ({...acc,...props}) ,{}) }) : type
}))

jb.component('vega.line', {
    type: 'vega.mark',
    params: [
        {id: 'showPoints', type: 'boolean' },
        {id: 'props', type: 'vega.markProps[]', as: 'array' },
    ],
    impl: (ctx, point, props) => (point || props) ? ({type: 'line', point, ...props.reduce((acc,props) => ({...acc,...props}) ,{})}) : 'line'
})

jb.component('vega.generalMarkProps', {
    type: 'vega.markProps',
    params: [
        {id: 'aria', as: 'string' },
        {id: 'description', as: 'string' },
        {id: 'style', as: 'string' },
        {id: 'tooltip', as: 'string' },
    ],
    impl: ctx => ctx.params
})

jb.component('vega.positionMarkProps', {
    type: 'vega.markProps',
    params: [
        {id: 'x', as: 'string' },
        {id: 'x2', as: 'string' },
        {id: 'width', as: 'string' },
        {id: 'height', as: 'string' },
        {id: 'y', as: 'string' },
        {id: 'y2', as: 'string' },
    ],
    impl: ctx => ctx.params
})
// TODO: more from https://vega.github.io/vega-lite/docs/mark.html

// ************ encoding ***************
jb.component('vega.positionChannels', {
    type: 'vega.encoding',
    params: [
        {id: 'x', type: 'vega.channel' },
        {id: 'y', type: 'vega.channel' },
        {id: 'color', type: 'vega.channel' },
    ],
    impl: ctx => ctx.params
})

// ************ channel ***************
jb.component('vega.channel', {
    type: 'vega.channel',
    params: [
        {id: 'field', as: 'string', mandatory: true },
        {id: 'type', as: 'string', options: 'quantitative,temporal,ordinal,nominal' },
        {id: 'title', as: 'string' },
    ],
    impl: ctx => ctx.params
})
