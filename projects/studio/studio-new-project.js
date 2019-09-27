
jb.component('studio.new-project', { /* studio.newProject */
  type: 'action,has-side-effects',
  params: [
    {id: 'name', as: 'string'},
    {id: 'onSuccess', type: 'action', dynamic: true}
  ],
  impl: (ctx,name) => {
    
    const request = {
      project: name,
      files: [
        { fileName: `${name}.js`, content: `jb.ns('${name}')        

jb.component('${name}.main', {
  type: 'control',
  impl: group({
    controls: [button('my button')]
  })
})

`
        },
        { fileName: `${name}.html`, content: `
<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
  ${jb.studio.host.scriptForLoadLibraries}
  <script type="text/javascript" src="${jb.studio.host.pathToJsFile(name,name+'.js')}"></script>
</head>
<body>
<div id="main"> </div>
<script>
  jb.ui.renderWidget({$:'${name}.main'},document.getElementById('main'))
</script>
</body>
</html>
` },
      ]
    };
    return jb.studio.host.createProject(request, {'Content-Type': 'application/json; charset=UTF-8' } ).then(r =>
        r.json())
    .then(res=>{
        if (res.type == 'error')
            return jb.studio.message(`error creating project ${name}: ` + (res && jb.prettyPrint(res.desc)));
        jb.studio.message(`project ${name} created`);
        return ctx.params.onSuccess();
    })
    .catch(e => {
      jb.studio.message(`error creating project ${name}: ` + (e && e.desc));
      jb.logException(e,'',ctx)
    })
  }
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
    onOK: studio.newProject('%$name%', studio.gotoProject('%$name%')),
    modal: true,
    features: [
      variable({name: 'name', watchable: true}),
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.nearLauncherPosition({offsetLeft: '300', offsetTop: '100'})
    ]
  })
})
