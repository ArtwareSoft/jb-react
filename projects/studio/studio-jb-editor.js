(function() {
const st = jb.studio
jb.studio.probeResultCustomizers = []
jb.ns('tree')

jb.component('studio.jbEditorPathForEdit', {
  type: 'data',
  description: 'in case of array, use extra element path',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const ar = jb.studio.valOfPath(path);
    if (Array.isArray(ar))
      return path + '~' + ar.length;
    return path;
  }
})

jb.component('studio.openJbEditorMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'root', as: 'string'}
  ],
  impl: menu.openContextMenu({
    menu: studio.jbEditorMenu('%$path%', '%$root%'),
    features: dialogFeature.onClose(tree.regainFocus())
  })
})

jb.component('studio.probResultCustomization', {
  type: 'data',
  params: [
    {id: 'probeResult', mandatory: true}
  ],
  impl: (ctx, probeResult) => {
    probeResult.result.forEach(res=> {
      //res.out = res.out && res.out.probeResultCustomization ? res.out.probeResultCustomization(ctx, res.out) : res.out
      (jb.studio.probeResultCustomizers||[]).forEach(customize => customize(ctx, res))
    })
    return probeResult;
  }
})

jb.component('studio.jbEditorContainer', {
  type: 'feature',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'initialSelection', as: 'string', defaultValue: '%$path%'},
    {id: 'circuit', as: 'single', description: 'path or ctx of circuit to run the probe'}
  ],
  impl: variable({
        name: 'jbEditorCntrData',
        value: {'$': 'object', selected: '%$initialSelection%', circuit: '%$circuit%'},
        watchable: true
  })
})

jb.component('studio.probeResults', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) => jb.delay(300).then(_ => {
    if (ctx.exp('%$stduio/fastPreview%')) {
      const inCtx = st.closestCtxOfLastRun(path) || new jb.jbCtx()
      return [{in: inCtx, out: st.isOfType(path,'action') ? null :
          st.previewjb.val(inCtx.runItself())}]
    }
    return ctx.run(pipe(studio.probe(path), '%result%'))
  })
})

jb.component('studio.dataBrowse', {
  type: 'control',
  params: [
    {id: 'objToShow', mandatory: true, as: 'value', defaultValue: '%%'},
    {id: 'width', as: 'number', defaultValue: 200}
  ],
  impl: group({
    controls: [
      group({
        controls: [
          controlWithCondition(isOfType('string,boolean,number', '%$obj%'), text('%$obj%')),
          controlWithCondition('%$obj.snifferResult%', studio.showRxSniffer('%$obj%')),
          controlWithCondition(
            (ctx,{obj}) => jb.callbag.isCallbag(obj),
            studio.browseRx('%$obj%')
          ),
          controlWithCondition(
            isOfType('array', '%$obj%'),
            itemlist({
              items: '%$obj%',
              controls: group({title: '%$obj/length% items', controls: studio.dataBrowse('%%', 200)}),
              style: table.mdc(),
              visualSizeLimit: 7,
              features: [itemlist.infiniteScroll(), css.height({height: '400', minMax: 'max'})]
            })
          ),
          controlWithCondition(
            '%$obj/_parent%',
            group({
              layout: layout.flex({spacing: '10'}),
              controls: [
                studio.dataBrowse('%$obj/data%')
              ]
            })
          ),
          controlWithCondition(isNull('%$obj%'), text('null')),
          tree({
            nodeModel: tree.jsonReadOnly('%$obj%', '%$title%'),
            style: tree.expandBox({}),
            features: [
              css.class('jb-editor'),
              tree.selection({}),
              tree.keyboardSelection({}),
              css.width({width: '%$width%', minMax: 'max'})
            ]
          })
        ],
        features: group.firstSucceeding()
      }),
      controlWithCondition(
        and('%$obj/length% > 100', isOfType('string', '%$obj%')),
        button({
          title: 'open (%$obj/length%)',
          action: openDialog({
            style: dialog.showSourceStyle('show-data'),
            content: group({
              style: group.tabs({}),
              controls: [
                editableText({
                  title: 'codemirror',
                  databind: '%$obj%',
                  style: editableText.codemirror({
                    enableFullScreen: true,
                    resizer: true,
                    height: '',
                    mode: 'text',
                    debounceTime: 300,
                    lineWrapping: false,
                    lineNumbers: true,
                    readOnly: true,
                    maxLength: ''
                  })
                }),
                html({title: 'html', html: '%$obj%', style: html.inIframe()})
              ],
              features: css('{height: 100%} >div:last-child {height: 100%}')
            })
          }),
          style: button.href()
        }),
        'long text'
      )
    ],
    features: [
      group.wait({
        for: ctx => ctx.exp('%$objToShow%'),
        loadingControl: text('...'),
        varName: 'obj',
        passRx: true
      }),
      css.height({height: '400', overflow: 'auto', minMax: 'max'}),
      css.width({overflow: 'auto', minMax: 'max'})
    ]
  })
})

