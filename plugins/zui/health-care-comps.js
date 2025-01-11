dsl('zui')
using('zui')

component('healthCare', {
  type: 'domain',
  impl: domain('healthCare condition', {
    iconProps: props({
      description: `- **title**: Name of the condition.
    - **category**: The medical category (e.g., Gastrointestinal, Neurological).
    - **urgency**: A scale from 1 to 10 indicating how urgent it is to address this condition (10 being the most urgent).
    - **likelihood**: A scale from 1 to 10 estimating how likely this diagnosis is based on the input.
    - **abrv**: An abbreviation for the condition's name.`,
      sample: `"title": "Appendicitis",
      "category": "Gastrointestinal",
      "urgency": 9,
      "likelihood": 7,
      "abrv": "APN"`
    }),
    cardProps: props({
      description: `- **description**: A concise explanation of the condition.
      - **symptoms**: Key symptoms associated with the condition.
      - **ageGroupAffected**: The primary age group affected (e.g., "Children", "Adults", "All ages").
      - **severityLevel**: Describes the severity (e.g., "Critical", "Severe", "Moderate").
      - **riskFactors**: Common risk factors.
      - **treatmentUrgency**: Describes how quickly treatment is needed (e.g., "Immediate", "Moderate").
      - **possibleComplications**: Potential complications if untreated.
      - **diagnosticTests**: Suggested tests to confirm the diagnosis.
      - **recommendedTreatments**: Suggested treatments.
      - **prevalenceRate**: Describes how common the condition is (e.g., "Rare", "Common").`,
      sample: `"description": "A condition in which the appendix becomes inflamed and filled with pus.",
      "symptoms": ["Abdominal pain", "Nausea"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Critical",
      "riskFactors": ["Family history", "Infection"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Peritonitis", "Sepsis"],
      "diagnosticTests": ["Ultrasound", "CT scan"],
      "recommendedTreatments": ["Surgery", "Antibiotics"],
      "prevalenceRate": "Moderate"`
    }),
    itemsPrompt: `
    You are an expert medical assistant for doctors in emergency settings. 
    Given this brief description of a patient or their symptoms, 
    Query: %$userData.query%
    context: %$userData.contextChips%
    generate a JSON list of %$task/noOfItems% diagnostic suggestions. 
    Each suggestion should follow the structure below and include relevant, accurate medical information.
    
    Each item in the JSON should include:
    %$propsInDescription%
        
    1. Use medical knowledge to populate the fields based on the input hints.  
    2. Generate realistic and context-appropriate values for urgency, likelihood, and other attributes. 

    Example Input:  
    "A patient presents with abdominal pain and fever."
    
    **Response format (JSON)**
    \`\`\`json
    [
      {
        %$propsInSample%
      }
    ]
    `,
    itemsLayout: groupByScatter('category', { sort: 'likelihood' }),
    iconBox: healthCare.conditionIconBoxStyle(),
    card: healthCare.conditionCardStyle(),
    sample: sample({
      query: 'age 40, dizziness, stomach ache',
      contextChips: ['Balance issues','pain or discomfort'],
      suggestedContextChips: ['Low blood pressure (Hypotension)','High blood pressure (Hypertension)','Rapid or irregular heartbeat (Arrhythmia)']
    })
  })
})

