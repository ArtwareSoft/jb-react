(function() {

createItemlistCntr = params => ({
  id: params.id, 
  defaultItem: params.defaultItem, 
  selected: null, 
  filter_data: {},
  filters: [],
  init: function(items) {
      return this.items = items
  },
  add: function(item) {
    this.selected = item || JSON.parse(JSON.stringify(this.defaultItem || {}));
    this.items && jb.splice(this.items,[[this.items.length,0,this.selected]]);
  },
  delete: function(item) {
    if (this.items && this.items.indexOf(item) != -1) {
      this.changeSelectionBeforeDelete();
      jb.splice(this.items,[[this.items.indexOf(item),1]]);
    }
  },
  changeSelectionBeforeDelete: function() {
    if (this.items && this.selected) {
      var curIndex = this.items.indexOf(this.selected);
      if (curIndex == -1)
        this.selected = null;
      else if (curIndex == 0 && this.items.length > 0)
        this.selected = this.items[1];
      else if (this.items.length > 0)
        this.selected = this.items[curIndex -1];
      else
        this.selected = null;
    }
  }
})

jb.component('group.itemlist-container', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature', category: 'itemlist:20,group:0',
  params: [
    { id: 'id', as: 'string' },
    { id: 'defaultItem', as: 'single' },
    { id: 'maxItems', as: 'number' , defaultValue: 100 },
  ],
  impl :{$list : [
    {$: 'var', name: 'itemlistCntrData', value: {$: 'object', search_pattern: '', selected: '' } , mutable: true},
    {$: 'var', name: 'itemlistCntr', value: ctx => createItemlistCntr(ctx.componentContext.params) },
    ctx => ({
      init: cmp => {
        var maxItemsRef = cmp.ctx.exp('%$itemlistCntrData/maxItems%','ref');
        jb.writeValue(maxItemsRef,ctx.componentContext.params.maxItems);
        cmp.ctx.vars.itemlistCntr.maxItemsFilter = items => items.slice(0,jb.tonumber(maxItemsRef));
      }
    })
  ]}
})

jb.component('group.itemlist-selected', {
  type: 'feature',   category: 'itemlist:20,group:0',
  impl :{ $list : [ 	
  			{$: 'group.data', data : '%itemlistCntrData/selected%'},
  			{$: 'hidden', showCondition: {$notEmpty: '%itemlistCntrData/selected%' } }
  		]}
})

jb.component('itemlist-container.add', {
  type: 'action',
  impl: ctx => 
  		ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.add()
})

jb.component('itemlist-container.delete', {
  type: 'action',
  params: [{ id: 'item', as: 'single', defaultValue: '%%'} ],
  impl: (ctx,item) => 
      ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.delete(item)
})

jb.component('itemlist-container.filter', {
  type: 'aggregator', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  impl: ctx => {
      if (!ctx.vars.itemlistCntr) return;
      var res = ctx.vars.itemlistCntr.filters.reduce((items,filter) => 
                  filter(items), ctx.data || []);
      jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),res.length);
      res = ctx.vars.itemlistCntr.maxItemsFilter(res);
      jb.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length);
      return res;
   }
})

