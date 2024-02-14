dsl('llm')

component('openAI.completions', {
    type: 'data<>',
    params: [
        {id: 'chat', type: 'message[]', dynamic: true },
        {id: 'model', as: 'string', options: 'gpt-3.5-turbo-16k,gpt-4', defaultValue: 'gpt-3.5-turbo', byName: true},
        {id: 'maxTokens', defaultValue : 100 }
    ],
    impl: async (ctx,chat,model,max_tokens) => {
        debugger
        const settings = !jbHost.isNode && await fetch(`/?op=settings`).then(res=>res.json())
        const apiKey = jbHost.isNode ? process.env.OPENAI_API_KEY: settings.OPENAI_API_KEY
        const ret = await jbHost.fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model, max_tokens, top_p: 1, frequency_penalty: 0, presence_penalty: 0,
                messages: chat()                
              })
            }
          )
        const res = await ret.json()
        return jb.path(res,'choices.0.message.content') || jb.path(res)
    }
})

component('system', {
    type: 'message',
    params: [
        {id: 'content', as: 'string'}
    ],
    impl: (ctx,content) => ({role: 'system', content})
})

component('assistant', {
    type: 'message',
    params: [
        {id: 'content', as: 'string'}
    ],
    impl: (ctx,content) => ({role: 'assistant', content})
})

component('user', {
    type: 'message',
    params: [
        {id: 'content', as: 'string'}
    ],
    impl: (ctx,content) => ({role: 'user', content})
})

