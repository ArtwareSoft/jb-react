jb.component('studio.new-project', {
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="text/javascript">
  jbProjectSettings = {
    project: '%$project%',
    libs: 'common,ui-common,material',
    jsFiles: ['%$project%.js'],
  }
  </script>
  <script type="text/javascript" src="/src/loader/jb-loader.js"></script>
</head>
<body>
  <script>
    window.jb_initWidget && jb_initWidget()
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
      writeValue(
          '%$studio/projectSettings%',
          {
            '$': 'object',
            project: '%$dialogData/name%',
            libs: 'common,ui-common,material',
            jsFiles: ['%$dialogData/name%.js']
          }
        ),
      studio.newProject('%$dialogData/name%'),
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
