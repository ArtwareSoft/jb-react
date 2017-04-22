jb.type('image.style');

jb.component('image', {
	type: 'control', category: 'control:50',
	params: [
		{ id: 'url', as: 'string', dynamic:true },
		{ id: 'imageWidth', as: 'number' },
		{ id: 'imageHeight', as: 'number' },
		{ id: 'width', as: 'number' },
		{ id: 'height', as: 'number' },
		{ id: 'units', as: 'string', defaultValue : 'px'},
		{ id: 'style', type: 'image.style', dynamic: true, defaultValue: { $: 'image.default' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: function(context) {
		return jb_ui.ctrl(context).jbExtend({ init: function(cmp) {
			var image = context.params;
			var units = image.units;
			if (image.width) cmp.width = image.width + units;
			if (image.height) cmp.height = image.height + units;
			if (image.imageWidth) cmp.imageWidth = image.imageWidth + units;
			if (image.imageHeight) cmp.imageHeight = image.imageHeight + units;
			cmp.url = image.url();
		}},context);
	}
})

jb.component('image.default', {
	type: 'image.style',
	impl: {$: 'customStyle',
			template: `<div [style.width]="width" [style.height]="height">
			               <img [style.width]="imageWidth" [style.height]="imageHeight" src="{{url}}">
			           </div>`,
		}
})
