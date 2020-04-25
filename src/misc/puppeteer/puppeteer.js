jb.ns('pptr')

jb.component('pptr.headlessPage', {
    type: 'pptr.page',
    params: [
        {id: 'url', as: 'string', mandatory: true },
        {id: 'extract', type: 'pptr.extract', defaultValue: pptr.extractContent('body') },
        {id: 'features', type: 'pptr.feature[]', as: 'array', flattenArray: true},
        {id: 'showBrowser', as: 'boolean' },
    ],
    impl: (...args) => jb.pptr.createComp(...args)
})

jb.component('pptr.htmlFromPage', {
    type: 'data',
    params: [
        {id: 'page', type: 'pptr.page', mandatory: true, dynamic: true },
    ],
    impl: (ctx,page) => {
        const cmp = page()
        return jb.callbag.toPromiseArray(cmp.em).then(() => cmp.results.join(''))
    }
})

jb.component('pptr.endSession', {
    type: 'action',
    impl: ctx => ctx.vars.pptrPage && ctx.vars.pptrPage.endSession()
})

jb.component('pptr.closeBrowser', {
    type: 'action',
    impl: () => jb.pptr.closeBrowser()
})

jb.component('pptr.extractContent', {
    type: 'pptr.extract',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'extract', as: 'string', options: 'value,innerHTML,outerHTML,href', defaultValue: 'innerHTML'},
        {id: 'multiple', as: 'boolean' },
    ],
    impl: (ctx,selector,extract,multiple) => ({ ctx, do: 
        ({page}) => {
            page.evaluate(`_jb_extract = '${extract}'`).then(()=>
                multiple? page.$$eval(selector, elems => elems.map(el=>el[_jb_extract])): 
                page.$eval(selector, el => el[_jb_extract])) 
            }
        })
})

jb.component('pptr.evaluate', {
    type: 'pptr.feature',
    description: 'evaluate in page context',
    params: [
        {id: 'expression', as: 'string'},
        {id: 'phase', as: 'number', defaultValue: 3, description: 'feature activation order'},
        {id: 'whenDone', type: 'action', dynamic: true },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
    ],
    impl: (ctx,expression,phase,whenDone,frame) => ({ ctx, phase, do: cmp => frame(cmp.page).evalute(expression).then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.repeatingAction', {
    type: 'pptr.feature',
    params: [
        {id: 'action', as: 'string' },
        {id: 'intervalTime', as: 'number', defaultValue: 500 },
        {id: 'phase', as: 'number', defaultValue: 100, description: 'feature activation order'}
    ],
    impl: pptr.evaluate('setInterval(() => %$action% ,%$intervalTime%)','%$phase%')
})

jb.component('pptr.click', {
    type: 'pptr.feature',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'phase', as: 'number', defaultValue: 100, description: 'feature activation order'},
        {id: 'whenDone', type: 'action', dynamic: true },
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
    ],
    impl: (ctx,selector,phase,whenDone,button,clickCount,delay,frame) => ({ ctx, phase, do: cmp => 
        frame(cmp.page).click(selector, {button,clickCount,delay}).then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.waitForFunction', {
    type: 'pptr.feature',
    params: [
        {id: 'condition', as: 'string' },
        {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: '0 to disable, maximum time to wait for in milliseconds' },
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,condition,polling,timeout,whenDone,frame,phase) => 
        ({ ctx, phase, do: cmp => frame(cmp.page).waitForFunction(condition,{polling, timeout})
            .then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.interval', {
    type: 'pptr.polling',
    description: 'the interval in milliseconds at which the function would be executed',
    params: [
        {id: 'intervalTime', as: 'number', defaultValue: 500, mandatory: true}
    ],
    impl: '%$intervalTime%'
})

jb.component('pptr.raf', {
    type: 'pptr.polling',
    description: 'to constantly execute pageFunction in requestAnimationFrame callback. This is the tightest polling mode which is suitable to observe styling changes',
    impl: () => 'raf'
})

jb.component('pptr.mutation', {
    type: 'pptr.polling',
    description: 'every DOM mutation',
    impl: () => 'mutation'
})

jb.component('pptr.waitForSelector', {
    type: 'pptr.feature',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
        {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,selector,visible,hidden,whenDone,timeout,frame,phase) => 
        ({ ctx, phase, 
            do: cmp => frame(cmp.page).waitForSelector(selector,{visible,hidden, timeout}).then(()=>whenDone(ctx.setVar('pptrPage',cmp))) 
        })
})

jb.component('pptr.waitForNavigation', {
    type: 'pptr.feature',
    params: [
        {id: 'waitUntil', as: 'string', options: [
            'load:load event is fired','domcontentloaded:DOMContentLoaded event is fired',
            'networkidle0:no more than 0 network connections for at least 500 ms',
            'networkidle2:no more than 2 network connections for at least 500 ms'].join(',')},
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,waitUntil,whenDone,timeout,phase) => 
        ({ ctx, phase, do: cmp => frame(cmp.page).waitForNavigation({waitUntil, timeout}).then(()=>whenDone(ctx.setVar('pptrPage',cmp)))})
})

jb.component('pptr.delay', {
    type: 'pptr.feature',
    params: [
      {id: 'mSec', as: 'number', defaultValue: 1},
      {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'},
      {id: 'whenDone', type: 'action', dynamic: true },
    ],
    impl: (ctx,mSec,phase) => ({ ctx, phase, do: cmp => jb.delay(mSec).then(()=>whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.pageId', {
    type: 'pptr.feature',
    params: [
        {id: 'id', as: 'string' },
    ],
    impl: ctx => ctx.params
})

jb.component('pptr.features', {
    type: 'pptr.feature',
    params: [
        {id: 'features', type: 'pptr.feature[]', as: 'array', flattenArray: true },
    ],
    impl: '%$features%'
})

jb.component('pptr.endlessScrollDown', {
    type: 'pptr.feature',
    impl: pptr.features(
        pptr.repeatingAction('scrollPos = scrollPos || []; scrollPos.push(window.scrollY); window.scrollBy(0,100)'),
        pptr.waitForFunction('Math.max.apply(0,scrollPos.slice(-4)) == Math.min.apply(0,scrollPos.slice(-4))')
    )
})

// ************ control *******

jb.component('pptr.control', {
    type: 'control',
    params: [
      {id: 'page', type: 'pptr.page', mandatory: true, dynamic: true },
    ],
    impl: (ctx,page) => {
        const comp = page()
        return ctx.run(html({
            html: () => comp.results.join(''),
            features: watchObservable(() => comp.dataEm)
        })) 
    }
})

// ************ frames *********

jb.component('pptr.mainFrame', {
    type: 'pptr.frame',
    impl: () => page => page.mainFrame()
})

jb.component('pptr.frameByIndex', {
    type: 'pptr.frame',
    params: [
        {id: 'index', as: 'number', defaultValue: 0, mandatory: true}
    ],    
    impl: (ctx,index) => page => page.frames()[index]
})