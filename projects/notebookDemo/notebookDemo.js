jb.ns('notebookDemo,nb')

jb.component('notebookDemo.notebook', {
  type: 'control',
  impl: nb.notebook(
    nb.markdown(`# title
`),
    // nb.control(
    //   group({
    //     controls: [
    //       button('hello')
    //     ]
    //   })
    // )
  )
})
