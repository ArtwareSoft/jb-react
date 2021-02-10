Object.assign(jb, {
spySettings: { 
	includeLogs: 'exception,error',
	stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
    MAX_LOG_SIZE: 10000
},

initSpy({Error, settings, spyParam, memoryUsage, resetSpyToNull}) {
	const frame = jb.frame
	Error = Error || frame.Error,
	memoryUsage = memoryUsage || (() => frame.performance && performance.memory && performance.memory.usedJSHeapSize)
	settings = Object.assign(settings||{}, jb.spySettings)
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
		calcIncludeLogsFromSpyParam(spyParam) {
			const includeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
			const excludeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
			this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
				acc[log] = true
				return acc
			}, {})
			this.includeLogsInitialized = true
		},
		shouldLog(logNames, record) {
			const ctx = record && (record.ctx || record.srcCtx || record.cmp && record.cmp.ctx)
			if (ctx && ctx.vars.$disableLog || jb.path(record,'m.$disableLog') || jb.path(record,'m.remoteRun.vars.$disableLog')) return false
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
			const index = this.logs.length
			const record = {
				logNames,
				..._record,
				index,
				source: this.source(takeFrom),
				_time: `${now.getSeconds()}:${now.getMilliseconds()}`,
				time: now.getTime(),
				mem: memoryUsage() / 1000000,
				activeElem: jb.path(jb.frame.document,'activeElement'),
				$attsOrder: _record && Object.keys(_record)
			}
			if (this.logs.length > 0 && jb.path(jb.frame.document,'activeElement') != this.logs[index-1].activeElem) {
				this.logs[index-1].logNames += ' focus'
				this.logs[index-1].activeElemAfter = record.activeElem
				this.logs[index-1].focusChanged = true
			}

			this.logs.push(record)
			if (this.logs.length > settings.MAX_LOG_SIZE *1.1)
				this.logs = this.logs.slice(-1* settings.MAX_LOG_SIZE)
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
		search(query,slice= -1000) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), this.logs.slice(slice))) 
			,[])

			function filter(set,exp) {
				return (exp[0] == '!') 
					? set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp.slice(1)) == -1)
					: set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp) != -1)
			}
			function unify(set1,set2) {
				let res = [...set1,...set2].sort((x,y) => x.index < y.index)
				return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
			}
		}
	}
},

initSpyByUrl() {
	const frame = jb.frame
	const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
	const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
	const spyParam = frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
		getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	if (spyParam)
		jb.initSpy({spyParam})
	if (frame) frame.spy = jb.spy // for console use
},

})
//jb.initSpyByUrl()
