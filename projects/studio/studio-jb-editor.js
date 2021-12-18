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
      group({
        controls: studio.probeDataView(),
        features: [feature.if(not('%$studio/hideProbe%')), watchRef('%$studio/hideProbe%')]
      })
    ],
    features: [id('jbEditor'), css.padding('10'), css.height({height: '800', minMax: 'max'})]
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
      action.switchCase(ctx => 
        console.log('open property', ctx.run({$: 'studio.isOfType', path: '%$actualPath%', type: 'data,boolean'}), ctx)),
      action.switchCase(endsWith('$vars', '%$path%'), studio.addVariable('%$path%')),
      action.switchCase(
        '%$paramDef/options%',
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: group({
            controls: [
              studio.jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature.onEsc(dialog.closeDialog(true)),
              feature.onEnter(
                dialog.closeDialog(true),
                tree.regainFocus(),
                mutable.toggleBooleanValue('%$studio/refreshProbe%')
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
        isOfType('function', tgp.val('%$actualPath%')),
        studio.editSource('%$actualPath%')
      ),
      action.switchCase(
        studio.isOfType('%$actualPath%', 'data,boolean'),
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: studio.jbFloatingInput('%$actualPath%'),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(mutable.toggleBooleanValue('%$studio/refreshProbe%'))
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
    style: tree.expandBox({showIcon: true, lineWidth: '800px'}),
    features: [
      css.class('jb-editor'),
      tree.selection({
        databind: '%$studio/jbEditor/selected%',
        autoSelectFirst: true,
        onRightClick: studio.openJbEditorMenu('%%', '%$path%')
      }),
      tree.keyboardSelection({
        onEnter: studio.openJbEditProperty('%$studio/jbEditor/selected%'),
        onRightClickOfExpanded: studio.openJbEditorMenu('%%', '%$path%'),
        autoFocus: true,
        applyMenuShortcuts: studio.jbEditorMenu('%%', '%$path%')
      }),
      tree.dragAndDrop(),
      css.width({width: '500', selector: 'jb-editor'}),
      studio.watchPath({
        path: '%$path%',
        includeChildren: 'yes',
        allowSelfRefresh: true
      }),
      watchRef('%$studio/jbEditor/selected%')
    ]
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
          action: studio.openJbEditorMenu('%$studio/jbEditor/selected%', '%$path%'),
          style: button.mdcIcon('menu')
        }),
        title: studio.pathHyperlink('%$compPath%', 'Inteliscript'),
        features: dialogFeature.resizer()
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
    const path = cmp.getSelected() || ctx.cmpCtx.params.path
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
    If(studio.isOfType('%$path%', '%$type%'),'%$components%',list()),
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
  impl: If(studio.canWrapWithArray('%$path%'),
    menu.action({
      title: 'Wrap with array',
      action: runActions(
        studio.wrapWithArray('%$path%'),
        studio.expandAndSelectFirstChildInJbEditor()
      )
    }),[])
})

jb.component('studio.addVariable', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: //onNextTimer(
    openDialog({
      title: 'New variable',
      content: group({
        controls: [
          editableText({
            title: 'variable name',
            databind: '%$dialogData/name%',
            style: editableText.mdcInput(),
            features: [
              feature.onEnter(
                runActions(
                  addToArray(studio.ref('%$path%'), obj(prop('$','Var'),prop('name','%$dialogData/name%'),prop('value',''))),
                  dialog.closeDialog(),
                  tree.regainFocus()
                )
              )
            ]
          })
        ],
        features: css.padding({
          top: '9',
          left: '20',
          right: '20'
        })
      }),
      style: dialog.popup(),
      id: 'add variable',
      features: [css.width('300'), dialogFeature.nearLauncherPosition(), dialogFeature.autoFocusOnFirstInput()]
    })
//  )
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
      Var('dialogId', If('%$newWindow%','','jb-editor')),
      Var('fromPath', '%$fromPath%')
    ],
    style: dialog.studioFloating({id: '%$dialogId%', width: '860', height: '100%'}),
    content: studio.jbEditor('%$path%'),
    menu: button({
      action: studio.openJbEditorMenu('%$path%', '%$path%'),
      style: button.mdcIcon('menu')
    }),
    title: studio.pathHyperlink('%$path%', 'Inteliscript'),
    features: dialogFeature.resizer()
  })
})

jb.component('studio.jbEditorPathForEdit', {
  type: 'data',
  description: 'in case of array, use extra element path',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const ar = jb.studio.valOfPath(path)
    return Array.isArray(ar) ? path + '~' + ar.length : path
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

