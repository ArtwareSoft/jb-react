
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

component('studio.filePosOfPath', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
      const comp = path.split('~')[0]
      const loc = jb.comps[comp][jb.core.CT].location
      const fn = jb.studio.host.locationToPath(loc[0])
      const lineOfComp = (+loc[1]) || 0
      const pos = jb.tgpTextEditor.getPosOfPath(path,'profile') || [0,0,0,0]
      pos[0] += lineOfComp; pos[2] += lineOfComp
      return {path,comp,loc,fn, pos}
  }
})

component('studio.gotoSource', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'chromeDebugger', as: 'boolean', type: 'boolean'}
  ],
  impl: runActions(Var('filePos', studio.filePosOfPath('%$path%')), ({},{filePos},{chromeDebugger}) => {
      if (jb.frame.jbInvscode)
        jb.vscode['openEditor'](filePos)
      else if (chromeDebugger)
        parent.postMessage({ runProfile: {$: 'chromeDebugger.openResource', 
          location: [ jb.frame.location.origin + '/' + filePos.fn, filePos.pos[0], filePos.pos[1]] }})
      else
        fetch(`/?op=gotoSource&path=${filePos.fn}:${filePos.pos[0]}`)
  })
})

component('studio.editableSource', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'height', as: 'number'}
  ],
  impl: editableText({
    databind: tgp.profileAsText('%$path%'),
    style: editableText.codemirror({height: '%$height%'}),
    features: [
      codemirror.initTgpTextEditor(),
      css.height({height: '%$height%', minMax: 'max'}),
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
  impl: If('%$studio/vscode%', studio.gotoSource('%$path%'), openDialog({
    style: dialog.editSourceStyle({id: 'editor', width: 600}),
    content: studio.editableSource('%$path%'),
    title: tgp.shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  }))
})

component('studio.viewAllFiles', {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog.studioFloating({id: 'edit-source', width: 600}),
    content: group({
      title: 'project files',
      controls: [
        picklist({
          databind: '%$file%',
          options: picklist.options(keys('%$content/files%'))
        }),
        editableText({
          title: '',
          databind: property('%$file%', '%$content/files%'),
          style: editableText.studioCodemirrorTgp(),
          features: watchRef('%$file%')
        })
      ],
      features: [
        watchable('file', pipeline(studio.projectsDir(),'%%/%$studio/project%/index.html')),
        group.wait({
          for: ctx => jb.studio.projectUtils.projectContent(ctx),
          varName: 'content'
        })
      ]
    }),
    title: '%$studio/project% files',
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

component('studio.gotoEditorSecondary', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.action({
    vars: [
      Var(
        'baseComp',
        split({
          separator: '~',
          text: '%$path%',
          part: 'first'
        })
      ),
      Var(
        'shortBaseComp',
        split({
          separator: '>',
          text: '%$baseComp%',
          part: 'last'
        })
      )
    ],
    title: 'Goto editor: %$shortBaseComp%',
    action: studio.gotoSource('%$baseComp%'),
    showCondition: notEquals(tgp.compName('%$path%'), '%$baseComp%')
  })
})

component('studio.gotoEditorFirst', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.action({
    title: pipeline(tgp.shortCompName('%$path%'), 'Goto editor: %%'), 
    action: studio.gotoSource(tgp.compName('%$path%')),
    shortcut: 'Alt+E',
    showCondition: notEmpty(tgp.compName('%$path%'))
  })
})

component('studio.gotoEditorOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.endWithSeparator(
    [studio.gotoEditorFirst('%$path%'), studio.gotoEditorSecondary('%$path%')]
  )
})

