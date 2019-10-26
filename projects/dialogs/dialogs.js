jb.component('dialogs.main', { /* dialogs.main */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'ok-Cancel dialog',
        action: openDialog({
          content: group({
            controls: [
              text({title: 'xxx', text: 'hello thereaaaaa'})
            ]
          })
        })
      })
    ]
  })
})
