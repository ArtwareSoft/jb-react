jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,profile) => jb.prettyPrint(jb.val(profile),ctx.params)
})

jb.prettyPrintComp = function(compId,comp,settings={}) {
  if (comp) {
    const macroRemark = ''; //` /* ${jb.macroName(compId)} */`
    const res = "jb.component('" + compId + "', " + jb.prettyPrint(comp,settings) + ')'
    const withMacroName = res.replace(/\n/, macroRemark + '\n')
    return withMacroName
  }
}

jb.prettyPrint = function(val,settings = {}) {
  return jb.prettyPrintWithPositions(val,settings).text;
}

jb.prettyPrint.advanceLineCol = function({line,col},text) {
  const noOfLines = (text.match(/\n/g) || '').length
  const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
  return { line: line + noOfLines, col: newCol }
}
jb.prettyPrint.spaces = Array.from(new Array(200)).map(_=>' ').join('');

jb.prettyPrintWithPositions = function(val,{colWidth=80,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
  comps = comps || jb.comps
  if (!val || typeof val !== 'object')
    return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

  const advanceLineCol = jb.prettyPrint.advanceLineCol
  return valueToMacro({path: initialPath, line:0, col: 0}, val)

  function processList(ctx,items) {
    const res = items.reduce((acc,{prop, item}) => {
      const toAdd = typeof item === 'function' ? item(acc) : item
      const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
      const startPos = advanceLineCol(acc,''), endPos = advanceLineCol(acc,toAddStr)
      const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
      return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
    }, {text: '', map: {}, ...ctx})
    return {...ctx, ...res}
  }

  function joinVals({path, line, col}, innerVals, open, close, flat, isArray) {
    const ctx = {path, line, col}
    const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
    const openResult = processList(ctx,[..._open, {prop: '!open-newline', item: () => newLine()}])
    const arrayOrObj = isArray? 'array' : 'obj'

    const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) =>
      processList(acc,[
        {prop: `!${arrayOrObj}-prefix-${index}`, item: isArray ? '' : fixPropName(innerPath) + ': '},
        {prop: '!value', item: ctx => {
            const ctxWithPath = { ...ctx, path: [path,innerPath].join('~') }
            return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
          }
        },
        {prop: `!${arrayOrObj}-separator-${index}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
      ])
    , {...openResult, unflat: false} )
    const _close = typeof close === 'string' ? [{prop: '!close', item: close}] : close
    const result = processList(beforeClose, [{prop: '!close-newline', item: () => newLine(-1)}, ..._close])

    const unflat = shouldNotFlat(result)
    if ((forceFlat || !unflat) && !flat)
      return joinVals(ctx, innerVals, open, close, true, isArray)
    return Object.assign(result,{unflat})

    function newLine(offset = 0) {
      return flat ? '' : '\n' + jb.prettyPrint.spaces.slice(0,((path.match(/~/g)||'').length+offset+1)*tabSize)
    }

    function shouldNotFlat(result) {
      const val = jb.studio.valOfPath(path)
      if (path.match(/~params~[0-9]+$/)) return false
      const ctrls = path.match(/~controls$/) && Array.isArray(val) // && innerVals.length > 1// jb.studio.isOfType(path,'control') && !arrayElem
      const customStyle = jb.studio.compNameOfPath && jb.studio.compNameOfPath(path) === 'customStyle'
      const top = (path.match(/~/g)||'').length < 2
      const long = result.text.replace(/\n\s*/g,'').length > colWidth
      return result.unflat || customStyle || top || ctrls || long
    }
    function fixPropName(prop) {
      return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
    }
  }

  function profileToMacro({path, line, col}, profile,flat) {
    const ctx = {path, line, col}

    const id = [jb.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
    const comp = comps[id]
    if (comp)
      jb.fixByValue(profile,comp)
    if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
      const props = Object.keys(profile)
      if (props.indexOf('$') > 0) { // make the $ first
        props.splice(props.indexOf('$'),1);
        props.unshift('$');
      }
      return joinVals(ctx, props.map(prop=>({innerPath: prop, val: profile[prop]})), '{', '}', flat, false)
    }
    const macro = jb.macroName(id)

    const params = comp.params || []
    const firstParamIsArray = (params[0] && params[0].type||'').indexOf('[]') != -1
    const vars = Object.keys(profile.$vars || {})
      .map(name => ({innerPath: `$vars~${name}`, val: {$: 'Var', name, val: profile.$vars[name]}}))
    const remark = profile.remark ? [{innerPath: 'remark', val: {$remark: profile.remark}} ] : []
    const systemProps = vars.concat(remark)
    const openProfileByValueGroup = [{prop: '!profile', item: macro}, {prop:'!open-by-value', item:'('}]
    const closeProfileByValueGroup = [{prop:'!close-by-value', item:')'}]
    const openProfileSugarGroup = [{prop: '!profile', item: macro}, {prop:'!open-sugar', item:'('}]
    const closeProfileSugarGroup = [{prop:'!close-sugar', item:')'}]
    const openProfileGroup = [{prop: '!profile', item: macro}, {prop:'!open-profile', item:'({'}]
    const closeProfileGroup = [{prop:'!close-profile', item:'})'}]

    if (params.length == 1 && firstParamIsArray) { // pipeline, or, and, plus
      const args = systemProps.concat(jb.asArray(profile['$'+id] || profile[params[0].id]).map((val,i) => ({innerPath: params[0].id + '~' + i, val})))
      return joinVals(ctx, args, openProfileSugarGroup, closeProfileSugarGroup, flat, true)
    }
    const keys = Object.keys(profile).filter(x=>x != '$')
    const oneFirstParam = keys.length === 1 && params[0] && params[0].id == keys[0]
        && (typeof propOfProfile(keys[0]) !== 'object' || Array.isArray(propOfProfile(keys[0])))
    if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstParam) {
      const args = systemProps.concat(params.map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
      for(let i=0;i<5;i++)
        if (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop()
      return joinVals(ctx, args, openProfileByValueGroup, closeProfileByValueGroup, flat, true)
    }
    const remarkProp = profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : []
    const systemPropsInObj = remarkProp.concat(vars.length ? [{innerPath: 'vars', val: vars.map(x=>x.val)}] : [])
    const args = systemPropsInObj.concat(params.filter(param=>propOfProfile(param.id) !== undefined)
        .map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
      return joinVals(ctx, args,openProfileGroup, closeProfileGroup, flat, false)

    function propOfProfile(paramId) {
      const isFirst = params[0] && params[0].id == paramId
      return isFirst && profile['$'+id] || profile[paramId]
    }
  }

  function valueToMacro({path, line, col}, val, flat) {
    const ctx = {path, line, col}
    let result = doValueToMacro()
    if (typeof result === 'string')
      result = { text: result, map: {}}
    return result

    function doValueToMacro() {
      if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
      if (val === null) return 'null';
      if (val === undefined) return 'undefined';
      if (typeof val === 'object') return profileToMacro(ctx, val, flat);
      if (typeof val === 'function') return val.toString();
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
        return JSON.stringify(val); // primitives
    }
  }

  function arrayToMacro({path, line, col}, array, flat) {
    const ctx = {path, line, col}
    const vals = array.map((val,i) => ({innerPath: i, val}))
    const openArray = [{prop:'!open-array', item:'['}]
    const closeArray = [{prop:'!close-array', item:']'}]

    return joinVals(ctx, vals, openArray, closeArray, flat, true)
  }
}

