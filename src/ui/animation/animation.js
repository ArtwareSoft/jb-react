jb.ns('animation')

jb.component('animation.start', {
  type: 'action',
  params: [
    {id: 'animation', type: 'animation[]', dynamic: true, flattenArray: true, as: 'array', mandatory: true},
    {id: 'target', description: 'query selector or elements, default is current control'},
    {id: 'direction', as: 'string', options: ',reverse,alternate', description: 'alternate goes back to origin'},
    {id: 'loop', as: 'boolean', type: 'boolean'},
    {id: 'duration', as: 'string', description: 'in mSec'}
  ],
  impl: (ctx,animation,target,direction,loop,duration) => jb.animate.run(Object.assign(jb.animate.fixValues({direction,loop,duration}), ...animation()),target,ctx)
})

jb.component('animation.timeline', {
  type: 'action',
  params: [
    {id: 'animation', type: 'animation[]', dynamic: true, flattenArray: true, as: 'array', mandatory: true},
    {id: 'target', as: 'string', description: 'query selector, default is current control'}
  ],
  impl: (ctx,animation,target) => jb.animate.run(Object.assign({}, ...animation()),target,ctx)
})

jb.component('animation.keyframes', {
  description: 'sequence, one after the other',
  type: 'animation',
  params: [
    {id: 'animation', type: 'animation[]', dynamic: true, flattenArray: true, as: 'array', mandatory: true}
  ],
  impl: (ctx,animation) => ({ keyframes: animation() })
})

jb.component('animation.expression', {
  type: 'animation.val',
  params: [
    {id: 'val', mandatory: true, description: 'e.g. 20 , +=10, *=2'}
  ],
  impl: (ctx,val) => val
})

jb.component('animation.range', {
  type: 'animation.val',
  params: [
    {id: 'from', as: 'string', mandatory: true, description: 'e.g. 20'},
    {id: 'to', as: 'string', mandatory: true, description: 'e.g. 30'}
  ],
  impl: (ctx, from, to) => [from, to]
})


jb.component('animation.stagger', {
  type: 'animation.val',
  description: 'animate group - distribute different animation values between group members',
  params: [
    {id: 'val', mandatory: true, type: 'animation.stager-val', description: 'value range', dynamic: true},
    {id: 'from', as: 'string', options: 'first,last,center', description: 'Starts the stagger effect from a specific position', defaultValue: 'first'},
    {id: 'direction', options: ',reverse', description: 'e.g. 20'},
    {id: 'easing', type: 'animation.easing'},
    {id: 'grid', type: 'animation.stager-grid'}
  ],
  impl: (ctx,val,from,direction,easing,grid) => {
        const staggerArgs = { obj: {} }
        ctx.params.val(ctx.setData(staggerArgs))
        const stagger = {...staggerArgs.obj, ...(grid || {}), from,direction,easing}
        return jb.animate.anime.stagger(staggerArgs.val, jb.animate.fixValues(stagger))
    }
})

jb.component('animation.stagerGrid', {
  type: 'animation.stager-grid',
  params: [
    {id: 'rows', mandatory: true, as: 'number', description: 'e.g. 2'},
    {id: 'columns', mandatory: true, as: 'number', description: 'e.g. 5'},
    {id: 'axis', as: 'string', options: 'x,y', description: 'direction of staggering'}
  ],
  impl: (ctx,rows,columns,axis) => ({grid:[rows,columns],axis})
})

jb.component('animation.stagerIncrease', {
  type: 'animation.stager-val',
  params: [
    {id: 'increase', mandatory: true, description: 'e.g. 20'},
    {id: 'start', as: 'string', description: 'optional, e.g. 10'}
  ],
  impl: ({data},increase, start) => {
        data.val = increase
        start && Object.assign(data.obj,{start})
    }
})

jb.component('animation.stagerRange', {
  type: 'animation.stager-val',
  params: [
    {id: 'from', as: 'string', mandatory: true, description: 'e.g. 20'},
    {id: 'to', as: 'string', mandatory: true, description: 'e.g. 30'}
  ],
  impl: ({data}, from, to) => data.val = [from, to]
})

