dsl('zui')

// component('sizeByContext', {
//   type: 'feature',
//   description: 'pos,size -> rInElem, inElem',
//   params: [
//     {id: 'highPrioritySize', type: 'zooming_size', dynamic: true, defaultValue: smoothGrowth({ base: [5,5], growthFactor: 0.1 })}
//   ],
//   impl: If('%$parentItemlistId%', zoomingSize('%$highPrioritySize()%',10))
// })


// component('borderRadius', {
//   type: 'feature',
//   params: [
//     {id: 'borderRadius', as: 'array', defaultValue: [5,5]}
//   ],
//   impl: features(
//     uniforms(vec2('borderRadius', '%$borderRadius%')),
//     shaderMainSnippet({
//       code: `// borderRadius
//       vec2 topLeft = borderRadius;
//       vec2 topRight = vec2(size.x - borderRadius.x, borderRadius.y);
//       vec2 bottomLeft = vec2(borderRadius.x, size.y - borderRadius.y);
//       vec2 bottomRight = vec2(size.x - borderRadius.x, size.y - borderRadius.y);    
//       float distTopLeft = length(inElem - topLeft);
//       float distTopRight = length(inElem - topRight);
//       float distBottomLeft = length(inElem - bottomLeft);
//       float distBottomRight = length(inElem - bottomRight);    
//       if (inElem.x < borderRadius.x && inElem.y < borderRadius.y && distTopLeft > borderRadius.y) { discard; }
//       if (inElem.x > size.x - borderRadius.x && inElem.y < borderRadius.y && distTopRight > borderRadius.y) { discard; }
//       if (inElem.x < borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomLeft > borderRadius.x) { discard; }
//       if (inElem.x > size.x - borderRadius.x && inElem.y > size.y - borderRadius.y && distBottomRight > borderRadius.y) { discard; }`,
//       phase: 2
//     })
//   )
// })

component('textByTexture', {
  type: 'feature',
  description: '',
  params: [
    {id: 'texture', as: 'string', defaultValue: 'titleTexture'},
  ],
  impl: features(
    shaderMainSnippet({
      code: `// textBackground
      float packRatio = 16.0;
      float bitsPerPixel = floor(32.0 / packRatio);
      float pixelsPerByte = floor(8.0 / bitsPerPixel);
      float unitX = floor(inGlyph.x / packRatio) * packRatio;
      vec2 rBase = (vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / glyphSize;
      vec4 unit = texture2D(%$texture%, rBase) * 255.0;
      float pixel = floor(inGlyph.x - unitX);
      int byteIndex = int(floor(pixel/pixelsPerByte));
      float byteValue = unit[3];
      if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
      
      float localPixelIndex = floor(mod(pixel, pixelsPerByte));
      float startBitIndex = bitsPerPixel * localPixelIndex;
      float noOfGrayColors = pow(2.0, bitsPerPixel);
      float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
      gl_FragColor = vec4(0.0, 0.0, 0.0, grayColor/(noOfGrayColors-1.0));
      `,
      phase: 4
    })
  )
})

// function flowTitleBlending(vec2 inGlyph)<cmpId> {
//   float packRatio = 16.0;
//   float bitsPerPixel = floor(32.0 / packRatio);
//   float pixelsPerByte = floor(8.0 / bitsPerPixel);
//   float unitX = floor(inGlyph.x / packRatio) * packRatio;
//   vec2 size = cmpPosSize_${cmpId}.size
//   vec2 rBase = (vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / size;
//   vec4 unit = texture2D(titleTexture_${cmpId}, rBase) * 255.0;
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

