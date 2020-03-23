import { getEffectiveTypeRoots } from "typescript";

//import __ from '../../../dist/jb-react-all'

function __cloneDeepLimited(obj, maxDepth) {
  if (typeof obj == 'function') return 'func ' + obj.name;
  if (maxDepth == 0) return obj && obj.toString && obj.toString();
  if (typeof obj === 'object')
    return _.mapValues(obj, val => __cloneDeepLimited(val, maxDepth-1))
  return obj
}

jb.component('helloWorld.main', {
  type: 'control', 
  impl : {$:'group', controls: [
    {$: 'editable-text', databind: '%$exp/val%' },
    {$: 'button', title: 'eval', 
        action: ctx => evalInMain(ctx.exp('%$exp/val%')).then(res => ctx.run({$:'write-value', value:res , to: '%$exp/res%'}))  
    },
    {$: 'editable-text', databind: '%$exp/res%', style: {$:'editable-text.textarea', rows: 10}}
  ]}
})

function evalInMain(exp) {
  return new Promise(resolve=>
    chrome.devtools.inspectedWindow.eval( exp,
      (result, isException) => resolve(isException ? 'execption' : result)))
}

evalInMain(__cloneDeepLimited.toString())

jb.ui.renderWidget({$:'helloWorld.main'},document.getElementById('main'))
