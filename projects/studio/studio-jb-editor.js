(function() {
const st = jb.studio
jb.studio.probeResultCustomizers = []

jb.component('studio.jb-editor-path-for-edit',  /* studio_jbEditorPathForEdit */ {
  type: 'data',
  description: 'in case of array, use extra element path',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    var ar = jb.studio.valOfPath(path);
    if (Array.isArray(ar))
      return path + '~' + ar.length;
    return path;
  }
})

jb.component('studio.open-jb-editor-menu',  /* studio_openJbEditorMenu */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'root', as: 'string'}
  ],
  impl: menu_openContextMenu({
    menu: {$: 'studio.jb-editor-menu', path: '%$path%', root: '%$root%', $recursive: true},
    features: dialogFeature_onClose(tree_regainFocus())
  })
})

jb.component('studio.prob-result-customization',  /* studio_probResultCustomization */ {
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

jb.component('studio.jb-editor-container',  /* studio_jbEditorContainer */ {
  type: 'feature',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'initialSelection', as: 'string', defaultValue: '%$path%'},
    {
      id: 'circuit',
      as: 'single',
      description: 'path or ctx of circuit to run the probe'
    }
  ],
  impl: list(
    variable({
      name: 'jbEditorCntrData',
      value: {$: 'object', selected: '%$initialSelection%', circuit: '%$circuit%'},
      mutable: true
    })
  )
})

jb.component('studio.probe-results',  /* studio_probeResults */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) => jb.delay(300).then(_ => {
    const inCtx = st.closestCtxByPath(path) || new jb.jbCtx()
    return [{in: inCtx.data, out: st.isOfType(path,'action') ? null : inCtx.runItself()}]
  })
})

jb.component('studio.data-browse',  /* studio_dataBrowse */ {
  type: 'control',
  params: [
    {id: 'obj', mandatory: true, defaultValue: '%%'},
    {id: 'title', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 200}
  ],
  impl: group({
    title: '%$title%',
    controls: group({
      controls: [
        control_firstSucceeding(
          [
            controlWithCondition(
              inGroup(list('JbComponent', 'jbCtx'), className('%$obj%')),
              label({title: className('%$obj%')})
            ),
            controlWithCondition(isOfType('string,boolean,number', '%$obj%'), label('%$obj%')),
            controlWithCondition(
              isOfType('array', '%$obj%'),
              table({
                items: pipeline('%$obj%', slice(undefined, '%$maxItems%')),
                fields: field_control({
                  title: pipeline(count('%$obj%'), '%% items'),
                  control: {$: 'studio.data-browse', a: 'label', obj: '%%', width: 200, $recursive: true}
                }),
                style: table_mdl(
                  'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
                  'mdl-data-table__cell--non-numeric'
                ),
                features: [watchRef('%$maxItems%')]
              })
            ),
            controlWithCondition(isNull('%$obj%'), label('null')),
            tree({
              nodeModel: tree_jsonReadOnly('%$obj%', '%$title%'),
              style: tree_noHead(),
              features: [
                css_class('jb-control-tree'),
                tree_selection({}),
                tree_keyboardSelection({}),
                css_width({width: '%$width%', minMax: 'max'})
              ]
            })
          ]
        ),
        controlWithCondition(
          and('%$obj/length% > 100', isOfType('string', '%$obj%')),
          button({
            title: 'open (%$obj/length%)',
            action: openDialog({
              style: dialog_popup(),
              content: editableText({
                title: '',
                databind: '%$obj%',
                style: editableText_codemirror({
                  enableFullScreen: true,
                  height: '200',
                  mode: 'text',
                  debounceTime: 300,
                  lineNumbers: true,
                  readOnly: true
                })
              })
            }),
            style: button_href()
          }),
          'long text'
        ),
        controlWithCondition(
          and('%$obj/length% > 5', isOfType('array', '%$obj%'), '%$maxItems% == 5'),
          button({
            title: 'show (%$obj/length%)',
            action: writeValue('%$maxItems%', '100'),
            style: button_href(),
            features: [watchRef('%$maxItems%'), hidden('%$maxItems% == 5')]
          }),
          'large array'
        )
      ],
      features: [variable({name: 'maxItems', value: '5', mutable: 'true'})]
    })
  })
})

