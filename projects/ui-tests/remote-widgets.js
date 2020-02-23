jb.component('watchable-people', { /* watchablePeople */
    watchableData: [
        {name: 'Homer Simpson - watchable', age: 42, male: true},
        {name: 'Marge Simpson - watchable', age: 38, male: false},
        {name: 'Bart Simpson - watchable', age: 12, male: true}
    ]
})

jb.component('people', { /* people */
    passiveData: [
        {name: 'Homer Simpson', age: 42, male: true},
        {name: 'Marge Simpson', age: 38, male: false},
        {name: 'Bart Simpson', age: 12, male: true}
    ]
})

jb.component('person', { /* person */
    watchableData: {
        name: 'Homer Simpson',
        male: true,
        isMale: 'yes',
        age: 42
    }
})

jb.component('personWithAddress', { /* personWithAddress */
    watchableData: {
        name: 'Homer Simpson',
        address: {city: 'Springfield', street: '742 Evergreen Terrace'}
    }
})

jb.component('personWithChildren', { /* personWithChildren */
    watchableData: {
        name: 'Homer Simpson',
        children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}],
        friends: [{name: 'Barnie'}]
    }
})

jb.component('ui-test.remote-editable-ctrl', {
    type: 'control',
    impl: group({
        controls: [
          editableText({title: 'name', databind: '%$person/name%', features: id('inp') }),
          text('%$person/name%')
        ]
    })
})

jb.component('ui-test.hello-from-worker', {
    type: 'control',
    impl: text('hello from worker')
})

jb.component('ui-test.remote-infinite-scroll', {
    type: 'control',
    impl: itemlist({
        items: range(),
        controls: text('%%'),
        visualSizeLimit: '7',
        features: [
          css.height({height: '100', overflow: 'scroll'}),
          itemlist.infiniteScroll(),
          css.width('600')
        ]
      })
})

