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
type callPT = {$: 'call', param: dataType}

// type data
type dataType = pipelinePT | pipePT | data_ifPT | listPT | firstSucceedingPT | keysPT | propertiesPT | entriesPT | evalExpressionPT | prefixPT | suffixPT | removePrefixPT | removeSuffixPT | removeSuffixRegexPT | propertyPT | indexOfPT | objPT | extendPT | assignPT | IfPT | toUpperCasePT | toLowerCasePT | capitalizePT | logPT | asIsPT | objectPT | json_stringifyPT | json_parsePT | splitPT | replacePT | delayPT | extractPrefixPT | extractSuffixPT | rangePT | typeOfPT | classNamePT | http_getPT | http_fetchPT | isRefPT | asRefPT | data_switchPT | formatDatePT | jison_parsePT | extractTextPT | breakTextPT | zipArraysPT | removeSectionsPT | mergePT | dynamicObjectPT | filterEmptyPropertiesPT | trimPT | removePrefixRegexPT | prettyPrintPT | fs_readFilePT | fs_statPT | fs_readdirPT | fs_directoryContentPT | test_dialogContentPT | dataResource_angrybirdsPostsPT | customStylePT | styleByControlPT | styleWithFeaturesPT | multiSelect_modelAsBooleanRefPT | text_highlightPT | json_pathSelectorPT | tree_pathOfInteractiveItemPT | watchableAsTextPT | textEditor_isDirtyPT | ((ctx: ctx) => any)
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
type logPT = {$: 'log', obj: dataType}
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
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type isRefPT = {$: 'isRef', obj: dataType}
type asRefPT = {$: 'asRef', obj: dataType}
type data_switchPT = {$: 'data.switch', cases: [data_switch_caseType], default: dataType}
type formatDatePT = {$: 'formatDate', 
/** Date value */date: dataType, dateStyle: dataType, timeStyle: dataType, weekday: dataType, year: dataType, month: dataType, day: dataType, hour: dataType, minute: dataType, second: dataType, timeZoneName: dataType}
type jison_parsePT = {$: 'jison.parse', parser: jison_parserType, goal: dataType, text: dataType, debug: booleanType}
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
type removePrefixRegexPT = {$: 'removePrefixRegex', prefix: dataType, text: dataType}
type prettyPrintPT = {$: 'prettyPrint', profile: dataType, forceFlat: booleanType}
type fs_readFilePT = {$: 'fs.readFile', fileName: dataType, directory: dataType}
type fs_statPT = {$: 'fs.stat', fileName: dataType, directory: dataType}
type fs_readdirPT = {$: 'fs.readdir', directory: dataType}
type fs_directoryContentPT = {$: 'fs.directoryContent', directory: dataType, filter: booleanType}
type test_dialogContentPT = {$: 'test.dialogContent', id: dataType}
type dataResource_angrybirdsPostsPT = {$: 'dataResource.angrybirdsPosts', }
type customStylePT = {$: 'customStyle', template: dataType, css: dataType, features: [featureType]}
type styleByControlPT = {$: 'styleByControl', control: controlType, modelVar: dataType}
type styleWithFeaturesPT = {$: 'styleWithFeatures', style: $asParentType, features: [featureType]}
type multiSelect_modelAsBooleanRefPT = {$: 'multiSelect.modelAsBooleanRef', multiSelectModel: dataType, code: dataType}
type text_highlightPT = {$: 'text.highlight', base: dataType, highlight: dataType, cssClass: dataType}
type json_pathSelectorPT = {$: 'json.pathSelector', 
/** object to start with */base: dataType, 
/** string with  separator or array */path: dataType}
type tree_pathOfInteractiveItemPT = {$: 'tree.pathOfInteractiveItem', }
type watchableAsTextPT = {$: 'watchableAsText', ref: dataType, oneWay: booleanType}
type textEditor_isDirtyPT = {$: 'textEditor.isDirty', }

// type aggregator
type aggregatorType = aggregatePT | math_maxPT | math_minPT | math_sumPT | slicePT | sortPT | firstPT | lastPT | countPT | reversePT | samplePT | extendWithIndexPT | pipeline_varPT | filterPT | joinPT | uniquePT | wrapAsObjectPT | itemlistContainer_filterPT | ((ctx: ctx) => any)
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
type itemlistContainer_filterPT = {$: 'itemlistContainer.filter', updateCounters: booleanType}

// type boolean
type booleanType = notPT | andPT | orPT | betweenPT | containsPT | notContainsPT | startsWithPT | endsWithPT | matchRegexPT | isNullPT | isEmptyPT | notEmptyPT | equalsPT | notEqualsPT | isOfTypePT | inGroupPT | itemlistContainer_conditionFilterPT | ((ctx: ctx) => any)
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
type isEmptyPT = {$: 'isEmpty', item: dataType}
type notEmptyPT = {$: 'notEmpty', item: dataType}
type equalsPT = {$: 'equals', item1: dataType, item2: dataType}
type notEqualsPT = {$: 'notEquals', item1: dataType, item2: dataType}
type isOfTypePT = {$: 'isOfType', 
/** e.g., string,boolean,array */type: dataType, obj: dataType}
type inGroupPT = {$: 'inGroup', group: dataType, item: dataType}
type itemlistContainer_conditionFilterPT = {$: 'itemlistContainer.conditionFilter', }

// type action
type actionType = action_ifPT | jbRunPT | writeValuePT | addToArrayPT | splicePT | removeFromArrayPT | toggleBooleanValuePT | touchPT | runActionsPT | runActionOnItemsPT | delayPT | onNextTimerPT | http_getPT | http_fetchPT | action_switchPT | writeValueAsynchPT | animation_startPT | animation_timelinePT | refreshControlByIdPT | focusOnFirstElementPT | dialog_closeContainingPopupPT | dialog_closeDialogPT | dialog_closeAllPT | tree_regainFocusPT | tree_redrawPT | tree_expandPathPT | urlHistory_mapUrlToResourcePT | textEditor_withCursorPathPT | runTransactionPT | gotoUrlPT | ((ctx: ctx) => any)
type cmp_def_actionType = {
	type: 'action',
	params?: [param],
	impl: actionType,
}
type action_ifPT = {$: 'action.if', condition: booleanType, then: actionType, else: actionType}
type jbRunPT = {$: 'jbRun', 
/** profile name */profile: dataType, params: dataType}
type writeValuePT = {$: 'writeValue', to: dataType, value: dataType}
type addToArrayPT = {$: 'addToArray', array: dataType, toAdd: dataType}
type splicePT = {$: 'splice', array: dataType, fromIndex: dataType, noOfItemsToRemove: dataType, itemsToAdd: dataType}
type removeFromArrayPT = {$: 'removeFromArray', array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}
type toggleBooleanValuePT = {$: 'toggleBooleanValue', of: dataType}
type touchPT = {$: 'touch', data: dataType}
type runActionsPT = {$: 'runActions', actions: [actionType]}
type runActionOnItemsPT = {$: 'runActionOnItems', items: dataType, action: actionType, 
/** notification for watch-ref, default behavior is after each action */notifications: dataType, indexVariable: dataType}
type delayPT = {$: 'delay', mSec: dataType}
type onNextTimerPT = {$: 'onNextTimer', action: actionType, delay: numberType}
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type action_switchPT = {$: 'action.switch', cases: [action_switch_caseType], defaultAction: actionType}
type writeValueAsynchPT = {$: 'writeValueAsynch', to: dataType, value: dataType}
type animation_startPT = {$: 'animation.start', animation: [animationType], 
/** query selector or elements, default is current control */target: dataType, 
/** alternate goes back to origin */direction: dataType, loop: booleanType, 
/** in mSec */duration: dataType}
type animation_timelinePT = {$: 'animation.timeline', animation: [animationType], 
/** query selector, default is current control */target: dataType}
type refreshControlByIdPT = {$: 'refreshControlById', id: dataType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType}
type focusOnFirstElementPT = {$: 'focusOnFirstElement', selector: dataType}
type dialog_closeContainingPopupPT = {$: 'dialog.closeContainingPopup', OK: booleanType}
type dialog_closeDialogPT = {$: 'dialog.closeDialog', id: dataType, delay: dataType}
type dialog_closeAllPT = {$: 'dialog.closeAll', }
type tree_regainFocusPT = {$: 'tree.regainFocus', }
type tree_redrawPT = {$: 'tree.redraw', strong: booleanType}
type tree_expandPathPT = {$: 'tree.expandPath', paths: dataType}
type urlHistory_mapUrlToResourcePT = {$: 'urlHistory.mapUrlToResource', params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}
type textEditor_withCursorPathPT = {$: 'textEditor.withCursorPath', action: actionType, selector: dataType}
type runTransactionPT = {$: 'runTransaction', actions: [actionType], disableNotifications: booleanType}
type gotoUrlPT = {$: 'gotoUrl', url: dataType, target: enumType}

// type prop
type propType = propPT | refPropPT | ((ctx: ctx) => any)
type cmp_def_propType = {
	type: 'prop',
	params?: [param],
	impl: propType,
}
type propPT = {$: 'prop', title: dataType, val: dataType, type: dataType}
type refPropPT = {$: 'refProp', title: dataType, val: dataType}

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

// type jison.parser
type jison_parserType = jison_parserPT | ((ctx: ctx) => any)
type cmp_def_jison_parserType = {
	type: 'jison_parser',
	params?: [param],
	impl: jison_parserType,
}
type jison_parserPT = {$: 'jison.parser', lex: [lexer_ruleType], bnf: [bnf_expressionType], 
/** [["left", "+", "-"]] */operators: [dataType]}

// type lexer-rule
type lexer_ruleType = lexer_tokensPT | lexer_ignoreWhiteSpacePT | lexer_numberPT | lexer_identifierPT | lexer_EOFPT | lexerRulePT | ((ctx: ctx) => any)
type cmp_def_lexer_ruleType = {
	type: 'lexer_rule',
	params?: [param],
	impl: lexer_ruleType,
}
type lexer_tokensPT = {$: 'lexer.tokens', 
/** e.g. -,+,*,%,for,== */tokens: dataType}
type lexer_ignoreWhiteSpacePT = {$: 'lexer.ignoreWhiteSpace', }
type lexer_numberPT = {$: 'lexer.number', }
type lexer_identifierPT = {$: 'lexer.identifier', regex: dataType}
type lexer_EOFPT = {$: 'lexer.EOF', }
type lexerRulePT = {$: 'lexerRule', 
/** [a-f0-9]+ */regex: dataType, 
/** return 'Hex'; */result: dataType}

// type bnf-expression
type bnf_expressionType = bnfExpressionPT | ((ctx: ctx) => any)
type cmp_def_bnf_expressionType = {
	type: 'bnf_expression',
	params?: [param],
	impl: bnf_expressionType,
}
type bnfExpressionPT = {$: 'bnfExpression', id: dataType, options: [expression_optionType]}

// type expression-option
type expression_optionType = expressionOptionPT | ((ctx: ctx) => any)
type cmp_def_expression_optionType = {
	type: 'expression_option',
	params?: [param],
	impl: expression_optionType,
}
type expressionOptionPT = {$: 'expressionOption', 
/** e + e */syntax: dataType, 
/** $$ = $1 + $2; */calculate: dataType}

// type test
type testType = dataTestPT | uiTestPT | uiTest_applyVdomDiffPT | ((ctx: ctx) => any)
type cmp_def_testType = {
	type: 'test',
	params?: [param],
	impl: testType,
}
type dataTestPT = {$: 'dataTest', calculate: dataType, runBefore: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType}
type uiTestPT = {$: 'uiTest', control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType, renderDOM: booleanType, runInPreview: actionType, runInStudio: actionType}
type uiTest_applyVdomDiffPT = {$: 'uiTest.applyVdomDiff', controlBefore: controlType, control: controlType}

