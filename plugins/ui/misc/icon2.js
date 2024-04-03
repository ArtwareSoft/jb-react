
component('icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: {$: 'icon.span'}},
    {id: 'features', type: 'icon-feature[]'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})
  
component('icon.init', {
  type: 'feature',
  category: 'icon:0',
  impl: features(calcProp('icon'), calcProp('title'))
})
  
component('clickable', {
  type: 'icon-feature',
  impl: htmlAttribute('onclick', true)
})

component('solid', {
  type: 'icon-feature',
  impl: css('font-weight: 900')
})

component('normal', {
  type: 'icon-feature',
  impl: css('font-weight: 400')
})

component('raised', {
  type: 'icon-feature',
  impl: css('text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)')
})

component('on', {
  type: 'icon-feature',
  impl: css('opacity: 1')
})

component('off', {
  type: 'icon-feature',
  impl: css('opacity: 0.5')
})

component('round', {
  type: 'icon-feature',
  impl: css('border-radius: 50%; overflow: hidden;')
})

component('size', {
  type: 'icon-feature',
  params: [
    {id: 'size', as: 'string', options: ['extra-small', 'small', 'medium', 'large', 'extra-large', 'double-extra-large']}
  ],
  impl: css(({},{},{ size }) => {
    const sizeMap = {
      'extra-small': { fontSize: '0.625em', lineHeight: '0.1em', verticalAlign: '0.225em' },
      'small': { fontSize: '0.75em', lineHeight: '0.08333em', verticalAlign: '0.125em' },
      'medium': { fontSize: '0.875em', lineHeight: '0.07143em', verticalAlign: '0.05357em' },
      'large': { fontSize: '1.25em', lineHeight: '0.05em', verticalAlign: '-0.075em' },
      'extra-large': { fontSize: '1.5em', lineHeight: '0.04167em', verticalAlign: '-0.125em' },
      'double-extra-large': { fontSize: '2em', lineHeight: '0.03125em', verticalAlign: '-0.1875em' }
    };
    return `font-size: ${sizeMap[size].fontSize};line-height: ${sizeMap[size].lineHeight};vertical-align: ${sizeMap[size].verticalAlign}`
  })
})

component('fixedWidth', {
  type: 'icon-feature',
  impl: css('text-align: center;width: 1.25em')
})

component('clickable', {
    type: 'icon-feature',
    impl: htmlAttribute('onclick', true)
})

//  TODO: border, pull-left/right, 

component('subIcon', {
  type: 'icon-feature',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'position', as: 'string', defaultValue: 'center-center', options: ['top-left', 'top-center', 'top-right', 'center-left', 'center-center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']}
  ],
  impl: css(({},{},{ icon, position }) => {
    const [vertical, horizontal] = position.split('-')
    const positionMap = {
      top: '0%',
      center: '50%',
      bottom: '100%',
      left: '0%',
      right: '100%'
    }
    return `
      ~ {position: relative}
      ~::after {
        font-family: "${jb.path(jb.ui.fontRep,[icon,'font'])}",
        content: "&#x${jb.path(jb.ui.fontRep,[icon,'code'])}";
        position: absolute;
        width: 50%;
        height: 50%;
        top: ${positionMap[vertical]};
        left: ${positionMap[horizontal]};
        transform: translate(${horizontal === 'center' ? '-50%' : '0'}, ${vertical === 'center' ? '-50%' : '0'});
      }
    `
  })
})

component('icon.span', {
    type: 'icon-style',
    impl: customStyle({
      template: (cmp,{icon, title,size},h) => h('span',
          { title: title(), style: {
            'font-family': jb.path(jb.ui.fontRep,[icon,'font']), 'font-size': `${size}px`, 
          }}, `&#x${jb.path(jb.ui.fontRep,[icon,'code'])};`),
      features: [
        frontEnd.requireExternalLibrary('fonts/allFontsRepository.js'),
        frontEnd.requireExternalLibrary('Material Icons::fonts/MaterialIcons-Regular.woff2'),
        frontEnd.requireExternalLibrary('Material Design Icons::fonts/materialdesignicons-webfont.woff2'),
        frontEnd.requireExternalLibrary('Font Awesome 6 Free:400:css/fa-regular-400.woff2','Font Awesome 6 Free:900:css/fa-solid-900.woff2'),
        icon.init()
      ]
  })
})

component('icon', {
    type: 'feature',
    params: [
      {id: 'icon', as: 'string', mandatory: true},
      {id: 'size', type: 'icon-size'},
      {id: 'fixPosition', type: 'icon-position'},
      {id: 'features', type: 'icon-feature[]', dynamic: true}
    ],
    impl: css('')
})

component('bulletPoints', {
  params: [
    {id: 'icon', as: 'string', mandatory: true}
  ],
  impl: css(({},{},{icon}) => `
    ~ {
      list-style-type: none;
      margin-left: 2.5em;
      padding-left: 0;
    }
    ~ > li {
      position: relative;
    }
    ~ > li::before {
      font-family: "${jb.path(jb.ui.fontRep,[icon,'font'])}",
      content: "&#x${jb.path(jb.ui.fontRep,[icon,'code'])}";
      position: absolute;
      left: -1em;
    }
  `)
})

component('toolbar-with-icons', {
  type: 'feature',
  impl: css(`
    ~ {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    > button {
      display: inline-block;
      margin-right: 0.5em;
      padding: 0.5em 1em;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    > button:hover {
      background-color: #e0e0e0;
    }
  `)
})
  
  /*
  When working with icons, especially when using icon fonts or SVG icons, several CSS features and properties can be relevant or important for styling and rendering icons effectively. Here are some key considerations:
  
  Font Size: Setting the font-size property allows you to control the size of the icon. Icons are often scalable and can be resized without losing quality.
  
  Color: The color property can be used to change the color of the icon. This is useful for matching the icon color with the rest of the design.
  
  Padding and Margin: Using padding and margin can help control the spacing around the icon, ensuring it aligns correctly with other elements on the page.
  
  Positioning: CSS positioning properties (position, top, bottom, left, right) can be used to precisely position icons within their container.
  
  Display: Depending on the layout, using display: inline-block; or display: block; can affect how icons are positioned in relation to other elements.
  
  Text Align: If icons are displayed inline with text, text-align can be used to align them horizontally within their container.
  
  Opacity and Transitions: Adding opacity and transition effects can enhance the visual appearance of icons, especially when hovering or interacting with them.
  
  Vertical Alignment: Use vertical-align to align icons vertically within text or other elements.
  
  Background and Border: Applying background-color, border, and border-radius can create stylized icon containers.
  
  Flexbox/Grid: Utilizing Flexbox or CSS Grid can help create flexible layouts for icons and other content.
  
  Pseudo-classes: Use pseudo-classes like :hover, :active, or :focus to add interactivity to icons.
  
  Text Shadow: Adding a subtle text-shadow can enhance the visibility of icons, especially on light backgrounds.
  */