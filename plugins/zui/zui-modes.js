dsl('zui')

component('modeByContext', {
  type: 'feature',
  impl: features(
    If('%$zuiMode%==fixed', fixedMode()),
    If('%$zuiMode%==flow', flowMode()),
    If('%$zuiMode%==zoomingGrid', zoomingGridMode()),
    If('%$zuiMode%==dynamicFlow', dynamicFlowMode()),
  )
})

component('fixedMode', {
  type: 'feature',
  impl: features(
    uniforms(canvasSize(), vec2('fixedPos', zui.fix2('%$cmp.fixedPos%'))),
    variable('items', [1]),
    glAtt(float('dummy', 1)),
    vertexDecl('vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }'),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    defaultGlVarsAsUniforms(),
    vertexMainSnippet(`vec2 elemCenterPx = invertY(fixedPos+elemSize/2.0);
    vec2 itemTopLeftNdc = vec2(-1.0,1.0);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(fixedPos+vec2(0.0,elemSize[1])) / (0.5 * canvasSize);
    gl_PointSize = max(elemSize[0],elemSize[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    simpleShaderMain()
  )
})

component('flowMode', {
  type: 'feature',
  impl: features(
  )
})

component('zoomingGridMode', {
  type: 'feature',
  impl: features(
  )
})

component('dynamicFlowMode', {
  type: 'feature',
  impl: features(
  )
})

component('defaultGlVarsAsUniforms', {
  type: 'feature',
  impl: features(
    uniforms(
      vec4('margin', zui.fix4('%$cmp.margin%')),
      vec4('borderWidth', zui.fix4('%$cmp.borderWidth%')),
      vec4('borderRadius', zui.fix4('%$cmp.borderRadius%')),
      vec4('padding', zui.fix4('%$cmp.padding%'))
    ),
    fixedBorderColor('white'),
    fixedBackgroundColor('white')
  )
})

component('simpleTitleBlending', {
  type: 'feature',
  impl: features(If('%$$props/titleImage', shaderDecl({
      code: `
    float simpleTitleBlending(vec2 inGlyph, vec2 glyphSize) {
      float packRatio = 16.0;
      float bitsPerPixel = floor(32.0 / packRatio);
      float pixelsPerByte = floor(8.0 / bitsPerPixel);
      float unitX = floor(inGlyph.x / packRatio) * packRatio;
      vec2 rBase = (vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / glyphSize;
      vec4 unit = texture2D(titleTexture, rBase) * 255.0;
      float pixel = floor(inGlyph.x - unitX);
      int byteIndex = int(floor(pixel/pixelsPerByte));
      float byteValue = unit[3];
      if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
      
      float localPixelIndex = floor(mod(pixel, pixelsPerByte));
      float startBitIndex = bitsPerPixel * localPixelIndex;
      float noOfGrayColors = pow(2.0, bitsPerPixel);
      float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
      return grayColor/(noOfGrayColors-1.0);
    }`
  })))
})

component('simpleShaderMain', {
  type: 'feature',
  impl: features(
    shaderDecl({
      code: `struct box {
      vec2 pos;
      vec2 size;
  };
  
  struct pixelInfo {
      vec2 inGlyph;
      vec2 glyphSize;
      int elemPart;
      int cmpId;
  };

  float simpleTitleBlending(vec2 inGlyph, vec2 glyphSize) {
    float packRatio = 16.0;
    float bitsPerPixel = floor(32.0 / packRatio);
    float pixelsPerByte = floor(8.0 / bitsPerPixel);
    float unitX = floor(inGlyph.x / packRatio) * packRatio;
    vec2 rBase = (vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / glyphSize;
    vec4 unit = texture2D(titleTexture, rBase) * 255.0;
    float pixel = floor(inGlyph.x - unitX);
    int byteIndex = int(floor(pixel/pixelsPerByte));
    float byteValue = unit[3];
    if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
    
    float localPixelIndex = floor(mod(pixel, pixelsPerByte));
    float startBitIndex = bitsPerPixel * localPixelIndex;
    float noOfGrayColors = pow(2.0, bitsPerPixel);
    float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
    return grayColor/(noOfGrayColors-1.0);
  }
  
  pixelInfo simplePixelInfo() {
      vec2 inElem = gl_FragCoord.xy - elemBottomLeftCoord;
      inElem = vec2(inElem[0], elemSize[1] - inElem[1]); // flipY
  
      // Check if the pixel is out of bounds
      if (inElem[0] >= elemSize[0] || inElem[1] >= elemSize[1]) { 
          gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
          discard; 
      }
      if (inElem[0] < 0.0 || inElem[1] < 0.0) { 
          gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0); 
          discard; 
      }
  
      vec2 rInElem = inElem / elemSize;
      int elemPart = 0; // Default to Margin
  
      // Define boxes
      box marginBox = box(vec2(0.0), elemSize);
      box borderBox = box(marginBox.pos + margin.xy, marginBox.size - margin.zw);
      box paddingBox = box(borderBox.pos + borderWidth.xy, borderBox.size - borderWidth.zw);
      box glyphBox = box(paddingBox.pos + padding.xy, paddingBox.size - padding.zw);
  
      // Determine element part (margin, border, padding, glyph)
      if (inElem.x >= borderBox.pos.x && inElem.x <= borderBox.pos.x + borderBox.size.x &&
          inElem.y >= borderBox.pos.y && inElem.y <= borderBox.pos.y + borderBox.size.y) {
          elemPart = 1; // Border
          // Split specific border positions
          if (inElem.y <= borderBox.pos.y + borderWidth.y) elemPart = 1; // Top border
          else if (inElem.x >= borderBox.pos.x + borderBox.size.x - borderWidth.z) elemPart = 2; // Right border
          else if (inElem.y >= borderBox.pos.y + borderBox.size.y - borderWidth.w) elemPart = 3; // Bottom border
          else if (inElem.x <= borderBox.pos.x + borderWidth.x) elemPart = 4; // Left border
      }
      if (inElem.x >= paddingBox.pos.x && inElem.x <= paddingBox.pos.x + paddingBox.size.x &&
          inElem.y >= paddingBox.pos.y && inElem.y <= paddingBox.pos.y + paddingBox.size.y) {
          elemPart = 5; // Padding
      }
      if (inElem.x >= glyphBox.pos.x && inElem.x <= glyphBox.pos.x + glyphBox.size.x &&
          inElem.y >= glyphBox.pos.y && inElem.y <= glyphBox.pos.y + glyphBox.size.y) {
          elemPart = 6; // Glyph
      }
  
      // Handle border radius
      if (elemPart < 6) { // Only for border-related parts
          vec2 topLeft = borderBox.pos + vec2(borderRadius.x, borderRadius.y);
          vec2 topRight = vec2(borderBox.pos.x + borderBox.size.x - borderRadius.x, borderBox.pos.y + borderRadius.y);
          vec2 bottomLeft = vec2(borderBox.pos.x + borderRadius.x, borderBox.pos.y + borderBox.size.y - borderRadius.y);
          vec2 bottomRight = vec2(borderBox.pos.x + borderBox.size.x - borderRadius.x, borderBox.pos.y + borderBox.size.y - borderRadius.y);
  
          float distTopLeft = length(inElem - topLeft);
          float distTopRight = length(inElem - topRight);
          float distBottomLeft = length(inElem - bottomLeft);
          float distBottomRight = length(inElem - bottomRight);
  
          // Adjust elemPart based on distance to rounded corners
          if (inElem.x < borderRadius.x && inElem.y < borderRadius.y && distTopLeft > borderRadius.x) {
              elemPart = 7; // Top-left rounded corner
          }
          if (inElem.x > borderBox.pos.x + borderBox.size.x - borderRadius.x && inElem.y < borderRadius.y && distTopRight > borderRadius.x) {
              elemPart = 8; // Top-right rounded corner
          }
          if (inElem.x < borderRadius.x && inElem.y > borderBox.pos.y + borderBox.size.y - borderRadius.y && distBottomLeft > borderRadius.x) {
              elemPart = 9; // Bottom-left rounded corner
          }
          if (inElem.x > borderBox.pos.x + borderBox.size.x - borderRadius.x && inElem.y > borderBox.pos.y + borderBox.size.y - borderRadius.y && distBottomRight > borderRadius.x) {
              elemPart = 10; // Bottom-right rounded corner
          }
      }
  
      // Discard if still in margin (elemPart == 0)
      if (elemPart == 0) discard;
  
      // Return pixel info
      return pixelInfo(inElem - glyphBox.pos, glyphBox.size, elemPart, 0); // cmpId is 0 as a placeholder
  }`,
      phase: 1
    }),
    shaderMainSnippet({
      code: `// simple main
      vec2 inElem = gl_FragCoord.xy- elemBottomLeftCoord;
      inElem = vec2(inElem[0], elemSize[1] - inElem[1]); // flipY
      pixelInfo info = simplePixelInfo();
      vec2 inGlyph = info.inGlyph;
      vec2 glyphSize = info.glyphSize;
      int elemPart = info.elemPart;
      if (elemPart == 0) discard;
      if (elemPart < 5) { gl_FragColor = vec4(borderColor, 1.0); return; } 
      `,
      phase: 4
    })
  )
})

component('flowShaderMain', {
  type: 'feature',
  params: [
  ],
  impl: features(
    shaderMainSnippet({
      code: `// flowShaderMain
      vec2 inTopElem = gl_FragCoord.xy- elemBottomLeftCoord;
      vec2 inTopElem = vec2(inTopElem[0], elemSize[1] - inTopElem[1]); // flipY
      pixelInfo info = flowPixelInfo(); // child SizePos
      vec2 inGlyph = info.inGlyph;
      vec2 glyphSize = info.glyphSize;
      int elemPart = info.elemPart;
      int cmp = info.cmp;

      if (elemPart == 0) discard;

      //...all unique(uniforms) of all cmps with defaults
      if (cmp == 101) {
        borderColor = borderColor_101
        ... other uniforms of cmp101
      } else if (cmp == 102) {
        borderColor = borderColor_102
        ...
        if (elemPart >= 6)
          text_opacity = titleBlending_102(inGlyph);
      }

      if (elemPart < 5)
        gl_FragColor = vec4(borderColor, 1.0);
      else if (elemPart >= 6)
        gl_FragColor = vec4(backgroundColor, text_opacity);
      `,
      phase: 4
    })
  )
})


// void flowMain() {
//   vec2 inTopElem = gl_FragCoord.xy- elemBottomLeftCoord;
//   inTopElem = vec2(inTopElem[0], elemSize[1] - inTopElem[1]); // flipY
//   {inGlyph, elemPart, cmpId} = flowPixelInfo()
//   if (elemPart == 0) discard;

//   //...all unique(uniforms) of all cmps with defaults
//   float text_opacity = 1.0;
//   if (cmp == 101) {
//     borderColor = borderColor_101
//     ... other uniforms of cmp101
//   } else if (cmp == 102) {
//     borderColor = borderColor_102
//     ...
//     if (elemPart >= 6)
//       text_opacity = titleBlending_102(inGlyph);
//   }

//   if (elemPart < 5) {
//     gl_FragColor = vec4(borderColor, 1.0)  
//     return;
//   }
//   if (elemPart >= 6)
//     gl_FragColor = vec4(backgroundColor, text_opacity);
// }

// void DEFflowMain() {
//   vec2 inTopElem = gl_FragCoord.xy- elemBottomLeftCoord;
//   inTopElem = vec2(inTopElem[0], elemSize[1] - inTopElem[1]); // flipY
//   {inGlyph, elemPart, cmpId} = flowPixelInfo()
//   if (elemPart == 0) discard;

//   //...all unique(uniforms) of all cmps with defaults
//   float text_opacity = 1.0;
//   if (cmp == 101) {
//     borderColor = borderColor_101
//     ... other uniforms of cmp101
//   } else if (cmp == 102) {
//     borderColor = borderColor_102
//     ...
//     if (elemPart >= 6)
//       text_opacity = titleBlending_102(inGlyph);
//   }

//   if (elemPart < 5) {
//     gl_FragColor = vec4(borderColor, 1.0)  
//     return;
//   }
//   if (elemPart >= 6)
//     gl_FragColor = vec4(backgroundColor, text_opacity);
// }


// function DEFflowTitleBlending(vec2 inGlyph)<cmpId> {
//   float packRatio = 16.0;
//   float bitsPerPixel = floor(32.0 / packRatio);
//   float pixelsPerByte = floor(8.0 / bitsPerPixel);
//   float unitX = floor(inGlyph.x / packRatio) * packRatio;
//   vec2 size = titleTextureAtlasPosSize_${cmpId}.size
//   vec2 imagePos = vec2(unitX + 0.5, floor(inGlyph.y) + 0.5);
//   vec2 atlasPos = titleTextureAtlasPosSize_${cmpId}.pos + imagePos
//   vec4 unit = texture2D(titleTextureAtlas_${cmpId}, atlasPos / size) * 255.0;
//   float pixel = floor(inGlyph.x - unitX);
//   int byteIndex = int(floor(pixel/pixelsPerByte));
//   float byteValue = unit[3];
//   if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
  
//   float localPixelIndex = floor(mod(pixel, pixelsPerByte));
//   float startBitIndex = bitsPerPixel * localPixelIndex;
//   float noOfGrayColors = pow(2.0, bitsPerPixel);
//   float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
//   return grayColor/(noOfGrayColors-1.0);
// }
