
jb.component('bnf-parser.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        controls: [
          {$: 'editable-text', 
            databind :{
              $pipeline: [
                {$: 'jison.parse', 
                  text: '%$Text%', 
                  parser :{$: 'jison.parser', 
                    lex: [
                      {$: 'lexer.ignore-white-space' }, 
                      {$: 'lexer.number' }, 
                      {$: 'lexer.tokens', tokens: '+,-' }, 
                      {$: 'lexer.EOF' }
                    ], 
                    bnf: [
                      {$: 'bnf-expression', 
                        options: [{$: 'expression-option', syntax: 'exp EOF', calculate: 'return $1' }], 
                        id: 'expressions'
                      }, 
                      {$: 'bnf-expression', 
                        id: 'exp', 
                        options: [
                          {$: 'expression-option', syntax: 'NUMBER', calculate: '$$ = Number($1);' }, 
                          {$: 'expression-option', syntax: 'exp + exp', calculate: '$$ = $1 + $3' }
                        ]
                      }
                    ], 
                    operators: []
                  }
                }, 
                '%message%%result%'
              ]
            }, 
            style :{$: 'editable-text.codemirror', cm_settings: '', enableFullScreen: true, debounceTime: 300, readOnly: true }
          }
        ], 
        features :{$: 'watch-ref', ref: '%$Text%' }
      }, 
      {$: 'editable-text', 
        databind: '%$Text%', 
        style :{$: 'editable-text.codemirror', enableFullScreen: true, debounceTime: 300, readOnly: false }
      }
    ], 
    features :{$: 'var', name: 'Text', value: '1 +2', mutable: true }
  }
})