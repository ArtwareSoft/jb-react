component('studio.newProject', {
  autoGen: true,
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
  <script type="text/javascript" src="/plugins/loader/jb-loader.js"></script>
</head>
<body>
  <script>
    window.jb_initWidget && jb_initWidget()
  </script>
</body>
</html>`),
  prop('%$project%.js',`component('%$project%.main', {
  type: 'control',
  impl: group({
    controls: [button('my button')]
  })
})
`))),
)
})

component('studio.openNewProject', {
  type: 'action',
  impl: openDialog({
    title: 'New Project',
    content: group({
      controls: [
        editableText('project name', '%$dialogData/name%', {
          style: editableText.mdcInput('280'),
          features: [
            feature.onEnter(dialog.closeDialog()),
            validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')
          ]
        })
      ],
      style: group.div(),
      features: css.padding('14', '11')
    }),
    style: dialog.dialogOkCancel(),
    onOK: runActions(
      Var('project', '%$dialogData/name%'),
      Var('mainFileName', pipeline(studio.projectsDir(), '%%/%$project%/%$project%.js')),
      studio.saveNewProject('%$project%'),
      writeValue('%$studio/project%', '%$project%'),
      writeValue('%$studio/circuit%', '%$project%.main'),
      writeValue('%$studio/profile_path%', studio.currentPagePath()),
      studio.reOpenStudio('%$mainFileName%', 5)
    ),
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition('300', '100'),
      dialogFeature.dragTitle('newProject')
    ]
  })
})

component('studio.reOpenStudio', {
  type: 'action',
  params: [
    {id: 'fileName', as: 'string', defaultValue: pipeline(studio.projectsDir(), '%%/%$studio/project%/%$studio/project%.js')},
    {id: 'line', as: 'number', defaultValue: 0}
  ],
  impl: (ctx,fn,line) => jb.studio.host.reOpenStudio(fn,line)
})


component('studio.createProjectFile', {
  type: 'action',
hasSideEffect: true,
  params: [
    {id: 'fileName', as: 'string'}
  ],
  impl: runActions(
    Var('project', '%$studio/project%'),
    (ctx,{},{fileName}) => jb.studio.host.createDirectoryWithFiles({
      override: true,
      project: ctx.exp('%$project%'), 
      files: {[fileName]: ''}, 
      baseDir: ctx.run(pipeline(studio.projectsDir(),'%%/%$project%'))[0]
    }),
    addToArray('%$studio/projectSettings/jsFiles%', { toAdd: '%$fileName%' }),
    studio.saveProjectSettings()
  )
})

component('studio.projectBaseDir', {
  impl: ctx => jb.studio.host.locationToPath(
      (jb.frame.jbBaseProjUrl || '') + jb.studio.host.pathOfJsFile(ctx.exp('%$studio/project%'), ''))
  .split('/').slice(0,-1).join('/').slice(1)
})

component('studio.projectsDir', {
  impl: () => jb.studio.host.projectsDir()
})

component('studio.saveNewProject', {
  type: 'action',
hasSideEffect: true,
  params: [
    {id: 'project', as: 'string'}
  ],
  impl: (ctx,project) => {
    const {files} = ctx.run(studio.newProject(()=> project))
    const st = jb.studio
    return jb.studio.host.createDirectoryWithFiles({project, files, baseDir: ctx.run(studio.projectsBaseDir()) + `/${project}` })
        .then(r => r.json ? r.json() : r)
        .catch(e => {
          st.host.showError(`error saving project ${project}: ` + (e && e.desc))
          jb.logException(e,'',{ctx})
        })
        .then(res => {
          res && res.type == 'error' && st.host.showError(`error saving project ${project}: ` + (res && jb.utils.prettyPrint(res.desc,{noMacros: true})))
          res && res.type == 'success' && st.host.showInformationMessage(`new project ${project} created`)
        })
  }
})