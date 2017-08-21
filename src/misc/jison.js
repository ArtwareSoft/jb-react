jb.component('jison.parse', {
  type: 'data',
  params: [
    { id: 'parser', type: 'jison.parser', essential: true, defaultValue: {$: 'jison.parser', lex: [], bnf: [] } },
    { id: 'text', as : 'string', defaultValue: '%%' },
  ],
  impl: (ctx,parser,text) => {
    try {
      return  { result: jb.jisonParser(parser).parse(text) }
    } catch (e) {
      return { error: e, message: e.message }
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
  ],
  impl: (ctx,lexRules,bnf,operators) => {
    var bnfRules = {};
    var flattenRules = [].concat.apply(lexRules.filter(x=>x).filter(x=>!Array.isArray(x[0])), lexRules.filter(x=>x).filter(x=>Array.isArray(x[0])));
    bnf.filter(x=>x).forEach(e=>bnfRules[e.id] = e.options);
    return { lex: {rules: flattenRules } , bnf: bnfRules, operators: operators};
  }
})

jb.component('lexer.tokens', {
  type: 'lexer-rule',
  params: [
    { id: 'tokens', as: 'string', essential: true, description: 'e.g. -,+,*,%,for,=='},
  ],
  impl: (ctx,tokens) => tokens.split(',')
    .map(x=>
      [ ('()[]{}+-*/%'.indexOf(x) == -1 ? x : `\\${x}`) ,`return '${x}';`])
})

jb.component('lexer.ignore-white-space', {
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

jb.component('lexer-rule', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', essential: true, description: '[a-f0-9]+'},
    { id: 'result', as: 'string', essential: true, description: "return 'Hex';"},
  ],
  impl: (ctx,regex,result) => [regex,result]
})

jb.component('bnf-expression', {
  type: 'bnf-expression', //singleInType: true,
  params: [
    { id: 'id', as: 'string', essential: true},
    { id: 'options', type: 'expression-option[]', essential: true, as: 'array', defaultValue: [] },
  ],
  impl: ctx => ctx.params
})

jb.component('expression-option', {
  type: 'expression-option', //singleInType: true,
  params: [
    { id: 'syntax', as: 'string', essential: true, description: 'e + e'},
    { id: 'calculate', as: 'string', essential: true, description: '$$ = $1 + $2;' },
  ],
  impl: ctx => jb.entries(ctx.params).map(e=>e[1])
})
