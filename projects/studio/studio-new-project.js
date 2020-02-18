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
  <link rel="icon" type="image/png" href="//unpkg.com/jb-react@0.5.4/bin/studio/css/favicon.png" />
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
  prop('%$project%.js',`jb.ns('%$project%')

jb.component('%$project%.main', {
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
          databind: '%$dialogData/name%',
          style: editableText.mdcInput(),
          features: [
            feature.onEnter(dialog.closeContainingPopup()),
            validation(matchRegex('^[-a-zA-Z_0-9]+$'), 'invalid project name')
          ]
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Project',
    onOK: runActions(
      ctx => jb.studio.inMemoryProject = ctx.run(studio.newInMemoryProject('%$dialogData/name%')),
      writeValue('%$studio/project%', '%$dialogData/name%'),
      writeValue('%$studio/page%', 'main'),
      writeValue('%$studio/profile_path%', '%$dialogData/name%.main'),
      delay(100),
      ctx => jb.studio.host.canNotSave || ctx.run(studio.saveComponents())
    ),
    modal: true,
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'})
    ]
  })
})
