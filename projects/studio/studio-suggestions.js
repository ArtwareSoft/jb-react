(function() {
const st = jb.studio

jb.component('studio.itemlistRefreshSuggestionsOptions', {
  type: 'feature',
  params: [
    {id: 'path', as: 'string'},
    {id: 'source', as: 'string'}
  ],
  impl: ctx => ({
      afterViewInit: cmp => {
        const {pipe,map,subscribe,distinctUntilChanged,catchError,startWith,debounceTime,takeUntil,delay} = jb.callbag

        const selectionKeySourceCmp = jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource)
        const pathToTrace = ctx.params.path
        const keyup = pipe(selectionKeySourceCmp.keyup, takeUntil( cmp.destroyed ))
        const input = selectionKeySourceCmp.input

        pipe(keyup,
          debounceTime(20), // solves timing of closing the floating input
          startWith(1), // compensation for loosing the first event from selectionKeySource
          map(e=> input.value.slice(0,100)),
          distinctUntilChanged(), // compare input value - if input was not changed - leave it. Alt-Space can be used here
          map(e => st.closestCtxOfLastRun(pathToTrace)),
          map(probeCtx=>
            new st.suggestions(input, ctx.exp('%$suggestionData/expressionOnly%')).extendWithOptions(probeCtx,pathToTrace)),
          catchError(e=> jb.logException(e,'suggestions',cmp.ctx) || []),
          distinctUntilChanged((e1,e2)=> e1.key == e2.key), // compare options - if options are the same - leave it.
          takeUntil( cmp.destroyed ),
          delay(1), // let the itemlist to be built at the first time
          subscribe(e=> {
              cmp.ctx.run((ctx,{suggestionData}) => {
                suggestionData && Object.assign(suggestionData,e)
                if (suggestionData.options.indexOf(suggestionData.selected) == -1)
                  suggestionData.selected = null
              })
              cmp.ctx.run(refreshControlById('suggestions-itemlist'))
          }))
      }
  })
})

jb.component('studio.showSuggestions', {
  impl: ctx =>
    new st.suggestions(ctx.data,ctx.exp('%$suggestionData/expressionOnly%')).suggestionsRelevant()
})

jb.component('studio.pasteSuggestion', {
  type: 'action',
  params: [
    {id: 'option', as: 'single', defaultValue: '%%'},
    {id: 'toAdd', as: 'string', description: '% or /', defaultValue: '%'}
  ],
  impl: (ctx,option,toAdd) => {
    if (option && ctx.exp('%$suggestionData/options%','array').length)
    Promise.resolve(option.paste(ctx,toAdd)).then(_=> {
      jb.ui.closestCmp(ctx.vars.suggestionData.input).closePopup()
    })
  }
})

jb.component('studio.suggestionsItemlist', {
  params: [
    {id: 'path', as: 'string'},
    {id: 'source', as: 'string'}
  ],
  impl: itemlist({
    items: '%$suggestionData/options%',
    controls: text({
      text: pipeline('%text%', studio.unMacro()),
      features: [
        css.padding({left: '3', right: '2'}),
        feature.hoverTitle(
          pipeline(ctx => jb.studio.previewjb.comps[ctx.data.toPaste], '%description%')
        )
      ]
    }),
    features: [
      id('suggestions-itemlist'),
      itemlist.noContainer(),
      studio.itemlistRefreshSuggestionsOptions('%$path%', '%$source%'),
      itemlist.selection({
        databind: '%$suggestionData/selected%',
        onDoubleClick: studio.pasteSuggestion()
      }),
      itemlist.keyboardSelection(false),
      css.height({height: '500', overflow: 'auto', minMax: 'max'}),
      css.width({width: '300', overflow: 'auto', minMax: 'min'}),
      css('{ position: absolute; z-index:1000; background: white }'),
      css.border({width: '1', color: '#cdcdcd'}),
      css.padding({top: '2', left: '3', selector: 'li'})
    ]
  })
})

jb.component('studio.propertyPrimitive', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      editableText({
        databind: studio.ref('%$path%'),
        style: editableText.studioPrimitiveText(),
        features: [
          feature.onKey('Right', studio.pasteSuggestion('%$suggestionData/selected%', '/')),
          feature.onKey('Enter', studio.pasteSuggestion('%$suggestionData/selected%')),
          editableText.helperPopup({
            control: studio.suggestionsItemlist('%$path%'),
            popupId: 'suggestions',
            popupStyle: dialog.popup(),
            showHelper: studio.showSuggestions()
          })
        ]
      })
    ],
    features: variable({
      name: 'suggestionData',
      value: {'$': 'object', selected: '', options: [], path: '%$path%', expressionOnly: true}
    })
  })
})

