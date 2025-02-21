dsl('zui')
using('zui')

component('healthCare', {
  type: 'domain',
  impl: domain('healthCare condition', {
    itemsPrompt: `
    You are an expert medical assistant for doctors in emergency settings. 
    Given this brief description of a patient or their symptoms, 
    Query: %$userData.query%
    context: %$userData.contextChips%

    Generate a JSON list of %$newOrUpdateLine%
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
    newItemsLine: '%$task/noOfItems% condition diagnostic suggestions *sorted by relevancy* high to low.',
    updateItemsLine: 'condition diagnostic suggestions for the following condition titles: %$task/itemsToUpdate%. keep the same order.',
    iconPromptProps: props({
      description: `- **title**: Name of the condition.
    - **relevancy**: A scale from 1 to 10 indicating how relevant it is to doctors in emergency settings
    - **category**: The medical category of this list: Cardiovascular, Neurological, Respiratory, Gastrointestinal, Musculoskeletal, Endocrine, Infectious Disease, Dermatological, Psychiatric, Hematological, Nephrological, Oncological, Ophthalmological, Otolaryngological, Immunological, Rheumatological, Gynecological, Urological, Pediatric, Geriatric, Emergency Medicine, Allergy, Psychological, Dental, Radiological
    - **urgency**: A scale from 1 to 10 indicating how urgent it is to address this condition (10 being the most urgent).
    - **abrv**: An abbreviation for the condition's name.`,
      sample: `"title": "Appendicitis",
      "relevancy": 8,
      "category": "Gastrointestinal",
      "urgency": 9,
      "abrv": "APN"`
    }),
    cardPromptProps: props({
      description: `- **description**: A concise explanation of the condition.
      - **likelihood**: A scale from 1 to 10 estimating how likely this diagnosis is based on the input.
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
      "likelihood": 7,
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
    itemsLayout: groupByScatter('category', { sort: 'relevancy' }),
    iconBox: healthCare.conditionIconBoxStyle(),
    card: healthCare.conditionCardStyle(),
    sample: sample({
      query: 'age 32, dizziness, stomach ache',
      contextChips: ['Balance issues','pain or discomfort'],
      suggestedContextChips: ['Low blood pressure (Hypotension)','High blood pressure (Hypertension)','Rapid or irregular heartbeat (Arrhythmia)'],
      preferedLlmModel: 'gpt_35_turbo_0125'
    })
  })
})

component('healthCare.conditionIconBoxStyle', {
  type: 'iconBox-style',
  impl: features(
    itemSymbol('categorySymbol', healthCare.categorySymbol()),
    itemSymbol('urgencySymbol', symbol(unitScale('urgency'), list('','❗','⚠️'))),
    itemBorderStyle('relevancyBorderStyle', borderStyle(unitScale('relevancy'))),
    itemOpacity('relevancyOpacity', opacity(unitScale('relevancy'))),
    itemColor('urgencyBorderColor', itemColor(unitScale('urgency'), list('green','orange','red'))),
    itemColor('categoryColor', healthCare.categoryColor()),
    frontEnd.method('dynamicCssVars', ({},{itemSize})=>{
      const boxSize = 2 ** Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
      return (boxSize >= 16) ? {
        'show-title': boxSize >= 64 ? 'block' : 'none',
        'show-abrv': boxSize < 64 ? 'block' : 'none',
        'box-size': `${boxSize}px`,
        'urgency-symbol-offset': `${boxSize / 16}px`,
        'abrv-margin': `${boxSize / 16}px`,
      } : { 'box-size': `${boxSize}px`, 'urgency-symbol-offset': '0', 'abrv-margin': '0', 'show-abrv': 'block', 'show-title': 'none'  }
    }),
    templateHtmlItem(()=> `<div class="icon" 
          bind_style="opacity: %relevancyOpacity%;border-style:%relevancyBorderStyle%;border-color:%urgencyBorderColor%">
      <div class="background" bind_style="background-color: %categoryColor%"></div>
      <div class="content">
        <div class="urgencySymbol" bind="%urgencySymbol%"></div>
        <div class="main-symbol" bind="%categorySymbol%"></div>
        <div class="abrv" bind="%abrv%"></div>
        <div class="title" bind="%title%"></div>
      </div>
    </div>`),
    css(`
      .%$cmp.clz% { font-size: var(--title-font-size) }
      .%$cmp.clz% .icon { position: relative; border-width: var(--border-width); width: var(--box-size); height: var(--box-size); 
          font-family: Arial, sans-serif}
      .%$cmp.clz% .background { opacity: 0.5; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
      .%$cmp.clz% .content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .%$cmp.clz% .urgencySymbol { position: absolute; top: var(--urgency-symbol-offset); right: var(--urgency-symbol-offset) }
      .%$cmp.clz% .main-symbol { line-height: 1; }
      .%$cmp.clz% .abrv { margin: var(--abrv-margin); line-height: 1; display: var(--show-abrv);}
      .%$cmp.clz% .title { margin: var(--abrv-margin); line-height: 1; display: var(--show-title);}
    `)
  )
})

component('healthCare.conditionCardStyle', {
  type: 'card-style',
  impl: features(
    itemSymbol('categorySymbol', healthCare.categorySymbol()),
    itemSymbol('urgencySymbol', symbol(unitScale('urgency'), list('','❗','⚠️'))),
    itemOpacity('relevancyOpacity', opacity(unitScale('relevancy'))),
    itemColor('categoryColor', healthCare.categoryColor()),
    templateHtmlItem((ctx,{cmp}) => `
        <div class="card" bind_style="box-shadow:inset 0px 0px 10px 0px %categoryColor%">
          <div class="title" bind_style="opacity: %relevancyOpacity%" bind="%urgencySymbol%%categorySymbol% %title%"></div>
          <div class="category" bind="%category%"></div>
          <div class="description" bind="%description%"></div>
          <div class="urgency" bind="urgency: %urgency%, likelihood: %likelihood%, relevancy: %relevancy%"></div>
          <div class="symptoms">Symptoms:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%symptoms/${i}%"></li>`).join('')}</ul>
          </div>
          <div class="riskFactors">Risk Factors:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%riskFactors/${i}%"></li>`).join('')}</ul>
          </div>
          <div class="treatments">Treatments:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%recommendedTreatments/${i}%"></li>`).join('')}</ul>
          </div>
          <div class="tests">Tests:
            <ul>${[0,1,2,3,4,5].map(i => `<li bind="%diagnosticTests/${i}%"></li>`).join('')}</ul>
          </div>
        </div>
      `),
    css(`.%$cmp.clz% .card {
          margin: 2px; height: 90%;
          border-width: 1px; font-family: Arial, sans-serif;
          display: flex; flex-direction: column; justify-content: space-between; padding: 10px; overflow: hidden;
        }
        .%$cmp.clz% .title { font-size: var(--main-title-font-size); cursor: pointer; }
        .%$cmp.clz% .category { font-size: var(--normal-text-font-size); margin-bottom: 5px; font-weight: bold; }
        .%$cmp.clz% .description { font-size: var(--normal-text-font-size); margin-bottom: 10px; font-style: italic; color: #666; }
        .%$cmp.clz% .urgency,
        .%$cmp.clz% .likelihood,
        .%$cmp.clz% .symptoms,
        .%$cmp.clz% .riskFactors,
        .%$cmp.clz% .treatments,
        .%$cmp.clz% .tests {font-size: var(--property-title-font-size);margin-bottom: 8px;color: #444; }

        .%$cmp.clz% .riskFactors ul,
        .%$cmp.clz% .treatments ul,
        .%$cmp.clz% .tests ul {list-style-type: disc;padding-left: 20px;margin: 0; font-size: var(--normal-text-font-size);}

        .%$cmp.clz% .riskFactors ul li,
        .%$cmp.clz% .treatments ul li,
        .%$cmp.clz% .tests ul li {margin-bottom: 4px; }
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