(function() {
  var st = jb.studio;

jb.component('studio.suggestions-itemlist', {
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'itemlist', 
    items: '%$suggestionData/options%', 
    controls :{$: 'label', 
      title: '%text%',
//      title: {$: 'highlight', base: '%text%', highlight: '%$suggestionData/tail%'},
    }, 
    watchItems: true, 
    features: [
      {$: 'itemlist.studio-refresh-suggestions-options', 
        path: '%$path%', 
//        expressionOnly: true
      }, 
      {$: 'itemlist.selection', 
        databind: '%$suggestionData/selected%', 
        onDoubleClick :{$: 'studio.paste-suggestion' }, 
        autoSelectFirst: true
      }, 
      {$: 'itemlist.keyboard-selection', 
        onEnter : [
          {$: 'studio.paste-suggestion' },
        ], 
        autoFocus: false
      }, 
      {$: 'css.height', height: '500', overflow: 'auto', minMax: 'max' }, 
      {$: 'css.width', width: '300', overflow: 'auto', minMax: 'min' }, 
      {$: 'css', 
        css: '{ position: absolute; z-index:1000; background: white }'
      }, 
      {$: 'css.border', width: '1', color: '#cdcdcd' }, 
      {$: 'css.padding', top: '2', left: '3', selector: 'li' },
      {$: 'hidden', showCondition :{ $notEmpty: '%$suggestionData/options%' } }, 
    ]
  }
})

jb.component('itemlist.studio-refresh-suggestions-options', {
  type: 'feature',
  params: [
    {id: 'path', as: 'string'},
    {id: 'expressionOnly', as: 'boolean'}
  ],
  impl: ctx => ({
      afterViewInit: cmp => {
        var selectionKeySource = cmp.ctx.vars.selectionKeySource;
        var keydown = selectionKeySource.keydown.takeUntil( cmp.destroyed );
        var input = selectionKeySource.input;

        keydown
          .delay(1) // we use keydown - let the input fill itself
          .debounceTime(20) // solves timing of closing the floating input
          .startWith(1) // compensation for loosing the first event from selectionKeySource
          // .map(e=> 
          //     input.value).distinctUntilChanged() // compare input value - if input was not changed - leave it. Alt-Space can be used here
          .distinctUntilChanged(_=>
            input.value) // compare input value - if input was not changed - leave it. Alt-Space can be used here
          .flatMap(_=>
            getProbe())
          .map(res=>
              res && res.finalResult && res.finalResult[0] && res.finalResult[0].in)
          .map(probeCtx=> 
            new st.suggestions(input,ctx.params.expressionOnly).extendWithOptions(probeCtx,ctx.params.path))
          .catch(e=>
            jb.logException(e,'suggestions'))
          .distinctUntilChanged((e1,e2)=>
            e1.key == e2.key) // compare options - if options are the same - leave it.
          .do(e=>jb.logPerformance('suggestions',e))
          .subscribe(e=> {
              if (!jb.val(cmp.ctx.exp('%$suggestionData%'))) // after dialog closed
                return; 
              cmp.ctx.run({$:'write-value', to: '%$suggestionData/tail%', value: ctx => e.tail })
              cmp.ctx.run({$:'write-value', to: '%$suggestionData/options%', value: ctx => e.options });
          });

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
  })
})

jb.component('studio.show-suggestions', {
  impl: ctx =>
    new st.suggestions(ctx.data,false).suggestionsRelevant()
})

jb.component('studio.property-primitive', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    title :{$: 'studio.prop-name', path: '%$path%' }, 
    controls: [
      {$: 'editable-text', 
        databind :{$: 'studio.ref', path: '%$path%' }, 
        style :{$: 'editable-text.studio-primitive-text' }, 
        features: [
          {$: 'studio.undo-support', path: '%$path%' }, 
          {$: 'studio.property-toolbar-feature', path: '%$path%' }, 
          {$: 'editable-text.helper-popup', 
            showHelper :{$: 'studio.show-suggestions' },
            features :{$: 'dialog-feature.near-launcher-position' }, 
            control :{$: 'studio.suggestions-itemlist', path: '%$path%' }, 
            popupId: 'suggestions', 
            popupStyle :{$: 'dialog.popup' }
          }, 
        ]
      }, 
    ], 
    features: [
      {$: 'var', 
        name: 'suggestionData', 
        value :{$: 'object', selected: '', options: [], path: '%$path%' }, mutable: true
      }, 
//      {$: 'studio.property-toolbar-feature', path: '%$path%' },
    ]
  }
})

