(function() {
var st = jb.studio;

jb.component('studio.pick', {
	type: 'action',
	params: [
		{ id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'},
		{ id: 'onSelect', type:'action', dynamic:true }
	],
	impl :{$: 'open-dialog',
		$vars: {
			pickSelection: { path: '' }
		},
		style: {$: 'dialog.studio-pick-dialog', from: '%$from%'},
		content: {$: 'label', title: ''}, // dummy
		onOK: ctx =>
			ctx.componentContext.params.onSelect(ctx.setData(ctx.vars.pickSelection.ctx))
	 }
})

jb.component('dialog.studio-pick-dialog', {
	hidden: true,
	type: 'dialog.style',
	params: [
		{ id: 'from', as: 'string' },
	],
	impl: {$: 'custom-style',
	      template: (cmp,state,h) => h('div',{ class: 'jb-dialog' },[
h('div',{ class: 'edge top', style: { width: state.width + 'px', top: state.top + 'px', left: state.left + 'px' }}) ,
h('div',{ class: 'edge left', style: { height: state.height +'px', top: state.top + 'px', left: state.left + 'px' }}),
h('div',{ class: 'edge right', style: { height: state.height +'px', top: state.top + 'px', left: (state.left + state.width) + 'px' }}) ,
h('div',{ class: 'edge bottom', style: { width: state.width + 'px', top: (state.top + state.height) +'px', left: state.left + 'px' }}) ,
h('div',{ class: 'title' + (state.titleBelow ? ' bottom' : ''), style: { top: state.titleTop + 'px', left: state.titleLeft + 'px'} },[
			h('div',{ class: 'text'},state.title),
			h('div',{ class: 'triangle'}),
	])]),
		css: `
>.edge {
	z-index: 6001;
	position: absolute;
	background: red;
	box-shadow: 0 0 1px 1px gray;
	width: 1px; height: 1px;
	cursor: pointer;
}
>.title {
	z-index: 6001;
	position: absolute;
	font: 14px arial; padding: 0; cursor: pointer;
	transition:top 100ms, left 100ms;
}
>.title .triangle {	width:0;height:0; border-style: solid; 	border-color: #e0e0e0 transparent transparent transparent; border-width: 6px; margin-left: 14px;}
>.title .text {	background: #e0e0e0; font: 14px arial; padding: 3px; }
>.title.bottom .triangle { background: #fff; border-color: transparent transparent #e0e0e0 transparent; transform: translateY(-28px);}
>.title.bottom .text { transform: translateY(6px);}
				`,
			features: [
				{ $: 'dialog-feature.studio-pick', from: '%$from%' },
			]
	}
})


jb.component('dialog-feature.studio-pick', {
	type: 'dialog-feature',
	params: [
		{ id: 'from', as: 'string' },
	],
	impl: ctx =>
	({
	  disableChangeDetection: true,
      init: cmp=> {
		  var _window = ctx.params.from == 'preview' ? st.previewWindow : window;
		  var previewOffset = ctx.params.from == 'preview' ? $('#jb-preview').offset().top : 0;
		  cmp.titleBelow = false;

		  var mouseMoveEm = jb.rx.Observable.fromEvent(_window.document, 'mousemove');
		  var userPick = jb.rx.Observable.fromEvent(document, 'mousedown');
		  var keyUpEm = jb.rx.Observable.fromEvent(document, 'keyup');
		  if (st.previewWindow) {
		  	userPick = userPick.merge(jb.rx.Observable.fromEvent(st.previewWindow.document, 'mousedown'));
		  	keyUpEm = keyUpEm.merge(jb.rx.Observable.fromEvent(st.previewWindow.document, 'keyup'));
		  };

		  mouseMoveEm
		  	.debounceTime(50)
		  	.takeUntil(
		  		keyUpEm.filter(e=>
		  			e.keyCode == 27)
		  			  .merge(userPick))
		  	.do(e=>{
		  		if (e.keyCode == 27)
		  			ctx.vars.$dialog.close({OK:false});
		  	})
		  	.map(e=>
		  		eventToProfile(e,_window))
		  	.filter(x=> x && x.length > 0)
		  	.do(profElem=> {
		  		ctx.vars.pickSelection.ctx = _window.jb.ctxDictionary[profElem.attr('jb-ctx')];
		  		showBox(cmp,profElem,_window,previewOffset);
		  	})
		  	.last()
		  	.subscribe(x=> {
		  		ctx.vars.$dialog.close({OK:true});
		  		jb.delay(200).then(_=>
		  			st.previewWindow && st.previewWindow.getSelection() && st.previewWindow.getSelection().empty())
		  	})
		}
	})
})

function pathFromElem(_window,profElem) {
	try {
		return _window.jb.ctxDictionary[profElem.attr('jb-ctx') || profElem.parent().attr('jb-ctx')].path;
	} catch (e) {
		return '';
	}
	//profElem.attr('jb-path');
}

function eventToProfile(e,_window) {
	var mousePos = {
		x: e.pageX - $(_window).scrollLeft(), y: e.pageY - $(_window).scrollTop()
	};
	var $el = $(_window.document.elementFromPoint(mousePos.x, mousePos.y));
	if (!$el[0]) return;
	var results = Array.from($($el.get().concat($el.parents().get()))
		.filter((i,e) =>
			$(e).attr('jb-ctx') ));
	if (results.length == 0) return [];

	// promote parents if the mouse is near the edge
	var first_result = results.shift(); // shift also removes first item from results!
	var edgeY = Math.max(3,Math.floor($(first_result).height() / 10));
	var edgeX = Math.max(3,Math.floor($(first_result).width() / 10));

	var orderedResults = results.filter(elem=>{
		return Math.abs(mousePos.y - $(elem).offset().top) < edgeY || Math.abs(mousePos.x - $(elem).offset().left) < edgeX;
	}).concat([first_result]);
	return $(orderedResults[0]);
}

function showBox(cmp,profElem,_window,previewOffset) {
	if (profElem.offset() == null || $('#jb-preview').offset() == null)
		return;

	cmp.setState({
		top: previewOffset + profElem.offset().top,
		left: profElem.offset().left,
		width: profElem.outerWidth() == $(_window.document.body).width() ? profElem.outerWidth() -10 : cmp.width = profElem.outerWidth(),
		height: profElem.outerHeight(),
		title: st.shortTitle(pathFromElem(_window,profElem)),
		titleTop: previewOffset + profElem.offset().top - 20,
		titleLeft: profElem.offset().left
	});
}

jb.studio.highlight = function(elems) {
	var _window = st.previewWindow || window;
	var boxes = [];
	elems.map(el=>$(el))
		.forEach($el => {
			var $box = $('<div class="jbstudio_highlight_in_preview"/>');
			$box.css({ position: 'absolute', background: 'rgb(193, 224, 228)', border: '1px solid blue', opacity: '1', zIndex: 5000 }); // cannot assume css class in preview window
			var offset = $el.offset();
			$box.css('left',offset.left).css('top',offset.top).width($el.outerWidth()).height($el.outerHeight());
			if ($box.width() == $(_window.document.body).width())
				$box.width($box.width()-10);
			boxes.push($box[0]);
	})

	$(_window.document.body).append($(boxes));

	$(boxes).css({ opacity: 0.5 }).
		fadeTo(500,0,function() {
			$(boxes).remove();
		});
}

jb.component('studio.highlight-in-preview',{
	type: 'action',
	params: [
		{ id: 'path', as: 'string' }
	],
	impl: (ctx,path) => {
		var _window = st.previewWindow || window;
		if (!_window) return;
		var elems = Array.from(_window.document.querySelectorAll('[jb-ctx]'))
			.filter(e=>{
				var _ctx = _window.jb.ctxDictionary[e.getAttribute('jb-ctx')];
				var callerPath = _ctx && _ctx.componentContext && _ctx.componentContext.callerPath;
				return callerPath == path || (_ctx && _ctx.path == path);
			})

		if (elems.length == 0) // try to look in studio
			elems = Array.from(document.querySelectorAll('[jb-ctx]'))
			.filter(e=> {
				var _ctx = jb.ctxDictionary[e.getAttribute('jb-ctx')];
				return _ctx && _ctx.path == path
			})

		jb.studio.highlight(elems);
  }
})

st.closestCtxInPreview = path => {
	var _window = st.previewWindow || window;
	if (!_window) return;
	var closest,closestElem;
	var elems = Array.from(_window.document.querySelectorAll('[jb-ctx]'));
	for(var i=0;i<elems.length;i++) {
		var _ctx = _window.jb.ctxDictionary[elems[i].getAttribute('jb-ctx')];
		if (!_ctx) continue; //  || !st.isOfType(_ctx.path,'control'))
		if (_ctx.path == path)
			return {ctx: _ctx, elem: elems[i]} ;
		if (path.indexOf(_ctx.path) == 0 && (!closest || closest.path.length < _ctx.path.length)) {
			closest = _ctx; closestElem = elems[i]
		}
	}
	return {ctx: closest, elem: closestElem};
}

// st.refreshPreviewOfPath = path => {
// 	var closest = st.closestCtxInPreview(path);
// 	if (!closest.ctx) return;
// 	var closest_path = closest.ctx.path;
// 	var _window = st.previewWindow || window;
// 	Array.from(_window.document.querySelectorAll('[jb-ctx]'))
// 		.map(el=> ({el:el, ctx: _window.jb.ctxDictionary[el.getAttribute('jb-ctx')]}))
// 		.filter(elCtx => (elCtx.ctx||{}).path == closest_path )
// 		.forEach(elCtx=>{
// 			try {
// 			elCtx.ctx.profile = st.valOfPath(elCtx.ctx.path); // recalc last version of profile
// 			if (elCtx.ctx.profile)
// 				jb.ui.refreshComp(elCtx.ctx,elCtx.el);
// 			} catch(e) { jb.logException(e) };
// 		})
// }

})()