component('studio.openEditProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch(
    Var(
      'pathType',
      split({
        separator: '~!',
        text: '%$path%',
        part: 'last'
      })
    ),
    Var(
      'actualPath',
      split({
        separator: '~!',
        text: '%$path%',
        part: 'first'
      })
    ),
    Var('parentPath', tgp.parentPath('%$actualPath%')),
    Var('paramDef', tgp.paramDef('%$actualPath%')),
    [
      action.switchCase(
        or(
          startsWith('obj-separator', '%$pathType%'),
          inGroup(list('close-profile', 'open-profile', 'open-by-value', 'close-by-value'), '%$pathType%')
        ),
        openDialog({
          content: sourceEditor.addProp('%$actualPath%'),
          style: dialog.studioJbEditorPopup(),
          features: [
            studio.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
        })
      ),
      action.switchCase(endsWith('$vars', '%$path%')),
      action.switchCase(
        '%$paramDef/options%',
        openDialog({
          content: group({
            controls: [
              studio.jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature.onEsc(dialog.closeDialog(true)),
              feature.onEnter(dialog.closeDialog(true))
            ]
          }),
          style: dialog.studioJbEditorPopup(),
          features: [
            studio.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
        })
      ),
      action.switchCase(
        tgp.isOfType('%$actualPath%', 'data,boolean'),
        runActions(
          Var('sugarArrayPath', sourceEditor.firstParamAsArrayPath('%$actualPath%')),
          Var(
            'index',
            data.switch(
              [
                data.case(equals('open-sugar', '%$pathType%'), 0),
                data.case(equals('close-sugar', '%$pathType%'), count(tgp.val('%$sugarArrayPath%')))
              ]
            )
          ),
          Var('actualPathHere', data.if(endsWith('-sugar', '%$pathType%'), '%$sugarArrayPath%~%$index%', '%$actualPath%')),
          action.if(
            endsWith('-sugar', '%$pathType%'),
            tgp.addArrayItem({
              path: '%$sugarArrayPath%',
              toAdd: '',
              index: '%$index%'
            })
          ),
          openDialog({
            content: studio.jbFloatingInput('%$actualPathHere%'),
            style: dialog.studioJbEditorPopup(),
            features: [
              dialogFeature.autoFocusOnFirstInput(),
              studio.nearLauncherPosition(),
              dialogFeature.onClose(
                runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), sourceEditor.refreshEditor())
              )
            ]
          })
        )
      ),
      action.switchCase(
        Var('ptsOfType', tgp.PTsOfType(tgp.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        runActions(tgp.setComp('%$path%', '%$ptsOfType[0]%'), sourceEditor.refreshEditor())
      ),
      action.switchCase(
        and(startsWith('open', '%$pathType%'), tgp.isArrayType('%$actualPath%')),
        studio.openNewProfileDialog({
          path: '%$actualPath%',
          type: tgp.paramType('%$actualPath%'),
          index: 0,
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~0')
        })
      ),
      action.switchCase(
        and(startsWith('close', '%$pathType%'), tgp.isArrayType('%$actualPath%')),
        studio.openNewProfileDialog({
          vars: [
            Var('length', count(tgp.val('%$actualPath%')))
          ],
          path: '%$actualPath%',
          type: tgp.paramType('%$actualPath%'),
          index: '%$length%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~%$length%')
        })
      ),
      action.switchCase(
        and(startsWith('array-separator', '%$pathType%'), tgp.isArrayType('%$actualPath%')),
        studio.openNewProfileDialog({
          vars: [
            Var('index', (ctx,{actualPath}) => +actualPath.split('~').pop()+1),
            Var('nextSiblingPath', pipeline(list('%$actualPath%', '%$index%'), join('~')))
          ],
          path: '%$actualPath%',
          type: tgp.paramType('%$actualPath%'),
          index: '%$index%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$nextSiblingPath%')
        })
      )
    ],
    studio.openNewProfileDialog({
      path: '%$actualPath%',
      type: tgp.paramType('%$actualPath%'),
      mode: 'update',
      onClose: sourceEditor.refreshEditor('%$actualPath%')
    })
  )
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
      editableText({
        title: pipeline(tgp.compName('%$path%'), '%% properties'),
        databind: '%$suggestionData/text%',
        style: editableText.floatingInput(),
        features: [
          feature.onKey(
            'Enter',
            runActions(
              dialog.closeDialogById('studio-jb-editor-popup'),
              studio.openEditProperty('%$path%~%$suggestionData/selected/id%'),
              true
            )
          ),
          // editableText.helperPopup({
          //   control: sourceEditor.suggestionsItemlist('%$path%'),
          //   popupId: 'suggestions',
          //   popupStyle: dialog.popup(),
          //   showHelper: true,
          //   autoOpen: true,
          //   onEsc: [dialog.closeDialogById('studio-jb-editor-popup'), popup.regainCanvasFocus()()]
          // })
        ]
      }),
      text({text: '', features: css('{border: 1px solid white;}')})
    ],
    features: [
      variable({
        name: 'suggestionData',
        value: {'$': 'object', selected: '', text: ''}
      }),
      css.padding({left: '4', right: '4'}),
      css.margin({top: '-20', selector: '>*:last-child'})
    ]
  })
})

