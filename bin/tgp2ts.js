const jb = require('../dist/jbart-core.js')
const fs = require('fs')

jb.ts = {
	types: {}
}

function run() {
    if (getProcessArgument('help'))
        return console.err('Usage: tgp2ts -srcDir -out:myLib')

	const src = getProcessArgument('srcDir') || 'src';
	const files = walk(src).filter(x=>x.match(/\.js$/))
    console.log(src, files.join('\n'))
	const cmpCodes = files.map(file => {
		const content = '' + fs.readFileSync(file)
		return (content.replace(/~/g,'') // ~ char should not exist anyway.. used for lookahead in multiple lines
			.match(/jb\.component\(([^~]+?)\n}\)/g) || [])
			.map(cmpCode => ({cmpCode,file}))
	}).flat()

	cmpCodes.forEach(({cmpCode,file})=>{
		try {
			jb.currentFile = file
			eval(cmpCode)
		} catch(e) {
			console.log('error in tgpCode' + e);
		}
	})
//    const tgpCode = '' + fs.readFileSync(src);
	// const compsByDir = {}
	// jb.entries(jb.comps).forEach(([id,cmp]) => {
	// 	const dir = cmp.fileName.split('/').slice(1,-1).join('/')
	// 	compsByDir[dir] = compsByDir[dir] || []
	// 	compsByDir[dir].push({id,cmp})
	// })
	// console.log(compsByDir)
    //console.log(jb.entries(jb.comps).map(e=>e[0]+' : '+e[1].fileName).join('\n'))
    const content = buildTS();
    if (getProcessArgument('out')) {
        const fn = getProcessArgument('out') + '.d.ts';
        fs.writeFileSync(fn, content)
        process.stdout.write('result written to '+ fn)
    } else {
        process.stdout.write(content)
    }
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

	function calcMacros(path) {
		jb.ts.macroNames = []
		return jb.entries(jb.comps)
			.filter(e=>path ? e[0].indexOf(path) == 0 : e[0].indexOf('.') == -1)
			.map(e=>{
				const id = e[0], pt = e[1]
				const fixedId = jb.macroName(id)
				jb.ts.macroNames.push(fixedId)
				return TSforMacro(fixedId, pt)
			}).join('\n')

		function TSforMacro(id, pt) {
			// buttonMacro = button(action: actionType)
			const params = (pt.params || [])
			const types = TSforType(pt.type).join(' | ')
			if (params.length > 2 && !pt.usageByValue)
				return `\t${id}({ ${params.map(param=>TSforParam(param)).join(', ')} }) : ${types},`
			else
				return `\t${id}(${params.map(param=>TSforParam(param)).join(', ')}) : ${types},`
		}
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
		return `type ${fixId(id)}PT = {$: '${id}', ` + (pt.params || []).map(param=>TSforParam(param)).join(', ') + '}'
	}

	function TSforCompDef(type) {
		return `type cmp_def_${type}Type = {
	type: '${type}',
	params?: [param],
	impl: ${type}Type,
}`
	}

	const splitArray = /([^\[]*)(\[\])?/
	function TSforType(type) {
		// action: actionType
		return [].concat.apply([],(type||'').split(',')
			.map(x => {
				const match = x.match(splitArray);
				const single = fixId(match[1] || 'data') + 'Type'
				return  match[2] ? `[${single}]` : single
			})
			.map(x=>
				x=='data' ? ['data','aggregator','boolean'] : [x]));
	}

	function TSforParam(param) {
		const typesTS = TSforType(param.type)
		const description = param.description ? `\n/** ${param.description} */` : '';
		return `${description}${param.id}: ${typesTS.join(' | ')}`
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
	comps: [cmpDef],
	macros: macros
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
		'type cmpDef = ' + Object.keys(jb.ts.types).map(type=>`cmp_def_${fixId(type)}Type`).join(' | '),
		'type macros = {\n' + calcMacros('') + '\n}',
		`// const {${jb.ts.macroNames.join(',')}} = jb.macros`
		].join('\n')
	return content
}

// ****************** utils ***********************

function getProcessArgument(argName) {
    for (var i = 0; i < process.argv.length; i++) {
      var arg = process.argv[i];
      if (arg.indexOf('-' + argName + ':') == 0) 
        return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
      if (arg == '-' + argName) return true;
    }
    return '';
}

/// ****** empty stubs for global objects that may exist in the source code
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
run()

function walk(dir, depth) {
	if (dir.match(/node_modules/)) return []
	if (depth > 5) return [];
    return fs.readdirSync(dir).reduce((result, entry) => {
        const path = dir + '/' + entry;
		const stat = fs.statSync(path);
		const inner = (stat && stat.isDirectory()) ? walk(path,(depth || 1) + 1) : [path]
		return [...result, ...inner ] 
    }, []);
}