jb.component('studio.new-in-memory-project', { 
  params: [
    {id: 'project', as: 'string'},
    {id: 'baseDir', as: 'string'}
  ],
  impl: obj(
    prop('project','%$project%'),
    prop('baseDir','%$baseDir%'),
    prop('files', obj(prop('%$project%.html', `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
<!-- start-jb-scripts -->
<!-- load-jb-scripts-here -->
<!-- end-jb-scripts -->
</head>
<body>
  <div id="main"> </div>
  <script>
    jb.ui.renderWidget({$:'%$project%.main'},document.getElementById('main'))
  </script>
</body>
</html>`),
  prop('%$project%.js',`jb.component('%$project%.main', { 
  type: 'control',
  impl: group({
    controls: [button('my button')]
  })
})
//# sourceURL=%$project%.js}`)), 'object'),
  prop('libs',list('material'),'array')
)
})

jb.component('studio.open-new-project', { /* studio.openNewProject */ 
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: group({
      style: group.div(),
      controls: [
        editableText({
          title: 'project name',
          databind: '%$name%',
          style: editableText.mdlInput(),
          features: [
              feature.onEnter(dialog.closeContainingPopup()),
              validation(matchRegex('^[a-zA-Z_0-9]+$'),'illegal project name')
          ]
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Project',
    onOK: runActions(
      ctx => jb.studio.inMemoryProject = ctx.run(studio.newInMemoryProject('%$name%')),
      writeValue('%$studio/project%','%$name%'),
      writeValue('%$studio/page%','main'),
      writeValue('%$studio/profile_path%','%$name%.main'),
      delay(100),
      ctx => jb.studio.host.canNotSave || ctx.run(studio.saveComponents())
    ),
    modal: true,
    features: [
      variable({name: 'name', watchable: true}),
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'})
    ]
  })
})
