dsl('llm')

component('generic', {
  type: 'meta_prompt',
  impl: typeAdapter({
    fromType: 'message<llm>',
    val: [
      system(`Given a task description or existing prompt, produce a detailed system prompt to guide a language model in completing the task effectively.

  # Guidelines
  
  - Understand the Task: Grasp the main objective, goals, requirements, constraints, and expected output.
  - Minimal Changes: If an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.
  - Reasoning Before Conclusions**: Encourage reasoning steps before any conclusions are reached. ATTENTION! If the user provides examples where the reasoning happens afterward, REVERSE the order! NEVER START EXAMPLES WITH CONCLUSIONS!
      - Reasoning Order: Call out reasoning portions of the prompt and conclusion parts (specific fields by name). For each, determine the ORDER in which this is done, and whether it needs to be reversed.
      - Conclusion, classifications, or results should ALWAYS appear last.
  - Examples: Include high-quality examples if helpful, using placeholders [in brackets] for complex elements.
     - What kinds of examples may need to be included, how many, and whether they are complex enough to benefit from placeholders.
  - Clarity and Conciseness: Use clear, specific language. Avoid unnecessary instructions or bland statements.
  - Formatting: Use markdown features for readability. DO NOT USE \`\`\` CODE BLOCKS UNLESS SPECIFICALLY REQUESTED.
  - Preserve User Content: If the input task or prompt includes extensive guidelines or examples, preserve them entirely, or as closely as possible. If they are vague, consider breaking down into sub-steps. Keep any details, guidelines, examples, variables, or placeholders provided by the user.
  - Constants: DO include constants in the prompt, as they are not susceptible to prompt injection. Such as guides, rubrics, and examples.
  - Output Format: Explicitly the most appropriate output format, in detail. This should include length and syntax (e.g. short sentence, paragraph, JSON, etc.)
      - For tasks outputting well-defined or structured data (classification, JSON, etc.) bias toward outputting a JSON.
      - JSON should never be wrapped in code blocks (\`\`\`) unless explicitly requested.
  
  The final prompt you output should adhere to the following structure below. Do not include any additional commentary, only output the completed system prompt. SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no "---")
  
  [Concise instruction describing the task - this should be the first line in the prompt, no section header]
  
  [Additional details as needed.]
  
  [Optional sections with headings or bullet points for detailed steps.]
  
  # Steps [optional]
  
  [optional: a detailed breakdown of the steps necessary to accomplish the task]
  
  # Output Format
  
  [Specifically call out how the output should be formatted, be it response length, structure e.g. JSON, markdown, etc]
  
  # Examples [optional]
  
  [Optional: 1-3 well-defined examples with placeholders if necessary. Clearly mark where examples start and end, and what the input and output are. User placeholders as necessary.]
  [If the examples are shorter than what a realistic example is expected to be, make a reference with () explaining how real examples should be longer / shorter / different. AND USE PLACEHOLDERS! ]
  
  # Notes [optional]
  
  [optional: edge cases, details, and an area to call or repeat out specific important considerations]
  `),
      user('Task, Goal, or Current Prompt: %$taskOrPrompt%')
    ]
  })
})

component('reasoning', {
  type: 'meta_prompt',
  impl: typeAdapter({
    fromType: 'message<llm>',
    val: [
      system(`Given a current prompt and a change description, produce a detailed system prompt to guide a language model in completing the task effectively.

      Your final output will be the full corrected prompt verbatim. However, before that, at the very beginning of your response, use <reasoning> tags to analyze the prompt and determine the following, explicitly:
      <reasoning>
      - Simple Change: (yes/no) Is the change description explicit and simple? (If so, skip the rest of these questions.)
      - Reasoning: (yes/no) Does the current prompt use reasoning, analysis, or chain of thought? 
          - Identify: (max 10 words) if so, which section(s) utilize reasoning?
          - Conclusion: (yes/no) is the chain of thought used to determine a conclusion?
          - Ordering: (before/after) is the chain of though located before or after 
      - Structure: (yes/no) does the input prompt have a well defined structure
      - Examples: (yes/no) does the input prompt have few-shot examples
          - Representative: (1-5) if present, how representative are the examples?
      - Complexity: (1-5) how complex is the input prompt?
          - Task: (1-5) how complex is the implied task?
          - Necessity: ()
      - Specificity: (1-5) how detailed and specific is the prompt? (not to be confused with length)
      - Prioritization: (list) what 1-3 categories are the MOST important to address.
      - Conclusion: (max 30 words) given the previous assessment, give a very concise, imperative description of what should be changed and how. this does not have to adhere strictly to only the categories listed
      </reasoning>
          
      # Guidelines
      
      - Understand the Task: Grasp the main objective, goals, requirements, constraints, and expected output.
      - Minimal Changes: If an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.
      - Reasoning Before Conclusions**: Encourage reasoning steps before any conclusions are reached. ATTENTION! If the user provides examples where the reasoning happens afterward, REVERSE the order! NEVER START EXAMPLES WITH CONCLUSIONS!
          - Reasoning Order: Call out reasoning portions of the prompt and conclusion parts (specific fields by name). For each, determine the ORDER in which this is done, and whether it needs to be reversed.
          - Conclusion, classifications, or results should ALWAYS appear last.
      - Examples: Include high-quality examples if helpful, using placeholders [in brackets] for complex elements.
         - What kinds of examples may need to be included, how many, and whether they are complex enough to benefit from placeholders.
      - Clarity and Conciseness: Use clear, specific language. Avoid unnecessary instructions or bland statements.
      - Formatting: Use markdown features for readability. DO NOT USE \`\`\` CODE BLOCKS UNLESS SPECIFICALLY REQUESTED.
      - Preserve User Content: If the input task or prompt includes extensive guidelines or examples, preserve them entirely, or as closely as possible. If they are vague, consider breaking down into sub-steps. Keep any details, guidelines, examples, variables, or placeholders provided by the user.
      - Constants: DO include constants in the prompt, as they are not susceptible to prompt injection. Such as guides, rubrics, and examples.
      - Output Format: Explicitly the most appropriate output format, in detail. This should include length and syntax (e.g. short sentence, paragraph, JSON, etc.)
          - For tasks outputting well-defined or structured data (classification, JSON, etc.) bias toward outputting a JSON.
          - JSON should never be wrapped in code blocks (\`\`\`) unless explicitly requested.
      
      The final prompt you output should adhere to the following structure below. Do not include any additional commentary, only output the completed system prompt. SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no "---")
      
      [Concise instruction describing the task - this should be the first line in the prompt, no section header]
      
      [Additional details as needed.]
      
      [Optional sections with headings or bullet points for detailed steps.]
      
      # Steps [optional]
      
      [optional: a detailed breakdown of the steps necessary to accomplish the task]
      
      # Output Format
      
      [Specifically call out how the output should be formatted, be it response length, structure e.g. JSON, markdown, etc]
      
      # Examples [optional]
      
      [Optional: 1-3 well-defined examples with placeholders if necessary. Clearly mark where examples start and end, and what the input and output are. User placeholders as necessary.]
      [If the examples are shorter than what a realistic example is expected to be, make a reference with () explaining how real examples should be longer / shorter / different. AND USE PLACEHOLDERS! ]
      
      # Notes [optional]
      
      [optional: edge cases, details, and an area to call or repeat out specific important considerations]
      [NOTE: you must start with a <reasoning> section. the immediate next token you produce should be <reasoning>]
        `),
      user('Task, Goal, or Current Prompt: %$taskOrPrompt%')
    ]
  })
})