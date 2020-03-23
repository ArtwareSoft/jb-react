jb.component('studio.newProject', {
  params: [
    {id: 'project', as: 'string'},
    {id: 'baseDir', as: 'string'}
  ],
  impl: obj(
    prop('project','%$project%'),
    prop('baseDir','%$baseDir%'),
    prop('files', obj(prop('index.html', `<!DOCTYPE html>
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
`)), 'object'),
)
})

//# sourceURL=%$project%.js

jb.component('studio.openNewProject', {
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
            validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')
          ]
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Project',
    onOK: runActions(
      Var('project','%$dialogData/name%'),
      studio.saveNewProject('%$project%'),
      writeValue('%$studio/project%', '%$project%'),
      writeValue('%$studio/page%', 'main'),
      writeValue('%$studio/profile_path%', studio.currentPagePath()),
      () => location.reload()
    ),
    modal: true,
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'})
    ]
  })
})

jb.component('studio.saveNewProject', {
  type: 'action,has-side-effects',
  params: [
    { id: 'project', as: 'string' }
  ],
  impl: (ctx,project) => {
    const {files, baseDir} = ctx.run(studio.newProject(()=> project))
    return jb.studio.host.createProject({project, files, baseDir})
        .then(r => r.json())
        .catch(e => {
          jb.studio.message(`error saving project ${project}: ` + (e && e.desc));
          jb.logException(e,'',ctx)
        })
        .then(res=>{
          if (res.type == 'error')
              return jb.studio.message(`error saving project ${project}: ` + (res && jb.prettyPrint(res.desc)));
        })
  }
})