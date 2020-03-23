
jb.ns('bnfParser')
jb.component('bnfParser.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        databind: '%$Text%', 
        style :{$: 'editable-text.codemirror', enableFullScreen: true, debounceTime: 300, readOnly: false }
      }, 
      {$: 'editable-text', 
        databind: '%$result%', 
        style :{$: 'editable-text.codemirror', cm_settings: '', enableFullScreen: true, debounceTime: 300, readOnly: true }
      }
    ], 
    features: [
      {$: 'variable', name: 'Text', value: '1 +2', watchable: true }, 
      {$: 'variable', 
        name: 'parser', 
        value :{$: 'jison.parser', 
          bnf: [
            {$: 'bnf-expression', 
              options: [{$: 'expression-option', syntax: 'exp EOF', calculate: 'return $1' }], 
              id: 'expressions', 
              $disabled: true
            }, 
            {$: 'bnf-expression', 
              id: 'exp', 
              options: [
                {$: 'expression-option', syntax: 'NUMBER', calculate: '$$ = Number($1);' }, 
                {$: 'expression-option', syntax: 'exp + exp', calculate: '$$ = $1 + $3' }
              ]
            }
          ], 
          operators: [], 
          lex: [
            {$: 'lexer.ignore-white-space' }, 
            {$: 'lexer.number' }, 
            {$: 'lexer.tokens', tokens: '+,-' }, 
            {$: 'lexer.EOF' }
          ]
        }
      }, 
      {$: 'calculated-var', 
        name: 'result', 
        value :{
          $pipeline: [
            {$: 'jison.parse', text: '%$Text%', parser: '%$parser%', goal: 'exp' }, 
            {$: 'json.stringify', value: '%%' }
          ]
        }, 
        watchRefs: ['%$Text%']
      }
    ]
  }
})