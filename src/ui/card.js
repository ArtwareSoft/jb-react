jb.component('card', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'subTitle', as: 'string' },
    { id: 'text', as: 'string' },
    { id: 'image', as: 'image', essential: true, defaultValue:{$: 'image'} },
    { id: 'topButton', type: 'clickable' },
    { id: 'menu', type: 'menu', dynamic: true, flattenArray: true, essential: true, defaultValue: [] },
		{ id: 'style', type: 'card.style', dynamic: true, defaultValue :{$: 'card.simple' } },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('card.init', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      var model = ctx.vars.$model;
      cmp.setState({
					title: model.title(cmp.ctx),
					subTitle: model.subTitle(cmp.ctx),
					text: model.text(cmp.ctx),
			})
			cmp.imageCmp = model.image(cmp.ctx).reactComp();
			cmp.topButton = model.topButton(cmp.ctx).reactComp();
			cmp.menu = model.menu(cmp.ctx);
    }
  })
})

jb.component('card.simple', {
  type: 'card.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) =>
h('div',{ class: 'demo-card-wide mdl-card mdl-shadow--2dp' },
  h('div',{ class: 'mdl-card__title' },
    h('h2',{ class: 'mdl-card__title-text' }, state.title)),
  h('div',{ class: 'mdl-card__supporting-text' },state.text),
  h('div',{ class: 'mdl-card__actions mdl-card--border' },
	h(menu),
  h('div',{ class: 'mdl-card__menu' }, h(cmp.topButton) )
),
        css: `
				.demo-card-wide.mdl-card {
				  width: 512px;
				}
				.demo-card-wide > .mdl-card__title {
				  color: #fff;
				  height: 176px;
				  background: url('%$$model/image%') center / cover;
				}
				.demo-card-wide > .mdl-card__menu {
				  color: #fff;
				}				`
    }
})

// menu style
h('a',{ class: 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' },
	'Get Started')),
