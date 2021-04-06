// var {picklist} = jb.ns('picklist')

jb.component('picklist', {
  type: 'control',
  description: 'select, choose, pick, choice',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, templateValue: picklist.optionsByComma()},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'picklist.style', defaultValue: picklist.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('picklist.init', {
  type: 'feature',
  impl: features(
    calcProp('options', '%$$model/options()%'),
    calcProp('hasEmptyOption', (ctx,{$props}) => $props.options.filter(x=>!x.text)[0]),
  )
})

// jb.component('picklist.allowAsynchOptions', {
//   type: 'feature',
//   description: 'allows the picklist options be reactive or promise',
//   impl: features(
//     calcProp({
//       id: 'options', 
//       priority: 5, phase: 5,
//       value: (ctx,{$state},{}) => {
//         const val = $state.options || ctx.cmpCtx.vars.$model.options()
//         if (Array.isArray(val)) return val
//         const res = []
//         res.delayed = val
//         return res
//       },
//     }),
//     followUp.flow(
//       source.any(({},{$state,$props}) => {
//         if ($state.options) return []
//         return $props.options.delayed || []
//       }),
//       rx.log('followUp allowAsynchValue'),
//       sink.action((ctx,{cmp}) => {
//         const origCtx = cmp.originatingCtx()
//         const recalcCtx = origCtx.ctx({
//             vars: {$refreshElemCall: true, $cmpId: cmp.cmpId, $cmpVer: cmp.ver+1},
//             profile: {...origCtx.profile, options: () => ctx.data}, path: ''
//           })
//         debugger
//         const vdom = jb.ui.h(recalcCtx.runItself())
//         // const elem = jb.ui.elemOfCmp(recalcCtx,cmp.cmpId)
//         // jb.ui.applyNewVdom(elem, vdom, {ctx: recalcCtx})
//       })
//     ),
//   )
// })

jb.component('picklist.allowAsynchOptions', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  impl: features(
    calcProp({
      id: 'options', 
      priority: 5, phase: 5,
      value: (ctx,{$state,$model,picklistModel},{}) => {
        const model = picklistModel || $model
        let res
        if ($state.refresh && $state.options && $state.refreshSource == 'dataArrived') {
          res = $state.options
          jb.log('picklist options using state',{res,ctx,$state})
        } else if ($state.refresh && $state.options) {
          res = $state.options
          const options = model.options()
          if (jb.utils.isPromise(options) || jb.callbag.isCallbag(options))
            res.delayed = options
          jb.log('picklist options use state and calc recalc asynch options',{res,ctx,$state}) // avoid flickering
        } else {
          const options = model.options()
          if (jb.utils.isPromise(options) || jb.callbag.isCallbag(options)) {
            res = []
            res.delayed = options
          } else {
            res = options
          }
          jb.log('picklist options calc options',{res,ctx,$state})
        }
        if (picklistModel) // support styleByControl
          picklistModel.options = res
        return res
      },
    }),
    followUp.flow(
      source.any(({},{$state,$props}) => $props.options.delayed || []),
      rx.log('picklist followUp allowAsynchValue'),
      sink.refreshCmp(({data}) => data.data || jb.path(data,'0.options') && data[0] || data // %data% for rx, %0/options% - for pipe array result
      // sink.refreshCmp(ctx => {
      //   const data = ctx.data
      //   const res = data.data || jb.path(data,'0.options') && data[0] || data
      //   jb.log('picklist followUp refresh cmp with new state',{ctx, res})
      //   return res
      // }
      , obj(prop('refreshSource','dataArrived')))
    ),
  )
})

jb.component('picklist.onChange', {
  category: 'picklist:100',
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: method('onValueChange', call('action'))
})

// ********* options

jb.component('picklist.optionsByComma', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'string', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.options', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'data', as: 'array', dynamic: true, mandatory: true},
    {id: 'code', as: 'string', dynamic: true, defaultValue: '%%' },
    {id: 'text', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'icon', type: 'icon', dynamic: true },
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,code,text,icon,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat(options().map(option => ({ code: code(ctx.setData(option)), text: text(ctx.setData(option)), icon: icon(ctx.setData(option)) })));
  }
})

jb.component('picklist.sortedOptions', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, composite: true},
    {id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50'}
  ],
  impl: (ctx,optionsFunc,marks) => {
    let options = optionsFunc() || [];
    marks.forEach(mark=> {
        const option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

jb.component('picklist.promote', {
  type: 'picklist.promote',
  params: [
    {id: 'groups', as: 'array'},
    {id: 'options', as: 'array'}
  ],
  impl: ctx => ctx.params
})

jb.component('picklist.initGroups', {
  type: 'feature',
  impl: calcProp({id: 'groups', phase: 20, value: (ctx,{$model, $props}) => {
    const options = $props.options;
    const groupsHash = {};
    const promotedGroups = ($model.promote() || {}).groups || [];
    const groups = [];
    options.filter(x=>x.text).forEach(o=>{
      const groupId = groupOfOpt(o);
      const group = groupsHash[groupId] || { options: [], text: groupId};
      if (!groupsHash[groupId]) {
        groups.push(group);
        groupsHash[groupId] = group;
      }
      group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
    })
    groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
    return groups

    function groupOfOpt(opt) {
      if (!opt.group && opt.text.indexOf('.') == -1)
        return '---';
      return opt.group || opt.text.split('.').shift();
    }
  }}),
})
