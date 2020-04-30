jb.ns('pptr')

jb.component('pptr.crawler', {
    type: 'pptr.crawler',
    params: [
        {id: 'rootUrl', as: 'string'},
        {id: 'pageCrawlers', type: 'pptr.page-crawler[]' },
        {id: 'resultData', defaultValue: '%$pptr.resultData%' },
        {id: 'resultIndex', defaultValue: '%$pptr.requestQueue/resultIndex%', description: 'watchable data to get get events about data changes' },
        {id: 'requestQueue', defaultValue: '%$pptr.requestQueue/mainQueue%', description: '{url, vars?, nextPptrPageType? }' },
    ]
})

jb.component('pptr.pageCrawler', {
    type: 'pptr.page-crawler',
    params: [
        {id: 'url', as: 'string' },
        {id: 'features', type: 'pptr.feature[]', as: 'array', dynamic: true ,flattenArray: true},
        {id: 'extract', type: 'pptr.extract', mandatory: true },
        {id: 'transformToResultItems', dynamic: true, description: 'single or array, better to have id'},
        {id: 'transformToUrlRequests', dynamic: true, templateValue: obj(prop('url','%%')), description: 'optional props: varsForFollowing, nextPptrPageType' },
    ]
})


// move to data file
jb.component('pptr.resultData', { passiveData: {

}})

jb.component('pptr.requestQueue', { watchableData: {
    mainQueue: {},
    resultIndex: {}
}})
