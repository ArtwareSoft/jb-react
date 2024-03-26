component('sourceEditor.profileAsText', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'},
    {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: tgpTextEditor.watchableAsText(tgp.ref('%$path%'), '%$oneWay%')
})

component('sourceEditor.refreshEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>  ctx.vars.refreshEditor && ctx.vars.refreshEditor(path)
})

component('sourceEditor.propOptions', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>  {
    const val = jb.tgp.valOfPath(path) || {}
    return jb.tgp.paramsOfPath(path).filter(p=> val[p.id] === undefined)
      .map(param=> Object.assign(param,{ text: param.id }))
  }
})

component('sourceEditor.storeToRef', {
  type: 'action',
  impl: ctx => ctx.vars.editor && ctx.vars.editor() && ctx.vars.editor().storeToRef()
})

component('sourceEditor.firstParamAsArrayPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const params = jb.tgp.paramsOfPath(path)
    const singleParamAsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
    return singleParamAsArray ? path + '~' + params[0].id : path
  }
})

component('studio.editableSource', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'height', as: 'number'}
  ],
  impl: editableText({
    databind: sourceEditor.profileAsText('%$path%'),
    style: editableText.codemirror({ height: '%$height%' }),
    features: [
      codemirror.initTgpTextEditor(),
      css.height('%$height%', { minMax: 'max' }),
      feature.onKey('Ctrl-I', studio.openJbEditor('%$path%')),
      feature.onKey('Enter', studio.openEditProperty('%$cursorPath%'))
    ]
  })
})

component('studio.editSource', {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: If({
    condition: '%$studio/vscode%',
    then: tgpTextEditor.gotoSource('%$path%'),
    Else: openDialog(tgp.shortTitle('%$path%'), studio.editableSource('%$path%'), {
      style: dialog.editSourceStyle('editor', 600),
      features: [
        css('.jb-dialog-content-parent {overflow-y: hidden}'),
        dialogFeature.resizer(true)
      ]
    })
  })
})

component('studio.viewAllFiles', {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: {$: 'studio.currentProfilePath'}}
  ],
  impl: openDialog({
    title: '%$studio/project% files',
    content: group({
      controls: [
        picklist({ databind: '%$file%', options: picklist.options(keys('%$content/files%')) }),
        editableText('', property('%$file%', '%$content/files%', { useRef: true }), {
          style: editableText.studioCodemirrorTgp(),
          features: watchRef('%$file%')
        })
      ],
      title: 'project files',
      features: [
        watchable('file', pipeline(studio.projectsDir(), '%%/%$studio/project%/index.html')),
        group.wait(ctx => jb.studio.projectUtils.projectContent(ctx), { varName: 'content' })
      ]
    }),
    style: dialog.studioFloating('edit-source', 600),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

component('studio.gotoEditorSecondary', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: option({
    vars: [
      Var('baseComp', split('~', { text: '%$path%', part: 'first' })),
      Var('shortBaseComp', split('>', { text: '%$baseComp%', part: 'last' }))
    ],
    title: 'Goto editor: %$shortBaseComp%',
    action: tgpTextEditor.gotoSource('%$baseComp%'),
    showCondition: notEquals(tgp.compName('%$path%'), '%$baseComp%')
  })
})

component('studio.gotoEditorFirst', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: option({
    title: pipeline(tgp.shortCompName('%$path%'), 'Goto editor: %%'),
    action: tgpTextEditor.gotoSource(tgp.compName('%$path%')),
    shortcut: 'Alt+E',
    showCondition: notEmpty(tgp.compName('%$path%'))
  })
})

component('studio.gotoEditorOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.endWithSeparator(studio.gotoEditorFirst('%$path%'), {
    separator: studio.gotoEditorSecondary('%$path%')
  })
})