jb.component('studio.jb-floating-input', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
     controls:{$: 'editable-text', 
        title :{$: 'studio.prop-name', path: '%$path%' },
        databind :{$: 'studio.profile-value-as-text', path: '%$path%' }, 
        updateOnBlur: true, 
        style :{$: 'editable-text.jb-editor-floating-input'}, 
        features: [
          {$: 'var', 
            name: 'suggestionData', 
            value :{$: 'object', selected: '', options: [], path: '%$path%' }, 
            mutable: true
          }, 
          {$: 'studio.undo-support', path: '%$path%' }, 
          {$: 'editable-text.helper-popup', 
            showHelper :{$: 'studio.show-suggestions' },
            features :{$: 'dialog-feature.near-launcher-position' }, 
            control :{$: 'studio.suggestions-itemlist', path: '%$path%' }, 
            popupId: 'suggestions', 
            popupStyle :{$: 'dialog.popup' }
          }, 
        ],
      },
      features :[ 
      {$: 'css.padding', left: '4', right: '4' },
      {$: 'feature.onEnter', action: 
        [
          { $: 'dialog.close-dialog', id: 'studio-jb-editor-popup' },
          { $: 'tree.regain-focus'}
        ]
        },
      ],
    } 
})
//       {$: 'itemlist-with-groups', 
//         items: '%$suggestionCtx/options%', 
//         controls :{$: 'label', title: '%text%' }, 
//         watchItems: true, 
//         features: [
//           {$: 'itemlist.studio-suggestions-options' }, 
//           {$: 'itemlist.selection', databind: '%$suggestionCtx/selected%',
//             onDoubleClick: ctx => ctx.data.paste(ctx),
//             autoSelectFirst: true
//           }, 
//           {$: 'hidden', showCondition: '%$suggestionCtx/show%' }, 
//           {$: 'css.height', height: '500', overflow: 'auto', minMax: 'max' }, 
//           {$: 'css.padding', top: '3', left: '3', selector: 'li' }
//         ]
//       }
//     ], 
//     features : [
//       {$: 'group.studio-suggestions', 
//         path: '%$path%', 
//         closeFloatingInput: [
//           {$: 'close-containing-popup', OK: true }, 
//           {$: 'tree.regain-focus' }
//         ]
//       },
//     ]
//   }
// })

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

st.suggestions = class {
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
    var options = [];
    probeCtx = probeCtx || new st.previewjb.jbCtx();
    var vars = jb.entries(jb.extend({},(probeCtx.componentContext||{}).params,probeCtx.vars,st.previewjb.resources))
        .map(x=>new ValueOption('$'+x[0],x[1],this.pos,this.tail))
        .filter(x=> x.toPaste.indexOf('$$') != 0)
        .filter(x=>['$window'].indexOf(x.toPaste) == -1)

    if (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
      options = st.PTsOfPath(path).map(compName=> {
            var name = compName.substring(compName.indexOf('.')+1);
            var ns = compName.substring(0,compName.indexOf('.'));
            return new CompOption(compName, compName, ns ? `${name} (${ns})` : name, st.getComp(compName).description || '')
        })
    else if (this.tailSymbol == '%') 
      options = [].concat.apply([],jb.toarray(probeCtx.exp('%%'))
        .map(x=>
          jb.entries(x).map(x=> new ValueOption(x[0],x[1],this.pos,this.tail))))
        .concat(vars)
    else if (this.tailSymbol == '%$') 
      options = vars
    else if (this.tailSymbol == '/' || this.tailSymbol == '.')
      options = [].concat.apply([],
        jb.toarray(probeCtx.exp(this.base))
          .map(x=>jb.entries(x).map(x=>new ValueOption(x[0],x[1],this.pos,this.tail))) )

    options = options
        .filter( jb.unique(x=>x.toPaste) )
        .filter(x=> x.toPaste != this.tail)
        .filter(x=>
          this.tail == '' || typeof x.toPaste != 'string' || (x.description + x.toPaste).toLowerCase().indexOf(this.tail.toLowerCase()) != -1)
    if (this.tail)
      options.sort((x,y)=> (y.toPaste.toLowerCase().indexOf(this.tail.toLowerCase()) == 0 ? 1 : 0) - (x.toPaste.toLowerCase().indexOf(this.tail.toLowerCase()) == 0 ? 1 : 0));

    this.options = options;
    this.key = options.map(o=>o.toPaste).join(','); // build hash for the options to detect options change
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
      else if (Array.isArray(val))
        return ` (${val.length} items)`
      return ``;
    }
    paste(ctx,_close) {
      var close = typeof this.value != 'object' || Array.isArray(this.value) || _close;

      var toPaste = this.toPaste + (close ? '%' : '/');
      var input = ctx.vars.selectionKeySource.input;
      var pos = this.pos + 1;
      input.value = input.value.substr(0,this.pos-this.tail.length) + toPaste + input.value.substr(pos);
      this.writeValue(ctx);
//      suggestionCtx.selected = null;
      return jb.delay(1,ctx).then (() => {
        input.selectionStart = pos + toPaste.length;
        input.selectionEnd = input.selectionStart;
      })
    }
    writeValue(ctx) {
      var input = ctx.vars.selectionKeySource.input;
      var path = ctx.exp('%$suggestionData/path%','string');
      st.writeValueOfPath(path,input.value);
    }
}

class CompOption {
    constructor(toPaste,value,text,description) {
       this.toPaste = toPaste;
       this.value = value;
       this.text = text;
       this.description = description;
    }
    paste(ctx) {
      var input = ctx.vars.selectionKeySource.input;
      input.value = '=' + this.toPaste;
      this.writeValue(ctx);
      // dirty design ?
//      ctx.run({$: 'dialog.close-dialog', id: 'studio-jb-editor-popup' });
        // var closeAndWriteValue = _ => {
        //   params.closeFloatingInput();
        //   var option = input.value.indexOf('=') == 0 ? new CompOption(input.value.substr(1)) : new ValueOption();
        //   option.writeValue(cmp.ctx);
        // };
    }
    writeValue(ctx) {
      st.setComp(ctx.exp('%$suggestionData/path%','string'),this.toPaste);
      ctx.run({$:'studio.expand-and-select-first-child-in-jb-editor' });
    }
}


})()