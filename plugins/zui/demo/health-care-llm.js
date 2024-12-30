dsl('zui')

component('zui.completionItems', {
    params: [
        {id: 'llmModel', type: 'model'},
        {id: 'prompt', as: 'string'},
    ],
    impl: pipe(llmViaApi.completions({
        chat: [
          user(`%$prompt%`)
        ],
        llmModel: '%$llmModel%',
        maxTokens: 25000
      }),
      zui.parseItems(),
    )
})

component('createLlmGetItemsTask', {
  type: 'task',
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'userData', type: 'user_data'},
    {id: 'noOfItems', as: 'number', defaultValue: 5},
    {id: 'llmPrompt', as: 'string', dynamic: true},
    {id: 'llmCompletions', as: 'array', dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'estimatedDuration', as: 'number'},
    {id: 'llmModel', as: 'string'},
    {id: 'estimatedItems', as: 'number'},
    {id: 'actualItems', as: 'number'},
    {id: 'tokens', as: 'number'},
    {id: 'costPerItem', as: 'number'}
  ],
  impl: pipe(
    Var('hints', join(', ', { items: list('%$session/genericContextChips%','%$session/contextChips%') })),
    Var('query', '%$session/query%'),
    Var('noOfItems', '%$noOfItems%'),
    Var('prompt', '%$llmPrompt()%'),
    Var('title', '%$llmPrompt()%'),
    Var('model', '%$session/llmModel%')
  )
})

component('healthCare.itemsFromLlm', {
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'userData', type: 'user_data'},
    {id: 'appData', type: 'app_data'},
    {id: 'noOfItems', as: 'number', defaultValue: 5}
  ],
  impl: pipe(
    Var('hints', join(', ', { items: list('%$domain/contextChips%','%$userData/contextChips%') })),
    llmViaApi.completions({
      chat: [
        user(`You are a highly trained assistant specializing in medical knowledge and emergency care.

        Your task is to provide a structured list of **%$noOfItems% healthcare conditions** based on a 
        given **context** and **query**. 
        ### Requirements:
            1. The results should be specific, homogeneous, and tailored to the provided context.
            2. Items must be healthcare conditions, ensuring homogeneity.
            3. All %$noOfItems% items must be relevant to the query and tailored to the context hints.
            4. Ensure the relevancy scores are realistic and vary slightly to reflect relevance to the query and context.
            5. Each condition must include detailed attributes to help the doctor assess and act quickly
        
        ### Input:
        - **Context**: %$hints%
        - **Query**: %$session/query%
        
        ### Requirements:
        1. **Structure of Each Item**:
           Each condition must include the following fields:
           - title: Name of the condition (e.g., "Seizure").
           - category: Medical category or specialization (e.g., "Neurological").
           - urgency: Scale from 1 to 10 (1 = Low, 10 = Critical urgency).
           - likelihood: Scale from 1 to 10 (1 = Unlikely, 10 = Highly likely).
           - abrv: Abbreviation or short code for the condition (e.g., "SZR").
           - description: Brief explanation of the condition.
           - symptoms: List of common symptoms (e.g., ["Uncontrolled movements", "Loss of consciousness"]).
           - ageGroupAffected: Age groups most affected (e.g., "All ages", "Elderly").
           - severityLevel: Severity of the condition (e.g., "Mild", "Moderate", "Severe").
           - riskFactors: List of common risk factors (e.g., ["Epilepsy", "Brain injury"]).
           - treatmentUrgency: Recommended urgency of treatment (e.g., "Immediate").
           - possibleComplications: Potential complications (e.g., ["Brain damage", "Injury during seizure"]).
           - diagnosticTests: Recommended diagnostic tests (e.g., ["EEG", "MRI"]).
           - recommendedTreatments: Common treatments (e.g., ["Anticonvulsants", "Lifestyle adjustments"]).
           - prevalenceRate: How common the condition is (e.g., "Rare", "Moderate", "Common").
        
        2. **Result Format**:
           - Provide the result as a JSON array of %$noOfItems% items.
           - Ensure all conditions are relevant to the query and context.
           - Avoid duplicate conditions or vague entries.
        
        3. **Example Input**:
           - **Context**: "40-year-old male with a headache, high blood pressure, and dizziness."
           - **Query**: "Neurological conditions"
        
        4. **Example Output**:
        \`\`\`json
        [
          {
            "title": "Seizure",
            "category": "Neurological",
            "urgency": 8,
            "likelihood": 5,
            "abrv": "SZR",
            "description": "A sudden, uncontrolled electrical disturbance in the brain.",
            "symptoms": ["Uncontrolled movements", "Loss of consciousness"],
            "ageGroupAffected": "All ages",
            "severityLevel": "Severe",
            "riskFactors": ["Epilepsy", "Brain injury"],
            "treatmentUrgency": "Immediate",
            "possibleComplications": ["Brain damage", "Injury during seizure"],
            "diagnosticTests": ["EEG", "MRI"],
            "recommendedTreatments": ["Anticonvulsants", "Lifestyle adjustments"],
            "prevalenceRate": "Moderate"
          },
          {
            "title": "Stroke",
            "category": "Neurological",
            "urgency": 10,
            "likelihood": 7,
            "abrv": "STRK",
            "description": "A medical emergency caused by a blockage or rupture in blood flow to the brain.",
            "symptoms": ["Facial drooping", "Arm weakness", "Slurred speech"],
            "ageGroupAffected": "Elderly",
            "severityLevel": "Severe",
            "riskFactors": ["Hypertension", "Smoking", "Diabetes"],
            "treatmentUrgency": "Immediate",
            "possibleComplications": ["Permanent brain damage", "Death"],
            "diagnosticTests": ["CT scan", "MRI"],
            "recommendedTreatments": ["Thrombolysis", "Surgical intervention"],
            "prevalenceRate": "Common"
          }
        ]
        `)
      ],
      llmModel: '%$userData/preferedLlmModel%',
      maxTokens: 25000
    }),
    zui.parseItems(),
    extendWithObj(obj(prop('creationCtxVer', '%$appData/ctxVer%'), prop('creationModel', '%$userData/preferedLlmModel%')))
  )
})