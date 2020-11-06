(function() {
function resolveFinishedPromise(val) {
    if (val && typeof val == 'object' && val._state == 1) // finished promise
      return val._result
    return val
  }
  
function isRefType(jstype) {
    return jstype === 'ref' || jstype === 'ref[]'
}

function calcVar(ctx,varname,jstype) {
    let res
    if (ctx.cmpCtx && ctx.cmpCtx.params[varname] !== undefined)
      res = ctx.cmpCtx.params[varname]
    else if (ctx.vars[varname] !== undefined)
      res = ctx.vars[varname]
    else if (ctx.vars.scope && ctx.vars.scope[varname] !== undefined)
      res = ctx.vars.scope[varname]
    else if (jb.resources && jb.resources[varname] !== undefined)
      res = isRefType(jstype) ? jb.mainWatchableHandler.refOfPath([varname]) : jb.resource(varname)
    else if (jb.consts && jb.consts[varname] !== undefined)
      res = isRefType(jstype) ? jb.simpleValueByRefHandler.objectProperty(jb.consts,varname) : res = jb.consts[varname]
  
    return resolveFinishedPromise(res)
}
  
function expression(_exp, ctx, parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    let exp = '' + _exp
    if (jstype == 'boolean') return bool_expression(exp, ctx)
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const out = expression(exp.split('$log:')[1],ctx,parentParam)
      jb.comps.log.impl(ctx, out)
      return out
    }
    if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp
    // if (ctx && !ctx.ngMode)
    //   exp = exp.replace(/{{/g,'{%').replace(/}}/g,'%}')
    if (exp == '{%%}' || exp == '%%')
        return expPart('')
  
    if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
      return expPart(exp.substring(2,exp.length-2))
  
    exp = exp.replace(/{%(.*?)%}/g, (match,contents) => jb.tostring(expPart(contents,{ as: 'string'})))
    exp = exp.replace(/{\?(.*?)\?}/g, (match,contents) => jb.tostring(conditionalExp(contents)))
    if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
      return expPart(exp.substring(1,exp.length-1),parentParam)
  
    exp = exp.replace(/%([^%;{}\s><"']*)%/g, (match,contents) => jb.tostring(expPart(contents,{as: 'string'})))
    return exp
  
    function conditionalExp(exp) {
      // check variable value - if not empty return all exp, otherwise empty
      const match = exp.match(/%([^%;{}\s><"']*)%/)
      if (match && jb.tostring(expPart(match[1])))
        return expression(exp, ctx, { as: 'string' })
      else
        return ''
    }
  
    function expPart(expressionPart,_parentParam) {
      return resolveFinishedPromise(evalExpressionPart(expressionPart,ctx,_parentParam || parentParam))
    }
}
  
function evalExpressionPart(expressionPart,ctx,parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    // example: %$person.name%.
  
    const parts = expressionPart.split(/[./[]/)
    return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)
  
    function pipe(input,subExp,last,first,invokeFunc) {
      if (subExp == '')
         return input
      if (subExp.match(/]$/))
        subExp = subExp.slice(0,-1)
  
      const refHandler = jb.objHandler(input)
      const functionCallMatch = subExp.match(/=([a-zA-Z]*)\(?([^)]*)\)?/)
      if (functionCallMatch && jb.functions[functionCallMatch[1]])
          return tojstype(jb.functions[functionCallMatch[1]](ctx,functionCallMatch[2]),jstype,ctx)
      if (subExp.match(/\(\)$/))
        return pipe(input,subExp.slice(0,-2),last,first,true)
      if (first && subExp.charAt(0) == '$' && subExp.length > 1) {
        const ret = calcVar(ctx,subExp.substr(1),last ? jstype : null)
        return typeof ret === 'function' && invokeFunc ? ret(ctx) : ret
      }
      const obj = jb.val(input)
      if (subExp == 'length' && obj && typeof obj.length == 'number')
        return obj.length
      if (Array.isArray(obj) && isNaN(Number(subExp)))
        return [].concat.apply([],obj.map(item=>pipe(item,subExp,last,false,refHandler)).filter(x=>x!=null))
  
      if (input != null && typeof input == 'object') {
        if (obj == null) return
        if (typeof obj[subExp] === 'function' && (invokeFunc || obj[subExp].profile && parentParam && parentParam.dynamic)) {
          //console.log('func',obj[subExp],ctx.profile)
          return obj[subExp](ctx)
        }
        if (subExp.match(/\(\)$/)) {
          const method = subExp.slice(0,-2)
          return typeof obj[method] == 'function' && obj[method]()
        }
        if (subExp.match(/^@/) && obj.getAttribute)
            return obj.getAttribute(subExp.slice(1))
        if (isRefType(jstype)) {
          if (last)
            return refHandler.objectProperty(obj,subExp,ctx)
          if (obj[subExp] === undefined)
            obj[subExp] = implicitlyCreateInnerObject(obj,subExp,refHandler)
        }
        if (last && jstype)
            return jb.jstypes[jstype](obj[subExp])
        return obj[subExp]
      }
    }
    function implicitlyCreateInnerObject(parent,prop,refHandler) {
      jb.log('core innerObject created',{parent,prop,refHandler})
      parent[prop] = {}
      refHandler.refreshMapDown && refHandler.refreshMapDown(parent)
      return parent[prop]
    }
}
  
function bool_expression(exp, ctx, parentParam) {
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const calculated = expression(exp.split('$log:')[1],ctx,{as: 'boolean'})
      const result = bool_expression(exp.split('$log:')[1], ctx, parentParam)
      jb.comps.log.impl(ctx, calculated + ':' + result)
      return result
    }
    if (exp.indexOf('!') == 0)
      return !bool_expression(exp.substring(1), ctx)
    const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/)
    if (!parts) {
      const ref = expression(exp, ctx, parentParam)
      if (jb.isRef(ref))
        return ref
      
      const val = jb.tostring(ref)
      if (typeof val == 'boolean') return val
      const asString = jb.tostring(val)
      return !!asString && asString != 'false'
    }
    if (parts.length != 4)
      return jb.logError('invalid boolean expression: ' + exp, {ctx})
    const op = parts[2].trim()
  
    if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
      const p1 = jb.tostring(expression(trim(parts[1]), ctx, {as: 'string'}))
      let p2 = jb.tostring(expression(trim(parts[3]), ctx, {as: 'string'}))
      p2 = (p2.match(/^["'](.*)["']/) || ['',p2])[1] // remove quotes
      if (op == '==') return p1 == p2
      if (op == '!=') return p1 != p2
      if (op == '^=') return p1.lastIndexOf(p2,0) == 0 // more effecient
      if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1
    }
  
    const p1 = jb.tonumber(expression(parts[1].trim(), ctx))
    const p2 = jb.tonumber(expression(parts[3].trim(), ctx))
  
    if (op == '>') return p1 > p2
    if (op == '<') return p1 < p2
    if (op == '>=') return p1 >= p2
    if (op == '<=') return p1 <= p2
  
    function trim(str) {  // trims also " and '
      return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1')
    }
}

Object.assign(jb,{bool_expression,expression})
})()