jb.component('studio.jbFloatingInput', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    layout: layout.horizontal('20'),
    controls: [
      control.icon({
        icon: 'FunctionVariant',
        title: "hit '=' to calculate with function",
        type: 'mdi',
        features: [css.margin('25')]
      }),
      button({
        title: 'set to false',
        action: writeValue(studio.boolRef('%$path%'), false),
        style: button.mdcIcon(icon({icon: 'cancel', type: 'mdc'}), '24'),
        features: [
          feature.if(ctx => ctx.run(studio.isOfType('%$path%', 'boolean'))),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button({
        title: 'set to true',
        action: writeValue(studio.boolRef('%$path%'), true),
        style: button.mdcIcon(icon({icon: 'done', type: 'mdc'}), '24'),
        features: [
          feature.if(ctx => ctx.run(studio.isOfType('%$path%', 'boolean'))),
          css.margin('26'),
          css.width('38')
        ]
      }),
      button({
        title: 'choose icon',
        action: studio.openPickIcon('%$path%'),
        style: button.mdcIcon(),
        features: [
          feature.if(and(inGroup(list('feature.icon','icon'), studio.compName(studio.parentPath('%$path%'))),
              equals('icon', pipeline(studio.paramDef('%$path%'), '%id%'))
          )),
          css.transformScale({x: '1', y: '0.8'}),
          css.margin('15'),
          feature.icon('all_out')
        ]
      }),
      group({
        title: '',
        layout: layout.vertical(),
        controls: [
          editableText({
            title: studio.propName('%$path%'),
            databind: studio.profileValueAsText('%$path%'),
            updateOnBlur: true,
            style: editableText.floatingInput(),
            features: [
              watchRef({ref: studio.ref('%$path%'), strongRefresh: true}),
              feature.onKey('Right', studio.pasteSuggestion('%$suggestionData/selected%', '/')),
              feature.onKey('Enter', studio.pasteSuggestion('%$suggestionData/selected%')),
              editableText.helperPopup({
                control: studio.suggestionsItemlist('%$path%', 'floating-input'),
                popupId: 'suggestions',
                popupStyle: dialog.popup(),
                showHelper: studio.showSuggestions(),
                onEnter: runActions(dialog.closeDialog('studio-jb-editor-popup'), tree.regainFocus()),
                onEsc: runActions(dialog.closeDialog('studio-jb-editor-popup'), tree.regainFocus())
              }),
              css.width('100%'),
              css('~ input { padding-top: 30px !important}')
            ]
          }),
          text({
            text: pipeline(studio.paramDef('%$path%'), '%description%'),
            features: css('color: grey')
          })
        ],
        features: css.width('100%')
      })
    ],
    features: [
      variable({
        name: 'suggestionData',
        value: {'$': 'object', selected: '', options: [], path: '%$path%'}
      }),
      css.padding({left: '4', right: '4'}),
      css.width('500')
    ]
  })
})


function rev(str) {
  return str.split('').reverse().join('');
}

st.suggestions = class {
  constructor(input,expressionOnly) {
    this.input = input;
    this.expressionOnly = expressionOnly;
    this.pos = input.selectionStart;
    this.text = input.value.substr(0,this.pos).trim().slice(0,100);
    this.text_with_open_close = this.text.replace(/%([^%;{}\s><"']*)%/g, (match,contents) =>
      '{' + contents + '}');
    this.exp = rev((rev(this.text_with_open_close).match(/([^\}%]*%)/) || ['',''])[1]);
    this.exp = this.exp || rev((rev(this.text_with_open_close).match(/([^\}=]*=)/) || ['',''])[1]);
    this.tail = rev((rev(this.exp).match(/([^%.\/=]*)(\/|\.|%|=)/)||['',''])[1]);
    this.tailSymbol = this.text_with_open_close.slice(-1-this.tail.length).slice(0,1); // % or /
    if (this.tailSymbol == '%' && this.exp.slice(0,2) == '%$')
      this.tailSymbol = '%$';
    this.base = this.exp.slice(0,-1-this.tail.length) + '%';
    this.inputVal = input.value.slice(0,100);
    this.inputPos = input.selectionStart;
  }

  suggestionsRelevant() {
    return (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
      || ['%','%$','/','.'].indexOf(this.tailSymbol) != -1
  }

  extendWithOptions(probeCtx,path) {
    var options = [];
    probeCtx = probeCtx || new st.previewjb.jbCtx();
    const resources = jb.entries(jb.studio.previewjb.comps)
          .filter(e=>! jb.comps[e[0]])
          .filter(e=>e[1].watchableData  !== undefined || e[1].passiveData  !== undefined)
          .map(e=>[jb.removeDataResourcePrefix(e[0]),e[1]])
    const vars = jb.entries(Object.assign({},(probeCtx.componentContext||{}).params,probeCtx.vars))
        .concat(resources)
        .filter(x=>['cmp'].indexOf(x[0]) == -1)
        .map(x=>new ValueOption('$'+x[0],jb.studio.previewjb.val(x[1]),this.pos,this.tail))
        .filter(x=> x.toPaste.indexOf('$$') != 0)
        // .filter(x=> x.toPaste.indexOf(':') == -1)

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

    options = jb.unique(options,x=>x.toPaste).filter(x=> x.toPaste.indexOf('$jb_') != 0)
    if (this.tail == '')// || typeof x.toPaste != 'string')
      this.options = options
    else
      this.options = new jb.frame.Fuse(options,{keys: ['toPaste','description']}).search(this.tail || '').map(x=>x.item)

    this.key = this.options.map(o=>o.toPaste).join(','); // build hash for the options to detect options change
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
    paste(ctx,_toAdd) {
      const input = ctx.vars.suggestionData.input;
      const primiteVal = typeof this.value != 'object'
      const toPaste = this.toPaste + (primiteVal ? '%' : _toAdd);
      const pos = this.pos + 1;
      input.value = input.value.substr(0,this.pos-this.tail.length) + toPaste + input.value.substr(pos);
      try {
//        input._component && input._component.jbModel(input.value,'keyup') // sometimes the onupdate event is not activated...
      } catch (e) {}
      ctx.exp('%$suggestionData%').options = [] // disable more pastes...

      return jb.delay(1,ctx).then (() => {
        input.selectionStart = pos + toPaste.length;
        input.selectionEnd = input.selectionStart;
      })
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
      // const input = ctx.vars.suggestionData.inputCmp.input;
      // input.value = '=' + this.toPaste;
      this.writeValue(ctx);
    }
    writeValue(ctx) {
      st.setComp(ctx.exp('%$suggestionData/path%','string'),this.toPaste,ctx);
      return ctx.run(runActions(dialog.closeDialog('studio-jb-editor-popup'),
        studio.expandAndSelectFirstChildInJbEditor()))
    }
}


})()
