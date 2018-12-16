function originalCarmi() {
    const { compile, root, arg0, setter, splice } = require("carmi");
    const todosByIdx = root.keyBy("idx");
    const anyTodoNotDone = todosByIdx.anyValues(todo => todo.get("done").not());
    const todosDisplayByIdx = todosByIdx.mapValues(todo =>
    todo.get("task").plus(todo.get("done").ternary(" - done", " - not done"))
    );
    const todosDisplay = root.map(todo => todosDisplayByIdx.get(todo.get("idx")));
    const model = {
    todosDisplay,
    anyTodoNotDone,
    setTodoDone: setter(arg0, "done"),
    spliceTodos: splice(),
    };

    const todos = todosModel([
    { idx: "1", done: false, task: "write a blog post about carmi" },
    { idx: "2", done: true, task: "publish to npm" },
    { idx: "3", done: false, task: "write a demo for carmi" },
    ]);
}

jb.resource('todos.sample1', [
    { idx: "1", done: false, task: "write a blog post about carmi" },
    { idx: "2", done: true, task: "publish to npm" },
    { idx: "3", done: false, task: "write a demo for carmi" },
])

jb.component('carmi.todos', {
    impl: {$: 'carmi-model', 
        sampleData: '%$todos.sample1%',
        vars: [
            {$: 'carmi.var', id: 'todoByIdx', exp :{$: 'keyBy', array: '%$roots%', key: '%idx%' } },
            {$: 'carmi.var', id: 'todosDisplayByIdx', exp :{$: 'mapValues', object: '%$todoByIdx%', itemVar: 'todo', 
                mapTo :{$: 'plus', items: [
                        '%task%',
                            {$: 'terinary', if: '%$todo/done%', then: ' - done', else: ' - not done' } 
                        ]
                }
            }}
        ],
        result: [
            {$: 'carmi.var', id: 'todosDisplay', exp :{$: 'map', array: '%$roots%', itemVar: 'todo', mapTo: {$: 'get', obj: '%$todoByIdx%', path: '%$item/idx%' }}},
            {$: 'carmi.var', id: 'anyTodoNotDone', exp :{$: 'anyValues', object: '%$todoByIdx%', condition: {$: 'not', of: '%done%' } }},
        ],
        setters: [
            {$: 'carmi.setter', id: 'setTodoDone', exp: {$: 'setter', arg0: {$: 'arg0'}, arg1: "done" }},
            {$: 'carmi.setter', id: 'spliceTodos', exp: {$: 'splice' }}
        ]
    }
})

jb.component('carmi.model-editor', {
    type: 'control',
    impl :{$: 'group' }
  })
  

