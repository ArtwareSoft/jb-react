jbLoadModules(['studio/studio-tgp-model']).then(loadedModules => { 
  var model = loadedModules['studio/studio-tgp-model'].model;

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
	impl: {$: 'customStyle',
			template: `<div class="jb-dialog">
<div class="edge top" [style.width]="width+'px'" [style.top]="top+'px'" [style.left]="left+'px'"></div>
<div class="edge left" [style.height]="height+'px'" [style.top]="top+'px'" [style.left]="left+'px'"></div>
<div class="edge right" [style.height]="height+'px'" [style.top]="top+'px'" [style.left]="left+width+'px'"></div>
<div class="edge bottom" [style.width]="width+'px'" [style.top]="top+height+'px'" [style.left]="left+'px'"></div>
<div class="title" [class.bottom]="titleBelow" [style.top]="titleTop+'px'" [style.left]="titleLeft+'px'">
	<div class="text">{{title}}</div>
	<div class="triangle"></div>
</div>

</div>`, 
			css: `
.edge { 
	z-index: 6001;
	position: absolute;
	background: red;
	box-shadow: 0 0 1px 1px gray;
	width: 1px; height: 1px;
	cursor: pointer;
}
.title {
	z-index: 6001;
	position: absolute;
	font: 14px arial; padding: 0; cursor: pointer;
	transition:top 100ms, left 100ms;
}
.title .triangle {	width:0;height:0; border-style: solid; 	border-color: #e0e0e0 transparent transparent transparent; border-width: 6px; margin-left: 14px;}
.title .text {	background: #e0e0e0; font: 14px arial; padding: 3px; }
.title.bottom .triangle { background: #fff; border-color: transparent transparent #e0e0e0 transparent; transform: translateY(-28px);}
.title.bottom .text { transform: translateY(6px);}
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
		  var _window = ctx.params.from == 'preview' ? jbart.previewWindow : window;
		  var previewOffset = ctx.params.from == 'preview' ? $('#jb-preview').offset().top : 0;
		  cmp.titleBelow = false;

		  var mouseMoveEm = jb_rx.Observable.fromEvent(_window.document, 'mousemove');
		  var userPick = jb_rx.Observable.fromEvent(document, 'mousedown')
		      			.merge(jb_rx.Observable.fromEvent(
		      				(jbart.previewWindow || {}).document, 'mousedown'));
		  var keyUpEm = jb_rx.Observable.fromEvent(document, 'keyup')
		      			.merge(jb_rx.Observable.fromEvent(
		      				(jbart.previewWindow || {}).document, 'keyup'));

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
		  		ctx.vars.pickSelection.ctx = _window.jbart.ctxDictionary[profElem.attr('jb-ctx')];
		  		showBox(cmp,profElem,_window,previewOffset);
	            cmp.changeDt.markForCheck();
	            cmp.changeDt.detectChanges();
		  	})
		  	.last()
		  	.subscribe(x=> {
		  		ctx.vars.$dialog.close({OK:true});
		  		jb.delay(200).then(_=>
		  			jbart.previewWindow.getSelection() && jbart.previewWindow.getSelection().empty())
		  	})
		}
	})			
})

function pathFromElem(_window,profElem) {
	try {
		return _window.jbart.ctxDictionary[profElem.attr('jb-ctx') || profElem.parent().attr('jb-ctx')].path;
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
	var edgeY = Math.max(3,Math.floor($(first_result).children().first().height() / 10));
	var edgeX = Math.max(3,Math.floor($(first_result).children().first().width() / 10));

	var orderedResults = results.filter(elem=>{
		return Math.abs(mousePos.y - $(elem).children().first().offset().top) < edgeY || Math.abs(mousePos.x - $(elem).children().first().offset().left) < edgeX;
	}).concat([first_result]);
	return $(orderedResults[0]);
}

function showBox(cmp,_profElem,_window,previewOffset) {
	var profElem = 	_profElem.children().first();
	if (profElem.offset() == null || $('#jb-preview').offset() == null) 
		return;

	cmp.top = previewOffset + profElem.offset().top;
	cmp.left = profElem.offset().left;
	if (profElem.outerWidth() == $(_window.document.body).width())
		cmp.width = (profElem.outerWidth() -10);
	else
		cmp.width = profElem.outerWidth();
	cmp.height = profElem.outerHeight();

	cmp.title = model.shortTitle(pathFromElem(_window,_profElem));

	var $el = $(cmp.elementRef.nativeElement);
	var $titleText = $el.find('.title .text');
//	console.log('selected',profElem.outerWidth(),profElem.outerHeight());
	// Array.from(profElem.parents())
	// 	.forEach(el=>console.log('parent',$(el).outerWidth(),$(el).outerHeight()))	

	$el.find('.title .text').text(cmp.title);

	cmp.titleBelow = top - $titleText.outerHeight() -6 < $(_window).scrollTop();
	cmp.titleTop = cmp.titleBelow ? cmp.top + cmp.height : cmp.top - $titleText.outerHeight() -6;
	cmp.titleLeft = cmp.left + (cmp.width - $titleText.outerWidth())/2;
	$el.find('.title .triangle').css({ marginLeft: $titleText.outerWidth()/2-6 })
}

jb.component('studio.highlight-in-preview',{
	params: [
		{ id: 'path', as: 'string' }
	],
	impl: (ctx,path) => {
     ctx.vars.ngZone.runOutsideAngular(() => {
		var _window = jbart.previewWindow || window;
		if (!_window) return;
		var elems = Array.from(_window.document.querySelectorAll('[jb-ctx]'))
			.filter(e=>
				_window.jbart.ctxDictionary[e.getAttribute('jb-ctx')].path == path)

		if (elems.length == 0) // try to look in studio
			elems = Array.from(document.querySelectorAll('[jb-ctx]'))
			.filter(e=>
				jbart.ctxDictionary[e.getAttribute('jb-ctx')].path == path)

		var boxes = [];
		
//		$('.jbstudio_highlight_in_preview').remove();
		
		elems.map(el=>$(el).children().first())
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
  	})
  }
})


})