dsl('llm')
using('common,parsing')

component('llmViaApi.completions', {
  type: 'data<>',
  params: [
    {id: 'chat', type: 'message[]', dynamic: true},
    {id: 'llmModel', type: 'model', defaultValue: gpt_35_turbo_0125()},
    {id: 'maxTokens', defaultValue: 100},
    {id: 'metaPrompt', type: 'meta_prompt', dynamic: true},
    {id: 'llmModelForMetaPrompt', type: 'model', defaultValue: gpt_4o()},
    {id: 'includeSystemMessages', as: 'boolean', type: 'boolean<>'},
    {id: 'useRedisCache', as: 'boolean', type: 'boolean<>'},
    {id: 'apiKey', as: 'string'},
  ],
  impl: async (ctx,chatF,model,max_tokens,metaPrompt,llmModelForMetaPrompt, includeSystemMessages,_useRedisCache,_apiKey) => {
        if (metaPrompt.profile == null) 
          return dataFromLlm(chatF())
        const originalChat = chatF()
        const useRedisCache = _useRedisCache && !jb.llm.noRedis
        const taskOrPrompt = originalChat.map(x=>x.content).join('\n')
        const metaPromptChat = metaPrompt(ctx.setVars({taskOrPrompt}))
        if (llmModelForMetaPrompt.reasoning) metaPromptChat.forEach(m=>m.role = 'user')
        const res = await dataFromLlm(metaPromptChat, llmModelForMetaPrompt)
        const content = jb.path(res,'choices.0.message.content') || res
        const actualChat = [{role: 'system', content: 'please answer clearly'}, {role: 'user', content}]
        return dataFromLlm(actualChat, model, originalChat)

        async function dataFromLlm(chat, model, originalChat) {
          const key = 'llm' + jb.utils.calcHash(model.name + JSON.stringify(chat))
          let res = useRedisCache && await jb.utils.redisStorage(key)
          if (!res) {
            const apiKey = await jb.llm.apiKey(_apiKey)
            const start_time = new Date().getTime()
            const settings = !jbHost.isNode && !jbHost.notInStudio && await fetch(`/?op=settings`).then(res=>res.json())
            const ret = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    ...(model.reasoning ? {max_completion_tokens: max_tokens} : {max_tokens : Math.min(max_tokens, model.maxContextLength)}),
                    model: model.name, top_p: 1, frequency_penalty: 0, presence_penalty: 0,
                    messages: chat
                  })
                }
              )
            res = await ret.json()
            res.duration = new Date().getTime() - start_time
            res.chat = chat
            res.originalChat = originalChat
            res.model = model.name
            res.includeSystemMessages = includeSystemMessages
            if (res.error)
                jb.logError('llmViaApi.completions', {error: res.error, chat, model, res, ctx})
            if (useRedisCache && !res.error)
              await jb.utils.redisStorage(key,res)
          }
          return includeSystemMessages ? res: (jb.path(res,'choices.0.message.content') || res)
        }
    }
})

