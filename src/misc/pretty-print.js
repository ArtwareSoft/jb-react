jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,profile) => jb.utils.prettyPrint(jb.val(profile),{ ...ctx.params, comps: jb.studio.previewjb.comps})
})

jb.extension('utils', 'prettyPrint', {
  initExtension() {
    return {
      emptyLineWithSpaces: Array.from(new Array(200)).map(_=>' ').join(''),
      fixedNLRegExp: new RegExp(`__fixedNL${''}__`,'g'), // avoid self replacement
      fixedNL: `__fixedNL${''}__`, // avoid self replacement
    }
  },
  prettyPrintComp(compId,comp,settings={}) {
    if (comp) {
      //const comp = Object.assign({}, _comp,{location: null})
      return `jb.component('${compId}', ${jb.utils.prettyPrint(comp,{ initialPath: compId, ...settings })})`
    }
  },
  
  prettyPrint(val,settings = {}) {
    if (val == null) return ''
    return jb.utils.prettyPrintWithPositions(val,settings).text;
  },
  
  advanceLineCol({line,col},text) {
    const noOfLines = (text.match(/\n/g) || '').length
    const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
    return { line: line + noOfLines, col: newCol }
  },

  prettyPrintWithPositions(val,{colWidth=120,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
    comps = comps || jb.comps
    if (!val || typeof val !== 'object')
      return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

    const res = valueToMacro({path: initialPath, line:0, col: 0, depth :1}, val, forceFlat)
    res.text = res.text.replace(jb.utils.fixedNLRegExp,'\n')
    return res

    function processList(ctx,items) {
      const res = items.reduce((acc,{prop, item}) => {
        const toAdd = typeof item === 'function' ? item(acc) : item
        const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
        const startPos = jb.utils.advanceLineCol(acc,''), endPos = jb.utils.advanceLineCol(acc,toAddStr)
        const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
        return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
      }, {text: '', map: {}, ...ctx})
      return {...ctx, ...res}
    }

    function joinVals(ctx, innerVals, open, close, flat, isArray) {
      const {path, depth} = ctx
      const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
      const arrayOrProfile = isArray? 'array' : 'profile'
      const openResult = processList(ctx,[..._open, {prop: `!open-${arrayOrProfile}`, item: () => newLine()}])

      const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) => {
        const fixedPropName = valueToMacro(ctx, val, flat).fixedPropName // used to serialize function memeber
        const semanticPrefix = isArray ? `array-prefix-${index}` : 'prop'
        const semanticSeparator = isArray ? `array-separator-${index}` : `obj-separator-${index}`
        return processList(acc,[
          {prop: `${innerPath}~!${semanticPrefix}`, item: isArray ? '' : fixedPropName || (fixPropName(innerPath) + ': ')},
          {prop: '!value', item: ctx => {
              const ctxWithPath = { ...ctx, path: [path,innerPath].join('~'), depth: depth +1 }
              return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
            }
          },
          {prop: `!${semanticSeparator}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
        ])}
      , {...openResult, unflat: false} )
      const _close = typeof close === 'string' ? [{prop: `!close-${arrayOrProfile}`, item: close}] : close
      const result = processList(beforeClose, [{prop: `!close-${arrayOrProfile}`, item: () => newLine(-1)}, ..._close])

      const unflat = shouldNotFlat(result)
      if ((forceFlat || !unflat) && !flat)
        return joinVals(ctx, innerVals, open, close, true, isArray)
      return {...result, unflat}

      function newLine(offset = 0) {
        return flat ? '' : '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth+offset)*tabSize)
      }

      function shouldNotFlat(result) {
        const long = result.text.replace(/\n\s*/g,'').split(jb.utils.fixedNL)[0].length > colWidth
        if (!jb.path(jb,'tgp.valOfPath'))
          return result.unflat || long
        const val = jb.path(comps,path.split('~')) 
        const paramProps = path.match(/~params~[0-9]+$/)
        const paramsParent = path.match(/~params$/)
        const ctrls = path.match(/~controls$/) && Array.isArray(val)
        const moreThanTwoVals = innerVals.length > 2 && !isArray
        const top = !path.match(/~/g)
        return !paramProps && (result.unflat || paramsParent || top || ctrls || long || moreThanTwoVals)
      }
      function fixPropName(prop) {
        return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
      }
    }

    function profileToMacro(ctx, profile,flat) {
      const fullId = [jb.utils.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
      const comp = fullId && jb.utils.getComp(fullId)
      if (comp && profile.$byValue)
        jb.utils.resolveDetachedProfile(profile)
      const id = fullId.split('>').pop()
        
      if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
        const props = Object.keys(profile)
        if (props.indexOf('$') > 0) { // make the $ first
          props.splice(props.indexOf('$'),1);
          props.unshift('$');
        }
        return joinVals(ctx, props.map(prop=>({innerPath: prop, val: profile[prop]})), '{', '}', flat, false)
      }
      const macro = jb.macro.titleToId(id)

      const params = comp.params || []
      const singleParamAsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
      const vars = (profile.$vars || []).map(({name,val},i) => ({innerPath: `$vars~${i}`, val: {$: 'Var', name, val }}))
      const systemProps = [...vars, 
          ...profile.remark ? [{innerPath: 'remark', val: {$remark: profile.remark}} ] : [],
          ...profile.typeCast ? [{innerPath: 'typeCast', val: {$typeCast: profile.$typeCast}} ] : [],
      ]
      const openProfileByValueGroup = [{prop: '!profile', item: macro}, {prop:'!open-by-value', item:'('}]
      const closeProfileByValueGroup = [{prop:'!close-by-value', item:')'}]
      const openProfileGroup = [{prop: '!profile', item: macro}, {prop:'!open-profile', item:'({'}]
      const closeProfileGroup = [{prop:'!close-profile', item:'})'}]

      if (singleParamAsArray) { // pipeline, or, and, plus
        const vars = (profile.$vars || []).map(({name,val}) => ({$: 'Var', name, val }))
        const args = vars.concat(jb.asArray(profile[params[0].id]))
          .map((val,i) => ({innerPath: params[0].id + '~' + i, val}))
        return joinVals(ctx, args, openProfileByValueGroup, closeProfileByValueGroup, flat, true)
      }
      const keys = Object.keys(profile).filter(x=>x != '$')
      const oneFirstArg = keys.length === 1 && params[0] && params[0].id == keys[0]
      const twoFirstArgs = keys.length == 2 && params.length >= 2 && profile[params[0].id] && profile[params[1].id]
      if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstArg || twoFirstArgs) {
        const args = systemProps.concat(params.map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
        while (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop() // cut the undefined's at the end
        return joinVals(ctx, args, openProfileByValueGroup, closeProfileByValueGroup, flat, true)
      }
      const systemPropsInObj = [
        ...profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : [],
        ...profile.typeCast ? [{innerPath: 'typeCast', val: profile.$typeCast} ] : [],
        ...vars.length ? [{innerPath: 'vars', val: vars.map(x=>x.val)}] : []
      ]
      const args = systemPropsInObj.concat(params.filter(param=>propOfProfile(param.id) !== undefined)
          .map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
      const open = args.length ? openProfileGroup : openProfileByValueGroup
      const close = args.length ? closeProfileGroup : closeProfileByValueGroup
      return joinVals(ctx, args, open, close, flat, false)

      function propOfProfile(paramId) {
        return profile[paramId]
        // const isFirst = params[0] && params[0].id == paramId
        // return isFirst && profile['$'+id] || profile[paramId]
      }
    }

    function serializeFunction(func) {
      let asStr = func.toString().trim().replace(/^'([a-zA-Z_\-0-9]+)'/,'$1')
      if (func.fixedName)
        asStr = asStr.replace(/initExtension[^(]*\(/,`${func.fixedName}(`)
      const asynch = asStr.indexOf('async') == 0 ? 'async ' : ''
      const noPrefix = asStr.slice(asynch.length)
      const funcName = func.fixedName || func.name
      const header = noPrefix.indexOf(`${funcName}(`) == 0 ? funcName : noPrefix.indexOf(`function ${funcName}(`) == 0 ? `function ${funcName}` : ''
      const fixedPropName = header ? `${asynch}${header}` : ''
      const text = (fixedPropName ? '' : asynch) + asStr.slice(header.length+asynch.length).replace(/\n/g,jb.utils.fixedNL)
      return { text, fixedPropName, map: {} }
    }

    function valueToMacro({path, line, col, depth}, val, flat) {
      const ctx = {path, line, col, depth}
      let result = doValueToMacro()
      if (typeof result === 'string')
        result = { text: result, map: {}}
      return result

      function doValueToMacro() {
        if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
        if (val === null) return 'null'
        if (val === undefined) return 'undefined'
        if (typeof val === 'object') return profileToMacro(ctx, val, flat)
        if (typeof val === 'function' && val[jb.macro.isMacro]) return profileToMacro(ctx, val(), flat)
        if (typeof val === 'function') return serializeFunction(val)
    
        if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
          return processList(ctx,[
            {prop: '!value-text-start', item: "'"},
            {prop: '!value-text', item: JSON.stringify(val).slice(1,-1)},
            {prop: '!value-text-end', item: "'"},
          ])
        else if (typeof val === 'string' && val.indexOf('\n') != -1)
          return processList(ctx,[
            {prop: '!value-text-start', item: "`"},
            {prop: '!value-text', item: val.replace(/`/g,'\\`')},
            {prop: '!value-text-end', item: "`"},
          ])
        else
          return JSON.stringify(val) || 'undefined'; // primitives or symbol
      }
    }

    function arrayToMacro(ctx, array, flat) {
      const vals = array.map((val,i) => ({innerPath: i, val}))
      const openArray = [{prop:'!open-array-char', item:'['}]
      const closeArray = [{prop:'!close-array-char', item:']'}]

      return joinVals(ctx, vals, openArray, closeArray, flat, true)
    }
  }
})
