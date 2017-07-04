jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('play-ground.main', {
  type: 'control', 
  impl :{$: 'group', 
    title: '%$people%', 
    controls: [
      {$: 'label', 
        title: 'a', 
        features :{$: 'feature.onKey2' }
      }, 
      {$: 'label', title: 'b' }, 
      {$: 'button', 
        title: 'click me', 
        style :{$: 'button.mdl-raised' }
      }
    ]
  }
})

jb.component('feature.onKey2', {
  type: 'feature', category: 'feature:60',
  params: [
    { id: 'code', as: 'number' },
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,code) => ({ 
      // onkeydown: true,
      // onkeyup: true,
      afterViewInit: cmp=> {
        cmp.base.setAttribute('tabIndex','0');

        cmp.base.onkeydown = (e) => {
//          e.stopPropagation();
          console.log('a1');
          return false;
        } 
    
  //       cmp.base.onkeyup = (e) => {
  // //        e.stopPropagation();
  //         console.log('a2');
  //         return false;
  //       } 
  //       // cmp.onkeydown.do(e=>
        //   e.stopPropagation()).subscribe(_=>{console.log(1); return false})
        // cmp.onkeyup.do(e=>
        //   e.stopPropagation()).subscribe(_=>{console.log(2); return false;})
      }
  })
})