// type control
type controlType = uiTestRunnerPT | cardPT | cardFilterPT | cardListPT | controlWithFeaturesPT | d3g_histogramPT | dividerPT | groupPT | inlineControlsPT | dynamicControlsPT | controlWithConditionPT | itemlistContainer_searchPT | itemlistPT | markdownPT | sidenavPT | textPT | treePT | remote_initMainWorkerPT | remote_widgetPT | ((ctx: ctx) => any)
type cmp_def_controlType = {
	type: 'control',
	params?: [param],
	impl: controlType,
}
type uiTestRunnerPT = {$: 'uiTestRunner', test: dataType}
type cardPT = {$: 'card', data: dataType, style: card_styleType, adapter: dataType}
type cardFilterPT = {$: 'cardFilter', data: dataType, style: card_filter_styleType}
type cardListPT = {$: 'cardList', data: dataType, style: card_list_styleType, adapter: dataType}
type controlWithFeaturesPT = {$: 'controlWithFeatures', control: controlType, features: [featureType]}
type d3g_histogramPT = {$: 'd3g.histogram', title: dataType, items: dataType, pivot: d3g_pivotType, frame: d3g_frameType, itemTitle: dataType, ticks: dataType, axes: d3g_axesType, style: d3g_histogram_styleType, features: [d3_featureType]}
type dividerPT = {$: 'divider', style: divider_styleType, title: dataType, features: [featureType]}
type groupPT = {$: 'group', title: dataType, layout: layoutType, style: group_styleType, controls: [controlType], features: [featureType]}
type inlineControlsPT = {$: 'inlineControls', controls: [controlType]}
type dynamicControlsPT = {$: 'dynamicControls', controlItems: dataType, genericControl: controlType, itemVariable: dataType, indexVariable: dataType}
type controlWithConditionPT = {$: 'controlWithCondition', condition: booleanType, control: controlType, title: dataType}
type itemlistContainer_searchPT = {$: 'itemlistContainer.search', title: dataType, searchIn: search_inType, databind: dataType, style: editable_text_styleType, features: [featureType]}
type itemlistPT = {$: 'itemlist', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, layout: layoutType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}
type markdownPT = {$: 'markdown', markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}
type sidenavPT = {$: 'sidenav', controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}
type textPT = {$: 'text', text: dataType, title: dataType, style: text_styleType, features: [featureType]}
type treePT = {$: 'tree', nodeModel: tree_node_modelType, style: tree_styleType, features: [featureType]}
type remote_initMainWorkerPT = {$: 'remote.initMainWorker', sourceUrl: dataType, remote: remoteType}
type remote_widgetPT = {$: 'remote.widget', 
/** main profile to run */main: dataType, id: dataType, remote: remoteType}

