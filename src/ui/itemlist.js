jb.component('itemlist', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx => 
    jb.ui.ctrl(ctx)
})

jb.component('itemlist.init', {
  type: 'feature',
  params: [
    { id: 'items', essential: true, dynamic: true },
    { id: 'itemVariableName', as: 'string' },
  ],
  impl: (context, items, itemVariableName,watch) => ({
      beforeInit: cmp => {
        cmp.items2ctrls = function(items) {
            if (context.vars.itemlistCntr)
              context.vars.itemlistCntr.items = items;
            var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx() : cmp.ctx).setData(items);
            var ctx3 = itemVariableName ? ctx2.setVars(jb.obj(itemVariableName,items)) : ctx2;
            var ctrls = context.vars.$model.controls(ctx3);
            return ctrls;
        }

        cmp.items = items(cmp.ctx);
        cmp.state.ctrls = cmp.items2ctrls(cmp.items).map(c=>c.reactComp());

        cmp.initWatchByRef = refToWatch =>
            jb.ui.refObservable(refToWatch,cmp)
              .map(_=>items(cmp.ctx))
              .filter(items=>
                items.length == 0 || !jb.compareArrays(items,(cmp.ctrls || []).map(ctrl => ctrl.comp.ctx.data)))
              .do(items => 
                cmp.items = items)
              .map(items=> cmp.items2ctrls(items))
              .subscribe(ctrls=>
                cmp.setState({ctrls:ctrls.map(c=>c.reactComp())}))
      },
  })
})

