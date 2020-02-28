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
      Var('project','%$dialogData/name%'),
      // writeValue(
      //     '%$studio/projectSettings%',
      //     {
      //       '$': 'object',
      //       project: '%$project%',
      //       libs: 'common,ui-common,material',
      //       jsFiles: ['%$project%.js']
      //     }
      //   ),
      studio.saveNewProject(studio.newProject('%$project%')),
      writeValue('%$studio/project%', '%$project%'),
      writeValue('%$studio/page%', 'main'),
      writeValue('%$studio/profile_path%', '%$project%.main'),
      delay(100),
//      () => location.reload()
    ),
    modal: true,
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'})
    ]
  })
})

jb.component('studio.save-new-project', { /* studio.saveNewProject */
  type: 'action,has-side-effects',
  params: [
    { id: 'projectObj', as: 'object' }
  ],
  impl: (ctx,{project, files, baseDir}) => {
    return jb.studio.host.createProject({project, files, baseDir})
        .then(r => r.json())
        .catch(e => {
          jb.studio.message(`error saving project ${project}: ` + (e && e.desc));
          jb.logException(e,'',ctx)
        })
        .then(res=>{
          if (res.type == 'error')
              return jb.studio.message(`error saving project ${project}: ` + (res && jb.prettyPrint(res.desc)));
          location.reload()
        })

    // const messages = [],
    // return filesToSave.reduce((pr,{path,contents}) => pr.then(()=> st.host.saveFile(path,contents)), Promise.resolve() ).catch(e=> {
    //   messages.push({ text: 'error saving: ' + (typeof e == 'string' ? e : e.message || e.e), error: true })
    //   st.showMultiMessages(messages)
    //   return jb.logException(e,'error while saving ' + e.id,ctx) || []
    // })
  }
})