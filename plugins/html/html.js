dsl('html')

component('section', {
    type: 'section',
    params: [
      {id: 'id', as: 'string'},
      {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
      {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
      {id: 'init', dynamic: true },
      {id: 'methods' },
    ]
})

component('group', {
  type: 'section',
  params: [
    {id: 'id', as: 'string'},
    {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'cmp' },
    {id: 'sections', type: 'section[]', composite: true}
  ],
  impl: (ctx, id, html, css, cmp, sections) => {
        const groupVars = jb.objFromEntries(sections.map(sec=>[sec.id,sec]))
        return { id, 
            html: ctx => html(ctx.setVars(groupVars)), 
            css : ctx => css(ctx.setVars(groupVars)),
            cmp: [cmp,...sections.map(sec=>sec.cmp)].reduce((acc, obj) => ({ ...acc, ...obj }), {})
        }
    }
})

component('page', {
  type: 'page',
  params: [
    {id: 'section', type: 'section'},
    {id: 'cmp'},
    {id: 'onRefresh', type: 'action<>', dynamic: true}
  ],
  impl: (ctx, section,cmp, refreshFunc) => ({
    cmp: Object.assign({},{...cmp, ...section.cmp}),
    section,
    injectIntoElem: ({topEl, registerEvents}) => {
        cmp.beforeInjection && cmp.beforeInjection(ctx)
        const ctxToUse = cmp ? ctx.setVars({cmp}) : ctx
        const elem = jb.html.injectSectionIntoElem(section, ctxToUse, {topEl, registerEvents, refreshFunc})
        if (cmp) {
            cmp.ctx = ctxToUse
            cmp.base = elem
            return cmp.init && cmp.init()
        }
    }
  })
})

extension('html','DataBinder', {
    injectSectionIntoElem(section, ctx, {topEl, registerEvents, refreshFunc} = {}) {
        const [html, css] = [section.html(ctx), section.css(ctx) ]
        const elem = topEl || jb.frame && jb.frame.document.body
        elem.innerHTML = html
        jb.html.setCss(section.id, css)
        registerEvents ? new jb.html.DataBinder(ctx,elem, {refreshFunc}) : jb.html.populateHtml(elem,ctx)
        return elem
    },
    setCss(id,content) {
        const document = jb.frame.document
        if (!document) return
        let styleTag = document.getElementById(id)
        if (!styleTag) {
          styleTag = document.createElement('style')
          styleTag.id = id
          document.head.appendChild(styleTag)
        }
        styleTag.textContent = Array.isArray(content)? content.join('\n') : content
    },
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
                      el.style.removeProperty('display')
                      if (attr.name === 'bind_value' && el.value != val) el.value = val
                      if (attr.name === 'bind_max' && el.value != val) el.max = val
                      if (attr.name === 'bind_title' && el.getAttribute('title') != val) el.setAttribute('title',val)
                      if ((attr.name === 'bind_text' || attr.name == 'bind') && el.textContent != val) el.textContent = val
                  }
                }
              }
            }
        })
    },
    registerHtmlEvents(top,ctx,{boundElements, refreshFunc} = {}) {
      top.querySelectorAll('[twoWayBind]').forEach(el => {
        const ref = ctx.run(el.getAttribute('twoWayBind'), {as: 'ref'})
        const handler = e => { 
            jb.db.writeValue(ref, e.target.value, ctx)
            refreshFunc && refreshFunc(ctx)
        }
        el.addEventListener('input', handler)
        el.value = jb.val(ref)
        boundElements && boundElements.push({ el, event: 'input', handler })
      })

      top.querySelectorAll('[onClick]').forEach(el => {
        const action = el.getAttribute('onClick')
        el.removeAttribute('onClick')
        const handler = e => {
            const ret = action.match(/^cmp./) ? eval(`ctx.vars.${action}`) : ctx.runAction({$: action})
            refreshFunc && refreshFunc(ctx)
        }
        el.addEventListener('click', handler)      
        boundElements && boundElements.push({ el, event: 'click', handler })
      })

      top.querySelectorAll('[onEnter]').forEach(el => {
        const action = el.getAttribute('onEnter')
        const handler = e => {
            if (e.key != 'Enter') return
            const ret = action.match(/^cmp./) ? eval(`ctx.vars.${action}`) : ctx.runAction({$: action})
            refreshFunc && refreshFunc(ctx)
        }
        el.addEventListener('keypress', handler)      
        boundElements && boundElements.push({ el, event: 'keypress', handler })
      })
    },
    DataBinder: class DataBinder {
        constructor(ctx,topElements,{ refreshFunc } = {}) {
          this.ctx = ctx
          this.topElements = jb.asArray(topElements)
          this.boundElements = []
          this.populateHtml()
          this.refreshFunc = refreshFunc || (() => ctx.vars.widget.renderRequest = true)
          this.registerHtmlEvents()
        }

        registerHtmlEvents() { 
          this.topElements.forEach(top=> jb.html.registerHtmlEvents(top,this.ctx,
            { boundElements: this.boundElements, refreshFunc: this.refreshFunc})) 
        }
        populateHtml() { 
          this.topElements.forEach(top=> jb.html.populateHtml(top,this.ctx)) 
        }
        destroy() { 
          this.boundElements.forEach(({ el, event, handler }) => el.removeEventListener(event,handler)) 
        }
    },
    async loadFELibs(libs) {
        if (!libs.length) return
        if (typeof document == 'undefined') {
            return jb.logError('can not load front end libs to a frame without a document')
        }
        const libsToLoad = jb.utils.unique(libs)
        jb.html.loadedLibs = jb.html.loadedLibs || {}

        //libsToLoad.forEach(lib=> jb.ui.FELibLoaderPromises[lib] = jb.ui.FELibLoaderPromises[lib] || loadFELib(lib) )
        jb.log('FELibs toLoad',{libsToLoad})
        return libsToLoad.reduce((pr,lib) => pr.then(()=> loadFELib(lib)), Promise.resolve())

        function urlOfLib(lib) {
            return lib.indexOf('://') == -1 ? `${jb.baseUrl||''}/dist/${lib}` : lib
        }

        async function loadFELib(lib) {
            //console.log(`loading ${lib}`)
            if (lib.match(/js$/)) {
                const code = await jb.frame.fetch(urlOfLib(lib)).then(x=>x.text())
                if (! jb.html.loadedLibs[lib]) {
                    jb.html.loadedLibs[lib] = true
                    eval(code)
                }
            } else if (lib.match(/css$/)) {
                const code = await jb.frame.fetch(urlOfLib(lib)).then(x=>x.text())
                const style = document.createElement('style')
                style.type = 'text/css'
                style.innerHTML = code
                document.head.appendChild(style)
            } else if (lib.match(/woff2$/)) {
                const [fontName,weight,_lib] = lib.split(':')
                const arrayBuffer = await jb.frame.fetch(urlOfLib(_lib)).then(x=>x.arrayBuffer())
                const CHUNK_SIZE = 0x8000
                const chunks = []
                const uint8Array = new Uint8Array(arrayBuffer)
                for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE)
                chunks.push(String.fromCharCode(...uint8Array.subarray(i, i + CHUNK_SIZE)))
                const base64Font = btoa(chunks.join(''))
        
                const _weight = weight ? `font-weight: ${weight};` : ''
                const fontFace = `
                @font-face {
                    font-family: '${fontName}';
                    src: url(data:font/woff2;base64,${base64Font}) format('woff2');
                    ${_weight}
                }`
        
                const style = document.createElement('style')
                style.textContent = fontFace
                document.head.appendChild(style)
            }
        }
    }
})
