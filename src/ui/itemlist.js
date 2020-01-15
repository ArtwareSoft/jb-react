jb.ns('itemlist,itemlistContainer')

jb.component('itemlist', { /* itemlist */
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('itemlist.no-container', { /* itemlist.noContainer */
  type: 'feature',
  category: 'group:20',
  impl: ctx => ({ extendCtx: (ctx,cmp) => ctx.setVars({itemlistCntr: null}) })
})

jb.component('itemlist.init-container-with-items', { 
  type: 'feature',
  category: 'itemlist:20',
  impl: calcProp({id: 'updateItemlistCntr', value: action.if('%$itemlistCntr%',writeValue('%$itemlistCntr.items%', '%$$props.items%')), phase: 100}),
})

jb.component('itemlist.init', { /* itemlist.init */
  type: 'feature',
  impl: features(
    calcProp('items', '%$$model.items%'),
    interactiveProp('items', '%$$model.items%'),
    calcProp('ctrls', ctx => {
      const controlsOfItem = item => 
        ctx.vars.$model.controls(ctx.setVar(ctx.vars.$model.itemVariable,item).setData(item)).filter(x=>x)
      return ctx.vars.$props.items.slice(0,ctx.vars.$model.visualSizeLimit || 100).map(item=>
        Object.assign(controlsOfItem(item),{item})).filter(x=>x.length > 0);
    }),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.init-table', { /* itemlist.initTable */
  type: 'feature',
  impl: features(
      calcProp('items', pipeline('%$$model.items%', slice(0,firstSucceeding('%$$model.visualSizeLimit%',100)))),
      interactiveProp('items', pipeline('%$$model.items%', slice(0,firstSucceeding('%$$model.visualSizeLimit%',100)))),
      calcProp('fields', '%$$model/controls/field%'),
      itemlist.initContainerWithItems()
    )
})

jb.component('itemlist.fast-filter', {
  type: 'feature',
  description: 'use display:hide to filter itemlist elements',
  params: [
    {id: 'showCondition', mandatory: true, dynamic: true, defaultValue: itemlistContainer.conditionFilter() },
    {id: 'filtersRef', mandatory: true, as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'},
  ],
  impl: interactive( (ctx,{cmp},{showCondition,filtersRef}) => 
        jb.ui.refObservable(filtersRef(cmp.ctx),cmp,{srcCtx: ctx})
          .subscribe(() => Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(elem=> 
                elem.style.display = showCondition(jb.ctxDictionary[elem.getAttribute('jb-ctx')]) ? 'block' : 'none'))
   )
})

jb.component('itemlist.ul-li', { /* itemlist.ulLi */
  type: 'itemlist.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul',{ class: 'jb-itemlist'},
        ctrls.map(ctrl=> h('li',
          {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', { /* itemlist.horizontal */
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('div',{ class: 'jb-drag-parent'},
        ctrls.map(ctrl=> h('div', {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})

// ****************** Selection ******************

jb.component('itemlist.selection', { /* itemlist.selection */
  type: 'feature',
  params: [
    {
      id: 'databind',
      as: 'ref',
      defaultValue: '%$itemlistCntrData/selected%',
      dynamic: true
    },
    {id: 'selectedToDatabind', dynamic: true, defaultValue: '%%'},
    {id: 'databindToSelected', dynamic: true, defaultValue: '%%'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onDoubleClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {
      id: 'cssForSelected',
      as: 'string',
      description: 'e.g. background: red;color: blue',
      defaultValue: 'background: #bbb !important; color: #fff !important'
    }
  ],
  impl: (ctx,databind) => ({
    onclick: true,
    ondblclick: true,
    afterViewInit: cmp => {
        cmp.selectionEmitter = new jb.rx.Subject();
        cmp.clickEmitter = cmp.onclick.merge(cmp.ondblclick).map(e=>dataOfElem(e.target)).filter(x=>x)
        cmp.ondblclick.map(e=> dataOfElem(e.target)).filter(x=>x)
          .subscribe(data => ctx.params.onDoubleClick(cmp.ctx.setData(data)))

        cmp.setSelected = selected => {
          cmp.state.selected = selected
          if (!cmp.base) return
          Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
            .forEach(elem=>elem.classList.remove('selected'))
          Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
            .filter(elem=> (jb.ctxDictionary[elem.getAttribute('jb-ctx')] || {}).data === selected)
            .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
        }

        cmp.selectionEmitter.merge(cmp.clickEmitter).distinctUntilChanged().filter(x=>x)
          .subscribe( selected => {
              writeSelectedToDatabind(selected);
              cmp.setSelected(selected)
              ctx.params.onSelection(cmp.ctx.setData(selected));
        })

        const selectedRef = databind()
        
        jb.isWatchable(selectedRef) && jb.ui.refObservable(selectedRef,cmp,{throw: true, srcCtx: ctx})
          .catch(e=>cmp.setSelected(null) || [])
          .subscribe(() => cmp.setSelected(selectedOfDatabind()))

        if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1) // clean irrelevant selection
          cmp.state.selected = null;
        if (selectedOfDatabind()) //selectedRef && jb.val(selectedRef))
          cmp.setSelected(selectedOfDatabind())
        if (!cmp.state.selected)
          autoSelectFirstWhenEnabled()

        function autoSelectFirstWhenEnabled() {
          if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(selectedRef))
              jb.delay(1).then(()=> cmp.selectionEmitter.next(cmp.items[0]))
        }
        function writeSelectedToDatabind(selected) {
          return selectedRef && jb.writeValue(selectedRef,ctx.params.selectedToDatabind(ctx.setData(selected)), ctx)
        }
        function selectedOfDatabind() {
          return selectedRef && jb.val(ctx.params.databindToSelected(ctx.setVars({items: cmp.items}).setData(jb.val(selectedRef))))
        }
        function dataOfElem(el) {
          const itemElem = jb.ui.closest(el,'.jb-item')
          const ctxId = itemElem && itemElem.getAttribute('jb-ctx')
          return ((ctxId && jb.ctxDictionary[ctxId]) || {}).data
        }
    },
    css: ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(ctx.params.cssForSelected)).join('\n')
  })
})

jb.component('itemlist.keyboard-selection', { /* itemlist.keyboardSelection */
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: ctx => ({
    templateModifier: vdom => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.tabIndex = 0
    },
    afterViewInit: cmp => {
        const selectionKeySourceCmp = jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource)
        let onkeydown = jb.path(cmp.ctx.vars,'itemlistCntr.keydown') || jb.path(selectionKeySourceCmp,'onkeydown');
        if (!onkeydown) {
          onkeydown = jb.rx.Observable.fromEvent(cmp.base, 'keydown')
          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus',ctx)
        } else {
          onkeydown = onkeydown.merge(jb.rx.Observable.fromEvent(cmp.base, 'keydown'))
        }
        cmp.onkeydown = onkeydown.takeUntil( cmp.destroyed );

        cmp.onkeydown.filter(e=> e.keyCode == 13 && cmp.state.selected)
          .subscribe(() => ctx.params.onEnter(cmp.ctx.setData(cmp.state.selected)));

        cmp.onkeydown.filter(ev => !ev.ctrlKey && (ev.keyCode == 38 || ev.keyCode == 40))
            .map(ev => {
              ev.stopPropagation();
              const diff = ev.keyCode == 40 ? 1 : -1;
              const items = cmp.items;
              return items[(items.indexOf(cmp.state.selected) + diff + items.length) % items.length] || cmp.state.selected;
        }).subscribe(selected => cmp.selectionEmitter && cmp.selectionEmitter.next(selected) )
      },
    })
})

jb.component('itemlist.drag-and-drop', { /* itemlist.dragAndDrop */
  type: 'feature',
  impl: ctx => ({
      afterViewInit: function(cmp) {
        const drake = dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) =>
            jb.ui.hasClass(handle,'drag-handle')
        });

        drake.on('drag', function(el, source) {
          let item = el.getAttribute('jb-ctx') && jb.ctxDictionary[el.getAttribute('jb-ctx')].data;
          if (!item) {
            const item_comp = el._component || (el.firstElementChild && el.firstElementChild._component);
            item = item_comp && item_comp.ctx.data;
          }
          el.dragged = {
            item,
            remove: item => cmp.items.splice(cmp.items.indexOf(item), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.item);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            const draggedIndex = cmp.items.indexOf(dropElm.dragged.item);
            const targetIndex = sibling ? jb.ui.index(sibling) : cmp.items.length;
            jb.splice(jb.asRef(cmp.items),[[draggedIndex,1],[targetIndex-1,0,dropElm.dragged.item]],ctx);

            dropElm.dragged = null;
        })
        cmp.dragAndDropActive = true

        // ctrl + Up/Down
//        jb.delay(1).then(_=>{ // wait for the keyboard selection to register keydown
        if (!cmp.onkeydown) return;
          cmp.onkeydown.filter(e=>
            e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
            .subscribe(e=> {
              const diff = e.keyCode == 40 ? 1 : -1;
              const selectedIndex = cmp.items.indexOf(cmp.state.selected);
              if (selectedIndex == -1) return;
              const index = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
              jb.splice(jb.asRef(cmp.items),[[selectedIndex,1],[index,0,cmp.state.selected]],ctx);
          })
//        })
      }
    })
})

jb.component('itemlist.drag-handle', { /* itemlist.dragHandle */
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: list(
    css.class('drag-handle'),
    css('{cursor: pointer}')
  )
})

jb.component('itemlist.shown-only-on-item-hover', { /* itemlist.shownOnlyOnItemHover */
  type: 'feature',
  category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: (ctx,cssClass,cond) => ({
    class: 'jb-shown-on-item-hover',
  })
})

jb.component('itemlist.divider', { /* itemlist.divider */
  type: 'feature',
  params: [
    {id: 'space', as: 'number', defaultValue: 5}
  ],
  impl: (ctx,space) =>
    ({css: `>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})
