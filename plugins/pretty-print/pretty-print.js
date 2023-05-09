jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,profile) => jb.utils.prettyPrint(jb.val(profile),{ ...ctx.params })
})

jb.extension('utils', 'prettyPrint', {
  initExtension() {
    return {
      emptyLineWithSpaces: Array.from(new Array(200)).map(_=>' ').join(''),
      fixedNLRegExp: new RegExp(`__fixedNL${''}__`,'g'), // avoid self replacement
      fixedNL: `__fixedNL${''}__`, // avoid self replacement
      anyNewLine: new RegExp(`\n|__fixedNL${''}__`)
    }
  },
  prettyPrintComp(compId,comp,settings={}) {
    if (comp) {
      return `component('${compId.split('>').pop()}', ${jb.utils.prettyPrint(comp,{ initialPath: jb.utils.compName(comp) || compId, ...settings })})`
    }
  },
  
  prettyPrint(val,settings = {}) {
    if (val == null) return ''
    return jb.utils.prettyPrintWithPositions(val,settings).text;
  },
  
  advanceLineCol({line,col},text) {
    const noOfLines = (text.match(/\n/g) || '').length + (text.match(jb.utils.fixedNLRegExp) || '').length
    const newCol = noOfLines ? text.split(jb.utils.anyNewLine).pop().length : col + text.length
    return { line: line + noOfLines, col: newCol }
  },

  prettyPrintWithPositions(val,{colWidth=120,tabSize=2,initialPath='',noMacros,forceFlat, depth} = {}) {
    const props = {}
    if (!val || typeof val !== 'object')
      return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

    calcValueProps(val,initialPath)
    const tokens = calcTokens(initialPath, depth || 1, forceFlat)
    const res = aggregateTokens(tokens,{line:0, col: 0})
    res.text = res.text.replace(jb.utils.fixedNLRegExp,'\n')
    return res

    function aggregateTokens(tokens, initialPos = { line: 0, col: 0 }) {
      const map = {}, paths = {}
      let pos = initialPos, offset = 0
      const text = tokens.reduce((text,{path, prop, item, end},i) => {
        const toAdd = typeof item === 'function' ? item() : item
        const toAddStr = typeof toAdd == 'string' ? toAdd : toAdd.text || ''
        const startPos = jb.utils.advanceLineCol(pos,''), endPos = jb.utils.advanceLineCol(pos,toAddStr)
//        posArray.toAddStr = toAddStr
        const semanticPath = [path,prop].join('~')
        if (semanticPath.indexOf('valval') != -1) debugger

        if (end) {
          paths[semanticPath].endPos = startPos
          map[semanticPath][2] = startPos.line
          map[semanticPath][3] = startPos.col
        } else {
          paths[semanticPath] = { startPos, endPos, startOffset: offset, endOffset: offset + toAddStr.length }
          map[semanticPath] = [startPos.line, startPos.col, endPos.line, endPos.col]
        }
        pos = endPos
        offset += toAddStr.length
        return text + toAddStr
      }, '')
      return { text, map, tokens}
    }

    function calcTokens(path, depth = 1, forceFlat) {
      if (depth > 100)
        throw `prettyprint structure too deep ${path}`
      const { open, close, isArray, len, singleParamAsArray, longInnerValInArray, singleFunc, nameValuePattern, item, list } = props[path]
      if (item != null) 
        return [props[path]].map(x=>({...x, path}))
      if (list != null)
        return props[path].list.map(x=>({...x, path}))

      const innerVals = props[path].innerVals || []
      const flat = forceFlat || singleFunc || nameValuePattern || (len < colWidth && !shouldNotFlat())
      const arrayOrProfile = isArray? 'array' : 'profile'

      const vals = innerVals.reduce((acc,{innerPath}, index) => {
        const fullInnerPath = [path,innerPath].join('~')
        const fixedPropName = props[fullInnerPath].fixedPropName
        const semanticPrefix = isArray ? `array-prefix-${index}` : 'prop'
        const semanticSeparator = isArray ? `array-separator-${index}` : `obj-separator-${index}`
        return [
          ...acc,
          {prop: `!${semanticPrefix}`, path: fullInnerPath, item: isArray ? '' : fixedPropName || (fixPropName(innerPath) + ': ')},
          {prop: '!value', item: '', path: fullInnerPath },
          ...calcTokens(fullInnerPath, flat ? depth : depth +1, forceFlat),
          {prop: '!value', item: '', path: fullInnerPath, end: true },
          {prop: `!${semanticSeparator}`, path, item: index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
        ]
      }, [])

      return [
        ...jb.asArray(open).map(x=>({...x, path})),
        {prop: `!open-${arrayOrProfile}`, path, item: newLine()},
        ...vals,
        {prop: `!close-${arrayOrProfile}`, path, item: newLine(-1)},
        ...jb.asArray(close).map(x=>({...x, path})),

      ]

      function newLine(offset = 0) {
        return flat ? '' : '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth+offset)*tabSize)
      }

      function shouldNotFlat() {
        const paramProps = path.match(/~params~[0-9]+$/)
        const paramsParent = path.match(/~params$/)
        const moreThanTwoVals = innerVals.length > 2 && !isArray
        const top = !path.match(/~/g)
        const _longInnerValInArray = !singleParamAsArray && longInnerValInArray
        return !paramProps && (paramsParent || top || moreThanTwoVals || _longInnerValInArray)
        // if (!res)
        //   console.log('should flat ' + path)
        // return res
      }
      function fixPropName(prop) {
        if (prop == '$vars') return 'vars'
        return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
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
      return { item: text, fixedPropName, prop: '!function', len: text.length }
    }

    function calcProfileProps(profile, path) {
      const fullId = [jb.utils.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
      const comp = fullId && jb.utils.getComp(fullId)
      if (comp && profile.$byValue)
        jb.utils.resolveDetachedProfile(profile)
      const id = fullId.split('>').pop()
        
      if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
        const objProps = Object.keys(profile)
        if (objProps.indexOf('$') > 0) { // make the $ first
          objProps.splice(objProps.indexOf('$'),1);
          objProps.unshift('$');
        }
        const len = objProps.reduce((len,key) => len 
          + calcValueProps(profile[key],`${path}~${key}`).len + key.length + 3,2)
        const innerVals = objProps.map(prop=>({innerPath: prop}))
        return openCloseProps(path, {prop:'!open-obj', item:'{'},{prop:'!close-obj', item:'}'}, { len, simpleObj: true, innerVals})
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
        return openCloseProps(path, openProfileByValueGroup, closeProfileByValueGroup, 
          {singleParamAsArray, ...calcArrayProps(args.map(x=>x.val),`${path}~${params[0].id}`), innerVals: args, isArray: true })
      }
      const keys = Object.keys(profile).filter(x=>x != '$')
      const oneFirstArg = keys.length === 1 && params[0] && params[0].id == keys[0]
      const twoFirstArgs = keys.length == 2 && params.length >= 2 && profile[params[0].id] && profile[params[1].id]
      if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstArg || twoFirstArgs) {
        const args = systemProps.concat(params.map(param=>({innerPath: param.id, val: profile[param.id]})))
        while (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop() // cut the undefined's at the end
        const nameValuePattern = args.length == 2 && typeof args[0].val == 'string' && typeof args[1].val == 'function'
        const singleFunc = args.length == 1 && typeof args[0].val == 'function'
        const len = macro.length + args.reduce((len,elem) => 
          len + calcValueProps(elem.val,`${path}~${elem.innerPath}`).len + 2, 2)
        return openCloseProps(path, openProfileByValueGroup, closeProfileByValueGroup, {len, innerVals: args, isArray: true, nameValuePattern, singleFunc })
      }
      const systemPropsInObj = [
        ...profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : [],
        ...profile.typeCast ? [{innerPath: 'typeCast', val: profile.$typeCast} ] : [],
        ...vars.length ? [{innerPath: '$vars', val: vars.map(x=>x.val)}] : []
      ]
      const args = systemPropsInObj.concat(params.filter(param=>profile[param.id] !== undefined)
          .map(param=>({innerPath: param.id, val: profile[param.id]})))
      const open = args.length ? openProfileGroup : openProfileByValueGroup
      const close = args.length ? closeProfileGroup : closeProfileByValueGroup
      const len = macro.length + args.reduce((len,elem) => 
        len + calcValueProps(elem.val,`${path}~${elem.innerPath}`).len + elem.innerPath.length + 2, 2)
      return openCloseProps(path, open, close, {byName: true, len, innerVals: args })
    }

    function calcArrayProps(array, path) {
      let longInnerValInArray = false
      const len = array.reduce((len,val,i) => {
        const innerLen = calcValueProps(val,`${path}~${i}`).len
        longInnerValInArray = longInnerValInArray || innerLen > 20
        return len + innerLen + 2 
      }, 2)
      return {len, longInnerValInArray}
    }

    function calcValueProps(val,path) {
      if (Array.isArray(val)) 
        return openCloseProps(path, {prop:'!open-array-char', item:'['}, {prop:'!close-array-char', item:']'}
          , {...calcArrayProps(val, path), isArray: true, innerVals: Array.from(val.keys()).map(innerPath=>({innerPath})) }
        )
        
      if (val === null) return strProps('null', path, '!null')
      if (val == globalThis) return strProps('err', path, '!global')
      if (val === undefined) return strProps('undefined', path, '!undefined')

      if (typeof val === 'object') return calcProfileProps(val, path)
      if (typeof val === 'function' && val[jb.macro.isMacro]) return calcObjProps(val(), path)
      if (typeof val === 'function') return funcProps(val, path)
  
      if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
        return itemListProps([
          {prop: '!value-text-start', item: "'"},
          {prop: '!value-text', item: JSON.stringify(val).slice(1,-1)},
          {prop: '!value-text-end', item: "'"},
        ], val.length, path)
      else if (typeof val === 'string' && val.indexOf('\n') != -1)
        return itemListProps([
          {prop: '!value-text-start', item: "`"},
          {prop: '!value-text', item: val.replace(/`/g,'\\`')},
          {prop: '!value-text-end', item: "`"},
        ], val.length, path)
      else if (typeof val === 'boolean')
        return itemListProps([
          {prop: '!value-bool-start', item: ''},
          {prop: '!value-text', item: val ? 'true' : 'false'},
          {prop: '!value-bool-end', item: ''},
        ], val? 4 : 5, path)      
      else if (typeof val === 'number')
        return itemListProps([
          {prop: '!value-number-start', item: ''},
          {prop: '!value-text', item: '' + val},
          {prop: '!value-number-end', item: ''},
        ], (''+val).length, path)
      else
        return strProps(JSON.stringify(val) || 'undefined', path, '!unknown') // primitives or symbol      
    }

    function strProps(text,path,prop) {
      return props[path] = {item: text, len: text.len, prop}
    }
    function itemListProps(list, len,path) {
      return props[path] = {list, len}
    }
    function openCloseProps(path, open,close, _props) {
      return props[path] = {open,close, ..._props}
    }
    function funcProps(func,path) {
      return props[path] = serializeFunction(func)
    }
  }
})