jb.component('studio.browseRx', {
  type: 'control',
  params: [
    {id: 'rx'}
  ],
  impl: itemlist({
        items: '%$rx%',
        controls: studio.dataBrowse('%d/vars%'),
        style: itemlist.ulLi(),
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
  })
})

jb.component('studio.showRxSniffer', {
  type: 'control',
  params: [
    {id: 'snifferRx'}
  ],
  impl: itemlist({
        items: '%$snifferRx%',
        controls: group({
          layout: layout.flex({spacing: '0'}),
          controls: [
            group({
              title: 'data',
              layout: layout.flex({justifyContent: data.if('%dir%==in', 'flex-start', 'flex-end')}),
              controls: studio.dataBrowse('%d%'),
              features: [css.width('100%'), css.margin({left: '10'})]
            }),
            button({
              title: '%dir%',
              action: openDialog({
                id: '',
                style: dialog.popup(),
                content: group({
                  controls: [
                    studio.dataBrowse('%d/vars%')
                  ]
                }),
                title: 'variables',
                features: dialogFeature.uniqueDialog('variables')
              }),
              style: button.href(),
              features: [css.margin({left: '10'}), feature.hoverTitle('show variables')]
            }),
            text({
              text: '%time%',
              title: 'time',
              style: text.span(),
              features: [css.opacity('0.5'), css.margin({left: '10'})]
            })
          ],
          features: feature.byCondition('%dir%==out', css.color({background: 'lightGray'}))
        }),
        style: itemlist.ulLi(),
        visualSizeLimit: 7,
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
   })
})

jb.component('studio.probeDataView', {
  type: 'control',
  impl: group({
    controls: group({
      controls: group({
        controls: [
          controlWithCondition(
            ({},{probeResult}) => jb.path(probeResult,'0.out.snifferResult'),
            studio.showRxSniffer('%$probeResult/out%')
          ),
          itemlist({
            items: '%$probeResult%',
            controls: [
              group({
                title: 'in (%$probeResult/length%)',
                controls: studio.dataBrowse(({data}) => st.previewjb.val(data.in.data)),
                features: css.width({width: '300', minMax: 'max'})
              }),
              group({
                title: 'out',
                controls: studio.dataBrowse('%$probeResult/out%'),
                features: field.columnWidth(100)
              })
            ],
            style: table.mdc(),
            visualSizeLimit: 7,
            features: [
              itemlist.infiniteScroll(),
              css.height({height: '100%', minMax: 'max'}),
              field.columnWidth(100),
              css('{white-space: normal}')
            ]
          })
        ],
        features: group.firstSucceeding()
      }),
      features: [
        feature.if('%$jbEditorCntrData/selected%'),
        group.wait({
          for: studio.probeResults('%$jbEditorCntrData/selected%'),
          loadingControl: text('...'),
          varName: 'probeResult',
          passRx: true
        })
      ]
    }),
    features: [
      watchRef({ref: '%$jbEditorCntrData/selected%', strongRefresh: true}),
      watchRef({ref: '%$studio/pickSelectionCtxId%', strongRefresh: true}),
      watchRef({ref: '%$studio/refreshProbe%', strongRefresh: true})
    ]
  })
})

jb.component('studio.openJbEditProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch(
    Var('actualPath', studio.jbEditorPathForEdit('%$path%')),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    [
      action.switchCase(endsWith('$vars', '%$path%')),
      action.switchCase(
        '%$paramDef/options%',
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: group({
            controls: [
              studio.jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature.onEsc(dialog.closeContainingPopup(true)),
              feature.onEnter(
                dialog.closeContainingPopup(true),
                tree.regainFocus(),
                toggleBooleanValue('%$studio/refreshProbe%')
              )
            ]
          }),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(tree.regainFocus())
          ]
        })
      ),
      action.switchCase(
        isOfType('function', studio.val('%$actualPath%')),
        studio.editSource('%$actualPath%')
      ),
      action.switchCase(
        studio.isOfType('%$actualPath%', 'data,boolean'),
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: studio.jbFloatingInput('%$actualPath%'),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(toggleBooleanValue('%$studio/refreshProbe%'))
          ]
        })
      ),
      action.switchCase(
        Var('ptsOfType', studio.PTsOfType(studio.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        studio.setComp('%$path%', '%$ptsOfType[0]%')
      )
    ],
    studio.openNewProfileDialog({
      path: '%$actualPath%',
      type: studio.paramType('%$actualPath%'),
      mode: 'update',
      onClose: tree.regainFocus()
    })
  )
})