jb.component('animation.direction', {
  description: 'supports reverse, go back to origin',
  type: 'animation',
  params: [
    {id: 'direction', mandatory: true, as: 'string', options: ',reverse,alternate', description: 'alternate goes back to origin'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.duration', {
  type: 'animation',
  params: [
    {id: 'duration', type: 'animation.val', description: 'time of animation in mSec'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.delay', {
  description: 'wait',
  type: 'animation',
  params: [
    {id: 'delay', type: 'animation.val', description: 'delay before animation'},
    {id: 'endDelay', type: 'animation.val', description: 'delay at the end of animation'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.moveTo', {
  type: 'animation',
  params: [
    {id: 'X', type: 'animation.val', description: 'e.g. 20 , +=10, *=2, list(100,200)'},
    {id: 'Y', type: 'animation.val'},
    {id: 'Z', type: 'animation.val'}
  ],
  impl: ctx => jb.objFromEntries(jb.entries(ctx.params).map(e=>['translate'+e[0],e[1]]).filter(e=>e[1]))
})

jb.component('animation.rotate', {
  type: 'animation',
  params: [
    {id: 'rotate', type: 'animation.val', description: 'degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270)'},
    {id: 'rotateX', type: 'animation.val'},
    {id: 'rotateY', type: 'animation.val'},
    {id: 'rotateZ', type: 'animation.val'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.scale', {
  type: 'animation',
  params: [
    {id: 'scale', type: 'animation.val', description: 'e.g. 1.5 , *=2, list(2,3)'},
    {id: 'scaleX', type: 'animation.val'},
    {id: 'scaleY', type: 'animation.val'},
    {id: 'scaleZ', type: 'animation.val'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.skew', {
  type: 'animation',
  params: [
    {id: 'skew', description: 'e.g. 20 , +=10, *=2, list(1,2)'},
    {id: 'skewX', description: 'e.g. 20 , +=10, *=2, list(1,2)'},
    {id: 'skewY', description: 'e.g. 20 , +=10, *=2, list(1,2)'},
    {id: 'skewZ', description: 'e.g. 20 , +=10, *=2, list(1,2)'}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})

jb.component('animation.perspective', {
  type: 'animation',
  category: '3D',
  params: [
    {id: 'perspective', type: 'animation.val', description: 'e.g. 100 , +=10, *=2, list(10,20)', mandatory: true}
  ],
  impl: ctx => jb.animate.fixValues(ctx.params)
})


jb.component('animation.easing', {
  description: 'speed',
  type: 'animation',
  params: [
    {id: 'easing', type: 'animation.easing', mandatory: true}
  ],
  impl: ctx => ctx.params
})

jb.component('animation.inOutEasing', {
  description: 'Robert Penner easing functions',
  type: 'animation.easing',
  params: [
    {id: 'method', as: 'string', options: 'Quad,Cubic,Quart,Quint,Sine,Expo,Circ,Back,Bounce', defaultValue: 'Quad', mandatory: true},
    {id: 'inOut', as: 'string', options: 'In,Out,InOut', defaultValue: 'InOut', mandatory: true}
  ],
  impl: (ctx,method,inOut) => `ease${inOut}${method}`
})

jb.component('animation.elasticEasing', {
  type: 'animation.easing',
  params: [
    {id: 'inOut', as: 'string', options: 'in,out,inOut', templateValue: 'inOut'},
    {id: 'amplitude', as: 'string', description: '1-10  Controls the overshoot of the curve', templateValue: '1'},
    {id: 'period', as: 'string', description: '0.1-2 Controls how many times the curve goes back and forth', templateValue: '0.5'}
  ],
  impl: (ctx,inOut,amplitude,period) => `ease${inOut}Elastic(${amplitude},${period})`
})

jb.component('animation.springEasing', {
  type: 'animation.easing',
  params: [
    {id: 'mass', as: 'number', description: '0-100', defaultValue: 1},
    {id: 'stiffness', as: 'number', description: '0-100', defaultValue: 100},
    {id: 'damping', as: 'number', description: '0-100', defaultValue: 10},
    {id: 'velocity', as: 'number', description: '0-100', defaultValue: 0}
  ],
  impl: (ctx,mass,stiffness,damping,velocity) => `spring(${mass},${stiffness},${damping},${velocity})`
})

jb.component('animation.movement', {
  type: 'animation',
  params: [
    {id: 'to', type: 'position', mandatory: true},
    {id: 'subAnimations', type: 'animation[]', dynamic: true, flattenArray: true, as: 'array'}
  ],
  impl: (ctx,to,animations) => ({
        keyframes: jb.asArray(to).map( ({top,left}) => ({translateX : left, translateY : top}) ),
        ...jb.animate.options(animations)
    })
})

jb.component('animation.fixedPos', {
  type: 'position',
  params: [
    {id: 'top', as: 'number', mandatory: true},
    {id: 'left', as: 'number', mandatory: true}
  ],
  impl: ctx => ctx.params
})

jb.animate = {
    anime: jb.frame.anime,
    fixValues(obj) {
        return jb.objFromEntries(jb.entries(obj).filter(e=>e[1]).map(e=>[e[0],
            typeof e[1] == 'string' && !isNaN(+e[1]) ? +e[1] : e[1]] ))
    },
    options(animations) {
        return Object.assign({}, ...animations())
    },
    run(animation,target,ctx) {
        if (ctx.probe) return
        const targets = target
            || jb.path(ctx.vars.$dialog,'el')
            || jb.path(ctx.vars.$launchingElement,'el')
        return jb.animate.anime({targets,...animation}).finished
    },
}

