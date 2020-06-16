jb.type('theme');

jb.component('defaultTheme', {
  impl: ctx => jb.ui.addStyleElem(`
    body {
      /* vscode compatible with light theme */
      --jb-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
      --jb-font-size: 13px;
      --jb-font-weight: normal;
      --jb-foreground: #616161;
    
      --jb-menu-background: #ffffff;
      --jb-menu-foreground: #616161;
      --jb-menu-selectionBackground: #eee;
      --jb-menu-selectionForeground: #111;
      --jb-menu-separatorBackground: #888888;
      --jb-menubar-selectionBackground: rgba(0, 0, 0, 0.1);
      --jb-menubar-selectionForeground: #333333;
      --jb-titleBar-activeBackground: #dddddd;
      --jb-titleBar-activeForeground: #333333;
      --jb-titleBar-inactiveBackground: rgba(221, 221, 221, 0.6);
      --jb-titleBar-inactiveForeground: rgba(51, 51, 51, 0.6);
      --jb-dropdown-background: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-errorForeground: #a1260d;
    
      --jb-input-background: #ffffff;
      --jb-input-foreground: #616161;  
      --jb-textLink-activeForeground: #034775;
      --jb-textLink-foreground: #006ab1;

      --jb-on-primary: #ffffff;
      --jb-on-secondary: #616161;
      
      --jb-icon-foreground: #424242;
    
      --jb-list-activeSelectionBackground: #0074e8;
      --jb-list-activeSelectionForeground: #ffffff;
    
    
    /* mdc mappaing */
      --mdc-theme-primary: #616161; /* The theme primary color*/
      --mdc-theme-secondary: var(--jb-titleBar-activeBackground);
      --mdc-theme-background: var(--jb-input-background);
      --mdc-theme-surface: var(--jb-input-background);
      --mdc-theme-error: var(--jb-errorForeground);
    
      --mdc-theme-on-primary: var(--jb-on-primary); /* Primary text on top of a theme primary color background */
      --mdc-theme-on-secondary: var(--jb-on-secondary);
      --mdc-theme-on-surface: var(--jb-input-foreground);
      --mdc-theme-on-error: var(--jb-input-background);
    
      --mdc-theme-text-primary-on-background: var(--jb-input-foreground); /* Primary text on top of the theme background color. */
      --mdc-theme-text-secondary-on-background: var(--jb-input-foreground);
      --mdc-theme-text-hint-on-background: var(--jb-input-foreground);
      --mdc-theme-text-disabled-on-background: var(--jb-input-foreground);
      --mdc-theme-text-icon-on-background: var(--jb-input-foreground);
      
      --mdc-theme-text-primary-on-light: var(--jb-input-foreground); /* Primary text on top of a light-colored background */
      --mdc-theme-text-secondary-on-light: var(--jb-input-foreground);
      --mdc-theme-text-hint-on-light: var(--jb-input-foreground);
      --mdc-theme-text-disabled-on-light: var(--jb-input-foreground);
      --mdc-theme-text-icon-on-light: var(--jb-input-foreground);
                                
      --mdc-theme-text-primary-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-secondary-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-hint-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-disabled-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-icon-on-dark: var(--jb-menu-selectionForeground);
    /* jBart only */
      --jb-dropdown-shadow: #a8a8a8;
      --jb-tree-value: red;
      --jb-expandbox-background: green;
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