component('studio.openEditProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch({
    vars: [
      Var('pathType', split('~!', { text: '%$path%', part: 'last' })),
      Var('actualPath', split('~!', { text: '%$path%', part: 'first' })),
      Var('parentPath', tgp.parentPath('%$actualPath%')),
      Var('paramDef', tgp.paramDef('%$actualPath%'))
    ],
    cases: [
      action.switchCase({
        condition: or(
          startsWith('obj-separator', { text: '%$pathType%' }),
          inGroup(list('close-profile','open-profile','open-by-value','close-by-value'), '%$pathType%')
        ),
        action: openDialog({
          content: sourceEditor.addProp('%$actualPath%'),
          style: dialog.studioJbEditorPopup(),
          features: [
            studio.nearLauncherPosition(),
            autoFocusOnFirstInput(),
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
        })
      }),
      action.switchCase(endsWith('$vars', '%$path%')),
      action.switchCase('%$paramDef/options%', openDialog({
        content: group(studio.jbFloatingInputRich('%$actualPath%'), {
          features: [
            feature.onEsc(dialog.closeDialog(true)),
            feature.onEnter(dialog.closeDialog(true))
          ]
        }),
        style: dialog.studioJbEditorPopup(),
        features: [
          studio.nearLauncherPosition(),
          autoFocusOnFirstInput(),
          dialogFeature.onClose(sourceEditor.refreshEditor())
        ]
      })),
      action.switchCase(tgp.isOfType('%$actualPath%', 'data,boolean'), runActions(
        openDialog({
          content: studio.jbFloatingInput('%$actualPathHere%'),
          style: dialog.studioJbEditorPopup(),
          features: [
            autoFocusOnFirstInput(),
            studio.nearLauncherPosition(),
            dialogFeature.onClose(runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), sourceEditor.refreshEditor()))
          ]
        })
      )),
      action.switchCase({
        vars: [
          Var('ptsOfType', tgp.PTsOfType(tgp.paramType('%$actualPath%')))
        ],
        condition: '%$ptsOfType/length% == 1',
        action: runActions(tgp.setComp('%$path%', '%$ptsOfType[0]%'), sourceEditor.refreshEditor())
      }),
      action.switchCase({
        condition: and(startsWith('open', { text: '%$pathType%' }), tgp.isArrayType('%$actualPath%')),
        action: studio.openNewProfileDialog('%$actualPath%', tgp.paramType('%$actualPath%'), {
          index: 0,
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~0')
        })
      }),
      action.switchCase({
        condition: and(startsWith('close', { text: '%$pathType%' }), tgp.isArrayType('%$actualPath%')),
        action: studio.openNewProfileDialog({
          vars: [
            Var('length', count(tgp.val('%$actualPath%')))
          ],
          path: '%$actualPath%',
          type: tgp.paramType('%$actualPath%'),
          index: '%$length%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~%$length%')
        })
      }),
      action.switchCase({
        condition: and(startsWith('array-separator', { text: '%$pathType%' }), tgp.isArrayType('%$actualPath%')),
        action: studio.openNewProfileDialog({
          vars: [
            Var('index', (ctx,{actualPath}) => +actualPath.split('~').pop()+1),
            Var('nextSiblingPath', pipeline(list('%$actualPath%','%$index%'), join('~')))
          ],
          path: '%$actualPath%',
          type: tgp.paramType('%$actualPath%'),
          index: '%$index%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$nextSiblingPath%')
        })
      })
    ],
    defaultAction: studio.openNewProfileDialog('%$actualPath%', tgp.paramType('%$actualPath%'), {
      mode: 'update',
      onClose: sourceEditor.refreshEditor('%$actualPath%')
    })
  })
})

// jb.component('sourceEditor.suggestions', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: If(
//     Var('pathType', split({separator: '~!', text: '%$path%', part: 'last'})),
//     Var('actualPath', split({separator: '~!', text: '%$path%', part: 'first'})),
//     Var('paramDef', tgp.paramDef('%$actualPath%')),
//     or(
//       startsWith('obj-separator', '%$pathType%'),
//       inGroup(
//           list('close-profile', 'open-profile', 'open-by-value', 'close-by-value'),
//           '%$pathType%'
//         )
//     ),
//     pipeline(tgp.paramsOfPath('%$actualPath%'), '%id%'),
//     If(
//       '%$paramDef/options%',
//       split({separator: ',', text: '%$paramDef/options%', part: 'all'}),
//       tgp.PTsOfType(firstSucceeding('%$paramDef/type%', 'data'))
//     )
//   )
// })

component('sourceEditor.addProp', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      editableText(pipeline(tgp.compName('%$path%'), '%% properties'), '%$suggestionData/text%', {
        style: editableText.floatingInput(),
        features: [
          feature.onKey('Enter', runActions(
            dialog.closeDialogById('studio-jb-editor-popup'),
            studio.openEditProperty('%$path%~%$suggestionData/selected/id%'),
            true
          ))
        ]
      }),
      text('', { features: css('{border: 1px solid white;}') })
    ],
    features: [
      variable('suggestionData', {'$': 'object', selected: '', text: ''}),
      css.padding({ left: '4', right: '4' }),
      css.margin('-20', { selector: '>*:last-child' })
    ]
  })
})

