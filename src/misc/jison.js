
jb.component('jison.parse', {
  type: 'data',
  params: [
    { id: 'parser', type: 'jison.parser', mandatory: true, defaultValue: {$: 'jison.parser', lex: [], bnf: [] } },
    { id: 'goal', as : 'string' },
    { id: 'text', as : 'string', defaultValue: '%%' },
    { id: 'debug', as : 'boolean' },
  ],
  impl: (ctx,parser,goal,text,debug) => {
    try {
      if (!jb.jison) { // initialize
        jb.jison = { buffer : ''};
        jb.jisonParser.print = txt => jb.jison.buffer += txt;
      }
      jb.jison.buffer = '';
      if (goal)
        parser.bnf = Object.assign({goal: [[`${goal} EOF`, 'return $1']]},parser.bnf);

      // cache parser
      jb['jison-parser-'+ctx.path] = jb['jison-parser-'+ctx.path] || jb.jisonParser.Parser(parser,{debug: debug});
          
      return  { result: jb['jison-parser-'+ctx.path].parse(text) }
    } catch (e) {
      return { error: e, message: e.message, console: jb.jison.buffer }
//      jb.logException('jison',e,ctx)
    }
  }
})

jb.component('jison.parser', {
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
    return { lex: {rules: flattenRules } , bnf: bnfRules, operators: operators};
    // var base = basedOn || { lex: {rules:[]}, bnf: {}, operators: []};
    // return { lex: {rules: flattenRules.concat(base.lex.rules) } , bnf: Object.assign({},bnfRules,base.bnf), operators: operators.concat(base.operators)};
  }
})

jb.component('lexer.tokens', {
  type: 'lexer-rule',
  params: [
    { id: 'tokens', as: 'string', mandatory: true, description: 'e.g. -,+,*,%,for,=='},
  ],
  impl: (ctx,tokens) => tokens.split(',')
    .map(x=>
      [ ('()[]{}+-*/%'.indexOf(x) == -1 ? x : `\\${x}`) ,`return '${x}';`])
})

jb.component('lexer.ignoreWhiteSpace', {
  type: 'lexer-rule',
  impl: ctx => ['\\s+','']
})

jb.component('lexer.number', {
  type: 'lexer-rule',
  impl: ctx => ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER';"]
})

jb.component('lexer.identifier', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', defaultValue: '[a-zA-Z_][a-zA-Z_0-9]*'},
  ],
  impl: (ctx,regex) => [regex, "return 'IDEN';"]
})

jb.component('lexer.EOF', {
  type: 'lexer-rule',
  impl: ctx => ["$","return 'EOF';"]
})

jb.component('lexerRule', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', mandatory: true, description: '[a-f0-9]+'},
    { id: 'result', as: 'string', mandatory: true, description: "return 'Hex';"},
  ],
  impl: (ctx,regex,result) => [regex,result]
})

jb.component('bnfExpression', {
  type: 'bnf-expression', //singleInType: true,
  params: [
    { id: 'id', as: 'string', mandatory: true},
    { id: 'options', type: 'expression-option[]', mandatory: true, as: 'array', defaultValue: [] },
  ],
  impl: ctx => ({ id: ctx.params.id, options: ctx.params.options.filter(x=>x) })
})

jb.component('expressionOption', {
  type: 'expression-option', //singleInType: true,
  params: [
    { id: 'syntax', as: 'string', mandatory: true, description: 'e + e'},
    { id: 'calculate', as: 'string', mandatory: true, description: '$$ = $1 + $2;' },
  ],
  impl: ctx => jb.entries(ctx.params).map(e=>e[1]).filter(x=>x)
})
