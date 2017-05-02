(function() {
  var st = jb.studio;

jb.component('studio.property-primitive', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    title :{$: 'studio.prop-name', path: '%$path%' }, 
    controls: [
      {$: 'editable-text', 
        title: '%', 
        databind :{$: 'studio.ref', path: '%$path%' }, 
        style :{$: 'editable-text.studio-primitive-text' }, 
        features: [
          {$: 'studio.undo-support', path: '%$path%' }, 
          {$: 'studio.property-toolbar-feature', path: '%$path%' }, 
          {$: 'field.debounce-databind', debounceTime: '500' },
        ]
      }, 
      {$: 'itemlist', 
        items: '%$suggestionCtx/options%', 
        controls :{$: 'group', 
          style :{$: 'layout.flex', align: 'space-between', direction: 'row' }, 
          controls: [
            {$: 'label', 
              title: '%text%', 
              features :{$: 'css.padding', top: '', left: '3', bottom: '' }
            }, 
            {$: 'button', 
              title: 'select and close', 
              style :{$: 'button.mdl-icon-12', icon: 'done' },
              action :{$: 'studio.paste-suggestion', close: true}, 
            }
          ]
        }, 
        watchItems: true, 
        features: [
          {$: 'itemlist.studio-suggestions-options' }, 
          {$: 'itemlist.selection', 
            databind: '%$suggestionCtx/selected%', 
            onDoubleClick :{$: 'studio.paste-suggestion'}, 
            autoSelectFirst: true
          }, 
          {$: 'hidden', showCondition: '%$suggestionCtx/show%' }, 
          {$: 'css.height', height: '500', overflow: 'auto', minMax: 'max' }, 
          {$: 'css.width', width: '300', overflow: 'auto' }, 
          {$: 'css', 
            css: '{ position: absolute; z-index:1000; background: white }'
          }, 
          {$: 'css.border', width: '1', color: '#cdcdcd' }, 
          {$: 'css.padding', top: '2', left: '3', selector: 'li' }
        ]
      }
    ], 
    features: [
      {$: 'group.studio-suggestions', path: '%$path%', expressionOnly: true }, 
      {$: 'studio.property-toolbar-feature', path: '%$path%' },
    ]
  }
})

jb.component('studio.jb-floating-input', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        databind :{$: 'studio.profile-value-as-text', path: '%$path%' }, 
        updateOnBlur: true, 
        style :{$: 'editable-text.mdl-input', width: '400' }, 
        features: [
          {$: 'studio.undo-support', path: '%$path%' }, 
          {$: 'css.padding', left: '4', right: '4' },
          {$: 'feature.dont-generate-change-detection-events' },
        ]
      }, 
      {$: 'itemlist-with-groups', 
        items: '%$suggestionCtx/options%', 
        controls :{$: 'label', title: '%text%' }, 
        watchItems: true, 
        features: [
          {$: 'itemlist.studio-suggestions-options' }, 
          {$: 'itemlist.selection', databind: '%$suggestionCtx/selected%',
            onDoubleClick: ctx => ctx.data.paste(ctx),
            autoSelectFirst: true
          }, 
          {$: 'hidden', showCondition: '%$suggestionCtx/show%' }, 
          {$: 'css.height', height: '500', overflow: 'auto', minMax: 'max' }, 
          {$: 'css.padding', top: '3', left: '3', selector: 'li' }
        ]
      }
    ], 
    features : [
      {$: 'group.studio-suggestions', 
        path: '%$path%', 
        closeFloatingInput: [
          {$: 'close-containing-popup', OK: true }, 
          {$: 'tree.regain-focus' }
        ]
      },
    ]
  }
})

jb.component('studio.paste-suggestion', {
  type: 'control', 
  params: [
    { id: 'option', as: 'single', defaultValue: '%%' },
    { id: 'close', as: 'boolean', description: 'ends with % or /' }
  ], 
  impl: (ctx,option,close) =>
    option.paste(ctx,close)
})


function rev(str) {
  return str.split('').reverse().join('');
}

class suggestions {
  constructor(input,expressionOnly) {
    this.input = input;
    this.expressionOnly = expressionOnly;
    this.pos = input.selectionStart;
    this.text = input.value.substr(0,this.pos).trim();
    this.text_with_open_close = this.text.replace(/%([^%;{}\s><"']*)%/g, (match,contents) =>
      '{' + contents + '}');
    this.exp = rev((rev(this.text_with_open_close).match(/([^\}%]*%)/) || ['',''])[1]);
    this.exp = this.exp || rev((rev(this.text_with_open_close).match(/([^\}=]*=)/) || ['',''])[1]);
    this.tail = rev((rev(this.exp).match(/([^%.\/=]*)(\/|\.|%|=)/)||['',''])[1]);
    this.tailSymbol = this.text_with_open_close.slice(-1-this.tail.length).slice(0,1); // % or /
    if (this.tailSymbol == '%' && this.exp.slice(0,2) == '%$')
      this.tailSymbol = '%$';
    this.base = this.exp.slice(0,-1-this.tail.length) + '%';
    this.inputVal = input.value;
    this.inputPos = input.selectionStart;
  }

