component('cardExtract.showOptions', {
    params: [
      {id: 'inspectorProps'}
    ],
    type: 'control',
    impl: group({
      controls: [
        (ctx,{flattenedProfile}) => ctx.run(flattenedProfile),
        text({
          text: prettyPrint('%$flattenedProfile%'),
          style: text.codemirror(),
        }),
      ],
      features: [
        variable('selectedInDebugger', () => parent.document.querySelector('[jb-selected-by-debugger]')),
        variable('ctrlProfile', studio.htmlToControl('%$selectedInDebugger%')),
        variable('flattenedProfile', ({},{ctrlProfile}) => jb.cardExtract.flattenControlToGrid(ctrlProfile,parent.document.body)),
//        chromeDebugger.refreshAfterSelection()
      ]
    })
})
  
component('cardExtract.selectStyle', {
  type: 'control',
  params: [
    {id: 'extractedCtrl'},
    {id: 'targetPath', as: 'string'}
  ],
  impl: group({
    controls: [
      editableBoolean({
        databind: '%$studio/patterns/deleteUnmapped%',
        style: editableBoolean.mdcSlideToggle(),
        textForTrue: 'delete unmapped',
        textForFalse: 'keep unmapped'
      }),
      group({
        controls: group({
          layout: layout.grid({columnSizes: list('600'), columnGap: '10px', rowGap: '10px'}),
          style: group.sections({
            titleStyle: header.mdcHeadline6(),
            sectionStyle: styleWithFeatures(
              group.div(),
              [
                css.padding({left: '10', bottom: '20'}),
                css.boxShadow({
                  blurRadius: '2',
                  spreadRadius: '0',
                  shadowColor: '#000000',
                  opacity: 0.5,
                  horizontal: '2',
                  vertical: '2'
                }),
                css('position: relative')
              ]
            ),
            innerGroupStyle: styleWithFeatures(group.div(), [
              css.padding({top: '20', right: '20'})
            ])
          }),
          controls: dynamicControls({
            controlItems: pipeline(
              cardExtract.suggestedStyles('%$extractedCtrl%', '%$targetPath%'),
              ctx => {
              const clone = JSON.parse(JSON.stringify(ctx.run(tgp.val('%$targetPath%'))))
              const length = JSON.stringify(ctx.exp('%%')).length
              return { ...clone, style: ctx.exp('%%'), length }
          }
            ),
            genericControl: group({
              controls: [
                ctx => {
                    const previewCtx = jb.cardExtract.closestCtxInPreview(ctx,ctx.exp('%$targetPath%'))
                    jb.path(jb,'studio.previewjb.ui.workerStyleElems.preview',[])
                    const cmp = jb.ui.extendWithServiceRegistry(new jb.studio.previewjb.core.jbCtx()).ctx(previewCtx)
                      .run(ctx.exp('%$__option%'))
                    const vdom = jb.ui.cloneVNode(cmp.renderVdom())
                    jb.ui.insertOrUpdateStyleElem(ctx,jb.studio.previewjb.ui.workerStyleElems.preview.join('\n'))
                    jb.path(jb,'studio.previewjb.ui.workerStyleElems.preview',[])
                    return vdom
                },
                button({
                  title: 'select (%$__option/length%)',
                  action: runActions(
                    Var('styleSuffix', If(equals('%$__option/style/$%', 'group'), '', '~style')),
                    writeValue(tgp.ref('%$targetPath%%$styleSuffix%'), '%$__option/style%'),
                    dialog.closeDialog()
                  ),
                  features: css('position: absolute; top: 0; left: 30px;')
                })
              ]
            }),
            itemVariable: '__option'
          }),
          features: css.height('600')
        }),
        features: [
          watchRef({ref: '%$studio/patterns%', includeChildren: 'yes', allowSelfRefresh: true}),
          css.height('600', 'auto')
        ]
      })
    ]
  })
})
  
component('cardExtract.flattenControlToGrid', {
  type: 'control',
  params: [
    {id: 'ctrl'}
  ],
  impl: ctx => {
    const ctrl = jb.cardExtract.flattenControlToGrid(ctx.params.ctrl)
    return jb.ui.extendWithServiceRegistry(ctx).run(ctrl)
  }
})
  
