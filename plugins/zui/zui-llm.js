dsl('zui')
using('llm-api','net')

component('zui.parseItems', {
  impl: ctx => {
    const text = ctx.data
    const jsonText = text.split('```json').pop().split('```')[0]
    try {
      return JSON.parse(jsonText)
    } catch (e) {
      debugger
    }
  }
})

component('zui.itemKeysFromLlm', {
  params: [
    {id: 'session', type: 'session'},
    {id: 'noOfItems', as: 'number', defaultValue: 5}
  ],
  impl: pipe(
    Var('hints', join(', ', { items: list('%$session/genericContextChips%','%$session/contextChips%') })),
    Var('startTime', () => new Date().getTime()),
    llmViaApi.completions({
      chat: [
        user(`You are an expert assistant specialized in retrieving structured and homogeneous data. 

      Your task is to generate a JSON list of %$noOfItems% items based on a given query and context hints. 
      Each item must include:
      - A title: The name of the item.
      - A relevancy score: A number between 0 to 1. when 1 is the highest relevancy to the query and context.
      
      ### Input:
      - **Query**: %$session/query%
      - **Hints**: %$hints%
      
      ### Requirements:
      1. All %$noOfItems% items must be relevant to the query and tailored to the context hints.
      2. Items must belong to the same category, ensuring homogeneity.
      3. Each item in the JSON list must have:
         - A "title" (name of the item).
         - A "relevancy" score between 1 and 100.
      4. Ensure the relevancy scores are realistic and vary slightly to reflect relevance to the query and context.
      
      ### Example Input:
      - **Query**: Running shoes
      - **Hints**: Man, 30 years old, training
      
      ### Example Output:
      \`\`\`json
      [
        {"title": "Nike Air Zoom Pegasus 39", "relevancy": 98},
        {"title": "Adidas Ultraboost 22", "relevancy": 97},
        ...
        {"title": "Hoka Clifton 9", "relevancy": 89}
      ]
      `)
      ],
      llmModel: '%$session/llmModel%',
      maxTokens: 25000,
      includeSystemMessages: true
    }),
    split('```json\n', { part: 'last' }),
    split('```', { part: 'first' }),
    json.parse(),
    extend(prop('system', obj(
      prop('creationCtxVer', '%$session/ctxVer%'),
      prop('creationCtxVer', '%$session/ctxVer%'),
      prop('creationModel', '%$session/llmModel/name%')
    )))
  )
})

