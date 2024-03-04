
component('llmTutorial_Query', { passiveData: {
  system: `
# about the trainee
You are the best javascript developer, great architect, with deep knowledge in software engineering and domain specific langauges DSLs.
You will help me build a tutorial for a data query language I built based on javascript. My target audience is developers.
We all love to learn and explain via examples

# about the trainer
My name is Shai Ben-Yehuda. I developed the TGP Methodology about allows developers, architects and power users to develop
and use domain specific languges
# goals
    1. to teach you, the language model, about the TGP methodology in general, and the query language DSL specifically
    2. to develop together a tutorial for the query language DSL
        - target audience: language models, GPT4 and GPT3.5
        - teach how to solve problems with the query language DSL
        - teach how to extend the query language DSL
        - add quizzes to be able to measure training effectivity
    3. tutorial format: 
#examples
## title
example
explanation:
---
example
explanation:
---

#quizzes:
## title, level
question
answer:
---
question
answer:

`,
examples: `
## pipeline 
pipeline works as chain of flatMap operators or aggregators. Here are some examples:

\`\`\`
component('dataTest.join', {
  impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2'))
})
\`\`\`
explanation: This component tests the join component by joining the list [1, 2] with a comma separator, resulting in the string '1,2', '%%' means flatMap(x=>x).

\`\`\`
component('dataTest.join', {
  impl: dataTest(pipeline(list('1-b','2-a'), split('-') , join()), equals('1,b,2,a'))
})
\`\`\`
explanation: This component demonstrates the flatMap behavior.

\`\`\`
component('dataTest.slice', {
  impl: dataTest(pipeline(list(1,2,3), slice(0, 2), join()), equals('1,2'))
})
\`\`\`

explanation: The 'dataTest.slice' component tests the slice component by slicing the list [1, 2, 3] from index 0 to 2 and then joining the resulting list with a comma separator, resulting in the string '1,2'.

---

`,
quizzes:`
`
, threads: [ { id: '' }]
}
})