jb.component('itemlist.watch-items', {
  type: 'feature', category: 'itemlist:70',
  impl: (ctx,ref) => ({
      init: cmp => {
        var itemsAsRef = jb.asRef(cmp.items);
        if (cmp.initWatchByRef && jb.isRef(itemsAsRef)) 
          cmp.initWatchByRef(itemsAsRef);
      }
  })
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    { id: 'space', as: 'number', defaultValue: 5}
  ],
  impl : (ctx,space) =>
    ({css: `>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    { id: 'databind', as: 'ref', defaultValue: '%itemlistCntrData/selected%' },
    { id: 'onSelection', type: 'action', dynamic: true },
    { id: 'onDoubleClick', type: 'action', dynamic: true },
    { id: 'autoSelectFirst', type: 'boolean'},
    { id: 'cssForSelected', as: 'string', defaultValue: 'background: #bbb !important; color: #fff !important' },
  ],
  impl: ctx => ({
    onclick: true,
    afterViewInit: cmp => {
        cmp.selectionEmitter = new jb.rx.Subject();
        cmp.clickEmitter = new jb.rx.Subject();

        cmp.selectionEmitter
          .merge(jb.ui.refObservable(ctx.params.databind,cmp))
          .merge(cmp.clickEmitter)
          .distinctUntilChanged()
          .filter(x=>x)
          .subscribe( selected => {
              ctx.params.databind && jb.writeValue(ctx.params.databind,selected);
              cmp.setState({selected: selected});
              ctx.params.onSelection(cmp.ctx.setData(selected));
          });

        // double click
        var clickEm = cmp.clickEmitter.takeUntil( cmp.destroyed );
        clickEm.buffer(clickEm.debounceTime(250))
          .filter(buff => buff.length === 2)
          .subscribe(buff=>
            jb.ui.applyAfter(ctx.params.onDoubleClick(ctx.setData(buff[1]))),ctx);

        if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(ctx.params.databind))
            cmp.selectionEmitter.next(cmp.items[0])
    },
    extendItem: (cmp,ctrl,vdom) => {
      jb.ui.toggleClassInVdom(vdom,'selected',cmp.state.selected == ctrl.ctx.data);
      vdom.attributes.onclick = _ => 
        cmp.clickEmitter.next(ctrl.ctx.data)
    },
    css: '>.selected { ' + ctx.params.cssForSelected + ' }',
  })
})

jb.component('itemlist.keyboard-selection', {
  type: 'feature',
  params: [
    { id: 'onEnter', type: 'action', dynamic: true },
    { id: 'autoFocus', type: 'boolean' }
  ],
  impl: ctx => ({
      afterViewInit: function(cmp) {
        cmp.onkeydown = (ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.keydown) || (ctx.vars.selectionKeySource && ctx.vars.selectionKeySource.keydown);
        if (!cmp.onkeydown) {
          cmp.base.setAttribute('tabIndex','0');
          cmp.onkeydown = jb.rx.Observable.fromEvent(cmp.base, 'keydown')
              .takeUntil( cmp.destroyed );          

          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus')
        }

        cmp.onkeydown.filter(e=> e.keyCode == 13)
          .subscribe(x=>
            jb.ui.applyAfter(ctx.params.onEnter(ctx.setData(cmp.state.selected))),ctx);
    
        cmp.onkeydown.filter(e=> !e.ctrlKey &&
              (e.keyCode == 38 || e.keyCode == 40))
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items;
              return items[(items.indexOf(cmp.state.selected) + diff + items.length) % items.length] || cmp.state.selected;
        }).subscribe(x=>
          cmp.selectionEmitter && cmp.selectionEmitter.next(x)
        )
      },
    })
})

jb.component('itemlist.drag-and-drop', {
  type: 'feature',
  params: [
  ],
  impl: ctx => ({
      afterViewInit: function(cmp) {
        var drake = dragula($(cmp.base).findIncludeSelf('.jb-itemlist').get(), {
          moves: el => $(el).parent().is('.jb-itemlist')
        });

        drake.on('drag', function(el, source) { 
          var item_comp = el._component;
          el.dragged = { 
            obj: item_comp && item_comp.ctx.data,
            remove: obj => cmp.items.splice(cmp.items.indexOf(obj), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.obj);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            var draggedIndex = cmp.items.indexOf(dropElm.dragged.obj);
            var targetIndex = sibling ? $(sibling).index() : cmp.items.length;
            jb.splice(cmp.items,[[draggedIndex,1],[targetIndex-1,0,dropElm.dragged.obj]]);

            dropElm.dragged = null;
        });

        cmp.base.setAttribute('tabIndex','0');
        cmp.onkeydown = cmp.onkeydown || jb.rx.Observable.fromEvent(cmp.base, 'keydown').takeUntil( cmp.destroyed );

        // ctrl + Up/Down
        cmp.onkeydown.filter(e=> 
          e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
          .subscribe(e=> {
            var diff = e.keyCode == 40 ? 1 : -1;
            var selectedIndex = cmp.items.indexOf(cmp.state.selected);
            if (selectedIndex == -1) return;
            var index = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
            jb.splice(cmp.items,[[selectedIndex,1],[index,0,cmp.state.selected]]);
        })
      }
    })
})

jb.component('itemlist.ul-li', {
  type: 'itemlist.style',
  impl :{$:'itemlist.use-group-style', groupStyle :{$: 'group.ul-li' }}
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  impl :{$:'itemlist.use-group-style', groupStyle :{$: 'layout.horizontal-wrapped' }}
})


jb.component('itemlist.use-group-style', {
  type: 'itemlist.style',
  params: [
    { id: 'groupStyle', type: 'group.style', dynamic: true },
  ],
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'itemlistModel',
    control: {$: 'group', 
      features : [
        {$: 'group.init-group'},
        {$: 'itemlist.init', items: '%$itemlistModel/items%', itemVariableName: 'items_array' },
        {$if: '%$itemlistModel/watchItems%', then :{$: 'itemlist.watch-items'} }
      ], 
      style :{$call :'groupStyle'},
      controls :{$: 'dynamic-controls', 
        controlItems : '%$items_array%',
        genericControl: '%$itemlistModel/controls%',
        itemVariable: '%$itemlistModel/itemVariable%',
      },
    }
  }
})
