dsl('zui')
using('zui')

component('healthCare.conditionCard', {
  type: 'control',
  impl: card('%title%', '%description%', {
    style: healthCare.conditionCardStyle({
      categorySymbol: healthCare.categorySymbol(),
      urgencySymbol: symbol(unitScale('urgency'), list('','❗','⚠️')),
      borderStyle: borderStyle(unitScale('likelihood')),
      borderColor: itemColor(unitScale('urgency'), list('green','orange','red')),
      categoryColor: healthCare.categoryColor()
    })
  })
})

component('healthCare.conditionCardStyle', {
  type: 'card-style',
  params: [
    {id: 'categorySymbol', type: 'item_symbol', byName: true},
    {id: 'urgencySymbol', type: 'item_symbol', byName: true},
    {id: 'borderStyle', type: 'item_border_style'},
    {id: 'borderColor', type: 'item_color'},
    {id: 'categoryColor', type: 'item_color'}
  ],
  impl: features(
    zoomingSize(fill({ min: 133 })),
    zoomingGridElem(),
    frontEnd.var('fontSizeMap', () => ({
        64: { title: 12, description: 10 },
        128: { title: 12, description: 10 },
        256: { title: 12, description: 12 },
        320: { title: 14, description: 12 },
    })),
    frontEnd.method('zoomingCss', (ctx, {fontSizeMap, cmp, itemSize}) => {
        const cssVars = {}
        const baseSize = itemSize[0]
        const closestSize = Object.keys(fontSizeMap).map(Number).reduce((prev, curr) => (baseSize <= curr ? curr : prev), 320)
        const fontSizes = fontSizeMap[closestSize]
        
        cssVars['title-font-size'] = `${fontSizes.title}px`
        cssVars['description-font-size'] = `${fontSizes.description}px`
        
        jb.zui.setCssVars(`card-${cmp.id}`, cssVars)
    }),
    htmlOfItem((ctx,{cmp, item},{categorySymbol,urgencySymbol,borderStyle,borderColor,categoryColor}) => `
        <div class="card-${cmp.id}" style="font-family: Arial, sans-serif;">
          <div class="icon" style="border-style: ${borderStyle(ctx)}; border-color: ${borderColor(ctx)};">
            <div class="icon-background" style="background-color: ${categoryColor(ctx)}"></div>
            <div class="icon-content">
                <div class="icon-main-symbol">${categorySymbol(ctx)}</div>
            </div>
          </div>
          <div class="icon-urgencySymbol">${urgencySymbol(ctx)}</div>
          <div class="title">${item.title}</div>
          <div class="category">${item.category}</div>
          <div class="description">${item.description}</div>
          <div class="urgency">Urgency: ${item.urgency}</div>
          <div class="likelihood">Likelihood: ${item.likelihood}</div>
          <div class="symptoms">Symptoms: ${jb.asArray(item.symptoms).join(', ')}</div>
          <div class="riskFactors">
            Risk Factors:
            <ul>
                ${jb.asArray(item.riskFactors).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
          <div class="treatments">
            Treatments:
            <ul>
                ${jb.asArray(item.recommendedTreatments).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
          <div class="tests">
            Tests:
            <ul>
                ${jb.asArray(item.diagnosticTests).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
        </div>
      `),
    css(`
        .card-%$cmp/id% {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 10px;
          overflow: hidden;
          box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        .card-%$cmp/id% .icon { position: relative; width: 32px; min-height: 32px;}
        .card-%$cmp/id% .icon-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
        .card-%$cmp/id% .icon-content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .card-%$cmp/id% .icon-urgencySymbol { font-size: 32px; line-height: 1; position: absolute; top: 0px; right: 2px; }
        .card-%$cmp/id% .icon-main-symbol { font-size: 32px; line-height: 1; }

        .card-%$cmp/id% > .title { font-size: var(--title-font-size); font-weight: bold; margin-bottom: 8px; color: #333; }
        .card-%$cmp/id% > .category { font-size: var(--description-font-size); margin-bottom: 5px; font-weight: bold; }
        .card-%$cmp/id% > .description { font-size: var(--description-font-size); margin-bottom: 10px; font-style: italic; color: #666; }
        .card-%$cmp/id% > .urgency,
        .card-%$cmp/id% > .likelihood,
        .card-%$cmp/id% > .symptoms,
        .card-%$cmp/id% > .riskFactors,
        .card-%$cmp/id% > .treatments,
        .card-%$cmp/id% > .tests {font-size: var(--description-font-size);margin-bottom: 8px;color: #444; }

        .card-%$cmp/id% .riskFactors ul,
        .card-%$cmp/id% .treatments ul,
        .card-%$cmp/id% .tests ul {list-style-type: disc;padding-left: 20px;margin: 0;}

        .card-%$cmp/id% .riskFactors ul li,
        .card-%$cmp/id% .treatments ul li,
        .card-%$cmp/id% .tests ul li {margin-bottom: 4px; }
      `)
  )
})

component('healthCare.conditionIconBox', {
  type: 'control',
  impl: iconBox('%abrv%', healthCare.conditionIconBoxStyle({
    categorySymbol: healthCare.categorySymbol(),
    urgencySymbol: symbol(unitScale('urgency'), list('','❗','⚠️')),
    borderStyle: borderStyle(unitScale('likelihood')),
    opacity: opacity(unitScale('likelihood')),
    borderColor: itemColor(unitScale('urgency'), list('green','orange','red')),
    categoryColor: healthCare.categoryColor()
  }))
})

