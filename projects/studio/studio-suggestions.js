jb.extension('studio', 'suggestions', {
    require: ['/dist/fuse.js'],
    initExtension() {
      return { hideInSuggestions: 'cmp,widgetId,headlessWidget,headlessWidgetId'.split(',')}
    },

    suggestions: class suggestions {
      constructor(input, expressionOnly) {
        this.input = input
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
        this.inputPos = input.selectionStart
        function rev(str) {
          return str.split('').reverse().join('');
        }

      }

      suggestionsRelevant() {
        return (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
          || ['%','%$','/','.'].indexOf(this.tailSymbol) != -1
      }

      calcOptions(probeCtx,path) {
        var options = [];
        probeCtx = probeCtx || new jb.core.jbCtx();
        const resources = jb.entries(jb.comps)
              .filter(e=>! jb.comps[e[0]])
              .filter(e=>e[1].watchableData  !== undefined || e[1].passiveData  !== undefined)
              .map(e=>[jb.db.removeDataResourcePrefix(e[0]),e[1]])
        const vars = jb.entries(Object.assign({},(probeCtx.cmpCtx||{}).params,probeCtx.vars))
            .concat(resources)
            .filter(x=>jb.studio.hideInSuggestions.indexOf(x[0]) == -1)
            .map(x=> jb.studio.valueOption('$'+x[0],jb.val(x[1]),this.pos,this.tail,this.input))
            .filter(x=> x.toPaste.indexOf('$$') != 0)
            // .filter(x=> x.toPaste.indexOf(':') == -1)

        if (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
          options = jb.studio.PTsOfPath(path).map(compName=> {
                var name = compName.substring(compName.indexOf('.')+1);
                var ns = compName.substring(0,compName.indexOf('.'));
                return jb.studio.compOption(path, compName, compName, ns ? `${name} (${ns})` : name, jb.studio.getComp(compName).description || '')
            })
        else if (this.tailSymbol == '%')
          options = [].concat.apply([],jb.toarray(probeCtx.exp('%%'))
            .map(x=>
              jb.entries(x).map(x=> jb.studio.valueOption(x[0],x[1],this.pos,this.tail,this.input))))
            .concat(vars)
        else if (this.tailSymbol == '%$')
          options = vars
        else if (this.tailSymbol == '/' || this.tailSymbol == '.')
          options = [].concat.apply([],
            jb.toarray(probeCtx.exp(this.base))
              .map(x=>jb.entries(x).map(x=> jb.studio.valueOption(x[0],x[1],this.pos,this.tail,this.input))) )

        options = jb.utils.unique(options,x=>x.toPaste).filter(x=> x.toPaste.indexOf('$jb_') != 0)
        if (this.tail != '' && jb.frame.Fuse)
          options = new jb.frame.Fuse(options,{keys: ['toPaste','description']}).search(this.tail || '').map(x=>x.item)

        const optionsHash = options.map(o=>o.toPaste).join(',')
        jb.log('suggestions calc',{ sugg: this, options,probeCtx,path })

        return {optionsHash, options}
      }
  },
  valueOption(toPaste,value,pos,tail,input) {
    return { type: 'value', toPaste,value,pos,tail, text: toPaste + valAsText(value), input, code: toPaste }

    function valAsText(val) {
      if (typeof val == 'string' && val.length > 20)
        return ` (${val.substring(0,20)}...)`;
      else if (typeof val == 'string' || typeof val == 'number' || typeof val == 'boolean')
        return ` (${val})`;
      else if (Array.isArray(val))
        return ` (${val.length} items)`
      return ``;
    }
  },
  compOption(path, toPaste,value,text,description) {
    return {type: 'comp', path, toPaste,value,text,description, code: toPaste}
  }
})

jb.component('studio.suggestions', {
  params: [
    {id: 'path', as: 'string'},
    {id: 'expressionOnly', as: 'boolean'}
  ],
  impl: (ctx,path,expressionOnly) => new jb.studio.suggestions(jb.val(ctx.data), expressionOnly)
      .calcOptions(jb.studio.closestCtxOfLastRun(path),path)
})

jb.component('studio.shouldShowSuggestions', {
  params: [
    {id: 'expressionOnly', as: 'boolean'}
  ],
  impl: (ctx,expressionOnly) => new jb.studio.suggestions(jb.val(ctx.data), expressionOnly).suggestionsRelevant()
})

jb.component('studio.applyOption', {
  type: 'action',
  params: [
    {id: 'toAdd', as: 'string', description: '% or /', defaultValue: '%'},
  ],
  impl: (ctx,toAdd) => {
      const option = jb.val(ctx.vars.selectedOption)
      if (option.type == 'value') {
        const input = option.input
        const primiteVal = typeof option.value != 'object'
        const toPaste = option.toPaste + (primiteVal ? '%' : toAdd)
        const pos = option.pos + 1
        const newVal = () => input.value.substr(0,option.pos-option.tail.length) + toPaste + input.value.substr(pos)
        ctx.run(editableText.setInputState({
            assumedVal: () => input.value,
            newVal,
            selectionStart: pos + toPaste.length,
        }))
        if (toPaste.match(/%$/))
          ctx.run(writeValue('%$$model/databind()%', newVal))        
      } else if (option.type == 'comp') {
        jb.studio.setComp(option.path, option.toPaste, ctx);
        return ctx.run(runActions(dialog.closeDialogById('studio-jb-editor-popup'),
            studio.expandAndSelectFirstChildInJbEditor()))        
      }
  }
})
  
jb.component('studio.propertyPrimitive', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
  ],
  impl: editableText({
      databind: studio.ref('%$path%'),
      style: editableText.studioPrimitiveText(),
      features: [
        feature.onKey('Right', studio.applyOption('/')),
        editableText.picklistHelper({
          showHelper: studio.shouldShowSuggestions(true),
          options: remote.data(studio.suggestions('%$path%',true), jbm.wPreview()),
          picklistFeatures: picklist.allowAsynchOptions(),
          picklistStyle: studio.suggestionList(),
          onEnter: studio.applyOption()
        }),
      ]
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
              feature.onKey('Right', studio.applyOption('/')),
              feature.onKey('Enter', runActions(studio.applyOption(), dialog.closeDialogById('studio-jb-editor-popup'), tree.regainFocus())),
              feature.onKey('Esc', runActions(dialog.closeDialogById('studio-jb-editor-popup'), tree.regainFocus())),
              editableText.picklistHelper({
                showHelper: studio.shouldShowSuggestions(),
                options: remote.data(studio.suggestions('%$path%'), jbm.wPreview()),
                picklistFeatures: picklist.allowAsynchOptions(),
                picklistStyle: studio.suggestionList(),
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
      css.padding({left: '4', right: '4'}),
      css.width('500')
    ]
  })
})

jb.component('studio.suggestionList', {
  type: 'picklist.style',
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      visualSizeLimit: 30,
      controls: text({
        text: pipeline('%text%', studio.unMacro()),
        features: [
          css.padding({left: '3', right: '2'}),
          feature.hoverTitle(
            pipeline(ctx => jb.comps[ctx.data.toPaste], '%description%')
          )
        ]
      }),      
      features: [
        itemlist.selection({
          databind: '%$picklistModel/databind%',
//          selectedToDatabind: '%code%',
//          databindToSelected: ctx => ctx.vars.picklistModel.options().find(o=>o.code == ctx.data),
          onDoubleClick: runActions(
            Var('cmp','%$helperCmp%'),
            action.runBEMethod('onEnter')
          )
        }),
        itemlist.keyboardSelection(false),
        css.height({height: '500', overflow: 'scroll', minMax: 'max'}),
        css.width({width: '300', overflow: 'auto', minMax: 'min'}),
        css('{ position: absolute; z-index:1000; background: var(--jb-dropdown-bg) }'),
        css.border({width: '1', color: 'var(--jb-dropdown-border)' }),
        css.padding({top: '2', left: '3', selector: 'li'}),
        itemlist.infiniteScroll()
      ]
    }),
    'picklistModel'
  )
})

