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
    { id: 'extendItems', as: 'boolean', type: 'boolean', description: 'extend the items with the calculated field using the title as field name' },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,data,width,numeric,extendItems,_class) => ({
    title: title,
    fieldData: row => extendItems ? row[title] : data(ctx.setData(row)),
    calcFieldData: row => data(ctx.setData(row)),
    class: _class,
    width: width,
    numeric: numeric, 
    extendItems: extendItems,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.index', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', defaultValue: 'index' },
    { id: 'width', as: 'number', defaultValue: 10 },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,propName,width_class) => ({
    title: title,
    fieldData: (row,index) => index,
    class: _class,
    width: width,
    numeric: true, 
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
    fieldData: row => dataForSort(ctx.setData(row)),
    numeric: numeric, 
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.button', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'buttonText', as: 'string', essential: true, dynamic: true },
    { id: 'action', type: 'action', essential: true, dynamic: true },

    { id: 'width', as: 'number' },
    { id: 'dataForSort', dynamic: true },
    { id: 'numeric', as: 'boolean', type: 'boolean' },

    { id: 'style', type: 'table-button.style', defaultValue: { $: 'table-button.href' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
    var ctrl = jb.ui.ctrl(ctx,{
      beforeInit: (cmp,props) => {
        cmp.state.title = ctx.params.buttonText(ctx.setData(props.row));
      },
      afterViewInit : cmp=>
        cmp.clicked = jb.ui.wrapWithLauchingElement(_ => ctx.params.action(ctx.setData(cmp.props.row)), ctx, cmp.base)
    }).reactComp();

    return {
      title: ctx.params.title,
      control: _ => ctrl,
      width: ctx.params.width,
      fieldData: row => dataForSort(ctx.setData(row)),
      numeric: ctx.params.numeric, 
      ctxId: jb.ui.preserveCtx(ctx)
    }
  }
})

// todo - move to styles

jb.component('table-button.href', {
  type: 'button.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: ev => cmp.clicked(ev)}, state.title),
        css: `{color: grey}`
    }
})

jb.component('table.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.fields = ctx.vars.$model.fields();
        cmp.state.items = calcItems();

        cmp.refresh = _ =>
            cmp.setState({items: calcItems()})

        if (ctx.vars.$model.watchItems)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          extendItemsWithCalculatedFields();
          cmp.sortItems && cmp.sortItems();
          return cmp.items.slice(0,ctx.vars.$model.visualSizeLimit || 100);
        }

        function extendItemsWithCalculatedFields() {
          cmp.fields.filter(f=>f.extendItems).forEach(f=>
            cmp.items.forEach(item=>item[f.title] = f.calcFieldData(item)))
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
          cmp.items.forEach((item,index)=>cmp.state.sortOptions.forEach(o=> 
              item['$jb_$sort_'+o.field.title] = o.field.fieldData(item,index)));
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
