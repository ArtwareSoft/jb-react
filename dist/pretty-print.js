
jb.component('pretty-print', {
  params: [
    { id: 'profile', defaultValue: '%%' },
    { id: 'colWidth', as: 'number', defaultValue: 140 },
    { id: 'macro', as: 'boolean'},
  ],
  impl: (ctx,profile) =>
    jb.prettyPrint(profile,ctx.params)
})

jb.prettyPrintComp = function(compId,comp,settings={}) {
  if (comp) {
    const macroRemark = ` /* ${jb.macroName(compId)} */ `
    const res = "jb.component('" + compId + "', " + jb.prettyPrint(comp,settings) + ')'
    const withMacroName = res.replace(/\n/, macroRemark + '\n')
    return withMacroName
  }
}

jb.prettyPrint = function(profile,settings = {}) {
  return jb.prettyPrintWithPositions(profile,settings).text;
}

jb.prettyPrint.advanceLineCol = function({line,col},text) {
  const noOfLines = (text.match(/\n/g) || '').length
  const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
  return { line: line + noOfLines, col: newCol }
}

const spaces = Array.from(new Array(200)).map(_=>' ').join('')
jb.prettyPrintWithPositions = function(profile,{colWidth=80,tabSize=2,initialPath='',showNulls} = {}) {
  const advanceLineCol = jb.prettyPrint.advanceLineCol
  return valueToMacro({path: initialPath, line:0, col: 0}, profile)

  function joinVals({path, line, col}, innerVals, open, close, flat, isArray) {
    const openStr = open + newLine()
    const afterOpenPos = advanceLineCol({line,col},openStr)
    const mapWithOpen = { [path+'~!open']: [line,col,afterOpenPos.line,afterOpenPos.col]}
    const result = innerVals.reduce((acc,{innerPath, val}, index) => {
      const fullInnerPath = [path,innerPath].join('~')
      const valPrefix = isArray ? '' : innerPath + ': '
      const startAttValuePos = advanceLineCol(acc,'')
      const startValuePos = advanceLineCol(startAttValuePos, valPrefix)
      const result = valueToMacro({path: fullInnerPath, line: startValuePos.line, col: startValuePos.col}, val, flat)
      const separator = index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())
      const endValuePos = advanceLineCol(startValuePos, result.text)
      const afterSeparatorPos = advanceLineCol(endValuePos, separator)
      const map = Object.assign({},acc.map, result.map,{
        [fullInnerPath+'~!prefix']:[startAttValuePos.line, startAttValuePos.col, startValuePos.line, startValuePos.col],
        [fullInnerPath+'~!value']:[startValuePos.line, startValuePos.col,endValuePos.line, endValuePos.col],
        [fullInnerPath+'~!separator']:[endValuePos.line, endValuePos.col,afterSeparatorPos.line, afterSeparatorPos.col],
//        [fullInnerPath]:[startAttValuePos.line, startAttValuePos.col,endValuePos.line, endValuePos.col]
      })
      return Object.assign({ text: acc.text + valPrefix + result.text + separator, map, unflat: acc.unflat || result.unflat }, afterSeparatorPos)
    }, {text: openStr, map: mapWithOpen, ...afterOpenPos, unflat: false} )
    const beforeClosePos = advanceLineCol(result,'')
    const closeStr = newLine(-1) + close
    const afterClosePos = advanceLineCol(result,closeStr)
    result.text += closeStr
    Object.assign(result.map,{[path+'~!close']: [beforeClosePos.line,beforeClosePos.col,afterClosePos.line,afterClosePos.col]})

    //const arrayElem = path.match(/~[0-9]+$/)
    const ctrls = path.match(/~controls$/) && Array.isArray(jb.studio.valOfPath(path)) // && innerVals.length > 1// jb.studio.isOfType(path,'control') && !arrayElem
    const customStyle = jb.studio.compNameOfPath(path) === 'customStyle'
    const top = (path.match(/~/g)||'').length < 2
    const long = result.text.replace(/\n\s*/g,'').length > colWidth
    const unflat = result.unflat || customStyle || top || ctrls || long
    if (!unflat && !flat)
      return joinVals({path, line, col}, innerVals, open, close, true, isArray)
    return Object.assign(result,{unflat})


    function newLine(offset = 0) {
      return flat ? '' : '\n' + spaces.slice(0,((path.match(/~/g)||'').length+offset+1)*tabSize)
    }
  }

  function profileToMacro(ctx, profile,flat) {
    const id = [jb.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
    const comp = jb.comps[id]
    if (!id || !comp || profile.$recursive || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
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
    if (params.length == 1 && firstParamIsArray) { // pipeline, or, and, plus
      const args = systemProps.concat(jb.asArray(profile['$'+id] || profile[params[0].id]).map((val,i) => ({innerPath: params[0].id + i, val})))
      return joinVals(ctx, args, `${macro}(`, ')', flat, true)
    }
    const keys = Object.keys(profile).filter(x=>x != '$')
    const oneFirstParam = keys.length === 1 && params[0] && params[0].id == keys[0] 
        && (typeof profile[keys[0]] !== 'object' || Array.isArray(profile[keys[0]]))
    if ((params.length < 3 && comp.usageByValue !== false) || comp.usageByValue || oneFirstParam) {
      const args = systemProps.concat(params.map((param,i)=>({innerPath: param.id, val: (i == 0 && profile['$'+id]) || profile[param.id]})))
      for(let i=0;i<3;i++)
        if (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop()
      return joinVals(ctx, args, `${macro}(`, ')', flat, true)
    }
    const remarkProp = profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : []
    const systemPropsInObj = remarkProp.concat(vars.length ? [{innerPath: 'vars', val: vars.map(x=>x.val)}] : [])
    const args = systemPropsInObj.concat(params.filter(param=>profile[param.id] !== undefined)
        .map(param=>({innerPath: param.id, val: profile[param.id]})))
      return joinVals(ctx, args, `${macro}({`, '})', flat, false)
  }
    
  function valueToMacro(ctx, val, flat) {
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
        return "'" + JSON.stringify(val).slice(1,-1) + "'";
      else if (typeof val === 'string' && val.indexOf('\n') != -1)
        return "`" + val.replace(/`/g,'\\`') + "`"
      else
        return JSON.stringify(val); // primitives
    }
}
  
  function arrayToMacro(ctx, array, flat) {
    const vals = array.map((val,i) => ({innerPath: i, val}))
    return joinVals(ctx, vals, '[', ']', flat, true)
  }

  function rawFormat() {
    let remainedInLine = colWidth;
    let result = '';
    let depth = 0;
    let lineNum = 0;
    let positions = {};
    printValue(profile,initialPath || '');
    return { result, positions }
  
    function sortedPropertyNames(obj) {
      let props = jb.entries(obj)
        .filter(p=>showNulls || p[1] != null)
        .map(x=>x[0]) // try to keep the order
        .filter(p=>p.indexOf('$jb') != 0)
  
      const comp_name = jb.compName(obj);
      if (comp_name) { // tgp obj - sort by params def
        const params = jb.compParams(jb.comps[comp_name]).map(p=>p.id);
        props.sort((p1,p2)=>params.indexOf(p1) - params.indexOf(p2));
      }
      if (props.indexOf('$') > 0) { // make the $ first
        props.splice(props.indexOf('$'),1);
        props.unshift('$');
      }
      return props;
    }
  
    function printValue(val,path) {
      positions[path] = lineNum;
      if (!val) return;
      if (val.$jb_arrayShortcut)
        val = val.items;
      if (Array.isArray(val)) return printArray(val,path);
      if (typeof val === 'object') return printObj(val,path);
      if (typeof val === 'function')
        result += val.toString();
      else if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
        result += "'" + JSON.stringify(val).replace(/^"/,'').replace(/"$/,'') + "'";
      else if (typeof val === 'string' && val.indexOf('\n') != -1) {
        result += "`" + val.replace(/`/g,'\\`') + "`"
      } else {
        result += JSON.stringify(val);
      }
    }
  
    function printObj(obj,path) {
        var obj_str = flat_obj(obj);
        if (!printInLine(obj_str)) { // object does not fit in parent line
          depth++;
          result += '{';
          if (!printInLine(obj_str)) { // object does not fit in its own line
            sortedPropertyNames(obj).forEach(function(prop,index,array) {
                if (prop != '$')
                  newLine();
                if (showNulls || obj[prop] != null) {
                  printProp(obj,prop,path);
                  if (index < array.length -1)
                    result += ', ';//newLine();
                }
            });
          }
          depth--;
          newLine();
          result += '}';
        }
    }
    function quotePropName(p) {
      if (p.match(/^[$a-zA-Z_][$a-zA-Z0-9_]*$/))
        return p;
      else
        return `"${p}"`
    }
    function printProp(obj,prop,path) {
      if (obj[prop] && obj[prop].$jb_arrayShortcut)
        obj = obj(prop,obj[prop].items);
  
      if (printInLine(flat_property(obj,prop))) return;
  
      if (prop == '$')
        result += '$: '
      else
        result += quotePropName(prop) + (jb.compName(obj[prop]) ? ' :' : ': ');
      //depth++;
      printValue(obj[prop],path+'~'+prop);
      //depth--;
    }
    function printArray(array,path) {
      if (printInLine(flat_array(array))) return;
      result += '[';
      depth++;
      newLine();
      array.forEach(function(val,index) {
        printValue(val,path+'~'+index);
        if (index < array.length -1) {
          result += ', ';
          newLine();
        }
      })
      depth--;newLine();
      result += ']';
    }
    function printInLine(text) {
      if (remainedInLine < text.length || text.match(/:\s?{/) || text.match(/, {\$/)) return false;
      result += text;
      remainedInLine -= text.length;
      return true;
    }
    function newLine() {
      result += '\n';
      lineNum++;
      for (var i = 0; i < depth; i++) result += '               '.substr(0,tabSize);
      remainedInLine = colWidth - tabSize * depth;
    }
  
    function flat_obj(obj) {
      var props = sortedPropertyNames(obj)
        .filter(p=>showNulls || obj[p] != null)
        .filter(x=>x!='$')
        .map(prop =>
        quotePropName(prop) + ': ' + flat_val(obj[prop]));
      if (obj && obj.$) {
        props.unshift("$: '" + obj.$+ "'");
        return '{' + props.join(', ') + ' }'
      }
      return '{ ' + props.join(', ') + ' }'
    }
    function flat_property(obj,prop) {
      if (jb.compName(obj[prop]))
        return quotePropName(prop) + ' :' + flat_val(obj[prop]);
      else
        return quotePropName(prop) + ': ' + flat_val(obj[prop]);
    }
    function flat_val(val) {
      if (Array.isArray(val)) return flat_array(val);
      if (typeof val === 'object') return flat_obj(val);
      if (typeof val === 'function') return val.toString();
      if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
        return "'" + JSON.stringify(val).replace(/^"/,'').replace(/"$/,'') + "'";
      else
        return JSON.stringify(val); // primitives
    }
    function flat_array(array) {
      return '[' + array.map(item=>flat_val(item)).join(', ') + ']';
    }
  
  }
 
};

