  
jb.studio.Probe = class {
  constructor(ctx, noGaps) {
    if (ctx.probe)
      debugger;
    this.noGaps = noGaps;

    this.context = ctx.ctx({});
    this.probe = {};
    this.context.probe = this;
    this.context.profile = jb.studio.valOfPath(this.context.path); // recalc last version of profile
    this.circuit = this.context.profile;
  }

  runCircuit(pathToTrace,maxTime) {
    this.maxTime = maxTime || 500;
    this.startTime = new Date().getTime();
    jb.logPerformance('probe','start',this);
    this.result = [];
    this.result.visits = 0;
    this.probe[pathToTrace] = this.result;
    this.pathToTrace = pathToTrace;

    return this.simpleRun().catch(e => 
        this)
      .then( res => {
            this.handleGaps();
            this.completed = true;
            this.totalTime = new Date().getTime()-this.startTime;
            jb.logPerformance('probe','finished',this);
            return this;
    });
    // this.asObservable = jb.rx.Observable.fromPromise(out);
    // return this.asObservable.race(jb.rx.Observable.of(this).delay(500)).toPromise();
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
          jb.studio.probeEl = jb.studio.probeEl || document.createElement('div');
          try {
            jb.studio.probeResEl = jb.ui.render(ctrl, jb.studio.probeEl, jb.studio.probeResEl);
          } catch (e) {
            jb.logException(e,'probe run')
          }          
          return Promise.resolve({element: jb.studio.probeResEl});
      } else if (this.circuitType != 'action')
        return Promise.resolve(this.context.runItself());
  }

  handleGaps() {
    if (this.noGaps) 
      return;
    var st = jb.studio;
    if (this.result.length == 0) {
      // find closest path
      var _path = st.parentPath(this.pathToTrace);
      while (!this.probe[_path] && _path.indexOf('~') != -1)
        _path = st.parentPath(_path);
      if (this.probe[_path]) {
        this.closestPath = _path;
        this.result = this.probe[_path];
      }
    }
  }

  record(context,parentParam) {
      var now = new Date().getTime();
      if (now - this.startTime > this.maxTime) {
        jb.logPerformance('probe','out of time',this,now);
        throw 'out of time';
      }
      var path = context.path;
      var input = context.ctx({probe: null});
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
      else {
        var rec = {in: input, out: out, counter: 0};
        this.probe[path].push(rec);
      }
      return out;
  }
}

jb.component('studio.probe', {
  type:'data',
  params: [ { id: 'path', as: 'string', dynamic: true } ],
  impl: (ctx,path) => {
      var _jb = jb.studio.previewjb;
      var circuit = ctx.exp('%$circuit%') || ctx.exp('%$studio/project%.%$studio/page%');
      var context = new _jb.jbCtx(new _jb.jbCtx(),{ profile: {$: circuit}, comp: circuit, path: '', data: null} );
      var pickSelection = ctx.vars.pickSelection && ctx.vars.pickSelection.ctx;
      return new (_jb.studio.Probe || jb.studio.Probe)(pickSelection || context).runCircuit(path());
    }
})
