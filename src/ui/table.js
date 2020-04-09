jb.ns('table')

jb.component('table', {
  type: 'control,table',
  category: 'group:80,common:70',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'fields', type: 'table-field[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'table.style', dynamic: true, defaultValue: table.plain()},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default table is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('field', {
  type: 'table-field',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'data', as: 'string', mandatory: true, dynamic: true},
    {id: 'hoverTitle', as: 'string', dynamic: true},
    {id: 'width', as: 'number'},
    {id: 'numeric', as: 'boolean', type: 'boolean'},
    {id: 'extendItems', as: 'boolean', type: 'boolean', description: 'extend the items with the calculated field using the title as field name'},
    {id: 'class', as: 'string'}
  ],
  impl: (ctx,title,data,hoverTitle,width,numeric,extendItems,_class) => ({
    title: () => title,
    fieldData: row => extendItems ? row[title] : data(ctx.setData(row)),
    calcFieldData: row => data(ctx.setData(row)),
    hoverTitle: hoverTitle.profile ? (row => hoverTitle(ctx.setData(row))) : null,
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
    {id: 'title', as: 'string', defaultValue: 'index'},
    {id: 'width', as: 'number', defaultValue: 10},
    {id: 'class', as: 'string'}
  ],
  impl: (ctx,title) => ({
    title: () => title,
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
    {id: 'title', as: 'string', mandatory: true},
    {id: 'control', type: 'control', dynamic: true, mandatory: true, defaultValue: text('')},
    {id: 'width', as: 'number'},
    {id: 'dataForSort', dynamic: true},
    {id: 'numeric', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,title,control,width,dataForSort,numeric) => ({
    title: () => title,
    control: row => control(ctx.setData(row)),
    width: width,
    fieldData: row => dataForSort(ctx.setData(row)),
    numeric: numeric,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

// todo - move to styles

jb.component('button.tableCellHref', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: true}, state.title),
    css: '{color: grey}'
  })
})

jb.component('table.initTableOrItemlist', {
  type: 'feature',
  impl: ctx => ctx.run(ctx.vars.$model.fields ? table.init() : itemlist.initTable())
})

jb.component('table.init', {
  type: 'feature',
  category: 'table:10',
  impl: features(
    calcProp({id: 'fields', value: '%$$model.fields%'}),
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    itemlist.initContainerWithItems()
  )
})

jb.component('table.initSort', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
        cmp.toggleSort = ev => {
          const field = cmp.renderProps.fields[ev.currentTarget.getAttribute('fieldIndex')]
          const sortOptions = cmp.renderProps.sortOptions || [];
          var option = sortOptions.filter(o=>o.field == field)[0];
          if (!option)
            sortOptions = [{field: field,dir: 'none'}].concat(sortOptions).slice(0,2);
          option = sortOptions.filter(o=>o.field == field)[0];

          var directions = ['none','asc','des'];
          option.dir = directions[(directions.indexOf(option.dir)+1)%directions.length];
          if (option.dir == 'none')
            sortOptions.splice(sortOptions.indexOf(option),1);
          cmp.refresh({sortOptions: sortOptions},{srcCtx: ctx});
        }
        cmp.sortItems = () => {
          if (!cmp.items || !cmp.renderProps.sortOptions || cmp.renderProps.sortOptions.length == 0) return;
          cmp.items.forEach((item,index)=>cmp.renderProps.sortOptions.forEach(o=> 
              item['$jb_$sort_'+o.field.title] = o.field.fieldData(item,index)));
          var major = cmp.renderProps.sortOptions[0], minor = cmp.renderProps.sortOptions[1];
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
      }
  })
})
