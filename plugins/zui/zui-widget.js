dsl('zui')

component('widget', {
    type: 'widget',
    params: [
        {id: 'control', type: 'control', dynamic: true },
        {id: 'canvasSize', as: 'array', defaultValue: [ 600, 600] },
        {id: 'frontEnd', type: 'widget_frontend', defaultValue: widgetFE() },
        {id: 'features', type: 'feature', defaultValue: zui.initFEWidget() },
    ],
    impl: ctx => {
        const {canvasSize, control, frontEnd, features} = ctx.params
        const gl = frontEnd.initFE(canvasSize)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        
        const widget = {
            frontEnd,
//            gl, canvasSize, glLimits,
            clearCanvas() {
                gl.viewport(0, 0, ...canvasSize)
                gl.clearColor(1.0, 1.0, 1.0, 1.0)
                gl.clear(gl.COLOR_BUFFER_BIT)    
            },
            async init() {
                const ctxForBe = ctx.setVars({glLimits: frontEnd.glLimits,canvasSize, widget: this})
                const beCmp = this.be_cmp = control(ctxForBe).applyFeatures(features,20)
                beCmp.init()
                const beCmps= this.cmps = beCmp.descendants()
                const payload = {}
                await beCmps.filter(cmp=>!cmp.gridElem).reduce((pr,cmp) => pr.then(async ()=> mergePayload(await cmp.calcPayload())), Promise.resolve())
                await frontEnd.handleInitPayload(payload)
                frontEnd.renderCmps()
                frontEnd.beProxy = {
                    async beUpdateRequest(cmpIds) {
                        const updatePayload = {}
                        await cmpIds.reduce((pr,id) => pr.then(async ()=> updatePayload[id] = await beCmps.find(cmp=>cmp.id==id).calcPayload()), Promise.resolve())
                        await frontEnd.handlePayload(updatePayload)
                    }
                }

                function mergePayload(cmpPayload) {
                    if (cmpPayload.pack) {
                        Object.assign(payload,cmpPayload)
                        delete payload.pack
                    }
                    else
                        payload[cmpPayload.id] = cmpPayload
                }
            },
        }
        return widget
    }
})