  suggestionsRelevant() {
    return (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
      || ['%','%$','/','.'].indexOf(this.tailSymbol) != -1  
  }

  extendWithOptions(probeCtx,path) {
    this.options = [];
    probeCtx = probeCtx || (jb.studio.previewjb || jb).initialCtx;
    var vars = jb.entries(jb.extend({},(probeCtx.componentContext||{}).params,probeCtx.vars,probeCtx.resources))
        .map(x=>new ValueOption('$'+x[0],x[1],this.pos,this.tail))
        .filter(x=> x.toPaste.indexOf('$$') != 0)
        .filter(x=>['$window'].indexOf(x.toPaste) == -1)

    if (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
      this.options = jb.studio.model.PTsOfPath(path).map(compName=> {
            var name = compName.substring(compName.indexOf('.')+1);
            var ns = compName.substring(0,compName.indexOf('.'));
            return new CompOption(compName, compName, ns ? `${name} (${ns})` : name, st.getComp(compName).description || '')
        })
    else if (this.tailSymbol == '%') 
      this.options = [].concat.apply([],jb.toarray(probeCtx.exp('%%'))
        .map(x=>
          jb.entries(x).map(x=> new ValueOption(x[0],x[1],this.pos,this.tail))))
        .concat(vars)
    else if (this.tailSymbol == '%$') 
      this.options = vars
    else if (this.tailSymbol == '/' || this.tailSymbol == '.')
      this.options = [].concat.apply([],
        jb.toarray(probeCtx.exp(this.base))
          .map(x=>jb.entries(x).map(x=>new ValueOption(x[0],x[1],this.pos,this.tail))) )

    this.options = this.options
        .filter( jb_unique(x=>x.toPaste) )
        .filter(x=> x.toPaste != this.tail)
        .filter(x=>
          this.tail == '' || typeof x.toPaste != 'string' || (x.description + x.toPaste).toLowerCase().indexOf(this.tail.toLowerCase()) != -1)
    if (this.tail)
      this.options.sort((x,y)=> (y.toPaste.toLowerCase().indexOf(this.tail.toLowerCase()) == 0 ? 1 : 0) - (x.toPaste.toLowerCase().indexOf(this.tail.toLowerCase()) == 0 ? 1 : 0));

    this.key = this.options.map(o=>o.toPaste).join(',');
    return this;
  }
}

class ValueOption {
    constructor(toPaste,value,pos,tail) {
      this.toPaste = toPaste;
      this.value = value;
      this.pos = pos;
      this.tail = tail;
      this.text = toPaste + this.valAsText();
    }
    valAsText() {
      var val = this.value;
      if (typeof val == 'string' && val.length > 20)
        return ` (${val.substring(0,20)}...)`;
      else if (typeof val == 'string' || typeof val == 'number' || typeof val == 'boolean')
        return ` (${val})`;
      return ``;
    }
    paste(ctx,close) {
      var toPaste = this.toPaste + ((typeof this.value != 'object' || close) ? '%' : '/');
      var suggestionCtx = ctx.vars.suggestionCtx;
      var input = suggestionCtx.input;
      var pos = this.pos + 1;
      input.value = input.value.substr(0,this.pos-this.tail.length) + toPaste + input.value.substr(pos);
      suggestionCtx.show = false;
      suggestionCtx.selected = null;
      return jb.delay(1,ctx).then (() => {
        input.selectionStart = pos + toPaste.length;
        input.selectionEnd = input.selectionStart;
      })
    }
    writeValue(ctx) {
      var input = ctx.vars.suggestionCtx.input;
      var script_ref = ctx.run({$: 'studio.ref', path: '%$suggestionCtx.path%' });
      jb.writeValue(script_ref,input.value);
    }
}

class CompOption {
    constructor(toPaste,value,text,description,) {
       this.toPaste = toPaste;
       this.value = value;
       this.text = text;
       this.description = description;
    }
    paste(ctx) {
      ctx.vars.suggestionCtx.input.value = '=' + this.toPaste;
      ctx.vars.suggestionCtx.closeAndWriteValue();
    }
    writeValue(ctx) {
      ctx.run({$:'write-value', to: {$: 'studio.comp-name-ref', path: '%$suggestionCtx.path%' }, value: this.toPaste });
//      ctx.run({$:'studio.expand-and-select-first-child-in-jb-editor' });
    }
}


jb.component('group.studio-suggestions', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'path', as: 'string' },
    { id: 'closeFloatingInput', type: 'action', dynamic:true },
    { id: 'expressionOnly', type: 'boolean', as: 'boolean' }
  ], 
  impl: ctx => {
    var suggestionCtx = { path: ctx.params.path, options: [], show: false };
    return {
      observable: () => {}, // register jbEmitter
      extendCtx: ctx2 =>
        ctx2.setVars({suggestionCtx: suggestionCtx }),

      afterViewInit: cmp=> {
        var input = $(cmp.base).findIncludeSelf('input')[0];
        if (!input)
          return;
        suggestionCtx.input = input;
        var inputClosed = cmp.destroyed;

        cmp.keyEm = jb.rx.Observable.fromEvent(input, 'keydown')
          .takeUntil(inputClosed);
        suggestionCtx.keyEm = cmp.keyEm;
        suggestionCtx.closeAndWriteValue = _ =>{
          ctx.params.closeFloatingInput();
          var option = input.value.indexOf('=') == 0 ? new CompOption(input.value.substr(1)) : new ValueOption();
          option.writeValue(cmp.ctx);
        };
        suggestionCtx.refresh = _ =>
          cmp.changeDt.detectChanges();

        cmp.keyEm.filter(e=> e.keyCode == 13)
            .subscribe(e=>{
              if (!suggestionCtx.show || suggestionCtx.options.length == 0)
                suggestionCtx.closeAndWriteValue()
            })

        cmp.keyEm.filter(e=> e.keyCode == 27)
            .subscribe(e=>{
              ctx.params.closeFloatingInput();
            })

        suggestionCtx.suggestionEm = cmp.keyEm
          .filter(e=> e.keyCode != 38 && e.keyCode != 40 && e.key != 'Shift')
          .delay(1) // we use keydown - let the input fill itself
          .debounceTime(20) // solves timing of closing the floating input
          .filter(e=>
            suggestionCtx.show = new suggestions(input,ctx.params.expressionOnly).suggestionsRelevant() )
          .catch(e=>
            console.log(1,e))
          .map(e=>
            input.value)
//          .do(x=>console.log(0,x))
          .distinctUntilChanged()
//          .do(x=>console.log(1,x))
          .flatMap(e=>
            getProbe())
          .map(res=>
              res && res.finalResult && res.finalResult[0] && res.finalResult[0].in)
          .map(probeCtx=> 
            new suggestions(input,ctx.params.expressionOnly).extendWithOptions(probeCtx,ctx.params.path))
          .catch(e=>
            console.log(2,e))
          .distinctUntilChanged((e1,e2)=>
            e1.key == e2.key)
          .do(e=>jb_logPerformance('suggestions',e))
          .catch(e=>
            console.log(3,e))

        function getProbe() {
          if (cmp.probeResult)
            return [cmp.probeResult];
          var _probe = jb.rx.Observable.fromPromise(ctx.run({$: 'studio.probe', path: ctx.params.path }));
          _probe.subscribe(res=>
            cmp.probeResult = res);
          // do not wait more than 500 mSec
          return _probe.race(jb.rx.Observable.of({finalResult: [ctx] }).delay(500))
            .catch(e=>
                jb.logException(e,'in probe exception'))
        }
      }
  }}
})

