jb.resource('person',{ 
  name: "Homer Simpson", 
  male: true,
  isMale: 'yes', 
  age: 42 
})

jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('picklists.main', {
  type: 'control', 
  impl :{$: 'group', 
    style :{$: 'layout.vertical', spacing: '42' }, 
    controls: [
      {$: 'picklist', 
        title: 'native', 
        databind: '%$person/name%', 
        options :{$: 'picklist.options', options: '%$people/name%' }, 
        style :{$: 'picklist.native' }, 
        features :{$: 'css.width', width: '200' }
      }, 
      {$: 'picklist', 
        title: 'selection list', 
        databind: '%$person/name%', 
        options :{$: 'picklist.options', options: '%$people/name%' }, 
        style :{$: 'picklist.selection-list' }, 
        features :{$: 'css.width', width: '200' }
      }
    ]
  }, 
  options: [{$: 'picklist.options', options: '%$people/name%' }, ]
})