component('healthCare.conditionCardStyle', {
  type: 'card-style',
  impl: features(
    zoomingSize(fill({ min: 133 })),
    zoomingGridElem(),
    frontEnd.var('fontSizeMap', () => ({
        64: { title: 12, description: 10 },
        128: { title: 12, description: 10 },
        256: { title: 12, description: 12 },
        320: { title: 14, description: 12 },
    })),
    dynamicCssVars(({},{fontSizeMap, itemSize})=>{
      const baseSize = itemSize[0]
      const closestSize = Object.keys(fontSizeMap).map(Number).reduce((prev, curr) => (baseSize <= curr ? curr : prev), 320)
      const fontSizes = fontSizeMap[closestSize]
      
      return {
        'title-font-size': `${fontSizes.title}px`,
        'description-font-size': `${fontSizes.description}px`
      }
    }),
    itemSymbol('categorySymbol', healthCare.categorySymbol()),
    itemSymbol('urgencySymbol', symbol(unitScale('urgency'), list('','❗','⚠️'))),
    itemBorderStyle('likelihoodBorderStyle', borderStyle(unitScale('likelihood'))),
    itemColor('urgencyBorderColor', itemColor(unitScale('urgency'), list('green','orange','red'))),
    itemColor('categoryColor', healthCare.categoryColor()),
    htmlOfItem((ctx,{cmp}) => `
        <div class="card-${cmp.id}" style="font-family: Arial, sans-serif;">
          <div class="icon" bind_style="border-style:%likelihoodBorderStyle%;border-color:%urgencyBorderColor%">
            <div class="icon-background" bind_style="background-color:%categoryColor%"></div>
            <div class="icon-content">
                <div class="icon-main-symbol" bind="%categorySymbol%"></div>
            </div>
          </div>
          <div class="icon-urgencySymbol" bind="%urgencySymbol%"></div>
          <div class="title" bind="%title%"></div>
          <div class="category" bind="%category%"></div>
          <div class="description" bind="%description%"></div>
          <div class="urgency" bind="%urgency%"></div>
          <div class="likelihood" bind="%likelihood%"></div>
          <div class="symptoms">Symptoms:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%symptoms/i%"></li>`)}</ul>
          </div>
          <div class="riskFactors">Risk Factors:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%riskFactors/i%"></li>`)}</ul>
          </div>
          <div class="treatments">Treatments:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%recommendedTreatments/i%"></li>`)}</ul>
          </div>
          <div class="tests">Tests:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%diagnosticTests/i%"></li>`)}</ul>
          </div>
        </div>
      `),
    css(`
        .card-%$cmp/id% {
          display: flex; flex-direction: column; justify-content: space-between; padding: 10px; overflow: hidden;
          box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        .card-%$cmp/id%>.icon { position: relative; width: 32px; min-height: 32px;}
        .card-%$cmp/id% .icon-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
        .card-%$cmp/id% .icon-content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .card-%$cmp/id% .icon-urgencySymbol { font-size: 32px; line-height: 1; position: absolute; top: 10px; right: 2px; }
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

component('healthCare.conditionIconBoxStyle', {
  type: 'iconBox-style',
  impl: features(
    zoomingSize(fill()),
    zoomingGridElem(),
    itemSymbol('categorySymbol', healthCare.categorySymbol()),
    itemSymbol('urgencySymbol', symbol(unitScale('urgency'), list('','❗','⚠️'))),
    itemBorderStyle('likelihoodBorderStyle', borderStyle(unitScale('likelihood'))),
    itemOpacity('likelihoodOpacity', opacity(unitScale('likelihood'))),
    itemColor('urgencyBorderColor', itemColor(unitScale('urgency'), list('green','orange','red'))),
    itemColor('categoryColor', healthCare.categoryColor()),
    dynamicCssVars(({},{itemSize})=>{
      const boxSize = 2 ** Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
      return (boxSize >= 16) ? {
        'symbol-font-size': `${boxSize * 0.5}px`,
        'urgency-symbol-font-size': `${boxSize * 0.25}px`,
        'urgency-symbol-offset': `${boxSize / 16}px`,
        'abrv-font-size': `${boxSize * 0.25}px`,
        'abrv-margin': `${boxSize / 16}px`,
      } : { 'symbol-font-size': '0', 'urgency-symbol-font-size': '0', 'urgency-symbol-offset': '0', 'abrv-font-size': '0', 'abrv-margin': '0' }
    }),
    htmlOfItem(`<div class="icon-%$cmp/id%" 
          bind_style="opacity: %likelihoodOpacity%;border-style:%likelihoodBorderStyle%;border-color:%urgencyBorderColor%">
      <div class="background" bind_style="background-color: %categoryColor%"></div>
      <div class="content">
        <div class="urgencySymbol" bind="%urgencySymbol%"></div>
        <div class="main-symbol" bind="%categorySymbol%"></div>
        <div class="abrv" bind="%abrv%"></div>
      </div>
    </div>`),
    css(`
      .icon-%$cmp/id% { position: relative; border-width: var(--border-width); width: var(--box-size); height: var(--box-size); 
          font-family: Arial, sans-serif}
      .icon-%$cmp/id% >.background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
      .icon-%$cmp/id% >.icon-content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .icon-%$cmp/id% .icon-urgencySymbol { position: absolute; top: var(--urgency-symbol-offset); right: var(--urgency-symbol-offset); 
          font-size: var(--urgency-symbol-font-size); }
      .icon-%$cmp/id% .icon-main-symbol { font-size: var(--symbol-font-size); line-height: 1; }
      .icon-%$cmp/id% .icon-abrv { font-size: var(--abrv-font-size); margin: var(--abrv-margin); line-height: 1; }
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