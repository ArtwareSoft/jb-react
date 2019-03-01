(function() {
'use strict'
const spySettings = { 
    moreLogs: 'req,res,focus,apply,check,suggestions,writeValue,render,createReactClass,renderResult,probe,setState,immutable,pathOfObject', 
	includeLogs: 'exception,focus,scriptChange,resLog,immutableErr',
	stackFilter: /wSpy|jb_spy|Object.log|node_modules/i,
    extraIgnoredEvents: [], MAX_LOG_SIZE: 10000, DEFAULT_LOGS_COUNT: 300, GROUP_MIN_LEN: 5
}

function initSpy({Error, frame, settings, wSpyParam, memoryUsage}) {
    const systemProps = ['index', 'time', '_time', 'mem', 'source']

    const isRegex = x => Object.prototype.toString.call(x) === '[object RegExp]'
    const isString = x => typeof x === 'string' || x instanceof String
    
    return {
		ver: 7,
		logs: { $index: 1, $counters: {}},
		wSpyParam,
		otherSpies: [],
		enabled: () => true,
		log(logName, record, {takeFrom, funcTitle} = {}) {
			const init = () => {
				if (!this.includeLogs) {
					const includeLogsFromParam = (this.wSpyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
					const excludeLogsFromParam = (this.wSpyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
					this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
						acc[log] = true
						return acc
					}, {})
				}
			}
			const shouldLog = (logName, record) =>
				this.wSpyParam === 'all' || Array.isArray(record) && this.includeLogs[logName] && !settings.extraIgnoredEvents.includes(record[0])

			init()
			this.logs[logName] = this.logs[logName] || []
			this.logs.$counters[logName] = this.logs.$counters[logName] || 0
			this.logs.$counters[logName]++
			if (!shouldLog(logName, record)) {
				return
			}
			record.index = this.logs.$index++
			record.source = this.source(takeFrom)
			const now = new Date()
			record._time = `${now.getSeconds()}:${now.getMilliseconds()}`
			record.time = now.getTime()
			record.mem = memoryUsage() / 1000000
			if (this.logs[logName].length > settings.MAX_LOG_SIZE) {
				this.logs[logName] = this.logs[logName].slice(-1 * Math.floor(settings.MAX_LOG_SIZE / 2))
			}
			if (!record[0] && typeof funcTitle === 'function') {
				record[0] = funcTitle()
			}
			if (!record[0] && record.source) {
				record[0] = record.source[0]
			}
			this.logs[logName].push(record)
		},
		getCallbackName(cb, takeFrom) {
			if (!cb) {
				return
			}
			if (!cb.name || isString(cb.name) && cb.name.startsWith('bound ')) {
				if (Array.isArray(cb.source)) {
					return cb.source[0]
				}
				const nameFromSource = this.source(takeFrom)
				if (Array.isArray(nameFromSource)) {
					return nameFromSource
				}
			}
			return cb.name.trim()
		},
		logCallBackRegistration(cb, logName, record, takeFrom) {
			cb.source = this.source(takeFrom)
			this.log(logName, [this.getCallbackName(cb, takeFrom), ...record], takeFrom)
		},
		logCallBackExecution(cb, logName, record, takeFrom) {
			this.log(logName, [this.getCallbackName(cb, takeFrom), cb.source, ...record], takeFrom)
		},
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const frames = [frame]
			while (frames[0].parent && frames[0] !== frames[0].parent) {
				frames.unshift(frames[0].parent)
			}
			let stackTrace = frames.reverse().map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !settings.stackFilter.test(line))
			if (takeFrom) {
				const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
				stackTrace = stackTrace.slice(firstIndex + 1)
			}
			const line = stackTrace[0] || ''
			return [
				line.split(/at |as /).pop().split(/ |]/)[0],
				line.split('/').pop().slice(0, -1).trim(),
				...stackTrace
			]
		},
        
        // browsing methods
		resetParam: wSpyParam => {
			this.wSpyParam = wSpyParam;
			this.includeLogs = null;
		},
		purge(count) {
			const countFromEnd = -1 * (count || settings.DEFAULT_LOGS_COUNT)
			Object.keys(this.logs).forEach(log => this.logs[log] = this.logs[log].slice(countFromEnd))
		},
		setLogs(logs) {
			this.includeLogs = (logs||'').split(',').reduce((acc,log) => {acc[log] = true; return acc },{})
		},
		clear(logs) {
			Object.keys(this.logs).forEach(log => this.logs[log] = [])
		},
        search(pattern) {
			if (isRegex(pattern)) {
				return this.merged(x => pattern.test(x.join(' ')))
			} else if (isString(pattern)) {
				return this.merged(x => x.join(' ').indexOf(pattern) !== -1)
			} else if (Number.isInteger(pattern)) {
				return this.merged().slice(-1 * pattern)
			}
		},
		merged(filter) {
			return [].concat.apply([], Object.keys(this.logs).filter(log => Array.isArray(this.logs[log])).map(module =>
				this.logs[module].map(arr => {
					const res = [arr.index, module, ...arr]
					systemProps.forEach(p => {
						res[p] = arr[p]
					})
					return res
				}))).
				filter((e, i, src) => !filter || filter(e, i, src)).
				sort((x, y) => x.index - y.index)
		},
		grouped(filter) {
			const merged = this.merged(filter)
			const countFromEnd = -1 * settings.DEFAULT_LOGS_COUNT
			return [].concat.apply([], merged.reduce((acc, curr, i, arr) => {
				const group = acc[acc.length - 1]
				if (!group) {
					return [newGroup(curr)]
				}
				if (curr[1] === group[0][1]) {
					group.push(curr)
				} else {
					if (group.length > settings.GROUP_MIN_LEN) {
						group.unshift(`[${group.length}] ${group[0][1]}`)
					}
					acc.push(newGroup(curr))
				}
				if (i === arr.length - 1 && group.length > settings.GROUP_MIN_LEN) {
					group.unshift(`[${group.length}] ${group[0][1]}`)
				}
				return acc
			}, []).map(e => e.length > settings.GROUP_MIN_LEN ? [e] : e)).
				slice(countFromEnd).
				map((x, i, arr) => {
					const delay = i === 0 ? 0 : x.time - arr[i - 1].time
					x[0] = `${x[0]} +${delay}`
					return x
				})
			function newGroup(rec) {
				const res = [rec]
				res.time = rec.time
				return res
			}
		}
	}
} 

