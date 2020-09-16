(function() {
const spySettings = { 
	mutableVerbs: [
		'set','refresh','writeValue','splice',
		'focus','state','method','applyDelta','render','scrollBy'
	],
	verbOntology: [
		['startEnd','start','end'],
		['startEnd','started','completed'],
		['startEnd',['search','select'],['found','notFound']],
		['startEnd','request','result'],
		['startEnd',['create','build'], ['built','created']],
		['startEnd','set','changed'],
		['startEnd','open','close'],
		['startEnd','waitFor','arrived']
	],
	verbs: [
		'sent','received','check', 'register', 'timeout', 'objectProperty',
	],
	lifecycleVerbs: ['init', 'changed','destroyed'],
	flowLifeCycle: ['define','register','next','completed','error'],
	ontology: [
		['kindOf','uiComp', ['dialog','itemlist','tree','tabletree','editableBoolean','helperPopup']],
		['partsOf','uiComp',['frontend','backend']],
		['partsOf','widget',['headlessWidget','widgetFrontend']],
		['aspects','ui', ['watchable','keyboard','service']],
		['objects','ui', ['uiComp','field','uiDelta','vdom','var', 'calculatedVar', 'selectionKeySource']],
		['processIn','ui', ['renderVdom']],

		['subSystem','studio', ['probe','preview','picker','codeMirrorHint']],
		['objects','studio', ['script']],
		['objects','tests', ['testResult','userInput','userRequest','dataTest','uiTest','waitForCompReady','waitForSelector']],
		['processIn','tests', ['test']],
		['processIn','preview',['loadPreview']],
		['processIn','probe',['runCircuit']],
		['kindOf', 'store',['watchable','jbParent']],
		['kindOf', 'var',['calculatedVar']],
		['kindOf', 'service',['selectionKeySource']],

		['subSystem','ui', ['menu']],

		['objects','menu', ['']],
		['kindOf', 'service',['menuKeySource']],

	],
	moreLogs: 'req,res,focus,apply,check,suggestions,writeValue,render,createReactClass,renderResult,probe,setState,immutable,pathOfObject,refObservable,scriptChange,resLog,setGridAreaVals,dragableGridItemThumb,pptrStarted,pptrEmit,pptrActivity,pptrResultData', 
	groups: {
		none: '',
		methods: 'BEMethod,FEMethod',
		refresh: 'doOp,refreshElem,notifyCmpObservable,refreshCmp',
		keyboard: 'registerService,overridingService,fromSelectionKeySource,foundSelectionKeySource,selectionKeySourceNotFound,itemlistOnkeydown,selectionKeySource,itemlistOnkeydownNextSelected,BEMethod,FEMethod,FEFlow,FEProp,followUp,focus',
		puppeteer: 'pptrStarted,pptrEmit,pptrActivity,pptrResultData,pptrInfo,pptrError',
		watchable: 'doOp,writeValue,removeCmpObservable,registerCmpObservable,notifyCmpObservable,notifyObservableElems,notifyObservableElem,scriptChange',
		react: 'BEMethod,applyNewVdom,applyDeltaTop,applyDelta,unmount,render,initCmp,refreshReq,refreshElem,childDiffRes,htmlChange,appendChild,removeChild,replaceTop,calcRenderProp,followUp',
		dialog: 'addDialog,closeDialog,refreshDialogs',
		uiTest: 'userInput,remote,checkTestResult,userRequest,refresh,waitForSelector,waitForSelectorCheck,scrollBy,dataTestResult',
		remoteCallbag: 'innerCBReady,innerCBCodeSent,innerCBDataSent,innerCBMsgReceived,remoteCmdReceived,remoteSource,remoteSink,outputToRemote,inputFromRemote,inputInRemote,outputInRemote',
		menu: 'fromMenuKeySource,menuControl,initPopupMenu,isRelevantMenu,menuKeySourceNotFound,foundMenuKeySource,menuMouseEnter',
	},
	includeLogs: 'exception,error',
	stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
    MAX_LOG_SIZE: 10000
}
const frame = jb.frame
jb.spySettings = spySettings

jb.initSpy = function({Error, settings, spyParam, memoryUsage, resetSpyToNull}) {
	Error = Error || frame.Error,
	memoryUsage = memoryUsage || (() => frame.performance && performance.memory && performance.memory.usedJSHeapSize)
	settings = Object.assign(settings||{}, spySettings)

	const systemProps = ['index', 'time', '_time', 'mem', 'source','activeElem']

    const isRegex = x => Object.prototype.toString.call(x) === '[object RegExp]'
	const isString = x => typeof x === 'string' || x instanceof String
	if (resetSpyToNull)
		return jb.spy = null
    
    return jb.spy = {
		logs: [],
		spyParam,
		otherSpies: [],
		observable() { 
			const _jb = jb.path(jb,'studio.studiojb') || jb
			this._obs = this._obs || _jb.callbag.subject()
			return this._obs
		},
		enabled: () => true,
		parseLogsList(list, depth = 0) {
			if (depth > 3) return []
			return (list || '').split(',').filter(x => x[0] !== '-').filter(x => x)
				// .flatMap(x=> settings.groups[x] ? this.parseLogsList(settings.groups[x],depth+1) : [x])
				//.flatMap(x=> settings.groups[x] ? this.parseLogsList(settings.groups[x],depth+1) : [x])
		},
		calcIncludeLogsFromSpyParam(spyParam) {
			const includeLogsFromParam = this.parseLogsList(spyParam)
			const excludeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
			this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
				acc[log] = true
				return acc
			}, {})
			this.includeLogsInitialized = true
		},
		shouldLog(logNames, record) {
			if (!logNames) debugger
			return this.spyParam === 'all' || typeof record == 'object' && 
				logNames.split(' ').reduce( (acc,logName)=>acc || this.includeLogs[logName],false)
		},
		log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
			if (!this.includeLogsInitialized) this.calcIncludeLogsFromSpyParam(this.spyParam)
			this.updateCounters(logNames)
			this.updateLocations(logNames,takeFrom)
			if (!this.shouldLog(logNames, _record)) return
			const now = new Date()
			const record = {
				logNames,
				..._record,
				index: this.logs.length,
				source: this.source(takeFrom),
				_time: `${now.getSeconds()}:${now.getMilliseconds()}`,
				time: now.getTime(),
				mem: memoryUsage() / 1000000,
				activeElem: typeof jb != 'undefined' && jb.path && jb.path(jb.frame.document,'activeElement'),
				$attsOrder: _record && Object.keys(_record)
			}
			// if (record[0] == null && typeof funcTitle === 'function') {
			// 	record[0] = funcTitle()
			// }
			// if (record[0] == null && record.source) {
			// 	record[0] = record.source[0]
			// }
			// if (typeof modifier === 'function') {
			// 	modifier(record)
			// }
			this.logs.push(record)
			this._obs && this._obs.next(record)
		},
		frameAccessible(frame) { try { return Boolean(frame.document || frame.contentDocument) } catch(e) { return false } },
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const frames = [frame]
			// while (frames[0].parent && frames[0] !== frames[0].parent) {
			// 	frames.unshift(frames[0].parent)
			// }
			let stackTrace = frames.reverse().filter(f=>this.frameAccessible(f)).map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !settings.stackFilter.test(line))
			if (takeFrom) {
				const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
				stackTrace = stackTrace.slice(firstIndex + 1)
			}
			const line = stackTrace[0] || ''
			const res = [
				line.split(/at |as /).pop().split(/ |]/)[0],
				line.split('/').pop().slice(0, -1).trim(),
				...stackTrace
			]
			res.location = line.split(' ').slice(-1)[0].split('(').pop().split(')')[0]
			return res
		},
        
        // browsing methods
		resetParam: spyParam => {
			this.spyParam = spyParam;
			this.includeLogs = null;
		},
		setLogs(spyParam) {
			if (spyParam === 'all')	this.spyParam = 'all'
			this.calcIncludeLogsFromSpyParam(spyParam)
		},
		clear() {
			this.logs = []
			this.counters = {}
		},
		updateCounters(logNames) {
			this.counters = this.counters || {}
			this.counters[logNames] = this.counters[logNames] || 0
			this.counters[logNames]++
		},
		updateLocations(logNames) {
			this.locations = this.locations || {}
			this.locations[logNames] = this.locations[logNames] || this.source().location
		},
		count(query) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), jb.entries(this.counters))) 
			,[]).reduce((acc,e) => acc+e[1], 0)

			function filter(set,exp) {
				return (exp[0] == '!') 
					? set.filter(rec=>!rec[0].match(new RegExp(`\\b${exp.slice(1)}\\b`)))
					: set.filter(rec=>rec[0].match(new RegExp(`\\b${exp}\\b`)))
			}
			function unify(set1,set2) {
				return [...set1,...set2]
			}
		},
		search(query) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), this.logs)) 
			,[])

			function filter(set,exp) {
				return (exp[0] == '!') 
					? set.filter(rec=>!rec.logNames.match(new RegExp(`\\b${exp.slice(1)}\\b`)))
					: set.filter(rec=>rec.logNames.match(new RegExp(`\\b${exp}\\b`)))
			}
			function unify(set1,set2) {
				let res = [...set1,...set2].sort((x,y) => x.index < y.index)
				return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
			}
		}
	}
} 

function initSpyByUrl() {
	const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
	const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
	const spyParam = getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	if (spyParam)
		jb.initSpy({spyParam})
	if (jb.frame) jb.frame.spy = jb.spy // for console use
}
initSpyByUrl()

})()