component('widgetFE', {
  type: 'widget_frontend',
  params: [
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx, selector, features) => ({
        cmps: {},
        cmpsData: {},
        textures: {},
        renderCounter: 0,
        state: {tCenter: [1,1], tZoom : 2, zoom: 2, center: [1,1]},

        initFE(canvasSize) {
            this.canvasSize = canvasSize
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
            this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet})
            this.ctx.probe = ctx.probe
            this.boundTextures = Array.from(new Array(this.glLimits.MAX_COMBINED_TEXTURE_IMAGE_UNITS).keys()).map(i=>({i, lru : 0}))
            return gl
        },
        handleInitPayload(glPayload) {
            return this.handlePayload(glPayload)
        },
        async handlePayload(glPayload) {
            const ctx = this.ctx
            Object.entries(glPayload).map(([cmpId,be_data]) => {
                this.cmps[cmpId] = newFECmp(cmpId, be_data, this.canvas)
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
            })
            await Object.keys(glPayload).map(k => this.cmps[k]).filter(cmp=>!cmp.notReady)
              .reduce((pr,cmp) => pr.then(()=>this.prepareTextures(cmp)), Promise.resolve())
            jb.log('zui handlePayload loaded in FE',{cmpsData: this.cmpsData, glPayload,ctx})
            // dirty - build itemlist layout calculator only after loading its ancestors
            const layoutTop =  Object.values(this.cmps).find(cmp => cmp.buildLayoutCalculator)
            layoutTop && layoutTop.buildLayoutCalculator(ctx)

            this.renderRequest = true

            function newFECmp(cmpId, be_data, canvas) {
                const cmp = new (class FECmp {})
                const fromBeData = { notReady, title, gridElem, frontEndMethods, frontEndUniforms } = be_data
                Object.assign(cmp, { id: cmpId, textures: {}, state: {}, flows: [], base: canvas, vars: be_data.frontEndVars || {}, ...fromBeData })
                cmp.destroyed = new Promise(resolve=> cmp.resolveDestroyed = resolve)
                ;(frontEndUniforms||[]).forEach(u=>u.id = u.glVar)

                //;['frontEndMethods', 'frontEndVars', 'frontEndUniforms'].forEach(p=>cmp[p] = cmp[p] || be_data[p])
                jb.zui.runFEMethod(cmp,'calcProps',{silent:true,ctx})
                jb.zui.runFEMethod(cmp,'init',{silent:true,ctx})
                ;(be_data.frontEndMethods ||[]).map(m=>m.method).filter(m=>['init','calcProps'].indexOf(m) == -1)
                    .forEach(method=> cmp[method] = ctx => jb.zui.runFEMethod(cmp,method,{silent:true,ctx}))

                cmp.state.frontEndStatus = 'ready'
                return cmp
            }
        },
        prepareTextures(cmp) {
            const cmpData = this.cmpsData[cmp.id], gl = this.gl
            const textures = cmpData.uniforms.filter(({glType})=>glType == 'sampler2D')
            const allLoaded = textures.reduce((acc, {id}) => acc && cmp.textures[id], true)
            if (allLoaded) return true
            cmp.waitingForTextures = cmp.waitingForTextures || {}
            const toLoad = textures.filter( ({id}) => !cmp.waitingForTextures[id] && !cmp.textures[id])
            return toLoad.reduce((pr,{id, textureSize, bwBitMap, size,packRatio}) => pr.then( async () => {
              cmp.waitingForTextures[id] = true
              //const url = jbHost.isNode || url || jb.path(cmpData,['textures',id])
              const texture = jbHost.isNode || await jb.zui.bwBitMapToTexture(gl,packRatio, bwBitMap, ...size)
              //console.log(jb.zui.xImage(bwBitMap, ...textureSize),size)
              cmp.textures[id] = { texture, size, textureSize }
              delete cmp.waitingForTextures[id]
              this.renderRequest = true
            }), Promise.resolve())
        },
        prepareFrontEndUniforms(cmp,ctx) {
            return cmp.prepUniforms || (cmp.prepUniforms = (cmp.frontEndUniforms||[]).flatMap(({profile,path}) => {
                return Array.isArray(profile) ? profile.map((inner_profile,i)=> {
                            const _path = `${path}~${i}`
                            const uniform = new jb.core.jbCtx(ctx, { profile: inner_profile, path: _path, forcePath: _path }).runItself()
                            uniform.id = uniform.glVar
                            return uniform
                    }) : jb.core.run(new jb.core.jbCtx(ctx, { profile, path, forcePath: path }))
            }))
        },
        renderCmps() {
            if (this.ctx.vars.canUseConsole) console.log(this.state.tZoom, this.state.zoom, this.state.center)
            Object.values(this.cmps).filter(cmp=>!cmp.notReady)
                .forEach(cmp=>cmp.render ? cmp.render(this.ctx) : !cmp.vars.parentItemlistId && this.renderCmp(cmp,this.ctx))
        },        
        renderCmp(cmp,ctx) {
            if (!this.cmpsData[cmp.id].binaryAtts.length) return

            const baseTime = new Date().getTime()
            const { cmpsData, emptyTexture, gl } = this
            const cmpData = cmpsData[cmp.id]
            const { glCode, uniforms, noOfItems } = cmpData
            if (!this.prepareTextures(cmp)) return

            this.prepareFrontEndUniforms(cmp,ctx).forEach(({id,val}) => uniforms.find(u=>u.id ==id).value = val(ctx))
            //if (emulateFrontEndInTest) return

            const shaderProgram = cmp.shaderProgram = cmp.shaderProgram || jb.zui.buildShaderProgram(gl, glCode)
            gl.useProgram(shaderProgram)

            const atlasIdToUnit = (uniforms.find(u=>u.id == 'atlasIdToUnit') || {}).value
            uniforms.forEach(({glType,id,glMethod,value}) => {
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

            //cmpsData.itemsPositions.binaryAtts[0].id = 'itemPos' // the default id is _itemPos...
            ;[cmpData].forEach(({id, binaryAtts, buffer, floatsInVertex}) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
                gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)
        
                binaryAtts.forEach(({id,size,offset}) => {
                const att = gl.getAttribLocation(shaderProgram, id)
                gl.enableVertexAttribArray(att)
                gl.vertexAttribPointer(att, size, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
                })
            })
            jb.log('zui widget renderCmp', {cmp, cmpData, cmpsData, ctx})
            const duration = new Date().getTime() - baseTime
            //console.log(duration, cmp.id)    
            gl.drawArrays(gl.POINTS, 0, noOfItems)
        },
        allocateSingleTextureUnit(cmp,uniformId) {
            const lru = this.renderCounter
            const freeTexture = this.boundTextures.find(rec=>rec.cmp == cmp && rec.uniformId == uniformId) 
                || this.boundTextures.filter(rec => rec.lru != lru).sort((r1,r2) => r1.lru - r2.lru)[0]
                || this.boundTextures[0]
            return Object.assign(freeTexture, {lru,uniformId,cmp})
        }
    })
})

component('zui.initFEWidget', {
  type: 'feature',
  impl: features()
})