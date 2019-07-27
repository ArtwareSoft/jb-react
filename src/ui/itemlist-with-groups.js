jb.component('itemlist-with-groups', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, mandatory: true },
    { id: 'controls', type: 'control[]', mandatory: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'groupBy', type: 'itemlist.group-by', mandatory: true, dynamic: true },
    { id: 'headingCtrl', type: 'control', dynamic: true , defaultValue: {$: 'label', title: '%title%' } },
    { id: 'watch', as: 'array', description: 'resources to watch' },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl :{$: 'group', __innerImplementation: true,
    title: '%$title%',
    style :{$call: 'style'},
    controls :{$: 'dynamic-controls', 
      controlItems : '%$items_array%',
      genericControl :{$if: '%heading%', 
        then: {$call: 'headingCtrl'},
        else: {$call: 'controls'}, 
      },
      itemVariable: '%$itemVariable%'
    },
    features :[
      {$call: 'features'},
      {$: 'itemlist.watch-items-with-heading', 
        items: {$call: 'items'}, 
        groupBy: {$call: 'groupBy'}, 
        watch: '%$watch%', 
        itemVariableName: 'items_array' 
      }, 
    ]
  }
})

jb.component('itemlist.watch-items-with-heading', {
  type: 'feature',
  params: [
    { id: 'items', mandatory: true, dynamic: true },
    { id: 'itemVariableName', as: 'string' },
    { id: 'groupBy', type: 'itemlist.group-by', mandatory: true, dynamic: true },
  ],
  impl: (context, items, itemVariableName,groupBy) => ({
      beforeInit: function(cmp) {
        cmp.items2ctrls = function(_items) {
            if (context.vars.itemlistCntr)
              context.vars.itemlistCntr.items = _items;
            var items = groupBy(cmp.ctx.setData(_items)) || _items;
            cmp.items = items; //.filter(item=>!item.heading);

            var ctx2 = cmp.ctx.setData(items);
            var ctx3 = itemVariableName ? ctx2.setVars(jb.obj(itemVariableName,items)) : ctx2;
            var ctrls = context.vars.$model.controls(ctx3);
            return ctrls;
        }

        cmp.items = items(cmp.ctx);
        cmp.calcCtrls = _ =>
          cmp.items2ctrls(cmp.items).map(c=>jb.ui.renderable(c)).filter(x=>x)
        if (!cmp.state.ctrls)
          cmp.state.ctrls = cmp.calcCtrls()
        cmp.refresh = _ =>
            cmp.setState({ctrls: cmp.calcCtrls() }) 
      }
  })
})

jb.component('itemlist-default-heading', {
    type: 'control',
    impl :{$: 'label', title: '%title%' }
})

// ************* itemlist.group-by ****************

jb.component('itemlist-heading.group-by', {
  type: 'itemlist.group-by',
  params: [
    { id: 'itemToGroupID', dynamic: true, defaultValue: { $: 'prefix', separator: '.' } },
    { id: 'promoteGroups', type: 'data[]', as: 'array' },
  ],
  impl: (ctx,itemToGroupID,promoteGroups) => {
      var items = ctx.data.map(item=>({ item: item, groupId: itemToGroupID(ctx.setData(item)) }));
      var groups = {};
      items.forEach(item=>{
        groups[item.groupId] = groups[item.groupId] || [];
        groups[item.groupId].push(item.item);
      })
      var groups_ar = jb.entries(groups).map(x=>x[0]);
      groups_ar.sort(); // lexical sort before to ensure constant order
      groups_ar.sort((x1,x2) => promoteGroups.indexOf(x1) - promoteGroups.indexOf(x2));

      var result = [].concat.apply([],groups_ar.map(group => 
        [{ title: group, heading: true }].concat(groups[group]) ));
      return result;
    }
})
