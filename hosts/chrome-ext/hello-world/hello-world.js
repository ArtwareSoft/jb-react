jb.component('helloWorld.main', {
  type: 'control', 
  impl :{$: 'label', title: 'jBart label' }
})

jb.ui.renderWidget({$:'helloWorld.main'},document.getElementById('main'))
