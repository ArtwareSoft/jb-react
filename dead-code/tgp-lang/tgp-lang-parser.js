
jb.component('tgp.langParser', {
    impl: jison.parser({
      lex: [
        lexerRule('"[^"]*"', "STRING_CONTENT"),
        lexerRule("'[^']*'", "STRING_CONTENT"),
        lexerRule("`[^`]*`", "TEMPLATE_STRING_CONTENT"),
        lexer.ignoreWhiteSpace(),
        lexerRule('(([a-zA-Z_][a-zA-Z_0-9]*)\\.)+[a-zA-Z_][a-zA-Z_0-9]', "IDEN_WITH_DOTS"),
        lexer.identifier(),
        lexerRule('\\$(([a-zA-Z_][a-zA-Z_0-9]*)\.?)+', "$IDEN_WITH_DOTS"),
        lexer.number(),
        lexer.tokens(':,;,==,=,!=,>,<,|,[,{,(,),},]'),
        lexerRule('\\.\\.\\.', "..."),
        lexerRule(',', ","),
        lexer.EOF()
      ],
      bnf: [
        bnfExpression('profileExp', [
          expressionOption('profileIden { profile_properties }', '$$ = { $: $1, ...$3 }'),
          expressionOption('profileIden ( profile_values )', '$$ = { $: $1, $byValue: $3 }'),
          expressionOption('[ profile_values ]', '$$ = $2'),
          expressionOption('{ objProps }', '$$ = {$: "obj", props: $2 }'),
          expressionOption('STRING_CONTENT', '$$ = $1.slice(1,-1)'),
          expressionOption('NUMBER', '$$ = Number($1)'),
          expressionOption('TEMPLATE_STRING_CONTENT', '$$ = $1'),
          expressionOption('pipeline', '$$ = {$: "pipeline", elems: $1}'), // should validate for data type only
          // expressionOption('actionBlock', '$$ = $1'), // should validate for action type only
        ]),
        bnfExpression('profileIden', [
          expressionOption('IDEN', '$$ = $1'),
          expressionOption('IDEN_WITH_DOTS', '$$ = $1'),
        ]),
        bnfExpression('profile_properties', [
          expressionOption('', '$$ = {}'),
          expressionOption('profile_property', '$$ = $1'),
          expressionOption('profile_property , profile_properties', '$$ = {...$1, ...$3}'),
        ]),
        bnfExpression('profile_property', [
          expressionOption('IDEN : profileExp', '$$ = { [$1] : $3 }')
        ]),
        bnfExpression('profile_values', [
          expressionOption('', '$$ = []'),
          expressionOption('profileExp', '$$ = [$1]'),
          expressionOption('profileExp , profile_values', '$$ = [$1, ...$3]'),
        ]),
        // bnfExpression('objProps', [
        //   expressionOption('', '$$ = []'),
        //   expressionOption('objProp', '$$ = [$1]'),
        //   expressionOption('objProp , objProps', '$$ = [$1, ...$3]'),
        // ]),
        // bnfExpression('objProp', [
        //   expressionOption('IDEN : profileExp', '$$ = {$: "prop", name: $1, value : $3 }'),
        //   expressionOption('IDEN', '$$ = {$: "prop", name: $1, value : $1 }'),
        //   expressionOption('[ profileExp ] : profileExp', '$$ = {$: "dynamicNameProp", name: $2, value : $5 }'),
        //   expressionOption('... profileExp', '$$ = {$: "dynamicProps", exp: $2}'),
        // ]),
        bnfExpression('pipeline', [
          expressionOption('pipeElem', '$$ = [$1]'),
          expressionOption('pipeElem | pipeline', '$$ = [$1, ...$3]'),
          expressionOption('pipeline -| boolExp | pipeline', '$$ = [...$1, filter($3), ...$5]'),
          expressionOption('pipeline -| boolExp', '$$ = [...$1, filter($3)]'),
        ]),
        bnfExpression('pipeElem', [
          expressionOption('profileExp', '$$ = $1'),
          expressionOption('selectExp', '$$ = $1'),
          expressionOption('varsDef', '$$ = $1')
        ]),
        bnfExpression('selectExp', [
          expressionOption('IDEN', '$$ = $1'),
          expressionOption('IDEN_WITH_DOTS', '$$ = $1'),
          expressionOption('$IDEN_WITH_DOTS', '$$ = $1')
        ]),
      ],
      operators: []
    })
  })
  