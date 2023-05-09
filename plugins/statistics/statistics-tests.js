
jb.component('statTest.groupBy', {
    impl: dataTest({
      calculate: pipeline('%$people%', stat.groupBy('%male%'), filter('%male%==true'), '%items/name%', join(',')),
      expectedResult: equals('Homer Simpson,Bart Simpson')
    })
})

jb.component('statTest.groupBy.performance', {
    impl: dataTest({
      calculate: pipeline(
          pipeline(range(1,1000), ({data}) => ({ mod: data % 10 })), 
          stat.groupBy('%mod%'), 
          count()
        ),
      expectedResult: equals(10)
    })
})

jb.component('statTest.groupBy.fieldsInGroup', {
    impl: dataTest({
      calculate: pipeline('%$people%', stat.groupBy({by: '%male%', 
      calculate: [
          stat.fieldInGroup(count()),
          stat.fieldInGroup(join(','),'%name%'),
      ]}), '%count%-%join%', join(',')),
      expectedResult: or(equals('2-Homer Simpson,Bart Simpson,1-Marge Simpson'),equals('1-Marge Simpson,2-Homer Simpson,Bart Simpson'))
    })
})
