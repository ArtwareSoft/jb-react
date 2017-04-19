

var jb_success_counter = 0;
var jb_fail_counter = 0;

jb.testers.runTests = function(testType) {
	var tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object' && e[1].impl.$ == testType);

	document.write(`<div><span id="success-counter"></span><span id="fail-counter"></span><span> total ${tests.length}</span>`);
	

	jb.rx.Observable.from(tests).concatMap(e=>
			Promise.resolve(new jb.jbCtx().setVars({testID: e[0]}).run({$:e[0]})))
		.map(res=> {
			if (res.success)
				jb_success_counter++;
			else
				jb_fail_counter++;
			return `<div style="color:${res.success ? 'green' : 'red'}">${res.id}</div>`
		})
		.subscribe(elem=> {
			document.getElementById('success-counter').innerHTML = 'success ' + jb_success_counter;
			document.getElementById('fail-counter').innerHTML = ' failure ' + jb_fail_counter;
			document.write(elem)
		})
}