jb.component('phones.price', { 
	$: 'cc.scale',
	val: '%price%',
	lowerIsBetter: true,
})

jb.component('phones.popular', {
	impl: {$: 'cc.category',
		domain: 'phones',
		favor: [
			{$: 'phones.hits'},
			{$: 'phones.recent'},
		],
		chart: [
			{$: 'cc.scatter', pivot: [
				{$: 'phones.year'},
				{$: 'phones.price'},
				{$: 'phones.hits'},
				{$: 'phones.make'},
				{$: 'phones.performance'},
				{$: 'phones.size'},
			]}
		],
	}
})
	
jb.component('phones.kids', {
	impl: {$: 'cc.category',
		domain: 'phones',
		favor: [
			{$: 'phones.price'},
		],
		chart: [
			{$: 'cc.scatter', pivot: [
				{$: 'phones.price'},
				{$: 'phones.size'},
				{$: 'phones.hits'},
				{$: 'phones.make'},
				{$: 'phones.year'},
				{$: 'phones.performance'},
			]}
		],
	}
})