component('sourceEditor.suggestionsItemlist', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
    items: sourceEditor.propOptions('%$path%'),
    controls: text('%text%', { features: [css.padding({ left: '3', right: '2' })] }),
    features: [
      id('suggestions-itemlist'),
      itemlist.noContainer(),
      itemlist.selection('%$suggestionData/selected%', { autoSelectFirst: true }),
      itemlist.keyboardSelection(false),
      css.height('500', 'auto', { minMax: 'max' }),
      css.width('300', 'auto', { minMax: 'min' }),
      css('{ position: absolute; z-index:1000; background: var(--jb-editor-background) }'),
      css.border('1', { color: '#cdcdcd' }),
      css.padding('2', '3', { selector: 'li' })
    ]
  })
})

component('sourceEditor.filesOfProject', {
  impl: '%$studio/projectSettings/jsFiles%'
})

component('studio.githubHelper', {
  type: 'action',
  impl: openDialog({
    title: 'github helper',
    content: group({
      controls: [
        group({
          controls: [
            editableText('github username', '%$properties/username%'),
            editableText('github repository', '%$properties/repository%')
          ],
          title: 'properties',
          layout: layout.flex({ spacing: '100' })
        }),
        group({
          controls: [
            group({
              controls: [
                html({
                  html: '<a href="%$projectLink%" target="_blank" style="color:rgb(63,81,181)">share link: %$projectLink%</a>',
                  title: 'share link',
                  features: css.width('350')
                }),
                html({
                  html: '<a href="https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?host=github&hostProjectId=%$projectLink%" target="_blank"  style="color:rgb(63,81,181)">share with studio link</a>',
                  title: 'share with studio link'
                })
              ],
              title: 'share urls',
              layout: layout.flex({ justifyContent: 'flex-start', spacing: '' }),
              features: [
                variable('projectLink', pipeline(
                  'https://%$properties/username%.github.io',
                  '%%/%$properties/repository%',
                  If(equals('%$properties/repository%', '%$studio/project%'), '%%', '%%/%$studio/project%')
                )),
                css('>a { color:rgb(63,81,181) }')
              ]
            }),
            html('<hr>', 'html'),
            group({
              controls: [
                picklist({ databind: '%$item%', options: picklist.options(keys('%$content%')) }),
                editableText({
                  databind: pipeline(
                    property('%$item%', '%$content%'),
                    replace('USERNAME', '%$properties/username%'),
                    replace('REPOSITORY', '%$properties/repository%')
                  ),
                  style: editableText.codemirror({ mode: 'text' }),
                  features: [watchRef('%$item%')]
                })
              ],
              title: 'options',
              features: [
                watchable('item', 'new project'),
                variable('content', obj(
                  prop({
                    name: 'new project',
                    val: `1) Create a new github repository
2) Open cmd at your project directory and run the following commands


git init
echo mode_modules > .gitignore
git add .
git config --global user.name "FIRST_NAME LAST_NAME"
git config --global user.email "MY_NAME@example.com"
git commit -am first-commit
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push origin master`
                  }),
                  prop({
                    name: 'commit',
                    val: `Open cmd at your project directory and run the following commands

git add .
git commit -am COMMIT_REMARK
git push origin master

#explanation
git add -  mark all files to be handled by the local repository.
Needed only if you added new files
git commit - adds the changes to your local git repository
git push - copy the local repostiry to github's cloud repository`
                  })
                ))
              ]
            })
          ],
          features: watchRef('%$properties%', 'yes')
        })
      ],
      features: watchable('properties', obj(prop('username', 'user1'), prop('repository', 'repo1')))
    }),
    style: dialog.studioFloating('github-helper', 600),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

component('codemirror.initTgpTextEditor', {
  type: 'feature',
  impl: features(
    codemirror.enrichUserEvent(),
    frontEnd.method('replaceRange', ({data},{cmp}) => {
        const {text, from, to} = data
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = jb.tgpTextEditor.lineColToOffset(cmp.base.value,to)
        cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
    }),
    frontEnd.method('setSelectionRange', ({data},{cmp}) => {
        const from = data.from || data
        const to = data.to || from
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = to && jb.tgpTextEditor.lineColToOffset(cmp.base.value,to) || _from
        cmp.base.setSelectionRange(_from,_to)
    }),
    frontEnd.flow(
      source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('cursorActivity', 
        () => obs(cmp.editor.getDoc().getCursor())))),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.debounceTime('%$debounceTime%'),
      sink.BEMethod('selectionChanged', '%%')
    ),
    frontEnd.flow(
      source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('change', () => obs(cmp.editor.getValue())))),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.debounceTime('%$debounceTime%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('contentChanged', '%%')
    )
  )
})

