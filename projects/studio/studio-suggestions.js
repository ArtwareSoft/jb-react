(function() {
const st = jb.studio
  
jb.component('studio.itemlist-refresh-suggestions-options', {
  type: 'feature',
  params: [
    {id: 'path', as: 'string'},
    {id: 'source', as: 'string'},
    {id: 'expressionOnly', as: 'boolean'},
  ],
  impl: ctx => ({
      afterViewInit: cmp => {
        const selectionKeySource = cmp.ctx.vars.selectionKeySource
        const pathToTrace = ctx.params.path
        const keyup = selectionKeySource.keyup.takeUntil( cmp.destroyed )
        const input = selectionKeySource.input

        keyup
          .debounceTime(20) // solves timing of closing the floating input
          .startWith(1) // compensation for loosing the first event from selectionKeySource
          .do(e=>jb.log('suggestions',['after debounce', input.value, e, cmp, pathToTrace]))
          .map(e=>
              input.value).distinctUntilChanged() // compare input value - if input was not changed - leave it. Alt-Space can be used here
          .do(e=>jb.log('suggestions',['after distinct', input.value, e, cmp, pathToTrace]))
          .map(closestCtx)
          // .flatMap(_=> {
          //   if (ctx.params.source != 'floating-input') {
          //     const ctxFromPreview = st.closestCtxInPreview(pathToTrace)
          //     if (ctxFromPreview && ctxFromPreview.ctx) 
          //       return [ctxFromPreview.ctx]
          //   }
          //   return getProbe().then(res=> res && res.result && res.result[0] && res.result[0].in)
          // })
          .do(e=>jb.log('suggestions',['probe ctx', input.value, e, cmp, pathToTrace]))
          .map(probeCtx=>
            new st.suggestions(input,ctx.params.expressionOnly).extendWithOptions(probeCtx,pathToTrace))
          .do(e=>jb.log('suggestions',['create suggestions obj', input.value, e, cmp, pathToTrace]))
          .catch(e=> jb.logException(e,'suggestions',cmp.ctx) || [])
          .distinctUntilChanged((e1,e2)=>
            e1.key == e2.key) // compare options - if options are the same - leave it.
          .do(e=>jb.log('suggestions',['generate event', input.value, e, cmp, pathToTrace]))
          .takeUntil( cmp.destroyed )
          .subscribe(e=> {
            //   if (input.value.indexOf('=') == 0) {
            //     cmp.ctx.run({$:'write-value', to: {$: 'studio.ref', path: pathToTrace}, value: '' });
            //     return cmp.ctx.run({$: 'studio.open-new-profile-dialog',
            //       path: pathToTrace, mode: 'update',
            //       type: {$:'studio.param-type', path: pathToTrace}
            //    });
            //  }
              jb.log('suggestions',['before write values', input.value, cmp, pathToTrace]);
              cmp.ctx.setVars({e}).run(runActions(
                writeValue('%$studio/suggestionData/options%','%$e.options%'), // let the suggestion options refresh
                writeValue('%$studio/suggestionData/selected%','%$e.selected%'),
                writeValue('%$studio/suggestionData/tail%','%$e.tail%') // used for highlighting
              ))
              // cmp.ctx.run({$:'write-value', to: '%$studio/suggestionData/options%', value: ctx => e.options });
              // cmp.ctx.run({$:'write-value', to: '%$studio/suggestionData/tail%', value: ctx => e.tail })
              // cmp.ctx.run({$:'write-value', to: '%$studio/suggestionData/selected%', value: ctx => e.options[0] });
              jb.log('suggestions',['after write values', input.value, cmp, pathToTrace]);
          });

        function closestCtx() {
          if (pathToTrace.match(/pipeline~[1-9][0-9]*$/) && st.isExtraElem(pathToTrace)) {
            const formerIndex = Number(pathToTrace.match(/pipeline~([1-9][0-9]*)$/)[1])-1
            const formerPath = pathToTrace.replace(/[0-9]+$/,formerIndex)
            const baseCtx = st.closestCtxByPath(formerPath)
            if (baseCtx)
              return baseCtx.setData(baseCtx.runItself())
          }
          return st.closestCtxByPath(pathToTrace)
        }

        // function getProbe() {
        //   if (cmp.probeResult)
        //     return [cmp.probeResult];
        //   var probePath = ctx.params.path;
        //   if (st.valOfPath(probePath) == null)
        //     jb.writeValue(st.refOfPath(probePath),'',ctx);
          
        //   return ctx.run({$: 'studio.probe', path: probePath }).then(res=>cmp.probeResult = res);
        // }
      }
  })
})

jb.component('studio.show-suggestions', {
  impl: ctx =>
    new st.suggestions(ctx.data,false).suggestionsRelevant()
})

jb.component('studio.paste-suggestion', {
  type: 'action',
  params: [
    { id: 'option', as: 'single', defaultValue: '%%' },
    { id: 'close', as: 'boolean', description: 'ends with % or /' }
  ],
  impl: (ctx,option,close) => {
    option && Promise.resolve(option.paste(ctx,close)).then(_=> {
      var cmp = ctx.vars.selectionKeySource.cmp;
      cmp.refreshSuggestionPopupOpenClose();
      jb.ui.setState(cmp,{model: cmp.jbModel()},null,ctx);
    })
  }
})

jb.component('studio.suggestions-itemlist', {
  params: [{ id: 'path', as: 'string' }, { id: 'source', as: 'string' }],
  impl :{$: 'itemlist',
    items: '%$studio/suggestionData/options%',
    controls :{$: 'label',
      title: '%text%',
      features: [
        {$: 'css.padding', right: '2', left: '3' },
        //{$: 'watch-ref', ref: '%$studio/suggestionData/tail%'}
      ]
//      title: {$: 'highlight', base: '%text%', highlight: '%$studio/suggestionData/tail%'},
    },
    watchItems: true,
    features: [
      {$: 'itemlist.no-container'},
      {$: 'studio.itemlist-refresh-suggestions-options',
        path: '%$path%', source: '%$source%'
//        expressionOnly: true
      },
      {$: 'itemlist.selection',
        databind: '%$studio/suggestionData/selected%',
        onDoubleClick :{$: 'studio.paste-suggestion' },
        autoSelectFirst: true
      },
      {$: 'itemlist.keyboard-selection',
        onEnter : [
          {$: 'studio.paste-suggestion', close: true },
        ],
        autoFocus: false
      },
      {$: 'feature.onKey', code: 39, action :{$: 'studio.paste-suggestion', option: '%$studio/suggestionData/selected%', close: false }}, // right arrow should drill down
      {$: 'css.height', height: '500', overflow: 'auto', minMax: 'max' },
      {$: 'css.width', width: '300', overflow: 'auto', minMax: 'min' },
      {$: 'css',
        css: '{ position: absolute; z-index:1000; background: white }'
      },
      {$: 'css.border', width: '1', color: '#cdcdcd' },
      {$: 'css.padding', top: '2', left: '3', selector: 'li' },
      {$: 'feature.if', showCondition :{ $notEmpty: '%$studio/suggestionData/options%' } },
    ]
  }
})

jb.component('studio.property-primitive', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'group',
//    title :{$: 'studio.prop-name', path: '%$path%' },
    controls: [
      {$: 'editable-text',
        databind :{$: 'studio.ref', path: '%$path%' },
        style :{$: 'editable-text.studio-primitive-text' },
        features: [
//          {$: 'studio.undo-support', path: '%$path%' },
//          {$: 'studio.property-toolbar-feature', path: '%$path%' },
          {$: 'studio.watch-path', path: '%$path%', includeChildren: true },
          {$: 'editable-text.helper-popup',
            features :{$: 'dialog-feature.near-launcher-position' },
            control :{$: 'studio.suggestions-itemlist', path: '%$path%' },
            popupId: 'suggestions',
            popupStyle :{$: 'dialog.popup' },
            showHelper :{$: 'studio.show-suggestions' }
          }
        ]
      }
    ],
    features: [
      {$:'feature.init', action :{$: 'write-value', 
        to: '%$studio/suggestionData%', value :{$: 'object', selected: '', options: [], path: '%$path%' } 
      }}, 
//      {$: 'studio.property-toolbar-feature', path: '%$path%' }
    ]
  }
})