jb.component('studio.jbEditorInteliTree', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: tree({
    nodeModel: studio.jbEditorNodes('%$path%'),
    style: tree.expandBox(true),
    features: [
      css.class('jb-editor'),
      tree.selection({
        databind: '%$jbEditorCntrData/selected%',
        autoSelectFirst: true,
        onRightClick: studio.openJbEditorMenu('%%', '%$path%')
      }),
      tree.keyboardSelection({
        onEnter: studio.openJbEditProperty('%$jbEditorCntrData/selected%'),
        onRightClickOfExpanded: studio.openJbEditorMenu('%%', '%$path%'),
        autoFocus: true,
        applyMenuShortcuts: studio.jbEditorMenu('%%', '%$path%')
      }),
      tree.dragAndDrop(),
      css.width({width: '500', selector: 'jb-editor'}),
      studio.watchScriptChanges()
    ]
  })
})

jb.component('studio.jbEditor', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'main',
    layout: layout.horizontalFixedSplit({leftWidth: '350px', rightWidth: '100%'}),
    controls: [
      studio.jbEditorInteliTree('%$path%'),
      studio.probeDataView()
    ],
    features: [id('jbEditor'), css.padding('10'), css.height({height: '800', minMax: 'max'})]
  })
})

jb.component('studio.openJbEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'},
    {id: 'newWindow', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    vars: [
      Var('dialogId', {'$if': '%$newWindow%', then: '', else: 'jb-editor'}),
      Var('fromPath', '%$fromPath%')
    ],
    style: dialog.studioFloating({id: '%$dialogId%', width: '860', height: '100%'}),
    content: studio.jbEditor('%$path%'),
    menu: button({
      action: studio.openJbEditorMenu('%$path%', '%$path%'),
      style: button.mdcIcon('menu')
    }),
    title: studio.pathHyperlink('%$path%', 'Inteliscript'),
    features: [studio.jbEditorContainer('jb-editor'), dialogFeature.resizer()]
  })
})

jb.component('studio.openComponentInJbEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'}
  ],
  impl: runActions(
    Var('compPath', split({separator: '~', text: '%$path%', part: 'first'})),
    Var('fromPath', '%$fromPath%'),
    openDialog({
        style: dialog.studioFloating({id: 'jb-editor', width: '860', height: '100%'}),
        content: studio.jbEditor('%$compPath%'),
        menu: button({
          action: studio.openJbEditorMenu('%$jbEditorCntrData/selected%', '%$path%'),
          style: button.mdcIcon('menu')
        }),
        title: studio.pathHyperlink('%$compPath%', 'Inteliscript'),
        features: [studio.jbEditorContainer('comp-in-jb-editor'), dialogFeature.resizer()]
      })
  )
})

jb.component('studio.expandAndSelectFirstChildInJbEditor', {
  type: 'action',
  impl: ctx => {
    const jbEditorElem = document.querySelector('.jb-editor')
    if (!jbEditorElem) return
    const ctxOfTree = ctx.vars.$tree ? ctx : jb.ctxDictionary[jbEditorElem.getAttribute('jb-ctx')];
    const cmp = ctxOfTree.vars.$tree && ctxOfTree.vars.$tree.cmp;
    if (!cmp) return;
    const path = cmp.getSelected() || ctx.componentContext.params.path
    if (!path) return
    const firstChildPath = cmp.model.children(path)[0];
    if (firstChildPath) {
      cmp.selectionEmitter.next(firstChildPath)
      cmp.expandPath(firstChildPath)
    }
    cmp.regainFocus && cmp.regainFocus()
  }
})

jb.component('menu.studioWrapWith', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'type', as: 'string'},
    {id: 'components', as: 'array'}
  ],
  impl: menu.dynamicOptions(
    {
      '$if': studio.isOfType('%$path%', '%$type%'),
      then: '%$components%',
      else: list()
    },
    menu.action({
      title: 'Wrap with %%',
      action: runActions(
        studio.wrap('%$path%', '%%'),
        studio.expandAndSelectFirstChildInJbEditor()
      )
    })
  )
})

jb.component('menu.studioWrapWithArray', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: {
    '$if': studio.canWrapWithArray('%$path%'),
    then: menu.action({
      title: 'Wrap with array',
      action: runActions(
        studio.wrapWithArray('%$path%'),
        studio.expandAndSelectFirstChildInJbEditor()
      )
    }),
    else: []
  }
})

jb.component('studio.addVariable', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: onNextTimer(
    openDialog({
      id: 'add variable',
      style: dialog.popup(),
      content: group({
        controls: [
          editableText({
            title: 'variable name',
            databind: '%$dialogData/name%',
            style: editableText.mdcInput(),
            features: [
              feature.onEnter(
                writeValue(studio.ref('%$path%~%$dialogData/name%'), ''),
                dialog.closeContainingPopup(true),
                writeValue('%$jbEditorCntrData/selected%', '%$path%~%$dialogData/name%'),
                tree.redraw(true),
                tree.regainFocus()
              )
            ]
          })
        ],
        features: css.padding({top: '9', left: '20', right: '20'})
      }),
      title: 'New variable',
      modal: 'true',
      features: [
        css.width('300'),
        dialogFeature.nearLauncherPosition({}),
        dialogFeature.autoFocusOnFirstInput()
      ]
    })
  )
})

})()