component('cardExtract.extractStyle', {
  type: 'action',
  params: [
    {id: 'extractedCtrl'},
    {id: 'targetPath', as: 'string'}
  ],
  impl: openDialog({
    title: 'select style',
    content: cardExtract.selectStyle('%$extractedCtrl%', '%$targetPath%'),
    features: dialogFeature.uniqueDialog('unique')
  })
})
  
component('cardExtract.suggestedStyles', {
  params: [
    {id: 'extractedCtrl'},
    {id: 'targetPath', as: 'string'}
  ],
  impl: (ctx,extractedCtrl,targetPath) => {
          const options = ctx.exp('%$studio/pattern/options%') || { flattenToGrid: false }
          const target = jb.tgp.valOfPath(targetPath)
          const previewCtx = jb.cardExtract.closestCtxInPreview(ctx,ctx.exp('%$targetPath%'))
          return jb.stylePatterns[target.$] && jb.stylePatterns[target.$](ctx,extractedCtrl,target,previewCtx,options) || {}
      }
})
  
extension('cardExtract', {
    initExtension() { return {
        paramProps: { text: 'text', button: 'title', image: 'url' }, 
        types: ['text','html','button','image']
    }},
    pathToObj: (base, path) => path.split('~').filter(x=>x).reduce((o,p) => o[p],base),
    flatContent(ctrl ,path) {
      const children = jb.asArray(ctrl.controls||[])
          .flatMap((ch,i) => jb.cardExtract.flatContent(ch,
              [path,'controls',Array.isArray(ctrl.controls) ? i : ''].filter(x=>x!=='').join('~')))
      return [{ctrl,path}, ...children]
    },
    closestCtxInPreview(ctx,path) {
        const res = ctx.vars.testID ? jb.studio.findElemsByPathCondition(_path => path.indexOf(_path) == 0,window)[0]
        : jb.studio.jb.cardExtract.closestCtxInPreview(path)
        if (!res) {
        jb.logError('studio-pattern no closest preview ctx',{ctx,path})
        return ctx.vars.testID ? new jb.core.jbCtx() : new jb.studio.previewjb.core.jbCtx()
        }
        return res
    },
    cleanUnmappedParams(ctx,ctrl,matches) {
      if (!ctx.exp('%$studio/patterns/deleteUnmapped%')) return ctrl
      const usedPaths = {}
      matches.forEach(match => jb.tgp.pathParents(match.src.path,true).forEach(path=>usedPaths[path] = true))
      return cleanCtrl(ctrl,'')
  
      function cleanCtrl(ctrl,path) {
          if (!ctrl.controls) return ctrl
          const innerPath = [path,'controls'].filter(x=>x).join('~')
          const controls = Array.isArray(ctrl.controls) ?
              ctrl.controls.flatMap((ch,i) => usedPaths[innerPath +'~'+i] ? [cleanCtrl(ch,innerPath +'~'+i)] : [])
                  .filter(x=>x)
              : usedPaths[innerPath] ? cleanCtrl(ctrl.controls,innerPath) : null
  
          return controls && { ...ctrl, controls }
      }
    },
    flattenControlToGrid(ctrl,parentElem,ctx) {
      // render the extracted ctrl to calculate sizes and sort options
      parentElem = parentElem || document.body
      const top = document.createElement('div')
      jb.ui.renderWidget(ctrl,top,ctx)
      top.style.position = 'relative'
      parentElem.appendChild(top)
      const topRect = top.getBoundingClientRect()
      const X = topRect.x, Y = topRect.y
      const content = jb.cardExtract.flatContent(ctrl,'')
      const srcParams = jb.cardExtract.types.flatMap(type=> content.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
          { id: `${type}${i}`, ctrl: elem.ctrl, type, path: elem.path, pos: pos(elem.path) } )))
      const xKeepList = new Set(), yKeepList = new Set()
      calcPadding()
      parentElem.removeChild(top)
  
      const largetsX = srcParams.map(p=>p.pos.x1).sort((x,y)=>y-x)[0]
      const largetsY = srcParams.map(p=>p.pos.y1).sort((x,y)=>y-x)[0]
      const Xs = filterCloseNeighbours([largetsX,...srcParams.flatMap(p=>[p.pos.x0,p.hasBackground && p.pos.x1].filter(x=>x))].sort((x,y)=>x-y),xKeepList)
      const Ys = filterCloseNeighbours([largetsY,...srcParams.flatMap(p=>[p.pos.y0,p.hasBackground && p.pos.y1].filter(x=>x))].sort((x,y)=>x-y),yKeepList)
  
      // grid-area: 1 / 2 / span 2 / span 3;
      srcParams.forEach(p=> {
        const y = indexInGrid(Ys,p.pos.y0,p), x = indexInGrid(Xs,p.pos.x0,p)
        p.area = [ y, x, 'span ' + (indexInGrid(Ys,p.pos.y1-1,p)-y+1) , 'span ' + (indexInGrid(Xs,p.pos.x1-1,p)-x+1) ].join(' / ')
      });
      return group({
        layout: layout.grid({columnSizes: list(...diffs(Xs)), rowSizes: list(...diffs(Ys))}),
        controls: srcParams.map(p=>({...p.ctrl, features: [...featuresFromParents(p), css.gridArea(`grid-area: ${p.area}`) ] })),
        features: css(`width: ${topRect.width}px; height: ${topRect.height}px;`),
      })
  
    function pos(path) {
      const elem = elemOfPath(path)
      if (!elem) return {}
      const rect = elem.getBoundingClientRect()
      return { x0: Math.floor(rect.x - X), y0: Math.floor(rect.y - Y), x1: Math.floor(rect.right - X), y1: Math.floor(rect.bottom - Y) }
    }
  
    function elemOfPath(path) {
      const win = jb.frame
      const prefix = top ? 'group~impl~' : previewCt+x.ctx.path + '~'
      const pathToCheck = (prefix + path).replace(/\//g,'~')
      return Array.from((top || win.document).querySelectorAll('[cmp-id]'))
          .map(elem=>({elem, ctx: jb.ui.cmpCtxOfElem(elem) }))
          .filter(e => e.ctx && e.ctx.path == pathToCheck).map(e=>e.elem)[0]
    }
  
    function diffs(Xs) {
      return Xs.map((item,i) => i ? Xs[i] - Xs[i-1] : Xs[i])
    }
    // unify grid line neighbours
    function filterCloseNeighbours(Xs,keepList) {
      return Xs.filter((pos,i) => i == 0 || keepList.has(pos) || Xs[i] - Xs[i-1] > 8)
    }
    function featuresFromParents(param) {
      const _parents = jb.tgp.pathParents(param.path).reverse()
      const features = [
        ...(_parents[0].features || []),
        ..._parents.slice(1).reduce((features, path) => [...features,
          jb.asArray(jb.cardExtract.pathToObj(ctrl, path).features)
            .filter(x=>x && ['css.typography','css','css.detailedColor'].indexOf(x.$) != -1)] ,[]) ,
        ...(param.ctrl.features || []),
        ...(param.ctrl.$ == 'image' ? [css('z-index:-1')] : [])
      ].flatMap(x=>jb.asArray(x))
      return jb.ui.cleanRedundentCssFeatures(features)
    }
  
    function indexInGrid(arr,val,param) {
      const offset = param.hasBackground ? 0 : 3
      const res = arr.findIndex(x=> x > val+ offset) + 1
      return res || arr.length
    }
  
    function calcPadding() {
      srcParams.filter(p=>p.type != 'image').forEach(param=>{
        const parentPaths = jb.tgp.pathParents(param.path)
        const idx = parentPaths.findIndex(path=>{ 
          const parentCtrl = jb.cardExtract.pathToObj(ctrl,path)
          return Array.isArray(parentCtrl.controls) && parentCtrl.controls.length >1
        })
        param.hasBackground = [param.path,...parentPaths.slice(0,idx-1)]
          .reduce((acc,path)=> acc || hasBackground(path),false)
        if (!param.hasBackground) return
        const highestPathForSingle = parentPaths[idx-1]
        const parentPos = pos(highestPathForSingle)
        param.ctrl.features = [...jb.asArray(param.ctrl.features||[]),
          css.padding({left: param.pos.x0 - parentPos.x0, top: param.pos.y0 - parentPos.y0})]
        console.log('changing elem',param.path,highestPathForSingle,param.pos, parentPos)
        param.pos = parentPos
        xKeepList.add(parentPos.x0);xKeepList.add(parentPos.x1)
        yKeepList.add(parentPos.y0);yKeepList.add(parentPos.y1)
        if (param.hasBackground)
          console.log('hasBackground',param)
      })
  
      function hasBackground(path) {
        const elem = elemOfPath(path)
        if (!elem) return
        const style = getComputedStyle(elem)
        return style.backgroundColor != 'rgba(0, 0, 0, 0)' || style.borderWidth != '0px' || style.boxShadow != 'none'
      }
    }
    }
})
  
