extension('probe', 'suggestions', {
    $requireLibs: ['/dist/fuse.js'],
    initExtension() {
      return { cache: {}, hideInSuggestions: 'cmp,widgetId,headlessWidget,headlessWidgetId,probe'.split(',')}
    },

    suggestions: class suggestions {
      constructor(input, expressionOnly) {
        this.input = input
        this.expressionOnly = expressionOnly;
        this.pos = input.selectionStart;
        this.text = input.value.substr(0,this.pos).trim().slice(0,100);
        this.text_with_open_close = this.text.replace(/%([^%;{}\s><"']*)%/g, (_,x) => `{${x}}`);
        this.exp = rev((rev(this.text_with_open_close).match(/([^\}%]*%)/) || ['',''])[1]);
        this.exp = this.exp || rev((rev(this.text_with_open_close).match(/([^\}=]*=)/) || ['',''])[1]);
        this.tail = rev((rev(this.exp).match(/([^%.\/=]*)(\/|\.|%|=)/)||['',''])[1]);
        this.tailSymbol = this.text_with_open_close.slice(-1-this.tail.length).slice(0,1); // % or /
        if (this.tailSymbol == '%' && this.exp.slice(0,2) == '%$')
          this.tailSymbol = '%$';
        this.base = this.exp.slice(0,-1-this.tail.length) + '%';
        this.inputVal = input.value.slice(0,100);
        this.inputPos = input.selectionStart

        function rev(str) {
          return str.split('').reverse().join('');
        }
      }

      inExpression() {
        return (['%','%$','/','.'].indexOf(this.tailSymbol) != -1)
      }

      suggestionsRelevant() {
        return (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
          || ['%','%$','/','.'].indexOf(this.tailSymbol) != -1
      }

      calcVars(probeCtx) {
        const resources = jb.entries(jb.comps)
              .map(([id,val]) => [id,val.watchableData || val.passiveData])
              .filter(e=>e[1])
              .map(e=>[jb.db.removeDataResourcePrefix(e[0]),e[1]])
        return jb.entries(Object.assign({},(probeCtx.cmpCtx||{}).params,probeCtx.vars))
            .concat(resources)
            .filter(x=>jb.probe.hideInSuggestions.indexOf(x[0]) == -1)
            .map(x=> jb.probe.valueOption('$'+x[0],jb.val(x[1]),[this.pos,this.tail,this.input,this.base]))
            .filter(x=> x.toPaste.indexOf('$$') != 0)
            // .filter(x=> x.toPaste.indexOf(':') == -1)
      }

      calcOptions(probeObj, path) {
        const probeCtx = jb.path(probeObj,'result.0.in') || new jb.core.jbCtx()
        const visits = probeObj.simpleVisits
        const circuitPath = probeObj.circuitCtx.path

        let options = []
        const nonOptionProps = [this.pos,this.tail,this.input,this.base]

        if (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
          options = jb.tgp.PTsOfPath(path).map(compName=> {
                const name = compName.substring(compName.indexOf('.')+1);
                const ns = compName.substring(0,compName.indexOf('.'));
                return jb.probe.compOption(path, compName, compName, ns ? `${name} (${ns})` : name, jb.tgp.getComp(compName).description || '')
            })
        else if (this.tailSymbol == '%')
          options = [...innerPropsOptions(probeCtx.data), ...indexOptions(probeCtx.data), ...this.calcVars(probeCtx) ]
        else if (this.tailSymbol == '%$')
          options = this.calcVars(probeCtx)
        else if (this.tailSymbol == '/' || this.tailSymbol == '.') {
          const baseVal = probeCtx.exp(this.base)
          options = [...innerPropsOptions(baseVal), ...indexOptions(baseVal)]
        }

        options = [
          jb.probe.valueOption('#circuit', circuitPath,nonOptionProps),
          jb.probe.valueOption('#visits',''+visits,nonOptionProps),
          jb.probe.valueOption('#data', probeCtx.data,nonOptionProps),
          ...jb.utils.unique(options,x=>x.toPaste)
        ]        
        if (this.tail != '' && jb.frame.Fuse)
          options = new jb.frame.Fuse(options,{keys: ['toPaste','description']}).search(this.tail || '').map(x=>x.item)


        const optionsHash = options.map(o=>o.toPaste).join(',')
        jb.log('suggestions calc',{ sugg: this, options,probeCtx,path })

        return {optionsHash, options}

        function indexOptions(baseVal) {
          return Array.isArray(baseVal) ? baseVal.slice(0,2).map((v,i) => jb.probe.valueOption(''+i,v,nonOptionProps)) : []
        }
        function innerPropsOptions(baseVal) {
          return jb.toarray(baseVal).slice(0,2)
            .flatMap(x=>jb.entries(x).map(x=> jb.probe.valueOption(x[0],x[1],nonOptionProps)))
        }
      }
  },
  valueOption(toPaste,value,[pos,tail,input,base]) {
    const detail = valAsText(value)
    const text = [toPaste,detail ? `(${detail})`: ''].filter(x=>x).join(' ')
    return { type: 'value', toPaste, valueType: typeof value, pos,tail, text, input, code: toPaste, detail, base }

    function valAsText(val) {
      if (typeof val == 'string' && val.length > 30)
        return `${val.substring(0,30)}...`
      else if (jb.utils.isPrimitiveValue(val))
        return ''+val
      else if (val == null)
        return 'null'
      else if (Array.isArray(val))
        return `${val.length} item${val.length != 1 ? 's' : ''}`
      else if (val && typeof val == 'object')
        return `${Object.keys(val).length} prop${Object.keys(val).length != 1 ? 's' : ''}`
      return typeof value
    }
  },
  compOption(path, toPaste,value,text,description) {
    return {type: 'comp', path, toPaste,valueType: typeof value,text,description, code: toPaste}
  },
  pruneResult(res) {
    const MAX_ARRAY = 100
    const result = res.result.slice(0,MAX_ARRAY).map(x=>({in: pruneCtx(x.in), out: pruneObj(x.out,0)}))
    res.result.length > MAX_ARRAY && (result.actualLength = res.result.length)
    return { simpleVisits: res.simpleVisits, circuitCtx: pruneCtx(res.circuitCtx), result }

    function pruneObj(obj, depth =0) {
      if (depth > 4) return
      if (Array.isArray(obj)) {
        const result = obj.slice(0,100).map(x=>pruneObj(x,depth +1))
        obj.length > MAX_ARRAY && (result.actualLength = obj.length)
        return result
      }
      if (obj && typeof obj == 'object') {
        return jb.objFromEntries(Object.keys(obj).map(k=>[k,pruneObj(obj[k] ,depth +1)]))
      }
      return obj
    }
    function pruneCtx(ctx) {
      return { data: pruneObj(ctx.data,0), vars: pruneObj(ctx.vars,0), path: ctx.path }
    }
  }
})

component('suggestions.shouldShow', {
  params: [
    {id: 'expressionOnly', as: 'boolean'}
  ],
  impl: (ctx,expressionOnly) => new jb.probe.suggestions(jb.val(ctx.data), expressionOnly).suggestionsRelevant()
})

component('suggestions.optionsByProbeResult', {
  params: [
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean'},
    {id: 'input' },
    {id: 'probeObj' },
  ],
  impl: (ctx,probePath,expressionOnly,input,probeObj) => 
    new jb.probe.suggestions(jb.val(input), expressionOnly).calcOptions(probeObj,probePath),
  macroByValue: true
})

component('suggestions.lastRunCtxRef', {
  params: [
    {id: 'sessionId', as: 'string', mandatory: true}
  ],
  impl: (ctx,sessionId) => ({ $jb_val(value) {
      if (value === undefined)
          return jb.probe.cache[sessionId]
      else {
        jb.probe.cache = {}
        jb.probe.cache[sessionId] = value
      }
  }})
})

component('probe.suggestions', {
  params: [
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean'},
    {id: 'input', defaultValue: '%%', description: '{value, selectionStart}'},
    {id: 'sessionId', as: 'string', defaultValue: '%$$dialog.cmpId%', description: 'run probe only once per session'}
  ],
  impl: pipe(
    getOrCreate(
      suggestions.lastRunCtxRef('%$sessionId%'),
      pipe(probe.runCircuit('%$probePath%'), log('memoize suggestions'))
    ),
    suggestions.optionsByProbeResult('%$probePath%', '%$expressionOnly%', '%$input%', '%%')
  ),
  macroByValue: true
})

component('probe.suggestionsByCmd', {
  params: [
    {id: 'filePath', as: 'array'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean'},
    {id: 'input', defaultValue: '%%', description: '{value, selectionStart}'}
  ],
  impl: async (ctx,plugins,projects,probePath,expressionOnly,input) => {
    if (ctx.vars.forceLocalSuggestions)
      return ctx.run({...ctx.profile, $: 'probe.suggestions', sessionId: probePath})
    // TODO: use source code
    const args = ["-main:probe.suggestions()",'-loadTests:true',`-plugins:${plugins.join(',')}`,`-projects:${projects.join(',')}`,
        `%probePath:${probePath}`,`%input:()=>({value: "${input.value}", selectionStart: "${input.selectionStart}"})`,
        `%expressionOnly:${expressionOnly}`,'-spy:probe']

    const command = `node --inspect-brk ../hosts/node/jb.js ${args.map(x=>`'${x}'`).join(' ')}`
    ctx.setData(`suggestionsByCmd: ${command}`).run(remote.action({ action: ({data}) => { jb.vscode.log(data) }, 
      jbm: () => jb.parent, oneway: true }))

    if (jbHost.spawn) {
        let res = null
        try {
          res = await jbHost.spawn(args)
        } catch (e) {
          jb.logException(e,'suggestionsByCmd',{command})
        }
        try {
          return JSON.parse(res)
        } catch (err) {
          debugger
          jb.logError('suggestionsByCmd probe can not parse result returned from command line',{res, command, err})
        }
    }
  }
})

component('probe.pruneResult', {
  params: [
    {id: 'probeResult', defaultValue: '%%'}
  ],
  impl: (ctx,probeResult) => jb.probe.pruneResult(probeResult)
})

component('suggestions.applyOption', {
  type: 'action',
  params: [
    {id: 'toAdd', as: 'string', description: '% or /', defaultValue: '%'}
  ],
  impl: (ctx,toAdd) => {
      const option = jb.val(ctx.vars.selectedOption)
      if (option.type == 'value') {
        const input = option.input
        const primiteVal = typeof option.value != 'object'
        const toPaste = option.toPaste + (primiteVal ? '%' : toAdd)
        const pos = option.pos + 1
        const newVal = () => input.value.substr(0,option.pos-option.tail.length) + toPaste + input.value.substr(pos)
        ctx.run(editableText.setInputState({
            assumedVal: () => input.value,
            newVal,
            selectionStart: pos + toPaste.length,
        }))
        if (toPaste.match(/%$/))
          ctx.run(writeValue('%$$model/databind()%', newVal))        
      } else if (option.type == 'comp') {
        jb.tgp.setComp(option.path, option.toPaste, ctx);
        return jb.studio && ctx.run(runActions(
            { $: 'dialog.closeDialogById', id: 'studio-jb-editor-popup' },
            { $: 'studio.expandAndSelectFirstChildInJbEditor' }
          ))
      }
  }
})
