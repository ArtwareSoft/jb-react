jb.component('studio.newProject', {
  params: [
    {id: 'project', as: 'string'},
    {id: 'type', as: 'string', options: 'material,puppeteer'}
  ],
  impl: obj(
    prop('project','%$project%'),
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

/* //# sourceURL=%$project%.js */

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
          style: editableText.mdcInput('280'),
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
      Var('project', '%$dialogData/name%'),
      Var('mainFileName', pipeline(studio.projectsBaseDir(),'%%/%$project%/%$project%.js')),
      studio.saveNewProject('%$project%'),
      writeValue('%$studio/project%', '%$project%'),
      writeValue('%$studio/projectFolder%', '%$project%'),
      writeValue('%$studio/page%', '%$project%.main'),
      writeValue('%$studio/profile_path%', studio.currentPagePath()),
      studio.reOpenStudio('%$mainFileName%',5)
    ),
    modal: true,
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'}),
      dialogFeature.dragTitle('newProject')
    ]
  })
})

jb.component('studio.reOpenStudio', {
  params:[
    {id: 'fileName', as: 'string'},
    {id: 'line', as: 'number'},
  ],
  impl: (ctx,fn,line) => jb.studio.host.reOpenStudio(fn,line)
})


jb.component('studio.createProjectFile', {
  type: 'action,has-side-effects',
  params: [
    { id: 'fileName', as: 'string' },
  ],
  impl: runActions(
    (ctx,{},{fileName}) => jb.studio.host.createDirectoryWithFiles({
      override: true,
      project: ctx.exp('%$studio/project%'), 
      files: {[fileName]: ''}, 
      baseDir: ctx.run(studio.projectBaseDir())
    }),
    addToArray('%$studio/projectSettings/jsFiles%','%$fileName%'),
    studio.saveProjectSettings()
  )
})

jb.component('studio.projectBaseDir', {
  impl: ctx => jb.studio.host.locationToPath(
      (jb.frame.jbBaseProjUrl || '') + jb.studio.host.pathOfJsFile(ctx.exp('%$studio/project%'), ''))
  .split('/').slice(0,-1).join('/').slice(1)
})

jb.component('studio.projectsBaseDir', {
  impl: ctx => jb.studio.host.locationToPath(
      (jb.frame.jbBaseProjUrl || '') + jb.studio.host.pathOfJsFile('', ''))
  .split('/').slice(0,-2).join('/').slice(1)
})


jb.component('studio.saveNewProject', {
  type: 'action,has-side-effects',
  params: [
    { id: 'project', as: 'string' }
  ],
  impl: (ctx,project) => {
    const {files} = ctx.run(studio.newProject(()=> project))
    const st = jb.studio
    return jb.studio.host.createDirectoryWithFiles({project, files, baseDir: ctx.run(studio.projectsBaseDir()) + `/${project}` })
        .then(r => r.json ? r.json() : r)
        .catch(e => {
          st.host.showError(`error saving project ${project}: ` + (e && e.desc))
          jb.logException(e,'',ctx)
        })
        .then(res => {
          res && res.type == 'error' && st.host.showError(`error saving project ${project}: ` + (res && jb.prettyPrint(res.desc)))
          res && res.type == 'success' && st.host.showInformationMessage(`new project ${project} created`)
        })
  }
})