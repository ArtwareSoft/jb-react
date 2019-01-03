import __ from '../../dist/jb-react-all';

declare var jb: jbObj;

const label : labelPT = {$: 'label',  title: 'xx', features: [], style: {$:'label.h1'}};
const ctrl : controlType = {$:'image',   }

jb.component('xxx', {id: 'xx', type: 'control', impl: {$:'label', }})


