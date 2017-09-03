jb.component('table', {
  type: 'control', category: 'group:80,common:70',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'ref', whenNotReffable: 'array' , dynamic: true, essential: true },
    { id: 'fields', type: 'table-field[]', essential: true, dynamic: true },
    { id: 'style', type: 'table.style', dynamic: true , defaultValue: { $: 'table.with-headers' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default table is limmited to 100 shown items' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('field', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'data', as: 'string', essential: true, dynamic: true },
    { id: 'width', as: 'number' },
    { id: 'numeric', as: 'boolean', type: 'boolean' },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,data,width,numeric,_class) => ({
    title: title,
    fieldData: row => data(ctx.setData(row)),
    class: _class,
    width: width,
    numeric: numeric, 
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.control', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'control', type: 'control' , dynamic: true, essential: true, defaultValue: {$: 'label', title: ''} },
    { id: 'width', as: 'number' },
    { id: 'dataForSort', dynamic: true },
    { id: 'numeric', as: 'boolean', type: 'boolean' },
  ],
  impl: (ctx,title,control,width,dataForSort,numeric) => ({
    title: title,
    control: row => control(ctx.setData(row)).reactComp(),
    width: width,
    fieldData: row => data(ctx.setData(row)),
    numeric: numeric, 
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('table.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.state.items = calcItems();
        cmp.fields = ctx.vars.$model.fields();

        cmp.refresh = _ =>
            cmp.setState({items: calcItems()})

        if (ctx.vars.$model.watchItems)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          cmp.sortItems && cmp.sortItems();
          return cmp.items.slice(0,ctx.vars.$model.visualSizeLimit || 100);
        }
      },
  })
})

jb.component('table.init-sort', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.toggleSort = function(field) {
          var sortOptions = cmp.state.sortOptions || [];
          var option = sortOptions.filter(o=>o.field == field)[0];
          if (!option)
            sortOptions = [{field: field,dir: 'none'}].concat(sortOptions).slice(0,2);
          option = sortOptions.filter(o=>o.field == field)[0];

          var directions = ['none','asc','des'];
          option.dir = directions[(directions.indexOf(option.dir)+1)%directions.length];
          if (option.dir == 'none')
            sortOptions.splice(sortOptions.indexOf(option),1);
          cmp.setState({sortOptions: sortOptions});
          cmp.refresh();
        }
        cmp.sortItems = function() {
          if (!cmp.items || !cmp.state.sortOptions || cmp.state.sortOptions.length == 0) return;
          cmp.items.forEach(i=>cmp.state.sortOptions.forEach(o=> 
              i['$jb_$sort_'+o.field.title] = o.field.fieldData(i)));
          var major = cmp.state.sortOptions[0], minor = cmp.state.sortOptions[1];
          if (!minor)
            cmp.items.sort(sortFunc(major))
          else {
            var compareMajor = sortFunc(major), compareMinor = sortFunc(minor);
            var majorProp = '$jb_$sort_'+ major.field.title;
            cmp.items.sort((x,y)=> x[majorProp] == y[majorProp] ? compareMinor(x,y) : compareMajor(x,y) );
          }

          function sortFunc(option) {
            var prop = '$jb_$sort_'+ option.field.title;
            if (option.field.numeric)
              var SortFunc = (x,y) => x[prop] - y[prop]
            else
              var SortFunc = (x,y) => 
                x[prop] == y[prop] ? 0 : (x[prop] < y[prop] ? -1 : 1);
            if (option.dir == 'asc') 
              return SortFunc;
            return (x,y) => SortFunc(y,x);
          }

        }
      },
  })
})
