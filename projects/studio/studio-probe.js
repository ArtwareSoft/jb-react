
jb.studio = class Probe {
  constructor(ctx, public forTests) {
    if (ctx.probe)
      debugger;

    this.context = ctx.ctx({});
    this.probe = {};
    this.context.probe = this;
    this.circuit = this.context.profile;
  }

  runCircuit(pathToTrace) {
    this.pathToTrace = pathToTrace;
    this.probe[this.pathToTrace] = [];
    this.probe[this.pathToTrace].visits = 0;

    return this.simpleRun().then( res =>
          this.handleGaps().then( res2 =>
            jb.extend({finalResult: this.probe[this.pathToTrace], 
                probe: this, 
                circuit: jb.compName(this.circuit),
            },res,res2)
    ))
  }

  simpleRun() {
      var _win = jb.studio.previewWindow || window;
      var model = jb.studio.model;
      if (model.isCompNameOfType(jb.compName(this.circuit),'control'))
        this.circuitType = 'control'
      else if (model.isCompNameOfType(jb.compName(this.circuit),'action'))
        this.circuitType = 'action'
      else if (model.isCompNameOfType(jb.compName(this.circuit),'data'))
        this.circuitType = 'data'
      else
        this.circuitType = 'unknown';

      if (this.circuitType == 'control') // running circuit in a group to get the 'ready' event
        return testControl(this.context, this.forTests);
      else if (this.circuitType != 'action')
        return Promise.resolve(_win.jb_run(this.context));
      
  }

  handleGaps() {
    if (this.probe[this.pathToTrace].length == 0) {
      // find closest path
      var _path = parentPath(this.pathToTrace);
      while (!this.probe[_path] && _path.indexOf('~') != -1)
        _path = parentPath(_path);
      if (this.probe[_path])
        this.probe[this.pathToTrace] = this.probe[_path];
    }
    return Promise.resolve();
  }

  record(context,parentParam) {
      var path = context.path;
      var input = context.ctx({});
      var out = input.runItself(parentParam,{noprobe: true});

      if (!this.probe[path]) {
        this.probe[path] = [];
        this.probe[path].visits = 0;
      }
      this.probe[path].visits++;
      var found;
      this.probe[path].forEach(x=>{
        found = jb.compareArrays(x.in.data,input.data) ? x : found;
      })
      if (found)
        found.counter++;
      else 
        this.probe[path].push({in: input, out: jb_val(out), counter: 0});
      return out;
  }
}

jb.component('studio.probe', {
  type:'data',
  params: [ { id: 'path', as: 'string', dynamic: true } ],
  impl: (ctx,path) => {
      var context = ctx.exp('%$studio/last_pick_selection%');
      if (!context) {
        var _jbart = jb.studio.jbart_base();
        var _win = jb.studio.previewWindow || window;
        var circuit = ctx.exp('%$circuit%') || ctx.exp('%$studio/project%.%$studio/page%');
        context = _win.jb.ctx(_jbart.initialCtx,{ profile: {$: circuit}, comp: circuit, path: '', data: null} );
      }
      return new jb.studio.Probe(context).runCircuit(path());
    }
})

// watch & fix path changes
// pathChangesEm.subscribe(fixer => {
//   var ctx = jbart.initialCtx && jbart.initialCtx.exp('%$studio/last_pick_selection%');
//   if (ctx && ctx.path)
//       ctx.path = fixer.fix(ctx.path)
// }) 


// function testControl(ctx,forTests) {
//   // test the control as a dialog
//   return new Promise((resolve,reject)=> {
//     var _win = ctx.win();
//     var dialog = { 
//       id: 'test-control', 
//       em: new jb.rx.Subject(),
//       comp: ctx.runItself().jbExtend({
//         jbEmitter: true,
//         init: cmp =>
//           cmp.jbEmitter.filter(e=>
//             e == 'ready' || e == 'destroy')
//           .take(1)
//           .catch(e=> {
//               debugger;
//               dialog.close();resolve()
//           })
//           .subscribe(x=>{
//             if (!forTests)
//               jb.delay(1,ctx).then(()=>dialog.close()); // delay to avoid race conditin with itself
// //            console.log('close test dialog',ctx.id);
//             resolve({ element : cmp.elementRef.nativeElement });
//           })
//           ,

//         css: '{display: none}'  
//       })
//     }
// //    console.log('add test dialog');

//     _win.jbart.jb_dialogs.addDialog(dialog,ctx);
// //    console.log('create test dialog',ctx.id);
//     _win.setTimeout(()=>{},1); // refresh
//   })
// }
