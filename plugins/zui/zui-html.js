dsl('zui')

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

extension('zui','DataBinder', {
    populateHtml(rootElement,ctx) {
        rootElement.querySelectorAll('[bind], [bind_max], [bind_value], [bind_text], [bind_display], [bind_style]').forEach( el => {
            for (const attr of el.attributes) {
                if (attr.name.startsWith('bind')) {
                const val = ctx.run(attr.value, 'data<>')
                if (val == null) {
                    el.style.display = 'none'
                } else {
                    if (attr.name === 'bind_style') {
                      val.split(';').forEach(propVal=>{
                        const [prop,val] = propVal.split(':').map(x=>x.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase()))
                        el.style[prop] = val
                      })
                    }
                    if (attr.name === 'bind_value' && el.value != val) el.value = val
                    if (attr.name === 'bind_max' && el.value != val) el.max = val
                    if ((attr.name === 'bind_text' || attr.name == 'bind') && el.textContent != val) el.textContent = val
                    el.style.display = ''
                }
                }
            }
        })
    },
    DataBinder: class DataBinder {
        constructor(ctx,topElements) {
          this.ctx = ctx
          this.topElements = topElements
          this.boundElements = []
          this.registerHtmlEvents()
          this.populateHtml()
        }

        registerHtmlEvents() {
          this.topElements.forEach(top=> {
            top.querySelectorAll('[twoWayBind]').forEach(el => {
              const ref = this.ctx.run(el.getAttribute('twoWayBind'), {as: 'ref'})
              const handler = e => { 
                  jb.db.writeValue(ref, e.target.value, this.ctx)
                  this.ctx.vars.widget.renderRequest = true 
              }
              el.addEventListener('input', handler)
              el.value = jb.val(ref)
              this.boundElements.push({ el, event: 'input', handler })
            })
      
            top.querySelectorAll('[onEnter]').forEach(el => {
              const handler = e => {
                  if (e.key != 'Enter') return
                  this.ctx.run(el.getAttribute('onEnter'),'action<>')
                  this.ctx.vars.widget.renderRequest = true 
              }
              el.addEventListener('keypress', handler)      
              this.boundElements.push({ el, event: 'keypress', handler })
            })
          })
        }
      
        populateHtml() {
          this.topElements.forEach(top=> jb.zui.populateHtml(top,this.ctx))
        }

        destroy() {
            this.boundElements.forEach(({ el, event, handler }) => el.removeEventListener(event,handler))
        }
      }
})
