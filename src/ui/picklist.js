jb.ns('picklist')

jb.component('picklist', {
  type: 'control',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, defaultValue: {'$': 'picklist.options-by-comma', '$byValue': []}},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'picklist.style', defaultValue: picklist.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,features(
      calcProps( () => {
          var options = ctx.params.options(ctx);
          var groupsHash = {};
          var promotedGroups = (ctx.params.promote() || {}).groups || [];
          var groups = [];
          options.filter(x=>x.text).forEach(o=>{
            var groupId = groupOfOpt(o);
            var group = groupsHash[groupId] || { options: [], text: groupId};
            if (!groupsHash[groupId]) {
              groups.push(group);
              groupsHash[groupId] = group;
            }
            group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
          })
          groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
          return {
            groups: groups,
            options: options,
            hasEmptyOption: options.filter(x=>!x.text)[0]
          }
      }),
      defHandler('onchangeHandler', (ctx,{cmp, ev}) => {
        const newVal = ev.target.value
        if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == newVal) return
        jb.writeValue(ctx.vars.$model.databind(cmp.ctx),newVal,ctx);        
        cmp.onChange && cmp.onChange(cmp.ctx.setVar('event',ev).setData(newVal))
      }),
    ))
})

function groupOfOpt(opt) {
  if (!opt.group && opt.text.indexOf('.') == -1)
    return '---';
  return opt.group || opt.text.split('.').shift();
}

jb.component('picklist.dynamicOptions', {
  type: 'feature',
  params: [
    {id: 'recalcEm', as: 'single'}
  ],
  impl: interactive(
    (ctx,{cmp},{recalcEm}) => {
      const {pipe,takeUntil,subscribe} = jb.callbag
      recalcEm && pipe(recalcEm, takeUntil( cmp.destroyed ), subscribe(() => cmp.refresh()))
    }
  )
})

jb.component('picklist.onChange', {
  category: 'picklist:100',
  description: 'on picklist selection',
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.onChange = (ctx2 => action(ctx2))
  )
})

// ********* options

jb.component('picklist.optionsByComma', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'string', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: function(ctx,options,allowEmptyValue) {
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.options', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'data', as: 'array', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: function(context,options,allowEmptyValue) {
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.codedOptions', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'array', mandatory: true},
    {id: 'code', as: 'string', dynamic: true, mandatory: true},
    {id: 'text', as: 'string', dynamic: true, mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: function(ctx,options,code,text,allowEmptyValue) {
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(option => ({ code: code(null,option), text: text(null,option) })))
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
