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