jb.component('itemlist.studio-suggestions-options', {
  type: 'feature',
  params: [
  ],
  impl: ctx => 
    ({
      afterViewInit: function(cmp) {
        var suggestionCtx = ctx.vars.suggestionCtx;

        jb.delay(1,ctx).then(()=>{
          var keyEm = suggestionCtx.keyEm;

          keyEm.filter(e=>
              e.keyCode == 13) // ENTER
            .subscribe(()=>{
                suggestionCtx.show = false;
                if (suggestionCtx.selected && suggestionCtx.selected.paste) {
                  suggestionCtx.selected.paste(ctx);
                  suggestionCtx.selected = null;
                }
                jb_ui.apply(ctx);
            })
          keyEm.filter(e=>e.keyCode == 27) // ESC
            .subscribe(x=>
                suggestionCtx.show = false)

          keyEm.filter(e=>
                  e.keyCode == 38 || e.keyCode == 40)
              .subscribe(e=>{
                  var diff = e.keyCode == 40 ? 1 : -1;
                  var items = cmp.items; //.filter(item=>!item.heing);
                  var newIndex = (items.indexOf(suggestionCtx.selected) + diff + items.length) % items.length;
                  cmp.selected = suggestionCtx.selected = items[newIndex];
                  jb_logPerformance('suggestions',newIndex,suggestionCtx.selected);
                  suggestionCtx.refresh();
                  e.preventDefault();
              })

          suggestionCtx.suggestionEm.subscribe(e=> {
              suggestionCtx.show = e.options.length > 0;
              suggestionCtx.options = e.options;
              suggestionCtx.selected = e.options[0];
              suggestionCtx.refresh();
           })
        })
      },
  })
})

})()