jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'label', title: 'jBart label' }
})

jb.ui.renderWidget({$:'hello-world.main'},document.getElementById('main'))
