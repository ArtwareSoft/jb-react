dsl('html')

component('section', {
    type: 'section',
    params: [
      {id: 'id', as: 'string'},
      {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
      {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    ]
})

component('group', {
  type: 'section',
  params: [
    {id: 'id', as: 'string'},
    {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'sections', type: 'section[]', composite: true}
  ],
  impl: (ctx, id, html, css, sections) => {
        const groupCtx = ctx.setVars(jb.objFromEntries(sections.map(sec=>[sec.id,sec])))
        return { id, html: html(groupCtx), css : css(groupCtx)}
    }
})

extension('html','DataBinder', {
    populateHtml(rootElement,ctx) {
        rootElement.querySelectorAll('[bind], [bind_max], [bind_title], [bind_value], [bind_text], [bind_display], [bind_style]').forEach( el => {
            for (const attr of el.attributes) {
              if (attr.name.startsWith('bind')) {
                if (attr.name === 'bind_style') {
                  attr.value.split(';').forEach(propVal=>{
                    const [prop,rawVal] = propVal.split(':').map(x=>x.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase()))
                    const val = rawVal.match(/^cmp./) ? eval(`ctx.vars.${rawVal}`) : ctx.run(rawVal, 'data<>')
                    el.style[prop] = val
                  })
                } else { // not style
                  const val = attr.value.match(/^cmp./) ? eval(`ctx.vars.${attr.value}`) : ctx.run(attr.value, 'data<>')
                  if (val == null) {
                      el.style.display = 'none'
                  } else {
                      if (attr.name === 'bind_value' && el.value != val) el.value = val
                      if (attr.name === 'bind_max' && el.value != val) el.max = val
                      if (attr.name === 'bind_title' && el.getAttribute('title') != val) el.setAttribute('title',val)
                      if ((attr.name === 'bind_text' || attr.name == 'bind') && el.textContent != val) el.textContent = val
                      el.style.display = 'block'
                  }
                }
              }
            }
        })
    },
    registerHtmlEvents(top,ctx,boundElements) {
      boundElements = boundElements || []
      top.querySelectorAll('[twoWayBind]').forEach(el => {
        const ref = ctx.run(el.getAttribute('twoWayBind'), {as: 'ref'})
        const handler = e => { 
            jb.db.writeValue(ref, e.target.value, ctx)
            ctx.vars.widget.renderRequest = true 
        }
        el.addEventListener('input', handler)
        el.value = jb.val(ref)
        boundElements.push({ el, event: 'input', handler })
      })

      top.querySelectorAll('[onClick]').forEach(el => {
        const action = el.getAttribute('onClick')
        el.removeAttribute('onClick')
        const handler = e => {
            const ret = action.match(/^cmp./) ? eval(`ctx.vars.${action}`) : ctx.run(action, 'action<>')
            ctx.vars.widget.renderRequest = true 
        }
        el.addEventListener('click', handler)      
        boundElements.push({ el, event: 'click', handler })
      })

      top.querySelectorAll('[onEnter]').forEach(el => {
        const action = el.getAttribute('onEnter')
        const handler = e => {
            if (e.key != 'Enter') return
            const ret = action.match(/^cmp./) ? eval(`ctx.vars.${action}`) : ctx.run(action, 'action<>')
            ctx.vars.widget.renderRequest = true 
        }
        el.addEventListener('keypress', handler)      
        boundElements.push({ el, event: 'keypress', handler })
      })
    },
    DataBinder: class DataBinder {
        constructor(ctx,topElements) {
          this.ctx = ctx
          this.topElements = topElements
          this.boundElements = []
          this.populateHtml()
          this.registerHtmlEvents()
        }

        registerHtmlEvents() { 
          this.topElements.forEach(top=> jb.html.registerHtmlEvents(top,this.ctx)) 
        }
        populateHtml() { 
          this.topElements.forEach(top=> jb.html.populateHtml(top,this.ctx, this.boundElements)) 
        }
        destroy() { 
          this.boundElements.forEach(({ el, event, handler }) => el.removeEventListener(event,handler)) 
        }
    }
})
