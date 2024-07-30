
component('workspace.compOverlay', {
  type: 'feature',
  impl: features(
    frontEnd.method('applyOverlay', (ctx,{cmp}) => {
      const { id, compId, cssClassDefs, compTextHash, fromLine, toLine } = ctx.data
      if (!cmp.editor) return
      const styleElement = document.createElement('style');
      styleElement.id = `cm-overlay-${id}`
      styleElement.textContent = cssClassDefs.map(x => asStyleDef(x)).join('\n')
      document.head.appendChild(styleElement)
      const baseClass = cssClassDefs.filter(({base}) => base).map(({clz})=>clz)[0]

      let lineTokens = null, currLine = 0, token = null, inToken = false
      cmp.overlays = cmp.overlays || {}
      cmp.overlays[id] = {
        token: stream => {
          const newLine = currLine != stream.lineOracle.line
          currLine = stream.lineOracle.line
          if (currLine < fromLine || currLine > toLine) {
            stream.skipToEnd()
            return
          }
          if (newLine) {
            lineTokens = cssClassDefs.filter(({line}) => line == currLine - fromLine)
            inToken = false
            token = lineTokens.shift()
          }
          if (inToken) {
            const clz = token.clz
            eat(stream, token.toCol- token.fromCol)
            token = lineTokens.shift()
            inToken = false
            return `${baseClass} ${clz}`
          } else {
            if (!token) {
              stream.skipToEnd()
              return
            }
            eat(stream, token.fromCol - stream.start)
            inToken = true
            return
          }
        }
      }
      cmp.editor.addOverlay(cmp.overlays[id])

      function eat(stream,num) {
        for(let i=0;i<num;i++) stream.next()
      }
      
      function asStyleDef({clz, style}) {
        return style.after 
          ? `.cm-${clz}::after {\n${Object.entries(style.after).map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join('\n')}}`
          : `.cm-${clz} {\n${Object.entries(style).map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join('\n')}}`
      }
      function checkHash() {
        const compTextInDoc = cmp.editor.getValue().split('\n').slice(fromLine,toLine).join('\n')
        const currentHash = jb.tgpTextEditor.calcHash(compTextInDoc)
        if (currentHash != compTextHash)
          return jb.logError('add overlay comp hash mismatch',{ctx})        
      }
    }),
    frontEnd.method('removeOverlay', ({data},{cmp}) => {
        const id = data
        cmp.editor.removeOverlay(cmp.overlays[id])
        document.getElementById(`overlay-${id}`).remove()
        delete cmp.overlays[id]
    })
  )
})