// type ui-action
type ui_actionType = uiAction_clickPT | uiAction_keyboardEventPT | uiAction_setTextPT | uiAction_scrollDownPT | ((ctx: ctx) => any)
type cmp_def_ui_actionType = {
	type: 'ui_action',
	params?: [param],
	impl: ui_actionType,
}
type uiAction_clickPT = {$: 'uiAction.click', selector: dataType, methodToActivate: dataType}
type uiAction_keyboardEventPT = {$: 'uiAction.keyboardEvent', selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}
type uiAction_setTextPT = {$: 'uiAction.setText', value: dataType, selector: dataType}
type uiAction_scrollDownPT = {$: 'uiAction.scrollDown', selector: dataType}

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
type featureType = defHandlerPT | watchAndCalcModelPropPT | calcPropPT | interactivePropPT | calcPropsPT | feature_initPT | feature_destroyPT | feature_beforeInitPT | feature_afterLoadPT | interactivePT | templateModifierPT | featuresPT | watchRefPT | watchObservablePT | feature_onDataChangePT | group_dataPT | htmlAttributePT | idPT | feature_hoverTitlePT | variablePT | calculatedVarPT | feature_ifPT | hiddenPT | conditionalClassPT | feature_keyboardShortcutPT | feature_onEventPT | feature_onHoverPT | feature_classOnHoverPT | feature_onKeyPT | feature_onEnterPT | feature_onEscPT | group_autoFocusOnFirstInputPT | feature_byConditionPT | cssPT | css_classPT | css_widthPT | css_heightPT | css_opacityPT | css_paddingPT | css_marginPT | css_marginAllSidesPT | css_marginVerticalHorizontalPT | css_transformRotatePT | css_colorPT | css_transformScalePT | css_transformTranslatePT | css_boldPT | css_underlinePT | css_boxShadowPT | css_borderPT | css_borderRadiusPT | css_lineClampPT | editableText_xButtonPT | editableText_helperPopupPT | field_databindPT | field_onChangePT | field_databindTextPT | field_keyboardShortcutPT | field_toolbarPT | validationPT | field_titlePT | field_columnWidthPT | group_initGroupPT | group_firstSucceedingPT | feature_iconPT | group_itemlistContainerPT | itemlist_itemlistSelectedPT | itemlistContainer_filterFieldPT | itemlist_noContainerPT | itemlist_initContainerWithItemsPT | itemlist_initPT | itemlist_initTablePT | itemlist_infiniteScrollPT | itemlist_fastFilterPT | itemlist_selectionPT | itemlist_keyboardSelectionPT | itemlist_dragAndDropPT | itemlist_dragHandlePT | itemlist_shownOnlyOnItemHoverPT | itemlist_dividerPT | menu_initPopupMenuPT | menu_initMenuOptionPT | picklist_initPT | picklist_initGroupsPT | picklist_dynamicOptionsPT | picklist_onChangePT | slider_initJbModelWithUnitsPT | slider_initPT | slider_checkAutoScalePT | slider_handleArrowKeysPT | group_cardPT | layout_verticalPT | layout_horizontalPT | layout_horizontalFixedSplitPT | layout_horizontalWrappedPT | layout_flexPT | layout_gridPT | flexItem_growPT | flexItem_basisPT | flexItem_alignSelfPT | mdcStyle_initDynamicPT | mdc_rippleEffectPT | picklist_plusIconPT | table_initTableOrItemlistPT | table_initPT | table_initSortPT | text_bindTextPT | text_allowAsynchValuePT | group_themePT | tree_selectionPT | tree_keyboardSelectionPT | tree_dragAndDropPT | ((ctx: ctx) => any)
type cmp_def_featureType = {
	type: 'feature',
	params?: [param],
	impl: featureType,
}
type defHandlerPT = {$: 'defHandler', 
/** to be used in html, e.g. onclick="clicked"  */id: dataType, action: [actionType]}
type watchAndCalcModelPropPT = {$: 'watchAndCalcModelProp', prop: dataType, transformValue: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType}
type calcPropPT = {$: 'calcProp', id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}
type interactivePropPT = {$: 'interactiveProp', id: dataType, value: dataType}
type calcPropsPT = {$: 'calcProps', 
/** props as object */props: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}
type feature_initPT = {$: 'feature.init', action: [actionType], 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType}
type feature_destroyPT = {$: 'feature.destroy', action: [actionType]}
type feature_beforeInitPT = {$: 'feature.beforeInit', action: [actionType]}
type feature_afterLoadPT = {$: 'feature.afterLoad', action: [actionType]}
type interactivePT = {$: 'interactive', action: [actionType]}
type templateModifierPT = {$: 'templateModifier', value: dataType}
type featuresPT = {$: 'features', features: [featureType]}
type watchRefPT = {$: 'watchRef', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType, 
/** controls the order of updates on the same event. default is 0 */phase: dataType}
type watchObservablePT = {$: 'watchObservable', toWatch: dataType, 
/** in mSec */debounceTime: dataType}
type feature_onDataChangePT = {$: 'feature.onDataChange', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}
type group_dataPT = {$: 'group.data', data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: booleanType, 
/** watch childern change as well */includeChildren: dataType}
type htmlAttributePT = {$: 'htmlAttribute', attribute: dataType, value: dataType}
type idPT = {$: 'id', id: dataType}
type feature_hoverTitlePT = {$: 'feature.hoverTitle', title: dataType}
type variablePT = {$: 'variable', name: dataType, value: dataType, 
/** E.g., selected item variable */watchable: booleanType}
type calculatedVarPT = {$: 'calculatedVar', name: dataType, value: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}
type feature_ifPT = {$: 'feature.if', showCondition: booleanType}
type hiddenPT = {$: 'hidden', showCondition: booleanType}
type conditionalClassPT = {$: 'conditionalClass', cssClass: dataType, condition: booleanType}
type feature_keyboardShortcutPT = {$: 'feature.keyboardShortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type feature_onEventPT = {$: 'feature.onEvent', event: dataType, action: [actionType], 
/** used for mouse events such as mousemove */debounceTime: dataType}
type feature_onHoverPT = {$: 'feature.onHover', action: [actionType], onLeave: [actionType], debounceTime: dataType}
type feature_classOnHoverPT = {$: 'feature.classOnHover', 
/** css class to add/remove on hover */class: stringType}
type feature_onKeyPT = {$: 'feature.onKey', 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType, doNotWrapWithLauchingElement: booleanType}
type feature_onEnterPT = {$: 'feature.onEnter', action: [actionType]}
type feature_onEscPT = {$: 'feature.onEsc', action: [actionType]}
type group_autoFocusOnFirstInputPT = {$: 'group.autoFocusOnFirstInput', }
type feature_byConditionPT = {$: 'feature.byCondition', condition: booleanType, then: featureType, else: featureType}
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
type css_boxShadowPT = {$: 'css.boxShadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type css_borderRadiusPT = {$: 'css.borderRadius', radius: dataType, selector: dataType}
type css_lineClampPT = {$: 'css.lineClamp', 
/** no of lines to clump */lines: dataType, selector: dataType}
type editableText_xButtonPT = {$: 'editableText.xButton', }
type editableText_helperPopupPT = {$: 'editableText.helperPopup', control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: booleanType, autoOpen: booleanType, onEnter: actionType, onEsc: actionType}
type field_databindPT = {$: 'field.databind', debounceTime: dataType, oneWay: booleanType}
type field_onChangePT = {$: 'field.onChange', action: actionType}
type field_databindTextPT = {$: 'field.databindText', debounceTime: dataType, oneWay: booleanType}
type field_keyboardShortcutPT = {$: 'field.keyboardShortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type field_toolbarPT = {$: 'field.toolbar', toolbar: controlType}
type validationPT = {$: 'validation', validCondition: booleanType, errorMessage: dataType}
type field_titlePT = {$: 'field.title', title: dataType}
type field_columnWidthPT = {$: 'field.columnWidth', width: dataType}
type group_initGroupPT = {$: 'group.initGroup', }
type group_firstSucceedingPT = {$: 'group.firstSucceeding', }
type feature_iconPT = {$: 'feature.icon', icon: dataType, title: dataType, position: dataType, type: dataType, size: dataType, style: icon_styleType, features: [featureType]}
type group_itemlistContainerPT = {$: 'group.itemlistContainer', id: dataType, defaultItem: dataType, initialSelection: dataType}
type itemlist_itemlistSelectedPT = {$: 'itemlist.itemlistSelected', }
type itemlistContainer_filterFieldPT = {$: 'itemlistContainer.filterField', fieldData: dataType, filterType: filter_typeType}
type itemlist_noContainerPT = {$: 'itemlist.noContainer', }
type itemlist_initContainerWithItemsPT = {$: 'itemlist.initContainerWithItems', }
type itemlist_initPT = {$: 'itemlist.init', }
type itemlist_initTablePT = {$: 'itemlist.initTable', }
type itemlist_infiniteScrollPT = {$: 'itemlist.infiniteScroll', pageSize: dataType}
type itemlist_fastFilterPT = {$: 'itemlist.fastFilter', showCondition: dataType, filtersRef: dataType}
type itemlist_selectionPT = {$: 'itemlist.selection', databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: #bbb */cssForSelected: dataType}
type itemlist_keyboardSelectionPT = {$: 'itemlist.keyboardSelection', autoFocus: booleanType, onEnter: actionType}
type itemlist_dragAndDropPT = {$: 'itemlist.dragAndDrop', }
type itemlist_dragHandlePT = {$: 'itemlist.dragHandle', }
type itemlist_shownOnlyOnItemHoverPT = {$: 'itemlist.shownOnlyOnItemHover', }
type itemlist_dividerPT = {$: 'itemlist.divider', space: dataType}
type menu_initPopupMenuPT = {$: 'menu.initPopupMenu', popupStyle: dialog_styleType}
type menu_initMenuOptionPT = {$: 'menu.initMenuOption', }
type picklist_initPT = {$: 'picklist.init', }
type picklist_initGroupsPT = {$: 'picklist.initGroups', }
type picklist_dynamicOptionsPT = {$: 'picklist.dynamicOptions', recalcEm: dataType}
type picklist_onChangePT = {$: 'picklist.onChange', action: actionType}
type slider_initJbModelWithUnitsPT = {$: 'slider.initJbModelWithUnits', }
type slider_initPT = {$: 'slider.init', }
type slider_checkAutoScalePT = {$: 'slider.checkAutoScale', }
type slider_handleArrowKeysPT = {$: 'slider.handleArrowKeys', }
type group_cardPT = {$: 'group.card', padding: dataType, width: dataType, outlined: booleanType}
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
type mdc_rippleEffectPT = {$: 'mdc.rippleEffect', }
type picklist_plusIconPT = {$: 'picklist.plusIcon', }
type table_initTableOrItemlistPT = {$: 'table.initTableOrItemlist', }
type table_initPT = {$: 'table.init', }
type table_initSortPT = {$: 'table.initSort', }
type text_bindTextPT = {$: 'text.bindText', }
type text_allowAsynchValuePT = {$: 'text.allowAsynchValue', }
type group_themePT = {$: 'group.theme', theme: themeType}
type tree_selectionPT = {$: 'tree.selection', databind: dataType, autoSelectFirst: booleanType, onSelection: actionType, onRightClick: actionType}
type tree_keyboardSelectionPT = {$: 'tree.keyboardSelection', onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}
type tree_dragAndDropPT = {$: 'tree.dragAndDrop', }

// type dialog-feature
type dialog_featureType = cssPT | css_classPT | css_widthPT | css_heightPT | css_paddingPT | css_marginPT | css_marginAllSidesPT | css_marginVerticalHorizontalPT | css_boxShadowPT | css_borderPT | css_borderRadiusPT | dialogFeature_uniqueDialogPT | dialogFeature_dragTitlePT | dialogFeature_nearLauncherPositionPT | dialogFeature_onClosePT | dialogFeature_closeWhenClickingOutsidePT | dialogFeature_autoFocusOnFirstInputPT | dialogFeature_cssClassOnLaunchingElementPT | dialogFeature_maxZIndexOnClickPT | dialogFeature_resizerPT | ((ctx: ctx) => any)
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
type css_boxShadowPT = {$: 'css.boxShadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type css_borderRadiusPT = {$: 'css.borderRadius', radius: dataType, selector: dataType}
type dialogFeature_uniqueDialogPT = {$: 'dialogFeature.uniqueDialog', id: dataType, remeberLastLocation: booleanType}
type dialogFeature_dragTitlePT = {$: 'dialogFeature.dragTitle', id: dataType, selector: dataType}
type dialogFeature_nearLauncherPositionPT = {$: 'dialogFeature.nearLauncherPosition', offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}
type dialogFeature_onClosePT = {$: 'dialogFeature.onClose', action: actionType}
type dialogFeature_closeWhenClickingOutsidePT = {$: 'dialogFeature.closeWhenClickingOutside', delay: dataType}
type dialogFeature_autoFocusOnFirstInputPT = {$: 'dialogFeature.autoFocusOnFirstInput', selectText: booleanType}
type dialogFeature_cssClassOnLaunchingElementPT = {$: 'dialogFeature.cssClassOnLaunchingElement', }
type dialogFeature_maxZIndexOnClickPT = {$: 'dialogFeature.maxZIndexOnClick', minZIndex: dataType}
type dialogFeature_resizerPT = {$: 'dialogFeature.resizer', 
/** effective only for dialog with a single codemirror element */resizeInnerCodemirror: booleanType}

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

// type divider.style
type divider_styleType = divider_brPT | divider_flexAutoGrowPT | ((ctx: ctx) => any)
type cmp_def_divider_styleType = {
	type: 'divider_style',
	params?: [param],
	impl: divider_styleType,
}
type divider_brPT = {$: 'divider.br', }
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

// type icon.style
type icon_styleType = icon_materialPT | button_mdcIconPT | ((ctx: ctx) => any)
type cmp_def_icon_styleType = {
	type: 'icon_style',
	params?: [param],
	impl: icon_styleType,
}
type icon_materialPT = {$: 'icon.material', }
type button_mdcIconPT = {$: 'button.mdcIcon', icon: iconType, 
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType}

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
type search_inType = itemlistContainer_searchInAllPropertiesPT | itemlistContainer_fuseOptionsPT | ((ctx: ctx) => any)
type cmp_def_search_inType = {
	type: 'search_in',
	params?: [param],
	impl: search_inType,
}
type itemlistContainer_searchInAllPropertiesPT = {$: 'itemlistContainer.searchInAllProperties', }
type itemlistContainer_fuseOptionsPT = {$: 'itemlistContainer.fuseOptions', keys: dataType, findAllMatches: booleanType, isCaseSensitive: booleanType, includeScore: booleanType, includeMatches: booleanType, minMatchCharLength: dataType, shouldSort: booleanType}

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

// type markdown.style
type markdown_styleType = markdown_showdownPT | ((ctx: ctx) => any)
type cmp_def_markdown_styleType = {
	type: 'markdown_style',
	params?: [param],
	impl: markdown_styleType,
}
type markdown_showdownPT = {$: 'markdown.showdown', }

// type menu.option
type menu_optionType = menu_menuPT | menu_optionsGroupPT | menu_dynamicOptionsPT | menu_endWithSeparatorPT | menu_separatorPT | menu_actionPT | ((ctx: ctx) => any)
type cmp_def_menu_optionType = {
	type: 'menu_option',
	params?: [param],
	impl: menu_optionType,
}
type menu_menuPT = {$: 'menu.menu', title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}
type menu_optionsGroupPT = {$: 'menu.optionsGroup', options: [menu_optionType]}
type menu_dynamicOptionsPT = {$: 'menu.dynamicOptions', items: dataType, genericOption: menu_optionType}
type menu_endWithSeparatorPT = {$: 'menu.endWithSeparator', options: [menu_optionType], separator: menu_optionType, title: dataType}
type menu_separatorPT = {$: 'menu.separator', }
type menu_actionPT = {$: 'menu.action', title: dataType, action: actionType, icon: iconType, shortcut: dataType, showCondition: booleanType}

// type menu.style
type menu_styleType = menuStyle_popupAsOptionPT | menuStyle_toolbarPT | ((ctx: ctx) => any)
type cmp_def_menu_styleType = {
	type: 'menu_style',
	params?: [param],
	impl: menu_styleType,
}
type menuStyle_popupAsOptionPT = {$: 'menuStyle.popupAsOption', }
type menuStyle_toolbarPT = {$: 'menuStyle.toolbar', leafOptionStyle: menu_option_styleType, itemlistStyle: itemlist_styleType}

// type menu-separator.style
type menu_separator_styleType = menuSeparator_linePT | ((ctx: ctx) => any)
type cmp_def_menu_separator_styleType = {
	type: 'menu_separator_style',
	params?: [param],
	impl: menu_separator_styleType,
}
type menuSeparator_linePT = {$: 'menuSeparator.line', }

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

// type button.style
type button_styleType = button_hrefPT | button_xPT | button_nativePT | button_plainIconPT | button_mdcIconPT | button_mdcHeaderPT | button_tableCellHrefPT | ((ctx: ctx) => any)
type cmp_def_button_styleType = {
	type: 'button_style',
	params?: [param],
	impl: button_styleType,
}
type button_hrefPT = {$: 'button.href', }
type button_xPT = {$: 'button.x', size: dataType}
type button_nativePT = {$: 'button.native', }
type button_plainIconPT = {$: 'button.plainIcon', }
type button_mdcIconPT = {$: 'button.mdcIcon', icon: iconType, 
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType}
type button_mdcHeaderPT = {$: 'button.mdcHeader', stretch: booleanType}
type button_tableCellHrefPT = {$: 'button.tableCellHref', }

// type editable-text.style
type editable_text_styleType = editableText_codemirrorPT | editableText_inputPT | editableText_textareaPT | editableText_mdcNoLabelPT | editableText_mdcSearchPT | editableText_expandablePT | ((ctx: ctx) => any)
type cmp_def_editable_text_styleType = {
	type: 'editable_text_style',
	params?: [param],
	impl: editable_text_styleType,
}
type editableText_codemirrorPT = {$: 'editableText.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}
type editableText_inputPT = {$: 'editableText.input', }
type editableText_textareaPT = {$: 'editableText.textarea', rows: dataType, cols: dataType, oneWay: booleanType}
type editableText_mdcNoLabelPT = {$: 'editableText.mdcNoLabel', width: dataType}
type editableText_mdcSearchPT = {$: 'editableText.mdcSearch', }
type editableText_expandablePT = {$: 'editableText.expandable', buttonFeatures: [featureType], editableFeatures: [featureType], buttonStyle: button_styleType, editableStyle: editable_text_styleType, onToggle: actionType}

// type text.style
type text_styleType = text_codemirrorPT | label_mdcRippleEffectPT | text_htmlTagPT | text_noWrappingTagPT | text_spanPT | text_chipPT | header_mdcHeaderWithIconPT | ((ctx: ctx) => any)
type cmp_def_text_styleType = {
	type: 'text_style',
	params?: [param],
	impl: text_styleType,
}
type text_codemirrorPT = {$: 'text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: booleanType}
type label_mdcRippleEffectPT = {$: 'label.mdcRippleEffect', }
type text_htmlTagPT = {$: 'text.htmlTag', htmlTag: dataType, cssClass: dataType}
type text_noWrappingTagPT = {$: 'text.noWrappingTag', }
type text_spanPT = {$: 'text.span', }
type text_chipPT = {$: 'text.chip', }
type header_mdcHeaderWithIconPT = {$: 'header.mdcHeaderWithIcon', level: dataType}

// type editable-boolean.style
type editable_boolean_styleType = editableBoolean_checkboxPT | editableBoolean_checkboxWithTitlePT | editableBoolean_checkboxWithLabelPT | editableBoolean_expandCollapsePT | editableBoolean_buttonXVPT | editableBoolean_iconWithSlashPT | ((ctx: ctx) => any)
type cmp_def_editable_boolean_styleType = {
	type: 'editable_boolean_style',
	params?: [param],
	impl: editable_boolean_styleType,
}
type editableBoolean_checkboxPT = {$: 'editableBoolean.checkbox', }
type editableBoolean_checkboxWithTitlePT = {$: 'editableBoolean.checkboxWithTitle', }
type editableBoolean_checkboxWithLabelPT = {$: 'editableBoolean.checkboxWithLabel', }
type editableBoolean_expandCollapsePT = {$: 'editableBoolean.expandCollapse', }
type editableBoolean_buttonXVPT = {$: 'editableBoolean.buttonXV', yesIcon: iconType, noIcon: iconType, buttonStyle: button_styleType}
type editableBoolean_iconWithSlashPT = {$: 'editableBoolean.iconWithSlash', 
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType}

// type group.style
type group_styleType = group_htmlTagPT | group_divPT | group_sectionPT | group_ulLiPT | group_tabsPT | group_accordionPT | propertySheet_titlesLeftPT | propertySheet_titlesAbovePT | ((ctx: ctx) => any)
type cmp_def_group_styleType = {
	type: 'group_style',
	params?: [param],
	impl: group_styleType,
}
type group_htmlTagPT = {$: 'group.htmlTag', htmlTag: dataType, groupClass: dataType, itemClass: dataType}
type group_divPT = {$: 'group.div', }
type group_sectionPT = {$: 'group.section', }
type group_ulLiPT = {$: 'group.ulLi', }
type group_tabsPT = {$: 'group.tabs', tabStyle: button_styleType, barStyle: group_styleType, innerGroupStyle: group_styleType}
type group_accordionPT = {$: 'group.accordion', titleStyle: button_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}
type propertySheet_titlesLeftPT = {$: 'propertySheet.titlesLeft', titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}
type propertySheet_titlesAbovePT = {$: 'propertySheet.titlesAbove', titleStyle: text_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}

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
type picklist_styleType = picklist_nativePT | picklist_radioPT | picklist_radioVerticalPT | picklist_mdcSelectPT | picklist_nativeMdLookOpenPT | picklist_nativeMdLookPT | picklist_labelListPT | picklist_buttonListPT | picklist_hyperlinksPT | picklist_groupsPT | ((ctx: ctx) => any)
type cmp_def_picklist_styleType = {
	type: 'picklist_style',
	params?: [param],
	impl: picklist_styleType,
}
type picklist_nativePT = {$: 'picklist.native', }
type picklist_radioPT = {$: 'picklist.radio', 
/** e.g. display: none */radioCss: dataType, text: dataType}
type picklist_radioVerticalPT = {$: 'picklist.radioVertical', }
type picklist_mdcSelectPT = {$: 'picklist.mdcSelect', width: dataType, noLabel: booleanType, noRipple: booleanType}
type picklist_nativeMdLookOpenPT = {$: 'picklist.nativeMdLookOpen', }
type picklist_nativeMdLookPT = {$: 'picklist.nativeMdLook', }
type picklist_labelListPT = {$: 'picklist.labelList', labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}
type picklist_buttonListPT = {$: 'picklist.buttonList', buttonStyle: button_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red;color: blue;font-weight: bold; */cssForSelected: dataType}
type picklist_hyperlinksPT = {$: 'picklist.hyperlinks', }
type picklist_groupsPT = {$: 'picklist.groups', }

// type table-field
type table_fieldType = fieldPT | field_indexPT | field_controlPT | ((ctx: ctx) => any)
type cmp_def_table_fieldType = {
	type: 'table_field',
	params?: [param],
	impl: table_fieldType,
}
type fieldPT = {$: 'field', title: dataType, data: dataType, hoverTitle: dataType, width: dataType, numeric: booleanType, 
/** extend the items with the calculated field using the title as field name */extendItems: booleanType, class: dataType}
type field_indexPT = {$: 'field.index', title: dataType, width: dataType, class: dataType}
type field_controlPT = {$: 'field.control', title: dataType, control: controlType, width: dataType, dataForSort: dataType, numeric: booleanType}

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
type table_tree_styleType = tableTree_expandPathPT | ((ctx: ctx) => any)
type cmp_def_table_tree_styleType = {
	type: 'table_tree_style',
	params?: [param],
	impl: table_tree_styleType,
}
type tableTree_expandPathPT = {$: 'tableTree.expandPath', path: dataType}

// type tree.style
type tree_styleType = tree_plainPT | tree_expandBoxPT | ((ctx: ctx) => any)
type cmp_def_tree_styleType = {
	type: 'tree_style',
	params?: [param],
	impl: tree_styleType,
}
type tree_plainPT = {$: 'tree.plain', showIcon: booleanType, noHead: booleanType}
type tree_expandBoxPT = {$: 'tree.expandBox', showIcon: booleanType, noHead: booleanType, lineWidth: dataType}

// type remote
type remoteType = worker_mainPT | ((ctx: ctx) => any)
type cmp_def_remoteType = {
	type: 'remote',
	params?: [param],
	impl: remoteType,
}
type worker_mainPT = {$: 'worker.main', }
type cmpDef = cmp_def_anyType | cmp_def_dataType | cmp_def_aggregatorType | cmp_def_booleanType | cmp_def_actionType | cmp_def_propType | cmp_def_varType | cmp_def_systemType | cmp_def_data_switch_caseType | cmp_def_action_switch_caseType | cmp_def_jison_parserType | cmp_def_lexer_ruleType | cmp_def_bnf_expressionType | cmp_def_expression_optionType | cmp_def_testType | cmp_def_controlType | cmp_def_ui_actionType | cmp_def_animationType | cmp_def_animation_valType | cmp_def_animation_stager_gridType | cmp_def_animation_stager_valType | cmp_def_animation_easingType | cmp_def_positionType | cmp_def_featureType | cmp_def_dialog_featureType | cmp_def_d3g_frameType | cmp_def_d3_featureType | cmp_def_d3g_axesType | cmp_def_d3g_scaleType | cmp_def_d3g_rangeType | cmp_def_d3g_domainType | cmp_def_dialog_styleType | cmp_def_divider_styleType | cmp_def_html_styleType | cmp_def_icon_styleType | cmp_def_image_resizeType | cmp_def_image_positionType | cmp_def_image_styleType | cmp_def_filter_typeType | cmp_def_search_inType | cmp_def_itemlist_styleType | cmp_def_markdown_styleType | cmp_def_menu_optionType | cmp_def_menu_styleType | cmp_def_menu_separator_styleType | cmp_def_picklist_optionsType | cmp_def_picklist_promoteType | cmp_def_button_styleType | cmp_def_editable_text_styleType | cmp_def_text_styleType | cmp_def_editable_boolean_styleType | cmp_def_group_styleType | cmp_def_layoutType | cmp_def_picklist_styleType | cmp_def_table_fieldType | cmp_def_depricated_controlType | cmp_def_themeType | cmp_def_tree_node_modelType | cmp_def_table_tree_styleType | cmp_def_tree_styleType | cmp_def_remoteType
function call : anyType;
function call(param: dataType) : anyType;
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
function jbRun : actionType;
function jbRun(
/** profile name */profile: dataType, params: dataType) : actionType;
function jbRun(
/** profile name */profile: dataType) : actionType;
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
function writeValue : actionType;
function writeValue(to: dataType, value: dataType) : actionType;
function writeValue(to: dataType) : actionType;
function property : dataType;
function property(prop: dataType, obj: dataType) : dataType;
function property(prop: dataType) : dataType;
function indexOf : dataType;
function indexOf(array: dataType, item: dataType) : dataType;
function indexOf(array: dataType) : dataType;
function addToArray : actionType;
function addToArray(array: dataType, toAdd: dataType) : actionType;
function addToArray(array: dataType) : actionType;
function splice : actionType;
function splice(profile: { array: dataType, fromIndex: dataType, noOfItemsToRemove: dataType, itemsToAdd: dataType}) : actionType;
function splice(array: dataType) : actionType;
function removeFromArray : actionType;
function removeFromArray(profile: { array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}) : actionType;
function removeFromArray(array: dataType) : actionType;
function toggleBooleanValue : actionType;
function toggleBooleanValue(of: dataType) : actionType;
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
function Var : varType | systemType;
function Var(name: dataType, val: dataType) : varType | systemType;
function Var(name: dataType) : varType | systemType;
function remark : systemType;
function remark(remark: dataType) : systemType;
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
function log(obj: dataType) : dataType;
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
function touch : actionType;
function touch(data: dataType) : actionType;
function isNull : booleanType;
function isNull(obj: dataType) : booleanType;
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
function runActionOnItems : actionType;
function runActionOnItems(profile: { items: dataType, action: actionType, 
/** notification for watch-ref, default behavior is after each action */notifications: dataType, indexVariable: dataType}) : actionType;
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
function http_get : dataType | actionType;
function http_get(profile: { url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType;
function http_get(url: dataType) : dataType | actionType;
function http_fetch : dataType | actionType;
function http_fetch(profile: { url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType;
function http_fetch(url: dataType) : dataType | actionType;
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
function jison_parse : dataType;
function jison_parse(profile: { parser: jison_parserType, goal: dataType, text: dataType, debug: booleanType}) : dataType;
function jison_parse(parser: jison_parserType) : dataType;
function jison_parser : jison_parserType;
function jison_parser(profile: { lex: [lexer_ruleType], bnf: [bnf_expressionType], 
/** [["left", "+", "-"]] */operators: [dataType]}) : jison_parserType;
function lexer_tokens : lexer_ruleType;
function lexer_tokens(
/** e.g. -,+,*,%,for,== */tokens: dataType) : lexer_ruleType;
function lexer_ignoreWhiteSpace : lexer_ruleType;
function lexer_ignoreWhiteSpace() : lexer_ruleType;
function lexer_number : lexer_ruleType;
function lexer_number() : lexer_ruleType;
function lexer_identifier : lexer_ruleType;
function lexer_identifier(regex: dataType) : lexer_ruleType;
function lexer_EOF : lexer_ruleType;
function lexer_EOF() : lexer_ruleType;
function lexerRule : lexer_ruleType;
function lexerRule(
/** [a-f0-9]+ */regex: dataType, 
/** return 'Hex'; */result: dataType) : lexer_ruleType;
function lexerRule(
/** [a-f0-9]+ */regex: dataType) : lexer_ruleType;
function bnfExpression : bnf_expressionType;
function bnfExpression(id: dataType, options: [expression_optionType]) : bnf_expressionType;
function bnfExpression(id: dataType) : bnf_expressionType;
function expressionOption : expression_optionType;
function expressionOption(
/** e + e */syntax: dataType, 
/** $$ = $1 + $2; */calculate: dataType) : expression_optionType;
function expressionOption(
/** e + e */syntax: dataType) : expression_optionType;
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
function removePrefixRegex : dataType;
function removePrefixRegex(prefix: dataType, text: dataType) : dataType;
function removePrefixRegex(prefix: dataType) : dataType;
function wrapAsObject : aggregatorType;
function wrapAsObject(profile: { propertyName: dataType, value: dataType, items: dataType}) : aggregatorType;
function wrapAsObject(propertyName: dataType) : aggregatorType;
function writeValueAsynch : actionType;
function writeValueAsynch(to: dataType, value: dataType) : actionType;
function writeValueAsynch(to: dataType) : actionType;
function prettyPrint : dataType;
function prettyPrint(profile: dataType, forceFlat: booleanType) : dataType;
function prettyPrint(profile: dataType) : dataType;
function fs_readFile : dataType;
function fs_readFile(fileName: dataType, directory: dataType) : dataType;
function fs_readFile(fileName: dataType) : dataType;
function fs_stat : dataType;
function fs_stat(fileName: dataType, directory: dataType) : dataType;
function fs_stat(fileName: dataType) : dataType;
function fs_readdir : dataType;
function fs_readdir(directory: dataType) : dataType;
function fs_directoryContent : dataType;
function fs_directoryContent(directory: dataType, filter: booleanType) : dataType;
function fs_directoryContent(directory: dataType) : dataType;
function dataTest : testType;
function dataTest(profile: { calculate: dataType, runBefore: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType}) : testType;
function dataTest(calculate: dataType) : testType;
function uiTestRunner : controlType;
function uiTestRunner(test: dataType) : controlType;
function uiTest : testType;
function uiTest(profile: { control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType, renderDOM: booleanType, runInPreview: actionType, runInStudio: actionType}) : testType;
function uiTest(control: controlType) : testType;
function uiTest_applyVdomDiff : testType;
function uiTest_applyVdomDiff(controlBefore: controlType, control: controlType) : testType;
function uiTest_applyVdomDiff(controlBefore: controlType) : testType;
function uiAction_click : ui_actionType;
function uiAction_click(selector: dataType, methodToActivate: dataType) : ui_actionType;
function uiAction_click(selector: dataType) : ui_actionType;
function uiAction_keyboardEvent : ui_actionType;
function uiAction_keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType;
function uiAction_keyboardEvent(selector: dataType) : ui_actionType;
function uiAction_setText : ui_actionType;
function uiAction_setText(value: dataType, selector: dataType) : ui_actionType;
function uiAction_setText(value: dataType) : ui_actionType;
function uiAction_scrollDown : ui_actionType;
function uiAction_scrollDown(selector: dataType) : ui_actionType;
function test_dialogContent : dataType;
function test_dialogContent(id: dataType) : dataType;
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
function defHandler : featureType;
function defHandler(
/** to be used in html, e.g. onclick="clicked"  */id: dataType, action: [actionType]) : featureType;
function defHandler(
/** to be used in html, e.g. onclick="clicked"  */id: dataType) : featureType;
function watchAndCalcModelProp : featureType;
function watchAndCalcModelProp(profile: { prop: dataType, transformValue: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType}) : featureType;
function watchAndCalcModelProp(prop: dataType) : featureType;
function calcProp : featureType;
function calcProp(profile: { id: dataType, 
/** when empty value is taken from model */value: dataType, 
/** if same prop was defined elsewhere decides who will override. range 1-1000 */priority: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType}) : featureType;
function calcProp(id: dataType) : featureType;
function interactiveProp : featureType;
function interactiveProp(id: dataType, value: dataType) : featureType;
function interactiveProp(id: dataType) : featureType;
function calcProps : featureType;
function calcProps(
/** props as object */props: dataType, 
/** props from different features can use each other, phase defines the calculation order */phase: dataType) : featureType;
function calcProps(
/** props as object */props: dataType) : featureType;
function feature_init : featureType;
function feature_init(action: [actionType], 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType) : featureType;
function feature_destroy : featureType;
function feature_destroy(...action: [actionType][]) : featureType;
function feature_beforeInit : featureType;
function feature_beforeInit(...action: [actionType][]) : featureType;
function feature_afterLoad : featureType;
function feature_afterLoad(...action: [actionType][]) : featureType;
function interactive : featureType;
function interactive(...action: [actionType][]) : featureType;
function templateModifier : featureType;
function templateModifier(value: dataType) : featureType;
function features : featureType;
function features(...features: [featureType][]) : featureType;
function watchRef : featureType;
function watchRef(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType, 
/** controls the order of updates on the same event. default is 0 */phase: dataType}) : featureType;
function watchRef(
/** reference to data */ref: dataType) : featureType;
function watchObservable : featureType;
function watchObservable(toWatch: dataType, 
/** in mSec */debounceTime: dataType) : featureType;
function watchObservable(toWatch: dataType) : featureType;
function feature_onDataChange : featureType;
function feature_onDataChange(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}) : featureType;
function feature_onDataChange(
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
function variable : featureType;
function variable(profile: { name: dataType, value: dataType, 
/** E.g., selected item variable */watchable: booleanType}) : featureType;
function variable(name: dataType) : featureType;
function calculatedVar : featureType;
function calculatedVar(profile: { name: dataType, value: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}) : featureType;
function calculatedVar(name: dataType) : featureType;
function feature_if : featureType;
function feature_if(showCondition: booleanType) : featureType;
function hidden : featureType;
function hidden(showCondition: booleanType) : featureType;
function conditionalClass : featureType;
function conditionalClass(cssClass: dataType, condition: booleanType) : featureType;
function conditionalClass(cssClass: dataType) : featureType;
function feature_keyboardShortcut : featureType;
function feature_keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType;
function feature_keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType;
function feature_onEvent : featureType;
function feature_onEvent(profile: { event: dataType, action: [actionType], 
/** used for mouse events such as mousemove */debounceTime: dataType}) : featureType;
function feature_onEvent(event: dataType) : featureType;
function feature_onHover : featureType;
function feature_onHover(profile: { action: [actionType], onLeave: [actionType], debounceTime: dataType}) : featureType;
function feature_classOnHover : featureType;
function feature_classOnHover(
/** css class to add/remove on hover */class: stringType) : featureType;
function feature_onKey : featureType;
function feature_onKey(profile: { 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType, doNotWrapWithLauchingElement: booleanType}) : featureType;
function feature_onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : featureType;
function feature_onEnter : featureType;
function feature_onEnter(...action: [actionType][]) : featureType;
function feature_onEsc : featureType;
function feature_onEsc(...action: [actionType][]) : featureType;
function refreshControlById : actionType;
function refreshControlById(profile: { id: dataType, 
/** rebuild the component and reinit wait for data */strongRefresh: booleanType, 
/** refresh only css features */cssOnly: booleanType}) : actionType;
function refreshControlById(id: dataType) : actionType;
function group_autoFocusOnFirstInput : featureType;
function group_autoFocusOnFirstInput() : featureType;
function focusOnFirstElement : actionType;
function focusOnFirstElement(selector: dataType) : actionType;
function feature_byCondition : featureType;
function feature_byCondition(profile: { condition: booleanType, then: featureType, else: featureType}) : featureType;
function feature_byCondition(condition: booleanType) : featureType;
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
function css_boxShadow(profile: { blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_boxShadow(blurRadius: dataType) : featureType | dialog_featureType;
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
function dialog_closeContainingPopup : actionType;
function dialog_closeContainingPopup(OK: booleanType) : actionType;
function dialogFeature_uniqueDialog : dialog_featureType;
function dialogFeature_uniqueDialog(id: dataType, remeberLastLocation: booleanType) : dialog_featureType;
function dialogFeature_uniqueDialog(id: dataType) : dialog_featureType;
function dialogFeature_dragTitle : dialog_featureType;
function dialogFeature_dragTitle(id: dataType, selector: dataType) : dialog_featureType;
function dialogFeature_dragTitle(id: dataType) : dialog_featureType;
function dialog_default : dialog_styleType;
function dialog_default() : dialog_styleType;
function dialogFeature_nearLauncherPosition : dialog_featureType;
function dialogFeature_nearLauncherPosition(profile: { offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}) : dialog_featureType;
function dialogFeature_nearLauncherPosition(offsetLeft: dataType) : dialog_featureType;
function dialogFeature_onClose : dialog_featureType;
function dialogFeature_onClose(action: actionType) : dialog_featureType;
function dialogFeature_closeWhenClickingOutside : dialog_featureType;
function dialogFeature_closeWhenClickingOutside(delay: dataType) : dialog_featureType;
function dialog_closeDialog : actionType;
function dialog_closeDialog(id: dataType, delay: dataType) : actionType;
function dialog_closeDialog(id: dataType) : actionType;
function dialog_closeAll : actionType;
function dialog_closeAll() : actionType;
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
/** effective only for dialog with a single codemirror element */resizeInnerCodemirror: booleanType) : dialog_featureType;
function dialog_popup : dialog_styleType;
function dialog_popup() : dialog_styleType;
function dialog_transparentPopup : dialog_styleType;
function dialog_transparentPopup() : dialog_styleType;
function dialog_div : dialog_styleType;
function dialog_div() : dialog_styleType;
function divider : controlType;
function divider(profile: { style: divider_styleType, title: dataType, features: [featureType]}) : controlType;
function divider(style: divider_styleType) : controlType;
function divider_br : divider_styleType;
function divider_br() : divider_styleType;
function divider_flexAutoGrow : divider_styleType;
function divider_flexAutoGrow() : divider_styleType;
function editableText_xButton : featureType;
function editableText_xButton() : featureType;
function editableText_helperPopup : featureType;
function editableText_helperPopup(profile: { control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: booleanType, autoOpen: booleanType, onEnter: actionType, onEsc: actionType}) : featureType;
function editableText_helperPopup(control: controlType) : featureType;
function field_databind : featureType;
function field_databind(debounceTime: dataType, oneWay: booleanType) : featureType;
function field_databind(debounceTime: dataType) : featureType;
function field_onChange : featureType;
function field_onChange(action: actionType) : featureType;
function field_databindText : featureType;
function field_databindText(debounceTime: dataType, oneWay: booleanType) : featureType;
function field_databindText(debounceTime: dataType) : featureType;
function field_keyboardShortcut : featureType;
function field_keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType;
function field_keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType;
function field_toolbar : featureType;
function field_toolbar(toolbar: controlType) : featureType;
function validation : featureType;
function validation(validCondition: booleanType, errorMessage: dataType) : featureType;
function validation(validCondition: booleanType) : featureType;
function field_title : featureType;
function field_title(title: dataType) : featureType;
function field_columnWidth : featureType;
function field_columnWidth(width: dataType) : featureType;
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
function html_plain : html_styleType;
function html_plain() : html_styleType;
function html_inIframe : html_styleType;
function html_inIframe(width: dataType, height: dataType) : html_styleType;
function html_inIframe(width: dataType) : html_styleType;
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
function group_itemlistContainer(profile: { id: dataType, defaultItem: dataType, initialSelection: dataType}) : featureType;
function group_itemlistContainer(id: dataType) : featureType;
function itemlist_itemlistSelected : featureType;
function itemlist_itemlistSelected() : featureType;
function itemlistContainer_filter : aggregatorType;
function itemlistContainer_filter(updateCounters: booleanType) : aggregatorType;
function itemlistContainer_conditionFilter : booleanType;
function itemlistContainer_conditionFilter() : booleanType;
function itemlistContainer_search : controlType;
function itemlistContainer_search(profile: { title: dataType, searchIn: search_inType, databind: dataType, style: editable_text_styleType, features: [featureType]}) : controlType;
function itemlistContainer_search(title: dataType) : controlType;
function itemlistContainer_filterField : featureType;
function itemlistContainer_filterField(fieldData: dataType, filterType: filter_typeType) : featureType;
function itemlistContainer_filterField(fieldData: dataType) : featureType;
function filterType_text : filter_typeType;
function filterType_text(ignoreCase: booleanType) : filter_typeType;
function filterType_exactMatch : filter_typeType;
function filterType_exactMatch() : filter_typeType;
function filterType_numeric : filter_typeType;
function filterType_numeric() : filter_typeType;
function itemlistContainer_searchInAllProperties : search_inType;
function itemlistContainer_searchInAllProperties() : search_inType;
function itemlistContainer_fuseOptions : search_inType;
function itemlistContainer_fuseOptions(profile: { keys: dataType, findAllMatches: booleanType, isCaseSensitive: booleanType, includeScore: booleanType, includeMatches: booleanType, minMatchCharLength: dataType, shouldSort: booleanType}) : search_inType;
function itemlistContainer_fuseOptions(keys: dataType) : search_inType;
function itemlist : controlType;
function itemlist(profile: { title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, layout: layoutType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}) : controlType;
function itemlist(title: dataType) : controlType;
function itemlist_noContainer : featureType;
function itemlist_noContainer() : featureType;
function itemlist_initContainerWithItems : featureType;
function itemlist_initContainerWithItems() : featureType;
function itemlist_init : featureType;
function itemlist_init() : featureType;
function itemlist_initTable : featureType;
function itemlist_initTable() : featureType;
function itemlist_infiniteScroll : featureType;
function itemlist_infiniteScroll(pageSize: dataType) : featureType;
function itemlist_fastFilter : featureType;
function itemlist_fastFilter(showCondition: dataType, filtersRef: dataType) : featureType;
function itemlist_fastFilter(showCondition: dataType) : featureType;
function itemlist_ulLi : itemlist_styleType;
function itemlist_ulLi() : itemlist_styleType;
function itemlist_div : itemlist_styleType;
function itemlist_div(spacing: dataType) : itemlist_styleType;
function itemlist_horizontal : itemlist_styleType;
function itemlist_horizontal(spacing: dataType) : itemlist_styleType;
function itemlist_selection : featureType;
function itemlist_selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: #bbb */cssForSelected: dataType}) : featureType;
function itemlist_selection(databind: dataType) : featureType;
function itemlist_keyboardSelection : featureType;
function itemlist_keyboardSelection(autoFocus: booleanType, onEnter: actionType) : featureType;
function itemlist_keyboardSelection(autoFocus: booleanType) : featureType;
function itemlist_dragAndDrop : featureType;
function itemlist_dragAndDrop() : featureType;
function itemlist_dragHandle : featureType;
function itemlist_dragHandle() : featureType;
function itemlist_shownOnlyOnItemHover : featureType;
function itemlist_shownOnlyOnItemHover() : featureType;
function itemlist_divider : featureType;
function itemlist_divider(space: dataType) : featureType;
function markdown : controlType;
function markdown(profile: { markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}) : controlType;
function markdown(markdown: dataType) : controlType;
function markdown_showdown : markdown_styleType;
function markdown_showdown() : markdown_styleType;
function menu_menu : menu_optionType;
function menu_menu(profile: { title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}) : menu_optionType;
function menu_menu(title: dataType) : menu_optionType;
function menu_optionsGroup : menu_optionType;
function menu_optionsGroup(...options: [menu_optionType][]) : menu_optionType;
function menu_dynamicOptions : menu_optionType;
function menu_dynamicOptions(items: dataType, genericOption: menu_optionType) : menu_optionType;
function menu_dynamicOptions(items: dataType) : menu_optionType;
function menu_endWithSeparator : menu_optionType;
function menu_endWithSeparator(profile: { options: [menu_optionType], separator: menu_optionType, title: dataType}) : menu_optionType;
function menu_separator : menu_optionType;
function menu_separator() : menu_optionType;
function menu_action : menu_optionType;
function menu_action(profile: { title: dataType, action: actionType, icon: iconType, shortcut: dataType, showCondition: booleanType}) : menu_optionType;
function menu_action(title: dataType) : menu_optionType;
function menu_initPopupMenu : featureType;
function menu_initPopupMenu(popupStyle: dialog_styleType) : featureType;
function menu_initMenuOption : featureType;
function menu_initMenuOption() : featureType;
function menuStyle_popupAsOption : menu_styleType;
function menuStyle_popupAsOption() : menu_styleType;
function dialog_contextMenuPopup : dialog_styleType;
function dialog_contextMenuPopup(profile: { offsetTop: dataType, rightSide: booleanType, toolbar: booleanType}) : dialog_styleType;
function dialog_contextMenuPopup(offsetTop: dataType) : dialog_styleType;
function menuSeparator_line : menu_separator_styleType;
function menuSeparator_line() : menu_separator_styleType;
function menuStyle_toolbar : menu_styleType;
function menuStyle_toolbar(leafOptionStyle: menu_option_styleType, itemlistStyle: itemlist_styleType) : menu_styleType;
function menuStyle_toolbar(leafOptionStyle: menu_option_styleType) : menu_styleType;
function multiSelect_modelAsBooleanRef : dataType;
function multiSelect_modelAsBooleanRef(multiSelectModel: dataType, code: dataType) : dataType;
function multiSelect_modelAsBooleanRef(multiSelectModel: dataType) : dataType;
function picklist_init : featureType;
function picklist_init() : featureType;
function picklist_initGroups : featureType;
function picklist_initGroups() : featureType;
function picklist_dynamicOptions : featureType;
function picklist_dynamicOptions(recalcEm: dataType) : featureType;
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
function sidenav : controlType;
function sidenav(profile: { controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}) : controlType;
function slider_initJbModelWithUnits : featureType;
function slider_initJbModelWithUnits() : featureType;
function slider_init : featureType;
function slider_init() : featureType;
function slider_checkAutoScale : featureType;
function slider_checkAutoScale() : featureType;
function slider_handleArrowKeys : featureType;
function slider_handleArrowKeys() : featureType;
function button_href : button_styleType;
function button_href() : button_styleType;
function button_x : button_styleType;
function button_x(size: dataType) : button_styleType;
function button_native : button_styleType;
function button_native() : button_styleType;
function button_plainIcon : button_styleType;
function button_plainIcon() : button_styleType;
function button_mdcIcon : button_styleType | icon_styleType;
function button_mdcIcon(icon: iconType, 
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType) : button_styleType | icon_styleType;
function button_mdcIcon(icon: iconType) : button_styleType | icon_styleType;
function button_mdcHeader : button_styleType;
function button_mdcHeader(stretch: booleanType) : button_styleType;
function editableText_codemirror : editable_text_styleType;
function editableText_codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}) : editable_text_styleType;
function editableText_codemirror(cm_settings: dataType) : editable_text_styleType;
function text_codemirror : text_styleType;
function text_codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: booleanType}) : text_styleType;
function text_codemirror(cm_settings: dataType) : text_styleType;
function editableBoolean_checkbox : editable_boolean_styleType;
function editableBoolean_checkbox() : editable_boolean_styleType;
function editableBoolean_checkboxWithTitle : editable_boolean_styleType;
function editableBoolean_checkboxWithTitle() : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel() : editable_boolean_styleType;
function editableBoolean_expandCollapse : editable_boolean_styleType;
function editableBoolean_expandCollapse() : editable_boolean_styleType;
function editableBoolean_buttonXV : editable_boolean_styleType;
function editableBoolean_buttonXV(profile: { yesIcon: iconType, noIcon: iconType, buttonStyle: button_styleType}) : editable_boolean_styleType;
function editableBoolean_buttonXV(yesIcon: iconType) : editable_boolean_styleType;
function editableBoolean_iconWithSlash : editable_boolean_styleType;
function editableBoolean_iconWithSlash(
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType) : editable_boolean_styleType;
function editableText_input : editable_text_styleType;
function editableText_input() : editable_text_styleType;
function editableText_textarea : editable_text_styleType;
function editableText_textarea(profile: { rows: dataType, cols: dataType, oneWay: booleanType}) : editable_text_styleType;
function editableText_textarea(rows: dataType) : editable_text_styleType;
function editableText_mdcNoLabel : editable_text_styleType;
function editableText_mdcNoLabel(width: dataType) : editable_text_styleType;
function editableText_mdcSearch : editable_text_styleType;
function editableText_mdcSearch() : editable_text_styleType;
function editableText_expandable : editable_text_styleType;
function editableText_expandable(profile: { buttonFeatures: [featureType], editableFeatures: [featureType], buttonStyle: button_styleType, editableStyle: editable_text_styleType, onToggle: actionType}) : editable_text_styleType;
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
function group_tabs : group_styleType;
function group_tabs(profile: { tabStyle: button_styleType, barStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType;
function group_tabs(tabStyle: button_styleType) : group_styleType;
function group_accordion : group_styleType;
function group_accordion(profile: { titleStyle: button_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType;
function group_accordion(titleStyle: button_styleType) : group_styleType;
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
function mdc_rippleEffect : featureType;
function mdc_rippleEffect() : featureType;
function label_mdcRippleEffect : text_styleType;
function label_mdcRippleEffect() : text_styleType;
function picklist_native : picklist_styleType;
function picklist_native() : picklist_styleType;
function picklist_plusIcon : featureType;
function picklist_plusIcon() : featureType;
function picklist_radio : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType;
function picklist_radioVertical : picklist_styleType;
function picklist_radioVertical() : picklist_styleType;
function picklist_mdcSelect : picklist_styleType;
function picklist_mdcSelect(profile: { width: dataType, noLabel: booleanType, noRipple: booleanType}) : picklist_styleType;
function picklist_mdcSelect(width: dataType) : picklist_styleType;
function picklist_nativeMdLookOpen : picklist_styleType;
function picklist_nativeMdLookOpen() : picklist_styleType;
function picklist_nativeMdLook : picklist_styleType;
function picklist_nativeMdLook() : picklist_styleType;
function picklist_labelList : picklist_styleType;
function picklist_labelList(profile: { labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType;
function picklist_labelList(labelStyle: text_styleType) : picklist_styleType;
function picklist_buttonList : picklist_styleType;
function picklist_buttonList(profile: { buttonStyle: button_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red;color: blue;font-weight: bold; */cssForSelected: dataType}) : picklist_styleType;
function picklist_buttonList(buttonStyle: button_styleType) : picklist_styleType;
function picklist_hyperlinks : picklist_styleType;
function picklist_hyperlinks() : picklist_styleType;
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
function field : table_fieldType;
function field(profile: { title: dataType, data: dataType, hoverTitle: dataType, width: dataType, numeric: booleanType, 
/** extend the items with the calculated field using the title as field name */extendItems: booleanType, class: dataType}) : table_fieldType;
function field(title: dataType) : table_fieldType;
function field_index : table_fieldType;
function field_index(profile: { title: dataType, width: dataType, class: dataType}) : table_fieldType;
function field_index(title: dataType) : table_fieldType;
function field_control : table_fieldType;
function field_control(profile: { title: dataType, control: controlType, width: dataType, dataForSort: dataType, numeric: booleanType}) : table_fieldType;
function field_control(title: dataType) : table_fieldType;
function button_tableCellHref : button_styleType;
function button_tableCellHref() : button_styleType;
function table_initTableOrItemlist : featureType;
function table_initTableOrItemlist() : featureType;
function table_init : featureType;
function table_init() : featureType;
function table_initSort : featureType;
function table_initSort() : featureType;
function text : controlType;
function text(profile: { text: dataType, title: dataType, style: text_styleType, features: [featureType]}) : controlType;
function text(text: dataType) : controlType;
function label : depricated_controlType;
function label(profile: { text: dataType, title: dataType, style: text_styleType, features: [featureType]}) : depricated_controlType;
function label(text: dataType) : depricated_controlType;
function text_bindText : featureType;
function text_bindText() : featureType;
function text_allowAsynchValue : featureType;
function text_allowAsynchValue() : featureType;
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
function text_highlight : dataType;
function text_highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType;
function text_highlight(base: dataType) : dataType;
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
function json_pathSelector : dataType;
function json_pathSelector(
/** object to start with */base: dataType, 
/** string with  separator or array */path: dataType) : dataType;
function json_pathSelector(
/** object to start with */base: dataType) : dataType;
function tableTree_expandPath : table_tree_styleType;
function tableTree_expandPath(path: dataType) : table_tree_styleType;
function tree : controlType;
function tree(profile: { nodeModel: tree_node_modelType, style: tree_styleType, features: [featureType]}) : controlType;
function tree(nodeModel: tree_node_modelType) : controlType;
function tree_plain : tree_styleType;
function tree_plain(showIcon: booleanType, noHead: booleanType) : tree_styleType;
function tree_plain(showIcon: booleanType) : tree_styleType;
function tree_expandBox : tree_styleType;
function tree_expandBox(profile: { showIcon: booleanType, noHead: booleanType, lineWidth: dataType}) : tree_styleType;
function tree_expandBox(showIcon: booleanType) : tree_styleType;
function tree_selection : featureType;
function tree_selection(profile: { databind: dataType, autoSelectFirst: booleanType, onSelection: actionType, onRightClick: actionType}) : featureType;
function tree_selection(databind: dataType) : featureType;
function tree_keyboardSelection : featureType;
function tree_keyboardSelection(profile: { onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}) : featureType;
function tree_keyboardSelection(onKeyboardSelection: actionType) : featureType;
function tree_regainFocus : actionType;
function tree_regainFocus() : actionType;
function tree_redraw : actionType;
function tree_redraw(strong: booleanType) : actionType;
function tree_expandPath : actionType;
function tree_expandPath(paths: dataType) : actionType;
function tree_pathOfInteractiveItem : dataType;
function tree_pathOfInteractiveItem() : dataType;
function tree_dragAndDrop : featureType;
function tree_dragAndDrop() : featureType;
function urlHistory_mapUrlToResource : actionType;
function urlHistory_mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType;
function worker_main : remoteType;
function worker_main() : remoteType;
function remote_initMainWorker : controlType;
function remote_initMainWorker(sourceUrl: dataType, remote: remoteType) : controlType;
function remote_initMainWorker(sourceUrl: dataType) : controlType;
function remote_widget : controlType;
function remote_widget(profile: { 
/** main profile to run */main: dataType, id: dataType, remote: remoteType}) : controlType;
function remote_widget(
/** main profile to run */main: dataType) : controlType;
function watchableAsText : dataType;
function watchableAsText(ref: dataType, oneWay: booleanType) : dataType;
function watchableAsText(ref: dataType) : dataType;
function textEditor_withCursorPath : actionType;
function textEditor_withCursorPath(action: actionType, selector: dataType) : actionType;
function textEditor_withCursorPath(action: actionType) : actionType;
function textEditor_isDirty : dataType;
function textEditor_isDirty() : dataType;
function runTransaction : actionType;
function runTransaction(actions: [actionType], disableNotifications: booleanType) : actionType;
function gotoUrl : actionType;
function gotoUrl(url: dataType, target: enumType) : actionType;
function gotoUrl(url: dataType) : actionType;
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
}
declare var action : action;,type math = {
max : aggregatorType,
max() : aggregatorType,
min : aggregatorType,
min() : aggregatorType,
sum : aggregatorType,
sum() : aggregatorType,
}
declare var math : math;,type pipeline = {
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
pathSelector : dataType,
pathSelector(
/** object to start with */base: dataType, 
/** string with  separator or array */path: dataType) : dataType,
pathSelector(
/** object to start with */base: dataType) : dataType,
}
declare var json : json;,type http = {
get : dataType | actionType,
get(profile: { url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType,
get(url: dataType) : dataType | actionType,
fetch : dataType | actionType,
fetch(profile: { url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}) : dataType | actionType,
fetch(url: dataType) : dataType | actionType,
}
declare var http : http;,type jison = {
parse : dataType,
parse(profile: { parser: jison_parserType, goal: dataType, text: dataType, debug: booleanType}) : dataType,
parse(parser: jison_parserType) : dataType,
parser : jison_parserType,
parser(profile: { lex: [lexer_ruleType], bnf: [bnf_expressionType], 
/** [["left", "+", "-"]] */operators: [dataType]}) : jison_parserType,
}
declare var jison : jison;,type lexer = {
tokens : lexer_ruleType,
tokens(
/** e.g. -,+,*,%,for,== */tokens: dataType) : lexer_ruleType,
ignoreWhiteSpace : lexer_ruleType,
ignoreWhiteSpace() : lexer_ruleType,
number : lexer_ruleType,
number() : lexer_ruleType,
identifier : lexer_ruleType,
identifier(regex: dataType) : lexer_ruleType,
EOF : lexer_ruleType,
EOF() : lexer_ruleType,
}
declare var lexer : lexer;,type fs = {
readFile : dataType,
readFile(fileName: dataType, directory: dataType) : dataType,
readFile(fileName: dataType) : dataType,
stat : dataType,
stat(fileName: dataType, directory: dataType) : dataType,
stat(fileName: dataType) : dataType,
readdir : dataType,
readdir(directory: dataType) : dataType,
directoryContent : dataType,
directoryContent(directory: dataType, filter: booleanType) : dataType,
directoryContent(directory: dataType) : dataType,
}
declare var fs : fs;,type uiTest = {
applyVdomDiff : testType,
applyVdomDiff(controlBefore: controlType, control: controlType) : testType,
applyVdomDiff(controlBefore: controlType) : testType,
}
declare var uiTest : uiTest;,type uiAction = {
click : ui_actionType,
click(selector: dataType, methodToActivate: dataType) : ui_actionType,
click(selector: dataType) : ui_actionType,
keyboardEvent : ui_actionType,
keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType,
keyboardEvent(selector: dataType) : ui_actionType,
setText : ui_actionType,
setText(value: dataType, selector: dataType) : ui_actionType,
setText(value: dataType) : ui_actionType,
scrollDown : ui_actionType,
scrollDown(selector: dataType) : ui_actionType,
}
declare var uiAction : uiAction;,type test = {
dialogContent : dataType,
dialogContent(id: dataType) : dataType,
}
declare var test : test;,type animation = {
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
declare var animation : animation;,type dataResource = {
angrybirdsPosts : dataType,
angrybirdsPosts() : dataType,
}
declare var dataResource : dataResource;,type feature = {
init : featureType,
init(action: [actionType], 
/** init funcs from different features can use each other, phase defines the calculation order */phase: dataType) : featureType,
destroy : featureType,
destroy(...action: [actionType][]) : featureType,
beforeInit : featureType,
beforeInit(...action: [actionType][]) : featureType,
afterLoad : featureType,
afterLoad(...action: [actionType][]) : featureType,
onDataChange : featureType,
onDataChange(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** run on change */action: actionType}) : featureType,
onDataChange(
/** reference to data */ref: dataType) : featureType,
hoverTitle : featureType,
hoverTitle(title: dataType) : featureType,
if : featureType,
if(showCondition: booleanType) : featureType,
keyboardShortcut : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType,
onEvent : featureType,
onEvent(profile: { event: dataType, action: [actionType], 
/** used for mouse events such as mousemove */debounceTime: dataType}) : featureType,
onEvent(event: dataType) : featureType,
onHover : featureType,
onHover(profile: { action: [actionType], onLeave: [actionType], debounceTime: dataType}) : featureType,
classOnHover : featureType,
classOnHover(
/** css class to add/remove on hover */class: stringType) : featureType,
onKey : featureType,
onKey(profile: { 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType, doNotWrapWithLauchingElement: booleanType}) : featureType,
onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : featureType,
onEnter : featureType,
onEnter(...action: [actionType][]) : featureType,
onEsc : featureType,
onEsc(...action: [actionType][]) : featureType,
byCondition : featureType,
byCondition(profile: { condition: booleanType, then: featureType, else: featureType}) : featureType,
byCondition(condition: booleanType) : featureType,
icon : featureType,
icon(profile: { icon: dataType, title: dataType, position: dataType, type: dataType, size: dataType, style: icon_styleType, features: [featureType]}) : featureType,
icon(icon: dataType) : featureType,
}
declare var feature : feature;,type group = {
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
itemlistContainer : featureType,
itemlistContainer(profile: { id: dataType, defaultItem: dataType, initialSelection: dataType}) : featureType,
itemlistContainer(id: dataType) : featureType,
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
tabs : group_styleType,
tabs(profile: { tabStyle: button_styleType, barStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType,
tabs(tabStyle: button_styleType) : group_styleType,
accordion : group_styleType,
accordion(profile: { titleStyle: button_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType,
accordion(titleStyle: button_styleType) : group_styleType,
theme : featureType,
theme(theme: themeType) : featureType,
}
declare var group : group;,type css = {
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
boxShadow(profile: { blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}) : featureType | dialog_featureType,
boxShadow(blurRadius: dataType) : featureType | dialog_featureType,
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
closeContainingPopup : actionType,
closeContainingPopup(OK: booleanType) : actionType,
default : dialog_styleType,
default() : dialog_styleType,
closeDialog : actionType,
closeDialog(id: dataType, delay: dataType) : actionType,
closeDialog(id: dataType) : actionType,
closeAll : actionType,
closeAll() : actionType,
dialogOkCancel : dialog_styleType,
dialogOkCancel(okLabel: dataType, cancelLabel: dataType) : dialog_styleType,
dialogOkCancel(okLabel: dataType) : dialog_styleType,
popup : dialog_styleType,
popup() : dialog_styleType,
transparentPopup : dialog_styleType,
transparentPopup() : dialog_styleType,
div : dialog_styleType,
div() : dialog_styleType,
contextMenuPopup : dialog_styleType,
contextMenuPopup(profile: { offsetTop: dataType, rightSide: booleanType, toolbar: booleanType}) : dialog_styleType,
contextMenuPopup(offsetTop: dataType) : dialog_styleType,
}
declare var dialog : dialog;,type dialogFeature = {
uniqueDialog : dialog_featureType,
uniqueDialog(id: dataType, remeberLastLocation: booleanType) : dialog_featureType,
uniqueDialog(id: dataType) : dialog_featureType,
dragTitle : dialog_featureType,
dragTitle(id: dataType, selector: dataType) : dialog_featureType,
dragTitle(id: dataType) : dialog_featureType,
nearLauncherPosition : dialog_featureType,
nearLauncherPosition(profile: { offsetLeft: dataType, offsetTop: dataType, rightSide: booleanType}) : dialog_featureType,
nearLauncherPosition(offsetLeft: dataType) : dialog_featureType,
onClose : dialog_featureType,
onClose(action: actionType) : dialog_featureType,
closeWhenClickingOutside : dialog_featureType,
closeWhenClickingOutside(delay: dataType) : dialog_featureType,
autoFocusOnFirstInput : dialog_featureType,
autoFocusOnFirstInput(selectText: booleanType) : dialog_featureType,
cssClassOnLaunchingElement : dialog_featureType,
cssClassOnLaunchingElement() : dialog_featureType,
maxZIndexOnClick : dialog_featureType,
maxZIndexOnClick(minZIndex: dataType) : dialog_featureType,
resizer : dialog_featureType,
resizer(
/** effective only for dialog with a single codemirror element */resizeInnerCodemirror: booleanType) : dialog_featureType,
}
declare var dialogFeature : dialogFeature;,type divider = {
br : divider_styleType,
br() : divider_styleType,
flexAutoGrow : divider_styleType,
flexAutoGrow() : divider_styleType,
}
declare var divider : divider;,type editableText = {
xButton : featureType,
xButton() : featureType,
helperPopup : featureType,
helperPopup(profile: { control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: booleanType, autoOpen: booleanType, onEnter: actionType, onEsc: actionType}) : featureType,
helperPopup(control: controlType) : featureType,
codemirror : editable_text_styleType,
codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}) : editable_text_styleType,
codemirror(cm_settings: dataType) : editable_text_styleType,
input : editable_text_styleType,
input() : editable_text_styleType,
textarea : editable_text_styleType,
textarea(profile: { rows: dataType, cols: dataType, oneWay: booleanType}) : editable_text_styleType,
textarea(rows: dataType) : editable_text_styleType,
mdcNoLabel : editable_text_styleType,
mdcNoLabel(width: dataType) : editable_text_styleType,
mdcSearch : editable_text_styleType,
mdcSearch() : editable_text_styleType,
expandable : editable_text_styleType,
expandable(profile: { buttonFeatures: [featureType], editableFeatures: [featureType], buttonStyle: button_styleType, editableStyle: editable_text_styleType, onToggle: actionType}) : editable_text_styleType,
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
keyboardShortcut : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType,
toolbar : featureType,
toolbar(toolbar: controlType) : featureType,
title : featureType,
title(title: dataType) : featureType,
columnWidth : featureType,
columnWidth(width: dataType) : featureType,
index : table_fieldType,
index(profile: { title: dataType, width: dataType, class: dataType}) : table_fieldType,
index(title: dataType) : table_fieldType,
control : table_fieldType,
control(profile: { title: dataType, control: controlType, width: dataType, dataForSort: dataType, numeric: booleanType}) : table_fieldType,
control(title: dataType) : table_fieldType,
}
declare var field : field;,type html = {
plain : html_styleType,
plain() : html_styleType,
inIframe : html_styleType,
inIframe(width: dataType, height: dataType) : html_styleType,
inIframe(width: dataType) : html_styleType,
}
declare var html : html;,type icon = {
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
declare var image : image;,type itemlist = {
itemlistSelected : featureType,
itemlistSelected() : featureType,
noContainer : featureType,
noContainer() : featureType,
initContainerWithItems : featureType,
initContainerWithItems() : featureType,
init : featureType,
init() : featureType,
initTable : featureType,
initTable() : featureType,
infiniteScroll : featureType,
infiniteScroll(pageSize: dataType) : featureType,
fastFilter : featureType,
fastFilter(showCondition: dataType, filtersRef: dataType) : featureType,
fastFilter(showCondition: dataType) : featureType,
ulLi : itemlist_styleType,
ulLi() : itemlist_styleType,
div : itemlist_styleType,
div(spacing: dataType) : itemlist_styleType,
horizontal : itemlist_styleType,
horizontal(spacing: dataType) : itemlist_styleType,
selection : featureType,
selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: #bbb */cssForSelected: dataType}) : featureType,
selection(databind: dataType) : featureType,
keyboardSelection : featureType,
keyboardSelection(autoFocus: booleanType, onEnter: actionType) : featureType,
keyboardSelection(autoFocus: booleanType) : featureType,
dragAndDrop : featureType,
dragAndDrop() : featureType,
dragHandle : featureType,
dragHandle() : featureType,
shownOnlyOnItemHover : featureType,
shownOnlyOnItemHover() : featureType,
divider : featureType,
divider(space: dataType) : featureType,
}
declare var itemlist : itemlist;,type itemlistContainer = {
filter : aggregatorType,
filter(updateCounters: booleanType) : aggregatorType,
conditionFilter : booleanType,
conditionFilter() : booleanType,
search : controlType,
search(profile: { title: dataType, searchIn: search_inType, databind: dataType, style: editable_text_styleType, features: [featureType]}) : controlType,
search(title: dataType) : controlType,
filterField : featureType,
filterField(fieldData: dataType, filterType: filter_typeType) : featureType,
filterField(fieldData: dataType) : featureType,
searchInAllProperties : search_inType,
searchInAllProperties() : search_inType,
fuseOptions : search_inType,
fuseOptions(profile: { keys: dataType, findAllMatches: booleanType, isCaseSensitive: booleanType, includeScore: booleanType, includeMatches: booleanType, minMatchCharLength: dataType, shouldSort: booleanType}) : search_inType,
fuseOptions(keys: dataType) : search_inType,
}
declare var itemlistContainer : itemlistContainer;,type filterType = {
text : filter_typeType,
text(ignoreCase: booleanType) : filter_typeType,
exactMatch : filter_typeType,
exactMatch() : filter_typeType,
numeric : filter_typeType,
numeric() : filter_typeType,
}
declare var filterType : filterType;,type markdown = {
showdown : markdown_styleType,
showdown() : markdown_styleType,
}
declare var markdown : markdown;,type menu = {
menu : menu_optionType,
menu(profile: { title: dataType, options: [menu_optionType], icon: iconType, optionsFilter: dataType}) : menu_optionType,
menu(title: dataType) : menu_optionType,
optionsGroup : menu_optionType,
optionsGroup(...options: [menu_optionType][]) : menu_optionType,
dynamicOptions : menu_optionType,
dynamicOptions(items: dataType, genericOption: menu_optionType) : menu_optionType,
dynamicOptions(items: dataType) : menu_optionType,
endWithSeparator : menu_optionType,
endWithSeparator(profile: { options: [menu_optionType], separator: menu_optionType, title: dataType}) : menu_optionType,
separator : menu_optionType,
separator() : menu_optionType,
action : menu_optionType,
action(profile: { title: dataType, action: actionType, icon: iconType, shortcut: dataType, showCondition: booleanType}) : menu_optionType,
action(title: dataType) : menu_optionType,
initPopupMenu : featureType,
initPopupMenu(popupStyle: dialog_styleType) : featureType,
initMenuOption : featureType,
initMenuOption() : featureType,
}
declare var menu : menu;,type menuStyle = {
popupAsOption : menu_styleType,
popupAsOption() : menu_styleType,
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
}
declare var multiSelect : multiSelect;,type picklist = {
init : featureType,
init() : featureType,
initGroups : featureType,
initGroups() : featureType,
dynamicOptions : featureType,
dynamicOptions(recalcEm: dataType) : featureType,
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
native : picklist_styleType,
native() : picklist_styleType,
plusIcon : featureType,
plusIcon() : featureType,
radio : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType,
radioVertical : picklist_styleType,
radioVertical() : picklist_styleType,
mdcSelect : picklist_styleType,
mdcSelect(profile: { width: dataType, noLabel: booleanType, noRipple: booleanType}) : picklist_styleType,
mdcSelect(width: dataType) : picklist_styleType,
nativeMdLookOpen : picklist_styleType,
nativeMdLookOpen() : picklist_styleType,
nativeMdLook : picklist_styleType,
nativeMdLook() : picklist_styleType,
labelList : picklist_styleType,
labelList(profile: { labelStyle: text_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType,
labelList(labelStyle: text_styleType) : picklist_styleType,
buttonList : picklist_styleType,
buttonList(profile: { buttonStyle: button_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red;color: blue;font-weight: bold; */cssForSelected: dataType}) : picklist_styleType,
buttonList(buttonStyle: button_styleType) : picklist_styleType,
hyperlinks : picklist_styleType,
hyperlinks() : picklist_styleType,
groups : picklist_styleType,
groups() : picklist_styleType,
}
declare var picklist : picklist;,type slider = {
initJbModelWithUnits : featureType,
initJbModelWithUnits() : featureType,
init : featureType,
init() : featureType,
checkAutoScale : featureType,
checkAutoScale() : featureType,
handleArrowKeys : featureType,
handleArrowKeys() : featureType,
}
declare var slider : slider;,type button = {
href : button_styleType,
href() : button_styleType,
x : button_styleType,
x(size: dataType) : button_styleType,
native : button_styleType,
native() : button_styleType,
plainIcon : button_styleType,
plainIcon() : button_styleType,
mdcIcon : button_styleType | icon_styleType,
mdcIcon(icon: iconType, 
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType) : button_styleType | icon_styleType,
mdcIcon(icon: iconType) : button_styleType | icon_styleType,
mdcHeader : button_styleType,
mdcHeader(stretch: booleanType) : button_styleType,
tableCellHref : button_styleType,
tableCellHref() : button_styleType,
}
declare var button : button;,type text = {
codemirror : text_styleType,
codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: booleanType}) : text_styleType,
codemirror(cm_settings: dataType) : text_styleType,
bindText : featureType,
bindText() : featureType,
allowAsynchValue : featureType,
allowAsynchValue() : featureType,
htmlTag : text_styleType,
htmlTag(htmlTag: dataType, cssClass: dataType) : text_styleType,
htmlTag(htmlTag: dataType) : text_styleType,
noWrappingTag : text_styleType,
noWrappingTag() : text_styleType,
span : text_styleType,
span() : text_styleType,
chip : text_styleType,
chip() : text_styleType,
highlight : dataType,
highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType,
highlight(base: dataType) : dataType,
}
declare var text : text;,type editableBoolean = {
checkbox : editable_boolean_styleType,
checkbox() : editable_boolean_styleType,
checkboxWithTitle : editable_boolean_styleType,
checkboxWithTitle() : editable_boolean_styleType,
checkboxWithLabel : editable_boolean_styleType,
checkboxWithLabel() : editable_boolean_styleType,
expandCollapse : editable_boolean_styleType,
expandCollapse() : editable_boolean_styleType,
buttonXV : editable_boolean_styleType,
buttonXV(profile: { yesIcon: iconType, noIcon: iconType, buttonStyle: button_styleType}) : editable_boolean_styleType,
buttonXV(yesIcon: iconType) : editable_boolean_styleType,
iconWithSlash : editable_boolean_styleType,
iconWithSlash(
/** button size is larger than the icon size, usually at the rate of 40/24 */buttonSize: dataType) : editable_boolean_styleType,
}
declare var editableBoolean : editableBoolean;,type layout = {
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
declare var mdcStyle : mdcStyle;,type mdc = {
rippleEffect : featureType,
rippleEffect() : featureType,
}
declare var mdc : mdc;,type label = {
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
declare var propertySheet : propertySheet;,type table = {
initTableOrItemlist : featureType,
initTableOrItemlist() : featureType,
init : featureType,
init() : featureType,
initSort : featureType,
initSort() : featureType,
}
declare var table : table;,type header = {
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
plain : tree_styleType,
plain(showIcon: booleanType, noHead: booleanType) : tree_styleType,
plain(showIcon: booleanType) : tree_styleType,
expandBox : tree_styleType,
expandBox(profile: { showIcon: booleanType, noHead: booleanType, lineWidth: dataType}) : tree_styleType,
expandBox(showIcon: booleanType) : tree_styleType,
selection : featureType,
selection(profile: { databind: dataType, autoSelectFirst: booleanType, onSelection: actionType, onRightClick: actionType}) : featureType,
selection(databind: dataType) : featureType,
keyboardSelection : featureType,
keyboardSelection(profile: { onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}) : featureType,
keyboardSelection(onKeyboardSelection: actionType) : featureType,
regainFocus : actionType,
regainFocus() : actionType,
redraw : actionType,
redraw(strong: booleanType) : actionType,
expandPath : actionType,
expandPath(paths: dataType) : actionType,
pathOfInteractiveItem : dataType,
pathOfInteractiveItem() : dataType,
dragAndDrop : featureType,
dragAndDrop() : featureType,
}
declare var tree : tree;,type tableTree = {
expandPath : table_tree_styleType,
expandPath(path: dataType) : table_tree_styleType,
}
declare var tableTree : tableTree;,type urlHistory = {
mapUrlToResource : actionType,
mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType,
}
declare var urlHistory : urlHistory;,type worker = {
main : remoteType,
main() : remoteType,
}
declare var worker : worker;,type remote = {
initMainWorker : controlType,
initMainWorker(sourceUrl: dataType, remote: remoteType) : controlType,
initMainWorker(sourceUrl: dataType) : controlType,
widget : controlType,
widget(profile: { 
/** main profile to run */main: dataType, id: dataType, remote: remoteType}) : controlType,
widget(
/** main profile to run */main: dataType) : controlType,
}
declare var remote : remote;,type textEditor = {
withCursorPath : actionType,
withCursorPath(action: actionType, selector: dataType) : actionType,
withCursorPath(action: actionType) : actionType,
isDirty : dataType,
isDirty() : dataType,
}
declare var textEditor : textEditor;