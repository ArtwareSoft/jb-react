jb.component('watchablePeople', {
    watchableData: [
        {name: 'Homer Simpson - watchable', age: 42, male: true},
        {name: 'Marge Simpson - watchable', age: 38, male: false},
        {name: 'Bart Simpson - watchable', age: 12, male: true}
    ]
})

jb.component('people', {
    passiveData: [
        {name: 'Homer Simpson', age: 42, male: true},
        {name: 'Marge Simpson', age: 38, male: false},
        {name: 'Bart Simpson', age: 12, male: true}
    ]
})

jb.component('person', {
    watchableData: {
        name: 'Homer Simpson',
        male: true,
        isMale: 'yes',
        age: 42
    }
})

jb.component('personWithAddress', {
    watchableData: {
        name: 'Homer Simpson',
        address: {city: 'Springfield', street: '742 Evergreen Terrace'}
    }
})

jb.component('personWithChildren', {
    watchableData: {
        name: 'Homer Simpson',
        children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}],
        friends: [{name: 'Barnie'}]
    }
})

jb.component('uiTest.remoteEditableCtrl', {
    type: 'control',
    impl: group({
        controls: [
          editableText({title: 'name', databind: '%$person/name%', features: id('inp') }),
          text('%$person/name%')
        ]
    })
})

jb.component('uiTest.helloFromWorker', {
    type: 'control',
    impl: text('hello from worker')
})

jb.component('uiTest.remoteInfiniteScroll', {
    type: 'control',
    impl: itemlist({
        items: range(0,10),
        controls: text('%%'),
        visualSizeLimit: '7',
        features: [
          css.height({height: '100', overflow: 'scroll'}),
          itemlist.infiniteScroll(),
          css.width('600')
        ]
    })
})