const noop = () => false;
const noopSpy = {
    log: noop, getCallbackName: noop, logCallBackRegistration: noop, logCallBackExecution: noop, enabled: noop
}

function initBrowserSpy(settings) {
	const getParentUrl = () => { try { return window.parent.location.href } catch(e) {} }
	const getUrl = () => { try { return window.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]w[sS]py=([^&]+)') || ['', ''])[1]
	const getFirstLoadedSpy = () => { try { return window.parent.wSpy } catch(e) {} }

	try {
		const wSpyParam = getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
		if (!wSpyParam) {
			return noopSpy
		}
		const wSpy = initSpy({
			Error: window.Error,
			memoryUsage: () => performance && performance.memory && performance.memory.usedJSHeapSize,
			frame: window,
			wSpyParam,
			settings
		})

		const quickestSpy = getFirstLoadedSpy()
		if (quickestSpy) {
			wSpy.logs = quickestSpy.logs || wSpy.logs
			if ((quickestSpy.ver || 0) < wSpy.ver || 0) {
				// newer version hijacks quickest
				quickestSpy.logs = wSpy.logs // to be moved after all spies have 'logs' property
				wSpy.otherSpies = [quickestSpy, ...quickestSpy.otherSpies || []]
				window.parent.wSpy = wSpy
			} else {
				quickestSpy.otherSpies.push(wSpy)
			}
			return wSpy
		}
		return window.parent.wSpy = wSpy
	} catch (e) {
		return noopSpy
	}
}

if (typeof window == 'object') {
	window.wSpy = initBrowserSpy(spySettings)
}

})()