jb.component('studio.jb-floating-input', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        title :{$: 'studio.prop-name', path: '%$path%' }, 
        databind :{$: 'studio.profile-value-as-text', path: '%$path%' }, 
        updateOnBlur: true, 
        style :{$: 'custom-style', 
          template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label'},[
        h('input', { class: 'mdl-textfield__input', id1: 'jb_input_' + state.fieldId, type: 'text', autocomplete: 'nop',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'jb_input_' + state.fieldId},state.title)
      ]), 
          css: '{ margin-right: 13px; }', 
          features: [
            {$: 'field.databind-text', debounceTime: 300, oneWay: true }, 
            {$: 'mdl-style.init-dynamic' }
          ]
        }, 
        features: [
          {$:'feature.init', action :{$: 'write-value', 
            to: '%$studio/suggestionData%', value :{$: 'object', selected: '', options: [], path: '%$path%' } 
          }}, 
          {$: 'editable-text.helper-popup', 
            features :{$: 'dialog-feature.near-launcher-position' }, 
            control :{$: 'studio.suggestions-itemlist', path: '%$path%', source: 'floating-input' }, 
            popupId: 'suggestions', 
            popupStyle :{$: 'dialog.popup' }, 
            showHelper :{$: 'studio.show-suggestions' }, 
            onEnter: [
              {$: 'dialog.close-dialog', id: 'studio-jb-editor-popup' }, 
              {$: 'tree.regain-focus' }
            ], 
            onEsc: [
              {$: 'dialog.close-dialog', id: 'studio-jb-editor-popup' }, 
              {$: 'tree.regain-focus' }
            ]
          }
        ]
      }, 
      {$: 'label', 
        title :{ $pipeline: [{$: 'studio.param-def', path: '%$path%' }, '%description%'] }
      }
    ], 
    features: [
      {$: 'css.padding', left: '4', right: '4' }, 
      {$: 'css.margin', $disabled: true, top: '-20', selector: '>*:last-child' }
    ]
  }
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
    var vars = jb.entries(Object.assign({},(probeCtx.componentContext||{}).params,probeCtx.vars,st.previewjb.resources,st.previewjb.consts))
        .map(x=>new ValueOption('$'+x[0],jb.val(x[1]),this.pos,this.tail))
        .filter(x=> x.toPaste.indexOf('$$') != 0)
        .filter(x=> x.toPaste.indexOf(':') == -1)
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

    options = jb.unique(options,x=>x.toPaste)
        .filter(x=> x.toPaste.indexOf('$jb_') != 0)
//        .filter(x=> x.toPaste != this.tail)
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
      //var close = typeof this.value != 'object' || Array.isArray(this.value) || _close;

      var toPaste = this.toPaste + (_close ? '%' : '/');
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
      var path = ctx.exp('%$studio/suggestionData/path%','string');
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
        // var closeAndWriteValue = _ => {
        //   params.closeFloatingInput();
        //   var option = input.value.indexOf('=') == 0 ? new CompOption(input.value.substr(1)) : new ValueOption();
        //   option.writeValue(cmp.ctx);
        // };
    }
    writeValue(ctx) {
      st.setComp(ctx.exp('%$studio/suggestionData/path%','string'),this.toPaste);
      ctx.run({$: 'dialog.close-dialog', id: 'studio-jb-editor-popup' });
      ctx.run({$:'studio.expand-and-select-first-child-in-jb-editor' });
    }
}


})()