component('sourceEditor.suggestionsItemlist', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
    items: sourceEditor.propOptions('%$path%'),
    controls: text({text: '%text%', features: [css.padding({left: '3', right: '2'})]}),
    features: [
      id('suggestions-itemlist'),
      itemlist.noContainer(),
      itemlist.selection({
        databind: '%$suggestionData/selected%',
        autoSelectFirst: true
      }),
      itemlist.keyboardSelection(false),
      css.height({height: '500', overflow: 'auto', minMax: 'max'}),
      css.width({width: '300', overflow: 'auto', minMax: 'min'}),
      css('{ position: absolute; z-index:1000; background: var(--jb-editor-background) }'),
      css.border({width: '1', color: '#cdcdcd'}),
      css.padding({top: '2', left: '3', selector: 'li'})
    ]
  })
})

component('sourceEditor.filesOfProject', {
  impl: '%$studio/projectSettings/jsFiles%'
})

component('studio.githubHelper', {
  type: 'action',
  impl: openDialog({
    style: dialog.studioFloating({id: 'github-helper', width: 600}),
    content: group({
      controls: [
        group({
          title: 'properties',
          layout: layout.flex({spacing: '100'}),
          controls: [
            editableText({title: 'github username', databind: '%$properties/username%'}),
            editableText({title: 'github repository', databind: '%$properties/repository%'})
          ]
        }),
        group({
          controls: [
            group({
              title: 'share urls',
              layout: layout.flex({justifyContent: 'flex-start', spacing: ''}),
              controls: [
                html({
                  title: 'share link',
                  html: '<a href=\"%$projectLink%\" target=\"_blank\" style=\"color:rgb(63,81,181)\">share link: %$projectLink%</a>',
                  features: css.width('350')
                }),
                html({
                  title: 'share with studio link',
                  html: '<a href=\"https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?host=github&hostProjectId=%$projectLink%\" target=\"_blank\"  style=\"color:rgb(63,81,181)\">share with studio link</a>'
                })
              ],
              features: [
                variable({
                  name: 'projectLink',
                  value: pipeline(
                    'https://%$properties/username%.github.io',
                    '%%/%$properties/repository%',
                    data.if(
                        equals('%$properties/repository%', '%$studio/project%'),
                        '%%',
                        '%%/%$studio/project%'
                      )
                  )
                }),
                css('>a { color:rgb(63,81,181) }')
              ]
            }),
            html({title: 'html', html: '<hr>'}),
            group({
              title: 'options',
              controls: [
                picklist({databind: '%$item%', options: picklist.options(keys('%$content%'))}),
                editableText({
                  databind: pipeline(
                    property('%$item%', '%$content%'),
                    replace({find: 'USERNAME', replace: '%$properties/username%'}),
                    replace({find: 'REPOSITORY', replace: '%$properties/repository%'})
                  ),
                  style: editableText.codemirror({mode: 'text'}),
                  features: [watchRef('%$item%')]
                })
              ],
              features: [
                watchable('item', 'new project'),
                variable({
                  name: 'content',
                  value: obj(
                    prop(
                        'new project',
                        `1) Create a new github repository
2) Open cmd at your project directory and run the following commands


git init
echo mode_modules > .gitignore
git add .
git config --global user.name "FIRST_NAME LAST_NAME"
git config --global user.email "MY_NAME@example.com"
git commit -am first-commit
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push origin master`
                      ),
                    prop(
                        'commit',
                        `Open cmd at your project directory and run the following commands

git add .
git commit -am COMMIT_REMARK
git push origin master

#explanation
git add -  mark all files to be handled by the local repository.
Needed only if you added new files
git commit - adds the changes to your local git repository
git push - copy the local repostiry to github's cloud repository`
                      )
                  ),
                  watchable: false
                })
              ]
            })
          ],
          features: watchRef({ref: '%$properties%', includeChildren: 'yes'})
        })
      ],
      features: watchable('properties',obj(prop('username', 'user1'), prop('repository', 'repo1'))),
    
    }),
    title: 'github helper',
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})
