jb.component('dialogs.main', { /* dialogs.main */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'ok-Cancel dialog',
        action: openDialog({
          style: dialog.dialogOkCancel(),
          content: group({
            layout: layout.vertical(),
            controls: [
              editableText({title: 'name', databind: '%$dialogData/name%'}),
              editableText({title: 'phone', databind: '%$dialogData/phone%'})
            ],
            features: css.padding({left: '30', right: '30'})
          }),
          title: 'person'
        })
      })
    ]
  })
})
