jb.component('data-test.object-encoder.stringify', {
	 impl :{$: 'data-test',
		calculate: ctx =>  {
            const base = { base: true };
            const top = { text:'textVal', leaf1: base, leaf2: base};
            return jb.objectEncoder.stringify(top)
        },
		expectedResult : ctx => { 
            return JSON.stringify(ctx.data) === `[{"text":1,"leaf1":2,"leaf2":2},"textVal",{"base":3},true]`
        }
	},
})

jb.component('data-test.object-encoder.encode-decode', {
    impl :{$: 'data-test',
       calculate: ctx =>  {
           const base = { base: true };
           const top = { text:'textVal', leaf1: base, leaf2: base};
           return {top, result: jb.objectEncoder.decode(jb.objectEncoder.encode(top))}
       },
       expectedResult : ctx => { 
           return JSON.stringify(ctx.data) === JSON.stringify(ctx.data.result)
       }
   },
})
