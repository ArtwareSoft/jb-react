
jb.component('studio.new-project', {
	type: 'action,has-side-effects',
	params: [
		{ id: 'name',as: 'string' },
    { id: 'onSuccess', type: 'action', dynamic: true }
	],
	impl : (ctx,name) => {
    var request = {
      project: name,
      files: [
        { fileName: `${name}.js`, content: `
jb.component('${name}.main', {
  type: 'control',
  impl :{$: 'group', controls: [ {$: 'button', title: 'my button'}] }
})`
        },
        { fileName: `${name}.html`, content: `
<!DOCTYPE html>
<head>
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
  <script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common"></script>
  <script type="text/javascript" src="/projects/${name}/${name}.js"></script>
  <script1 type="text/javascript" src="/projects/${name}/samples.js"></script1>
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
    var headers = new Headers();
    headers.append("Content-Type", "application/json; charset=UTF-8");
    return fetch(`/?op=createProject`,{method: 'POST', headers: headers, body: JSON.stringify(request) })
    .then(r =>
        r.json())
    .then(res=>{
        if (res.type == 'error')
            return jb.studio.message(`error creating project ${name}: ` + (e && e.desc));
        jb.studio.message(`project ${name} created`);
        return ctx.params.onSuccess();
    })
    .catch(e => {
      jb.studio.message(`error creating project ${name}: ` + (e && e.desc));
      jb.logException(e,'',ctx)
    })
  }
});

jb.component('studio.open-new-project', {
  type: 'action', 
  impl :{$: 'open-dialog', 
    style :{$: 'dialog.dialog-ok-cancel' }, 
    content :{$: 'group', 
      style :{$: 'group.div' }, 
      controls: [
        {$: 'editable-text', 
          title: 'project name', 
          databind: '%$name%', 
          style :{$: 'editable-text.mdl-input' }, 
          features :{$: 'feature.onEnter', 
            action :{$: 'dialog.close-containing-popup' }
          }
        }
      ], 
      features :{$: 'css.padding', top: '14', left: '11' }
    }, 
    title: 'New Project', 
    onOK :{$: 'studio.new-project', 
      name: '%$name%', 
      onSuccess :{$: 'goto-url', url: '/project/studio/%$name%/' }
    }, 
    modal: true, 
    features: [
      {$: 'variable', name: 'name', mutable: true }, 
      {$: 'dialog-feature.auto-focus-on-first-input' }, 
      {$: 'dialog-feature.near-launcher-position', offsetLeft: '300', offsetTop: '100' }
    ]
  }
})
