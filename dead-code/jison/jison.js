extension('jison', {
    $requireLibs: ['/dist/jb-jison.js'],
    initExtension() {
        return { cache: {} }
    },
    forLoader() {}
})

component('jison.parse', {
  type: 'data',
  params: [
    {id: 'parser', type: 'jison.parser', mandatory: true, defaultValue: jison.parser([], [])},
    {id: 'goal', as: 'string'},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'debug', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,parser,goal,text,debug) => {
    let consoleLog = '';
    try {
      jb.jison.forLoader()
      jb.jisonParser.print = txt => consoleLog += txt;

      if (goal)
        parser.bnf = {goal: [[`${goal} EOF`, 'return $1']], ...parser.bnf }
        //parser.bnf = Object.assign({goal: [[`${goal} EOF`, 'return $1']]},parser.bnf);
      const json = JSON.stringify(parser,null,2) // for debugger

      jb.jison.cache[ctx.path] = jb.jison.cache[ctx.path] || jb.jisonParser.Parser(parser,{debug});
          
      return  { result: jb.jison.cache[ctx.path].parse(text) }
    } catch (e) {
      jb.logException('jison',e,{ctx})
      return { error: e, message: e.message, consoleLog }
    } finally {
        jb.jisonParser.print = txt => jb.frame.console.log(txt)
    }
  }
})

component('jison.parser', {
  type: 'jison.parser', // singleInType: true,
  params: [
    { id: 'lex', type : 'lexer-rule[]', as : 'array', defaultValue: [] },
    { id: 'bnf', type : 'bnf-expression[]', as : 'array', defaultValue: [] },
    { id: 'operators', type : 'data[]', as : 'array', defaultValue: [], description: '[["left", "+", "-"]]' },
//    { id: 'basedOn', type : 'jison.parser' },
  ],
  impl: (ctx,lexRules,bnf,operators) => {
    var bnfRules = {};
    var flattenRules = [].concat.apply(lexRules.filter(x=>x).filter(x=>!Array.isArray(x[0])), lexRules.filter(x=>x).filter(x=>Array.isArray(x[0])));
    bnf.filter(x=>x).forEach(e=>bnfRules[e.id] = e.options);
    return { lex: {rules: flattenRules } , bnf: bnfRules, operators };
    // var base = basedOn || { lex: {rules:[]}, bnf: {}, operators: []};
    // return { lex: {rules: flattenRules.concat(base.lex.rules) } , bnf: Object.assign({},bnfRules,base.bnf), operators: operators.concat(base.operators)};
  }
})

component('lexer.tokens', {
  type: 'lexer-rule',
  params: [
    {id: 'tokens', as: 'string', mandatory: true, description: 'e.g. -,+,*,%,for,=='}
  ],
  impl: (ctx,tokens) => tokens.split(',')
    .map(x=>
      [ ('|()[]{}+-*/%'.indexOf(x) == -1 ? x : `\\${x}`) ,`return '${x}'`])
})

component('lexer.ignoreWhiteSpace', {
  type: 'lexer-rule',
  impl: ctx => ['\\s+','']
})

component('lexer.number', {
  type: 'lexer-rule',
  impl: ctx => [`[0-9]+(?:\\.[0-9]+)?\\b`, `return 'NUMBER'`]
})

component('lexer.identifier', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', defaultValue: '[a-zA-Z_][a-zA-Z_0-9]*'},
  ],
  impl: (ctx,regex) => [regex, `return 'IDEN'`]
})

component('lexer.EOF', {
  type: 'lexer-rule',
  impl: ctx => [`$`,`return 'EOF'`]
})

component('lexerRule', {
  type: 'lexer-rule',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: '[a-f0-9]+'},
    {id: 'result', as: 'string', mandatory: true, description: 'Hex'}
  ],
  impl: (ctx,regex,result) => [regex, /^return/.test(result) ? result : `return '${result}'`]
})

component('bnfExpression', {
  type: 'bnf-expression', //singleInType: true,
  params: [
    { id: 'id', as: 'string', mandatory: true},
    { id: 'options', type: 'expression-option[]', mandatory: true, as: 'array', defaultValue: [] },
  ],
  impl: ctx => ({ id: ctx.params.id, options: ctx.params.options.filter(x=>x) })
})

component('expressionOption', {
  type: 'expression-option', //singleInType: true,
  params: [
    { id: 'syntax', as: 'string', mandatory: true, description: 'e + e'},
    { id: 'calculate', as: 'string', mandatory: true, description: '$$ = $1 + $2;' },
  ],
  impl: ctx => jb.entries(ctx.params).map(e=>e[1])
})