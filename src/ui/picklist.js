var {picklist} = jb.ns('picklist')

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