component('source.llmCompletions', {
  type: 'rx<>',
  params: [
    {id: 'chat', type: 'message[]', dynamic: true},
    {id: 'llmModel', type: 'model', defaultValue: gpt_35_turbo_0125()},
    {id: 'maxTokens', defaultValue: 3500},
    {id: 'includeSystemMessages', as: 'boolean', type: 'boolean<>'},
    {id: 'useRedisCache', as: 'boolean', type: 'boolean<>'},
    {id: 'apiKey', as: 'string'},
    {id: 'notifyUsage', type: 'action<>', dynamic: true}
  ],
  impl: (ctx,chatF,model,max_tokens,includeSystemMessages,_useRedisCache, _apiKey,notifyUsage) => (start,sink) => {
      if (start !== 0) return
      const useRedisCache = _useRedisCache && !jb.llm.noRedis
      let controller = null, connection, connectionAborted, DONE, fullContent = ''
      sink(0, (t,d) => {
        if (t == 2) {
          const aborted = controller && controller.signal.aborted
          jb.log('llm source connection abort request', {aborted, ctx})
          jb.delay(1).then(()=> controller && controller.signal.aborted && controller.abort())
          connectionAborted = true
        }
      })
      ;(async ()=>{
        const chat = chatF()
        const key = 'llm' + jb.utils.calcHash(model.name + JSON.stringify(chat))
        
        if (useRedisCache) {
          const redisCache = await jb.utils.redisStorage(key)
          if (redisCache) {
            sink(1,ctx.dataObj(redisCache.fullContent))
            sink(2)
            return
          }
        }
        const start_time = new Date().getTime()
        const apiKey = await jb.llm.apiKey(_apiKey)

        controller = new AbortController()
        connection = await fetch('https://api.openai.com/v1/chat/completions', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                ...(model.reasoning ? {max_completion_tokens: max_tokens} : {max_tokens : Math.min(max_tokens, model.maxContextLength)}),
                stream_options: { include_usage: true},
                model: model.name, top_p: 1, frequency_penalty: 0, presence_penalty: 0, stream: true,
                messages: chat
              })
            }
          ).catch(e => {
            if (e instanceof DOMException && e.name == "AbortError") {
              jb.log('llm source done from app logic', {ctx})
            } else {
              jb.logException(e, 'llm connection', {ctx})
            }
          })

        const reader = connection.body.getReader()
        let chunkLeft = ''
        return reader.read().then(async function processResp({ done, value }) {
          if (done) {
            jb.log('llm source done from reader', {ctx})
            if (!DONE) {
              DONE = true
              onEnd()
              sink(2)
            }
            return
          }
          const fullStr = chunkLeft + String.fromCharCode(...value)
          chunkLeftForLog = chunkLeft
          chunkLeft = ''
          fullStr.split('\n').map(x=>x.trim()).filter(x=>x).forEach(line => {
            if (DONE) return
            try {
              const val = line == 'data: [DONE]' ? 'done' : (line.startsWith('data: ') && line.endsWith('}') ? JSON.parse(line.slice(6)) : line)
              //jb.log('llm processing val', {val, ctx})
              if (val == 'done') {
                jb.log('llm source done from content', {ctx})
                if (DONE) jb.logError('source.llmCompletions already DONE error', {val, ctx})
                DONE = true
                onEnd()
                sink(2)
                return
              }
              if (typeof val == 'string') {
                chunkLeft = val
                jb.log('llm chunkLeft', {chunkLeft, ctx})
              }
              if (typeof val == 'object') {
                if (val.usage) {
                  Object.assign(val,{chat, fullContent})
                  Object.assign(val, jb.llm.notifyApiUsage(val,ctx))
                  notifyUsage(ctx.setData(val))
                }
                const content = jb.path(val,'choices.0.delta.content')
                if (content == null) return
                if (typeof content != 'string') jb.logError('source.llmCompletions non string content', {content, val, ctx})
                fullContent += content
                const toSend = includeSystemMessages ? val : content
                toSend && sink(1,ctx.dataObj(toSend))
              }
            } catch (e) {
              jb.logError('llm can not parse line',{chunkLeftForLog, line, sourceStr: String.fromCharCode(...value), ctx})
            }
          })
          return !connectionAborted && reader.read().then(processResp)

          function onEnd() {
            const res = {
              fullContent, chat, includeSystemMessages,              
              duration: new Date().getTime() - start_time,
              model: model.name
            }
            jb.log('llm finished', {res, ctx})
            if (useRedisCache)
              return jb.utils.redisStorage(key,res)
          }
      })      
    })()
  }
})

component('system', {
  type: 'message',
  params: [
    {id: 'content', as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,content) => ({role: 'system', content})
})

component('assistant', {
    type: 'message',
    params: [
        {id: 'content', as: 'string', newLinesInCode: true}
    ],
    impl: (ctx,content) => ({role: 'assistant', content})
})

component('user', {
  type: 'message',
  params: [
    {id: 'content', as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,content) => ({role: 'user', content})
})

component('llm.textToJsonItems', {
  type: 'rx<>',
  category: 'operator',
  params: [],
  impl: ctx => source => (start, sink) => {
  if (start !== 0) return

  let buffer = '', braceCount = 0, inString = false, escapeNext = false, currentIndex = 0, talkback, inItem

  sink(0, (t,d) => talkback && talkback(t,d))
  source(0, (t,d) => { 
    if (t === 0) talkback = d
    if (t === 1) {
      buffer += d.data
      if (!inItem && buffer.indexOf('{') == -1) return
      while (currentIndex < buffer.length) {
        const char = buffer[currentIndex]
        if (escapeNext)
          escapeNext = false
        else if (char === '\\')
          escapeNext = true
        else if (char === '"')
          inString = !inString
        else if (!inString) {
          if (char === '{') {
            braceCount++
            inItem = true
          }
          if (char === '}') braceCount--
          if (inItem && braceCount === 0) {
            const potentialJson = buffer.slice(0, currentIndex + 1).replace(/^[^{]*{/, '{')
            try {
              const jsonItem = JSON.parse(potentialJson)
              sink(1, ctx.dataObj(jsonItem, d.vars || {}, d.data))
            } catch (error) {
              console.error('Error parsing JSON:', error.message)
            }
            buffer = buffer.slice(currentIndex + 1)
            //if (buffer.indexOf('{') == -1) inItem = false
            inItem = false
            currentIndex = 0
          }
        }
        currentIndex++
      }
    }
    if (t === 2) sink(2, d)
  })
  }
})

component('llm.accumulateText', {
  type: 'rx<>',
  category: 'operator',
  impl: ctx => source => (start, sink) => {
    if (start !== 0) return
    let buffer = '', talkback

    sink(0, (t,d) => talkback && talkback(t,d))
    source(0, (t,d) => { 
      if (t === 0) talkback = d
      if (t === 1) {
        buffer += d.data
        sink(1, ctx.dataObj(buffer, d.vars || {}, d.data))
      }
      if (t === 2) sink(2, d)
    })
  }
})