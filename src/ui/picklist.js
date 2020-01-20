jb.ns('picklist')

jb.component('picklist', { /* picklist */
  type: 'control',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {
      id: 'options',
      type: 'picklist.options',
      dynamic: true,
      mandatory: true,
      defaultValue: picklist.optionsByComma()
    },
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {
      id: 'style',
      type: 'picklist.style',
      defaultValue: picklist.native(),
      dynamic: true
    },
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
      interactive((_ctx,{cmp}) => {
        if (cmp.databindRefChanged) jb.ui.databindObservable(cmp,{srcCtx: ctx})
          .subscribe(e=>cmp.onChange && cmp.onChange(_ctx.setData(jb.val(e.ref))))
        else jb.ui.refObservable(ctx.params.databind(),cmp,{srcCtx: ctx}).subscribe(e=>
          cmp.onChange && cmp.onChange(_ctx.setData(jb.val(e.ref))))
      })
    ))
})

function groupOfOpt(opt) {
  if (!opt.group && opt.text.indexOf('.') == -1)
    return '---';
  return opt.group || opt.text.split('.').shift();
}

jb.component('picklist.dynamic-options', { /* picklist.dynamicOptions */
  type: 'feature',
  params: [
    {id: 'recalcEm', as: 'single'}
  ],
  impl: interactive((ctx,{cmp},{recalcEm}) => 
      recalcEm && recalcEm.subscribe && recalcEm.takeUntil( cmp.destroyed ).subscribe(() => cmp.refresh()) )
})

jb.component('picklist.onChange', { /* picklist.onChange */
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive((ctx,{cmp},{action}) => cmp.onChange = action)
})

// ********* options

jb.component('picklist.optionsByComma', { /* picklist.optionsByComma */
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

jb.component('picklist.options', { /* picklist.options */
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

jb.component('picklist.coded-options', { /* picklist.codedOptions */
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

jb.component('picklist.sorted-options', { /* picklist.sortedOptions */
  type: 'picklist.options',
  params: [
    {
      id: 'options',
      type: 'picklist.options',
      dynamic: true,
      mandatory: true,
      composite: true
    },
    {
      id: 'marks',
      as: 'array',
      description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50'
    }
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

jb.component('picklist.promote', { /* picklist.promote */
  type: 'picklist.promote',
  params: [
    {id: 'groups', as: 'array'},
    {id: 'options', as: 'array'}
  ],
  impl: ctx => ctx.params
})
