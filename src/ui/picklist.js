jb.component('picklist', {
  type: 'control', category: 'input:80',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref'},
    { id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, defaultValue: {$ : 'picklist.optionsByComma'} },
    { id: 'promote', type: 'picklist.promote', dynamic: true },
    { id: 'style', type: 'picklist.style', defaultValue: { $: 'picklist.native' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      beforeInit: function(cmp) {
        cmp.recalcOptions = function() {
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
          jb.ui.setState(cmp,{
            groups: groups,
            options: options,
            hasEmptyOption: options.filter(x=>!x.text)[0]
          })
        }
        cmp.recalcOptions();
        jb.ui.refObservable(ctx.params.databind,cmp,{watchScript: ctx}).subscribe(e=>
          cmp.onChange && cmp.onChange(jb.val(e.ref)))
      },
    })
})

function groupOfOpt(opt) {
  if (!opt.group && opt.text.indexOf('.') == -1)
    return '---';
  return opt.group || opt.text.split('.').shift();
}

jb.component('picklist.dynamic-options', {
  type: 'feature',
  params: [
    { id: 'recalcEm', as: 'single'}
  ],
  impl: (ctx,recalcEm) => ({
    init: cmp =>
      recalcEm && recalcEm.subscribe &&
        recalcEm.takeUntil( cmp.destroyed )
        .subscribe(e=>
            cmp.recalcOptions())
  })
})

jb.component('picklist.onChange', {
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    { id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,action) => ({
    init: cmp =>
      cmp.onChange = val => action(ctx.setData(val))
  })
})

// ********* options

jb.component('picklist.optionsByComma',{
  type: 'picklist.options',
  params: [
    { id: 'options', as: 'string', mandatory: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
});

jb.component('picklist.options',{
  type: 'picklist.options',
  params: [
    { id: 'options', type: 'data', as: 'array', mandatory: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.coded-options',{
  type: 'picklist.options',
  params: [
    { id: 'options', as: 'array',mandatory: true },
    { id: 'code', as: 'string', dynamic:true , mandatory: true },
    { id: 'text', as: 'string', dynamic:true, mandatory: true } ,
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,code,text,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(function(option) {
      return {
        code: code(null,option), text: text(null,option)
      }
    }))
  }
})

jb.component('picklist.sorted-options', {
  type: 'picklist.options',
  params: [
    { id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, composite: true },
    { id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50' },
  ],
  impl: (ctx,optionsFunc,marks) => {
    var options = optionsFunc() || [];
    marks.forEach(mark=> {
        var option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

jb.component('picklist.promote',{
  type: 'picklist.promote',
  params: [
    { id: 'groups', as: 'array'},
    { id: 'options', as: 'array'},
  ],
  impl: (context,groups,options) =>
    ({ groups: groups, options: options})
});