jb.component('studio.probe-data-view',  /* studio_probeDataView */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      table({
        items: '%$probeResult%',
        fields: [
          field_control({title: 'last in', control: studio_dataBrowse('%in%'), width: '100'}),
          field_control({title: 'out', control: studio_dataBrowse('%out%'), width: '100'})
        ],
        style: table_mdl('mdl-data-table', 'mdl-data-table__cell--non-numeric'),
        features: [css('{white-space: normal}')]
      })
    ],
    features: [
      group_wait({
        for: studio_probeResults('%$path%'),
        loadingControl: label('...'),
        varName: 'probeResult'
      })
    ]
  })
})

jb.component('studio.open-jb-edit-property',  /* studio_openJbEditProperty */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action_switch(
    Var('actualPath', studio_jbEditorPathForEdit('%$path%')),
    Var('paramDef', studio_paramDef('%$actualPath%')),
    [
      action_switchCase(endsWith('$vars', '%$path%')),
      action_switchCase(
        '%$paramDef/options%',
        openDialog({
          style: dialog_studioJbEditorPopup(),
          content: group({
            controls: [
              studio_jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature_onEsc(dialog_closeContainingPopup(true)),
              feature_onEnter(dialog_closeContainingPopup(true), tree_regainFocus())
            ]
          }),
          features: [dialogFeature_autoFocusOnFirstInput(), dialogFeature_onClose(tree_regainFocus())]
        })
      ),
      action_switchCase(
        isOfType('function', studio_val('%$actualPath%')),
        studio_editSource('%$actualPath%')
      ),
      action_switchCase(
        studio_isOfType('%$actualPath%', 'data,boolean'),
        openDialog({
          style: dialog_studioJbEditorPopup(),
          content: studio_jbFloatingInput('%$actualPath%'),
          features: [
            dialogFeature_autoFocusOnFirstInput(),
            dialogFeature_onClose(
              runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), tree_regainFocus())
            )
          ]
        })
      ),
      action_switchCase(
        Var('ptsOfType', studio_PTsOfType(studio_paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        studio_setComp('%$path%', '%$ptsOfType[0]%')
      )
    ],
    studio_openNewProfileDialog({
      path: '%$actualPath%',
      type: studio_paramType('%$actualPath%'),
      mode: 'update',
      onClose: tree_regainFocus()
    })
  )
})

jb.component('studio.jb-editor-inteli-tree',  /* studio_jbEditorInteliTree */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'main',
    style: layout_horizontalFixedSplit({leftWidth: '350', rightWidth: '500', spacing: 3}),
    controls: [
      tree({
        nodeModel: studio_jbEditor_nodes('%$path%'),
        features: [
          css_class('jb-editor jb-control-tree'),
          tree_selection({
            databind: '%$jbEditorCntrData/selected%',
            autoSelectFirst: true,
            onRightClick: studio_openJbEditorMenu('%%', '%$path%')
          }),
          tree_keyboardSelection({
            onEnter: studio_openJbEditProperty('%$jbEditorCntrData/selected%'),
            onRightClickOfExpanded: studio_openJbEditorMenu('%%', '%$path%'),
            autoFocus: true,
            applyMenuShortcuts: {$: 'studio.jb-editor-menu', path: '%%', root: '%$path%', $recursive: true}
          }),
          tree_dragAndDrop(),
          css_width({width: '500', selector: 'jb-editor'}),
          studio_watchScriptChanges()
        ]
      })
    ]
  })
})

jb.component('studio.jb-editor',  /* studio_jbEditor */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'main',
    style: layout_horizontalFixedSplit({leftWidth: '350', rightWidth: '500', spacing: 3}),
    controls: [
      studio_jbEditorInteliTree('%$path%'),
      group({
        title: 'inteli preview',
        controls: [
          group({
            title: 'hide if selection empty',
            controls: [
              group({
                title: 'watch selection content',
                controls: studio_probeDataView('%$jbEditorCntrData/selected%'),
                features: watchRef({ref: studio_ref('%$jbEditorCntrData/selected%')})
              })
            ],
            features: feature_if('%$jbEditorCntrData/selected%')
          })
        ],
        features: [watchRef('%$jbEditorCntrData/selected%'), studio_watchScriptChanges()]
      })
    ],
    features: [css_padding('10'), css_height({height: '800', minMax: 'max'})]
  })
})

