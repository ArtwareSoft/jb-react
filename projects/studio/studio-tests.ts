import {jb} from 'jb-core';
import * as jb_ui from 'jb-ui';

if (window.jbartTest) {
	jb.resource('ui-tests','WidgetLoaded',{ $: 'rx.subject' })
}

jb_tests('studio-tests', {

'studio-label' :{$: 'studio-test', 
 	control :{$: 'label', title: 'Hello World2' },
  expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

'studio-codemirror' :{$: 'studio-test', 
  page: 'main',
	control :{$: 'editable-text', 
      databind: {$: 'studio.profile-as-text'}, 
			style: { $: 'editable-text.codemirror' }
	},
  expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

'studio-control-tree' :{$: 'studio-test', 
  page: 'group1', 
  profile_path: 'hello-world.group1', 
 	control :{$: 'studio.control-tree' }, 
  expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

'studio-properties' :{$: 'studio-test', 
  	page: 'group1', 
  	profile_path: 'hello-world.group1', 
  	control :{$: 'studio.properties', path: '%$studio/profile_path%' },
    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

'studio-property-Primitive' :{$: 'studio-test', 
  	page: 'main', 
  	profile_path: 'hello-world.main', 
  	control :{$: 'studio.property-Primitive', path: 'hello-world.main~title' },
    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

'studio-property-TgpType' :{$: 'studio-test', 
    page: 'group1', 
    profile_path: 'hello-world.group1', 
  	control :{$: 'studio.property-TgpType', path: 'hello-world.group1~style' },
    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
},

})
