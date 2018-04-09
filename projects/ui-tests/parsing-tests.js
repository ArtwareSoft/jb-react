jb.resource('textToParse',`
before
#start
first
#end
outside1
#start
second
#end
outside2
`
)

jb.resource('textToBreak','l1-a1-b1-c1;l2-a2-b2-c2;l3-a3-b3-c3');
jb.resource('textToBreak2','l1-a1-b1-c1;l2|a2|b2|c2;l3-a3-b3-c3')

jb.component('data-test.extract-text-repeating', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [{$: 'extract-text', text: '%$textToParse%',  startMarkers: '#start', endMarker: '#end', repeating: true}, {$:'join'}]},
		expectedResult : '%% == first,second'
	},
})

jb.component('data-test.extract-text-includingStartMarker', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [{$: 'extract-text', text: '%$textToParse%', startMarkers: '#start', endMarker: '#end', repeating: true, includingStartMarker: true}, {$:'join'}]},
    expectedResult : ctx => ctx.data == '#start\nfirst,#start\nsecond'
//		expectedResult : '%% == #start\nfirst,#start\nsecond'
	},
})

jb.component('data-test.extract-text-includingEndMarker', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [{$: 'extract-text', text: '%$textToParse%', startMarkers: '#start', endMarker: '#end', repeating: true, includingEndMarker: true}, {$:'join'}]},
    expectedResult : ctx => ctx.data == 'first\n#end,second\n#end'
	},
})

jb.component('data-test.extract-text-exclude', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [{$: 'extract-text', text: '%$textToParse%', startMarkers: '#start', endMarker: '#end', repeating: true, includingStartMarker: true, includingEndMarker: true, exclude: true}, {$:'join'}]},
    expectedResult : '%% == before,outside1,outside2'
	},
})

jb.component('data-test.extract-text-regex', {
	 impl :{$: 'data-test',
		calculate: {$: 'extract-text', useRegex: true, text: '%$textToParse%', startMarkers: '#s.*', endMarker: '#e.*'},
    expectedResult : '%% == first'
	},
})

jb.component('data-test.break-text', {
	impl :{$: 'data-test',
	   calculate: {$: 'json.stringify', value: {$: 'break-text', text: '%$textToBreak%', separators: [';','-'] } },
	   expectedResult : '%% == [["l1","a1","b1","c1"],["l2","a2","b2","c2"],["l3","a3","b3","c3"]]'
   },
})

jb.component('data-test.break-text-regex', {
	impl :{$: 'data-test',
	calculate: {$: 'json.stringify', value: {$: 'break-text', text: '%$textToBreak2%',separators: [';','-|\\|'], useRegex: true } },
   	expectedResult : '%% == [["l1","a1","b1","c1"],["l2","a2","b2","c2"],["l3","a3","b3","c3"]]'
	},
})

jb.component('data-test.zip-arrays', {
	impl :{$: 'data-test',
	calculate: {$: 'json.stringify', value: {$: 'zip-arrays', value: ctx => [[1,2],[10,20],[100,200]] } },
   	expectedResult : '%% == [[1,10,100],[2,20,200]]'
	},
})