jb.component('studio.open-jb-editor',  /* studio_openJbEditor */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'},
    {id: 'newWindow', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    vars: [
      Var('dialogId', {$if: '%$newWindow%', then: '', else: 'jb-editor'}),
      Var('fromPath', '%$fromPath%'),
      Var('pickSelection', {$: 'object'})
    ],
    style: dialog_studioFloating({id: '%$dialogId%', width: '860', height: '400'}),
    content: studio_jbEditor('%$path%'),
    menu: button({
      action: studio_openJbEditorMenu('%$path%', '%$path%'),
      style: button_mdlIcon('menu')
    }),
    title :{$: 'studio.path-hyperlink', path: '%$path%', prefix: 'Inteliscript', $recursive: true},
    features: [studio_jbEditorContainer('jb-editor'), dialogFeature_resizer()]
  })
})

jb.component('studio.open-component-in-jb-editor',  /* studio_openComponentInJbEditor */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'}
  ],
  impl: runActions(
    Var('compPath', split({separator: '~', text: '%$path%', part: 'first'})),
    Var('fromPath', '%$fromPath%'),
    Var('pickSelection', {$: 'object'}),
    openDialog({
      style: dialog_studioFloating({id: 'jb-editor', width: '860', height: '400'}),
      content: studio_jbEditor('%$compPath%'),
      menu: button({
        action: studio_openJbEditorMenu('%$jbEditorCntrData/selected%', '%$path%'),
        style: button_mdlIcon('menu')
      }),
      title :{$: 'studio.path-hyperlink', path: '%$compPath%', prefix: 'Inteliscript', $recursive: true},
      features: [studio_jbEditorContainer('comp-in-jb-editor'), dialogFeature_resizer()]
    })
  )
})

jb.component('studio.expand-and-select-first-child-in-jb-editor',  /* studio_expandAndSelectFirstChildInJbEditor */ {
  type: 'action',
  impl: ctx => {
    var ctxOfTree = ctx.vars.$tree ? ctx : jb.ctxDictionary[document.querySelector('.jb-editor').getAttribute('jb-ctx')];
    var tree = ctxOfTree.vars.$tree;
    if (!tree) return;
    tree.expanded[tree.selected] = true;
    jb.delay(100).then(()=>{
      var firstChild = tree.nodeModel.children(tree.selected)[0];
      if (firstChild) {
        tree.selectionEmitter.next(firstChild);
        tree.regainFocus && tree.regainFocus();
//        jb_ui.apply(ctx);
//        jb.delay(100);
      }
    })
  }
})

jb.component('menu.studio-wrap-with',  /* menu_studioWrapWith */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'type', as: 'string'},
    {id: 'components', as: 'array'}
  ],
  impl: menu_dynamicOptions(
    {$if: studio_isOfType('%$path%', '%$type%'), then: '%$components%', else: list()},
    menu_action({
      title: 'Wrap with %%',
      action: [studio_wrap('%$path%', '%%'), studio_expandAndSelectFirstChildInJbEditor()]
    })
  )
})

jb.component('menu.studio-wrap-with-array',  /* menu_studioWrapWithArray */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: {
    $if: studio_canWrapWithArray('%$path%'),
    then: menu_action({
      title: 'Wrap with array',
      action: [studio_wrapWithArray('%$path%'), studio_expandAndSelectFirstChildInJbEditor()]
    }),
    else: []
  }
})

jb.component('studio.add-variable',  /* studio_addVariable */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: onNextTimer(
    openDialog({
      id: 'add variable',
      style: dialog_popup(),
      content: group({
        controls: [
          editableText({
            title: 'variable name',
            databind: '%$name%',
            style: editableText_mdlInput(),
            features: [
              feature_onEnter(
                writeValue(studio_ref('%$path%~%$name%'), ''),
                dialog_closeContainingPopup(true),
                writeValue('%$jbEditorCntrData/selected%', '%$path%~%$name%'),
                tree_redraw(true),
                tree_regainFocus()
              )
            ]
          })
        ],
        features: css_padding({top: '9', left: '20', right: '20'})
      }),
      title: 'New variable',
      modal: 'true',
      features: [
        variable({name: 'name', mutable: true}),
        dialogFeature_nearLauncherPosition({}),
        dialogFeature_autoFocusOnFirstInput()
      ]
    })
  )
})

})()