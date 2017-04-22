jb.type('itemlist.heading','inject headings to itemlist');
jb.type('itemlist-heading.style');

jb.component('itemlist-with-groups', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'groupBy', type: 'itemlist.group-by', essential: true, dynamic: true },
    { id: 'headingCtrl', type: 'control', dynamic: true , defaultValue: {$: 'label', title: '%title%' } },
    { id: 'watchItems', type: 'boolean', as: 'boolean', defaultValue: true },
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
        watch: '%$watchItems%', 
        itemsArrayVariable: 'items_array' 
      }, 
    ]
  }
})

jb.component('itemlist.watch-items-with-heading', {
  type: 'feature',
  params: [
    { id: 'items', essential: true, dynamic: true },
    { id: 'itemsArrayVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true },
    { id: 'groupBy', type: 'itemlist.group-by', essential: true, dynamic: true },
  ],
  impl: function(context, items, itemsArrayVariable,watch,groupBy) {
    return {
      beforeInit: function(cmp) {
          var itemsEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(x=>
                items(cmp.ctx))
              .filter(items=> 
                !jb_compareArrays(items,cmp.original_items)) // compare before injecting headings
              .do(items => 
                cmp.original_items = items)
              .map(items => 
                groupBy(cmp.ctx.setData(items)) || items
               )
              .do(items => 
                cmp.items_with_headings = items)
              .map(items=> {
                  cmp.items = items.filter(item=>!item.heading);
                  var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx() : cmp.ctx).setData(items);
                  var ctx3 = itemsArrayVariable ? ctx2.setVars(jb.obj(itemsArrayVariable,items)) : ctx2;
                  var ctrls = context.vars.$model.controls(ctx3);
                  return ctrls;
              });

          cmp.jbGroupChildrenEm = watch ? itemsEm : itemsEm.take(1);
      },
      jbEmitter: true,
  }}
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
