component('globals', {
  watchableData: {}
})

component('watchablePeople', {
  watchableData: [
    {name: 'Homer Simpson - watchable', age: 42, male: true},
    {name: 'Marge Simpson - watchable', age: 38, male: false},
    {name: 'Bart Simpson - watchable', age: 12, male: true}
  ]
})

component('person', {
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

component('personWithAddress', {
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

component('personWithPrimitiveChildren', {
  watchableData: {
    childrenNames: ['Bart','Lisa','Maggie'],
  }
})

component('personWithChildren', { watchableData: {
    name: "Homer Simpson",
    children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ],
    friends: [{ name: 'Barnie' } ],
}})
  
component('emptyArray', {
  watchableData: []
})

component('people', {
    passiveData: [
      {name: 'Homer Simpson', age: 42, male: true},
      {name: 'Marge Simpson', age: 38, male: false},
      {name: 'Bart Simpson', age: 12, male: true}
    ]
})

component('peopleWithChildren', { watchableData: [
  {
    name: 'Homer',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  },
  {
    name: 'Marge',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  }
]})

component('stringArray', { watchableData: ['a','b','c']})
component('stringTree', { watchableData: { node1: ['a','b','c'], node2: ['1','2','3']}})
