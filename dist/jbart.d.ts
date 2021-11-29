type param = {
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



// type any
type anyType = callPT | ((ctx: ctx) => any)
type cmp_def_anyType = {
	type: 'any',
	params?: [param],
	impl: anyType,
}
type callPT = {$: 'call', 
/** parameter name */param: dataType}

// type data
type dataType = pipelinePT | pipePT | data_ifPT | listPT | firstSucceedingPT | keysPT | propertiesPT | entriesPT | math_plusPT | math_minusPT | evalExpressionPT | prefixPT | suffixPT | removePrefixPT | removeSuffixPT | removeSuffixRegexPT | propertyPT | indexOfPT | objPT | extendPT | assignPT | IfPT | toUpperCasePT | toLowerCasePT | capitalizePT | logPT | asIsPT | objectPT | json_stringifyPT | json_parsePT | splitPT | replacePT | delayPT | extractPrefixPT | extractSuffixPT | rangePT | typeOfPT | classNamePT | isRefPT | asRefPT | data_switchPT | formatDatePT | getSessionStoragePT | action_setSessionStoragePT | waitForPT | codeLoader_getCodePT | codeLoader_getCodeFromRemotePT | codeLoader_setCodeLoaderJbmPT | watchableAsTextPT | codeEditor_isDirtyPT | watchableComps_changedCompsPT | watchableComps_scriptHistoryItemsPT | http_getPT | http_fetchPT | extractTextPT | breakTextPT | zipArraysPT | removeSectionsPT | mergePT | dynamicObjectPT | filterEmptyPropertiesPT | trimPT | splitToLinesPT | newLinePT | removePrefixRegexPT | prettyPrintPT | remote_dataPT | net_getRootParentUriPT | net_listAllPT | dataResource_yellowPagesPT | rx_pipePT | rx_countPT | rx_joinPT | rx_maxPT | rx_logPT | rx_clogPT | rx_snifferPT | rx_subjectPT | rx_queuePT | uiTest_vdomResultAsHtmlPT | dataResource_angrybirdsPostsPT | feature_requireServicePT | service_registerBackEndServicePT | customStylePT | styleByControlPT | styleWithFeaturesPT | css_valueOfCssVarPT | dialog_shownDialogsPT | dialogs_cmpIdOfDialogPT | dialogs_shownPopupsPT | itemlist_deltaOfItemsPT | itemlist_calcSlicedItemsPT | menu_isRelevantMenuPT | multiSelect_modelAsBooleanRefPT | widget_newIdPT | widget_headlessWidgetsPT | text_highlightPT | defaultThemePT | tree_pathOfInteractiveItemPT | tree_parentPathPT | tree_lastPathElementPT | ((ctx: ctx) => any)
type cmp_def_dataType = {
	type: 'data',
	params?: [param],
	impl: dataType,
}
type pipelinePT = {$: 'pipeline', 
/** click "=" for functions list */items: dataType | [aggregatorType]}
type pipePT = {$: 'pipe', items: dataType | [aggregatorType]}
type data_ifPT = {$: 'data.if', condition: booleanType, then: dataType, else: dataType}
type listPT = {$: 'list', items: [dataType]}
type firstSucceedingPT = {$: 'firstSucceeding', items: [dataType]}
type keysPT = {$: 'keys', obj: dataType}
type propertiesPT = {$: 'properties', obj: dataType}
type entriesPT = {$: 'entries', obj: dataType}
type math_plusPT = {$: 'math.plus', x: dataType, y: dataType}
type math_minusPT = {$: 'math.minus', x: dataType, y: dataType}
type evalExpressionPT = {$: 'evalExpression', expression: dataType}
type prefixPT = {$: 'prefix', separator: dataType, text: dataType}
type suffixPT = {$: 'suffix', separator: dataType, text: dataType}
type removePrefixPT = {$: 'removePrefix', separator: dataType, text: dataType}
type removeSuffixPT = {$: 'removeSuffix', separator: dataType, text: dataType}
type removeSuffixRegexPT = {$: 'removeSuffixRegex', 
/** regular expression. e.g [0-9]* */suffix: dataType, text: dataType}
type propertyPT = {$: 'property', prop: dataType, obj: dataType}
type indexOfPT = {$: 'indexOf', array: dataType, item: dataType}
type objPT = {$: 'obj', props: [propType]}
type extendPT = {$: 'extend', props: [propType]}
type assignPT = {$: 'assign', props: [propType]}
type IfPT = {$: 'If', condition: booleanType, then: dataType, Else: dataType}
type toUpperCasePT = {$: 'toUpperCase', text: dataType}
type toLowerCasePT = {$: 'toLowerCase', text: dataType}
type capitalizePT = {$: 'capitalize', text: dataType}
type logPT = {$: 'log', logName: dataType, logObj: dataType}
type asIsPT = {$: 'asIs', $asIs: dataType}
type objectPT = {$: 'object', }
type json_stringifyPT = {$: 'json.stringify', value: dataType, 
/** use space or tab to make pretty output */space: dataType}
type json_parsePT = {$: 'json.parse', text: dataType}
type splitPT = {$: 'split', 
/** E.g., "," or "<a>" */separator: dataType, text: dataType, part: dataType}
type replacePT = {$: 'replace', find: dataType, replace: dataType, text: dataType, useRegex: booleanType, 
/** g,i,m */regexFlags: dataType}
type delayPT = {$: 'delay', mSec: dataType}
type extractPrefixPT = {$: 'extractPrefix', 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}
type extractSuffixPT = {$: 'extractSuffix', 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}
type rangePT = {$: 'range', from: dataType, to: dataType}
type typeOfPT = {$: 'typeOf', obj: dataType}
type classNamePT = {$: 'className', obj: dataType}
type isRefPT = {$: 'isRef', obj: dataType}
type asRefPT = {$: 'asRef', obj: dataType}
type data_switchPT = {$: 'data.switch', cases: [data_switch_caseType], default: dataType}
type formatDatePT = {$: 'formatDate', 
/** Date value */date: dataType, dateStyle: dataType, timeStyle: dataType, weekday: dataType, year: dataType, month: dataType, day: dataType, hour: dataType, minute: dataType, second: dataType, timeZoneName: dataType}
type getSessionStoragePT = {$: 'getSessionStorage', id: dataType}
type action_setSessionStoragePT = {$: 'action.setSessionStorage', id: dataType, value: dataType}
type waitForPT = {$: 'waitFor', check: dataType, interval: dataType, timeout: dataType}
type codeLoader_getCodePT = {$: 'codeLoader.getCode', }
type codeLoader_getCodeFromRemotePT = {$: 'codeLoader.getCodeFromRemote', ids: dataType}
type codeLoader_setCodeLoaderJbmPT = {$: 'codeLoader.setCodeLoaderJbm', codeLoaderUri: dataType}
type watchableAsTextPT = {$: 'watchableAsText', ref: dataType, oneWay: booleanType}
type codeEditor_isDirtyPT = {$: 'codeEditor.isDirty', }
type watchableComps_changedCompsPT = {$: 'watchableComps.changedComps', }
type watchableComps_scriptHistoryItemsPT = {$: 'watchableComps.scriptHistoryItems', }
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type extractTextPT = {$: 'extractText', text: dataType, startMarkers: [dataType], endMarker: dataType, 
/** include the marker at part of the result */includingStartMarker: booleanType, 
/** include the marker at part of the result */includingEndMarker: booleanType, 
/** apply the markers repeatingly */repeating: booleanType, noTrim: booleanType, 
/** use regular expression in markers */useRegex: booleanType, 
/** return the inverse result. E.g. exclude remarks */exclude: booleanType}
type breakTextPT = {$: 'breakText', text: dataType, 
/** multi level separators */separators: dataType, 
/** use regular expression in separators */useRegex: booleanType}
type zipArraysPT = {$: 'zipArrays', 
/** array of arrays */value: dataType}
type removeSectionsPT = {$: 'removeSections', text: dataType, startMarker: dataType, endMarker: dataType, keepEndMarker: booleanType}
type mergePT = {$: 'merge', objects: dataType}
type dynamicObjectPT = {$: 'dynamicObject', items: dataType, propertyName: dataType, value: dataType}
type filterEmptyPropertiesPT = {$: 'filterEmptyProperties', obj: dataType}
type trimPT = {$: 'trim', text: dataType}
type splitToLinesPT = {$: 'splitToLines', text: dataType}
type newLinePT = {$: 'newLine', }
type removePrefixRegexPT = {$: 'removePrefixRegex', prefix: dataType, text: dataType}
type prettyPrintPT = {$: 'prettyPrint', profile: dataType, forceFlat: booleanType}
type remote_dataPT = {$: 'remote.data', data: dataType, jbm: jbmType, timeout: dataType}
type net_getRootParentUriPT = {$: 'net.getRootParentUri', }
type net_listAllPT = {$: 'net.listAll', }
type dataResource_yellowPagesPT = {$: 'dataResource.yellowPages', }
type rx_pipePT = {$: 'rx.pipe', elems: [rxType]}
type rx_countPT = {$: 'rx.count', varName: dataType}
type rx_joinPT = {$: 'rx.join', varName: dataType, separator: dataType}
type rx_maxPT = {$: 'rx.max', varName: dataType, value: dataType}
type rx_logPT = {$: 'rx.log', name: dataType, extra: dataType}
type rx_clogPT = {$: 'rx.clog', name: dataType}
type rx_snifferPT = {$: 'rx.sniffer', name: dataType}
type rx_subjectPT = {$: 'rx.subject', 
/** keep pushed items for late subscription */replay: booleanType, 
/** relevant for replay, empty for unlimited */itemsToKeep: dataType}
type rx_queuePT = {$: 'rx.queue', items: dataType}
type uiTest_vdomResultAsHtmlPT = {$: 'uiTest.vdomResultAsHtml', }
type dataResource_angrybirdsPostsPT = {$: 'dataResource.angrybirdsPosts', }
type feature_requireServicePT = {$: 'feature.requireService', service: serviceType, condition: dataType}
type service_registerBackEndServicePT = {$: 'service.registerBackEndService', id: dataType, service: dataType, allowOverride: booleanType}
type customStylePT = {$: 'customStyle', template: dataType, css: dataType, features: [featureType]}
type styleByControlPT = {$: 'styleByControl', control: controlType, modelVar: dataType}
type styleWithFeaturesPT = {$: 'styleWithFeatures', style: $asParentType, features: [featureType]}
type css_valueOfCssVarPT = {$: 'css.valueOfCssVar', 
/** without the -- prefix */varName: dataType, 
/** html element under which to check the var, default is document.body */parent: dataType}
type dialog_shownDialogsPT = {$: 'dialog.shownDialogs', }
type dialogs_cmpIdOfDialogPT = {$: 'dialogs.cmpIdOfDialog', id: dataType}
type dialogs_shownPopupsPT = {$: 'dialogs.shownPopups', }
type itemlist_deltaOfItemsPT = {$: 'itemlist.deltaOfItems', }
type itemlist_calcSlicedItemsPT = {$: 'itemlist.calcSlicedItems', }
type menu_isRelevantMenuPT = {$: 'menu.isRelevantMenu', }
type multiSelect_modelAsBooleanRefPT = {$: 'multiSelect.modelAsBooleanRef', multiSelectModel: dataType, code: dataType}
type widget_newIdPT = {$: 'widget.newId', jbm: jbmType}
type widget_headlessWidgetsPT = {$: 'widget.headlessWidgets', }
type text_highlightPT = {$: 'text.highlight', base: dataType, highlight: dataType, cssClass: dataType}
type defaultThemePT = {$: 'defaultTheme', }
type tree_pathOfInteractiveItemPT = {$: 'tree.pathOfInteractiveItem', }
type tree_parentPathPT = {$: 'tree.parentPath', path: dataType}
type tree_lastPathElementPT = {$: 'tree.lastPathElement', path: dataType}

// type aggregator
type aggregatorType = aggregatePT | math_maxPT | math_minPT | math_sumPT | slicePT | sortPT | firstPT | lastPT | countPT | reversePT | samplePT | extendWithIndexPT | pipeline_varPT | filterPT | joinPT | uniquePT | wrapAsObjectPT | stat_groupByPT | itemlistContainer_filterPT | ((ctx: ctx) => any)
type cmp_def_aggregatorType = {
	type: 'aggregator',
	params?: [param],
	impl: aggregatorType,
}
type aggregatePT = {$: 'aggregate', aggregator: aggregatorType}
type math_maxPT = {$: 'math.max', }
type math_minPT = {$: 'math.min', }
type math_sumPT = {$: 'math.sum', }
type slicePT = {$: 'slice', 
/** 0-based index */start: dataType, 
/** 0-based index of where to end the selection (not including itself) */end: dataType}
type sortPT = {$: 'sort', 
/** sort by property inside object */propertyName: dataType, lexical: booleanType, ascending: booleanType}
type firstPT = {$: 'first', items: dataType}
type lastPT = {$: 'last', items: dataType}
type countPT = {$: 'count', items: dataType}
type reversePT = {$: 'reverse', items: dataType}
type samplePT = {$: 'sample', size: dataType, items: dataType}
type extendWithIndexPT = {$: 'extendWithIndex', props: [propType]}
type pipeline_varPT = {$: 'pipeline.var', name: dataType, val: dataType}
type filterPT = {$: 'filter', filter: booleanType}
type joinPT = {$: 'join', separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemText: dataType}
type uniquePT = {$: 'unique', id: dataType, items: dataType}
type wrapAsObjectPT = {$: 'wrapAsObject', propertyName: dataType, value: dataType, items: dataType}
type stat_groupByPT = {$: 'stat.groupBy', by: dataType, calculate: [fieldInGroupType]}
type itemlistContainer_filterPT = {$: 'itemlistContainer.filter', updateCounters: booleanType}

// type boolean
type booleanType = notPT | andPT | orPT | betweenPT | containsPT | notContainsPT | startsWithPT | endsWithPT | matchRegexPT | isNullPT | notNullPT | isEmptyPT | notEmptyPT | equalsPT | notEqualsPT | isOfTypePT | inGroupPT | key_eventMatchKeyPT | key_eventToMethodPT | menu_notSeparatorPT | tree_sameParentPT | ((ctx: ctx) => any)
type cmp_def_booleanType = {
	type: 'boolean',
	params?: [param],
	impl: booleanType,
}
type notPT = {$: 'not', of: booleanType}
type andPT = {$: 'and', items: [booleanType]}
type orPT = {$: 'or', items: [booleanType]}
type betweenPT = {$: 'between', from: dataType, to: dataType, val: dataType}
type containsPT = {$: 'contains', text: [dataType], allText: dataType, inOrder: booleanType}
type notContainsPT = {$: 'notContains', text: [dataType], allText: dataType}
type startsWithPT = {$: 'startsWith', startsWith: dataType, text: dataType}
type endsWithPT = {$: 'endsWith', endsWith: dataType, text: dataType}
type matchRegexPT = {$: 'matchRegex', 
/** e.g: [a-zA-Z]* */regex: dataType, text: dataType}
type isNullPT = {$: 'isNull', obj: dataType}
type notNullPT = {$: 'notNull', obj: dataType}
type isEmptyPT = {$: 'isEmpty', item: dataType}
type notEmptyPT = {$: 'notEmpty', item: dataType}
type equalsPT = {$: 'equals', item1: dataType, item2: dataType}
type notEqualsPT = {$: 'notEquals', item1: dataType, item2: dataType}
type isOfTypePT = {$: 'isOfType', 
/** e.g., string,boolean,array */type: dataType, obj: dataType}
type inGroupPT = {$: 'inGroup', group: dataType, item: dataType}
type key_eventMatchKeyPT = {$: 'key.eventMatchKey', event: dataType, 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType}
type key_eventToMethodPT = {$: 'key.eventToMethod', event: dataType, elem: dataType}
type menu_notSeparatorPT = {$: 'menu.notSeparator', elem: dataType}
type tree_sameParentPT = {$: 'tree.sameParent', path1: dataType, path2: dataType}

// type action
type actionType = action_ifPT | writeValuePT | addToArrayPT | movePT | splicePT | removeFromArrayPT | mutable_toggleBooleanValuePT | runActionsPT | runActionOnItemPT | runActionOnItemsPT | delayPT | onNextTimerPT | action_switchPT | addComponentPT | loadLibsPT | loadAppFilesPT | codeEditor_withCursorPathPT | watchableComps_undoPT | watchableComps_cleanSelectionPreviewPT | watchableComps_revertPT | watchableComps_redoPT | jbm_terminateChildPT | http_getPT | http_fetchPT | pptr_refreshServerCodePT | pptr_closeBrowserPT | remote_actionPT | remote_copyPassiveDataPT | remote_useYellowPagesPT | rx_pipePT | action_subjectNextPT | action_subjectCompletePT | action_subjectErrorPT | action_addToQueuePT | action_removeFromQueuePT | runTransactionPT | tests_runnerPT | uiAction_waitForSelectorPT | uiAction_waitForCompReadyPT | animation_startPT | animation_timelinePT | refreshControlByIdPT | refreshIfNotWatchablePT | action_applyDeltaToCmpPT | action_focusOnCmpPT | renderWidgetPT | dialog_createDialogTopIfNeededPT | dialog_closeAllPT | dialogs_destroyAllEmittersPT | editableText_setInputStatePT | action_runBEMethodPT | action_runFEMethodPT | action_refreshCmpPT | itemlist_applyDeltaOfNextPagePT | action_frontEndDeltaPT | remote_distributedWidgetPT | action_renderXwidgetPT | tree_regainFocusPT | tree_redrawPT | tree_moveItemPT | urlHistory_mapUrlToResourcePT | winUtils_gotoUrlPT | ((ctx: ctx) => any)
type cmp_def_actionType = {
	type: 'action',
	params?: [param],
	impl: actionType,
}
type action_ifPT = {$: 'action.if', condition: booleanType, then: actionType, else: actionType}
type writeValuePT = {$: 'writeValue', to: dataType, value: dataType, noNotifications: booleanType}
type addToArrayPT = {$: 'addToArray', array: dataType, toAdd: dataType}
type movePT = {$: 'move', from: dataType, to: dataType}
type splicePT = {$: 'splice', array: dataType, fromIndex: dataType, noOfItemsToRemove: dataType, itemsToAdd: dataType}
type removeFromArrayPT = {$: 'removeFromArray', array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}
type mutable_toggleBooleanValuePT = {$: 'mutable.toggleBooleanValue', of: dataType}
type runActionsPT = {$: 'runActions', actions: [actionType]}
type runActionOnItemPT = {$: 'runActionOnItem', item: dataType, action: actionType}
type runActionOnItemsPT = {$: 'runActionOnItems', items: dataType, action: actionType, indexVariable: dataType}
type delayPT = {$: 'delay', mSec: dataType}
type onNextTimerPT = {$: 'onNextTimer', action: actionType, delay: numberType}
type action_switchPT = {$: 'action.switch', cases: [action_switch_caseType], defaultAction: actionType}
type addComponentPT = {$: 'addComponent', id: dataType, value: dataType, type: dataType}
type loadLibsPT = {$: 'loadLibs', libs: dataType}
type loadAppFilesPT = {$: 'loadAppFiles', jsFiles: dataType}
type codeEditor_withCursorPathPT = {$: 'codeEditor.withCursorPath', action: actionType, selector: dataType}
type watchableComps_undoPT = {$: 'watchableComps.undo', }
type watchableComps_cleanSelectionPreviewPT = {$: 'watchableComps.cleanSelectionPreview', }
type watchableComps_revertPT = {$: 'watchableComps.revert', toIndex: dataType}
type watchableComps_redoPT = {$: 'watchableComps.redo', }
type jbm_terminateChildPT = {$: 'jbm.terminateChild', id: dataType}
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type pptr_refreshServerCodePT = {$: 'pptr.refreshServerCode', remote: remoteType}
type pptr_closeBrowserPT = {$: 'pptr.closeBrowser', }
type remote_actionPT = {$: 'remote.action', action: dataType, jbm: jbmType, 
/** do not wait for the respone */oneway: booleanType, timeout: dataType}
type remote_copyPassiveDataPT = {$: 'remote.copyPassiveData', jbm: jbmType}
type remote_useYellowPagesPT = {$: 'remote.useYellowPages', }
type rx_pipePT = {$: 'rx.pipe', elems: [rxType]}
type action_subjectNextPT = {$: 'action.subjectNext', subject: dataType, data: dataType}
type action_subjectCompletePT = {$: 'action.subjectComplete', subject: dataType}
type action_subjectErrorPT = {$: 'action.subjectError', subject: dataType, error: dataType}
type action_addToQueuePT = {$: 'action.addToQueue', queue: dataType, item: dataType}
type action_removeFromQueuePT = {$: 'action.removeFromQueue', queue: dataType, item: dataType}
type runTransactionPT = {$: 'runTransaction', actions: [actionType], noNotifications: booleanType, handler: dataType}
type tests_runnerPT = {$: 'tests.runner', tests: dataType, jbm: jbmType, rootElemId: dataType}
type uiAction_waitForSelectorPT = {$: 'uiAction.waitForSelector', selector: dataType}
type uiAction_waitForCompReadyPT = {$: 'uiAction.waitForCompReady', selector: dataType}
type animation_startPT = {$: 'animation.start', animation: [animationType], 
/** query selector or elements, default is current control */target: dataType, 
/** alternate goes back to origin */direction: dataType, loop: booleanType, 
/** in mSec */duration: dataType}
type animation_timelinePT = {$: 'animation.timeline', animation: [animationType], 
/** query selector, default is current control */target: dataType}
type refreshControlByIdPT = {$: 'refreshControlById', id: dataType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType}
type refreshIfNotWatchablePT = {$: 'refreshIfNotWatchable', data: dataType}
type action_applyDeltaToCmpPT = {$: 'action.applyDeltaToCmp', delta: dataType, cmpId: dataType, assumedVdom: dataType}
type action_focusOnCmpPT = {$: 'action.focusOnCmp', description: dataType, cmpId: dataType}
type renderWidgetPT = {$: 'renderWidget', control: controlType, selector: dataType}
type dialog_createDialogTopIfNeededPT = {$: 'dialog.createDialogTopIfNeeded', }
type dialog_closeAllPT = {$: 'dialog.closeAll', }
type dialogs_destroyAllEmittersPT = {$: 'dialogs.destroyAllEmitters', }
type editableText_setInputStatePT = {$: 'editableText.setInputState', newVal: dataType, 
/** contains value and selectionStart, the action is not performed if the not in this state */assumedVal: dataType, selectionStart: dataType, cmp: dataType}
type action_runBEMethodPT = {$: 'action.runBEMethod', method: dataType, data: dataType, vars: dataType}
type action_runFEMethodPT = {$: 'action.runFEMethod', method: dataType, data: dataType, vars: dataType}
type action_refreshCmpPT = {$: 'action.refreshCmp', state: dataType, options: dataType}
type itemlist_applyDeltaOfNextPagePT = {$: 'itemlist.applyDeltaOfNextPage', pageSize: dataType}
type action_frontEndDeltaPT = {$: 'action.frontEndDelta', event: dataType}
type remote_distributedWidgetPT = {$: 'remote.distributedWidget', control: controlType, backend: jbmType, frontend: jbmType, 
/** root selector to put widget in. e.g. #main */selector: dataType}
type action_renderXwidgetPT = {$: 'action.renderXwidget', selector: dataType, widgetId: dataType}
type tree_regainFocusPT = {$: 'tree.regainFocus', }
type tree_redrawPT = {$: 'tree.redraw', strong: booleanType}
type tree_moveItemPT = {$: 'tree.moveItem', from: dataType, to: dataType}
type urlHistory_mapUrlToResourcePT = {$: 'urlHistory.mapUrlToResource', params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}
type winUtils_gotoUrlPT = {$: 'winUtils.gotoUrl', url: dataType, target: enumType}

// type prop
type propType = propPT | refPropPT | ((ctx: ctx) => any)
type cmp_def_propType = {
	type: 'prop',
	params?: [param],
	impl: propType,
}
type propPT = {$: 'prop', title: dataType, val: dataType, type: dataType}
type refPropPT = {$: 'refProp', title: dataType, val: dataType}

// type data.switch-case
type data_switch_caseType = data_casePT | ((ctx: ctx) => any)
type cmp_def_data_switch_caseType = {
	type: 'data_switch_case',
	params?: [param],
	impl: data_switch_caseType,
}
type data_casePT = {$: 'data.case', condition: booleanType, value: dataType}

// type action.switch-case
type action_switch_caseType = action_switchCasePT | ((ctx: ctx) => any)
type cmp_def_action_switch_caseType = {
	type: 'action_switch_case',
	params?: [param],
	impl: action_switch_caseType,
}
type action_switchCasePT = {$: 'action.switchCase', condition: booleanType, action: actionType}

// type var
type varType = VarPT | ((ctx: ctx) => any)
type cmp_def_varType = {
	type: 'var',
	params?: [param],
	impl: varType,
}
type VarPT = {$: 'Var', name: dataType, val: dataType}

// type system
type systemType = VarPT | remarkPT | ((ctx: ctx) => any)
type cmp_def_systemType = {
	type: 'system',
	params?: [param],
	impl: systemType,
}
type VarPT = {$: 'Var', name: dataType, val: dataType}
type remarkPT = {$: 'remark', remark: dataType}

// type dispatch.server
type dispatch_serverType = dispatch_singleJbmPT | ((ctx: ctx) => any)
type cmp_def_dispatch_serverType = {
	type: 'dispatch_server',
	params?: [param],
	impl: dispatch_serverType,
}
type dispatch_singleJbmPT = {$: 'dispatch.singleJbm', jbm: jbmType, capabilities: [dispatch_capabilitiesType]}

// type menu.option
type menu_optionType = codeEditor_setSelectedPTPT | menu_menuPT | menu_dynamicOptionsPT | menu_endWithSeparatorPT | menu_separatorPT | menu_actionPT | ((ctx: ctx) => any)
type cmp_def_menu_optionType = {
	type: 'menu_option',
	params?: [param],
	impl: menu_optionType,
}
type codeEditor_setSelectedPTPT = {$: 'codeEditor.setSelectedPT', path: dataType, semanticPart: dataType, compName: dataType}
type menu_menuPT = {$: 'menu.menu', title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}
type menu_dynamicOptionsPT = {$: 'menu.dynamicOptions', items: dataType, genericOption: menu_optionType}
type menu_endWithSeparatorPT = {$: 'menu.endWithSeparator', options: [menu_optionType], separator: menu_optionType, title: dataType}
type menu_separatorPT = {$: 'menu.separator', }
type menu_actionPT = {$: 'menu.action', title: dataType, action: actionType, description: dataType, icon: iconType, shortcut: dataType, showCondition: booleanType}

// type jbm
type jbmType = jbm_byUriPT | jbm_selfPT | jbm_nodeContainerPT | ((ctx: ctx) => any)
type cmp_def_jbmType = {
	type: 'jbm',
	params?: [param],
	impl: jbmType,
}
type jbm_byUriPT = {$: 'jbm.byUri', uri: dataType}
type jbm_selfPT = {$: 'jbm.self', }
type jbm_nodeContainerPT = {$: 'jbm.nodeContainer', modules: dataType, host: dataType, init: actionType}

// type pptr.crawler
type pptr_crawlerType = pptr_crawlerPT | ((ctx: ctx) => any)
type cmp_def_pptr_crawlerType = {
	type: 'pptr_crawler',
	params?: [param],
	impl: pptr_crawlerType,
}
type pptr_crawlerPT = {$: 'pptr.crawler', rootUrl: dataType, pageCrawlers: [pptr_page_crawlerType], resultData: dataType, 
/** watchable data to get get events about data changes */resultIndex: dataType, 
/** {url, vars?, nextPptrPageType? } */requestQueue: dataType}

// type pptr.page-crawler
type pptr_page_crawlerType = pptr_pageCrawlerPT | ((ctx: ctx) => any)
type cmp_def_pptr_page_crawlerType = {
	type: 'pptr_page_crawler',
	params?: [param],
	impl: pptr_page_crawlerType,
}
type pptr_pageCrawlerPT = {$: 'pptr.pageCrawler', url: dataType, features: [pptr_featureType], extract: pptr_extractType, 
/** single or array, better to have id */transformToResultItems: dataType, 
/** optional props: varsForFollowing, nextPptrPageType */transformToUrlRequests: dataType}

// type rx
type rxType = pptr_runMethodOnPptrPT | pptr_querySelectorPT | pptr_xpathPT | pptr_jsFunctionPT | pptr_jsPropertyPT | pptr_typePT | pptr_gotoInnerFrameBodyPT | pptr_javascriptOnPptrPT | pptr_contentFramePT | source_remotePT | remote_operatorPT | source_dataPT | source_watchableDataPT | source_callbagPT | source_eventPT | source_anyPT | source_promisePT | source_intervalPT | rx_pipePT | rx_mergePT | rx_innerPipePT | rx_forkPT | rx_startWithPT | rx_varPT | rx_resourcePT | rx_reducePT | rx_doPT | rx_doPromisePT | rx_mapPT | rx_mapPromisePT | rx_filterPT | rx_flatMapPT | rx_flatMapArraysPT | rx_concatMapPT | rx_distinctUntilChangedPT | rx_catchErrorPT | rx_timeoutLimitPT | rx_throwErrorPT | rx_debounceTimePT | rx_throttleTimePT | rx_delayPT | rx_replayPT | rx_takeUntilPT | rx_takePT | rx_takeWhilePT | rx_toArrayPT | rx_lastPT | rx_skipPT | rx_subscribePT | sink_actionPT | sink_dataPT | sink_subjectNextPT | source_subjectPT | source_queuePT | source_testsResultsPT | userInput_eventToRequestPT | sink_applyDeltaToCmpPT | source_eventIncludingPreviewPT | dialogs_changeEmitterPT | editableText_addUserEventPT | sink_BEMethodPT | sink_FEMethodPT | sink_refreshCmpPT | source_frontEndEventPT | rx_userEventVarPT | source_findSelectionKeySourcePT | source_findMenuKeySourcePT | widget_headlessPT | ((ctx: ctx) => any)
type cmp_def_rxType = {
	type: 'rx',
	params?: [param],
	impl: rxType,
}
type pptr_runMethodOnPptrPT = {$: 'pptr.runMethodOnPptr', method: dataType, args: dataType}
type pptr_querySelectorPT = {$: 'pptr.querySelector', selector: dataType, 
/** querySelectorAll */multiple: booleanType}
type pptr_xpathPT = {$: 'pptr.xpath', 
/** e.g, //*[contains(text(), 'Hello')] */xpath: dataType}
type pptr_jsFunctionPT = {$: 'pptr.jsFunction', expression: dataType}
type pptr_jsPropertyPT = {$: 'pptr.jsProperty', propName: dataType}
type pptr_typePT = {$: 'pptr.type', text: dataType, enterAtEnd: booleanType, 
/** time between clicks */delay: dataType}
type pptr_gotoInnerFrameBodyPT = {$: 'pptr.gotoInnerFrameBody', }
type pptr_javascriptOnPptrPT = {$: 'pptr.javascriptOnPptr', func: dataType}
type pptr_contentFramePT = {$: 'pptr.contentFrame', }
type source_remotePT = {$: 'source.remote', rx: rxType, jbm: jbmType}
type remote_operatorPT = {$: 'remote.operator', rx: rxType, jbm: jbmType}
type source_dataPT = {$: 'source.data', data: dataType}
type source_watchableDataPT = {$: 'source.watchableData', ref: dataType, 
/** watch childern change as well */includeChildren: dataType}
type source_callbagPT = {$: 'source.callbag', 
/** callbag source function */callbag: dataType}
type source_eventPT = {$: 'source.event', event: dataType, 
/** html element */elem: dataType, 
/** addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */options: dataType}
type source_anyPT = {$: 'source.any', 
/** the source is detected by its type: promise, iterable, single, callbag element, etc.. */source: dataType}
type source_promisePT = {$: 'source.promise', promise: dataType}
type source_intervalPT = {$: 'source.interval', 
/** time in mSec */interval: dataType}
type rx_pipePT = {$: 'rx.pipe', elems: [rxType]}
type rx_mergePT = {$: 'rx.merge', sources: [rxType]}
type rx_innerPipePT = {$: 'rx.innerPipe', elems: [rxType]}
type rx_forkPT = {$: 'rx.fork', elems: [rxType]}
type rx_startWithPT = {$: 'rx.startWith', sources: [rxType]}
type rx_varPT = {$: 'rx.var', 
/** if empty, does nothing */name: dataType, value: dataType}
type rx_resourcePT = {$: 'rx.resource', 
/** if empty, does nothing */name: dataType, value: dataType}
type rx_reducePT = {$: 'rx.reduce', 
/** the result is accumulated in this var */varName: dataType, 
/** receives first value as input */initialValue: dataType, 
/** the accumulated value use %$acc%,%% %$prev% */value: dataType, 
/** used for join with separators, initialValue uses the first value without adding the separtor */avoidFirst: booleanType}
type rx_doPT = {$: 'rx.do', action: actionType}
type rx_doPromisePT = {$: 'rx.doPromise', action: actionType}
type rx_mapPT = {$: 'rx.map', func: dataType}
type rx_mapPromisePT = {$: 'rx.mapPromise', func: dataType}
type rx_filterPT = {$: 'rx.filter', filter: booleanType}
type rx_flatMapPT = {$: 'rx.flatMap', 
/** map each input to source callbag */source: rxType}
type rx_flatMapArraysPT = {$: 'rx.flatMapArrays', 
/** should return array, items will be passed one by one */func: dataType}
type rx_concatMapPT = {$: 'rx.concatMap', 
/** keeps the order of the results, can return array, promise or callbag */func: dataType, 
/** combines %$input% with the inner result %% */combineResultWithInput: dataType}
type rx_distinctUntilChangedPT = {$: 'rx.distinctUntilChanged', 
/** e.g. %% == %$prev% */equalsFunc: dataType}
type rx_catchErrorPT = {$: 'rx.catchError', }
type rx_timeoutLimitPT = {$: 'rx.timeoutLimit', 
/** can be dynamic */timeout: dataType, error: dataType}
type rx_throwErrorPT = {$: 'rx.throwError', condition: booleanType, error: dataType}
type rx_debounceTimePT = {$: 'rx.debounceTime', 
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the first event immediately, default is true */immediate: booleanType}
type rx_throttleTimePT = {$: 'rx.throttleTime', 
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the last event arrived at the end of the cooldown, default is true */emitLast: booleanType}
type rx_delayPT = {$: 'rx.delay', 
/** can be dynamic */time: dataType}
type rx_replayPT = {$: 'rx.replay', 
/** empty for unlimited */itemsToKeep: dataType}
type rx_takeUntilPT = {$: 'rx.takeUntil', 
/** can be also promise or any other */notifier: rxType}
type rx_takePT = {$: 'rx.take', count: dataType}
type rx_takeWhilePT = {$: 'rx.takeWhile', whileCondition: booleanType, passtLastEvent: booleanType}
type rx_toArrayPT = {$: 'rx.toArray', }
type rx_lastPT = {$: 'rx.last', }
type rx_skipPT = {$: 'rx.skip', count: dataType}
type rx_subscribePT = {$: 'rx.subscribe', next: actionType, error: actionType, complete: actionType}
type sink_actionPT = {$: 'sink.action', action: actionType}
type sink_dataPT = {$: 'sink.data', data: dataType}
type sink_subjectNextPT = {$: 'sink.subjectNext', subject: dataType}
type source_subjectPT = {$: 'source.subject', subject: dataType}
type source_queuePT = {$: 'source.queue', queue: dataType}
type source_testsResultsPT = {$: 'source.testsResults', tests: dataType, jbm: jbmType}
type userInput_eventToRequestPT = {$: 'userInput.eventToRequest', }
type sink_applyDeltaToCmpPT = {$: 'sink.applyDeltaToCmp', delta: dataType, cmpId: dataType}
type source_eventIncludingPreviewPT = {$: 'source.eventIncludingPreview', event: dataType}
type dialogs_changeEmitterPT = {$: 'dialogs.changeEmitter', widgetId: dataType}
type editableText_addUserEventPT = {$: 'editableText.addUserEvent', }
type sink_BEMethodPT = {$: 'sink.BEMethod', method: dataType, data: dataType, vars: dataType}
type sink_FEMethodPT = {$: 'sink.FEMethod', method: dataType, data: dataType, vars: dataType}
type sink_refreshCmpPT = {$: 'sink.refreshCmp', state: dataType, options: dataType}
type source_frontEndEventPT = {$: 'source.frontEndEvent', event: dataType}
type rx_userEventVarPT = {$: 'rx.userEventVar', }
type source_findSelectionKeySourcePT = {$: 'source.findSelectionKeySource', }
type source_findMenuKeySourcePT = {$: 'source.findMenuKeySource', clientCmp: dataType}
type widget_headlessPT = {$: 'widget.headless', control: controlType, widgetId: dataType}

// type pptr
type pptrType = pptr_runMethodOnPptrPT | pptr_querySelectorPT | pptr_xpathPT | pptr_jsFunctionPT | pptr_jsPropertyPT | pptr_typePT | pptr_gotoInnerFrameBodyPT | pptr_javascriptOnPptrPT | pptr_contentFramePT | ((ctx: ctx) => any)
type cmp_def_pptrType = {
	type: 'pptr',
	params?: [param],
	impl: pptrType,
}
type pptr_runMethodOnPptrPT = {$: 'pptr.runMethodOnPptr', method: dataType, args: dataType}
type pptr_querySelectorPT = {$: 'pptr.querySelector', selector: dataType, 
/** querySelectorAll */multiple: booleanType}
type pptr_xpathPT = {$: 'pptr.xpath', 
/** e.g, //*[contains(text(), 'Hello')] */xpath: dataType}
type pptr_jsFunctionPT = {$: 'pptr.jsFunction', expression: dataType}
type pptr_jsPropertyPT = {$: 'pptr.jsProperty', propName: dataType}
type pptr_typePT = {$: 'pptr.type', text: dataType, enterAtEnd: booleanType, 
/** time between clicks */delay: dataType}
type pptr_gotoInnerFrameBodyPT = {$: 'pptr.gotoInnerFrameBody', }
type pptr_javascriptOnPptrPT = {$: 'pptr.javascriptOnPptr', func: dataType}
type pptr_contentFramePT = {$: 'pptr.contentFrame', }

// type remote
type remoteType = pptr_serverPT | ((ctx: ctx) => any)
type cmp_def_remoteType = {
	type: 'remote',
	params?: [param],
	impl: remoteType,
}
type pptr_serverPT = {$: 'pptr.server', libs: dataType}

// type pptr.selector
type pptr_selectorType = pptr_querySelectorPT | pptr_xpathPT | pptr_jsFunctionPT | pptr_jsPropertyPT | ((ctx: ctx) => any)
type cmp_def_pptr_selectorType = {
	type: 'pptr_selector',
	params?: [param],
	impl: pptr_selectorType,
}
type pptr_querySelectorPT = {$: 'pptr.querySelector', selector: dataType, 
/** querySelectorAll */multiple: booleanType}
type pptr_xpathPT = {$: 'pptr.xpath', 
/** e.g, //*[contains(text(), 'Hello')] */xpath: dataType}
type pptr_jsFunctionPT = {$: 'pptr.jsFunction', expression: dataType}
type pptr_jsPropertyPT = {$: 'pptr.jsProperty', propName: dataType}

// type pptr.action
type pptr_actionType = pptr_repeatingActionPT | ((ctx: ctx) => any)
type cmp_def_pptr_actionType = {
	type: 'pptr_action',
	params?: [param],
	impl: pptr_actionType,
}
type pptr_repeatingActionPT = {$: 'pptr.repeatingAction', action: dataType, intervalTime: dataType}

// type action:0
type action:0Type = remote_updateShadowDataPT | ((ctx: ctx) => any)
type cmp_def_action:0Type = {
	type: 'action:0',
	params?: [param],
	impl: action:0Type,
}
type remote_updateShadowDataPT = {$: 'remote.updateShadowData', entry: dataType}

// type fieldInGroup
type fieldInGroupType = stat_fieldInGroupPT | ((ctx: ctx) => any)
type cmp_def_fieldInGroupType = {
	type: 'fieldInGroup',
	params?: [param],
	impl: fieldInGroupType,
}
type stat_fieldInGroupPT = {$: 'stat.fieldInGroup', 
/** e.g. sum */aggregateFunc: dataType, 
/** e.g, %price% */aggregateValues: dataType, 
/** default is function name */aggregateResultField: dataType}

// type control
type controlType = test_showTestInStudioPT | cardPT | cardFilterPT | cardListPT | controlWithFeaturesPT | d3g_histogramPT | dialog_dialogTopPT | editableTextPT | groupPT | inlineControlsPT | dynamicControlsPT | controlWithConditionPT | controlsPT | itemlistPT | markdownPT | widget_frontEndCtrlPT | remote_widgetPT | sidenavPT | textPT | treePT | vega_interactiveChartPT | ((ctx: ctx) => any)
type cmp_def_controlType = {
	type: 'control',
	params?: [param],
	impl: controlType,
}
type test_showTestInStudioPT = {$: 'test.showTestInStudio', testId: dataType}
type cardPT = {$: 'card', data: dataType, style: card_styleType, adapter: dataType}
type cardFilterPT = {$: 'cardFilter', data: dataType, style: card_filter_styleType}
type cardListPT = {$: 'cardList', data: dataType, style: card_list_styleType, adapter: dataType}
type controlWithFeaturesPT = {$: 'controlWithFeatures', control: controlType, features: [featureType]}
type d3g_histogramPT = {$: 'd3g.histogram', title: dataType, items: dataType, pivot: d3g_pivotType, frame: d3g_frameType, itemTitle: dataType, ticks: dataType, axes: d3g_axesType, style: d3g_histogram_styleType, features: [d3_featureType]}
type dialog_dialogTopPT = {$: 'dialog.dialogTop', style: dialogs_styleType}
type editableTextPT = {$: 'editableText', title: dataType, databind: dataType, updateOnBlur: booleanType, style: editable_text_styleType, features: [featureType]}
type groupPT = {$: 'group', title: dataType, layout: layoutType, style: group_styleType, controls: [controlType], features: [featureType]}
type inlineControlsPT = {$: 'inlineControls', controls: [controlType]}
type dynamicControlsPT = {$: 'dynamicControls', controlItems: dataType, genericControl: controlType, itemVariable: dataType, indexVariable: dataType}
type controlWithConditionPT = {$: 'controlWithCondition', condition: booleanType, control: controlType, title: dataType}
type controlsPT = {$: 'controls', controls: [controlType]}
type itemlistPT = {$: 'itemlist', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, layout: layoutType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}
type markdownPT = {$: 'markdown', markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}
type widget_frontEndCtrlPT = {$: 'widget.frontEndCtrl', widgetId: dataType}
type remote_widgetPT = {$: 'remote.widget', control: controlType, jbm: jbmType}
type sidenavPT = {$: 'sidenav', controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}
type textPT = {$: 'text', text: dataType, title: dataType, style: text_styleType, features: [featureType]}
type treePT = {$: 'tree', title: dataType, nodeModel: tree_node_modelType, style: tree_styleType, features: [featureType]}
type vega_interactiveChartPT = {$: 'vega.interactiveChart', spec: vega_specType, showSpec: booleanType}

// type test
type testType = dataTestPT | uiFrontEndTestPT | uiTest_applyVdomDiffPT | ((ctx: ctx) => any)
type cmp_def_testType = {
	type: 'test',
	params?: [param],
	impl: testType,
}
type dataTestPT = {$: 'dataTest', calculate: dataType, expectedResult: booleanType, runBefore: actionType, timeout: dataType, allowError: booleanType, cleanUp: actionType, expectedCounters: dataType, useResource: dataType}
type uiFrontEndTestPT = {$: 'uiFrontEndTest', control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, allowError: booleanType, cleanUp: actionType, expectedCounters: dataType, renderDOM: booleanType, runInPreview: actionType, runInStudio: actionType}
type uiTest_applyVdomDiffPT = {$: 'uiTest.applyVdomDiff', controlBefore: controlType, control: controlType}

// type user-input
type user_inputType = userInput_clickPT | userInput_setTextPT | userInput_keyboardEventPT | uiAction_scrollByPT | ((ctx: ctx) => any)
type cmp_def_user_inputType = {
	type: 'user_input',
	params?: [param],
	impl: user_inputType,
}
type userInput_clickPT = {$: 'userInput.click', selector: dataType, methodToActivate: dataType}
type userInput_setTextPT = {$: 'userInput.setText', value: dataType, selector: dataType}
type userInput_keyboardEventPT = {$: 'userInput.keyboardEvent', selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}
type uiAction_scrollByPT = {$: 'uiAction.scrollBy', selector: dataType, scrollBy: dataType}

// type ui-action
type ui_actionType = uiAction_setTextPT | uiAction_clickPT | uiAction_keyboardEventPT | ((ctx: ctx) => any)
type cmp_def_ui_actionType = {
	type: 'ui_action',
	params?: [param],
	impl: ui_actionType,
}
type uiAction_setTextPT = {$: 'uiAction.setText', value: dataType, selector: dataType}
type uiAction_clickPT = {$: 'uiAction.click', selector: dataType}
type uiAction_keyboardEventPT = {$: 'uiAction.keyboardEvent', selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}

// type animation
type animationType = animation_keyframesPT | animation_directionPT | animation_durationPT | animation_delayPT | animation_moveToPT | animation_rotatePT | animation_scalePT | animation_skewPT | animation_perspectivePT | animation_easingPT | animation_movementPT | ((ctx: ctx) => any)
type cmp_def_animationType = {
	type: 'animation',
	params?: [param],
	impl: animationType,
}
type animation_keyframesPT = {$: 'animation.keyframes', animation: [animationType]}
type animation_directionPT = {$: 'animation.direction', 
/** alternate goes back to origin */direction: dataType}
type animation_durationPT = {$: 'animation.duration', 
/** time of animation in mSec */duration: animation_valType}
type animation_delayPT = {$: 'animation.delay', 
/** delay before animation */delay: animation_valType, 
/** delay at the end of animation */endDelay: animation_valType}
type animation_moveToPT = {$: 'animation.moveTo', 
/** e.g. 20 , +=10, *=2, list(100,200) */X: animation_valType, Y: animation_valType, Z: animation_valType}
type animation_rotatePT = {$: 'animation.rotate', 
/** degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270) */rotate: animation_valType, rotateX: animation_valType, rotateY: animation_valType, rotateZ: animation_valType}
type animation_scalePT = {$: 'animation.scale', 
/** e.g. 1.5 , *=2, list(2,3) */scale: animation_valType, scaleX: animation_valType, scaleY: animation_valType, scaleZ: animation_valType}
type animation_skewPT = {$: 'animation.skew', 
/** e.g. 20 , +=10, *=2, list(1,2) */skew: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewX: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewY: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewZ: dataType}
type animation_perspectivePT = {$: 'animation.perspective', 
/** e.g. 100 , +=10, *=2, list(10,20) */perspective: animation_valType}
type animation_easingPT = {$: 'animation.easing', easing: animation_easingType}
type animation_movementPT = {$: 'animation.movement', to: positionType, subAnimations: [animationType]}

// type animation.val
type animation_valType = animation_expressionPT | animation_rangePT | animation_staggerPT | ((ctx: ctx) => any)
type cmp_def_animation_valType = {
	type: 'animation_val',
	params?: [param],
	impl: animation_valType,
}
type animation_expressionPT = {$: 'animation.expression', 
/** e.g. 20 , +=10, *=2 */val: dataType}
type animation_rangePT = {$: 'animation.range', 
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType}
type animation_staggerPT = {$: 'animation.stagger', 
/** value range */val: animation_stager_valType, 
/** Starts the stagger effect from a specific position */from: dataType, 
/** e.g. 20 */direction: dataType, easing: animation_easingType, grid: animation_stager_gridType}

// type animation.stager-grid
type animation_stager_gridType = animation_stagerGridPT | ((ctx: ctx) => any)
type cmp_def_animation_stager_gridType = {
	type: 'animation_stager_grid',
	params?: [param],
	impl: animation_stager_gridType,
}
type animation_stagerGridPT = {$: 'animation.stagerGrid', 
/** e.g. 2 */rows: dataType, 
/** e.g. 5 */columns: dataType, 
/** direction of staggering */axis: dataType}

// type animation.stager-val
type animation_stager_valType = animation_stagerIncreasePT | animation_stagerRangePT | ((ctx: ctx) => any)
type cmp_def_animation_stager_valType = {
	type: 'animation_stager_val',
	params?: [param],
	impl: animation_stager_valType,
}
type animation_stagerIncreasePT = {$: 'animation.stagerIncrease', 
/** e.g. 20 */increase: dataType, 
/** optional, e.g. 10 */start: dataType}
type animation_stagerRangePT = {$: 'animation.stagerRange', 
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType}

// type animation.easing
type animation_easingType = animation_inOutEasingPT | animation_elasticEasingPT | animation_springEasingPT | ((ctx: ctx) => any)
type cmp_def_animation_easingType = {
	type: 'animation_easing',
	params?: [param],
	impl: animation_easingType,
}
type animation_inOutEasingPT = {$: 'animation.inOutEasing', method: dataType, inOut: dataType}
type animation_elasticEasingPT = {$: 'animation.elasticEasing', inOut: dataType, 
/** 1-10  Controls the overshoot of the curve */amplitude: dataType, 
/** 0.1-2 Controls how many times the curve goes back and forth */period: dataType}
type animation_springEasingPT = {$: 'animation.springEasing', 
/** 0-100 */mass: dataType, 
/** 0-100 */stiffness: dataType, 
/** 0-100 */damping: dataType, 
/** 0-100 */velocity: dataType}

// type position
type positionType = animation_fixedPosPT | ((ctx: ctx) => any)
type cmp_def_positionType = {
	type: 'position',
	params?: [param],
	impl: positionType,
}
type animation_fixedPosPT = {$: 'animation.fixedPos', top: dataType, left: dataType}

// type feature
type featureType = methodPT | feature_onEventPT | watchAndCalcModelPropPT | calcPropPT | userStatePropPT | calcPropsPT | feature_initValuePT | onDestroyPT | templateModifierPT | frontEnd_varPT | featuresPT | followUp_actionPT | followUp_flowPT | watchRefPT | followUp_watchObservablePT | followUp_onDataChangePT | group_dataPT | htmlAttributePT | idPT | feature_hoverTitlePT | watchablePT | variablePT | calculatedVarPT | feature_ifPT | hiddenPT | group_autoFocusOnFirstInputPT | feature_byConditionPT | feature_userEventPropsPT | feature_serviceRegisteyPT | cssPT | css_classPT | css_widthPT | css_heightPT | css_opacityPT | css_paddingPT | css_marginPT | css_marginAllSidesPT | css_marginVerticalHorizontalPT | css_transformRotatePT | css_colorPT | css_transformScalePT | css_transformTranslatePT | css_boldPT | css_underlinePT | css_boxShadowPT | css_borderPT | css_borderRadiusPT | css_lineClampPT | css_conditionalClassPT | editableBoolean_initTogglePT | editableText_xButtonPT | field_databindPT | field_onChangePT | field_databindTextPT | field_titlePT | field_columnWidthPT | frontEnd_methodPT | frontEnd_requireExternalLibraryPT | frontEnd_enrichUserEventPT | frontEnd_onRefreshPT | frontEnd_initPT | frontEnd_propPT | frontEnd_onDestroyPT | frontEnd_flowPT | feature_onHoverPT | feature_classOnHoverPT | feature_onKeyPT | feature_keyboardShortcutPT | feature_globalKeyboardShortcutPT | feature_onEnterPT | feature_onEscPT | frontEnd_selectionKeySourceServicePT | frontEnd_passSelectionKeySourcePT | group_initGroupPT | group_firstSucceedingPT | group_eliminateRecursionPT | icon_initPT | feature_iconPT | group_itemlistContainerPT | itemlistContainer_filterFieldPT | itemlist_dragHandlePT | itemlist_infiniteScrollPT | itemlist_incrementalFromRxPT | itemlist_selectionPT | itemlist_keyboardSelectionPT | itemlist_noContainerPT | itemlist_initPT | table_enableExpandToEndOfRowPT | feature_expandToEndOfRowPT | menu_initPopupMenuPT | menu_initMenuOptionPT | menu_selectionKeySourceServicePT | menu_passMenuKeySourcePT | picklist_initPT | picklist_onChangePT | picklist_initGroupsPT | slider_initPT | slider_dragPT | codemirror_textEditorKeysPT | codemirror_foldPT | codemirror_lineNumbersPT | codeEditor_cmEnrichUserEventPT | group_cardPT | itemlist_shownOnlyOnItemHoverPT | itemlist_dividerPT | layout_verticalPT | layout_horizontalPT | layout_horizontalFixedSplitPT | layout_horizontalWrappedPT | layout_flexPT | layout_gridPT | flexItem_growPT | flexItem_basisPT | flexItem_alignSelfPT | mdcStyle_initDynamicPT | feature_mdcRippleEffectPT | picklist_plusIconPT | text_bindTextPT | text_allowAsynchValuePT | group_themePT | tableTree_expandFirstLevelPT | tableTree_expandPathPT | tableTree_resizerPT | tableTree_dragAndDropPT | tree_noHeadPT | tree_initTreePT | tree_expandPathPT | tree_selectionPT | tree_keyboardSelectionPT | tree_dragAndDropPT | ((ctx: ctx) => any)
type cmp_def_featureType = {
	type: 'feature',
	params?: [param],
	impl: featureType,
}
type methodPT = {$: 'method', 
/** to be used in html, e.g. onclick="myMethod"  */id: dataType, action: [actionType]}
type feature_onEventPT = {$: 'feature.onEvent', event: dataType, action: [actionType]}
type watchAndCalcModelPropPT = {$: 'watchAndCalcModelProp', prop: dataType, transformValue: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, defaultValue: dataType}
type calcPropPT = {$: 'calcProp', id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType, defaultValue: dataType}
type userStatePropPT = {$: 'userStateProp', id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}
type calcPropsPT = {$: 'calcProps', 
/** props as object */props: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}
type feature_initValuePT = {$: 'feature.initValue', to: dataType, value: dataType, alsoWhenNotEmpty: booleanType}
type onDestroyPT = {$: 'onDestroy', action: actionType}
type templateModifierPT = {$: 'templateModifier', value: dataType}
type frontEnd_varPT = {$: 'frontEnd.var', id: dataType, value: dataType}
type featuresPT = {$: 'features', features: [featureType]}
type followUp_actionPT = {$: 'followUp.action', action: actionType}
type followUp_flowPT = {$: 'followUp.flow', elems: [rxType]}
type watchRefPT = {$: 'watchRef', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType, 
/** delay in activation, can be used to set priority */delay: dataType}
type followUp_watchObservablePT = {$: 'followUp.watchObservable', toWatch: dataType, 
/** in mSec */debounceTime: dataType}
type followUp_onDataChangePT = {$: 'followUp.onDataChange', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}
type group_dataPT = {$: 'group.data', data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: booleanType, 
/** watch childern change as well */includeChildren: dataType}
type htmlAttributePT = {$: 'htmlAttribute', attribute: dataType, value: dataType}
type idPT = {$: 'id', id: dataType}
type feature_hoverTitlePT = {$: 'feature.hoverTitle', title: dataType}
type watchablePT = {$: 'watchable', name: dataType, value: dataType}
type variablePT = {$: 'variable', name: dataType, value: dataType}
type calculatedVarPT = {$: 'calculatedVar', name: dataType, value: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}
type feature_ifPT = {$: 'feature.if', showCondition: booleanType}
type hiddenPT = {$: 'hidden', showCondition: booleanType}
type group_autoFocusOnFirstInputPT = {$: 'group.autoFocusOnFirstInput', }
type feature_byConditionPT = {$: 'feature.byCondition', condition: booleanType, then: featureType, else: featureType}
type feature_userEventPropsPT = {$: 'feature.userEventProps', 
/** comma separated props to take from the original event e.g., altKey,ctrlKey */props: dataType}
type feature_serviceRegisteyPT = {$: 'feature.serviceRegistey', }
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', 
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', 
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_opacityPT = {$: 'css.opacity', 
/** 0-1 */opacity: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', 
/** e.g. 20, 20%, 0.4em */top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', 
/** e.g. 20, 20%, 0.4em, -20 */top: dataType, left: dataType, bottom: dataType, right: dataType, selector: dataType}
type css_marginAllSidesPT = {$: 'css.marginAllSides', 
/** e.g. 20, 20%, 0.4em */value: dataType, selector: dataType}
type css_marginVerticalHorizontalPT = {$: 'css.marginVerticalHorizontal', vertical: dataType, horizontal: dataType, selector: dataType}
type css_transformRotatePT = {$: 'css.transformRotate', 
/** 0-360 */angle: dataType, selector: dataType}
type css_colorPT = {$: 'css.color', color: dataType, background: dataType, selector: dataType}
type css_transformScalePT = {$: 'css.transformScale', 
/** 0-1 */x: dataType, 
/** 0-1 */y: dataType, selector: dataType}
type css_transformTranslatePT = {$: 'css.transformTranslate', 
/** 10px */x: dataType, 
/** 20px */y: dataType, selector: dataType}
type css_boldPT = {$: 'css.bold', }
type css_underlinePT = {$: 'css.underline', }
type css_boxShadowPT = {$: 'css.boxShadow', 
/** the box is raised or content is depressed inside the box */inset: booleanType, 
/** bigger and lighter shadow */blurRadius: dataType, 
/** just bigger shadow */spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, 
/** offset-x */horizontal: dataType, 
/** offset-y */vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type css_borderRadiusPT = {$: 'css.borderRadius', radius: dataType, selector: dataType}
type css_lineClampPT = {$: 'css.lineClamp', 
/** no of lines to clump */lines: dataType, selector: dataType}
type css_conditionalClassPT = {$: 'css.conditionalClass', cssClass: dataType, condition: booleanType}
type editableBoolean_initTogglePT = {$: 'editableBoolean.initToggle', }
type editableText_xButtonPT = {$: 'editableText.xButton', }
type field_databindPT = {$: 'field.databind', debounceTime: dataType, oneWay: booleanType}
type field_onChangePT = {$: 'field.onChange', action: actionType}
type field_databindTextPT = {$: 'field.databindText', debounceTime: dataType, oneWay: booleanType}
type field_titlePT = {$: 'field.title', title: dataType}
type field_columnWidthPT = {$: 'field.columnWidth', width: dataType}
type frontEnd_methodPT = {$: 'frontEnd.method', method: dataType, action: actionType}
type frontEnd_requireExternalLibraryPT = {$: 'frontEnd.requireExternalLibrary', libs: dataType}
type frontEnd_enrichUserEventPT = {$: 'frontEnd.enrichUserEvent', action: actionType}
type frontEnd_onRefreshPT = {$: 'frontEnd.onRefresh', action: actionType}
type frontEnd_initPT = {$: 'frontEnd.init', action: actionType}
type frontEnd_propPT = {$: 'frontEnd.prop', id: dataType, value: dataType}
type frontEnd_onDestroyPT = {$: 'frontEnd.onDestroy', action: actionType}
type frontEnd_flowPT = {$: 'frontEnd.flow', elems: [rxType]}
type feature_onHoverPT = {$: 'feature.onHover', action: actionType, onLeave: actionType}
type feature_classOnHoverPT = {$: 'feature.classOnHover', 
/** css class to add/remove on hover */clz: stringType}
type feature_onKeyPT = {$: 'feature.onKey', 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType}
type feature_keyboardShortcutPT = {$: 'feature.keyboardShortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type feature_globalKeyboardShortcutPT = {$: 'feature.globalKeyboardShortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type feature_onEnterPT = {$: 'feature.onEnter', action: actionType}
type feature_onEscPT = {$: 'feature.onEsc', action: [actionType]}
type frontEnd_selectionKeySourceServicePT = {$: 'frontEnd.selectionKeySourceService', autoFocs: booleanType}
type frontEnd_passSelectionKeySourcePT = {$: 'frontEnd.passSelectionKeySource', }
type group_initGroupPT = {$: 'group.initGroup', }
type group_firstSucceedingPT = {$: 'group.firstSucceeding', }
type group_eliminateRecursionPT = {$: 'group.eliminateRecursion', maxDepth: dataType}
type icon_initPT = {$: 'icon.init', }
type feature_iconPT = {$: 'feature.icon', icon: dataType, title: dataType, position: dataType, type: dataType, size: dataType, style: icon_styleType, features: [featureType]}
type group_itemlistContainerPT = {$: 'group.itemlistContainer', initialSelection: dataType}
type itemlistContainer_filterFieldPT = {$: 'itemlistContainer.filterField', fieldData: dataType, filterType: filter_typeType}
type itemlist_dragHandlePT = {$: 'itemlist.dragHandle', }
type itemlist_infiniteScrollPT = {$: 'itemlist.infiniteScroll', pageSize: dataType}
type itemlist_incrementalFromRxPT = {$: 'itemlist.incrementalFromRx', prepend: booleanType}
type itemlist_selectionPT = {$: 'itemlist.selection', databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, cssForSelected: dataType}
type itemlist_keyboardSelectionPT = {$: 'itemlist.keyboardSelection', autoFocus: booleanType, onEnter: actionType}
type itemlist_noContainerPT = {$: 'itemlist.noContainer', }
type itemlist_initPT = {$: 'itemlist.init', }
type table_enableExpandToEndOfRowPT = {$: 'table.enableExpandToEndOfRow', }
type feature_expandToEndOfRowPT = {$: 'feature.expandToEndOfRow', condition: booleanType}
type menu_initPopupMenuPT = {$: 'menu.initPopupMenu', popupStyle: dialog_styleType}
type menu_initMenuOptionPT = {$: 'menu.initMenuOption', }
type menu_selectionKeySourceServicePT = {$: 'menu.selectionKeySourceService', }
type menu_passMenuKeySourcePT = {$: 'menu.passMenuKeySource', }
type picklist_initPT = {$: 'picklist.init', }
type picklist_onChangePT = {$: 'picklist.onChange', action: actionType}
type picklist_initGroupsPT = {$: 'picklist.initGroups', }
type slider_initPT = {$: 'slider.init', }
type slider_dragPT = {$: 'slider.drag', }
type codemirror_textEditorKeysPT = {$: 'codemirror.textEditorKeys', }
type codemirror_foldPT = {$: 'codemirror.fold', }
type codemirror_lineNumbersPT = {$: 'codemirror.lineNumbers', }
type codeEditor_cmEnrichUserEventPT = {$: 'codeEditor.cmEnrichUserEvent', 
/** used for external buttons */cmSelector: dataType}
type group_cardPT = {$: 'group.card', padding: dataType, width: dataType, outlined: booleanType}
type itemlist_shownOnlyOnItemHoverPT = {$: 'itemlist.shownOnlyOnItemHover', }
type itemlist_dividerPT = {$: 'itemlist.divider', space: dataType}
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', spacing: dataType}
type layout_horizontalFixedSplitPT = {$: 'layout.horizontalFixedSplit', leftWidth: dataType, rightWidth: dataType, spacing: dataType}
type layout_horizontalWrappedPT = {$: 'layout.horizontalWrapped', spacing: dataType}
type layout_flexPT = {$: 'layout.flex', direction: dataType, justifyContent: dataType, alignItems: dataType, wrap: dataType, spacing: dataType}
type layout_gridPT = {$: 'layout.grid', 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}
type flexItem_growPT = {$: 'flexItem.grow', factor: dataType}
type flexItem_basisPT = {$: 'flexItem.basis', factor: dataType}
type flexItem_alignSelfPT = {$: 'flexItem.alignSelf', align: dataType}
type mdcStyle_initDynamicPT = {$: 'mdcStyle.initDynamic', query: dataType}
type feature_mdcRippleEffectPT = {$: 'feature.mdcRippleEffect', }
type picklist_plusIconPT = {$: 'picklist.plusIcon', }
type text_bindTextPT = {$: 'text.bindText', }
type text_allowAsynchValuePT = {$: 'text.allowAsynchValue', propId: dataType, waitingValue: dataType}
type group_themePT = {$: 'group.theme', theme: themeType}
type tableTree_expandFirstLevelPT = {$: 'tableTree.expandFirstLevel', }
type tableTree_expandPathPT = {$: 'tableTree.expandPath', paths: dataType}
type tableTree_resizerPT = {$: 'tableTree.resizer', }
type tableTree_dragAndDropPT = {$: 'tableTree.dragAndDrop', }
type tree_noHeadPT = {$: 'tree.noHead', }
type tree_initTreePT = {$: 'tree.initTree', }
type tree_expandPathPT = {$: 'tree.expandPath', paths: dataType}
type tree_selectionPT = {$: 'tree.selection', databind: dataType, onSelection: actionType, onRightClick: actionType, autoSelectFirst: booleanType}
type tree_keyboardSelectionPT = {$: 'tree.keyboardSelection', onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}
type tree_dragAndDropPT = {$: 'tree.dragAndDrop', }

// type feature:0
type feature:0Type = feature_initPT | ((ctx: ctx) => any)
type cmp_def_feature:0Type = {
	type: 'feature:0',
	params?: [param],
	impl: feature:0Type,
}
type feature_initPT = {$: 'feature.init', action: actionType, 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType}

// type dialog-feature
type dialog_featureType = cssPT | css_classPT | css_widthPT | css_heightPT | css_paddingPT | css_marginPT | css_marginAllSidesPT | css_marginVerticalHorizontalPT | css_boxShadowPT | css_borderPT | css_borderRadiusPT | dialogFeature_modalPT | dialogFeature_uniqueDialogPT | dialogFeature_dragTitlePT | dialogFeature_nearLauncherPositionPT | dialogFeature_onClosePT | dialogFeature_closeWhenClickingOutsidePT | dialogFeature_autoFocusOnFirstInputPT | dialogFeature_cssClassOnLaunchingElementPT | dialogFeature_maxZIndexOnClickPT | dialogFeature_resizerPT | ((ctx: ctx) => any)
type cmp_def_dialog_featureType = {
	type: 'dialog_feature',
	params?: [param],
	impl: dialog_featureType,
}
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', 
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', 
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', 
/** e.g. 20, 20%, 0.4em */top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', 
/** e.g. 20, 20%, 0.4em, -20 */top: dataType, left: dataType, bottom: dataType, right: dataType, selector: dataType}
type css_marginAllSidesPT = {$: 'css.marginAllSides', 
/** e.g. 20, 20%, 0.4em */value: dataType, selector: dataType}
type css_marginVerticalHorizontalPT = {$: 'css.marginVerticalHorizontal', vertical: dataType, horizontal: dataType, selector: dataType}
type css_boxShadowPT = {$: 'css.boxShadow', 
/** the box is raised or content is depressed inside the box */inset: booleanType, 
/** bigger and lighter shadow */blurRadius: dataType, 
/** just bigger shadow */spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, 
/** offset-x */horizontal: dataType, 
/** offset-y */vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type css_borderRadiusPT = {$: 'css.borderRadius', radius: dataType, selector: dataType}
type dialogFeature_modalPT = {$: 'dialogFeature.modal', }
type dialogFeature_uniqueDialogPT = {$: 'dialogFeature.uniqueDialog', id: dataType}
type dialogFeature_dragTitlePT = {$: 'dialogFeature.dragTitle', id: dataType, useSessionStorage: booleanType, selector: dataType}
type dialogFeature_nearLauncherPositionPT = {$: 'dialogFeature.nearLauncherPosition', offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}
type dialogFeature_onClosePT = {$: 'dialogFeature.onClose', action: actionType}
type dialogFeature_closeWhenClickingOutsidePT = {$: 'dialogFeature.closeWhenClickingOutside', }
type dialogFeature_autoFocusOnFirstInputPT = {$: 'dialogFeature.autoFocusOnFirstInput', selectText: booleanType}
type dialogFeature_cssClassOnLaunchingElementPT = {$: 'dialogFeature.cssClassOnLaunchingElement', }
type dialogFeature_maxZIndexOnClickPT = {$: 'dialogFeature.maxZIndexOnClick', minZIndex: dataType}
type dialogFeature_resizerPT = {$: 'dialogFeature.resizer', 
/** effective element with "autoResizeInDialog" class */autoResizeInnerElement: booleanType}

// type d3g.frame
type d3g_frameType = d3g_framePT | ((ctx: ctx) => any)
type cmp_def_d3g_frameType = {
	type: 'd3g_frame',
	params?: [param],
	impl: d3g_frameType,
}
type d3g_framePT = {$: 'd3g.frame', width: dataType, height: dataType, top: dataType, right: dataType, bottom: dataType, left: dataType}

// type d3-feature
type d3_featureType = d3Histogram_initPT | d3g_itemIndicatorPT | ((ctx: ctx) => any)
type cmp_def_d3_featureType = {
	type: 'd3_feature',
	params?: [param],
	impl: d3_featureType,
}
type d3Histogram_initPT = {$: 'd3Histogram.init', }
type d3g_itemIndicatorPT = {$: 'd3g.itemIndicator', item: dataType}

// type d3g.axes
type d3g_axesType = d3g_buttomAndLeftAxesPT | ((ctx: ctx) => any)
type cmp_def_d3g_axesType = {
	type: 'd3g_axes',
	params?: [param],
	impl: d3g_axesType,
}
type d3g_buttomAndLeftAxesPT = {$: 'd3g.buttomAndLeftAxes', }

// type d3g.scale
type d3g_scaleType = d3g_linearScalePT | d3g_sqrtScalePT | d3g_bandScalePT | d3g_ordinalColorsPT | d3g_interpolateColorsPT | ((ctx: ctx) => any)
type cmp_def_d3g_scaleType = {
	type: 'd3g_scale',
	params?: [param],
	impl: d3g_scaleType,
}
type d3g_linearScalePT = {$: 'd3g.linearScale', }
type d3g_sqrtScalePT = {$: 'd3g.sqrtScale', }
type d3g_bandScalePT = {$: 'd3g.bandScale', 
/** range [0,1] */paddingInner: dataType, 
/** range [0,1] */paddingOuter: dataType, 
/** 0 - aligned left, 0.5 - centered, 1 - aligned right */align: dataType}
type d3g_ordinalColorsPT = {$: 'd3g.ordinalColors', scale: dataType}
type d3g_interpolateColorsPT = {$: 'd3g.interpolateColors', scale: dataType}

// type d3g.range
type d3g_rangeType = d3g_autoRangePT | d3g_fromToPT | ((ctx: ctx) => any)
type cmp_def_d3g_rangeType = {
	type: 'd3g_range',
	params?: [param],
	impl: d3g_rangeType,
}
type d3g_autoRangePT = {$: 'd3g.autoRange', }
type d3g_fromToPT = {$: 'd3g.fromTo', from: dataType, to: dataType}

// type d3g.domain
type d3g_domainType = d3g_domainByValuesPT | ((ctx: ctx) => any)
type cmp_def_d3g_domainType = {
	type: 'd3g_domain',
	params?: [param],
	impl: d3g_domainType,
}
type d3g_domainByValuesPT = {$: 'd3g.domainByValues', }

// type control:0
type control:0Type = dialog_buildCompPT | ((ctx: ctx) => any)
type cmp_def_control:0Type = {
	type: 'control:0',
	params?: [param],
	impl: control:0Type,
}
type dialog_buildCompPT = {$: 'dialog.buildComp', dialog: dataType}

// type dialog.style
type dialog_styleType = dialog_defaultPT | dialog_dialogOkCancelPT | dialog_popupPT | dialog_transparentPopupPT | dialog_divPT | dialog_contextMenuPopupPT | ((ctx: ctx) => any)
type cmp_def_dialog_styleType = {
	type: 'dialog_style',
	params?: [param],
	impl: dialog_styleType,
}
type dialog_defaultPT = {$: 'dialog.default', }
type dialog_dialogOkCancelPT = {$: 'dialog.dialogOkCancel', okLabel: dataType, cancelLabel: dataType}
type dialog_popupPT = {$: 'dialog.popup', }
type dialog_transparentPopupPT = {$: 'dialog.transparentPopup', }
type dialog_divPT = {$: 'dialog.div', }
type dialog_contextMenuPopupPT = {$: 'dialog.contextMenuPopup', offsetTop: dataType, rightSide: booleanType, toolbar: booleanType}

// type dialogs.style
type dialogs_styleType = dialogs_defaultStylePT | ((ctx: ctx) => any)
type cmp_def_dialogs_styleType = {
	type: 'dialogs_style',
	params?: [param],
	impl: dialogs_styleType,
}
type dialogs_defaultStylePT = {$: 'dialogs.defaultStyle', }

// type divider.style
type divider_styleType = divider_brPT | divider_verticalPT | divider_flexAutoGrowPT | ((ctx: ctx) => any)
type cmp_def_divider_styleType = {
	type: 'divider_style',
	params?: [param],
	impl: divider_styleType,
}
type divider_brPT = {$: 'divider.br', }
type divider_verticalPT = {$: 'divider.vertical', }
type divider_flexAutoGrowPT = {$: 'divider.flexAutoGrow', }

// type html.style
type html_styleType = html_plainPT | html_inIframePT | ((ctx: ctx) => any)
type cmp_def_html_styleType = {
	type: 'html_style',
	params?: [param],
	impl: html_styleType,
}
type html_plainPT = {$: 'html.plain', }
type html_inIframePT = {$: 'html.inIframe', width: dataType, height: dataType}

// type icon
type iconType = iconPT | ((ctx: ctx) => any)
type cmp_def_iconType = {
	type: 'icon',
	params?: [param],
	impl: iconType,
}
type iconPT = {$: 'icon', icon: dataType, title: dataType, type: dataType, style: icon_styleType, features: [featureType]}

// type icon.style
type icon_styleType = icon_materialPT | ((ctx: ctx) => any)
type cmp_def_icon_styleType = {
	type: 'icon_style',
	params?: [param],
	impl: icon_styleType,
}
type icon_materialPT = {$: 'icon.material', }

// type image.resize
type image_resizeType = image_widthHeightPT | image_coverPT | image_fullyVisiblePT | ((ctx: ctx) => any)
type cmp_def_image_resizeType = {
	type: 'image_resize',
	params?: [param],
	impl: image_resizeType,
}
type image_widthHeightPT = {$: 'image.widthHeight', 
/** e.g: 100, 20% */width: dataType, 
/** e.g: 100, 20% */height: dataType}
type image_coverPT = {$: 'image.cover', }
type image_fullyVisiblePT = {$: 'image.fullyVisible', }

// type image.position
type image_positionType = image_positionPT | ((ctx: ctx) => any)
type cmp_def_image_positionType = {
	type: 'image_position',
	params?: [param],
	impl: image_positionType,
}
type image_positionPT = {$: 'image.position', 
/** e.g. 7, 50%, right */x: dataType, 
/** e.g. 10, 50%, bottom */y: dataType}

// type image.style
type image_styleType = image_backgroundPT | image_imgPT | ((ctx: ctx) => any)
type cmp_def_image_styleType = {
	type: 'image_style',
	params?: [param],
	impl: image_styleType,
}
type image_backgroundPT = {$: 'image.background', }
type image_imgPT = {$: 'image.img', }

// type filter-type
type filter_typeType = filterType_textPT | filterType_exactMatchPT | filterType_numericPT | ((ctx: ctx) => any)
type cmp_def_filter_typeType = {
	type: 'filter_type',
	params?: [param],
	impl: filter_typeType,
}
type filterType_textPT = {$: 'filterType.text', ignoreCase: booleanType}
type filterType_exactMatchPT = {$: 'filterType.exactMatch', }
type filterType_numericPT = {$: 'filterType.numeric', }

// type search-in
type search_inType = search_searchInAllPropertiesPT | search_fusePT | ((ctx: ctx) => any)
type cmp_def_search_inType = {
	type: 'search_in',
	params?: [param],
	impl: search_inType,
}
type search_searchInAllPropertiesPT = {$: 'search.searchInAllProperties', }
type search_fusePT = {$: 'search.fuse', 
/** List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects */keys: dataType, 
/** When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string */findAllMatches: booleanType, isCaseSensitive: booleanType, 
/** Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2) */minMatchCharLength: dataType, 
/** Whether to sort the result list, by score */shouldSort: booleanType, 
/** Determines approximately where in the text is the pattern expected to be found */location: dataType, 
/** At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything */threshold: dataType, 
/** Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch */distance: dataType}

// type rx:0
type rx:0Type = source_dragulaEventPT | ((ctx: ctx) => any)
type cmp_def_rx:0Type = {
	type: 'rx:0',
	params?: [param],
	impl: rx:0Type,
}
type source_dragulaEventPT = {$: 'source.dragulaEvent', event: dataType, 
/** e.g., ['dropElm', 'target', 'source'] */argNames: dataType}

// type data:0
type data:0Type = itemlist_orignialIndexFromSiblingPT | itemlist_indexOfElemPT | itemlist_indexToDataPT | itemlist_findSelectionSourcePT | itemlist_nextSelectedPT | tree_nextSelectedPT | tree_pathOfElemPT | ((ctx: ctx) => any)
type cmp_def_data:0Type = {
	type: 'data:0',
	params?: [param],
	impl: data:0Type,
}
type itemlist_orignialIndexFromSiblingPT = {$: 'itemlist.orignialIndexFromSibling', sibling: dataType}
type itemlist_indexOfElemPT = {$: 'itemlist.indexOfElem', elem: dataType}
type itemlist_indexToDataPT = {$: 'itemlist.indexToData', index: dataType}
type itemlist_findSelectionSourcePT = {$: 'itemlist.findSelectionSource', }
type itemlist_nextSelectedPT = {$: 'itemlist.nextSelected', diff: dataType, elementFilter: dataType}
type tree_nextSelectedPT = {$: 'tree.nextSelected', diff: dataType}
type tree_pathOfElemPT = {$: 'tree.pathOfElem', elem: dataType}

// type group.style
type group_styleType = table_trTdPT | group_htmlTagPT | group_divPT | group_sectionPT | group_ulLiPT | propertySheet_titlesLeftPT | propertySheet_titlesAbovePT | ((ctx: ctx) => any)
type cmp_def_group_styleType = {
	type: 'group_style',
	params?: [param],
	impl: group_styleType,
}
type table_trTdPT = {$: 'table.trTd', }
type group_htmlTagPT = {$: 'group.htmlTag', htmlTag: dataType, groupClass: dataType, itemClass: dataType}
type group_divPT = {$: 'group.div', }
type group_sectionPT = {$: 'group.section', }
type group_ulLiPT = {$: 'group.ulLi', }
type propertySheet_titlesLeftPT = {$: 'propertySheet.titlesLeft', titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}
type propertySheet_titlesAbovePT = {$: 'propertySheet.titlesAbove', titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}

// type editable-text.style
type editable_text_styleType = editableText_markdownPT | editableText_codemirrorPT | editableText_inputPT | editableText_textareaPT | editableText_mdcNoLabelPT | editableText_mdcSearchPT | ((ctx: ctx) => any)
type cmp_def_editable_text_styleType = {
	type: 'editable_text_style',
	params?: [param],
	impl: editable_text_styleType,
}
type editableText_markdownPT = {$: 'editableText.markdown', simplemdeSettings: dataType, debounceTime: dataType}
type editableText_codemirrorPT = {$: 'editableText.codemirror', cm_settings: dataType, enableFullScreen: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}
type editableText_inputPT = {$: 'editableText.input', }
type editableText_textareaPT = {$: 'editableText.textarea', rows: dataType, cols: dataType, oneWay: booleanType}
type editableText_mdcNoLabelPT = {$: 'editableText.mdcNoLabel', width: dataType}
type editableText_mdcSearchPT = {$: 'editableText.mdcSearch', width: dataType}

// type markdown.style
type markdown_styleType = markdown_markPT | ((ctx: ctx) => any)
type cmp_def_markdown_styleType = {
	type: 'markdown_style',
	params?: [param],
	impl: markdown_styleType,
}
type markdown_markPT = {$: 'markdown.mark', }

// type menu-option.style
type menu_option_styleType = menuStyle_optionLinePT | ((ctx: ctx) => any)
type cmp_def_menu_option_styleType = {
	type: 'menu_option_style',
	params?: [param],
	impl: menu_option_styleType,
}
type menuStyle_optionLinePT = {$: 'menuStyle.optionLine', }

// type menu.style
type menu_styleType = menuStyle_popupAsOptionPT | menuStyle_popupThumbPT | menuStyle_toolbarPT | ((ctx: ctx) => any)
type cmp_def_menu_styleType = {
	type: 'menu_style',
	params?: [param],
	impl: menu_styleType,
}
type menuStyle_popupAsOptionPT = {$: 'menuStyle.popupAsOption', }
type menuStyle_popupThumbPT = {$: 'menuStyle.popupThumb', }
type menuStyle_toolbarPT = {$: 'menuStyle.toolbar', leafOptionStyle: menu_option_styleType, itemlistStyle: itemlist_styleType}

// type menu-separator.style
type menu_separator_styleType = menuSeparator_linePT | ((ctx: ctx) => any)
type cmp_def_menu_separator_styleType = {
	type: 'menu_separator_style',
	params?: [param],
	impl: menu_separator_styleType,
}
type menuSeparator_linePT = {$: 'menuSeparator.line', }

// type multiSelect.style
type multiSelect_styleType = multiSelect_choiceListPT | ((ctx: ctx) => any)
type cmp_def_multiSelect_styleType = {
	type: 'multiSelect_style',
	params?: [param],
	impl: multiSelect_styleType,
}
type multiSelect_choiceListPT = {$: 'multiSelect.choiceList', choiceStyle: editable_boolean_styleType, itemlistStyle: itemlist_styleType}

// type nb.elem
type nb_elemType = studio_notebookElemPT | nb_markdownPT | nb_controlPT | ((ctx: ctx) => any)
type cmp_def_nb_elemType = {
	type: 'nb_elem',
	params?: [param],
	impl: nb_elemType,
}
type studio_notebookElemPT = {$: 'studio.notebookElem', result: controlType, editor: controlType}
type nb_markdownPT = {$: 'nb.markdown', markdown: dataType}
type nb_controlPT = {$: 'nb.control', control: controlType}

// type picklist.options
type picklist_optionsType = picklist_optionsByCommaPT | picklist_optionsPT | picklist_sortedOptionsPT | ((ctx: ctx) => any)
type cmp_def_picklist_optionsType = {
	type: 'picklist_options',
	params?: [param],
	impl: picklist_optionsType,
}
type picklist_optionsByCommaPT = {$: 'picklist.optionsByComma', options: dataType, allowEmptyValue: booleanType}
type picklist_optionsPT = {$: 'picklist.options', options: dataType, code: dataType, text: dataType, icon: iconType, allowEmptyValue: booleanType}
type picklist_sortedOptionsPT = {$: 'picklist.sortedOptions', options: picklist_optionsType, 
/** e.g input:80,group:90. 0 mark means hidden. no mark means 50 */marks: dataType}

// type picklist.promote
type picklist_promoteType = picklist_promotePT | ((ctx: ctx) => any)
type cmp_def_picklist_promoteType = {
	type: 'picklist_promote',
	params?: [param],
	impl: picklist_promoteType,
}
type picklist_promotePT = {$: 'picklist.promote', groups: dataType, options: dataType}

// type text.style
type text_styleType = text_codemirrorPT | label_mdcRippleEffectPT | text_htmlTagPT | text_noWrappingTagPT | text_spanPT | text_chipPT | header_mdcHeaderWithIconPT | text_alignToBottomPT | ((ctx: ctx) => any)
type cmp_def_text_styleType = {
	type: 'text_style',
	params?: [param],
	impl: text_styleType,
}
type text_codemirrorPT = {$: 'text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, height: dataType, lineWrapping: booleanType, lineNumbers: booleanType, formatText: booleanType, mode: dataType}
type label_mdcRippleEffectPT = {$: 'label.mdcRippleEffect', }
type text_htmlTagPT = {$: 'text.htmlTag', htmlTag: dataType, cssClass: dataType}
type text_noWrappingTagPT = {$: 'text.noWrappingTag', }
type text_spanPT = {$: 'text.span', }
type text_chipPT = {$: 'text.chip', }
type header_mdcHeaderWithIconPT = {$: 'header.mdcHeaderWithIcon', level: dataType}
type text_alignToBottomPT = {$: 'text.alignToBottom', }

// type editable-boolean.style
type editable_boolean_styleType = editableBoolean_checkboxPT | editableBoolean_checkboxWithLabelPT | editableBoolean_expandCollapseWithUnicodeCharsPT | editableBoolean_expandCollapsePT | editableBoolean_mdcCheckBoxPT | editableBoolean_picklistPT | ((ctx: ctx) => any)
type cmp_def_editable_boolean_styleType = {
	type: 'editable_boolean_style',
	params?: [param],
	impl: editable_boolean_styleType,
}
type editableBoolean_checkboxPT = {$: 'editableBoolean.checkbox', }
type editableBoolean_checkboxWithLabelPT = {$: 'editableBoolean.checkboxWithLabel', }
type editableBoolean_expandCollapseWithUnicodeCharsPT = {$: 'editableBoolean.expandCollapseWithUnicodeChars', toExpandSign: dataType, toCollapseSign: dataType}
type editableBoolean_expandCollapsePT = {$: 'editableBoolean.expandCollapse', }
type editableBoolean_mdcCheckBoxPT = {$: 'editableBoolean.mdcCheckBox', width: dataType}
type editableBoolean_picklistPT = {$: 'editableBoolean.picklist', picklistStyle: picklist_styleType}

// type itemlist.style
type itemlist_styleType = itemlist_ulLiPT | itemlist_divPT | itemlist_horizontalPT | ((ctx: ctx) => any)
type cmp_def_itemlist_styleType = {
	type: 'itemlist_style',
	params?: [param],
	impl: itemlist_styleType,
}
type itemlist_ulLiPT = {$: 'itemlist.ulLi', }
type itemlist_divPT = {$: 'itemlist.div', spacing: dataType}
type itemlist_horizontalPT = {$: 'itemlist.horizontal', spacing: dataType}

// type layout
type layoutType = layout_verticalPT | layout_horizontalPT | layout_horizontalFixedSplitPT | layout_horizontalWrappedPT | layout_flexPT | layout_gridPT | ((ctx: ctx) => any)
type cmp_def_layoutType = {
	type: 'layout',
	params?: [param],
	impl: layoutType,
}
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', spacing: dataType}
type layout_horizontalFixedSplitPT = {$: 'layout.horizontalFixedSplit', leftWidth: dataType, rightWidth: dataType, spacing: dataType}
type layout_horizontalWrappedPT = {$: 'layout.horizontalWrapped', spacing: dataType}
type layout_flexPT = {$: 'layout.flex', direction: dataType, justifyContent: dataType, alignItems: dataType, wrap: dataType, spacing: dataType}
type layout_gridPT = {$: 'layout.grid', 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}

// type picklist.style
type picklist_styleType = picklist_nativePT | picklist_nativePlusPT | picklist_nativeMdLookOpenPT | picklist_radioPT | picklist_mdcRadioPT | picklist_radioVerticalPT | picklist_mdcSelectPT | picklist_labelListPT | picklist_groupsPT | ((ctx: ctx) => any)
type cmp_def_picklist_styleType = {
	type: 'picklist_style',
	params?: [param],
	impl: picklist_styleType,
}
type picklist_nativePT = {$: 'picklist.native', }
type picklist_nativePlusPT = {$: 'picklist.nativePlus', }
type picklist_nativeMdLookOpenPT = {$: 'picklist.nativeMdLookOpen', }
type picklist_radioPT = {$: 'picklist.radio', 
/** e.g. display: none */radioCss: dataType, text: dataType}
type picklist_mdcRadioPT = {$: 'picklist.mdcRadio', text: dataType}
type picklist_radioVerticalPT = {$: 'picklist.radioVertical', }
type picklist_mdcSelectPT = {$: 'picklist.mdcSelect', width: dataType, noLabel: booleanType, noRipple: booleanType}
type picklist_labelListPT = {$: 'picklist.labelList', labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}
type picklist_groupsPT = {$: 'picklist.groups', }

// type text.style:0
type text_style:0Type = text_h2WithClassPT | ((ctx: ctx) => any)
type cmp_def_text_style:0Type = {
	type: 'text_style:0',
	params?: [param],
	impl: text_style:0Type,
}
type text_h2WithClassPT = {$: 'text.h2WithClass', clz: dataType}

// type depricated-control
type depricated_controlType = labelPT | ((ctx: ctx) => any)
type cmp_def_depricated_controlType = {
	type: 'depricated_control',
	params?: [param],
	impl: depricated_controlType,
}
type labelPT = {$: 'label', text: dataType, title: dataType, style: text_styleType, features: [featureType]}

// type theme
type themeType = theme_materialDesignPT | ((ctx: ctx) => any)
type cmp_def_themeType = {
	type: 'theme',
	params?: [param],
	impl: themeType,
}
type theme_materialDesignPT = {$: 'theme.materialDesign', }

// type tree.node-model
type tree_node_modelType = tree_jsonReadOnlyPT | tree_jsonPT | tree_modelFilterPT | ((ctx: ctx) => any)
type cmp_def_tree_node_modelType = {
	type: 'tree_node_model',
	params?: [param],
	impl: tree_node_modelType,
}
type tree_jsonReadOnlyPT = {$: 'tree.jsonReadOnly', object: dataType, rootPath: dataType}
type tree_jsonPT = {$: 'tree.json', object: dataType, rootPath: dataType}
type tree_modelFilterPT = {$: 'tree.modelFilter', model: tree_node_modelType, 
/** input is path. e.g abc */pathFilter: booleanType}

// type table-tree.style
type table_tree_styleType = tableTree_plainPT | ((ctx: ctx) => any)
type cmp_def_table_tree_styleType = {
	type: 'table_tree_style',
	params?: [param],
	impl: table_tree_styleType,
}
type tableTree_plainPT = {$: 'tableTree.plain', hideHeaders: booleanType, gapWidth: dataType, expColWidth: dataType, noItemsCtrl: controlType}

// type tree.style
type tree_styleType = tree_plainPT | tree_expandBoxPT | ((ctx: ctx) => any)
type cmp_def_tree_styleType = {
	type: 'tree_style',
	params?: [param],
	impl: tree_styleType,
}
type tree_plainPT = {$: 'tree.plain', showIcon: booleanType}
type tree_expandBoxPT = {$: 'tree.expandBox', showIcon: booleanType, lineWidth: dataType}

// type vega.spec
type vega_specType = vega_specPT | ((ctx: ctx) => any)
type cmp_def_vega_specType = {
	type: 'vega_spec',
	params?: [param],
	impl: vega_specType,
}
type vega_specPT = {$: 'vega.spec', data: vega_dataType, transform: [vega_transformType], mark: vega_markType, encoding: vega_encodingType, name: dataType, title: dataType, description: dataType}

// type vega.data
type vega_dataType = vega_dataFromUrlPT | vega_jbDataPT | vega_namedDataPT | ((ctx: ctx) => any)
type cmp_def_vega_dataType = {
	type: 'vega_data',
	params?: [param],
	impl: vega_dataType,
}
type vega_dataFromUrlPT = {$: 'vega.dataFromUrl', url: dataType, name: dataType, format: dataType}
type vega_jbDataPT = {$: 'vega.jbData', items: dataType}
type vega_namedDataPT = {$: 'vega.namedData', name: dataType}

// type vega.transform
type vega_transformType = vega_aggregatePT | vega_calculatePT | vega_filterPT | ((ctx: ctx) => any)
type cmp_def_vega_transformType = {
	type: 'vega_transform',
	params?: [param],
	impl: vega_transformType,
}
type vega_aggregatePT = {$: 'vega.aggregate', pipe: [vega_aggPipeElemType], groupby: dataType}
type vega_calculatePT = {$: 'vega.calculate', 
/** e.g: datum.x*2 */expression: dataType, as: dataType}
type vega_filterPT = {$: 'vega.filter', filter: vega_booleanType}

// type vega.aggPipeElem
type vega_aggPipeElemType = vega_aggPipeElemPT | ((ctx: ctx) => any)
type cmp_def_vega_aggPipeElemType = {
	type: 'vega_aggPipeElem',
	params?: [param],
	impl: vega_aggPipeElemType,
}
type vega_aggPipeElemPT = {$: 'vega.aggPipeElem', op: dataType, field: dataType, as: dataType}

// type vega.boolean
type vega_booleanType = vega_filterExpressionPT | vega_inSelectionPT | ((ctx: ctx) => any)
type cmp_def_vega_booleanType = {
	type: 'vega_boolean',
	params?: [param],
	impl: vega_booleanType,
}
type vega_filterExpressionPT = {$: 'vega.filterExpression', 
/** e.g: datum.x>2 */filter: dataType}
type vega_inSelectionPT = {$: 'vega.inSelection', selection: dataType}

// type vega.mark
type vega_markType = vega_linePT | ((ctx: ctx) => any)
type cmp_def_vega_markType = {
	type: 'vega_mark',
	params?: [param],
	impl: vega_markType,
}
type vega_linePT = {$: 'vega.line', showPoints: booleanType, props: [vega_markPropsType]}

// type vega.markProps
type vega_markPropsType = vega_generalMarkPropsPT | vega_positionMarkPropsPT | ((ctx: ctx) => any)
type cmp_def_vega_markPropsType = {
	type: 'vega_markProps',
	params?: [param],
	impl: vega_markPropsType,
}
type vega_generalMarkPropsPT = {$: 'vega.generalMarkProps', aria: dataType, description: dataType, style: dataType, tooltip: dataType}
type vega_positionMarkPropsPT = {$: 'vega.positionMarkProps', x: dataType, x2: dataType, width: dataType, height: dataType, y: dataType, y2: dataType}

// type vega.encoding
type vega_encodingType = vega_positionChannelsPT | ((ctx: ctx) => any)
type cmp_def_vega_encodingType = {
	type: 'vega_encoding',
	params?: [param],
	impl: vega_encodingType,
}
type vega_positionChannelsPT = {$: 'vega.positionChannels', x: vega_channelType, y: vega_channelType, color: vega_channelType}

// type vega.channel
type vega_channelType = vega_channelPT | ((ctx: ctx) => any)
type cmp_def_vega_channelType = {
	type: 'vega_channel',
	params?: [param],
	impl: vega_channelType,
}
type vega_channelPT = {$: 'vega.channel', field: dataType, type: dataType, title: dataType}
type cmpDef = cmp_def_anyType | cmp_def_dataType | cmp_def_aggregatorType | cmp_def_booleanType | cmp_def_actionType | cmp_def_propType | cmp_def_data_switch_caseType | cmp_def_action_switch_caseType | cmp_def_varType | cmp_def_systemType | cmp_def_dispatch_serverType | cmp_def_menu_optionType | cmp_def_jbmType | cmp_def_pptr_crawlerType | cmp_def_pptr_page_crawlerType | cmp_def_rxType | cmp_def_pptrType | cmp_def_remoteType | cmp_def_pptr_selectorType | cmp_def_pptr_actionType | cmp_def_action:0Type | cmp_def_fieldInGroupType | cmp_def_controlType | cmp_def_testType | cmp_def_user_inputType | cmp_def_ui_actionType | cmp_def_animationType | cmp_def_animation_valType | cmp_def_animation_stager_gridType | cmp_def_animation_stager_valType | cmp_def_animation_easingType | cmp_def_positionType | cmp_def_featureType | cmp_def_feature:0Type | cmp_def_dialog_featureType | cmp_def_d3g_frameType | cmp_def_d3_featureType | cmp_def_d3g_axesType | cmp_def_d3g_scaleType | cmp_def_d3g_rangeType | cmp_def_d3g_domainType | cmp_def_control:0Type | cmp_def_dialog_styleType | cmp_def_dialogs_styleType | cmp_def_divider_styleType | cmp_def_html_styleType | cmp_def_iconType | cmp_def_icon_styleType | cmp_def_image_resizeType | cmp_def_image_positionType | cmp_def_image_styleType | cmp_def_filter_typeType | cmp_def_search_inType | cmp_def_rx:0Type | cmp_def_data:0Type | cmp_def_group_styleType | cmp_def_editable_text_styleType | cmp_def_markdown_styleType | cmp_def_menu_option_styleType | cmp_def_menu_styleType | cmp_def_menu_separator_styleType | cmp_def_multiSelect_styleType | cmp_def_nb_elemType | cmp_def_picklist_optionsType | cmp_def_picklist_promoteType | cmp_def_text_styleType | cmp_def_editable_boolean_styleType | cmp_def_itemlist_styleType | cmp_def_layoutType | cmp_def_picklist_styleType | cmp_def_text_style:0Type | cmp_def_depricated_controlType | cmp_def_themeType | cmp_def_tree_node_modelType | cmp_def_table_tree_styleType | cmp_def_tree_styleType | cmp_def_vega_specType | cmp_def_vega_dataType | cmp_def_vega_transformType | cmp_def_vega_aggPipeElemType | cmp_def_vega_booleanType | cmp_def_vega_markType | cmp_def_vega_markPropsType | cmp_def_vega_encodingType | cmp_def_vega_channelType
function call : anyType;
function call(
/** parameter name */param: dataType) : anyType;
function pipeline : dataType;
function pipeline(...
/** click "=" for functions list */items: dataType | [aggregatorType][]) : dataType;
function pipe : dataType;
function pipe(...items: dataType | [aggregatorType][]) : dataType;
function data_if : dataType;
function data_if(profile: { condition: booleanType, then: dataType, else: dataType}) : dataType;
function data_if(condition: booleanType) : dataType;
function action_if : actionType;
function action_if(profile: { condition: booleanType, then: actionType, else: actionType}) : actionType;
function action_if(condition: booleanType) : actionType;
function list : dataType;
function list(...items: [dataType][]) : dataType;
function firstSucceeding : dataType;
function firstSucceeding(...items: [dataType][]) : dataType;
function keys : dataType;
function keys(obj: dataType) : dataType;
function properties : dataType;
function properties(obj: dataType) : dataType;
function entries : dataType;
function entries(obj: dataType) : dataType;
function aggregate : aggregatorType;
function aggregate(aggregator: aggregatorType) : aggregatorType;
function math_max : aggregatorType;
function math_max() : aggregatorType;
function math_min : aggregatorType;
function math_min() : aggregatorType;
function math_sum : aggregatorType;
function math_sum() : aggregatorType;
function math_plus : dataType;
function math_plus(x: dataType, y: dataType) : dataType;
function math_plus(x: dataType) : dataType;
function math_minus : dataType;
function math_minus(x: dataType, y: dataType) : dataType;
function math_minus(x: dataType) : dataType;
function evalExpression : dataType;
function evalExpression(expression: dataType) : dataType;
function prefix : dataType;
function prefix(separator: dataType, text: dataType) : dataType;
function prefix(separator: dataType) : dataType;
function suffix : dataType;
function suffix(separator: dataType, text: dataType) : dataType;
function suffix(separator: dataType) : dataType;
function removePrefix : dataType;
function removePrefix(separator: dataType, text: dataType) : dataType;
function removePrefix(separator: dataType) : dataType;
function removeSuffix : dataType;
function removeSuffix(separator: dataType, text: dataType) : dataType;
function removeSuffix(separator: dataType) : dataType;
function removeSuffixRegex : dataType;
function removeSuffixRegex(
/** regular expression. e.g [0-9]* */suffix: dataType, text: dataType) : dataType;
function removeSuffixRegex(
/** regular expression. e.g [0-9]* */suffix: dataType) : dataType;
function property : dataType;
function property(prop: dataType, obj: dataType) : dataType;
function property(prop: dataType) : dataType;
function indexOf : dataType;
function indexOf(array: dataType, item: dataType) : dataType;
function indexOf(array: dataType) : dataType;
function writeValue : actionType;
function writeValue(profile: { to: dataType, value: dataType, noNotifications: booleanType}) : actionType;
function writeValue(to: dataType) : actionType;
function addToArray : actionType;
function addToArray(array: dataType, toAdd: dataType) : actionType;
function addToArray(array: dataType) : actionType;
function move : actionType;
function move(from: dataType, to: dataType) : actionType;
function move(from: dataType) : actionType;
function splice : actionType;
function splice(profile: { array: dataType, fromIndex: dataType, noOfItemsToRemove: dataType, itemsToAdd: dataType}) : actionType;
function splice(array: dataType) : actionType;
function removeFromArray : actionType;
function removeFromArray(profile: { array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}) : actionType;
function removeFromArray(array: dataType) : actionType;
function mutable_toggleBooleanValue : actionType;
function mutable_toggleBooleanValue(of: dataType) : actionType;
function slice : aggregatorType;
function slice(
/** 0-based index */start: dataType, 
/** 0-based index of where to end the selection (not including itself) */end: dataType) : aggregatorType;
function slice(
/** 0-based index */start: dataType) : aggregatorType;
function sort : aggregatorType;
function sort(profile: { 
/** sort by property inside object */propertyName: dataType, lexical: booleanType, ascending: booleanType}) : aggregatorType;
function sort(
/** sort by property inside object */propertyName: dataType) : aggregatorType;
function first : aggregatorType;
function first(items: dataType) : aggregatorType;
function last : aggregatorType;
function last(items: dataType) : aggregatorType;
function count : aggregatorType;
function count(items: dataType) : aggregatorType;
function reverse : aggregatorType;
function reverse(items: dataType) : aggregatorType;
function sample : aggregatorType;
function sample(size: dataType, items: dataType) : aggregatorType;
function sample(size: dataType) : aggregatorType;
function obj : dataType;
function obj(...props: [propType][]) : dataType;
function extend : dataType;
function extend(...props: [propType][]) : dataType;
function assign : dataType;
function assign(...props: [propType][]) : dataType;
function extendWithIndex : aggregatorType;
function extendWithIndex(...props: [propType][]) : aggregatorType;
function prop : propType;
function prop(profile: { title: dataType, val: dataType, type: dataType}) : propType;
function prop(title: dataType) : propType;
function refProp : propType;
function refProp(title: dataType, val: dataType) : propType;
function refProp(title: dataType) : propType;
function pipeline_var : aggregatorType;
function pipeline_var(name: dataType, val: dataType) : aggregatorType;
function pipeline_var(name: dataType) : aggregatorType;
function If : dataType;
function If(profile: { condition: booleanType, then: dataType, Else: dataType}) : dataType;
function If(condition: booleanType) : dataType;
function not : booleanType;
function not(of: booleanType) : booleanType;
function and : booleanType;
function and(...items: [booleanType][]) : booleanType;
function or : booleanType;
function or(...items: [booleanType][]) : booleanType;
function between : booleanType;
function between(profile: { from: dataType, to: dataType, val: dataType}) : booleanType;
function between(from: dataType) : booleanType;
function contains : booleanType;
function contains(profile: { text: [dataType], allText: dataType, inOrder: booleanType}) : booleanType;
function notContains : booleanType;
function notContains(text: [dataType], allText: dataType) : booleanType;
function startsWith : booleanType;
function startsWith(startsWith: dataType, text: dataType) : booleanType;
function startsWith(startsWith: dataType) : booleanType;
function endsWith : booleanType;
function endsWith(endsWith: dataType, text: dataType) : booleanType;
function endsWith(endsWith: dataType) : booleanType;
function filter : aggregatorType;
function filter(filter: booleanType) : aggregatorType;
function matchRegex : booleanType;
function matchRegex(
/** e.g: [a-zA-Z]* */regex: dataType, text: dataType) : booleanType;
function matchRegex(
/** e.g: [a-zA-Z]* */regex: dataType) : booleanType;
function toUpperCase : dataType;
function toUpperCase(text: dataType) : dataType;
function toLowerCase : dataType;
function toLowerCase(text: dataType) : dataType;
function capitalize : dataType;
function capitalize(text: dataType) : dataType;
function join : aggregatorType;
function join(profile: { separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemText: dataType}) : aggregatorType;
function join(separator: dataType) : aggregatorType;
function unique : aggregatorType;
function unique(id: dataType, items: dataType) : aggregatorType;
function unique(id: dataType) : aggregatorType;
function log : dataType;
function log(logName: dataType, logObj: dataType) : dataType;
function log(logName: dataType) : dataType;
function asIs : dataType;
function asIs($asIs: dataType) : dataType;
function object : dataType;
function object() : dataType;
function json_stringify : dataType;
function json_stringify(value: dataType, 
/** use space or tab to make pretty output */space: dataType) : dataType;
function json_stringify(value: dataType) : dataType;
function json_parse : dataType;
function json_parse(text: dataType) : dataType;
function split : dataType;
function split(profile: { 
/** E.g., "," or "<a>" */separator: dataType, text: dataType, part: dataType}) : dataType;
function split(
/** E.g., "," or "<a>" */separator: dataType) : dataType;
function replace : dataType;
function replace(profile: { find: dataType, replace: dataType, text: dataType, useRegex: booleanType, 
/** g,i,m */regexFlags: dataType}) : dataType;
function replace(find: dataType) : dataType;
function isNull : booleanType;
function isNull(obj: dataType) : booleanType;
function notNull : booleanType;
function notNull(obj: dataType) : booleanType;
function isEmpty : booleanType;
function isEmpty(item: dataType) : booleanType;
function notEmpty : booleanType;
function notEmpty(item: dataType) : booleanType;
function equals : booleanType;
function equals(item1: dataType, item2: dataType) : booleanType;
function equals(item1: dataType) : booleanType;
function notEquals : booleanType;
function notEquals(item1: dataType, item2: dataType) : booleanType;
function notEquals(item1: dataType) : booleanType;
function runActions : actionType;
function runActions(...actions: [actionType][]) : actionType;
function runActionOnItem : actionType;
function runActionOnItem(item: dataType, action: actionType) : actionType;
function runActionOnItem(item: dataType) : actionType;
function runActionOnItems : actionType;
function runActionOnItems(profile: { items: dataType, action: actionType, indexVariable: dataType}) : actionType;
function runActionOnItems(items: dataType) : actionType;
function delay : actionType | dataType;
function delay(mSec: dataType) : actionType | dataType;
function onNextTimer : actionType;
function onNextTimer(action: actionType, delay: numberType) : actionType;
function onNextTimer(action: actionType) : actionType;
function extractPrefix : dataType;
function extractPrefix(profile: { 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}) : dataType;
function extractPrefix(
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType) : dataType;
function extractSuffix : dataType;
function extractSuffix(profile: { 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}) : dataType;
function extractSuffix(
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType) : dataType;
function range : dataType;
function range(from: dataType, to: dataType) : dataType;
function range(from: dataType) : dataType;
function typeOf : dataType;
function typeOf(obj: dataType) : dataType;
function className : dataType;
function className(obj: dataType) : dataType;
function isOfType : booleanType;
function isOfType(
/** e.g., string,boolean,array */type: dataType, obj: dataType) : booleanType;
function isOfType(
/** e.g., string,boolean,array */type: dataType) : booleanType;
function inGroup : booleanType;
function inGroup(group: dataType, item: dataType) : booleanType;
function inGroup(group: dataType) : booleanType;
function isRef : dataType;
function isRef(obj: dataType) : dataType;
function asRef : dataType;
function asRef(obj: dataType) : dataType;
function data_switch : dataType;
function data_switch(cases: [data_switch_caseType], default: dataType) : dataType;
function data_case : data_switch_caseType;
function data_case(condition: booleanType, value: dataType) : data_switch_caseType;
function data_case(condition: booleanType) : data_switch_caseType;
function action_switch : actionType;
function action_switch(cases: [action_switch_caseType], defaultAction: actionType) : actionType;
function action_switchCase : action_switch_caseType;
function action_switchCase(condition: booleanType, action: actionType) : action_switch_caseType;
function action_switchCase(condition: booleanType) : action_switch_caseType;
function formatDate : dataType;
function formatDate(profile: { 
/** Date value */date: dataType, dateStyle: dataType, timeStyle: dataType, weekday: dataType, year: dataType, month: dataType, day: dataType, hour: dataType, minute: dataType, second: dataType, timeZoneName: dataType}) : dataType;
function formatDate(
/** Date value */date: dataType) : dataType;
function getSessionStorage : dataType;
function getSessionStorage(id: dataType) : dataType;
function action_setSessionStorage : dataType;
function action_setSessionStorage(id: dataType, value: dataType) : dataType;
function action_setSessionStorage(id: dataType) : dataType;
function waitFor : dataType;
function waitFor(profile: { check: dataType, interval: dataType, timeout: dataType}) : dataType;
function waitFor(check: dataType) : dataType;
function addComponent : actionType;
function addComponent(profile: { id: dataType, value: dataType, type: dataType}) : actionType;
function addComponent(id: dataType) : actionType;
function loadLibs : actionType;
function loadLibs(libs: dataType) : actionType;
function loadAppFiles : actionType;
function loadAppFiles(jsFiles: dataType) : actionType;
function Var : varType | systemType;
function Var(name: dataType, val: dataType) : varType | systemType;
function Var(name: dataType) : varType | systemType;
function remark : systemType;
function remark(remark: dataType) : systemType;
function codeLoader_getCode : dataType;
function codeLoader_getCode() : dataType;
function codeLoader_getCodeFromRemote : dataType;
function codeLoader_getCodeFromRemote(ids: dataType) : dataType;
function codeLoader_setCodeLoaderJbm : dataType;
function codeLoader_setCodeLoaderJbm(codeLoaderUri: dataType) : dataType;
function dispatch_singleJbm : dispatch_serverType;
function dispatch_singleJbm(jbm: jbmType, capabilities: [dispatch_capabilitiesType]) : dispatch_serverType;
function dispatch_singleJbm(jbm: jbmType) : dispatch_serverType;
function codeEditor_setSelectedPT : menu_optionType;
function codeEditor_setSelectedPT(profile: { path: dataType, semanticPart: dataType, compName: dataType}) : menu_optionType;
function codeEditor_setSelectedPT(path: dataType) : menu_optionType;
function watchableAsText : dataType;
function watchableAsText(ref: dataType, oneWay: booleanType) : dataType;
function watchableAsText(ref: dataType) : dataType;
function codeEditor_withCursorPath : actionType;
function codeEditor_withCursorPath(action: actionType, selector: dataType) : actionType;
function codeEditor_withCursorPath(action: actionType) : actionType;
function codeEditor_isDirty : dataType;
function codeEditor_isDirty() : dataType;
function watchableComps_changedComps : dataType;
function watchableComps_changedComps() : dataType;
function watchableComps_undo : actionType;
function watchableComps_undo() : actionType;
function watchableComps_cleanSelectionPreview : actionType;
function watchableComps_cleanSelectionPreview() : actionType;
function watchableComps_revert : actionType;
function watchableComps_revert(toIndex: dataType) : actionType;
function watchableComps_redo : actionType;
function watchableComps_redo() : actionType;
function watchableComps_scriptHistoryItems : dataType;
function watchableComps_scriptHistoryItems() : dataType;
function jbm_byUri : jbmType;
function jbm_byUri(uri: dataType) : jbmType;
function jbm_self : jbmType;
function jbm_self() : jbmType;
function jbm_terminateChild : actionType;
function jbm_terminateChild(id: dataType) : actionType;
function http_get : dataType | actionType;
function http_get(profile: { url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType;
function http_get(url: dataType) : dataType | actionType;
function http_fetch : dataType | actionType;
function http_fetch(profile: { url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType;
function http_fetch(url: dataType) : dataType | actionType;
function jbm_nodeContainer : jbmType;
function jbm_nodeContainer(profile: { modules: dataType, host: dataType, init: actionType}) : jbmType;
function jbm_nodeContainer(modules: dataType) : jbmType;
function extractText : dataType;
function extractText(profile: { text: dataType, startMarkers: [dataType], endMarker: dataType, 
/** include the marker at part of the result */includingStartMarker: booleanType, 
/** include the marker at part of the result */includingEndMarker: booleanType, 
/** apply the markers repeatingly */repeating: booleanType, noTrim: booleanType, 
/** use regular expression in markers */useRegex: booleanType, 
/** return the inverse result. E.g. exclude remarks */exclude: booleanType}) : dataType;
function extractText(text: dataType) : dataType;
function breakText : dataType;
function breakText(profile: { text: dataType, 
/** multi level separators */separators: dataType, 
/** use regular expression in separators */useRegex: booleanType}) : dataType;
function breakText(text: dataType) : dataType;
function zipArrays : dataType;
function zipArrays(
/** array of arrays */value: dataType) : dataType;
function removeSections : dataType;
function removeSections(profile: { text: dataType, startMarker: dataType, endMarker: dataType, keepEndMarker: booleanType}) : dataType;
function removeSections(text: dataType) : dataType;
function merge : dataType;
function merge(objects: dataType) : dataType;
function dynamicObject : dataType;
function dynamicObject(profile: { items: dataType, propertyName: dataType, value: dataType}) : dataType;
function dynamicObject(items: dataType) : dataType;
function filterEmptyProperties : dataType;
function filterEmptyProperties(obj: dataType) : dataType;
function trim : dataType;
function trim(text: dataType) : dataType;
function splitToLines : dataType;
function splitToLines(text: dataType) : dataType;
function newLine : dataType;
function newLine() : dataType;
function removePrefixRegex : dataType;
function removePrefixRegex(prefix: dataType, text: dataType) : dataType;
function removePrefixRegex(prefix: dataType) : dataType;
function wrapAsObject : aggregatorType;
function wrapAsObject(profile: { propertyName: dataType, value: dataType, items: dataType}) : aggregatorType;
function wrapAsObject(propertyName: dataType) : aggregatorType;
function prettyPrint : dataType;
function prettyPrint(profile: dataType, forceFlat: booleanType) : dataType;
function prettyPrint(profile: dataType) : dataType;
function pptr_crawler : pptr_crawlerType;
function pptr_crawler(profile: { rootUrl: dataType, pageCrawlers: [pptr_page_crawlerType], resultData: dataType, 
/** watchable data to get get events about data changes */resultIndex: dataType, 
/** {url, vars?, nextPptrPageType? } */requestQueue: dataType}) : pptr_crawlerType;
function pptr_crawler(rootUrl: dataType) : pptr_crawlerType;
function pptr_pageCrawler : pptr_page_crawlerType;
function pptr_pageCrawler(profile: { url: dataType, features: [pptr_featureType], extract: pptr_extractType, 
/** single or array, better to have id */transformToResultItems: dataType, 
/** optional props: varsForFollowing, nextPptrPageType */transformToUrlRequests: dataType}) : pptr_page_crawlerType;
function pptr_pageCrawler(url: dataType) : pptr_page_crawlerType;
function pptr_runMethodOnPptr : rxType | pptrType;
function pptr_runMethodOnPptr(method: dataType, args: dataType) : rxType | pptrType;
function pptr_runMethodOnPptr(method: dataType) : rxType | pptrType;
function pptr_server : remoteType;
function pptr_server(libs: dataType) : remoteType;
function pptr_refreshServerCode : actionType;
function pptr_refreshServerCode(remote: remoteType) : actionType;
function pptr_querySelector : rxType | pptrType | pptr_selectorType;
function pptr_querySelector(selector: dataType, 
/** querySelectorAll */multiple: booleanType) : rxType | pptrType | pptr_selectorType;
function pptr_querySelector(selector: dataType) : rxType | pptrType | pptr_selectorType;
function pptr_xpath : rxType | pptrType | pptr_selectorType;
function pptr_xpath(
/** e.g, //*[contains(text(), 'Hello')] */xpath: dataType) : rxType | pptrType | pptr_selectorType;
function pptr_jsFunction : rxType | pptrType | pptr_selectorType;
function pptr_jsFunction(expression: dataType) : rxType | pptrType | pptr_selectorType;
function pptr_jsProperty : rxType | pptrType | pptr_selectorType;
function pptr_jsProperty(propName: dataType) : rxType | pptrType | pptr_selectorType;
function pptr_type : rxType | pptrType;
function pptr_type(profile: { text: dataType, enterAtEnd: booleanType, 
/** time between clicks */delay: dataType}) : rxType | pptrType;
function pptr_type(text: dataType) : rxType | pptrType;
function pptr_closeBrowser : actionType;
function pptr_closeBrowser() : actionType;
function pptr_repeatingAction : pptr_actionType;
function pptr_repeatingAction(action: dataType, intervalTime: dataType) : pptr_actionType;
function pptr_repeatingAction(action: dataType) : pptr_actionType;
function pptr_gotoInnerFrameBody : rxType | pptrType;
function pptr_gotoInnerFrameBody() : rxType | pptrType;
function pptr_javascriptOnPptr : rxType | pptrType;
function pptr_javascriptOnPptr(func: dataType) : rxType | pptrType;
function pptr_contentFrame : rxType | pptrType;
function pptr_contentFrame() : rxType | pptrType;
function source_remote : rxType;
function source_remote(rx: rxType, jbm: jbmType) : rxType;
function source_remote(rx: rxType) : rxType;
function remote_operator : rxType;
function remote_operator(rx: rxType, jbm: jbmType) : rxType;
function remote_operator(rx: rxType) : rxType;
function remote_action : actionType;
function remote_action(profile: { action: dataType, jbm: jbmType, 
/** do not wait for the respone */oneway: booleanType, timeout: dataType}) : actionType;
function remote_action(action: dataType) : actionType;
function remote_data : dataType;
function remote_data(profile: { data: dataType, jbm: jbmType, timeout: dataType}) : dataType;
function remote_data(data: dataType) : dataType;
function remote_updateShadowData : action:0Type;
function remote_updateShadowData(entry: dataType) : action:0Type;
function remote_copyPassiveData : actionType;
function remote_copyPassiveData(jbm: jbmType) : actionType;
function net_getRootParentUri : dataType;
function net_getRootParentUri() : dataType;
function net_listAll : dataType;
function net_listAll() : dataType;
function dataResource_yellowPages : dataType;
function dataResource_yellowPages() : dataType;
function remote_useYellowPages : actionType;
function remote_useYellowPages() : actionType;
function source_data : rxType;
function source_data(data: dataType) : rxType;
function source_watchableData : rxType;
function source_watchableData(ref: dataType, 
/** watch childern change as well */includeChildren: dataType) : rxType;
function source_watchableData(ref: dataType) : rxType;
function source_callbag : rxType;
function source_callbag(
/** callbag source function */callbag: dataType) : rxType;
function source_event : rxType;
function source_event(profile: { event: dataType, 
/** html element */elem: dataType, 
/** addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */options: dataType}) : rxType;
function source_event(event: dataType) : rxType;
function source_any : rxType;
function source_any(
/** the source is detected by its type: promise, iterable, single, callbag element, etc.. */source: dataType) : rxType;
function source_promise : rxType;
function source_promise(promise: dataType) : rxType;
function source_interval : rxType;
function source_interval(
/** time in mSec */interval: dataType) : rxType;
function rx_pipe : rxType | dataType | actionType;
function rx_pipe(...elems: [rxType][]) : rxType | dataType | actionType;
function rx_merge : rxType;
function rx_merge(...sources: [rxType][]) : rxType;
function rx_innerPipe : rxType;
function rx_innerPipe(...elems: [rxType][]) : rxType;
function rx_fork : rxType;
function rx_fork(...elems: [rxType][]) : rxType;
function rx_startWith : rxType;
function rx_startWith(...sources: [rxType][]) : rxType;
function rx_var : rxType;
function rx_var(
/** if empty, does nothing */name: dataType, value: dataType) : rxType;
function rx_var(
/** if empty, does nothing */name: dataType) : rxType;
function rx_resource : rxType;
function rx_resource(
/** if empty, does nothing */name: dataType, value: dataType) : rxType;
function rx_resource(
/** if empty, does nothing */name: dataType) : rxType;
function rx_reduce : rxType;
function rx_reduce(profile: { 
/** the result is accumulated in this var */varName: dataType, 
/** receives first value as input */initialValue: dataType, 
/** the accumulated value use %$acc%,%% %$prev% */value: dataType, 
/** used for join with separators, initialValue uses the first value without adding the separtor */avoidFirst: booleanType}) : rxType;
function rx_reduce(
/** the result is accumulated in this var */varName: dataType) : rxType;
function rx_count : dataType;
function rx_count(varName: dataType) : dataType;
function rx_join : dataType;
function rx_join(varName: dataType, separator: dataType) : dataType;
function rx_join(varName: dataType) : dataType;
function rx_max : dataType;
function rx_max(varName: dataType, value: dataType) : dataType;
function rx_max(varName: dataType) : dataType;
function rx_do : rxType;
function rx_do(action: actionType) : rxType;
function rx_doPromise : rxType;
function rx_doPromise(action: actionType) : rxType;
function rx_map : rxType;
function rx_map(func: dataType) : rxType;
function rx_mapPromise : rxType;
function rx_mapPromise(func: dataType) : rxType;
function rx_filter : rxType;
function rx_filter(filter: booleanType) : rxType;
function rx_flatMap : rxType;
function rx_flatMap(
/** map each input to source callbag */source: rxType) : rxType;
function rx_flatMapArrays : rxType;
function rx_flatMapArrays(
/** should return array, items will be passed one by one */func: dataType) : rxType;
function rx_concatMap : rxType;
function rx_concatMap(
/** keeps the order of the results, can return array, promise or callbag */func: dataType, 
/** combines %$input% with the inner result %% */combineResultWithInput: dataType) : rxType;
function rx_concatMap(
/** keeps the order of the results, can return array, promise or callbag */func: dataType) : rxType;
function rx_distinctUntilChanged : rxType;
function rx_distinctUntilChanged(
/** e.g. %% == %$prev% */equalsFunc: dataType) : rxType;
function rx_catchError : rxType;
function rx_catchError() : rxType;
function rx_timeoutLimit : rxType;
function rx_timeoutLimit(
/** can be dynamic */timeout: dataType, error: dataType) : rxType;
function rx_timeoutLimit(
/** can be dynamic */timeout: dataType) : rxType;
function rx_throwError : rxType;
function rx_throwError(condition: booleanType, error: dataType) : rxType;
function rx_throwError(condition: booleanType) : rxType;
function rx_debounceTime : rxType;
function rx_debounceTime(
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the first event immediately, default is true */immediate: booleanType) : rxType;
function rx_debounceTime(
/** can be dynamic */cooldownPeriod: dataType) : rxType;
function rx_throttleTime : rxType;
function rx_throttleTime(
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the last event arrived at the end of the cooldown, default is true */emitLast: booleanType) : rxType;
function rx_throttleTime(
/** can be dynamic */cooldownPeriod: dataType) : rxType;
function rx_delay : rxType;
function rx_delay(
/** can be dynamic */time: dataType) : rxType;
function rx_replay : rxType;
function rx_replay(
/** empty for unlimited */itemsToKeep: dataType) : rxType;
function rx_takeUntil : rxType;
function rx_takeUntil(
/** can be also promise or any other */notifier: rxType) : rxType;
function rx_take : rxType;
function rx_take(count: dataType) : rxType;
function rx_takeWhile : rxType;
function rx_takeWhile(whileCondition: booleanType, passtLastEvent: booleanType) : rxType;
function rx_takeWhile(whileCondition: booleanType) : rxType;
function rx_toArray : rxType;
function rx_toArray() : rxType;
function rx_last : rxType;
function rx_last() : rxType;
function rx_skip : rxType;
function rx_skip(count: dataType) : rxType;
function rx_subscribe : rxType;
function rx_subscribe(profile: { next: actionType, error: actionType, complete: actionType}) : rxType;
function rx_subscribe(next: actionType) : rxType;
function sink_action : rxType;
function sink_action(action: actionType) : rxType;
function sink_data : rxType;
function sink_data(data: dataType) : rxType;
function rx_log : dataType;
function rx_log(name: dataType, extra: dataType) : dataType;
function rx_log(name: dataType) : dataType;
function rx_clog : dataType;
function rx_clog(name: dataType) : dataType;
function rx_sniffer : dataType;
function rx_sniffer(name: dataType) : dataType;
function rx_subject : dataType;
function rx_subject(
/** keep pushed items for late subscription */replay: booleanType, 
/** relevant for replay, empty for unlimited */itemsToKeep: dataType) : dataType;
function rx_subject(
/** keep pushed items for late subscription */replay: booleanType) : dataType;
function sink_subjectNext : rxType;
function sink_subjectNext(subject: dataType) : rxType;
function source_subject : rxType;
function source_subject(subject: dataType) : rxType;
function action_subjectNext : actionType;
function action_subjectNext(subject: dataType, data: dataType) : actionType;
function action_subjectNext(subject: dataType) : actionType;
function action_subjectComplete : actionType;
function action_subjectComplete(subject: dataType) : actionType;
function action_subjectError : actionType;
function action_subjectError(subject: dataType, error: dataType) : actionType;
function action_subjectError(subject: dataType) : actionType;
function rx_queue : dataType;
function rx_queue(items: dataType) : dataType;
function source_queue : rxType;
function source_queue(queue: dataType) : rxType;
function action_addToQueue : actionType;
function action_addToQueue(queue: dataType, item: dataType) : actionType;
function action_addToQueue(queue: dataType) : actionType;
function action_removeFromQueue : actionType;
function action_removeFromQueue(queue: dataType, item: dataType) : actionType;
function action_removeFromQueue(queue: dataType) : actionType;
function stat_groupBy : aggregatorType;
function stat_groupBy(by: dataType, calculate: [fieldInGroupType]) : aggregatorType;
function stat_groupBy(by: dataType) : aggregatorType;
function stat_fieldInGroup : fieldInGroupType;
function stat_fieldInGroup(profile: { 
/** e.g. sum */aggregateFunc: dataType, 
/** e.g, %price% */aggregateValues: dataType, 
/** default is function name */aggregateResultField: dataType}) : fieldInGroupType;
function stat_fieldInGroup(
/** e.g. sum */aggregateFunc: dataType) : fieldInGroupType;
function runTransaction : actionType;
function runTransaction(profile: { actions: [actionType], noNotifications: booleanType, handler: dataType}) : actionType;
function test_showTestInStudio : controlType;
function test_showTestInStudio(testId: dataType) : controlType;
function dataTest : testType;
function dataTest(profile: { calculate: dataType, expectedResult: booleanType, runBefore: actionType, timeout: dataType, allowError: booleanType, cleanUp: actionType, expectedCounters: dataType, useResource: dataType}) : testType;
function dataTest(calculate: dataType) : testType;
function uiFrontEndTest : testType;
function uiFrontEndTest(profile: { control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, allowError: booleanType, cleanUp: actionType, expectedCounters: dataType, renderDOM: booleanType, runInPreview: actionType, runInStudio: actionType}) : testType;
function uiFrontEndTest(control: controlType) : testType;
function uiTest_vdomResultAsHtml : dataType;
function uiTest_vdomResultAsHtml() : dataType;
function uiTest_applyVdomDiff : testType;
function uiTest_applyVdomDiff(controlBefore: controlType, control: controlType) : testType;
function uiTest_applyVdomDiff(controlBefore: controlType) : testType;
function source_testsResults : rxType;
function source_testsResults(tests: dataType, jbm: jbmType) : rxType;
function source_testsResults(tests: dataType) : rxType;
function tests_runner : actionType;
function tests_runner(profile: { tests: dataType, jbm: jbmType, rootElemId: dataType}) : actionType;
function tests_runner(tests: dataType) : actionType;
function userInput_eventToRequest : rxType;
function userInput_eventToRequest() : rxType;
function userInput_click : user_inputType;
function userInput_click(selector: dataType, methodToActivate: dataType) : user_inputType;
function userInput_click(selector: dataType) : user_inputType;
function userInput_setText : user_inputType;
function userInput_setText(value: dataType, selector: dataType) : user_inputType;
function userInput_setText(value: dataType) : user_inputType;
function userInput_keyboardEvent : user_inputType;
function userInput_keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : user_inputType;
function userInput_keyboardEvent(selector: dataType) : user_inputType;
function uiAction_waitForSelector : actionType;
function uiAction_waitForSelector(selector: dataType) : actionType;
function uiAction_waitForCompReady : actionType;
function uiAction_waitForCompReady(selector: dataType) : actionType;
function uiAction_scrollBy : user_inputType;
function uiAction_scrollBy(selector: dataType, scrollBy: dataType) : user_inputType;
function uiAction_scrollBy(selector: dataType) : user_inputType;
function uiAction_setText : ui_actionType;
function uiAction_setText(value: dataType, selector: dataType) : ui_actionType;
function uiAction_setText(value: dataType) : ui_actionType;
function uiAction_click : ui_actionType;
function uiAction_click(selector: dataType) : ui_actionType;
function uiAction_keyboardEvent : ui_actionType;
function uiAction_keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType;
function uiAction_keyboardEvent(selector: dataType) : ui_actionType;
function animation_start : actionType;
function animation_start(profile: { animation: [animationType], 
/** query selector or elements, default is current control */target: dataType, 
/** alternate goes back to origin */direction: dataType, loop: booleanType, 
/** in mSec */duration: dataType}) : actionType;
function animation_timeline : actionType;
function animation_timeline(animation: [animationType], 
/** query selector, default is current control */target: dataType) : actionType;
function animation_keyframes : animationType;
function animation_keyframes(...animation: [animationType][]) : animationType;
function animation_expression : animation_valType;
function animation_expression(
/** e.g. 20 , +=10, *=2 */val: dataType) : animation_valType;
function animation_range : animation_valType;
function animation_range(
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType) : animation_valType;
function animation_range(
/** e.g. 20 */from: dataType) : animation_valType;
function animation_stagger : animation_valType;
function animation_stagger(profile: { 
/** value range */val: animation_stager_valType, 
/** Starts the stagger effect from a specific position */from: dataType, 
/** e.g. 20 */direction: dataType, easing: animation_easingType, grid: animation_stager_gridType}) : animation_valType;
function animation_stagger(
/** value range */val: animation_stager_valType) : animation_valType;
function animation_stagerGrid : animation_stager_gridType;
function animation_stagerGrid(profile: { 
/** e.g. 2 */rows: dataType, 
/** e.g. 5 */columns: dataType, 
/** direction of staggering */axis: dataType}) : animation_stager_gridType;
function animation_stagerGrid(
/** e.g. 2 */rows: dataType) : animation_stager_gridType;
function animation_stagerIncrease : animation_stager_valType;
function animation_stagerIncrease(
/** e.g. 20 */increase: dataType, 
/** optional, e.g. 10 */start: dataType) : animation_stager_valType;
function animation_stagerIncrease(
/** e.g. 20 */increase: dataType) : animation_stager_valType;
function animation_stagerRange : animation_stager_valType;
function animation_stagerRange(
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType) : animation_stager_valType;
function animation_stagerRange(
/** e.g. 20 */from: dataType) : animation_stager_valType;
function animation_direction : animationType;
function animation_direction(
/** alternate goes back to origin */direction: dataType) : animationType;
function animation_duration : animationType;
function animation_duration(
/** time of animation in mSec */duration: animation_valType) : animationType;
function animation_delay : animationType;
function animation_delay(
/** delay before animation */delay: animation_valType, 
/** delay at the end of animation */endDelay: animation_valType) : animationType;
function animation_delay(
/** delay before animation */delay: animation_valType) : animationType;
function animation_moveTo : animationType;
function animation_moveTo(profile: { 
/** e.g. 20 , +=10, *=2, list(100,200) */X: animation_valType, Y: animation_valType, Z: animation_valType}) : animationType;
function animation_moveTo(
/** e.g. 20 , +=10, *=2, list(100,200) */X: animation_valType) : animationType;
function animation_rotate : animationType;
function animation_rotate(profile: { 
/** degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270) */rotate: animation_valType, rotateX: animation_valType, rotateY: animation_valType, rotateZ: animation_valType}) : animationType;
function animation_rotate(
/** degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270) */rotate: animation_valType) : animationType;
function animation_scale : animationType;
function animation_scale(profile: { 
/** e.g. 1.5 , *=2, list(2,3) */scale: animation_valType, scaleX: animation_valType, scaleY: animation_valType, scaleZ: animation_valType}) : animationType;
function animation_scale(
/** e.g. 1.5 , *=2, list(2,3) */scale: animation_valType) : animationType;
function animation_skew : animationType;
function animation_skew(profile: { 
/** e.g. 20 , +=10, *=2, list(1,2) */skew: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewX: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewY: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewZ: dataType}) : animationType;
function animation_skew(
/** e.g. 20 , +=10, *=2, list(1,2) */skew: dataType) : animationType;
function animation_perspective : animationType;
function animation_perspective(
/** e.g. 100 , +=10, *=2, list(10,20) */perspective: animation_valType) : animationType;
function animation_easing : animationType;
function animation_easing(easing: animation_easingType) : animationType;
function animation_inOutEasing : animation_easingType;
function animation_inOutEasing(method: dataType, inOut: dataType) : animation_easingType;
function animation_inOutEasing(method: dataType) : animation_easingType;
function animation_elasticEasing : animation_easingType;
function animation_elasticEasing(profile: { inOut: dataType, 
/** 1-10  Controls the overshoot of the curve */amplitude: dataType, 
/** 0.1-2 Controls how many times the curve goes back and forth */period: dataType}) : animation_easingType;
function animation_elasticEasing(inOut: dataType) : animation_easingType;
function animation_springEasing : animation_easingType;
function animation_springEasing(profile: { 
/** 0-100 */mass: dataType, 
/** 0-100 */stiffness: dataType, 
/** 0-100 */damping: dataType, 
/** 0-100 */velocity: dataType}) : animation_easingType;
function animation_springEasing(
/** 0-100 */mass: dataType) : animation_easingType;
function animation_movement : animationType;
function animation_movement(to: positionType, subAnimations: [animationType]) : animationType;
function animation_movement(to: positionType) : animationType;
function animation_fixedPos : positionType;
function animation_fixedPos(top: dataType, left: dataType) : positionType;
function animation_fixedPos(top: dataType) : positionType;
function card : controlType;
function card(profile: { data: dataType, style: card_styleType, adapter: dataType}) : controlType;
function card(data: dataType) : controlType;
function cardFilter : controlType;
function cardFilter(data: dataType, style: card_filter_styleType) : controlType;
function cardFilter(data: dataType) : controlType;
function cardList : controlType;
function cardList(profile: { data: dataType, style: card_list_styleType, adapter: dataType}) : controlType;
function cardList(data: dataType) : controlType;
function dataResource_angrybirdsPosts : dataType;
function dataResource_angrybirdsPosts() : dataType;
function method : featureType;
function method(
/** to be used in html, e.g. onclick="myMethod"  */id: dataType, action: [actionType]) : featureType;
function method(
/** to be used in html, e.g. onclick="myMethod"  */id: dataType) : featureType;
function feature_onEvent : featureType;
function feature_onEvent(event: dataType, action: [actionType]) : featureType;
function feature_onEvent(event: dataType) : featureType;
function watchAndCalcModelProp : featureType;
function watchAndCalcModelProp(profile: { prop: dataType, transformValue: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, defaultValue: dataType}) : featureType;
function watchAndCalcModelProp(prop: dataType) : featureType;
function calcProp : featureType;
function calcProp(profile: { id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType, defaultValue: dataType}) : featureType;
function calcProp(id: dataType) : featureType;
function userStateProp : featureType;
function userStateProp(profile: { id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}) : featureType;
function userStateProp(id: dataType) : featureType;
function calcProps : featureType;
function calcProps(
/** props as object */props: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType) : featureType;
function calcProps(
/** props as object */props: dataType) : featureType;
function feature_initValue : featureType;
function feature_initValue(profile: { to: dataType, value: dataType, alsoWhenNotEmpty: booleanType}) : featureType;
function feature_initValue(to: dataType) : featureType;
function feature_requireService : dataType;
function feature_requireService(service: serviceType, condition: dataType) : dataType;
function feature_requireService(service: serviceType) : dataType;
function feature_init : feature:0Type;
function feature_init(action: actionType, 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType) : feature:0Type;
function feature_init(action: actionType) : feature:0Type;
function onDestroy : featureType;
function onDestroy(action: actionType) : featureType;
function templateModifier : featureType;
function templateModifier(value: dataType) : featureType;
function frontEnd_var : featureType;
function frontEnd_var(id: dataType, value: dataType) : featureType;
function frontEnd_var(id: dataType) : featureType;
function features : featureType;
function features(...features: [featureType][]) : featureType;
function followUp_action : featureType;
function followUp_action(action: actionType) : featureType;
function followUp_flow : featureType;
function followUp_flow(...elems: [rxType][]) : featureType;
function watchRef : featureType;
function watchRef(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType, 
/** delay in activation, can be used to set priority */delay: dataType}) : featureType;
function watchRef(
/** reference to data */ref: dataType) : featureType;
function followUp_watchObservable : featureType;
function followUp_watchObservable(toWatch: dataType, 
/** in mSec */debounceTime: dataType) : featureType;
function followUp_watchObservable(toWatch: dataType) : featureType;
function followUp_onDataChange : featureType;
function followUp_onDataChange(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}) : featureType;
function followUp_onDataChange(
/** reference to data */ref: dataType) : featureType;
function group_data : featureType;
function group_data(profile: { data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: booleanType, 
/** watch childern change as well */includeChildren: dataType}) : featureType;
function group_data(data: dataType) : featureType;
function htmlAttribute : featureType;
function htmlAttribute(attribute: dataType, value: dataType) : featureType;
function htmlAttribute(attribute: dataType) : featureType;
function id : featureType;
function id(id: dataType) : featureType;
function feature_hoverTitle : featureType;
function feature_hoverTitle(title: dataType) : featureType;
function watchable : featureType;
function watchable(name: dataType, value: dataType) : featureType;
function watchable(name: dataType) : featureType;
function variable : featureType;
function variable(name: dataType, value: dataType) : featureType;
function variable(name: dataType) : featureType;
function calculatedVar : featureType;
function calculatedVar(profile: { name: dataType, value: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}) : featureType;
function calculatedVar(name: dataType) : featureType;
function feature_if : featureType;
function feature_if(showCondition: booleanType) : featureType;
function hidden : featureType;
function hidden(showCondition: booleanType) : featureType;
function refreshControlById : actionType;
function refreshControlById(profile: { id: dataType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType}) : actionType;
function refreshControlById(id: dataType) : actionType;
function group_autoFocusOnFirstInput : featureType;
function group_autoFocusOnFirstInput() : featureType;
function refreshIfNotWatchable : actionType;
function refreshIfNotWatchable(data: dataType) : actionType;
function feature_byCondition : featureType;
function feature_byCondition(profile: { condition: booleanType, then: featureType, else: featureType}) : featureType;
function feature_byCondition(condition: booleanType) : featureType;
function feature_userEventProps : featureType;
function feature_userEventProps(
/** comma separated props to take from the original event e.g., altKey,ctrlKey */props: dataType) : featureType;
function feature_serviceRegistey : featureType;
function feature_serviceRegistey() : featureType;
function service_registerBackEndService : dataType;
function service_registerBackEndService(profile: { id: dataType, service: dataType, allowOverride: booleanType}) : dataType;
function service_registerBackEndService(id: dataType) : dataType;
function action_applyDeltaToCmp : actionType;
function action_applyDeltaToCmp(profile: { delta: dataType, cmpId: dataType, assumedVdom: dataType}) : actionType;
function action_applyDeltaToCmp(delta: dataType) : actionType;
function sink_applyDeltaToCmp : rxType;
function sink_applyDeltaToCmp(delta: dataType, cmpId: dataType) : rxType;
function sink_applyDeltaToCmp(delta: dataType) : rxType;
function action_focusOnCmp : actionType;
function action_focusOnCmp(description: dataType, cmpId: dataType) : actionType;
function action_focusOnCmp(description: dataType) : actionType;
function customStyle : dataType;
function customStyle(profile: { template: dataType, css: dataType, features: [featureType]}) : dataType;
function customStyle(template: dataType) : dataType;
function styleByControl : dataType;
function styleByControl(control: controlType, modelVar: dataType) : dataType;
function styleByControl(control: controlType) : dataType;
function styleWithFeatures : dataType;
function styleWithFeatures(style: $asParentType, features: [featureType]) : dataType;
function styleWithFeatures(style: $asParentType) : dataType;
function controlWithFeatures : controlType;
function controlWithFeatures(control: controlType, features: [featureType]) : controlType;
function controlWithFeatures(control: controlType) : controlType;
function renderWidget : actionType;
function renderWidget(control: controlType, selector: dataType) : actionType;
function renderWidget(control: controlType) : actionType;
function css : featureType | dialog_featureType;
function css(css: dataType) : featureType | dialog_featureType;
function css_class : featureType | dialog_featureType;
function css_class(class: dataType) : featureType | dialog_featureType;
function css_width : featureType | dialog_featureType;
function css_width(profile: { 
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_width(
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType) : featureType | dialog_featureType;
function css_height : featureType | dialog_featureType;
function css_height(profile: { 
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_height(
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType) : featureType | dialog_featureType;
function css_opacity : featureType;
function css_opacity(
/** 0-1 */opacity: dataType, selector: dataType) : featureType;
function css_opacity(
/** 0-1 */opacity: dataType) : featureType;
function css_padding : featureType | dialog_featureType;
function css_padding(profile: { 
/** e.g. 20, 20%, 0.4em */top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_padding(
/** e.g. 20, 20%, 0.4em */top: dataType) : featureType | dialog_featureType;
function css_margin : featureType | dialog_featureType;
function css_margin(profile: { 
/** e.g. 20, 20%, 0.4em, -20 */top: dataType, left: dataType, bottom: dataType, right: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_margin(
/** e.g. 20, 20%, 0.4em, -20 */top: dataType) : featureType | dialog_featureType;
function css_marginAllSides : featureType | dialog_featureType;
function css_marginAllSides(
/** e.g. 20, 20%, 0.4em */value: dataType, selector: dataType) : featureType | dialog_featureType;
function css_marginAllSides(
/** e.g. 20, 20%, 0.4em */value: dataType) : featureType | dialog_featureType;
function css_marginVerticalHorizontal : featureType | dialog_featureType;
function css_marginVerticalHorizontal(profile: { vertical: dataType, horizontal: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_marginVerticalHorizontal(vertical: dataType) : featureType | dialog_featureType;
function css_transformRotate : featureType;
function css_transformRotate(
/** 0-360 */angle: dataType, selector: dataType) : featureType;
function css_transformRotate(
/** 0-360 */angle: dataType) : featureType;
function css_color : featureType;
function css_color(profile: { color: dataType, background: dataType, selector: dataType}) : featureType;
function css_color(color: dataType) : featureType;
function css_transformScale : featureType;
function css_transformScale(profile: { 
/** 0-1 */x: dataType, 
/** 0-1 */y: dataType, selector: dataType}) : featureType;
function css_transformScale(
/** 0-1 */x: dataType) : featureType;
function css_transformTranslate : featureType;
function css_transformTranslate(profile: { 
/** 10px */x: dataType, 
/** 20px */y: dataType, selector: dataType}) : featureType;
function css_transformTranslate(
/** 10px */x: dataType) : featureType;
function css_bold : featureType;
function css_bold() : featureType;
function css_underline : featureType;
function css_underline() : featureType;
function css_boxShadow : featureType | dialog_featureType;
function css_boxShadow(profile: { 
/** the box is raised or content is depressed inside the box */inset: booleanType, 
/** bigger and lighter shadow */blurRadius: dataType, 
/** just bigger shadow */spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, 
/** offset-x */horizontal: dataType, 
/** offset-y */vertical: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_boxShadow(
/** the box is raised or content is depressed inside the box */inset: booleanType) : featureType | dialog_featureType;
function css_border : featureType | dialog_featureType;
function css_border(profile: { width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_border(width: dataType) : featureType | dialog_featureType;
function css_borderRadius : featureType | dialog_featureType;
function css_borderRadius(radius: dataType, selector: dataType) : featureType | dialog_featureType;
function css_borderRadius(radius: dataType) : featureType | dialog_featureType;
function css_lineClamp : featureType;
function css_lineClamp(
/** no of lines to clump */lines: dataType, selector: dataType) : featureType;
function css_lineClamp(
/** no of lines to clump */lines: dataType) : featureType;
function css_valueOfCssVar : dataType;
function css_valueOfCssVar(
/** without the -- prefix */varName: dataType, 
/** html element under which to check the var, default is document.body */parent: dataType) : dataType;
function css_valueOfCssVar(
/** without the -- prefix */varName: dataType) : dataType;
function css_conditionalClass : featureType;
function css_conditionalClass(cssClass: dataType, condition: booleanType) : featureType;
function css_conditionalClass(cssClass: dataType) : featureType;
function d3g_frame : d3g_frameType;
function d3g_frame(profile: { width: dataType, height: dataType, top: dataType, right: dataType, bottom: dataType, left: dataType}) : d3g_frameType;
function d3g_frame(width: dataType) : d3g_frameType;
function d3g_histogram : controlType;
function d3g_histogram(profile: { title: dataType, items: dataType, pivot: d3g_pivotType, frame: d3g_frameType, itemTitle: dataType, ticks: dataType, axes: d3g_axesType, style: d3g_histogram_styleType, features: [d3_featureType]}) : controlType;
function d3g_histogram(title: dataType) : controlType;
function d3Histogram_init : d3_featureType;
function d3Histogram_init() : d3_featureType;
function d3g_buttomAndLeftAxes : d3g_axesType;
function d3g_buttomAndLeftAxes() : d3g_axesType;
function d3g_itemIndicator : d3_featureType;
function d3g_itemIndicator(item: dataType) : d3_featureType;
function d3g_linearScale : d3g_scaleType;
function d3g_linearScale() : d3g_scaleType;
function d3g_sqrtScale : d3g_scaleType;
function d3g_sqrtScale() : d3g_scaleType;
function d3g_bandScale : d3g_scaleType;
function d3g_bandScale(profile: { 
/** range [0,1] */paddingInner: dataType, 
/** range [0,1] */paddingOuter: dataType, 
/** 0 - aligned left, 0.5 - centered, 1 - aligned right */align: dataType}) : d3g_scaleType;
function d3g_bandScale(
/** range [0,1] */paddingInner: dataType) : d3g_scaleType;
function d3g_ordinalColors : d3g_scaleType;
function d3g_ordinalColors(scale: dataType) : d3g_scaleType;
function d3g_interpolateColors : d3g_scaleType;
function d3g_interpolateColors(scale: dataType) : d3g_scaleType;
function d3g_autoRange : d3g_rangeType;
function d3g_autoRange() : d3g_rangeType;
function d3g_fromTo : d3g_rangeType;
function d3g_fromTo(from: dataType, to: dataType) : d3g_rangeType;
function d3g_fromTo(from: dataType) : d3g_rangeType;
function d3g_domainByValues : d3g_domainType;
function d3g_domainByValues() : d3g_domainType;
function dialog_buildComp : control:0Type;
function dialog_buildComp(dialog: dataType) : control:0Type;
function dialog_createDialogTopIfNeeded : actionType;
function dialog_createDialogTopIfNeeded() : actionType;
function dialog_closeAll : actionType;
function dialog_closeAll() : actionType;
function dialog_shownDialogs : dataType;
function dialog_shownDialogs() : dataType;
function dialogs_cmpIdOfDialog : dataType;
function dialogs_cmpIdOfDialog(id: dataType) : dataType;
function dialogs_shownPopups : dataType;
function dialogs_shownPopups() : dataType;
function dialogFeature_modal : dialog_featureType;
function dialogFeature_modal() : dialog_featureType;
function dialogFeature_uniqueDialog : dialog_featureType;
function dialogFeature_uniqueDialog(id: dataType) : dialog_featureType;
function source_eventIncludingPreview : rxType;
function source_eventIncludingPreview(event: dataType) : rxType;
function dialogFeature_dragTitle : dialog_featureType;
function dialogFeature_dragTitle(profile: { id: dataType, useSessionStorage: booleanType, selector: dataType}) : dialog_featureType;
function dialogFeature_dragTitle(id: dataType) : dialog_featureType;
function dialog_default : dialog_styleType;
function dialog_default() : dialog_styleType;
function dialogFeature_nearLauncherPosition : dialog_featureType;
function dialogFeature_nearLauncherPosition(profile: { offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}) : dialog_featureType;
function dialogFeature_nearLauncherPosition(offsetLeft: dataType) : dialog_featureType;
function dialogFeature_onClose : dialog_featureType;
function dialogFeature_onClose(action: actionType) : dialog_featureType;
function dialogFeature_closeWhenClickingOutside : dialog_featureType;
function dialogFeature_closeWhenClickingOutside() : dialog_featureType;
function dialogFeature_autoFocusOnFirstInput : dialog_featureType;
function dialogFeature_autoFocusOnFirstInput(selectText: booleanType) : dialog_featureType;
function dialogFeature_cssClassOnLaunchingElement : dialog_featureType;
function dialogFeature_cssClassOnLaunchingElement() : dialog_featureType;
function dialogFeature_maxZIndexOnClick : dialog_featureType;
function dialogFeature_maxZIndexOnClick(minZIndex: dataType) : dialog_featureType;
function dialog_dialogOkCancel : dialog_styleType;
function dialog_dialogOkCancel(okLabel: dataType, cancelLabel: dataType) : dialog_styleType;
function dialog_dialogOkCancel(okLabel: dataType) : dialog_styleType;
function dialogFeature_resizer : dialog_featureType;
function dialogFeature_resizer(
/** effective element with "autoResizeInDialog" class */autoResizeInnerElement: booleanType) : dialog_featureType;
function dialog_popup : dialog_styleType;
function dialog_popup() : dialog_styleType;
function dialog_transparentPopup : dialog_styleType;
function dialog_transparentPopup() : dialog_styleType;
function dialog_div : dialog_styleType;
function dialog_div() : dialog_styleType;
function dialogs_changeEmitter : rxType;
function dialogs_changeEmitter(widgetId: dataType) : rxType;
function dialogs_destroyAllEmitters : actionType;
function dialogs_destroyAllEmitters() : actionType;
function dialog_dialogTop : controlType;
function dialog_dialogTop(style: dialogs_styleType) : controlType;
function dialogs_defaultStyle : dialogs_styleType;
function dialogs_defaultStyle() : dialogs_styleType;
function divider_br : divider_styleType;
function divider_br() : divider_styleType;
function divider_vertical : divider_styleType;
function divider_vertical() : divider_styleType;
function divider_flexAutoGrow : divider_styleType;
function divider_flexAutoGrow() : divider_styleType;
function editableBoolean_initToggle : featureType;
function editableBoolean_initToggle() : featureType;
function editableText_setInputState : actionType;
function editableText_setInputState(profile: { newVal: dataType, 
/** contains value and selectionStart, the action is not performed if the not in this state */assumedVal: dataType, selectionStart: dataType, cmp: dataType}) : actionType;
function editableText_setInputState(newVal: dataType) : actionType;
function editableText_addUserEvent : rxType;
function editableText_addUserEvent() : rxType;
function editableText : controlType;
function editableText(profile: { title: dataType, databind: dataType, updateOnBlur: booleanType, style: editable_text_styleType, features: [featureType]}) : controlType;
function editableText(title: dataType) : controlType;
function editableText_xButton : featureType;
function editableText_xButton() : featureType;
function field_databind : featureType;
function field_databind(debounceTime: dataType, oneWay: booleanType) : featureType;
function field_databind(debounceTime: dataType) : featureType;
function field_onChange : featureType;
function field_onChange(action: actionType) : featureType;
function field_databindText : featureType;
function field_databindText(debounceTime: dataType, oneWay: booleanType) : featureType;
function field_databindText(debounceTime: dataType) : featureType;
function field_title : featureType;
function field_title(title: dataType) : featureType;
function field_columnWidth : featureType;
function field_columnWidth(width: dataType) : featureType;
function action_runBEMethod : actionType;
function action_runBEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : actionType;
function action_runBEMethod(method: dataType) : actionType;
function action_runFEMethod : actionType;
function action_runFEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : actionType;
function action_runFEMethod(method: dataType) : actionType;
function sink_BEMethod : rxType;
function sink_BEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : rxType;
function sink_BEMethod(method: dataType) : rxType;
function sink_FEMethod : rxType;
function sink_FEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : rxType;
function sink_FEMethod(method: dataType) : rxType;
function action_refreshCmp : actionType;
function action_refreshCmp(state: dataType, options: dataType) : actionType;
function action_refreshCmp(state: dataType) : actionType;
function sink_refreshCmp : rxType;
function sink_refreshCmp(state: dataType, options: dataType) : rxType;
function sink_refreshCmp(state: dataType) : rxType;
function frontEnd_method : featureType;
function frontEnd_method(method: dataType, action: actionType) : featureType;
function frontEnd_method(method: dataType) : featureType;
function frontEnd_requireExternalLibrary : featureType;
function frontEnd_requireExternalLibrary(libs: dataType) : featureType;
function frontEnd_enrichUserEvent : featureType;
function frontEnd_enrichUserEvent(action: actionType) : featureType;
function frontEnd_onRefresh : featureType;
function frontEnd_onRefresh(action: actionType) : featureType;
function frontEnd_init : featureType;
function frontEnd_init(action: actionType) : featureType;
function frontEnd_prop : featureType;
function frontEnd_prop(id: dataType, value: dataType) : featureType;
function frontEnd_prop(id: dataType) : featureType;
function frontEnd_onDestroy : featureType;
function frontEnd_onDestroy(action: actionType) : featureType;
function source_frontEndEvent : rxType;
function source_frontEndEvent(event: dataType) : rxType;
function rx_userEventVar : rxType;
function rx_userEventVar() : rxType;
function frontEnd_flow : featureType;
function frontEnd_flow(...elems: [rxType][]) : featureType;
function feature_onHover : featureType;
function feature_onHover(action: actionType, onLeave: actionType) : featureType;
function feature_onHover(action: actionType) : featureType;
function feature_classOnHover : featureType;
function feature_classOnHover(
/** css class to add/remove on hover */clz: stringType) : featureType;
function key_eventMatchKey : booleanType;
function key_eventMatchKey(event: dataType, 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : booleanType;
function key_eventMatchKey(event: dataType) : booleanType;
function key_eventToMethod : booleanType;
function key_eventToMethod(event: dataType, elem: dataType) : booleanType;
function key_eventToMethod(event: dataType) : booleanType;
function feature_onKey : featureType;
function feature_onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType) : featureType;
function feature_onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : featureType;
function feature_keyboardShortcut : featureType;
function feature_keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType;
function feature_keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType;
function feature_globalKeyboardShortcut : featureType;
function feature_globalKeyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType;
function feature_globalKeyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType;
function feature_onEnter : featureType;
function feature_onEnter(action: actionType) : featureType;
function feature_onEsc : featureType;
function feature_onEsc(...action: [actionType][]) : featureType;
function frontEnd_selectionKeySourceService : featureType;
function frontEnd_selectionKeySourceService(autoFocs: booleanType) : featureType;
function frontEnd_passSelectionKeySource : featureType;
function frontEnd_passSelectionKeySource() : featureType;
function source_findSelectionKeySource : rxType;
function source_findSelectionKeySource() : rxType;
function group : controlType;
function group(profile: { title: dataType, layout: layoutType, style: group_styleType, controls: [controlType], features: [featureType]}) : controlType;
function group(title: dataType) : controlType;
function group_initGroup : featureType;
function group_initGroup() : featureType;
function inlineControls : controlType;
function inlineControls(...controls: [controlType][]) : controlType;
function dynamicControls : controlType;
function dynamicControls(profile: { controlItems: dataType, genericControl: controlType, itemVariable: dataType, indexVariable: dataType}) : controlType;
function dynamicControls(controlItems: dataType) : controlType;
function group_firstSucceeding : featureType;
function group_firstSucceeding() : featureType;
function controlWithCondition : controlType;
function controlWithCondition(profile: { condition: booleanType, control: controlType, title: dataType}) : controlType;
function controlWithCondition(condition: booleanType) : controlType;
function group_eliminateRecursion : featureType;
function group_eliminateRecursion(maxDepth: dataType) : featureType;
function controls : controlType;
function controls(...controls: [controlType][]) : controlType;
function html_plain : html_styleType;
function html_plain() : html_styleType;
function html_inIframe : html_styleType;
function html_inIframe(width: dataType, height: dataType) : html_styleType;
function html_inIframe(width: dataType) : html_styleType;
function icon_init : featureType;
function icon_init() : featureType;
function icon : iconType;
function icon(profile: { icon: dataType, title: dataType, type: dataType, style: icon_styleType, features: [featureType]}) : iconType;
function icon(icon: dataType) : iconType;
function icon_material : icon_styleType;
function icon_material() : icon_styleType;
function feature_icon : featureType;
function feature_icon(profile: { icon: dataType, title: dataType, position: dataType, type: dataType, size: dataType, style: icon_styleType, features: [featureType]}) : featureType;
function feature_icon(icon: dataType) : featureType;
function image_widthHeight : image_resizeType;
function image_widthHeight(
/** e.g: 100, 20% */width: dataType, 
/** e.g: 100, 20% */height: dataType) : image_resizeType;
function image_widthHeight(
/** e.g: 100, 20% */width: dataType) : image_resizeType;
function image_cover : image_resizeType;
function image_cover() : image_resizeType;
function image_fullyVisible : image_resizeType;
function image_fullyVisible() : image_resizeType;
function image_position : image_positionType;
function image_position(
/** e.g. 7, 50%, right */x: dataType, 
/** e.g. 10, 50%, bottom */y: dataType) : image_positionType;
function image_position(
/** e.g. 7, 50%, right */x: dataType) : image_positionType;
function image_background : image_styleType;
function image_background() : image_styleType;
function image_img : image_styleType;
function image_img() : image_styleType;
function group_itemlistContainer : featureType;
function group_itemlistContainer(initialSelection: dataType) : featureType;
function itemlistContainer_filter : aggregatorType;
function itemlistContainer_filter(updateCounters: booleanType) : aggregatorType;
function itemlistContainer_filterField : featureType;
function itemlistContainer_filterField(fieldData: dataType, filterType: filter_typeType) : featureType;
function itemlistContainer_filterField(fieldData: dataType) : featureType;
function filterType_text : filter_typeType;
function filterType_text(ignoreCase: booleanType) : filter_typeType;
function filterType_exactMatch : filter_typeType;
function filterType_exactMatch() : filter_typeType;
function filterType_numeric : filter_typeType;
function filterType_numeric() : filter_typeType;
function search_searchInAllProperties : search_inType;
function search_searchInAllProperties() : search_inType;
function search_fuse : search_inType;
function search_fuse(profile: { 
/** List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects */keys: dataType, 
/** When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string */findAllMatches: booleanType, isCaseSensitive: booleanType, 
/** Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2) */minMatchCharLength: dataType, 
/** Whether to sort the result list, by score */shouldSort: booleanType, 
/** Determines approximately where in the text is the pattern expected to be found */location: dataType, 
/** At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything */threshold: dataType, 
/** Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch */distance: dataType}) : search_inType;
function search_fuse(
/** List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects */keys: dataType) : search_inType;
function source_dragulaEvent : rx:0Type;
function source_dragulaEvent(event: dataType, 
/** e.g., ['dropElm', 'target', 'source'] */argNames: dataType) : rx:0Type;
function source_dragulaEvent(event: dataType) : rx:0Type;
function itemlist_orignialIndexFromSibling : data:0Type;
function itemlist_orignialIndexFromSibling(sibling: dataType) : data:0Type;
function itemlist_dragHandle : featureType;
function itemlist_dragHandle() : featureType;
function itemlist_infiniteScroll : featureType;
function itemlist_infiniteScroll(pageSize: dataType) : featureType;
function itemlist_applyDeltaOfNextPage : actionType;
function itemlist_applyDeltaOfNextPage(pageSize: dataType) : actionType;
function itemlist_deltaOfItems : dataType;
function itemlist_deltaOfItems() : dataType;
function itemlist_incrementalFromRx : featureType;
function itemlist_incrementalFromRx(prepend: booleanType) : featureType;
function itemlist_calcSlicedItems : dataType;
function itemlist_calcSlicedItems() : dataType;
function itemlist_selection : featureType;
function itemlist_selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, cssForSelected: dataType}) : featureType;
function itemlist_selection(databind: dataType) : featureType;
function itemlist_keyboardSelection : featureType;
function itemlist_keyboardSelection(autoFocus: booleanType, onEnter: actionType) : featureType;
function itemlist_keyboardSelection(autoFocus: booleanType) : featureType;
function itemlist_indexOfElem : data:0Type;
function itemlist_indexOfElem(elem: dataType) : data:0Type;
function itemlist_indexToData : data:0Type;
function itemlist_indexToData(index: dataType) : data:0Type;
function itemlist_findSelectionSource : data:0Type;
function itemlist_findSelectionSource() : data:0Type;
function itemlist_nextSelected : data:0Type;
function itemlist_nextSelected(diff: dataType, elementFilter: dataType) : data:0Type;
function itemlist_nextSelected(diff: dataType) : data:0Type;
function itemlist : controlType;
function itemlist(profile: { title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, layout: layoutType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}) : controlType;
function itemlist(title: dataType) : controlType;
function itemlist_noContainer : featureType;
function itemlist_noContainer() : featureType;
function itemlist_init : featureType;
function itemlist_init() : featureType;
function table_trTd : group_styleType;
function table_trTd() : group_styleType;
function table_enableExpandToEndOfRow : featureType;
function table_enableExpandToEndOfRow() : featureType;
function feature_expandToEndOfRow : featureType;
function feature_expandToEndOfRow(condition: booleanType) : featureType;
function editableText_markdown : editable_text_styleType;
function editableText_markdown(simplemdeSettings: dataType, debounceTime: dataType) : editable_text_styleType;
function editableText_markdown(simplemdeSettings: dataType) : editable_text_styleType;
function markdown : controlType;
function markdown(profile: { markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}) : controlType;
function markdown(markdown: dataType) : controlType;
function markdown_mark : markdown_styleType;
function markdown_mark() : markdown_styleType;
function menu_menu : menu_optionType;
function menu_menu(profile: { title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}) : menu_optionType;
function menu_menu(title: dataType) : menu_optionType;
function menu_dynamicOptions : menu_optionType;
function menu_dynamicOptions(items: dataType, genericOption: menu_optionType) : menu_optionType;
function menu_dynamicOptions(items: dataType) : menu_optionType;
function menu_endWithSeparator : menu_optionType;
function menu_endWithSeparator(profile: { options: [menu_optionType], separator: menu_optionType, title: dataType}) : menu_optionType;
function menu_separator : menu_optionType;
function menu_separator() : menu_optionType;
function menu_action : menu_optionType;
function menu_action(profile: { title: dataType, action: actionType, description: dataType, icon: iconType, shortcut: dataType, showCondition: booleanType}) : menu_optionType;
function menu_action(title: dataType) : menu_optionType;
function menu_initPopupMenu : featureType;
function menu_initPopupMenu(popupStyle: dialog_styleType) : featureType;
function menu_initMenuOption : featureType;
function menu_initMenuOption() : featureType;
function menu_selectionKeySourceService : featureType;
function menu_selectionKeySourceService() : featureType;
function menu_passMenuKeySource : featureType;
function menu_passMenuKeySource() : featureType;
function source_findMenuKeySource : rxType;
function source_findMenuKeySource(clientCmp: dataType) : rxType;
function menu_isRelevantMenu : dataType;
function menu_isRelevantMenu() : dataType;
function menuStyle_optionLine : menu_option_styleType;
function menuStyle_optionLine() : menu_option_styleType;
function menuStyle_popupAsOption : menu_styleType;
function menuStyle_popupAsOption() : menu_styleType;
function menuStyle_popupThumb : menu_styleType;
function menuStyle_popupThumb() : menu_styleType;
function dialog_contextMenuPopup : dialog_styleType;
function dialog_contextMenuPopup(profile: { offsetTop: dataType, rightSide: booleanType, toolbar: booleanType}) : dialog_styleType;
function dialog_contextMenuPopup(offsetTop: dataType) : dialog_styleType;
function menuSeparator_line : menu_separator_styleType;
function menuSeparator_line() : menu_separator_styleType;
function menu_notSeparator : booleanType;
function menu_notSeparator(elem: dataType) : booleanType;
function menuStyle_toolbar : menu_styleType;
function menuStyle_toolbar(leafOptionStyle: menu_option_styleType, itemlistStyle: itemlist_styleType) : menu_styleType;
function menuStyle_toolbar(leafOptionStyle: menu_option_styleType) : menu_styleType;
function multiSelect_modelAsBooleanRef : dataType;
function multiSelect_modelAsBooleanRef(multiSelectModel: dataType, code: dataType) : dataType;
function multiSelect_modelAsBooleanRef(multiSelectModel: dataType) : dataType;
function multiSelect_choiceList : multiSelect_styleType;
function multiSelect_choiceList(choiceStyle: editable_boolean_styleType, itemlistStyle: itemlist_styleType) : multiSelect_styleType;
function multiSelect_choiceList(choiceStyle: editable_boolean_styleType) : multiSelect_styleType;
function studio_notebookElem : nb_elemType;
function studio_notebookElem(result: controlType, editor: controlType) : nb_elemType;
function studio_notebookElem(result: controlType) : nb_elemType;
function nb_markdown : nb_elemType;
function nb_markdown(markdown: dataType) : nb_elemType;
function nb_control : nb_elemType;
function nb_control(control: controlType) : nb_elemType;
function picklist_init : featureType;
function picklist_init() : featureType;
function picklist_onChange : featureType;
function picklist_onChange(action: actionType) : featureType;
function picklist_optionsByComma : picklist_optionsType;
function picklist_optionsByComma(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType;
function picklist_optionsByComma(options: dataType) : picklist_optionsType;
function picklist_options : picklist_optionsType;
function picklist_options(profile: { options: dataType, code: dataType, text: dataType, icon: iconType, allowEmptyValue: booleanType}) : picklist_optionsType;
function picklist_options(options: dataType) : picklist_optionsType;
function picklist_sortedOptions : picklist_optionsType;
function picklist_sortedOptions(options: picklist_optionsType, 
/** e.g input:80,group:90. 0 mark means hidden. no mark means 50 */marks: dataType) : picklist_optionsType;
function picklist_sortedOptions(options: picklist_optionsType) : picklist_optionsType;
function picklist_promote : picklist_promoteType;
function picklist_promote(groups: dataType, options: dataType) : picklist_promoteType;
function picklist_promote(groups: dataType) : picklist_promoteType;
function picklist_initGroups : featureType;
function picklist_initGroups() : featureType;
function widget_frontEndCtrl : controlType;
function widget_frontEndCtrl(widgetId: dataType) : controlType;
function widget_newId : dataType;
function widget_newId(jbm: jbmType) : dataType;
function action_frontEndDelta : actionType;
function action_frontEndDelta(event: dataType) : actionType;
function remote_distributedWidget : actionType;
function remote_distributedWidget(profile: { control: controlType, backend: jbmType, frontend: jbmType, 
/** root selector to put widget in. e.g. #main */selector: dataType}) : actionType;
function remote_distributedWidget(control: controlType) : actionType;
function remote_widget : controlType;
function remote_widget(control: controlType, jbm: jbmType) : controlType;
function remote_widget(control: controlType) : controlType;
function action_renderXwidget : actionType;
function action_renderXwidget(selector: dataType, widgetId: dataType) : actionType;
function action_renderXwidget(selector: dataType) : actionType;
function widget_headless : rxType;
function widget_headless(control: controlType, widgetId: dataType) : rxType;
function widget_headless(control: controlType) : rxType;
function widget_headlessWidgets : dataType;
function widget_headlessWidgets() : dataType;
function sidenav : controlType;
function sidenav(profile: { controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}) : controlType;
function slider_init : featureType;
function slider_init() : featureType;
function slider_drag : featureType;
function slider_drag() : featureType;
function editableText_codemirror : editable_text_styleType;
function editableText_codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}) : editable_text_styleType;
function editableText_codemirror(cm_settings: dataType) : editable_text_styleType;
function codemirror_textEditorKeys : featureType;
function codemirror_textEditorKeys() : featureType;
function codemirror_fold : featureType;
function codemirror_fold() : featureType;
function codemirror_lineNumbers : featureType;
function codemirror_lineNumbers() : featureType;
function codeEditor_cmEnrichUserEvent : featureType;
function codeEditor_cmEnrichUserEvent(
/** used for external buttons */cmSelector: dataType) : featureType;
function text_codemirror : text_styleType;
function text_codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, height: dataType, lineWrapping: booleanType, lineNumbers: booleanType, formatText: booleanType, mode: dataType}) : text_styleType;
function text_codemirror(cm_settings: dataType) : text_styleType;
function editableBoolean_checkbox : editable_boolean_styleType;
function editableBoolean_checkbox() : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel() : editable_boolean_styleType;
function editableBoolean_expandCollapseWithUnicodeChars : editable_boolean_styleType;
function editableBoolean_expandCollapseWithUnicodeChars(toExpandSign: dataType, toCollapseSign: dataType) : editable_boolean_styleType;
function editableBoolean_expandCollapseWithUnicodeChars(toExpandSign: dataType) : editable_boolean_styleType;
function editableBoolean_expandCollapse : editable_boolean_styleType;
function editableBoolean_expandCollapse() : editable_boolean_styleType;
function editableBoolean_mdcCheckBox : editable_boolean_styleType;
function editableBoolean_mdcCheckBox(width: dataType) : editable_boolean_styleType;
function editableBoolean_picklist : editable_boolean_styleType;
function editableBoolean_picklist(picklistStyle: picklist_styleType) : editable_boolean_styleType;
function editableText_input : editable_text_styleType;
function editableText_input() : editable_text_styleType;
function editableText_textarea : editable_text_styleType;
function editableText_textarea(profile: { rows: dataType, cols: dataType, oneWay: booleanType}) : editable_text_styleType;
function editableText_textarea(rows: dataType) : editable_text_styleType;
function editableText_mdcNoLabel : editable_text_styleType;
function editableText_mdcNoLabel(width: dataType) : editable_text_styleType;
function editableText_mdcSearch : editable_text_styleType;
function editableText_mdcSearch(width: dataType) : editable_text_styleType;
function group_htmlTag : group_styleType;
function group_htmlTag(profile: { htmlTag: dataType, groupClass: dataType, itemClass: dataType}) : group_styleType;
function group_htmlTag(htmlTag: dataType) : group_styleType;
function group_div : group_styleType;
function group_div() : group_styleType;
function group_section : group_styleType;
function group_section() : group_styleType;
function group_ulLi : group_styleType;
function group_ulLi() : group_styleType;
function group_card : featureType;
function group_card(profile: { padding: dataType, width: dataType, outlined: booleanType}) : featureType;
function group_card(padding: dataType) : featureType;
function itemlist_shownOnlyOnItemHover : featureType;
function itemlist_shownOnlyOnItemHover() : featureType;
function itemlist_divider : featureType;
function itemlist_divider(space: dataType) : featureType;
function itemlist_ulLi : itemlist_styleType;
function itemlist_ulLi() : itemlist_styleType;
function itemlist_div : itemlist_styleType;
function itemlist_div(spacing: dataType) : itemlist_styleType;
function itemlist_horizontal : itemlist_styleType;
function itemlist_horizontal(spacing: dataType) : itemlist_styleType;
function layout_vertical : layoutType | featureType;
function layout_vertical(spacing: dataType) : layoutType | featureType;
function layout_horizontal : layoutType | featureType;
function layout_horizontal(spacing: dataType) : layoutType | featureType;
function layout_horizontalFixedSplit : layoutType | featureType;
function layout_horizontalFixedSplit(profile: { leftWidth: dataType, rightWidth: dataType, spacing: dataType}) : layoutType | featureType;
function layout_horizontalFixedSplit(leftWidth: dataType) : layoutType | featureType;
function layout_horizontalWrapped : layoutType | featureType;
function layout_horizontalWrapped(spacing: dataType) : layoutType | featureType;
function layout_flex : layoutType | featureType;
function layout_flex(profile: { direction: dataType, justifyContent: dataType, alignItems: dataType, wrap: dataType, spacing: dataType}) : layoutType | featureType;
function layout_flex(direction: dataType) : layoutType | featureType;
function layout_grid : layoutType | featureType;
function layout_grid(profile: { 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}) : layoutType | featureType;
function layout_grid(
/** grid-template-columns, list of lengths */columnSizes: dataType) : layoutType | featureType;
function flexItem_grow : featureType;
function flexItem_grow(factor: dataType) : featureType;
function flexItem_basis : featureType;
function flexItem_basis(factor: dataType) : featureType;
function flexItem_alignSelf : featureType;
function flexItem_alignSelf(align: dataType) : featureType;
function mdcStyle_initDynamic : featureType;
function mdcStyle_initDynamic(query: dataType) : featureType;
function feature_mdcRippleEffect : featureType;
function feature_mdcRippleEffect() : featureType;
function label_mdcRippleEffect : text_styleType;
function label_mdcRippleEffect() : text_styleType;
function picklist_native : picklist_styleType;
function picklist_native() : picklist_styleType;
function picklist_nativePlus : picklist_styleType;
function picklist_nativePlus() : picklist_styleType;
function picklist_nativeMdLookOpen : picklist_styleType;
function picklist_nativeMdLookOpen() : picklist_styleType;
function picklist_plusIcon : featureType;
function picklist_plusIcon() : featureType;
function picklist_radio : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType;
function picklist_mdcRadio : picklist_styleType;
function picklist_mdcRadio(text: dataType) : picklist_styleType;
function picklist_radioVertical : picklist_styleType;
function picklist_radioVertical() : picklist_styleType;
function picklist_mdcSelect : picklist_styleType;
function picklist_mdcSelect(profile: { width: dataType, noLabel: booleanType, noRipple: booleanType}) : picklist_styleType;
function picklist_mdcSelect(width: dataType) : picklist_styleType;
function picklist_labelList : picklist_styleType;
function picklist_labelList(profile: { labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType;
function picklist_labelList(labelStyle: text_styleType) : picklist_styleType;
function picklist_groups : picklist_styleType;
function picklist_groups() : picklist_styleType;
function propertySheet_titlesLeft : group_styleType;
function propertySheet_titlesLeft(profile: { titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType;
function propertySheet_titlesLeft(titleStyle: text_styleType) : group_styleType;
function propertySheet_titlesAbove : group_styleType;
function propertySheet_titlesAbove(profile: { titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType;
function propertySheet_titlesAbove(titleStyle: text_styleType) : group_styleType;
function text_htmlTag : text_styleType;
function text_htmlTag(htmlTag: dataType, cssClass: dataType) : text_styleType;
function text_htmlTag(htmlTag: dataType) : text_styleType;
function text_noWrappingTag : text_styleType;
function text_noWrappingTag() : text_styleType;
function text_span : text_styleType;
function text_span() : text_styleType;
function text_chip : text_styleType;
function text_chip() : text_styleType;
function header_mdcHeaderWithIcon : text_styleType;
function header_mdcHeaderWithIcon(level: dataType) : text_styleType;
function text_alignToBottom : text_styleType;
function text_alignToBottom() : text_styleType;
function text_h2WithClass : text_style:0Type;
function text_h2WithClass(clz: dataType) : text_style:0Type;
function text : controlType;
function text(profile: { text: dataType, title: dataType, style: text_styleType, features: [featureType]}) : controlType;
function text(text: dataType) : controlType;
function label : depricated_controlType;
function label(profile: { text: dataType, title: dataType, style: text_styleType, features: [featureType]}) : depricated_controlType;
function label(text: dataType) : depricated_controlType;
function text_bindText : featureType;
function text_bindText() : featureType;
function text_allowAsynchValue : featureType;
function text_allowAsynchValue(propId: dataType, waitingValue: dataType) : featureType;
function text_allowAsynchValue(propId: dataType) : featureType;
function text_highlight : dataType;
function text_highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType;
function text_highlight(base: dataType) : dataType;
function defaultTheme : dataType;
function defaultTheme() : dataType;
function group_theme : featureType;
function group_theme(theme: themeType) : featureType;
function theme_materialDesign : themeType;
function theme_materialDesign() : themeType;
function tree_jsonReadOnly : tree_node_modelType;
function tree_jsonReadOnly(object: dataType, rootPath: dataType) : tree_node_modelType;
function tree_jsonReadOnly(object: dataType) : tree_node_modelType;
function tree_json : tree_node_modelType;
function tree_json(object: dataType, rootPath: dataType) : tree_node_modelType;
function tree_json(object: dataType) : tree_node_modelType;
function tree_modelFilter : tree_node_modelType;
function tree_modelFilter(model: tree_node_modelType, 
/** input is path. e.g abc */pathFilter: booleanType) : tree_node_modelType;
function tree_modelFilter(model: tree_node_modelType) : tree_node_modelType;
function tableTree_expandFirstLevel : featureType;
function tableTree_expandFirstLevel() : featureType;
function tableTree_plain : table_tree_styleType;
function tableTree_plain(profile: { hideHeaders: booleanType, gapWidth: dataType, expColWidth: dataType, noItemsCtrl: controlType}) : table_tree_styleType;
function tableTree_plain(hideHeaders: booleanType) : table_tree_styleType;
function tableTree_expandPath : featureType;
function tableTree_expandPath(paths: dataType) : featureType;
function tableTree_resizer : featureType;
function tableTree_resizer() : featureType;
function tableTree_dragAndDrop : featureType;
function tableTree_dragAndDrop() : featureType;
function tree : controlType;
function tree(profile: { title: dataType, nodeModel: tree_node_modelType, style: tree_styleType, features: [featureType]}) : controlType;
function tree(title: dataType) : controlType;
function tree_noHead : featureType;
function tree_noHead() : featureType;
function tree_initTree : featureType;
function tree_initTree() : featureType;
function tree_expandPath : featureType;
function tree_expandPath(paths: dataType) : featureType;
function tree_plain : tree_styleType;
function tree_plain(showIcon: booleanType) : tree_styleType;
function tree_expandBox : tree_styleType;
function tree_expandBox(showIcon: booleanType, lineWidth: dataType) : tree_styleType;
function tree_expandBox(showIcon: booleanType) : tree_styleType;
function tree_selection : featureType;
function tree_selection(profile: { databind: dataType, onSelection: actionType, onRightClick: actionType, autoSelectFirst: booleanType}) : featureType;
function tree_selection(databind: dataType) : featureType;
function tree_keyboardSelection : featureType;
function tree_keyboardSelection(profile: { onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}) : featureType;
function tree_keyboardSelection(onKeyboardSelection: actionType) : featureType;
function tree_dragAndDrop : featureType;
function tree_dragAndDrop() : featureType;
function tree_nextSelected : data:0Type;
function tree_nextSelected(diff: dataType) : data:0Type;
function tree_pathOfInteractiveItem : dataType;
function tree_pathOfInteractiveItem() : dataType;
function tree_pathOfElem : data:0Type;
function tree_pathOfElem(elem: dataType) : data:0Type;
function tree_parentPath : dataType;
function tree_parentPath(path: dataType) : dataType;
function tree_lastPathElement : dataType;
function tree_lastPathElement(path: dataType) : dataType;
function tree_sameParent : booleanType;
function tree_sameParent(path1: dataType, path2: dataType) : booleanType;
function tree_sameParent(path1: dataType) : booleanType;
function tree_regainFocus : actionType;
function tree_regainFocus() : actionType;
function tree_redraw : actionType;
function tree_redraw(strong: booleanType) : actionType;
function tree_moveItem : actionType;
function tree_moveItem(from: dataType, to: dataType) : actionType;
function tree_moveItem(from: dataType) : actionType;
function urlHistory_mapUrlToResource : actionType;
function urlHistory_mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType;
function vega_interactiveChart : controlType;
function vega_interactiveChart(spec: vega_specType, showSpec: booleanType) : controlType;
function vega_interactiveChart(spec: vega_specType) : controlType;
function vega_spec : vega_specType;
function vega_spec(profile: { data: vega_dataType, transform: [vega_transformType], mark: vega_markType, encoding: vega_encodingType, name: dataType, title: dataType, description: dataType}) : vega_specType;
function vega_spec(data: vega_dataType) : vega_specType;
function vega_dataFromUrl : vega_dataType;
function vega_dataFromUrl(profile: { url: dataType, name: dataType, format: dataType}) : vega_dataType;
function vega_dataFromUrl(url: dataType) : vega_dataType;
function vega_jbData : vega_dataType;
function vega_jbData(items: dataType) : vega_dataType;
function vega_namedData : vega_dataType;
function vega_namedData(name: dataType) : vega_dataType;
function vega_aggregate : vega_transformType;
function vega_aggregate(pipe: [vega_aggPipeElemType], groupby: dataType) : vega_transformType;
function vega_aggPipeElem : vega_aggPipeElemType;
function vega_aggPipeElem(profile: { op: dataType, field: dataType, as: dataType}) : vega_aggPipeElemType;
function vega_aggPipeElem(op: dataType) : vega_aggPipeElemType;
function vega_calculate : vega_transformType;
function vega_calculate(
/** e.g: datum.x*2 */expression: dataType, as: dataType) : vega_transformType;
function vega_calculate(
/** e.g: datum.x*2 */expression: dataType) : vega_transformType;
function vega_filter : vega_transformType;
function vega_filter(filter: vega_booleanType) : vega_transformType;
function vega_filterExpression : vega_booleanType;
function vega_filterExpression(
/** e.g: datum.x>2 */filter: dataType) : vega_booleanType;
function vega_inSelection : vega_booleanType;
function vega_inSelection(selection: dataType) : vega_booleanType;
function vega_line : vega_markType;
function vega_line(showPoints: booleanType, props: [vega_markPropsType]) : vega_markType;
function vega_line(showPoints: booleanType) : vega_markType;
function vega_generalMarkProps : vega_markPropsType;
function vega_generalMarkProps(profile: { aria: dataType, description: dataType, style: dataType, tooltip: dataType}) : vega_markPropsType;
function vega_generalMarkProps(aria: dataType) : vega_markPropsType;
function vega_positionMarkProps : vega_markPropsType;
function vega_positionMarkProps(profile: { x: dataType, x2: dataType, width: dataType, height: dataType, y: dataType, y2: dataType}) : vega_markPropsType;
function vega_positionMarkProps(x: dataType) : vega_markPropsType;
function vega_positionChannels : vega_encodingType;
function vega_positionChannels(profile: { x: vega_channelType, y: vega_channelType, color: vega_channelType}) : vega_encodingType;
function vega_positionChannels(x: vega_channelType) : vega_encodingType;
function vega_channel : vega_channelType;
function vega_channel(profile: { field: dataType, type: dataType, title: dataType}) : vega_channelType;
function vega_channel(field: dataType) : vega_channelType;
function winUtils_gotoUrl : actionType;
function winUtils_gotoUrl(url: dataType, target: enumType) : actionType;
function winUtils_gotoUrl(url: dataType) : actionType;
type data = {
if : dataType,
if(profile: { condition: booleanType, then: dataType, else: dataType}) : dataType,
if(condition: booleanType) : dataType,
switch : dataType,
switch(cases: [data_switch_caseType], default: dataType) : dataType,
case : data_switch_caseType,
case(condition: booleanType, value: dataType) : data_switch_caseType,
case(condition: booleanType) : data_switch_caseType,
}
declare var data : data;,type action = {
if : actionType,
if(profile: { condition: booleanType, then: actionType, else: actionType}) : actionType,
if(condition: booleanType) : actionType,
switch : actionType,
switch(cases: [action_switch_caseType], defaultAction: actionType) : actionType,
switchCase : action_switch_caseType,
switchCase(condition: booleanType, action: actionType) : action_switch_caseType,
switchCase(condition: booleanType) : action_switch_caseType,
setSessionStorage : dataType,
setSessionStorage(id: dataType, value: dataType) : dataType,
setSessionStorage(id: dataType) : dataType,
subjectNext : actionType,
subjectNext(subject: dataType, data: dataType) : actionType,
subjectNext(subject: dataType) : actionType,
subjectComplete : actionType,
subjectComplete(subject: dataType) : actionType,
subjectError : actionType,
subjectError(subject: dataType, error: dataType) : actionType,
subjectError(subject: dataType) : actionType,
addToQueue : actionType,
addToQueue(queue: dataType, item: dataType) : actionType,
addToQueue(queue: dataType) : actionType,
removeFromQueue : actionType,
removeFromQueue(queue: dataType, item: dataType) : actionType,
removeFromQueue(queue: dataType) : actionType,
applyDeltaToCmp : actionType,
applyDeltaToCmp(profile: { delta: dataType, cmpId: dataType, assumedVdom: dataType}) : actionType,
applyDeltaToCmp(delta: dataType) : actionType,
focusOnCmp : actionType,
focusOnCmp(description: dataType, cmpId: dataType) : actionType,
focusOnCmp(description: dataType) : actionType,
runBEMethod : actionType,
runBEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : actionType,
runBEMethod(method: dataType) : actionType,
runFEMethod : actionType,
runFEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : actionType,
runFEMethod(method: dataType) : actionType,
refreshCmp : actionType,
refreshCmp(state: dataType, options: dataType) : actionType,
refreshCmp(state: dataType) : actionType,
frontEndDelta : actionType,
frontEndDelta(event: dataType) : actionType,
renderXwidget : actionType,
renderXwidget(selector: dataType, widgetId: dataType) : actionType,
renderXwidget(selector: dataType) : actionType,
}
declare var action : action;,type math = {
max : aggregatorType,
max() : aggregatorType,
min : aggregatorType,
min() : aggregatorType,
sum : aggregatorType,
sum() : aggregatorType,
plus : dataType,
plus(x: dataType, y: dataType) : dataType,
plus(x: dataType) : dataType,
minus : dataType,
minus(x: dataType, y: dataType) : dataType,
minus(x: dataType) : dataType,
}
declare var math : math;,type mutable = {
toggleBooleanValue : actionType,
toggleBooleanValue(of: dataType) : actionType,
}
declare var mutable : mutable;,type pipeline = {
var : aggregatorType,
var(name: dataType, val: dataType) : aggregatorType,
var(name: dataType) : aggregatorType,
}
declare var pipeline : pipeline;,type json = {
stringify : dataType,
stringify(value: dataType, 
/** use space or tab to make pretty output */space: dataType) : dataType,
stringify(value: dataType) : dataType,
parse : dataType,
parse(text: dataType) : dataType,
}
declare var json : json;,type codeLoader = {
getCode : dataType,
getCode() : dataType,
getCodeFromRemote : dataType,
getCodeFromRemote(ids: dataType) : dataType,
setCodeLoaderJbm : dataType,
setCodeLoaderJbm(codeLoaderUri: dataType) : dataType,
}
declare var codeLoader : codeLoader;,type dispatch = {
singleJbm : dispatch_serverType,
singleJbm(jbm: jbmType, capabilities: [dispatch_capabilitiesType]) : dispatch_serverType,
singleJbm(jbm: jbmType) : dispatch_serverType,
}
declare var dispatch : dispatch;,type codeEditor = {
setSelectedPT : menu_optionType,
setSelectedPT(profile: { path: dataType, semanticPart: dataType, compName: dataType}) : menu_optionType,
setSelectedPT(path: dataType) : menu_optionType,
withCursorPath : actionType,
withCursorPath(action: actionType, selector: dataType) : actionType,
withCursorPath(action: actionType) : actionType,
isDirty : dataType,
isDirty() : dataType,
cmEnrichUserEvent : featureType,
cmEnrichUserEvent(
/** used for external buttons */cmSelector: dataType) : featureType,
}
declare var codeEditor : codeEditor;,type watchableComps = {
changedComps : dataType,
changedComps() : dataType,
undo : actionType,
undo() : actionType,
cleanSelectionPreview : actionType,
cleanSelectionPreview() : actionType,
revert : actionType,
revert(toIndex: dataType) : actionType,
redo : actionType,
redo() : actionType,
scriptHistoryItems : dataType,
scriptHistoryItems() : dataType,
}
declare var watchableComps : watchableComps;,type jbm = {
byUri : jbmType,
byUri(uri: dataType) : jbmType,
self : jbmType,
self() : jbmType,
terminateChild : actionType,
terminateChild(id: dataType) : actionType,
nodeContainer : jbmType,
nodeContainer(profile: { modules: dataType, host: dataType, init: actionType}) : jbmType,
nodeContainer(modules: dataType) : jbmType,
}
declare var jbm : jbm;,type http = {
get : dataType | actionType,
get(profile: { url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType,
get(url: dataType) : dataType | actionType,
fetch : dataType | actionType,
fetch(profile: { url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType,
fetch(url: dataType) : dataType | actionType,
}
declare var http : http;,type pptr = {
crawler : pptr_crawlerType,
crawler(profile: { rootUrl: dataType, pageCrawlers: [pptr_page_crawlerType], resultData: dataType, 
/** watchable data to get get events about data changes */resultIndex: dataType, 
/** {url, vars?, nextPptrPageType? } */requestQueue: dataType}) : pptr_crawlerType,
crawler(rootUrl: dataType) : pptr_crawlerType,
pageCrawler : pptr_page_crawlerType,
pageCrawler(profile: { url: dataType, features: [pptr_featureType], extract: pptr_extractType, 
/** single or array, better to have id */transformToResultItems: dataType, 
/** optional props: varsForFollowing, nextPptrPageType */transformToUrlRequests: dataType}) : pptr_page_crawlerType,
pageCrawler(url: dataType) : pptr_page_crawlerType,
runMethodOnPptr : rxType | pptrType,
runMethodOnPptr(method: dataType, args: dataType) : rxType | pptrType,
runMethodOnPptr(method: dataType) : rxType | pptrType,
server : remoteType,
server(libs: dataType) : remoteType,
refreshServerCode : actionType,
refreshServerCode(remote: remoteType) : actionType,
querySelector : rxType | pptrType | pptr_selectorType,
querySelector(selector: dataType, 
/** querySelectorAll */multiple: booleanType) : rxType | pptrType | pptr_selectorType,
querySelector(selector: dataType) : rxType | pptrType | pptr_selectorType,
xpath : rxType | pptrType | pptr_selectorType,
xpath(
/** e.g, //*[contains(text(), 'Hello')] */xpath: dataType) : rxType | pptrType | pptr_selectorType,
jsFunction : rxType | pptrType | pptr_selectorType,
jsFunction(expression: dataType) : rxType | pptrType | pptr_selectorType,
jsProperty : rxType | pptrType | pptr_selectorType,
jsProperty(propName: dataType) : rxType | pptrType | pptr_selectorType,
type : rxType | pptrType,
type(profile: { text: dataType, enterAtEnd: booleanType, 
/** time between clicks */delay: dataType}) : rxType | pptrType,
type(text: dataType) : rxType | pptrType,
closeBrowser : actionType,
closeBrowser() : actionType,
repeatingAction : pptr_actionType,
repeatingAction(action: dataType, intervalTime: dataType) : pptr_actionType,
repeatingAction(action: dataType) : pptr_actionType,
gotoInnerFrameBody : rxType | pptrType,
gotoInnerFrameBody() : rxType | pptrType,
javascriptOnPptr : rxType | pptrType,
javascriptOnPptr(func: dataType) : rxType | pptrType,
contentFrame : rxType | pptrType,
contentFrame() : rxType | pptrType,
}
declare var pptr : pptr;,type source = {
remote : rxType,
remote(rx: rxType, jbm: jbmType) : rxType,
remote(rx: rxType) : rxType,
data : rxType,
data(data: dataType) : rxType,
watchableData : rxType,
watchableData(ref: dataType, 
/** watch childern change as well */includeChildren: dataType) : rxType,
watchableData(ref: dataType) : rxType,
callbag : rxType,
callbag(
/** callbag source function */callbag: dataType) : rxType,
event : rxType,
event(profile: { event: dataType, 
/** html element */elem: dataType, 
/** addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */options: dataType}) : rxType,
event(event: dataType) : rxType,
any : rxType,
any(
/** the source is detected by its type: promise, iterable, single, callbag element, etc.. */source: dataType) : rxType,
promise : rxType,
promise(promise: dataType) : rxType,
interval : rxType,
interval(
/** time in mSec */interval: dataType) : rxType,
subject : rxType,
subject(subject: dataType) : rxType,
queue : rxType,
queue(queue: dataType) : rxType,
testsResults : rxType,
testsResults(tests: dataType, jbm: jbmType) : rxType,
testsResults(tests: dataType) : rxType,
eventIncludingPreview : rxType,
eventIncludingPreview(event: dataType) : rxType,
frontEndEvent : rxType,
frontEndEvent(event: dataType) : rxType,
findSelectionKeySource : rxType,
findSelectionKeySource() : rxType,
dragulaEvent : rx:0Type,
dragulaEvent(event: dataType, 
/** e.g., ['dropElm', 'target', 'source'] */argNames: dataType) : rx:0Type,
dragulaEvent(event: dataType) : rx:0Type,
findMenuKeySource : rxType,
findMenuKeySource(clientCmp: dataType) : rxType,
}
declare var source : source;,type remote = {
operator : rxType,
operator(rx: rxType, jbm: jbmType) : rxType,
operator(rx: rxType) : rxType,
action : actionType,
action(profile: { action: dataType, jbm: jbmType, 
/** do not wait for the respone */oneway: booleanType, timeout: dataType}) : actionType,
action(action: dataType) : actionType,
data : dataType,
data(profile: { data: dataType, jbm: jbmType, timeout: dataType}) : dataType,
data(data: dataType) : dataType,
updateShadowData : action:0Type,
updateShadowData(entry: dataType) : action:0Type,
copyPassiveData : actionType,
copyPassiveData(jbm: jbmType) : actionType,
useYellowPages : actionType,
useYellowPages() : actionType,
distributedWidget : actionType,
distributedWidget(profile: { control: controlType, backend: jbmType, frontend: jbmType, 
/** root selector to put widget in. e.g. #main */selector: dataType}) : actionType,
distributedWidget(control: controlType) : actionType,
widget : controlType,
widget(control: controlType, jbm: jbmType) : controlType,
widget(control: controlType) : controlType,
}
declare var remote : remote;,type net = {
getRootParentUri : dataType,
getRootParentUri() : dataType,
listAll : dataType,
listAll() : dataType,
}
declare var net : net;,type dataResource = {
yellowPages : dataType,
yellowPages() : dataType,
angrybirdsPosts : dataType,
angrybirdsPosts() : dataType,
}
declare var dataResource : dataResource;,type rx = {
pipe : rxType | dataType | actionType,
pipe(...elems: [rxType][]) : rxType | dataType | actionType,
merge : rxType,
merge(...sources: [rxType][]) : rxType,
innerPipe : rxType,
innerPipe(...elems: [rxType][]) : rxType,
fork : rxType,
fork(...elems: [rxType][]) : rxType,
startWith : rxType,
startWith(...sources: [rxType][]) : rxType,
var : rxType,
var(
/** if empty, does nothing */name: dataType, value: dataType) : rxType,
var(
/** if empty, does nothing */name: dataType) : rxType,
resource : rxType,
resource(
/** if empty, does nothing */name: dataType, value: dataType) : rxType,
resource(
/** if empty, does nothing */name: dataType) : rxType,
reduce : rxType,
reduce(profile: { 
/** the result is accumulated in this var */varName: dataType, 
/** receives first value as input */initialValue: dataType, 
/** the accumulated value use %$acc%,%% %$prev% */value: dataType, 
/** used for join with separators, initialValue uses the first value without adding the separtor */avoidFirst: booleanType}) : rxType,
reduce(
/** the result is accumulated in this var */varName: dataType) : rxType,
count : dataType,
count(varName: dataType) : dataType,
join : dataType,
join(varName: dataType, separator: dataType) : dataType,
join(varName: dataType) : dataType,
max : dataType,
max(varName: dataType, value: dataType) : dataType,
max(varName: dataType) : dataType,
do : rxType,
do(action: actionType) : rxType,
doPromise : rxType,
doPromise(action: actionType) : rxType,
map : rxType,
map(func: dataType) : rxType,
mapPromise : rxType,
mapPromise(func: dataType) : rxType,
filter : rxType,
filter(filter: booleanType) : rxType,
flatMap : rxType,
flatMap(
/** map each input to source callbag */source: rxType) : rxType,
flatMapArrays : rxType,
flatMapArrays(
/** should return array, items will be passed one by one */func: dataType) : rxType,
concatMap : rxType,
concatMap(
/** keeps the order of the results, can return array, promise or callbag */func: dataType, 
/** combines %$input% with the inner result %% */combineResultWithInput: dataType) : rxType,
concatMap(
/** keeps the order of the results, can return array, promise or callbag */func: dataType) : rxType,
distinctUntilChanged : rxType,
distinctUntilChanged(
/** e.g. %% == %$prev% */equalsFunc: dataType) : rxType,
catchError : rxType,
catchError() : rxType,
timeoutLimit : rxType,
timeoutLimit(
/** can be dynamic */timeout: dataType, error: dataType) : rxType,
timeoutLimit(
/** can be dynamic */timeout: dataType) : rxType,
throwError : rxType,
throwError(condition: booleanType, error: dataType) : rxType,
throwError(condition: booleanType) : rxType,
debounceTime : rxType,
debounceTime(
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the first event immediately, default is true */immediate: booleanType) : rxType,
debounceTime(
/** can be dynamic */cooldownPeriod: dataType) : rxType,
throttleTime : rxType,
throttleTime(
/** can be dynamic */cooldownPeriod: dataType, 
/** emits the last event arrived at the end of the cooldown, default is true */emitLast: booleanType) : rxType,
throttleTime(
/** can be dynamic */cooldownPeriod: dataType) : rxType,
delay : rxType,
delay(
/** can be dynamic */time: dataType) : rxType,
replay : rxType,
replay(
/** empty for unlimited */itemsToKeep: dataType) : rxType,
takeUntil : rxType,
takeUntil(
/** can be also promise or any other */notifier: rxType) : rxType,
take : rxType,
take(count: dataType) : rxType,
takeWhile : rxType,
takeWhile(whileCondition: booleanType, passtLastEvent: booleanType) : rxType,
takeWhile(whileCondition: booleanType) : rxType,
toArray : rxType,
toArray() : rxType,
last : rxType,
last() : rxType,
skip : rxType,
skip(count: dataType) : rxType,
subscribe : rxType,
subscribe(profile: { next: actionType, error: actionType, complete: actionType}) : rxType,
subscribe(next: actionType) : rxType,
log : dataType,
log(name: dataType, extra: dataType) : dataType,
log(name: dataType) : dataType,
clog : dataType,
clog(name: dataType) : dataType,
sniffer : dataType,
sniffer(name: dataType) : dataType,
subject : dataType,
subject(
/** keep pushed items for late subscription */replay: booleanType, 
/** relevant for replay, empty for unlimited */itemsToKeep: dataType) : dataType,
subject(
/** keep pushed items for late subscription */replay: booleanType) : dataType,
queue : dataType,
queue(items: dataType) : dataType,
userEventVar : rxType,
userEventVar() : rxType,
}
declare var rx : rx;,type sink = {
action : rxType,
action(action: actionType) : rxType,
data : rxType,
data(data: dataType) : rxType,
subjectNext : rxType,
subjectNext(subject: dataType) : rxType,
applyDeltaToCmp : rxType,
applyDeltaToCmp(delta: dataType, cmpId: dataType) : rxType,
applyDeltaToCmp(delta: dataType) : rxType,
BEMethod : rxType,
BEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : rxType,
BEMethod(method: dataType) : rxType,
FEMethod : rxType,
FEMethod(profile: { method: dataType, data: dataType, vars: dataType}) : rxType,
FEMethod(method: dataType) : rxType,
refreshCmp : rxType,
refreshCmp(state: dataType, options: dataType) : rxType,
refreshCmp(state: dataType) : rxType,
}
declare var sink : sink;,type stat = {
groupBy : aggregatorType,
groupBy(by: dataType, calculate: [fieldInGroupType]) : aggregatorType,
groupBy(by: dataType) : aggregatorType,
fieldInGroup : fieldInGroupType,
fieldInGroup(profile: { 
/** e.g. sum */aggregateFunc: dataType, 
/** e.g, %price% */aggregateValues: dataType, 
/** default is function name */aggregateResultField: dataType}) : fieldInGroupType,
fieldInGroup(
/** e.g. sum */aggregateFunc: dataType) : fieldInGroupType,
}
declare var stat : stat;,type test = {
showTestInStudio : controlType,
showTestInStudio(testId: dataType) : controlType,
}
declare var test : test;,type uiTest = {
vdomResultAsHtml : dataType,
vdomResultAsHtml() : dataType,
applyVdomDiff : testType,
applyVdomDiff(controlBefore: controlType, control: controlType) : testType,
applyVdomDiff(controlBefore: controlType) : testType,
}
declare var uiTest : uiTest;,type tests = {
runner : actionType,
runner(profile: { tests: dataType, jbm: jbmType, rootElemId: dataType}) : actionType,
runner(tests: dataType) : actionType,
}
declare var tests : tests;,type userInput = {
eventToRequest : rxType,
eventToRequest() : rxType,
click : user_inputType,
click(selector: dataType, methodToActivate: dataType) : user_inputType,
click(selector: dataType) : user_inputType,
setText : user_inputType,
setText(value: dataType, selector: dataType) : user_inputType,
setText(value: dataType) : user_inputType,
keyboardEvent : user_inputType,
keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : user_inputType,
keyboardEvent(selector: dataType) : user_inputType,
}
declare var userInput : userInput;,type uiAction = {
waitForSelector : actionType,
waitForSelector(selector: dataType) : actionType,
waitForCompReady : actionType,
waitForCompReady(selector: dataType) : actionType,
scrollBy : user_inputType,
scrollBy(selector: dataType, scrollBy: dataType) : user_inputType,
scrollBy(selector: dataType) : user_inputType,
setText : ui_actionType,
setText(value: dataType, selector: dataType) : ui_actionType,
setText(value: dataType) : ui_actionType,
click : ui_actionType,
click(selector: dataType) : ui_actionType,
keyboardEvent : ui_actionType,
keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType,
keyboardEvent(selector: dataType) : ui_actionType,
}
declare var uiAction : uiAction;,type animation = {
start : actionType,
start(profile: { animation: [animationType], 
/** query selector or elements, default is current control */target: dataType, 
/** alternate goes back to origin */direction: dataType, loop: booleanType, 
/** in mSec */duration: dataType}) : actionType,
timeline : actionType,
timeline(animation: [animationType], 
/** query selector, default is current control */target: dataType) : actionType,
keyframes : animationType,
keyframes(...animation: [animationType][]) : animationType,
expression : animation_valType,
expression(
/** e.g. 20 , +=10, *=2 */val: dataType) : animation_valType,
range : animation_valType,
range(
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType) : animation_valType,
range(
/** e.g. 20 */from: dataType) : animation_valType,
stagger : animation_valType,
stagger(profile: { 
/** value range */val: animation_stager_valType, 
/** Starts the stagger effect from a specific position */from: dataType, 
/** e.g. 20 */direction: dataType, easing: animation_easingType, grid: animation_stager_gridType}) : animation_valType,
stagger(
/** value range */val: animation_stager_valType) : animation_valType,
stagerGrid : animation_stager_gridType,
stagerGrid(profile: { 
/** e.g. 2 */rows: dataType, 
/** e.g. 5 */columns: dataType, 
/** direction of staggering */axis: dataType}) : animation_stager_gridType,
stagerGrid(
/** e.g. 2 */rows: dataType) : animation_stager_gridType,
stagerIncrease : animation_stager_valType,
stagerIncrease(
/** e.g. 20 */increase: dataType, 
/** optional, e.g. 10 */start: dataType) : animation_stager_valType,
stagerIncrease(
/** e.g. 20 */increase: dataType) : animation_stager_valType,
stagerRange : animation_stager_valType,
stagerRange(
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType) : animation_stager_valType,
stagerRange(
/** e.g. 20 */from: dataType) : animation_stager_valType,
direction : animationType,
direction(
/** alternate goes back to origin */direction: dataType) : animationType,
duration : animationType,
duration(
/** time of animation in mSec */duration: animation_valType) : animationType,
delay : animationType,
delay(
/** delay before animation */delay: animation_valType, 
/** delay at the end of animation */endDelay: animation_valType) : animationType,
delay(
/** delay before animation */delay: animation_valType) : animationType,
moveTo : animationType,
moveTo(profile: { 
/** e.g. 20 , +=10, *=2, list(100,200) */X: animation_valType, Y: animation_valType, Z: animation_valType}) : animationType,
moveTo(
/** e.g. 20 , +=10, *=2, list(100,200) */X: animation_valType) : animationType,
rotate : animationType,
rotate(profile: { 
/** degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270) */rotate: animation_valType, rotateX: animation_valType, rotateY: animation_valType, rotateZ: animation_valType}) : animationType,
rotate(
/** degree units, e.g. 20 , +=10, *=2, 1turn, list(20,270) */rotate: animation_valType) : animationType,
scale : animationType,
scale(profile: { 
/** e.g. 1.5 , *=2, list(2,3) */scale: animation_valType, scaleX: animation_valType, scaleY: animation_valType, scaleZ: animation_valType}) : animationType,
scale(
/** e.g. 1.5 , *=2, list(2,3) */scale: animation_valType) : animationType,
skew : animationType,
skew(profile: { 
/** e.g. 20 , +=10, *=2, list(1,2) */skew: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewX: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewY: dataType, 
/** e.g. 20 , +=10, *=2, list(1,2) */skewZ: dataType}) : animationType,
skew(
/** e.g. 20 , +=10, *=2, list(1,2) */skew: dataType) : animationType,
perspective : animationType,
perspective(
/** e.g. 100 , +=10, *=2, list(10,20) */perspective: animation_valType) : animationType,
easing : animationType,
easing(easing: animation_easingType) : animationType,
inOutEasing : animation_easingType,
inOutEasing(method: dataType, inOut: dataType) : animation_easingType,
inOutEasing(method: dataType) : animation_easingType,
elasticEasing : animation_easingType,
elasticEasing(profile: { inOut: dataType, 
/** 1-10  Controls the overshoot of the curve */amplitude: dataType, 
/** 0.1-2 Controls how many times the curve goes back and forth */period: dataType}) : animation_easingType,
elasticEasing(inOut: dataType) : animation_easingType,
springEasing : animation_easingType,
springEasing(profile: { 
/** 0-100 */mass: dataType, 
/** 0-100 */stiffness: dataType, 
/** 0-100 */damping: dataType, 
/** 0-100 */velocity: dataType}) : animation_easingType,
springEasing(
/** 0-100 */mass: dataType) : animation_easingType,
movement : animationType,
movement(to: positionType, subAnimations: [animationType]) : animationType,
movement(to: positionType) : animationType,
fixedPos : positionType,
fixedPos(top: dataType, left: dataType) : positionType,
fixedPos(top: dataType) : positionType,
}
declare var animation : animation;,type feature = {
onEvent : featureType,
onEvent(event: dataType, action: [actionType]) : featureType,
onEvent(event: dataType) : featureType,
initValue : featureType,
initValue(profile: { to: dataType, value: dataType, alsoWhenNotEmpty: booleanType}) : featureType,
initValue(to: dataType) : featureType,
requireService : dataType,
requireService(service: serviceType, condition: dataType) : dataType,
requireService(service: serviceType) : dataType,
init : feature:0Type,
init(action: actionType, 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType) : feature:0Type,
init(action: actionType) : feature:0Type,
hoverTitle : featureType,
hoverTitle(title: dataType) : featureType,
if : featureType,
if(showCondition: booleanType) : featureType,
byCondition : featureType,
byCondition(profile: { condition: booleanType, then: featureType, else: featureType}) : featureType,
byCondition(condition: booleanType) : featureType,
userEventProps : featureType,
userEventProps(
/** comma separated props to take from the original event e.g., altKey,ctrlKey */props: dataType) : featureType,
serviceRegistey : featureType,
serviceRegistey() : featureType,
onHover : featureType,
onHover(action: actionType, onLeave: actionType) : featureType,
onHover(action: actionType) : featureType,
classOnHover : featureType,
classOnHover(
/** css class to add/remove on hover */clz: stringType) : featureType,
onKey : featureType,
onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType) : featureType,
onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : featureType,
keyboardShortcut : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType,
globalKeyboardShortcut : featureType,
globalKeyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType,
globalKeyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType,
onEnter : featureType,
onEnter(action: actionType) : featureType,
onEsc : featureType,
onEsc(...action: [actionType][]) : featureType,
icon : featureType,
icon(profile: { icon: dataType, title: dataType, position: dataType, type: dataType, size: dataType, style: icon_styleType, features: [featureType]}) : featureType,
icon(icon: dataType) : featureType,
expandToEndOfRow : featureType,
expandToEndOfRow(condition: booleanType) : featureType,
mdcRippleEffect : featureType,
mdcRippleEffect() : featureType,
}
declare var feature : feature;,type frontEnd = {
var : featureType,
var(id: dataType, value: dataType) : featureType,
var(id: dataType) : featureType,
method : featureType,
method(method: dataType, action: actionType) : featureType,
method(method: dataType) : featureType,
requireExternalLibrary : featureType,
requireExternalLibrary(libs: dataType) : featureType,
enrichUserEvent : featureType,
enrichUserEvent(action: actionType) : featureType,
onRefresh : featureType,
onRefresh(action: actionType) : featureType,
init : featureType,
init(action: actionType) : featureType,
prop : featureType,
prop(id: dataType, value: dataType) : featureType,
prop(id: dataType) : featureType,
onDestroy : featureType,
onDestroy(action: actionType) : featureType,
flow : featureType,
flow(...elems: [rxType][]) : featureType,
selectionKeySourceService : featureType,
selectionKeySourceService(autoFocs: booleanType) : featureType,
passSelectionKeySource : featureType,
passSelectionKeySource() : featureType,
}
declare var frontEnd : frontEnd;,type followUp = {
action : featureType,
action(action: actionType) : featureType,
flow : featureType,
flow(...elems: [rxType][]) : featureType,
watchObservable : featureType,
watchObservable(toWatch: dataType, 
/** in mSec */debounceTime: dataType) : featureType,
watchObservable(toWatch: dataType) : featureType,
onDataChange : featureType,
onDataChange(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}) : featureType,
onDataChange(
/** reference to data */ref: dataType) : featureType,
}
declare var followUp : followUp;,type group = {
data : featureType,
data(profile: { data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: booleanType, 
/** watch childern change as well */includeChildren: dataType}) : featureType,
data(data: dataType) : featureType,
autoFocusOnFirstInput : featureType,
autoFocusOnFirstInput() : featureType,
initGroup : featureType,
initGroup() : featureType,
firstSucceeding : featureType,
firstSucceeding() : featureType,
eliminateRecursion : featureType,
eliminateRecursion(maxDepth: dataType) : featureType,
itemlistContainer : featureType,
itemlistContainer(initialSelection: dataType) : featureType,
htmlTag : group_styleType,
htmlTag(profile: { htmlTag: dataType, groupClass: dataType, itemClass: dataType}) : group_styleType,
htmlTag(htmlTag: dataType) : group_styleType,
div : group_styleType,
div() : group_styleType,
section : group_styleType,
section() : group_styleType,
ulLi : group_styleType,
ulLi() : group_styleType,
card : featureType,
card(profile: { padding: dataType, width: dataType, outlined: booleanType}) : featureType,
card(padding: dataType) : featureType,
theme : featureType,
theme(theme: themeType) : featureType,
}
declare var group : group;,type service = {
registerBackEndService : dataType,
registerBackEndService(profile: { id: dataType, service: dataType, allowOverride: booleanType}) : dataType,
registerBackEndService(id: dataType) : dataType,
}
declare var service : service;,type css = {
class : featureType | dialog_featureType,
class(class: dataType) : featureType | dialog_featureType,
width : featureType | dialog_featureType,
width(profile: { 
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType,
width(
/** e.g. 200, 100%, calc(100% - 100px) */width: dataType) : featureType | dialog_featureType,
height : featureType | dialog_featureType,
height(profile: { 
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType,
height(
/** e.g. 200, 100%, calc(100% - 100px) */height: dataType) : featureType | dialog_featureType,
opacity : featureType,
opacity(
/** 0-1 */opacity: dataType, selector: dataType) : featureType,
opacity(
/** 0-1 */opacity: dataType) : featureType,
padding : featureType | dialog_featureType,
padding(profile: { 
/** e.g. 20, 20%, 0.4em */top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType,
padding(
/** e.g. 20, 20%, 0.4em */top: dataType) : featureType | dialog_featureType,
margin : featureType | dialog_featureType,
margin(profile: { 
/** e.g. 20, 20%, 0.4em, -20 */top: dataType, left: dataType, bottom: dataType, right: dataType, selector: dataType}) : featureType | dialog_featureType,
margin(
/** e.g. 20, 20%, 0.4em, -20 */top: dataType) : featureType | dialog_featureType,
marginAllSides : featureType | dialog_featureType,
marginAllSides(
/** e.g. 20, 20%, 0.4em */value: dataType, selector: dataType) : featureType | dialog_featureType,
marginAllSides(
/** e.g. 20, 20%, 0.4em */value: dataType) : featureType | dialog_featureType,
marginVerticalHorizontal : featureType | dialog_featureType,
marginVerticalHorizontal(profile: { vertical: dataType, horizontal: dataType, selector: dataType}) : featureType | dialog_featureType,
marginVerticalHorizontal(vertical: dataType) : featureType | dialog_featureType,
transformRotate : featureType,
transformRotate(
/** 0-360 */angle: dataType, selector: dataType) : featureType,
transformRotate(
/** 0-360 */angle: dataType) : featureType,
color : featureType,
color(profile: { color: dataType, background: dataType, selector: dataType}) : featureType,
color(color: dataType) : featureType,
transformScale : featureType,
transformScale(profile: { 
/** 0-1 */x: dataType, 
/** 0-1 */y: dataType, selector: dataType}) : featureType,
transformScale(
/** 0-1 */x: dataType) : featureType,
transformTranslate : featureType,
transformTranslate(profile: { 
/** 10px */x: dataType, 
/** 20px */y: dataType, selector: dataType}) : featureType,
transformTranslate(
/** 10px */x: dataType) : featureType,
bold : featureType,
bold() : featureType,
underline : featureType,
underline() : featureType,
boxShadow : featureType | dialog_featureType,
boxShadow(profile: { 
/** the box is raised or content is depressed inside the box */inset: booleanType, 
/** bigger and lighter shadow */blurRadius: dataType, 
/** just bigger shadow */spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, 
/** offset-x */horizontal: dataType, 
/** offset-y */vertical: dataType, selector: dataType}) : featureType | dialog_featureType,
boxShadow(
/** the box is raised or content is depressed inside the box */inset: booleanType) : featureType | dialog_featureType,
border : featureType | dialog_featureType,
border(profile: { width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}) : featureType | dialog_featureType,
border(width: dataType) : featureType | dialog_featureType,
borderRadius : featureType | dialog_featureType,
borderRadius(radius: dataType, selector: dataType) : featureType | dialog_featureType,
borderRadius(radius: dataType) : featureType | dialog_featureType,
lineClamp : featureType,
lineClamp(
/** no of lines to clump */lines: dataType, selector: dataType) : featureType,
lineClamp(
/** no of lines to clump */lines: dataType) : featureType,
valueOfCssVar : dataType,
valueOfCssVar(
/** without the -- prefix */varName: dataType, 
/** html element under which to check the var, default is document.body */parent: dataType) : dataType,
valueOfCssVar(
/** without the -- prefix */varName: dataType) : dataType,
conditionalClass : featureType,
conditionalClass(cssClass: dataType, condition: booleanType) : featureType,
conditionalClass(cssClass: dataType) : featureType,
}
declare var css : css;,type d3g = {
frame : d3g_frameType,
frame(profile: { width: dataType, height: dataType, top: dataType, right: dataType, bottom: dataType, left: dataType}) : d3g_frameType,
frame(width: dataType) : d3g_frameType,
histogram : controlType,
histogram(profile: { title: dataType, items: dataType, pivot: d3g_pivotType, frame: d3g_frameType, itemTitle: dataType, ticks: dataType, axes: d3g_axesType, style: d3g_histogram_styleType, features: [d3_featureType]}) : controlType,
histogram(title: dataType) : controlType,
buttomAndLeftAxes : d3g_axesType,
buttomAndLeftAxes() : d3g_axesType,
itemIndicator : d3_featureType,
itemIndicator(item: dataType) : d3_featureType,
linearScale : d3g_scaleType,
linearScale() : d3g_scaleType,
sqrtScale : d3g_scaleType,
sqrtScale() : d3g_scaleType,
bandScale : d3g_scaleType,
bandScale(profile: { 
/** range [0,1] */paddingInner: dataType, 
/** range [0,1] */paddingOuter: dataType, 
/** 0 - aligned left, 0.5 - centered, 1 - aligned right */align: dataType}) : d3g_scaleType,
bandScale(
/** range [0,1] */paddingInner: dataType) : d3g_scaleType,
ordinalColors : d3g_scaleType,
ordinalColors(scale: dataType) : d3g_scaleType,
interpolateColors : d3g_scaleType,
interpolateColors(scale: dataType) : d3g_scaleType,
autoRange : d3g_rangeType,
autoRange() : d3g_rangeType,
fromTo : d3g_rangeType,
fromTo(from: dataType, to: dataType) : d3g_rangeType,
fromTo(from: dataType) : d3g_rangeType,
domainByValues : d3g_domainType,
domainByValues() : d3g_domainType,
}
declare var d3g : d3g;,type d3Histogram = {
init : d3_featureType,
init() : d3_featureType,
}
declare var d3Histogram : d3Histogram;,type dialog = {
buildComp : control:0Type,
buildComp(dialog: dataType) : control:0Type,
createDialogTopIfNeeded : actionType,
createDialogTopIfNeeded() : actionType,
closeAll : actionType,
closeAll() : actionType,
shownDialogs : dataType,
shownDialogs() : dataType,
default : dialog_styleType,
default() : dialog_styleType,
dialogOkCancel : dialog_styleType,
dialogOkCancel(okLabel: dataType, cancelLabel: dataType) : dialog_styleType,
dialogOkCancel(okLabel: dataType) : dialog_styleType,
popup : dialog_styleType,
popup() : dialog_styleType,
transparentPopup : dialog_styleType,
transparentPopup() : dialog_styleType,
div : dialog_styleType,
div() : dialog_styleType,
dialogTop : controlType,
dialogTop(style: dialogs_styleType) : controlType,
contextMenuPopup : dialog_styleType,
contextMenuPopup(profile: { offsetTop: dataType, rightSide: booleanType, toolbar: booleanType}) : dialog_styleType,
contextMenuPopup(offsetTop: dataType) : dialog_styleType,
}
declare var dialog : dialog;,type dialogs = {
cmpIdOfDialog : dataType,
cmpIdOfDialog(id: dataType) : dataType,
shownPopups : dataType,
shownPopups() : dataType,
changeEmitter : rxType,
changeEmitter(widgetId: dataType) : rxType,
destroyAllEmitters : actionType,
destroyAllEmitters() : actionType,
defaultStyle : dialogs_styleType,
defaultStyle() : dialogs_styleType,
}
declare var dialogs : dialogs;,type dialogFeature = {
modal : dialog_featureType,
modal() : dialog_featureType,
uniqueDialog : dialog_featureType,
uniqueDialog(id: dataType) : dialog_featureType,
dragTitle : dialog_featureType,
dragTitle(profile: { id: dataType, useSessionStorage: booleanType, selector: dataType}) : dialog_featureType,
dragTitle(id: dataType) : dialog_featureType,
nearLauncherPosition : dialog_featureType,
nearLauncherPosition(profile: { offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}) : dialog_featureType,
nearLauncherPosition(offsetLeft: dataType) : dialog_featureType,
onClose : dialog_featureType,
onClose(action: actionType) : dialog_featureType,
closeWhenClickingOutside : dialog_featureType,
closeWhenClickingOutside() : dialog_featureType,
autoFocusOnFirstInput : dialog_featureType,
autoFocusOnFirstInput(selectText: booleanType) : dialog_featureType,
cssClassOnLaunchingElement : dialog_featureType,
cssClassOnLaunchingElement() : dialog_featureType,
maxZIndexOnClick : dialog_featureType,
maxZIndexOnClick(minZIndex: dataType) : dialog_featureType,
resizer : dialog_featureType,
resizer(
/** effective element with "autoResizeInDialog" class */autoResizeInnerElement: booleanType) : dialog_featureType,
}
declare var dialogFeature : dialogFeature;,type divider = {
br : divider_styleType,
br() : divider_styleType,
vertical : divider_styleType,
vertical() : divider_styleType,
flexAutoGrow : divider_styleType,
flexAutoGrow() : divider_styleType,
}
declare var divider : divider;,type editableBoolean = {
initToggle : featureType,
initToggle() : featureType,
checkbox : editable_boolean_styleType,
checkbox() : editable_boolean_styleType,
checkboxWithLabel : editable_boolean_styleType,
checkboxWithLabel() : editable_boolean_styleType,
expandCollapseWithUnicodeChars : editable_boolean_styleType,
expandCollapseWithUnicodeChars(toExpandSign: dataType, toCollapseSign: dataType) : editable_boolean_styleType,
expandCollapseWithUnicodeChars(toExpandSign: dataType) : editable_boolean_styleType,
expandCollapse : editable_boolean_styleType,
expandCollapse() : editable_boolean_styleType,
mdcCheckBox : editable_boolean_styleType,
mdcCheckBox(width: dataType) : editable_boolean_styleType,
picklist : editable_boolean_styleType,
picklist(picklistStyle: picklist_styleType) : editable_boolean_styleType,
}
declare var editableBoolean : editableBoolean;,type editableText = {
setInputState : actionType,
setInputState(profile: { newVal: dataType, 
/** contains value and selectionStart, the action is not performed if the not in this state */assumedVal: dataType, selectionStart: dataType, cmp: dataType}) : actionType,
setInputState(newVal: dataType) : actionType,
addUserEvent : rxType,
addUserEvent() : rxType,
xButton : featureType,
xButton() : featureType,
markdown : editable_text_styleType,
markdown(simplemdeSettings: dataType, debounceTime: dataType) : editable_text_styleType,
markdown(simplemdeSettings: dataType) : editable_text_styleType,
codemirror : editable_text_styleType,
codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}) : editable_text_styleType,
codemirror(cm_settings: dataType) : editable_text_styleType,
input : editable_text_styleType,
input() : editable_text_styleType,
textarea : editable_text_styleType,
textarea(profile: { rows: dataType, cols: dataType, oneWay: booleanType}) : editable_text_styleType,
textarea(rows: dataType) : editable_text_styleType,
mdcNoLabel : editable_text_styleType,
mdcNoLabel(width: dataType) : editable_text_styleType,
mdcSearch : editable_text_styleType,
mdcSearch(width: dataType) : editable_text_styleType,
}
declare var editableText : editableText;,type field = {
databind : featureType,
databind(debounceTime: dataType, oneWay: booleanType) : featureType,
databind(debounceTime: dataType) : featureType,
onChange : featureType,
onChange(action: actionType) : featureType,
databindText : featureType,
databindText(debounceTime: dataType, oneWay: booleanType) : featureType,
databindText(debounceTime: dataType) : featureType,
title : featureType,
title(title: dataType) : featureType,
columnWidth : featureType,
columnWidth(width: dataType) : featureType,
}
declare var field : field;,type key = {
eventMatchKey : booleanType,
eventMatchKey(event: dataType, 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : booleanType,
eventMatchKey(event: dataType) : booleanType,
eventToMethod : booleanType,
eventToMethod(event: dataType, elem: dataType) : booleanType,
eventToMethod(event: dataType) : booleanType,
}
declare var key : key;,type html = {
plain : html_styleType,
plain() : html_styleType,
inIframe : html_styleType,
inIframe(width: dataType, height: dataType) : html_styleType,
inIframe(width: dataType) : html_styleType,
}
declare var html : html;,type icon = {
init : featureType,
init() : featureType,
material : icon_styleType,
material() : icon_styleType,
}
declare var icon : icon;,type image = {
widthHeight : image_resizeType,
widthHeight(
/** e.g: 100, 20% */width: dataType, 
/** e.g: 100, 20% */height: dataType) : image_resizeType,
widthHeight(
/** e.g: 100, 20% */width: dataType) : image_resizeType,
cover : image_resizeType,
cover() : image_resizeType,
fullyVisible : image_resizeType,
fullyVisible() : image_resizeType,
position : image_positionType,
position(
/** e.g. 7, 50%, right */x: dataType, 
/** e.g. 10, 50%, bottom */y: dataType) : image_positionType,
position(
/** e.g. 7, 50%, right */x: dataType) : image_positionType,
background : image_styleType,
background() : image_styleType,
img : image_styleType,
img() : image_styleType,
}
declare var image : image;,type itemlistContainer = {
filter : aggregatorType,
filter(updateCounters: booleanType) : aggregatorType,
filterField : featureType,
filterField(fieldData: dataType, filterType: filter_typeType) : featureType,
filterField(fieldData: dataType) : featureType,
}
declare var itemlistContainer : itemlistContainer;,type filterType = {
text : filter_typeType,
text(ignoreCase: booleanType) : filter_typeType,
exactMatch : filter_typeType,
exactMatch() : filter_typeType,
numeric : filter_typeType,
numeric() : filter_typeType,
}
declare var filterType : filterType;,type search = {
searchInAllProperties : search_inType,
searchInAllProperties() : search_inType,
fuse : search_inType,
fuse(profile: { 
/** List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects */keys: dataType, 
/** When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string */findAllMatches: booleanType, isCaseSensitive: booleanType, 
/** Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2) */minMatchCharLength: dataType, 
/** Whether to sort the result list, by score */shouldSort: booleanType, 
/** Determines approximately where in the text is the pattern expected to be found */location: dataType, 
/** At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything */threshold: dataType, 
/** Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch */distance: dataType}) : search_inType,
fuse(
/** List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects */keys: dataType) : search_inType,
}
declare var search : search;,type itemlist = {
orignialIndexFromSibling : data:0Type,
orignialIndexFromSibling(sibling: dataType) : data:0Type,
dragHandle : featureType,
dragHandle() : featureType,
infiniteScroll : featureType,
infiniteScroll(pageSize: dataType) : featureType,
applyDeltaOfNextPage : actionType,
applyDeltaOfNextPage(pageSize: dataType) : actionType,
deltaOfItems : dataType,
deltaOfItems() : dataType,
incrementalFromRx : featureType,
incrementalFromRx(prepend: booleanType) : featureType,
calcSlicedItems : dataType,
calcSlicedItems() : dataType,
selection : featureType,
selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, cssForSelected: dataType}) : featureType,
selection(databind: dataType) : featureType,
keyboardSelection : featureType,
keyboardSelection(autoFocus: booleanType, onEnter: actionType) : featureType,
keyboardSelection(autoFocus: booleanType) : featureType,
indexOfElem : data:0Type,
indexOfElem(elem: dataType) : data:0Type,
indexToData : data:0Type,
indexToData(index: dataType) : data:0Type,
findSelectionSource : data:0Type,
findSelectionSource() : data:0Type,
nextSelected : data:0Type,
nextSelected(diff: dataType, elementFilter: dataType) : data:0Type,
nextSelected(diff: dataType) : data:0Type,
noContainer : featureType,
noContainer() : featureType,
init : featureType,
init() : featureType,
shownOnlyOnItemHover : featureType,
shownOnlyOnItemHover() : featureType,
divider : featureType,
divider(space: dataType) : featureType,
ulLi : itemlist_styleType,
ulLi() : itemlist_styleType,
div : itemlist_styleType,
div(spacing: dataType) : itemlist_styleType,
horizontal : itemlist_styleType,
horizontal(spacing: dataType) : itemlist_styleType,
}
declare var itemlist : itemlist;,type table = {
trTd : group_styleType,
trTd() : group_styleType,
enableExpandToEndOfRow : featureType,
enableExpandToEndOfRow() : featureType,
}
declare var table : table;,type markdown = {
mark : markdown_styleType,
mark() : markdown_styleType,
}
declare var markdown : markdown;,type menu = {
menu : menu_optionType,
menu(profile: { title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}) : menu_optionType,
menu(title: dataType) : menu_optionType,
dynamicOptions : menu_optionType,
dynamicOptions(items: dataType, genericOption: menu_optionType) : menu_optionType,
dynamicOptions(items: dataType) : menu_optionType,
endWithSeparator : menu_optionType,
endWithSeparator(profile: { options: [menu_optionType], separator: menu_optionType, title: dataType}) : menu_optionType,
separator : menu_optionType,
separator() : menu_optionType,
action : menu_optionType,
action(profile: { title: dataType, action: actionType, description: dataType, icon: iconType, shortcut: dataType, showCondition: booleanType}) : menu_optionType,
action(title: dataType) : menu_optionType,
initPopupMenu : featureType,
initPopupMenu(popupStyle: dialog_styleType) : featureType,
initMenuOption : featureType,
initMenuOption() : featureType,
selectionKeySourceService : featureType,
selectionKeySourceService() : featureType,
passMenuKeySource : featureType,
passMenuKeySource() : featureType,
isRelevantMenu : dataType,
isRelevantMenu() : dataType,
notSeparator : booleanType,
notSeparator(elem: dataType) : booleanType,
}
declare var menu : menu;,type menuStyle = {
optionLine : menu_option_styleType,
optionLine() : menu_option_styleType,
popupAsOption : menu_styleType,
popupAsOption() : menu_styleType,
popupThumb : menu_styleType,
popupThumb() : menu_styleType,
toolbar : menu_styleType,
toolbar(leafOptionStyle: menu_option_styleType, itemlistStyle: itemlist_styleType) : menu_styleType,
toolbar(leafOptionStyle: menu_option_styleType) : menu_styleType,
}
declare var menuStyle : menuStyle;,type menuSeparator = {
line : menu_separator_styleType,
line() : menu_separator_styleType,
}
declare var menuSeparator : menuSeparator;,type multiSelect = {
modelAsBooleanRef : dataType,
modelAsBooleanRef(multiSelectModel: dataType, code: dataType) : dataType,
modelAsBooleanRef(multiSelectModel: dataType) : dataType,
choiceList : multiSelect_styleType,
choiceList(choiceStyle: editable_boolean_styleType, itemlistStyle: itemlist_styleType) : multiSelect_styleType,
choiceList(choiceStyle: editable_boolean_styleType) : multiSelect_styleType,
}
declare var multiSelect : multiSelect;,type studio = {
notebookElem : nb_elemType,
notebookElem(result: controlType, editor: controlType) : nb_elemType,
notebookElem(result: controlType) : nb_elemType,
}
declare var studio : studio;,type nb = {
markdown : nb_elemType,
markdown(markdown: dataType) : nb_elemType,
control : nb_elemType,
control(control: controlType) : nb_elemType,
}
declare var nb : nb;,type picklist = {
init : featureType,
init() : featureType,
onChange : featureType,
onChange(action: actionType) : featureType,
optionsByComma : picklist_optionsType,
optionsByComma(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType,
optionsByComma(options: dataType) : picklist_optionsType,
options : picklist_optionsType,
options(profile: { options: dataType, code: dataType, text: dataType, icon: iconType, allowEmptyValue: booleanType}) : picklist_optionsType,
options(options: dataType) : picklist_optionsType,
sortedOptions : picklist_optionsType,
sortedOptions(options: picklist_optionsType, 
/** e.g input:80,group:90. 0 mark means hidden. no mark means 50 */marks: dataType) : picklist_optionsType,
sortedOptions(options: picklist_optionsType) : picklist_optionsType,
promote : picklist_promoteType,
promote(groups: dataType, options: dataType) : picklist_promoteType,
promote(groups: dataType) : picklist_promoteType,
initGroups : featureType,
initGroups() : featureType,
native : picklist_styleType,
native() : picklist_styleType,
nativePlus : picklist_styleType,
nativePlus() : picklist_styleType,
nativeMdLookOpen : picklist_styleType,
nativeMdLookOpen() : picklist_styleType,
plusIcon : featureType,
plusIcon() : featureType,
radio : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType,
mdcRadio : picklist_styleType,
mdcRadio(text: dataType) : picklist_styleType,
radioVertical : picklist_styleType,
radioVertical() : picklist_styleType,
mdcSelect : picklist_styleType,
mdcSelect(profile: { width: dataType, noLabel: booleanType, noRipple: booleanType}) : picklist_styleType,
mdcSelect(width: dataType) : picklist_styleType,
labelList : picklist_styleType,
labelList(profile: { labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType,
labelList(labelStyle: text_styleType) : picklist_styleType,
groups : picklist_styleType,
groups() : picklist_styleType,
}
declare var picklist : picklist;,type widget = {
frontEndCtrl : controlType,
frontEndCtrl(widgetId: dataType) : controlType,
newId : dataType,
newId(jbm: jbmType) : dataType,
headless : rxType,
headless(control: controlType, widgetId: dataType) : rxType,
headless(control: controlType) : rxType,
headlessWidgets : dataType,
headlessWidgets() : dataType,
}
declare var widget : widget;,type slider = {
init : featureType,
init() : featureType,
drag : featureType,
drag() : featureType,
}
declare var slider : slider;,type codemirror = {
textEditorKeys : featureType,
textEditorKeys() : featureType,
fold : featureType,
fold() : featureType,
lineNumbers : featureType,
lineNumbers() : featureType,
}
declare var codemirror : codemirror;,type text = {
codemirror : text_styleType,
codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, height: dataType, lineWrapping: booleanType, lineNumbers: booleanType, formatText: booleanType, mode: dataType}) : text_styleType,
codemirror(cm_settings: dataType) : text_styleType,
htmlTag : text_styleType,
htmlTag(htmlTag: dataType, cssClass: dataType) : text_styleType,
htmlTag(htmlTag: dataType) : text_styleType,
noWrappingTag : text_styleType,
noWrappingTag() : text_styleType,
span : text_styleType,
span() : text_styleType,
chip : text_styleType,
chip() : text_styleType,
alignToBottom : text_styleType,
alignToBottom() : text_styleType,
h2WithClass : text_style:0Type,
h2WithClass(clz: dataType) : text_style:0Type,
bindText : featureType,
bindText() : featureType,
allowAsynchValue : featureType,
allowAsynchValue(propId: dataType, waitingValue: dataType) : featureType,
allowAsynchValue(propId: dataType) : featureType,
highlight : dataType,
highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType,
highlight(base: dataType) : dataType,
}
declare var text : text;,type layout = {
vertical : layoutType | featureType,
vertical(spacing: dataType) : layoutType | featureType,
horizontal : layoutType | featureType,
horizontal(spacing: dataType) : layoutType | featureType,
horizontalFixedSplit : layoutType | featureType,
horizontalFixedSplit(profile: { leftWidth: dataType, rightWidth: dataType, spacing: dataType}) : layoutType | featureType,
horizontalFixedSplit(leftWidth: dataType) : layoutType | featureType,
horizontalWrapped : layoutType | featureType,
horizontalWrapped(spacing: dataType) : layoutType | featureType,
flex : layoutType | featureType,
flex(profile: { direction: dataType, justifyContent: dataType, alignItems: dataType, wrap: dataType, spacing: dataType}) : layoutType | featureType,
flex(direction: dataType) : layoutType | featureType,
grid : layoutType | featureType,
grid(profile: { 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}) : layoutType | featureType,
grid(
/** grid-template-columns, list of lengths */columnSizes: dataType) : layoutType | featureType,
}
declare var layout : layout;,type flexItem = {
grow : featureType,
grow(factor: dataType) : featureType,
basis : featureType,
basis(factor: dataType) : featureType,
alignSelf : featureType,
alignSelf(align: dataType) : featureType,
}
declare var flexItem : flexItem;,type mdcStyle = {
initDynamic : featureType,
initDynamic(query: dataType) : featureType,
}
declare var mdcStyle : mdcStyle;,type label = {
mdcRippleEffect : text_styleType,
mdcRippleEffect() : text_styleType,
}
declare var label : label;,type propertySheet = {
titlesLeft : group_styleType,
titlesLeft(profile: { titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType,
titlesLeft(titleStyle: text_styleType) : group_styleType,
titlesAbove : group_styleType,
titlesAbove(profile: { titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType,
titlesAbove(titleStyle: text_styleType) : group_styleType,
}
declare var propertySheet : propertySheet;,type header = {
mdcHeaderWithIcon : text_styleType,
mdcHeaderWithIcon(level: dataType) : text_styleType,
}
declare var header : header;,type theme = {
materialDesign : themeType,
materialDesign() : themeType,
}
declare var theme : theme;,type tree = {
jsonReadOnly : tree_node_modelType,
jsonReadOnly(object: dataType, rootPath: dataType) : tree_node_modelType,
jsonReadOnly(object: dataType) : tree_node_modelType,
json : tree_node_modelType,
json(object: dataType, rootPath: dataType) : tree_node_modelType,
json(object: dataType) : tree_node_modelType,
modelFilter : tree_node_modelType,
modelFilter(model: tree_node_modelType, 
/** input is path. e.g abc */pathFilter: booleanType) : tree_node_modelType,
modelFilter(model: tree_node_modelType) : tree_node_modelType,
noHead : featureType,
noHead() : featureType,
initTree : featureType,
initTree() : featureType,
expandPath : featureType,
expandPath(paths: dataType) : featureType,
plain : tree_styleType,
plain(showIcon: booleanType) : tree_styleType,
expandBox : tree_styleType,
expandBox(showIcon: booleanType, lineWidth: dataType) : tree_styleType,
expandBox(showIcon: booleanType) : tree_styleType,
selection : featureType,
selection(profile: { databind: dataType, onSelection: actionType, onRightClick: actionType, autoSelectFirst: booleanType}) : featureType,
selection(databind: dataType) : featureType,
keyboardSelection : featureType,
keyboardSelection(profile: { onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}) : featureType,
keyboardSelection(onKeyboardSelection: actionType) : featureType,
dragAndDrop : featureType,
dragAndDrop() : featureType,
nextSelected : data:0Type,
nextSelected(diff: dataType) : data:0Type,
pathOfInteractiveItem : dataType,
pathOfInteractiveItem() : dataType,
pathOfElem : data:0Type,
pathOfElem(elem: dataType) : data:0Type,
parentPath : dataType,
parentPath(path: dataType) : dataType,
lastPathElement : dataType,
lastPathElement(path: dataType) : dataType,
sameParent : booleanType,
sameParent(path1: dataType, path2: dataType) : booleanType,
sameParent(path1: dataType) : booleanType,
regainFocus : actionType,
regainFocus() : actionType,
redraw : actionType,
redraw(strong: booleanType) : actionType,
moveItem : actionType,
moveItem(from: dataType, to: dataType) : actionType,
moveItem(from: dataType) : actionType,
}
declare var tree : tree;,type tableTree = {
expandFirstLevel : featureType,
expandFirstLevel() : featureType,
plain : table_tree_styleType,
plain(profile: { hideHeaders: booleanType, gapWidth: dataType, expColWidth: dataType, noItemsCtrl: controlType}) : table_tree_styleType,
plain(hideHeaders: booleanType) : table_tree_styleType,
expandPath : featureType,
expandPath(paths: dataType) : featureType,
resizer : featureType,
resizer() : featureType,
dragAndDrop : featureType,
dragAndDrop() : featureType,
}
declare var tableTree : tableTree;,type urlHistory = {
mapUrlToResource : actionType,
mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType,
}
declare var urlHistory : urlHistory;,type vega = {
interactiveChart : controlType,
interactiveChart(spec: vega_specType, showSpec: booleanType) : controlType,
interactiveChart(spec: vega_specType) : controlType,
spec : vega_specType,
spec(profile: { data: vega_dataType, transform: [vega_transformType], mark: vega_markType, encoding: vega_encodingType, name: dataType, title: dataType, description: dataType}) : vega_specType,
spec(data: vega_dataType) : vega_specType,
dataFromUrl : vega_dataType,
dataFromUrl(profile: { url: dataType, name: dataType, format: dataType}) : vega_dataType,
dataFromUrl(url: dataType) : vega_dataType,
jbData : vega_dataType,
jbData(items: dataType) : vega_dataType,
namedData : vega_dataType,
namedData(name: dataType) : vega_dataType,
aggregate : vega_transformType,
aggregate(pipe: [vega_aggPipeElemType], groupby: dataType) : vega_transformType,
aggPipeElem : vega_aggPipeElemType,
aggPipeElem(profile: { op: dataType, field: dataType, as: dataType}) : vega_aggPipeElemType,
aggPipeElem(op: dataType) : vega_aggPipeElemType,
calculate : vega_transformType,
calculate(
/** e.g: datum.x*2 */expression: dataType, as: dataType) : vega_transformType,
calculate(
/** e.g: datum.x*2 */expression: dataType) : vega_transformType,
filter : vega_transformType,
filter(filter: vega_booleanType) : vega_transformType,
filterExpression : vega_booleanType,
filterExpression(
/** e.g: datum.x>2 */filter: dataType) : vega_booleanType,
inSelection : vega_booleanType,
inSelection(selection: dataType) : vega_booleanType,
line : vega_markType,
line(showPoints: booleanType, props: [vega_markPropsType]) : vega_markType,
line(showPoints: booleanType) : vega_markType,
generalMarkProps : vega_markPropsType,
generalMarkProps(profile: { aria: dataType, description: dataType, style: dataType, tooltip: dataType}) : vega_markPropsType,
generalMarkProps(aria: dataType) : vega_markPropsType,
positionMarkProps : vega_markPropsType,
positionMarkProps(profile: { x: dataType, x2: dataType, width: dataType, height: dataType, y: dataType, y2: dataType}) : vega_markPropsType,
positionMarkProps(x: dataType) : vega_markPropsType,
positionChannels : vega_encodingType,
positionChannels(profile: { x: vega_channelType, y: vega_channelType, color: vega_channelType}) : vega_encodingType,
positionChannels(x: vega_channelType) : vega_encodingType,
channel : vega_channelType,
channel(profile: { field: dataType, type: dataType, title: dataType}) : vega_channelType,
channel(field: dataType) : vega_channelType,
}
declare var vega : vega;,type winUtils = {
gotoUrl : actionType,
gotoUrl(url: dataType, target: enumType) : actionType,
gotoUrl(url: dataType) : actionType,
}
declare var winUtils : winUtils;