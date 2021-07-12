jb.extension('statistics', {
    $requireLibs: ['/dist/jstat.js']
})

jb.defComponents('sum,sumsqrd,sumsqerr,sumrow,product,min,max,mean,meansqerr,geomean,median,cumsum,cumprod,diff,rank,mode,range,variance,pooledvariance,deviation,stdev,pooledstdev,meandev,meddev,skewness,kurtosis,coeffvar,quartiles,quantiles,percentile,percentileOfScore,histogram,covariance,corrcoeff'.split(','),
    f => jb.component(`stat.${f}`, ({
        type: 'aggregator',
        impl: ({data}) => Array.isArray(data) ? jb.stat[f](data) : []
})))

jb.component('stat.groupBy', {
    type: 'aggregator',
    params: [
        { id: 'by', dynamic: 'true', mandatory: true},
        { id: 'calculate', type: 'fieldInGroup[]', dynamic: true },
    ],
    impl: (ctx ,by, calculate) => {
        if (!Array.isArray(ctx.data)) return []
        const fieldName = (typeof by.profile == 'string' && by.profile.match(/^%[^%]+%$/)) && by.profile.slice(1,-1)
        const resObj = ctx.data.reduce((res,x) => { 
            const key = fieldName ? x[fieldName] : by(ctx.setData(x))
            res[key] = res[key] || []
            res[key].push(x)
            return res
        }, {})
        const keyName = fieldName || 'key'
        const res = Object.keys(resObj).map(key=> ({[keyName]: key, items: resObj[key]}))
        calculate(ctx.setData(res)) // res is extended
        return res
    }
})

jb.component('stat.fieldInGroup', {
    type: 'fieldInGroup',
    params: [
        { id: 'aggregateFunc', mandatory: true, dynamic: true, description: 'e.g. sum' },
        { id: 'aggregateValues', dynamic: 'true', defaultValue: '%%', description: 'e.g, %price%' },
        { id: 'aggregateResultField', as: 'string', description: 'default is function name' },
    ],
    impl: (ctx,aggregateFunc,aggregateValues,aggregateResultField) => {
        if (aggregateFunc.profile) {
            const fld = aggregateResultField || aggregateFunc.profile.$
            ctx.data.forEach(group => group[fld] = aggregateFunc(ctx.setData( aggregateValues(ctx.setData(group.items)) ) ))
        }
    }
})