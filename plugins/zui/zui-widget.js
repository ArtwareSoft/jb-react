dsl('zui')

component('widget', {
  type: 'widget',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'canvasSize', as: 'array', defaultValue: [600,600]},
    {id: 'frontEnd', type: 'widget_frontend'},
    {id: 'features', type: 'feature', defaultValue: zui.initFEWidget()}
  ],
  impl: ctx => {
        const {canvasSize, control, frontEnd, features} = ctx.params
        const {gl,htmlMode} = frontEnd.initFE(canvasSize)
        if (!htmlMode) {
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        }
        
        const widget = {
            htmlMode,
            frontEnd,
            calcPayload(cmp) {
                return cmp.calcPayload()
            },
            async init() {
                const ctxForBe = ctx.setVars({glLimits: frontEnd.glLimits,canvasSize, widget: this, renderRole: 'fixed', htmlMode})
                const beCmp = this.be_cmp = control(ctxForBe).applyFeatures(features,20)
                beCmp.init({topOfWidget: true})

                const _payload = await this.calcPayload(beCmp)
                const payload = _payload.id ? {[_payload.id] : _payload }: _payload
                const beCmps = beCmp.allDescendants()
                await frontEnd.handlePayload(payload)
                //frontEnd.renderCmps(ctx)
                const self = this
                frontEnd.beProxy = {
                    async beUpdateRequest(cmpIds) {
                        const updatePayload = {}
                        await cmpIds.reduce((pr,id) => pr.then(async ()=> updatePayload[id] = 
                            await self.calcPayload(beCmps.find(cmp=>cmp.id==id))), Promise.resolve())
                        await frontEnd.handlePayload(updatePayload)
                    }
                }
            },
        }
        return widget
    }
})

