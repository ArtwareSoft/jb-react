
jb.studio.Probe = class {
  constructor(ctx, forTests) {
    if (ctx.probe)
      debugger;
    this.forTests = forTests;

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
      var st = jb.studio;
      var _win = st.previewWindow || window;
      if (st.isCompNameOfType(jb.compName(this.circuit),'control'))
        this.circuitType = 'control'
      else if (st.isCompNameOfType(jb.compName(this.circuit),'action'))
        this.circuitType = 'action'
      else if (st.isCompNameOfType(jb.compName(this.circuit),'data'))
        this.circuitType = 'data'
      else
        this.circuitType = 'unknown';

      if (this.circuitType == 'control') { // running circuit in a group to get the 'ready' event
        //return testControl(this.context, this.forTests);
          var ctrl = jb.ui.h(this.context.runItself().reactComp());
          var el = document.createElement('div');
          jb.ui.render(ctrl, el);
          return Promise.resolve({element: el});
      } else if (this.circuitType != 'action')
        return Promise.resolve(_win.jb.run(this.context));
  }

  handleGaps() {
    var st = jb.studio;
    if (this.probe[this.pathToTrace].length == 0) {
      // find closest path
      var _path = st.parentPath(this.pathToTrace);
      while (!this.probe[_path] && _path.indexOf('~') != -1)
        _path = st.parentPath(_path);
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
        this.probe[path].push({in: input, out: jb.val(out), counter: 0});
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
