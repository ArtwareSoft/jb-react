
jb.component('gpt3Demo.main', {
  impl: group({
    layout: layout.vertical('6'),
    style: group.div(),
    controls: [
      group({
        layout: layout.horizontal('11'),
        controls: [
          button({
            title: 'complete',
            action: writeValue(
              '%$result%',
              pipe(
                http.fetch({
                  url: 'https://api.openai.com/v1/engines/davinci/completions',
                  method: 'POST',
                  headers: obj(
                    prop('Content-Type', 'application/json; charset=UTF-8'),
                    prop('Authorization', pipeline(() => parent.jb.db.resources.studio, '%settings/OPENAI_TEST_API_KEY%', 'Bearer %%'))
                  ),
                  body: obj(
                    prop('prompt', '%$prompt%', 'string'),
                    prop('max_tokens', '%$prompt%', 'number'),
                    prop('temperature', '%$temperature%', 'number'),
                    prop('top_p', '%$topP%', 'number')
                  ),
                  json: true,
                  useProxy: 'localhost-server'
                }),
                '%choices[0]/text%'
              )
            ),
            style: button.mdc(),
            raised: true
          }),
          button({
            title: 'generate',
            action: writeValue(
              '%$prompt%',
              pipeline(
                Var('comps', list('itemlists.main', 'itemlists.selection', 'itemlists.largeTable', 'itemlists.search')),
                '%$comps%',
                pipeline(
                  Var('compName', '%%'),
                  Var('comp', ctx => jb.comps[ctx.exp('%$compName%')]),
                  Var('code', prettyPrint('%$comp/impl%')),
                  list('#%$compName%', '##description', '%$comp/description%', '#code', '```%$code%```'),
                  join(newLine())
                ),
                join(newLine())
              )
            ),
            style: button.mdc(),
            raised: true
          })
        ]
      }),
      editableText({
        title: 'prompt',
        databind: '%$prompt%',
        updateOnBlur: true,
        style: editableText.textarea('20', '120'),
        features: watchRef('%$prompt%')
      }),
      editableText({
        title: 'result',
        databind: '%$result%',
        updateOnBlur: false,
        style: editableText.textarea({
          rows: '40',
          cols: '',
          oneWay: true
        }),
        features: watchRef('%$result%')
      })
    ],
    features: [
      watchable('prompt',`Q: hello gpt
A:`),
      watchable('result'),
      watchable('maxTokens','5'),
      watchable('temperature','0.7'),
      watchable('topP','0')
    ]
  })
})