component('zui.itemsFromLlm', {
  params: [
    {id: 'session', type: 'session' },
    {id: 'exampleItem', type: 'item-data' },
    {id: 'titles', as: 'array' },
    {id: 'llmModel', type: 'model<llm>'}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system. presenting items.
      Based on the following **query**: "%$query%"
      return a list of 2 **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
    ---
         provide the response as javascript array of strings            
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

// please try only symptoms visible to the doctor or easily detectible by question or test


component('zui.smartMetadata', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system. presenting items.
      Based on the following **query**: "%$query%"
      return a list of 2 **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
    ---
         provide the response as javascript array of strings            
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartMetaIconLevel', {
  params: [
    //{id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are LLM prompt expert, helping building a Zoomable User Interface (ZUI) system. presenting items.
      We need to build a prompt (or set of prompts) that based on artbitrary query in any domain will suggest the properties, and html/css templates 
        for the icon level of the zui system.
      The first zoomable level, called icon level, can grow from 8x8 to 64x64 pixels. it generaly uses item initialis, colors and shapers that reprenet the item.

      Please help to improve the prompt below or suggest a different prompt(s) for this purpose
      ----
      You are a both metadata discovery assistant and html/css developer working on a Zoomable User Interface (ZUI) system. presenting items.

      Now you are working on the first zoomable level. It can grow from 8x8 to 64x64 pixels. it generaly uses item initialis, colors and shapers that reprenet the item.
      The item width/height is set by the framework and can get any value in this range. the html/css can also be replaced according to levels. 
        yet can also keep the same html and change only the css, or define single css using relative(responsive) terms

      Based on the following **query**: "{{query}}"

      return a list of 5 **most relevant** metadata properties for **presenting** items of this type/category at the icon level
      1. provide sample data for 2 items,
      2. suggest levels (8,16,32,32), and html template, css, and data binding to the item. 
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartMetaCardLevel', {
  params: [
    //{id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are LLM prompt expert, helping building a Zoomable User Interface (ZUI) system. presenting items.
      We need to build a prompt (or set of prompts) that based on artbitrary query in any domain will suggest the properties, and html/css templates 
        for the icon level of the zui system.
      The second zoomable level, called card level, is 64x64 - 320*320 pixels. it usually uses item title, description, 4-8 properties and colors and shapes that represent the item.

      Please help to improve the prompt below or suggest a different prompt(s) for this purpose
      ----
      You are a both metadata discovery assistant and html/css developer working on a Zoomable User Interface (ZUI) system. presenting items.

      Now you are working on the second zoomable level. It can grow from 64x64 to 320x400 pixels. it usually uses item title, description, 4-8 properties and colors and shapes that represent the item.
      The item width/height is set by the framework and can get any value in this range. the html/css can also be replaced according to levels. 
        yet can also keep the same html and change only the css, or define single css using relative(responsive) terms

      Based on the following **query**: "{{query}}"

      return a list of 10 **most relevant** metadata properties for **presenting** items of this type/category at the card level
      provide sample data for 2 items,
      suggest html/css code in this format
      ---      
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartIconCode', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are acting as both a metadata discovery assistant and an HTML/CSS developer working on a Zoomable User Interface (ZUI) system that presents items.
      ---
      ### **Task Overview:**
      Your task is to generate appropriate metadata properties and design elements for presenting items at the icon level of a ZUI system, based on a given query.
      ---
      ### **Icon Level Details:**
      - **Size Range:** The icon level can scale from **8x8 to 64x64 pixels**.
      - **Design Elements:** Icons generally use **item initials**, **colors**, and **shapes** that represent the item.
      - **Responsive Design:** The HTML/CSS can be adjusted according to different levels. You may:
        - Replace the HTML/CSS based on levels.
        - Keep the same HTML and modify only the CSS.
        - Define a single CSS using relative (responsive) units.
      ---
      ### **Instructions:**
      Based on the following **query**: **"%$query%"**
      Please perform the following steps:
      1. **Metadata Properties:**
         - Identify and list the **5 most relevant metadata properties** for presenting items of this type/category at the icon level.
      2. **Sample Data:**
         - Provide sample data for **2 example items**, using the identified metadata properties.
      3. **Design Suggestions:**
         - For icon sizes at **levels 8, 16, 32, and 64 pixels**, suggest:
           - **HTML Template**: Provide the minimal HTML structure for the icon.
           - **CSS Styles**: Provide the CSS styling for the icon, ensuring it is responsive to the different sizes.
           - **Data Binding**: Explain how the sample data binds to the HTML template (e.g., which data populates which part of the template).
      ---
      ### **Notes:**
      - **Simplicity:** Be concise and focus on elements that are visually meaningful at small icon sizes.
      - **Legibility:** Ensure that text and shapes remain clear and legible at all specified sizes.
      - **Representativeness:** Choose colors and shapes that effectively represent the items based on the query.
      - **Consistency:** Maintain a consistent design language across different icon sizes.
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    //includeSystemMessages: true
  })
})

component('zui.firstItemsNames', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true},
    {id: 'noOfItems', as: 'number', defaultValue: 5}
  ],
  impl: llmViaApi.completions({
    chat: [
      system('You are a data provider for a Zoomable User Interface (ZUI) system'),
      user(`please provide the names of the first %$noOfItems% items for this query "%$query%" 
      --
      provide the response as javascript array of strings
      `)
    ],
    model: 'gpt-3.5-turbo-0125',
    maxTokens: 300
  })
})

component('zui.itemsShortDescription', {
  params: [
    {id: 'itemName', as: 'string' },
  ],
  impl: llmViaApi.completions({
    chat: [
      system('You are a data provider for a Zoomable User Interface (ZUI) system'),
      user(`please provide short description for this item "%$itemName%" in the context of this query "%$query%" 
      --
      provide the description as a javascript string with double quotes ""
      `)
    ],
    maxTokens: 300
  })
})

// user(`Based on the following **query**: "%$query%"
// ---
// return a list of 5-10 items with most relevant 5-10 properties in json lines format
// `)


component('zui.metadataForQuery', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user('You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system of items'),
      user(`**Task**: 
      Based on the following **query**: "%$query%"
      First decide what is the **item type** or **item category** resulting from this query
      Then, Return a list of the **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
            
      **Rules**: 
      - Provide 10-20 metadata fields that could apply to items resulting from this query. 
      - Each field must include: 
        - **name** (property name) 
        - **type** (string, number, date, boolean, array, or object) 
        - **example_value** (example of what the data might look like) 
        - **explanation**
        - **can_be_used_on_an_quantitive_axis**
        - **can_be_used_in_2D_clustering**
        - **priority_score** (score from 1-10, with 10 being the most useful for visualization) 
      - sort by can_be_used_on_an_quantitive_axis
      
      **Response format (JSON)**
      \`\`\`json
      {
        "item_type": "e.g. smart phone product",
        "fields": [
            {
            "name": "string (name of the property)",
            "type": "string, number, date, boolean, array, or object",
            "explanation": "string",
            "example_value": "example value for this property",
            "can_be_used_on_an_quantitive_axis": 1-10,
            "can_be_used_in_2D_clustering": 1-10,
            "priority_score": 1-10
            }
        ]
    }
      
      `)
    ],
    model: 'o1-preview',
    maxTokens: 1000
  })
})

// Then, Return a list of the most relevant metadata properties for **positining** items of this type/category
// on x/y axes of a 2D canvas. For example: price/performance