component('widgetFE', {
  type: 'widget_frontend',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'htmlMode', as: 'boolean', type: 'boolean<>', byName: true}
  ],
  impl: (ctx, selector, htmlMode) => ({
        htmlMode,
        cmps: {},
        cmpsData: {},
        textures: {},
        renderCounter: 1,
        state: {tCenter: [1,1], tZoom : 2, zoom: 2, center: [1,1]},

        initFE(canvasSize) {
            this.canvasSize = canvasSize
            const doc = jb.frame.document
            if (htmlMode) {
                if (!ctx.vars.uiTest) {
                    const doc = jb.frame.document
                    const canvas = this.canvas = doc.createElement('div')
                    canvas.classList.add('widget-top')
                    canvas.style.border = '1px black solid'
                    canvas.style.width = `${canvasSize[0]}px`;canvas.style.height = `${canvasSize[1]}px`;
                    doc.querySelector(selector).appendChild(canvas);
                }
                this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, uiTest: ctx.vars.uiTest, htmlMode})
                this.ctx.probe = ctx.probe
                return {htmlMode}
            } else {
                let gl = null
                if (!ctx.vars.uiTest) {
                    const doc = jb.frame.document
                    const canvas = this.canvas = doc.createElement('canvas')
                    canvas.width = canvasSize[0];canvas.height = canvasSize[1];
                    doc.querySelector(selector).appendChild(canvas)
                    gl = this.gl = jb.zui.createGl(canvasSize,{canvas})
                } else {
                    this.canvas = jbHost.isNode ? require('canvas').createCanvas(...canvasSize) : new OffscreenCanvas(...canvasSize)
                    gl = this.gl = jb.zui.createGl(canvasSize,{offscreen: true})
                }
                this.glLimits = { 
                    MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), 
                    MAX_TEXTURE_SIZE: gl.getParameter(gl.MAX_TEXTURE_SIZE)
                }
                this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, htmlMode})
                this.ctx.probe = ctx.probe
                this.boundTextures = Array.from(new Array(this.glLimits.MAX_COMBINED_TEXTURE_IMAGE_UNITS).keys()).map(i=>({i, lru : 0}))
                return {gl}
            }
        },
        async handlePayload(glPayload) {
            const ctx = this.ctx
            Object.entries(glPayload).map(([cmpId,be_data]) => {
                const cmp = this.cmps[cmpId] = newFECmp(cmpId, be_data, this.canvas, this.canvas)
                const {noOfItems, glAtts} = be_data
                this.cmpsData[cmpId] = { ...(this.cmpsData[cmpId] || {}), ...be_data }
                if (glAtts) {
                    const floatsInVertex = glAtts.reduce((acc,att) => acc + att.size, 0)
                    const binaryAtts = glAtts.reduce((acc,att) => ({ 
                        offset: acc.offset + att.size, 
                        atts: [...acc.atts, {id: `_${att.glVar}`, size: att.size, offset: acc.offset}]
                    }), {offset: 0, atts: []}).atts
                    const buffer = new Float32Array(floatsInVertex * noOfItems)
                    for (let i = 0; i < noOfItems; i++) for (let att = 0; att < glAtts.length; att++) for (let j = 0; j < glAtts[att].size; j++)
                        buffer[i * floatsInVertex + binaryAtts[att].offset + j] = glAtts[att].size == 1 ? 1.0*glAtts[att].ar[i] : 1.0*glAtts[att].ar[i][j]
                    Object.assign(this.cmpsData[cmpId], {binaryAtts, buffer, floatsInVertex })
                }
                ;(this.cmpsData[cmpId].uniforms || []).forEach(u=>u.id = u.glVar)
                if (cmp.html && jb.frame.document) {
                    const temp = jb.frame.document.createElement('div')
                    temp.innerHTML = cmp.html
                    cmp.el = temp.children[0]
                }
                if (cmp.css)
                    jb.zui.setCmpCss(cmp)
            })
            await Object.keys(glPayload).map(k => this.cmps[k]).filter(cmp=>!cmp.notReady)
              .reduce((pr,cmp) => pr.then(()=>this.prepareTextures(cmp)), Promise.resolve())
            jb.log('zui handlePayload loaded in FE',{cmpsData: this.cmpsData, glPayload,ctx})
            // dirty - build itemlist layout calculator only after loading its ancestors
            const layoutTop =  Object.values(this.cmps).find(cmp => cmp.buildLayoutCalculator)
            layoutTop && layoutTop.buildLayoutCalculator(ctx)

            this.renderRequest = true

            function newFECmp(cmpId, be_data, canvas) {
                const cmp = new (class FECmp {}) // used for serialization filtering
                const fromBeData = { notReady, title, gridElem, frontEndMethods, frontEndUniforms, layoutProps, uniforms,renderRole, clz, html, css } = be_data
                Object.assign(cmp, { id: cmpId, textures: {}, state: {}, flows: [], base: canvas,
                    flowElem: be_data.renderRole && be_data.renderRole.match(/[Ff]lowElem/),
                    vars: be_data.frontEndVars || {}, ...fromBeData 
                })
                if (cmp.notReady) return cmp
                cmp.destroyed = new Promise(resolve=> cmp.resolveDestroyed = resolve)
                cmp.feUniforms = (cmp.frontEndUniforms||[]).flatMap(({profile,path}) => {
                    return Array.isArray(profile) ? profile.map((inner_profile,i)=> {
                        const _path = `${path}~${i}`
                        const uniform = new jb.core.jbCtx(ctx, { profile: inner_profile, path: _path, forcePath: _path }).runItself()
                        uniform.id = uniform.glVar = uniform.glVar(ctx)
                        return uniform
                    }) : jb.core.run(new jb.core.jbCtx(ctx, { profile, path, forcePath: path }))
                })
                cmp.mergedUniforms = [
                    ...be_data.uniforms.filter(({glVar}) => !cmp.feUniforms.find(fe=>fe.glVar == glVar)),
                    ...cmp.feUniforms
                ]

                jb.zui.runFEMethod(cmp,'calcProps',{silent:true,ctx})
                jb.zui.runFEMethod(cmp,'init',{silent:true,ctx})
                ;(be_data.frontEndMethods ||[]).map(m=>m.method).filter(m=>['init','calcProps'].indexOf(m) == -1)
                    .forEach(method=> cmp[method] = ctx => jb.zui.runFEMethod(cmp,method,{silent:true,ctx}))

                cmp.state.frontEndStatus = 'ready'
                return cmp
            }
        },
        prepareTextures(cmp) {
            const gl = this.gl
            const textures = cmp.uniforms.filter(({glType})=>glType == 'sampler2D')
            const allLoaded = textures.reduce((acc, {id}) => acc && cmp.textures[id], true)
            if (allLoaded) return true
            cmp.waitingForTextures = cmp.waitingForTextures || {}
            const toLoad = textures.filter( ({id}) => !cmp.waitingForTextures[id] && !cmp.textures[id])
            return toLoad.reduce((pr,{id, textureSize, bwBitMap, size,packRatio}) => pr.then( async () => {
              cmp.waitingForTextures[id] = true
              //const url = jbHost.isNode || url || jb.path(cmpData,['textures',id])
              const texture = await jb.zui.bwBitMapToTexture(gl,packRatio, bwBitMap, ...size)
//              console.log(jb.zui.xImage(bwBitMap, textureSize[0],...size,packRatio))
              cmp.textures[id] = { texture, size, textureSize }
              delete cmp.waitingForTextures[id]
              this.renderRequest = true
            }), Promise.resolve())
        },
        clearCanvas() {
            this.gl.viewport(0, 0, ...this.canvasSize)
            this.gl.clearColor(1, 1, 1, 1)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT)    
        },
        renderCmps(ctx) {
            if (this.ctx.vars.canUseConsole) console.log(this.state.zoom, ...this.state.center)
            // if (htmlMode) {
            //     Object.values(this.cmps).filter(cmp=>!cmp.notReady)
            //         .forEach(cmp=>cmp.zoomingCss && cmp.zoomingCss(ctx))
            //     return
            // }
            Object.values(this.cmps).filter(cmp=>!cmp.notReady && !cmp.flowElem && cmp.renderRole !='zoomingGridElem')
                .forEach(cmp=>cmp.render ? cmp.render(this.ctx) : this.renderCmp(cmp,this.ctx))
        },        
        renderCmp(cmp,ctx) {
            const { itemlistCmp } = ctx.vars
            if (htmlMode) {
                if (cmp.el && itemlistCmp) {
                    if (!itemlistCmp.el.querySelector(`.${cmp.clz}`)) itemlistCmp.el.appendChild(cmp.el)
                    cmp.zoomingCss && cmp.zoomingCss(ctx)
                    cmp.el.style.display = 'block'
                }
                return
            }
            const baseTime = new Date().getTime()
            const { cmpsData, emptyTexture, gl } = this
            const { uniforms, feUniforms, mergedUniforms } = cmp
            const cmpData = cmpsData[cmp.id]
            const {id, binaryAtts, buffer, floatsInVertex} = cmpData
            const { glCode, noOfItems } = cmpData

            if (!binaryAtts.length || !this.prepareTextures(cmp) || this.renderCounter == cmp.lru) return
            cmp.lru = this.renderCounter

            feUniforms.forEach(u => {
                u.value = u.val(ctx)
                if (u.value == null)
                    u.value = uniforms.find(_u=>_u.id == u.id).value
            })

            const shaderProgram = cmp.shaderProgram = cmp.shaderProgram || jb.zui.buildShaderProgram(gl, glCode)
            gl.useProgram(shaderProgram)
            //if (this.ctx.vars.canUseConsole) console.log(cmp.title,glCode[0],glCode[1])

            const atlasIdToUnit = (uniforms.find(u=>u.id == 'atlasIdToUnit') || {}).value
            mergedUniforms.forEach(({glType,id,glMethod,value}) => {
                if (glType == 'sampler2D') {
                    const i = atlasIdToUnit && id.indexOf('atlas') == 0 ? atlasIdToUnit[id.split('atlas').pop()]
                        : this.allocateSingleTextureUnit(cmp,id).i
                    gl.activeTexture(gl['TEXTURE'+i])
                    gl.bindTexture(gl.TEXTURE_2D, cmp.textures[id].texture || emptyTexture)
                    gl.uniform1i(gl.getUniformLocation(shaderProgram, id), i)    
                } else {
                    gl[`uniform${glMethod}`](gl.getUniformLocation(shaderProgram, id), value)
                }
            })

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)    
            binaryAtts.forEach(({id,size,offset}) => {
                const att = gl.getAttribLocation(shaderProgram, id)
                gl.enableVertexAttribArray(att)
                gl.vertexAttribPointer(att, size, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
            })
            
            jb.log('zui widget renderCmp', {cmp, cmpData, cmpsData, ctx})
            const duration = new Date().getTime() - baseTime
            //console.log(duration, cmp.id)    
            gl.drawArrays(gl.POINTS, 0, noOfItems)
        },
        allocateSingleTextureUnit(cmp,uniformId) {
            const lru = this.renderCounter
            const boundTextures = this.boundTextures
            const freeTexture = alloc()
            return Object.assign(freeTexture, {lru,uniformId,cmpId: cmp.id})

            function alloc() {
                const sameTexture = boundTextures.find(rec=>rec.cmpId == cmp.id && rec.uniformId == uniformId)
                if (sameTexture) return sameTexture
                const newTexture = boundTextures.find(rec => rec.lru == 0)
                if (newTexture) return newTexture
                const textureFromDifferentRun = boundTextures.filter(rec => rec.lru != lru).sort((r1,r2) => r1.lru - r2.lru)[0]
                if (textureFromDifferentRun) return textureFromDifferentRun
                jb.logError('can not allocate unit for texture',{cmp,uniformId})
                return boundTextures[0]
            }
        }
    })
})

component('zui.initFEWidget', {
  type: 'feature',
  impl: features()
})

extension('zui','html', {
    setCmpCss(cmp) {
        jb.zui.setCss(cmp.clz, cmp.css.join('\n'))
    },
    setCssVars(cssClass,cssVars) {
        const cssVarRules = Object.entries(cssVars).map(([key, value]) => `--${key}: ${value};`).join('\n')
        const content = `.${cssClass} { ${cssVarRules} }`
        jb.zui.setCss(`vars-${cssClass}`,content)
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
})