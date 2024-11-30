dsl('zui')

component('posByContext', {
  type: 'feature',
  description: 'pos,size -> rInElem, inElem',
  params: [
    {id: 'fixedPos', as: 'array', defaultValue: [0,0]}
  ],
  impl: features(
    If('%$parentItemlistId%', gridElem(), fixedPos('%$fixedPos%')),
    If('%$parentItemlistId%', frontEnd.var('parentItemlistId', '%$parentItemlistId%'))
  )
})

component('sizeByContext', {
  type: 'feature',
  description: 'pos,size -> rInElem, inElem',
  params: [
    {id: 'highPrioritySize', type: 'zooming_size', dynamic: true, defaultValue: smoothGrowth({ base: [5,5], growthFactor: 0.1 })}
  ],
  impl: If('%$parentItemlistId%', zoomingSize('%$highPrioritySize()%',10))
})

component('fixedPos', {
  type: 'feature',
  description: 'pos,size -> rInElem, inElem',
  params: [
    {id: 'pos', as: 'array', defaultValue: [0,0]}
  ],
  impl: features(
    uniforms(canvasSize(), vec2('pos', '%$pos%')),
    variable('items', [1]),
    glAtt(float('dummy', 1)),
    vertexDecl('vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }'),
    varying('vec2', 'elemBottomLeftCoord', { glCode: '(elemBottomLeftNdc + 1.0) * (0.5*canvasSize)' }),
    vertexMainSnippet(`vec2 elemCenterPx = invertY(pos+size/2.0);
    vec2 itemTopLeftNdc = vec2(-1.0,1.0);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(pos+vec2(0.0,size[1])) / (0.5 * canvasSize);
    gl_PointSize = max(size[0],size[1]) * 1.42;
    gl_PointSize = max(size[0],size[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    shaderMainSnippet({
      code: `
        vec2 inElem = gl_FragCoord.xy- elemBottomLeftCoord;
        inElem = vec2(inElem[0], size[1] - inElem[1]);

        if (inElem[0] >= size[0] || inElem[1] >= size[1]) {
          gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
          return;
        }
        if (inElem[0] < 0.0 || inElem[1] < 0.0) {
          gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0); 
          return;
        }
        if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) {
          gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
          return;
        };
        vec2 rInElem = inElem/size;
    `,
      phase: 1
    })
  )
})

component('borderRadius', {
  type: 'feature',
  params: [
    {id: 'borderRadius', as: 'array', defaultValue: [5,5]}
  ],
  impl: features(
    uniforms(vec2('borderRadius', '%$borderRadius%')),
    shaderMainSnippet({
      code: `
      // Control points for each corner (adjusted for click effect)
      vec2 topLeft = borderRadius;
      vec2 topRight = vec2(size.x - borderRadius.x, borderRadius.y);
      vec2 bottomLeft = vec2(borderRadius.x, size.y - borderRadius.y);
      vec2 bottomRight = vec2(size.x - borderRadius.x, size.y - borderRadius.y);
    
      // Calculate the distance to each corner control point
      float distTopLeft = length(inElem - topLeft);
      float distTopRight = length(inElem - topRight);
      float distBottomLeft = length(inElem - bottomLeft);
      float distBottomRight = length(inElem - bottomRight);
    
      // Discard fragments outside the rounded corners
      if (inElem.x < borderRadius.x && inElem.y < borderRadius.y && distTopLeft > borderRadius.y) {
        discard;
      }
      if (inElem.x > size.x - borderRadius.x && inElem.y < borderRadius.y && distTopRight > borderRadius.y) {
        discard;
      }
      if (inElem.x < borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomLeft > borderRadius.x) {
        discard;
      }
      if (inElem.x > size.x - borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomRight > borderRadius.y) {
        discard;
      }
  `,
      phase: 2
    })
  )
})

component('textBackground', {
  type: 'feature',
  description: '',
  params: [
    {id: 'input', as: 'string', description: 'e.g.: texture2D(buttonTexture, rInElem)'},
    {id: 'outputVar', as: 'string', defaultValue: 'resColor'},
    {id: 'backgroundColor', as: 'array', defaultValue: [0.9,0.9,0.9]}
  ],
  impl: features(
    uniforms(vec3('backgroundColor', '%$backgroundColor%')),
    shaderMainSnippet({
      code: `
      vec4 %$outputVar% = %$input%;
      float tolerance = 0.005;
      if ((length(%$outputVar%.rgb - vec3(1.0)) < tolerance || %$outputVar%.a < tolerance) )  // If the texture pixel is white, use the background color
         %$outputVar% = vec4(backgroundColor,1.0);
  `,
      phase: 4
    })
  )
})