extension('stylePatterns', {
    text(ctx, extractedCtrl) {
        const srcContent = jb.cardExtract.flatContent(extractedCtrl,'')
        const texts = srcContent.filter(x=>x.ctrl.$ == 'text')
        const value = '%$textModel/text%'
        const trgParams = [{id: 'text', origValue: value, type: 'text'}]
        const srcParams = jb.cardExtract.types.flatMap(type=> srcContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: `${type}${i}`, origValue: elem.ctrl, type, path: elem.path } )))
        const options = texts.flatMap(text=> {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            const overridePath = [...text.path.split('~'),'text']
            jb.path(boundedCtrl,overridePath,value) // set value
            return jb.tgp.pathParents(text.path,true).map(path => {
                const ctrl = jb.cardExtract.pathToObj(boundedCtrl, path)
                return jb.utils.resolveDetachedProfile(styleByControl(ctrl,'textModel'))
            })
        })
        return options
    },
    group(ctx, extractedCtrl, target, previewCtx, options = {}) {
        // render the extracted ctrl to calculate sizes and sort options
        const top = document.createElement('div')
        jb.ui.renderWidget(extractedCtrl,top,ctx)
        top.style.position = 'relative'
        document.body.appendChild(top)

        const targetContent = jb.cardExtract.flatContent(target,'')
        const srcContent = jb.cardExtract.flatContent(extractedCtrl,'')
        const srcParams = jb.cardExtract.types.flatMap(type=> srcContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: `${type}${i}`, origValue: elem.ctrl, type, path: elem.path, dVal: distanceVal(elem.path, window, top)} )))
        const srcParamsMap = jb.objFromEntries(srcParams.map(p=>[p.id,p]))
        const trgParams = jb.cardExtract.types.flatMap(type=> targetContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: `${type}${i}`, origValue: elem.ctrl, type, path: elem.path, dVal: distanceVal(elem.path, jb.studio.previewjb.frame) } )))
        const trgParamsMap = jb.objFromEntries(trgParams.map(p=>[p.id,p]))
        const _permutations = jb.cardExtract.types.map(type => mixedPermutations(type, srcParams.filter(x=>x.type == type).map(p=>p.id), trgParams.filter(x=>x.type == type).map(p=>p.id)))
        const rawOptions = combinations(_permutations.filter(x=>x.length)).map(comb => comb.split(';')
            .map(match=> ({ src: srcParamsMap[match.split('-')[0]], trg: trgParamsMap[match.split('-')[1]] })))

        document.body.removeChild(top)

        return [extractedCtrl, ...rawOptions.map(matches => matchesToOption(matches,''))]
          .flatMap(x=>[x,options.flattenToGrid && flattenToGrid(x)].filter(x=>x))

        function mixedPermutations(type, srcIds, trgIds) {
            return jb.utils.unique([...bestPermutations(type, srcIds, trgIds,1),
                sameOrderPermutation(type, srcIds, trgIds),
                randomPermutation(type, srcIds, trgIds)
            ])
        }

        function sameOrderPermutation(type, srcIds, trgIds) {
            const minSize = Math.min(srcIds.length,trgIds.length)
            return srcIds.slice(0,minSize).map((srcId,i)=>`${srcId}-${trgIds[i]}`).join(';')
        }

        function randomPermutation(type, srcIds, trgIds) {
            if (srcIds.length == 0 || trgIds.length == 0) return ''
            const iSrc = Math.floor(Math.random()*srcIds.length)
            const iTrg = Math.floor(Math.random()*trgIds.length)
            const randomPair = {iSrc, iTrg, pair: `${srcIds[iSrc]}-${trgIds[iTrg]}`, }

            const resultWithoutPair = randomPermutation(type, [...srcIds.slice(0,randomPair.iSrc),...srcIds.slice(randomPair.iSrc+1) ],
                [...trgIds.slice(0,randomPair.iTrg),...trgIds.slice(randomPair.iTrg+1) ] )
            return [randomPair.pair,resultWithoutPair].filter(x=>x).join(';')
        }

        function bestPermutations(type, srcIds, trgIds,accResults) {
            if (srcIds.length == 0 || trgIds.length == 0) return ['']
            const bestPairs = srcIds.flatMap((srcId,iSrc) => trgIds.flatMap((trgId,iTrg) =>
                    ({iSrc, iTrg, pair: `${srcId}-${trgId}`, distance: distance(srcParamsMap[srcId].dVal , trgParamsMap[trgId].dVal) } )))
                    .sort((x,y) => y-x).slice(0, accResults < 2 ? 3 : accResults < 10 ? 2: 1)
            return bestPairs.flatMap(bestPair => {
                const resultsWithoutPair = bestPermutations(type, [...srcIds.slice(0,bestPair.iSrc),...srcIds.slice(bestPair.iSrc+1) ],
                    [...trgIds.slice(0,bestPair.iTrg),...trgIds.slice(bestPair.iTrg+1) ], accResults * bestPairs.length)
                return resultsWithoutPair.flatMap(resultWithoutPair => [bestPair.pair,resultWithoutPair].filter(x=>x).join(';'))
            })

            function distance(x1,x2) {
                if (type == 'text')
                    return Math.abs(x1.fontSize - x2.fontSize)
                if (type == 'image')
                    return (Math.abs(x1.width - x2.width) + 2) * (Math.abs(x1.height - x2.height) + 2)
                if (type == 'button')
                    return x1.tag == x2.tag ? 0 : 1
            }
        }

        function combinations(arrOfMatches) {
            if (arrOfMatches.length == 0) return []
            if (arrOfMatches.length == 1) return arrOfMatches[0]
            return arrOfMatches[0].flatMap(m1 => combinations(arrOfMatches.slice(1)).map(m2 => [m1,m2].filter(x=>x).join(';')))
        }

        function distanceVal(path, win, top) {
            const prefix = top ? 'group~impl~' : previewCtx.path + '~'
            const pathToCheck = (prefix + path).replace(/\//g,'~')
            const elem = Array.from((top || win.document).querySelectorAll('[cmp-id]'))
                .map(elem=>({elem, ctx: jb.ui.cmpCtxOfElem(elem)}))
                .filter(e => e.ctx && e.ctx.path == pathToCheck).map(e=>e.elem)[0]
            if (!elem) return {}
            const style = getComputedStyle(elem)
            return { tag: elem.tagName, width: elem.offsetWidth, height: elem.offsetHeight, fontSize: +style.fontSize.match(/([0-9\.]+)/)[1] }
        }

        function matchesToOption(matches,top) {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            matches.forEach(match => {
                const paramProp = jb.cardExtract.paramProps[match.trg.type]
                const overridePath = [...match.src.path.split('~'), paramProp]
                jb.path(boundedCtrl,overridePath, match.trg.origValue[paramProp]) // set value
            })
            const ctrl = jb.cardExtract.cleanUnmappedParams(ctx,jb.cardExtract.pathToObj(boundedCtrl, top),matches,srcParamsMap)
            const res  = {...ctrl, features: [...jb.asArray(target.features),...jb.asArray(ctrl.features)] }
            return res
        }
    },
})