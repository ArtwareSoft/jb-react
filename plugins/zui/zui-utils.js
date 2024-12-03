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
    varying('vec2', 'elemBottomLeftCoord', { glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))' }),
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
      code: `// borderRadius
      vec2 topLeft = borderRadius;
      vec2 topRight = vec2(size.x - borderRadius.x, borderRadius.y);
      vec2 bottomLeft = vec2(borderRadius.x, size.y - borderRadius.y);
      vec2 bottomRight = vec2(size.x - borderRadius.x, size.y - borderRadius.y);    
      float distTopLeft = length(inElem - topLeft);
      float distTopRight = length(inElem - topRight);
      float distBottomLeft = length(inElem - bottomLeft);
      float distBottomRight = length(inElem - bottomRight);    
      if (inElem.x < borderRadius.x && inElem.y < borderRadius.y && distTopLeft > borderRadius.y) { discard; }
      if (inElem.x > size.x - borderRadius.x && inElem.y < borderRadius.y && distTopRight > borderRadius.y) { discard; }
      if (inElem.x < borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomLeft > borderRadius.x) { discard; }
      if (inElem.x > size.x - borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomRight > borderRadius.y) { discard; }`,
      phase: 2
    })
  )
})

component('textBackground', {
  type: 'feature',
  description: '',
  params: [
    {id: 'textBackgroundColor', as: 'string', defaultValue: 'gray'},
    {id: 'texture', as: 'string', defaultValue: 'titleTexture'},
    {id: 'outputVar', as: 'string', defaultValue: 'resColor'},
  ],
  impl: features(
    colorUniform('textBackgroundColor', '%$textBackgroundColor%'),
    shaderMainSnippet({
      code: `// textBackground
      float packRatio = 16.0;
      float bitsPerPixel = floor(32.0 / packRatio);
      float pixelsPerByte = floor(8.0 / bitsPerPixel);
      float unitX = floor(inElem.x / packRatio) * packRatio;
      vec2 rBase = (vec2(unitX + 0.5, floor(inElem.y) + 0.5)) / size;
      vec4 unit = texture2D(%$texture%, rBase) * 255.0;
      float pixel = floor(inElem.x - unitX);
      int byteIndex = int(floor(pixel/pixelsPerByte));
      float byteValue = unit[3];
      if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
      
      float localPixelIndex = floor(mod(pixel, pixelsPerByte));
      float startBitIndex = bitsPerPixel * localPixelIndex;
      float noOfGrayColors = pow(2.0, bitsPerPixel);
      float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
      gl_FragColor = vec4(0.0, 0.0, 0.0, grayColor/(noOfGrayColors-1.0));
      return;
      `,
      phase: 4
    })
  )
})
