jb.component('defaultTheme', {
  impl: ctx => jb.ui.addStyleElem(ctx,`
    body {
      /* vscode compatible with light theme */
      --jb-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
      --jb-font-size: 13px;
      --jb-font-weight: normal;
      --jb-fg: #616161;
    
      --jb-menu-bg: #ffffff;
      --jb-menu-fg: #616161;
      --jb-menu-selection-bg: #006ab1;
      --jb-menu-selection-fg: #ffffff;
      --jb-menu-separator-fg: #888888;
      --jb-menubar-selection-bg: rgba(0, 0, 0, 0.1);
      --jb-menubar-selection-fg: #333333;
      --jb-menubar-active-bg: #dddddd;
      --jb-menubar-active-fg: #333333;
      --jb-menubar-inactive-bg: rgba(221, 221, 221, 0.6);
      --jb-dropdown-bg: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-error-fg: #a1260d;
      --jb-success-fg: #4BB543;
      --jb-warning-fg: #ffcc00;
          
      --jb-input-bg: #ffffff;
      --jb-input-fg: #616161;
      --jb-textLink-active-fg: #034775;
      --jb-textLink-fg: #006ab1;

      --jb-on-primary: #ffffff;
      --jb-on-secondary: #616161;
      
      --jb-icon-fg: #424242;
    
      --jb-list-active-selection-bg: #0074e8;
      --jb-list-active-selection-fg: #ffffff;
    
    
    /* mdc mappaing */
      --mdc-theme-primary: #616161; /* The theme primary color*/
      --mdc-theme-secondary: var(--jb-menubar-active-bg);
      --mdc-theme-background: var(--jb-input-bg);
      --mdc-theme-surface: var(--jb-input-bg);
      --mdc-theme-error: var(--jb-error-fg);
    
      --mdc-theme-on-primary: var(--jb-on-primary); /* Primary text on top of a theme primary color background */
      --mdc-theme-on-secondary: var(--jb-on-secondary);
      --mdc-theme-on-surface: var(--jb-input-fg);
      --mdc-theme-on-error: var(--jb-input-bg);
    
      --mdc-theme-text-primary-on-background: var(--jb-input-fg); /* Primary text on top of the theme background color. */
      --mdc-theme-text-secondary-on-background: var(--jb-input-fg);
      --mdc-theme-text-hint-on-background: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-background: var(--jb-input-fg);
      --mdc-theme-text-icon-on-background: var(--jb-input-fg);
      
      --mdc-theme-text-primary-on-light: var(--jb-input-fg); /* Primary text on top of a light-colored background */
      --mdc-theme-text-secondary-on-light: var(--jb-input-fg);
      --mdc-theme-text-hint-on-light: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-light: var(--jb-input-fg);
      --mdc-theme-text-icon-on-light: var(--jb-input-fg);
                                
      --mdc-theme-text-primary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-secondary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-hint-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-disabled-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-icon-on-dark: var(--jb-menu-selection-fg);

    /* jBart only */
      --jb-dropdown-shadow: #a8a8a8;
      --jb-tree-value: red;
      --jb-expandbox-bg: green;
 `)
})

jb.component('group.theme', {
  type: 'feature',
  params: [
    {id: 'theme', type: 'theme'}
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => ctx.setVars(theme)
  })
})

jb.component('theme.materialDesign', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdc-input'
  })
})
