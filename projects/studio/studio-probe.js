(function() {
var st = jb.studio;

var probeCounter = 0;
st.Probe = class {
  constructor(ctx, noGaps) {
    if (ctx.probe)
      debugger;
    this.noGaps = noGaps;

    this.context = ctx.ctx({});
    this.probe = {};
    this.context.probe = this;
    this.context.profile = st.valOfPath(this.context.path); // recalc last version of profile
    this.circuit = this.context.profile;
    this.id = ++probeCounter;
  }

  runCircuit(pathToTrace,maxTime) {
		var st = jb.studio;
    this.maxTime = maxTime || 50;
    this.startTime = new Date().getTime();
    jb.logPerformance('probe','start',this);
    this.result = [];
    this.result.visits = 0;
    this.probe[pathToTrace] = this.result;
    this.pathToTrace = pathToTrace;
		var initial_resources = st.previewjb.valueByRefHandler.resources();
		var initial_comps = st.compsRefHandler.resources();

    return this.simpleRun()
//		  .catch(e => jb.logException(e,'probe run'))
	    .then( res =>
	      this.handleGaps())
		  .catch(e => jb.logException(e,'probe run'))
		  .then(res=>{
					this.completed = true;
		      this.totalTime = new Date().getTime()-this.startTime;
		      jb.logPerformance('probe','finished',this);
					// make values out of ref
					this.result.forEach(obj=> { obj.out = jb.val(obj.out) ; obj.in.data = jb.val(obj.in.data)});
					st.previewjb.valueByRefHandler.resources(initial_resources);
					st.compsRefHandler.resources(initial_comps);
		      return this;
				})
	}

	simpleRun() {
      var st = jb.studio;
			return Promise.resolve(this.context.runItself()).then(res=>{
				if (st.isCompNameOfType(jb.compName(this.circuit),'control')) {
					var ctrl = jb.ui.h(res.reactComp());
          st.probeEl = st.probeEl || document.createElement('div');
          st.probeResEl = jb.ui.render(ctrl, st.probeEl, st.probeResEl);
          return ({element: st.probeResEl});
				}
				return res;
			})
	}

  handleGaps(formerGap) {
    if (this.result.length > 0 || this.noGaps)
      return;
    var st = jb.studio;

		// find closest path
    var _path = st.parentPath(this.pathToTrace),breakingProp='';
    while (!this.probe[_path] && _path.indexOf('~') != -1) {
			breakingProp = _path.split('~').pop();
    	_path = st.parentPath(_path);
		}
		if (!this.probe[_path] || formerGap == _path) { // can not break through the gap
			this.closestPath = _path;
			this.result = this.probe[_path] || [];
			return;
		}

		// check if parent ctx returns object with method name of breakprop as in dialog.onOK
		var parentCtx = this.probe[_path][0].ctx, breakingPath = _path+'~'+breakingProp;
		var obj = this.probe[_path][0].out;
		if (obj[breakingProp] && typeof obj[breakingProp] == 'function')
			return Promise.resolve(obj[breakingProp]())
				.then(_=>this.handleGaps(_path));

	  // use the ctx to run the breaking param if it has no side effects
		var hasSideEffect = st.previewjb.comps[st.compNameOfPath(breakingPath)] && (st.previewjb.comps[st.compNameOfPath(breakingPath)].type ||'').indexOf('has-side-effects') != -1;
		if (!hasSideEffect)
			return Promise.resolve(parentCtx.runInner(parentCtx.profile[breakingProp],st.paramDef(breakingPath),breakingProp))
				.then(_=>this.handleGaps(_path));

		// could not solve the gap
		this.closestPath = _path;
		this.result = this.probe[_path] || [];
  }

	// called from jb_run
  record(context,parentParam) {
      if (this.id < probeCounter) {
        this.stopped = true;
        return
      }
      var now = new Date().getTime();
      if (!this.outOfTime && now - this.startTime > this.maxTime && !context.vars.testID) {
        jb.logPerformance('probe','out of time',this,now);
				this.outOfTime = true;
        //throw 'out of time';
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
        var rec = {in: input, out: out, counter: 0, ctx: context};
        this.probe[path].push(rec);
      }
      return out;
  }
}

var probeEmitter = new jb.rx.Subject();

jb.component('studio.probe', {
	type:'data',
	params: [ { id: 'path', as: 'string', dynamic: true } ],
	impl: (ctx,path) => {
    var _jb = st.previewjb;
		var circuitCtx = ctx.vars.pickSelection && ctx.vars.pickSelection.ctx;
		if (!circuitCtx) {
			var circuitInPreview = st.closestCtxInPreview(path());
			if (circuitInPreview.ctx) {
			   st.highlight([circuitInPreview.elem]);
			   circuitCtx = circuitInPreview.ctx;
			}
		}
		if (!circuitCtx) {
			var circuit = ctx.exp('%$circuit%') || ctx.exp('%$studio/project%.%$studio/page%');
			circuitCtx = new _jb.jbCtx(new _jb.jbCtx(),{ profile: {$: circuit}, comp: circuit, path: '', data: null} );
		}
    var req = {path: path(), circuitCtx: circuitCtx };
    jb.delay(1).then(_=>probeEmitter.next(req));
    var probeQueue = probeEmitter.buffer(probeEmitter.debounceTime(500))
        .map(x=>x && x[0]).filter(x=>x)
        .flatMap(req=>
          new (_jb.studio.Probe || st.Probe)(req.circuitCtx).runCircuit(req.path)
        );

    return probeQueue.filter(x=>x.id == probeCounter).take(1).toPromise();
//      .race(jb.rx.Observable.fromPromise(jb.delay(1000).then(_=>({ result: [] }))))
  }
})



})()
