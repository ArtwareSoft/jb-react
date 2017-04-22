jb.component('markdown', {
    type: 'control', category: 'control:20',
    params: [
        { id: 'markdown', as: 'string', essential: true, dynamic: true },
        { id: 'style', type: 'markdown.style', defaultValue: { $: 'markdown.showdown' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'markdown' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb_ui.ctrl(ctx)
})

jb.type('markdown.style');

jb.component('markdown.showdown2', {
    impl :{$: 'customStyle', 
        template: '<span></span>',
    }
})

jb.component('markdown.showdown', {
    type: 'markdown.style',
    impl: ctx => ({
        template: '<div [innerHTML]="markdownHtml"></div>',
        init: function(cmp) {
            cmp.markdownHtml = '';
        },
        doCheck: function(cmp) {
          var new_markdown = ctx.vars.$model.markdown(cmp.ctx);
          if (cmp.markdown != new_markdown) {
              cmp.markdown = new_markdown;
              cmp.markdownHtml = new showdown.Converter({tables:true})
                    .makeHtml(new_markdown);
          }
        }
    })
})