jb.component('itemlist-container.search', {
  type: 'control', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'title', as: 'string' , dynamic: true, defaultValue: 'Search' },
    { id: 'searchIn', as: 'string' , dynamic: true, defaultValue: {$: 'itemlist-container.search-in-all-properties'} },
    { id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/search_pattern%'},
    { id: 'style', type: 'editable-text.style', defaultValue: { $: 'editable-text.mdl-search' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx,title,searchIn,databind) => 
    jb.ui.ctrl(ctx,{
      afterViewInit: cmp => {
        if (ctx.vars.itemlistCntr) {
          ctx.vars.itemlistCntr.filters.push( items => {
            var toSearch = jb.val(databind) || '';
            if (typeof searchIn.profile == 'function') { // improved performance
              return items.filter(item=>toSearch == '' || searchIn.profile(item).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
            }

            return items.filter(item=>toSearch == '' || searchIn(ctx.setData(item)).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
          });
        // allow itemlist selection use up/down arrows
        ctx.vars.itemlistCntr.keydown = jb.rx.Observable.fromEvent(cmp.base, 'keydown')
            .takeUntil( cmp.destroyed )
            .filter(e=>  [13,27,37,38,39,40].indexOf(e.keyCode) != -1);
        }
      }
    })
});

jb.component('itemlist-container.more-items-button', {
  type: 'control', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'title', as: 'string' , dynamic: true, defaultValue: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeFilter%)' },
    { id: 'delta', as: 'number' , defaultValue: 200 },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.href' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx,title,delta) => {
    return jb.ui.ctrl(ctx,{
      beforeInit: cmp => {
        if (!ctx.vars.itemlistCntr) return;
        var maxItemsRef = cmp.ctx.exp('%$itemlistCntrData/maxItems%','ref');
        cmp.clicked = _ => 
          jb.writeValue(maxItemsRef,jb.tonumber(maxItemsRef) + delta);
        cmp.refresh = _ => 
          cmp.setState({title: jb.val(ctx.params.title(cmp.ctx.setVars({delta: delta})))});
        jb.ui.watchRef(ctx,cmp,maxItemsRef);
      },
      init: cmp =>
        cmp.state.title = jb.val(ctx.params.title(cmp.ctx.setVars({delta: delta}))),
      
      templateModifier: (vdom,cmp,state) => { // hide the button when not needed
        if (cmp.ctx.exp('%$itemlistCntrData/countBeforeFilter%','number') == cmp.ctx.exp('%$itemlistCntrData/countAfterFilter%','number')) 
          return jb.ui.h('span');
        return vdom;
      }
    })
  }
});

jb.ui.extractPropFromExpression = exp => { // performance for simple cases such as %prop1%
  if (exp.match(/^%.*%$/) && !exp.match(/[./[]/))
    return exp.match(/^%(.*)%$/)[1]
}

// match fields in pattern itemlistCntrData/FLDNAME_filter to data
jb.component('itemlist-container.filter-field', {
  type: 'feature', category: 'itemlist-filter:80',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'fieldData', dynamic: true, essential: true },
    { id: 'filterType', type: 'filter-type' },
  ],
  impl: (ctx,fieldData,filterType) => ({
      afterViewInit: cmp => {
        var propToFilter = jb.ui.extractPropFromExpression(ctx.params.fieldData.profile);
        if (propToFilter) 
          cmp.itemToFilterData = item => item[propToFilter];
        else
          cmp.itemToFilterData = item => fieldData(ctx.setData(item));

        ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.filters.push(items=>{
            var filterValue = cmp.jbModel();
            if (!filterValue) return items;
            var res = items.filter(item=>filterType.filter(filterValue,cmp.itemToFilterData(item)) );
            if (filterType.sort)
              filterType.sort(res,cmp.itemToFilterData,filterValue);
            return res;
        })
    }
  })
});

jb.component('filter-type.text', {
  type: 'filter-type',
  params: [
    { id: 'ignoreCase', as: 'boolean', defaultValue: true }
  ],
  impl: (ctx,ignoreCase) => ignoreCase ? ({
    filter: (filter,data) => (data||'').toLowerCase().indexOf((filter||'').toLowerCase()) != -1,
    sort: (items,itemToData,filter) =>  {
      var asWord = new RegExp('\\b' + filter + '\\b','i');
      var score = txt => (asWord.test(txt) ? 5 : 0) + (txt.toLowerCase().indexOf(filter.toLowerCase()) == 0 ? 3 : 0); // higher score for wholeWord or beginsWith
      items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
    }
  }) : ({
    filter: (filter,data) => (data||'').indexOf(filter||'') != -1,
    sort: (items,itemToData,filter) =>  {
      var asWord = new RegExp('\\b' + filter + '\\b');
      var score = txt => (asWord.test(txt) ? 5 : 0) + (txt.indexOf(filter) == 0 ? 3 : 0);
      items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
    }
  })
})

jb.component('filter-type.exact-match', {
  type: 'filter-type',
  impl: ctx => ({
    filter: (filter,data) =>  {
      var _filter = (filter||'').trim(), _data = (data||'').trim();
      return _data.indexOf(_filter) == 0 && _data.length == _filter.length;
    }
  })
})

jb.component('filter-type.numeric', {
  type: 'filter-type',
  impl: ctx => ({
    filter: (filter,data) => Number(data) >= Number(filter),
    sort: (items,itemToData) => items.sort((item1,item2)=> Number(itemToData(item1)) - Number(itemToData(item2)))
  })
})

jb.component('itemlist-container.search-in-all-properties', {
  type: 'data', category: 'itemlist-filter:40',
  impl: ctx => {
    if (typeof ctx.data == 'string') return ctx.data;
    if (typeof ctx.data != 'object') return '';
    return jb.entries(ctx.data).map(e=>e[1]).filter(v=>typeof v == 'string').join('#');
   }
})


})()