jb.component('itemlist', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'ref', whenNotReffable: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('itemlist.no-container', {
  type: 'feature', category: 'group:20',
  impl: ctx => ({
    extendCtxOnce: (ctx,cmp) =>
      ctx.setVars({itemlistCntr: null})
    })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.refresh = _ =>
            cmp.setState({ctrls: cmp.calcCtrls()})

        if (ctx.vars.$model.watchItems && ctx.vars.$model.items)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        cmp.calcCtrls = _ => {
            var _items = ctx.vars.$model.items ? jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx))) : [];
            if (jb.compareArrays(_items,cmp.items))
              return cmp.state.ctrls;
            if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = _items;
            cmp.items = _items;
            return _items.slice(0,100).map(item=>
              Object.assign(controlsOfItem(item),{item:item})).filter(x=>x.length > 0);
        }

        const controlsOfItem = jb.ui.cachedMap(item =>
          ctx.vars.$model.controls(cmp.ctx.setData(item).setVars(jb.obj(ctx.vars.$model.itemVariable,item)))
            .filter(x=>x).map(c=>jb.ui.renderable(c)).filter(x=>x));
        
      },
      init: cmp => {
        cmp.state.ctrls = cmp.calcCtrls();
      },
  })
})

jb.component('itemlist.ul-li', {
  type: 'itemlist.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li',
          {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))),ctrl.item))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features:{$: 'itemlist.init'},
  },
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 0 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: 'jb-drag-parent'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('div', {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))),ctrl.item))),

    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features:{$: 'itemlist.init'},
  }
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    { id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%' },
    { id: 'selectedToDatabind', dynamic: true ,defaultValue: '%%' },
    { id: 'databindToSelected', dynamic: true ,defaultValue: '%%' },
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
          .merge(cmp.clickEmitter)
          .distinctUntilChanged()
          .filter(x=>x)
          .subscribe( selected => {
              writeSelectedToDatabind(selected);
              cmp.setState({selected: selected});
              ctx.params.onSelection(cmp.ctx.setData(selected));
          });

        jb.ui.refObservable(ctx.params.databind,cmp,{throw: true})
          .catch(e=>jb.ui.setState(cmp,{selected: null }) || [])
          .subscribe(e=>
            jb.ui.setState(cmp,{selected: selectedOfDatabind() },e))

        // double click
        var clickEm = cmp.clickEmitter.takeUntil( cmp.destroyed );
        clickEm.buffer(clickEm.debounceTime(250))
          .filter(buff => buff.length === 2)
          .subscribe(buff=>
            ctx.params.onDoubleClick(cmp.ctx.setData(buff[1])));

     //    cmp.jbEmitter.filter(x=> x =='after-update').startWith(jb.delay(1)).subscribe(x=>{
     //      if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1)
     //        cmp.state.selected = null;
		 // if (jb.val(ctx.params.databind))
		 // 	cmp.setState({selected: selectedOfDatabind()});
     //      if (!cmp.state.selected)
     //        autoSelectFirst()
     //    })

        function autoSelectFirst() {
          if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(ctx.params.databind))
              return cmp.selectionEmitter.next(cmp.items[0])
        }
        function writeSelectedToDatabind(selected) {
          return ctx.params.databind && jb.writeValue(ctx.params.databind,ctx.params.selectedToDatabind(ctx.setData(selected)))
        }
        function selectedOfDatabind() {
          return ctx.params.databind && jb.val(ctx.params.databindToSelected(ctx.setData(jb.val(ctx.params.databind))))
        }
        jb.delay(1).then(_=>{
           if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1)
              cmp.state.selected = null;
           if (jb.val(ctx.params.databind))
             cmp.setState({selected: selectedOfDatabind()});
           if (!cmp.state.selected)
                  autoSelectFirst()
        })
    },
    extendItem: (cmp,vdom,data) => {
      jb.ui.toggleClassInVdom(vdom,'selected',cmp.state.selected == data);
      vdom.attributes.onclick = _ =>
        cmp.clickEmitter.next(data)
    },
    css: '>.selected , >*>.selected { ' + ctx.params.cssForSelected + ' }',
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
        var onkeydown = (cmp.ctx.vars.itemlistCntr && cmp.ctx.vars.itemlistCntr.keydown) || (cmp.ctx.vars.selectionKeySource && cmp.ctx.vars.selectionKeySource.keydown);
        if (!onkeydown) {
          cmp.base.setAttribute('tabIndex','0');
          onkeydown = jb.rx.Observable.fromEvent(cmp.base, 'keydown')

          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus',ctx)
        }
        cmp.onkeydown = onkeydown.takeUntil( cmp.destroyed );

        cmp.onkeydown.filter(e=> e.keyCode == 13 && cmp.state.selected)
          .subscribe(x=>
            ctx.params.onEnter(cmp.ctx.setData(cmp.state.selected)));

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
        var drake = dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) =>
            jb.ui.hasClass(handle,'drag-handle')
        });

        drake.on('drag', function(el, source) {
          var item = el.getAttribute('jb-ctx') && jb.ctxDictionary[el.getAttribute('jb-ctx')].data;
          if (!item) {
            var item_comp = el._component || (el.firstElementChild && el.firstElementChild._component);
            item = item_comp && item_comp.ctx.data;
          }
          el.dragged = {
            item: item,
            remove: item => cmp.items.splice(cmp.items.indexOf(item), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.item);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            var draggedIndex = cmp.items.indexOf(dropElm.dragged.item);
            var targetIndex = sibling ? jb.ui.index(sibling) : cmp.items.length;
            jb.splice(cmp.items,[[draggedIndex,1],[targetIndex-1,0,dropElm.dragged.item]],ctx);

            dropElm.dragged = null;
        });

        // ctrl + Up/Down
//        jb.delay(1).then(_=>{ // wait for the keyboard selection to register keydown
          if (!cmp.onkeydown) return;
          cmp.onkeydown.filter(e=>
            e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
            .subscribe(e=> {
              var diff = e.keyCode == 40 ? 1 : -1;
              var selectedIndex = cmp.items.indexOf(cmp.state.selected);
              if (selectedIndex == -1) return;
              var index = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
              jb.splice(cmp.items,[[selectedIndex,1],[index,0,cmp.state.selected]],ctx);
          })
//        })
      }
    })
})

jb.component('itemlist.drag-handle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: {$list: [ {$: 'css.class', class: 'drag-handle' }, {$: 'css', css:'{cursor: pointer}'} ] }
})

jb.component('itemlist.shown-only-on-item-hover', {
  type: 'feature', category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: (ctx,cssClass,cond) => ({
    class: 'jb-shown-on-item-hover',
    css: '{ display: none }'
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
