jb.component('itemlist', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'watchItems', type: 'boolean', as: 'boolean', defaultValue: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx => 
    jb_ui.ctrl(ctx)
})

jb.component('itemlist.init', {
  type: 'feature',
  params: [
    { id: 'items', essential: true, dynamic: true },
    { id: 'itemsArrayVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true }
  ],
  impl: function(context, items, itemsArrayVariable,watch) {
    return {
      beforeInit: function(cmp) {
        var itemsEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(x=>
                items(cmp.ctx))
              .do(items => 
                cmp.items = items)
              .filter(items=>
                ! jb_compareArrays(items,(cmp.ctrls || []).map(ctrl => ctrl.comp.ctx.data))
                )
              .map(items=> {
                  if (context.vars.itemlistCntr)
                    context.vars.itemlistCntr.items = items;
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

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    { id: 'space', as: 'number', defaultValue: 5}
  ],
  impl : (ctx,space) =>
    ({css: `.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    { id: 'databind', as: 'ref', defaultValue: {$: 'itemlist-container.selected' } },
    { id: 'onSelection', type: 'action', dynamic: true },
    { id: 'onDoubleClick', type: 'action', dynamic: true },
    { id: 'autoSelectFirst', type: 'boolean'},
    { id: 'cssForSelected', as: 'string', defaultValue: 'background: #bbb !important; color: #fff !important' },
    { id: 'cssForActive', as: 'string', defaultValue1: 'background: #337AB7; color: #fff'},
  ],
  impl: ctx => ({
    init: cmp => {
        cmp.selectionEmitter = new jb_rx.Subject();
        cmp.clickEmitter = new jb_rx.Subject();

        var databindEm = cmp.jbEmitter.filter(x => x == 'check')
            .map(()=> 
              jb.val(ctx.params.databind))
            .filter(x=>x);

        cmp.selectionEmitter
          .merge(databindEm)
          .merge(cmp.clickEmitter)
          .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )
          .distinctUntilChanged()
          .subscribe( selected => {
              if (jb.val(ctx.params.databind) != selected)
                jb.writeValue(ctx.params.databind,selected);
              cmp.selected = selected;
              jb_ui.applyAfter(ctx.params.onSelection(cmp.ctx.setData(selected)),ctx);
          });

        // double click
        var clickEm = cmp.clickEmitter.takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );
        clickEm.buffer(clickEm.debounceTime(250))
          .filter(buff => buff.length === 2)
          .subscribe(buff=>
            jb_ui.applyAfter(ctx.params.onDoubleClick(ctx.setData(buff[1]))),ctx);

    },
    afterViewInit: cmp => {
        if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(ctx.params.databind))
            cmp.selectionEmitter.next(cmp.items[0])
    },
    templateModifier: { 
      jbItem: `[class.selected]="selected == ctrl.comp.ctx.data"
        (click)="clickEmitter.next(ctrl.comp.ctx.data)"` // selected = ctrl.comp.ctx.data ; 
    },
    css: '.jb-item.selected { ' + ctx.params.cssForSelected + ' }',
    jbEmitter: true,
  })
})

jb.component('itemlist.keyboard-selection', {
  type: 'feature',
  params: [
    { id: 'onEnter', type: 'action', dynamic: true },
    { id: 'autoFocus', type: 'boolean' }
  ],
  impl: ctx => ({
      init: function(cmp) {
        cmp.keydown = (ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.keydown) || (ctx.vars.selectionKeySource && ctx.vars.selectionKeySource.keydown);
        if (!cmp.keydown) {
          cmp.elementRef.nativeElement.setAttribute('tabIndex','0');
          cmp.keydown = jb_rx.Observable.fromEvent(cmp.elementRef.nativeElement, 'keydown')
              .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );          

          if (ctx.params.autoFocus)
            jb_ui.focus(cmp.elementRef.nativeElement,'itemlist.keyboard-selection init autoFocus')
        }

        cmp.keydown.filter(e=> e.keyCode == 13)
          .subscribe(x=>
            jb_ui.applyAfter(ctx.params.onEnter(ctx.setData(cmp.selected))),ctx)
    
        cmp.keydown.filter(e=>
              e.keyCode == 38 || e.keyCode == 40)
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items;
              return items[(items.indexOf(cmp.selected) + diff + items.length) % items.length] || cmp.selected;
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
      init: function(cmp) {
        var drake = dragula($(cmp.elementRef.nativeElement).findIncludeSelf('.jb-itemlist').get(), {
          moves: el => $(el).hasClass('jb-item')
        });

        drake.on('drag', function(el, source) { 
          el.dragged = { 
            obj: cmp.active,
            remove: obj => cmp.items.splice(cmp.items.indexOf(obj), 1)
          }
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            dropElm.dragged && dropElm.dragged.remove(dropElm.dragged.obj);
            if (!sibling)
              cmp.items.push(dropElm.dragged.obj)
            else
              cmp.items.splice($(sibling).index()-1,0,dropElm.dragged.obj)
            dropElm.dragged = null;
        });

        cmp.elementRef.nativeElement.setAttribute('tabIndex','0');
        cmp.keydown = cmp.keydown || jb_rx.Observable.fromEvent(cmp.elementRef.nativeElement, 'keydown')
            .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );

        // ctrl + Up/Down
        cmp.keydown.filter(e=> 
          e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
          .subscribe(e=> {
            var diff = e.keyCode == 40 ? 1 : -1;
            var selectedIndex = cmp.items.indexOf(cmp.selected);
            if (selectedIndex == -1) return;
            var index = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
            arr.splice(index,0,arr.splice(selectedIndex,1)[0]);
        })

      }
    })
})

jb.component('itemlist.ul-li', {
  type: 'itemlist.style',
  impl :{$:'itemlist.use-group-style', groupStyle :{$: 'group.ul-li' }}
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
        {$: 'itemlist.init', items: '%$itemlistModel/items%', watch: '%$itemlistModel/watchItems%', itemsArrayVariable: 'items_array' },
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
