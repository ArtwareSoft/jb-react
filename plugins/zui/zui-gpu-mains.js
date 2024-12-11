dsl('zui')

component('mainByContext', {
  type: 'feature',
  impl: features(
    basicCodeUtils(),
    If('%$renderRole%==fixed', fixedMain()),
    If('%$renderRole%==flowTop', flowTopMain()),
    If(and('%$inZoomingGrid%','%$renderRole%==dynamicFlowTop'), dynamicFlowTopMain()),
    If(and('%$inZoomingGrid%','%$renderRole%!=dynamicFlowElem'), zoomingGridMain())
  )
})

component('fixedMain', {
  type: 'feature',
  impl: features(
    uniforms(canvasSize(), vec2('elemPos', zui.fix2('%$cmp.fixedPos%'))),
    variable('items', [1]),
    glAtt(float('dummy', 1)),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    varying('vec2', 'itemBottomLeftCoord', { glCode: 'vec2(0.0)' }),
    defaultGlVarsAsUniforms(),
    vertexMainSnippet(`// fixed main
    vec2 elemCenterPx = invertY(elemPos+elemSize/2.0);
    vec2 itemTopLeftNdc = vec2(-1.0,1.0);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(elemPos+vec2(0.0,elemSize[1])) / (0.5 * canvasSize);
    gl_PointSize = max(elemSize[0],elemSize[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    simpleShaderMain()
  )
})

component('zoomingGridMain', {
  type: 'feature',
  circuit: 'zuiTest.zoomingGrid',
  impl: features(
    frontEnd.uniforms(
      float('zoom', '%$widget.state.zoom%'),
      vec2('center', '%$widget.state.center%'),
      vec2('elemPos', '%$elemLayout.pos%'),
      vec2('elemSize', '%$elemLayout.size%')
    ),
    uniforms(
      canvasSize(),
      vec2('gridSize', '%$itemsLayout/gridSize%'),
      float('zoom', '%$itemsLayout/initialZoom%'),
      vec2('center', '%$itemsLayout/center%'),
      vec2('elemPos', [0,0]),
      vec2('elemSize', [0,0])
    ),
    glAtt(vec2('itemPos', '%$item.xyPos%')),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    varying('vec2', 'itemBottomLeftCoord', { glCode: '((itemPos-1.0 - center) / (0.5*zoom) + 1.0) * (0.5*canvasSize)' }),
    defaultGlVarsAsUniforms(),
    vertexMainSnippet(`// zoomingGridMain
    vec2 elemCenterPx = invertY(elemPos+elemSize/2.0);
    vec2 itemTopLeftNdc = (itemPos - center) / (0.5*zoom);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(elemPos+vec2(0.0,elemSize[1])) / (0.5 * canvasSize);
    gl_PointSize = max(elemSize[0],elemSize[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    simpleShaderMain()
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
    color('border'),
    color('background')
  )
})

component('inElemPixelInfo', {
  type: 'feature',
  impl: shaderDecl(({},{cmp}) => `
  pixelInfo inElemPixelInfo(vec2 inElem) {
    if (inElem[0] >= elemSize[0] || inElem[1] >= elemSize[1]) { gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); discard; }
    if (inElem[0] < 0.0 || inElem[1] < 0.0) { gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); discard; }

    vec2 rInElem = inElem / elemSize;
    int elemPart = 0; // Default to Margin

    box marginBox = box(vec2(0.0), elemSize);
    ${cmp.borderWidth ? `box borderBox = box(marginBox.pos + margin.xy, marginBox.size - margin.zw);
    box paddingBox = box(borderBox.pos + borderWidth.xy, borderBox.size - borderWidth.zw);`
    : 'box paddingBox = box(marginBox.pos + margin.xy, marginBox.size - margin.zw);'}
    box glyphBox = box(paddingBox.pos + padding.xy, paddingBox.size - padding.zw);

    ${cmp.borderWidth ? `
    // Determine element part (margin, border, padding, glyph)
    if (inElem.x >= borderBox.pos.x && inElem.x <= borderBox.pos.x + borderBox.size.x &&
        inElem.y >= borderBox.pos.y && inElem.y <= borderBox.pos.y + borderBox.size.y) {
        elemPart = 1; // Border
        // Split specific border positions
        if (inElem.y <= borderBox.pos.y + borderWidth.y) elemPart = 1; // Top border
        else if (inElem.x >= borderBox.pos.x + borderBox.size.x - borderWidth.z) elemPart = 2; // Right border
        else if (inElem.y >= borderBox.pos.y + borderBox.size.y - borderWidth.w) elemPart = 3; // Bottom border
        else if (inElem.x <= borderBox.pos.x + borderWidth.x) elemPart = 4; // Left border
    }` : ''}
    if (inElem.x >= paddingBox.pos.x && inElem.x <= paddingBox.pos.x + paddingBox.size.x && inElem.y >= paddingBox.pos.y && inElem.y <= paddingBox.pos.y + paddingBox.size.y)
        elemPart = 5; // Padding
    if (inElem.x >= glyphBox.pos.x && inElem.x <= glyphBox.pos.x + glyphBox.size.x && inElem.y >= glyphBox.pos.y && inElem.y <= glyphBox.pos.y + glyphBox.size.y)
        elemPart = 6; // Glyph

    ${cmp.borderRadius ? `
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
    }` : ''}
    if (elemPart == 0) discard; // margin  
    return pixelInfo(inElem - glyphBox.pos, glyphBox.size, elemPart, 0);
  }`)
})

component('simpleShaderMain', {
  type: 'feature',
  impl: features(
    inElemPixelInfo(),
    shaderMainSnippet({
      code: `// simpleShaderMain
      vec2 inElem = gl_FragCoord.xy - elemBottomLeftCoord;
      vec2 outOfItem = gl_FragCoord.xy - itemBottomLeftCoord;
      if (outOfItem.x < 0.0 || outOfItem.y < 0.0) discard;
      inElem = vec2(inElem[0], elemSize[1] - inElem[1]); // flipY
      pixelInfo info = inElemPixelInfo(inElem);
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

// -- flow Mode

component('flowTopMain', {
  type: 'feature',
  impl: features(
    uniforms(canvasSize(), vec2('topElemSize', zui.fix2('%$cmp.topElemSize%'))),
    glAtt(float('dummy', 1)),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    varying('vec2', 'itemBottomLeftCoord', { glCode: 'vec2(0.0)' }),
    defaultGlVarsAsUniforms(),
    vertexMainSnippet(`// flowTopMain
    vec2 elemCenterPx = invertY(topElemSize/2.0);
    vec2 itemTopLeftNdc = vec2(-1.0,1.0);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(vec2(0.0,topElemSize[1])) / (0.5 * canvasSize);
    gl_PointSize = max(topElemSize[0],topElemSize[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    flowShaderMain()
  )
})

component('flowPixelInfo', {
  type: 'feature',
  impl: shaderDecl(`
  pixelInfo inElemFlowPixelInfo(int cmpIndex, vec2 inElem, vec2 elemSize, vec4 margin, vec4 borderWidth, vec4 padding, vec2 borderRadius ) {
    if (inElem[0] >= elemSize[0] || inElem[1] >= elemSize[1]) { gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); discard; }
    if (inElem[0] < 0.0 || inElem[1] < 0.0) { gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0); discard; }

    vec2 rInElem = inElem / elemSize;
    int elemPart = 0; // Default to Margin

    box marginBox = box(vec2(0.0), elemSize);
    box borderBox = box(marginBox.pos + margin.xy, marginBox.size - margin.zw);
    box paddingBox = box(borderBox.pos + borderWidth.xy, borderBox.size - borderWidth.zw);
    box glyphBox = box(paddingBox.pos + padding.xy, paddingBox.size - padding.zw);
    // Determine element part (margin, border, padding, glyph)
    if (inElem.x >= borderBox.pos.x && inElem.x <= borderBox.pos.x + borderBox.size.x && inElem.y >= borderBox.pos.y && inElem.y <= borderBox.pos.y + borderBox.size.y) {
        elemPart = 1; // Border
        // Split specific border positions
        if (inElem.y <= borderBox.pos.y + borderWidth.y) elemPart = 1; // Top border
        else if (inElem.x >= borderBox.pos.x + borderBox.size.x - borderWidth.z) elemPart = 2; // Right border
        else if (inElem.y >= borderBox.pos.y + borderBox.size.y - borderWidth.w) elemPart = 3; // Bottom border
        else if (inElem.x <= borderBox.pos.x + borderWidth.x) elemPart = 4; // Left border
    }
    if (inElem.x >= paddingBox.pos.x && inElem.x <= paddingBox.pos.x + paddingBox.size.x && inElem.y >= paddingBox.pos.y && inElem.y <= paddingBox.pos.y + paddingBox.size.y)
        elemPart = 5; // Padding
    if (inElem.x >= glyphBox.pos.x && inElem.x <= glyphBox.pos.x + glyphBox.size.x && inElem.y >= glyphBox.pos.y && inElem.y <= glyphBox.pos.y + glyphBox.size.y)
        elemPart = 6; // Glyph

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
    if (elemPart == 0) discard; // margin  
    return pixelInfo(inElem - glyphBox.pos, glyphBox.size, elemPart, cmpIndex);
  }`)
})

component('flowShaderMain', {
  type: 'feature',
  params: [],
  impl: features(
    basicCodeUtils(),
    flowPixelInfo(),
    shaderDecl(({},{cmp}) => `
  pixelInfo flowPixelInfo(vec2 inTopElem) {
    // elemParts_xx[0] - sizePos
${cmp.shownChildren.map((fCmp,i)=>`\tif (inBox(inTopElem - elemParts_${i}[0].zw, elemParts_${i}[0].xy))
        return inElemFlowPixelInfo(${i}, inTopElem - elemParts_${i}[0].zw, elemParts_${i}[0].xy, elemParts_${i}[1], elemParts_${i}[2], elemParts_${i}[3], elemParts_${i}[4].xy);`)
      .join('\n')}
      return pixelInfo(vec2(0.0), vec2(0.0), 0, -1);
  }`),
    shaderMainSnippet({
      code: (ctx,{cmp}) => `// flowShaderMain
      vec2 inTopElem = gl_FragCoord.xy - elemBottomLeftCoord;
      vec2 outOfItem = gl_FragCoord.xy - itemBottomLeftCoord;
      if (outOfItem.x < 0.0 || outOfItem.y < 0.0) discard;

      inTopElem = vec2(inTopElem[0], topElemSize[1] - inTopElem[1]); // flipY
      pixelInfo info = flowPixelInfo(inTopElem); // child SizePos
      vec2 inGlyph = info.inGlyph;
      vec2 glyphSize = info.glyphSize;
      int elemPart = info.elemPart;
      int cmp = info.cmpIndex;

      if (elemPart == 0) discard;
      if (elemPart < 5) { gl_FragColor = vec4(borderColor, 1.0); return; }       

${cmp.shownChildrenUniforms.filter(u=>u.glType!='sampler2D').map(({glType,glVar})=> `\t  ${glType} ${glVar};`).join('\n')}
  vec2 elemSize;
  if (cmp == -1) { gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5); return; }
  // if (cmp == 0) { gl_FragColor = vec4(1.0, 0.0, 0.0, inGlyph/glyphSize); return;}
  // if (cmp == 1) { gl_FragColor = vec4(0.0, 1.0, 0.0, textFlowBlending(1, inGlyph, glyphSize, vec2(0.0), 4.0)); return;}
  // if (cmp == 2) { gl_FragColor = vec4(0.0, 0.0, 1.0, textFlowBlending(2, inGlyph, glyphSize, vec2(0.0), 4.0)); return;}

      ${cmp.shownChildren.map((fCmp,i)=>`if (cmp == ${i}) {
      elemSize = elemParts_${i}[0].xy;
${fCmp.glVars.uniforms.filter(u=>u.glType!='sampler2D').map(({glVar})=> `\t  ${glVar} = ${glVar}_${i};`).join('\n')}
  ${(cmp.shaderMainSnippets[i]||[]).join('')}
      }`).join('\n')}
      `,
      phase: 4
    })
  )
})

// -- dynamic flow Mode

component('dynamicFlowTopMain', {
  type: 'feature',
  impl: features(
    basicCodeUtils(),
    frontEnd.uniforms(
      float('zoom', '%$widget.state.zoom%'),
      vec2('center', '%$widget.state.center%'),
      vec2('topElemPos', '%$elemLayout.pos%'),
      vec2('topElemSize', '%$elemLayout.size%')
    ),
    uniforms(
      canvasSize(),
      vec2('gridSize', '%$itemsLayout/gridSize%'),
      float('zoom', '%$itemsLayout/initialZoom%'),
      vec2('center', '%$itemsLayout/center%'),
      vec2('topElemPos', [0,0]),
      vec2('topElemSize', [0,0])
    ),
    color('border'),
    color('background'),
    glAtt(vec2('itemPos', '%$item.xyPos%')),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    varying('vec2', 'itemBottomLeftCoord', { glCode: '((itemPos-1.0 - center) / (0.5*zoom) + 1.0) * (0.5*canvasSize)' }),
    vertexMainSnippet(`vec2 elemCenterPx = invertY(topElemPos+topElemSize/2.0);
    vec2 itemTopLeftNdc = (itemPos - center) / (0.5*zoom);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(topElemPos+vec2(0.0,topElemSize[1])) / (0.5 * canvasSize);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    gl_PointSize = max(topElemSize[0],topElemSize[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    dynamicFlowShaderMain()
  )
})

component('dynamicFlowShaderMain', {
  type: 'feature',
  params: [],
  impl: features(
    flowPixelInfo(),
    shaderDecl(({},{cmp}) => `
  pixelInfo dynamicFlowPixelInfo(vec2 inTopElem) {
    // elemParts_xx[0] - sizePos
    float base = 0.0;
    vec2 elemSize;
    vec2 inElem;
    ${cmp.shownChildren.map((fCmp,i)=>`
elemSize = ${fCmp.findGlVar('actualSize') ? `vec2(elemParts_${i}[0].x, min(actualSize_${i}.y, elemParts_${i}[0].y))` : `elemParts_${i}[0].xy`};
inElem = inTopElem - vec2(0.0,base);
if (inBox(inElem, elemSize))
    return inElemFlowPixelInfo(${i}, inElem, elemSize, elemParts_${i}[1], elemParts_${i}[2], elemParts_${i}[3], elemParts_${i}[4].xy);
base = base + elemSize.y;`)
   .join('\n')}
      return pixelInfo(vec2(0.0), vec2(0.0), 0, -1);
  }`),
    shaderMainSnippet({
      code: (ctx,{cmp}) => `// dynamicFlowShaderMain
      vec2 inTopElem = gl_FragCoord.xy - elemBottomLeftCoord;
      vec2 outOfItem = gl_FragCoord.xy - itemBottomLeftCoord;
      if (outOfItem.x < 0.0 || outOfItem.y < 0.0) discard;

      inTopElem = vec2(inTopElem[0], topElemSize[1] - inTopElem[1]); // flipY
      pixelInfo info = dynamicFlowPixelInfo(inTopElem); // child SizePos
      vec2 inGlyph = info.inGlyph;
      vec2 glyphSize = info.glyphSize;
      int elemPart = info.elemPart;
      int cmp = info.cmpIndex;

      if (elemPart == 0) discard;
      if (elemPart < 5) { gl_FragColor = vec4(borderColor, 1.0); return; }       

${cmp.shownChildrenUniforms.filter(u=>u.glType!='sampler2D').map(({glType,glVar})=> `\t  ${glType} ${glVar};`).join('\n')}
      vec2 elemSize;
      if (cmp == -1) { gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5); return; }

      ${cmp.shownChildren.map((fCmp,i)=>`if (cmp == ${i}) {
        elemSize = ${fCmp.findGlVar('actualSize') ? `vec2(elemParts_${i}[0].x, min(actualSize_${i}.y, elemParts_${i}[0].y))` : `elemParts_${i}[0].xy`};
${fCmp.glVars.uniforms.filter(u=>u.glType!='sampler2D').map(({glVar})=> `\t  ${glVar} = ${glVar}_${i};`).join('\n')}
  ${(cmp.shaderMainSnippets[i]||[]).join('')}
      }`).join('\n')}
      `,
      phase: 4
    })
  )
})

component('basicCodeUtils', {
  type: 'feature',
  impl: features(
    shaderDecl(`
bool inBox(vec2 point, vec2 boxSize) { return (point.x <= boxSize.x && point.y <= boxSize.y && point.x > 0.0 && point.y > 0.0); }
vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }
struct box { vec2 pos; vec2 size; };
struct pixelInfo { vec2 inGlyph;  vec2 glyphSize; int elemPart; int cmpIndex; };
`),
    vertexDecl('vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }')
  )
})