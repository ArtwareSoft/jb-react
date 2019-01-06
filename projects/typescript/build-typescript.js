global.navigator = {
	userAgent: '',
	platform: ''
}

global.document = {
	createRange: () => [],
	createElement: () => ({ setAttribute() {}, })
}
global.window = {
	addEventListener: () => {},
	navigator: global.navigator
}

const jb = require('../../dist/jb-react-all.js')
const fs = require('fs')

jb.ts = {
	types: {}
}

function buildTS() {
	function parseType(type) {
		const single = /([^\[]*)(\[\])?/
		return [].concat.apply([],(type||'').split(',')
		.map(x=>
			x.match(single)[1])
		.map(x=>
			x=='data' ? ['data','aggregator','boolean'] : [x]));
	}

	function fixId(id) {
		return id.replace(/-|\s|\./g,'_')
	}

	function calcTypes() {
		jb.entries(jb.comps)
			.forEach(c=>
				parseType(c[1].type)
					.filter(t => t && t !== '*')
					.forEach(t => jb.ts.types[t] = {}))
	}

	function TSforSingleType(type) {
		const pts = jb.entries(jb.comps).filter(c=>
				(c[1].type||'data').split(',').indexOf(type) != -1
				|| (c[1].typePattern && type.match(c[1].typePattern)))
		
		// type ctrlType = buttonPT | labelPT | ((ctx: ctx) => any)
		const typeLine = `type ${fixId(type)}Type = ${pts.map(pt=>fixId(pt[0]) + 'PT').join(' | ')} | ((ctx: ctx) => any)`
		const TSForPts = pts.map(pt=>TSforPT(pt[0], pt[1]))
		return [
			'',
			'// type ' + type,
			typeLine,
			TSforCompDef(fixId(type)),
			...TSForPts
		].join('\n')
	}

	function TSforPT(id, pt) {
		// buttonPT = {$: 'button', action: actionType}
		return `type ${fixId(id)}PT = {$: '${id}', ` + (pt.params || []).map(param=>TSforParam(param)) + '}'
	}
	function TSforCompDef(type) {
		return `type cmp_def_${type}Type = {
	type: '${type}',
	params?: [param],
	impl: ${type}Type,
}`
	}

	function TSforParam(param) {
		// action: actionType
		const splitArray = /([^\[]*)(\[\])?/
		const typesTS = [].concat.apply([],(param.type||'').split(',')
			.map(x => {
				const match = x.match(splitArray);
				const single = fixId(match[1] || 'data') + 'Type'
				return  match[2] ? `[${single}]` : single
			})
			.map(x=>
				x=='data' ? ['data','aggregator','boolean'] : [x]));
		
		return `${param.id}: ${typesTS.join(' | ')}`
	}

	calcTypes();
	const content = [
`type param = {
	id: string,
	type?: tgpTypeStr,
	as?: 'string' | 'boolean' | 'number',
	defaultValue?: any,
	essential?: boolean,
	dynamic?: boolean,
}
type jbObj = {
	component(id: string, componentDef: cmpDef) : void,
	comps: [cmpDef]
}
type ctx = {
	setVars({any}) : ctx,
	setData(any) : ctx,
	run(profile: profile): any,
	exp(exp: string) : any,
}
declare var jb: jbObj;

`,
		...Object.keys(jb.ts.types).map(type=>TSforSingleType(type)),
		'type cmpDef = ' + Object.keys(jb.ts.types).map(type=>`cmp_def_${fixId(type)}Type`).join(' | ')
		].join('\n')
	const res = fs.writeFileSync('../../dist/jb-react-all.d.ts', content)
	console.log(res)
}

buildTS()