component('healthCare.conditionIconBoxStyle', {
  type: 'iconBox-style',
  params: [
    {id: 'categorySymbol', type: 'item_symbol', byName: true},
    {id: 'urgencySymbol', type: 'item_symbol'},
    {id: 'borderStyle', type: 'item_border_style'},
    {id: 'opacity', type: 'item_opacity'},
    {id: 'borderColor', type: 'item_color'},
    {id: 'categoryColor', type: 'item_color'}
  ],
  impl: features(
    zoomingSize(fill()),
    zoomingGridElem(),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
      const boxSize = 2 ** Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
      const cssVars = {}
      cssVars['border-width'] = `${Math.min(2,Math.max(0,jb.zui.floorLog2(boxSize)-3))}px`
      cssVars['box-size'] = `${boxSize}px`
      if (boxSize >= 16) {
        cssVars['symbol-font-size'] = `${boxSize * 0.5}px`
        cssVars['urgency-symbol-font-size'] = `${boxSize * 0.25}px`
        cssVars['urgency-symbol-offset'] = `${boxSize / 16}px`
        cssVars['abrv-font-size'] = `${boxSize * 0.25}px`
        cssVars['abrv-margin'] = `${boxSize / 16}px`
      } else {
        cssVars['symbol-font-size'] = `0px`
        cssVars['urgency-symbol-font-size'] = `0px`
        cssVars['urgency-symbol-offset'] = `0px`
        cssVars['abrv-font-size'] = `0px`
        cssVars['abrv-margin'] = `0px`
      }
      jb.zui.setCssVars(`icon-${cmp.id}`,cssVars)
    }),
    htmlOfItem(`<div class="icon-%$cmp/id%" style="opacity: %$opacity()%; border-style: %$borderStyle()%; border-color: %$borderColor()%; font-family: Arial, sans-serif;">
      <div class="icon-background-%$cmp/id%" style="background-color: %$categoryColor()%"></div>
      <div class="icon-content-%$cmp/id%">
        <div class="icon-urgencySymbol-%$cmp/id%">%$urgencySymbol()%</div>
        <div class="icon-main-symbol-%$cmp/id%">%$categorySymbol()%</div>
        <div class="icon-abrv-%$cmp/id%">%$$model/abrv()%</div>
      </div>
    </div>`),
    css(`
      .icon-%$cmp/id% { position: relative; border-width: var(--border-width); width: var(--box-size); height: var(--box-size);}
      .icon-background-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
      .icon-content-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .icon-urgencySymbol-%$cmp/id% { position: absolute; top: var(--urgency-symbol-offset); right: var(--urgency-symbol-offset); font-size: var(--urgency-symbol-font-size); }
      .icon-main-symbol-%$cmp/id% { font-size: var(--symbol-font-size); line-height: 1; }
      .icon-abrv-%$cmp/id% { font-size: var(--abrv-font-size); margin: var(--abrv-margin); line-height: 1; }
    `)
  )
})

component('healthCare.categorySymbol', {
  type: 'item_symbol',
  impl: symbolByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', '🫀'),
      Case('Neurological', '🧠'),
      Case('Respiratory', '🌬️'),
      Case('Gastrointestinal', '🍴'),
      Case('Musculoskeletal', '🦴'),
      Case('Endocrine', '🕰️'),
      Case('Infectious Disease', '🦠'),
      Case('Dermatological', '🩹'),
      Case('Psychiatric', '💭'),
      Case('Hematological', '🩸'),
      Case('Nephrological', '🚰'),
      Case('Oncological', '🎗️'),
      Case('Ophthalmological', '👁️'),
      Case('Otolaryngological', '👂'),
      Case('Immunological', '🛡️'),
      Case('Rheumatological', '🤲'),
      Case('Gynecological', '👩‍⚕️'),
      Case('Urological', '🚽'),
      Case('Pediatric', '🧸'),
      Case('Geriatric', '👴👵'),
      Case('Emergency Medicine', '🚨'),
      Case('Allergy', '🤧'),
      Case('Psychological', '🧘'),
      Case('Dental', '🦷'),
      Case('Radiological', '📡')
    ]
  })
})

component('healthCare.categoryColor', {
  type: 'item_color',
  impl: colorByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', 'red'),
      Case('Neurological', 'blue'),
      Case('Respiratory', 'green'),
      Case('Gastrointestinal', 'orange'),
      Case('Musculoskeletal', 'purple'),
      Case('Endocrine', 'yellow'),
      Case('Infectious Disease', 'darkred'),
      Case('Dermatological', 'pink'),
      Case('Psychiatric', 'brown'),
      Case('Hematological', 'maroon'),
      Case('Nephrological', 'teal'),
      Case('Oncological', 'black'),
      Case('Ophthalmological', 'lightblue'),
      Case('Otolaryngological', 'navy'),
      Case('Immunological', 'olive'),
      Case('Rheumatological', 'violet'),
      Case('Gynecological', 'magenta'),
      Case('Urological', 'cyan'),
      Case('Pediatric', 'lightgreen'),
      Case('Geriatric', 'slategray'),
      Case('Emergency Medicine', 'crimson'),
      Case('Allergy', 'gold'),
      Case('Psychological', 'saddlebrown'),
      Case('Dental', 'tan'),
      Case('Radiological', 'silver')
    ],
    defaultColor: 'gray'
  })
})