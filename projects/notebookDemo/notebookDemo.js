jb.ns('notebookDemo,nb')

jb.component('notebookDemo.notebook', {
  type: 'control',
  impl: nb.notebook(nb.markdown('# titlea')),
  location: ['8082/projects/notebookDemo/notebookDemo.js', '3'],
  loadingPhase: 'src'
})
