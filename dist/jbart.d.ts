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
type dataType = pipelinePT | pipePT | data_ifPT | listPT | first_succeedingPT | keysPT | propertiesPT | entriesPT | eval_expressionPT | prefixPT | suffixPT | remove_prefixPT | remove_suffixPT | remove_suffix_regexPT | propertyPT | index_ofPT | objPT | extendPT | assignPT | IfPT | to_uppercasePT | to_lowercasePT | capitalizePT | logPT | asIsPT | objectPT | json_stringifyPT | json_parsePT | splitPT | replacePT | extract_prefixPT | extract_suffixPT | rangePT | type_ofPT | class_namePT | http_getPT | http_fetchPT | isRefPT | asRefPT | data_switchPT | jison_parsePT | extract_textPT | break_textPT | zip_arraysPT | remove_sectionsPT | mergePT | dynamic_objectPT | filter_empty_propertiesPT | trimPT | remove_prefix_regexPT | pretty_printPT | fs_readFilePT | fs_statPT | fs_readdirPT | fs_directory_contentPT | test_dialog_contentPT | field_dataPT | itemlist_container_search_in_all_propertiesPT | label_highlightPT | custom_stylePT | style_by_controlPT | style_with_featuresPT | json_path_selectorPT | watchable_as_textPT | text_editor_is_dirtyPT | ((ctx: ctx) => any)
type cmp_def_dataType = {
	type: 'data',
	params?: [param],
	impl: dataType,
}
type pipelinePT = {$: 'pipeline', items: dataType | [aggregatorType]}
type pipePT = {$: 'pipe', items: dataType | [aggregatorType]}
type data_ifPT = {$: 'data.if', condition: booleanType, then: dataType, else: dataType}
type listPT = {$: 'list', items: [dataType]}
type first_succeedingPT = {$: 'first-succeeding', items: [dataType]}
type keysPT = {$: 'keys', obj: dataType}
type propertiesPT = {$: 'properties', obj: dataType}
type entriesPT = {$: 'entries', obj: dataType}
type eval_expressionPT = {$: 'eval-expression', expression: dataType}
type prefixPT = {$: 'prefix', separator: dataType, text: dataType}
type suffixPT = {$: 'suffix', separator: dataType, text: dataType}
type remove_prefixPT = {$: 'remove-prefix', separator: dataType, text: dataType}
type remove_suffixPT = {$: 'remove-suffix', separator: dataType, text: dataType}
type remove_suffix_regexPT = {$: 'remove-suffix-regex', 
/** regular expression. e.g [0-9]* */suffix: dataType, text: dataType}
type propertyPT = {$: 'property', prop: dataType, obj: dataType}
type index_ofPT = {$: 'index-of', array: dataType, item: dataType}
type objPT = {$: 'obj', props: [propType]}
type extendPT = {$: 'extend', props: [propType]}
type assignPT = {$: 'assign', props: [propType]}
type IfPT = {$: 'If', condition: booleanType, then: dataType, Else: dataType}
type to_uppercasePT = {$: 'to-uppercase', text: dataType}
type to_lowercasePT = {$: 'to-lowercase', text: dataType}
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
type extract_prefixPT = {$: 'extract-prefix', 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}
type extract_suffixPT = {$: 'extract-suffix', 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType}
type rangePT = {$: 'range', from: dataType, to: dataType}
type type_ofPT = {$: 'type-of', obj: dataType}
type class_namePT = {$: 'class-name', obj: dataType}
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type isRefPT = {$: 'isRef', obj: dataType}
type asRefPT = {$: 'asRef', obj: dataType}
type data_switchPT = {$: 'data.switch', cases: [data_switch_caseType], default: dataType}
type jison_parsePT = {$: 'jison.parse', parser: jison_parserType, goal: dataType, text: dataType, debug: booleanType}
type extract_textPT = {$: 'extract-text', text: dataType, startMarkers: [dataType], endMarker: dataType, 
/** include the marker at part of the result */includingStartMarker: booleanType, 
/** include the marker at part of the result */includingEndMarker: booleanType, 
/** apply the markers repeatingly */repeating: booleanType, noTrim: booleanType, 
/** use regular expression in markers */useRegex: booleanType, 
/** return the inverse result. E.g. exclude remarks */exclude: booleanType}
type break_textPT = {$: 'break-text', text: dataType, 
/** multi level separators */separators: dataType, 
/** use regular expression in separators */useRegex: booleanType}
type zip_arraysPT = {$: 'zip-arrays', 
/** array of arrays */value: dataType}
type remove_sectionsPT = {$: 'remove-sections', text: dataType, startMarker: dataType, endMarker: dataType, keepEndMarker: booleanType}
type mergePT = {$: 'merge', objects: dataType}
type dynamic_objectPT = {$: 'dynamic-object', items: dataType, propertyName: dataType, value: dataType}
type filter_empty_propertiesPT = {$: 'filter-empty-properties', obj: dataType}
type trimPT = {$: 'trim', text: dataType}
type remove_prefix_regexPT = {$: 'remove-prefix-regex', prefix: dataType, text: dataType}
type pretty_printPT = {$: 'pretty-print', profile: dataType, colWidth: dataType}
type fs_readFilePT = {$: 'fs.readFile', fileName: dataType, directory: dataType}
type fs_statPT = {$: 'fs.stat', fileName: dataType, directory: dataType}
type fs_readdirPT = {$: 'fs.readdir', directory: dataType}
type fs_directory_contentPT = {$: 'fs.directory-content', directory: dataType, filter: booleanType}
type test_dialog_contentPT = {$: 'test.dialog-content', id: dataType}
type field_dataPT = {$: 'field.data', }
type itemlist_container_search_in_all_propertiesPT = {$: 'itemlist-container.search-in-all-properties', }
type label_highlightPT = {$: 'label.highlight', base: dataType, highlight: dataType, cssClass: dataType}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type json_path_selectorPT = {$: 'json.path-selector', 
/** object to start with */base: dataType, 
/** string with  separator or array */path: dataType}
type watchable_as_textPT = {$: 'watchable-as-text', ref: dataType}
type text_editor_is_dirtyPT = {$: 'text-editor.is-dirty', }

// type aggregator
type aggregatorType = aggregatePT | math_maxPT | math_minPT | math_sumPT | slicePT | sortPT | firstPT | lastPT | countPT | reversePT | samplePT | extend_with_indexPT | filterPT | joinPT | uniquePT | wrap_as_objectPT | itemlist_container_filterPT | ((ctx: ctx) => any)
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
type firstPT = {$: 'first', }
type lastPT = {$: 'last', }
type countPT = {$: 'count', items: dataType}
type reversePT = {$: 'reverse', items: dataType}
type samplePT = {$: 'sample', size: dataType, items: dataType}
type extend_with_indexPT = {$: 'extend-with-index', props: [propType]}
type filterPT = {$: 'filter', filter: booleanType}
type joinPT = {$: 'join', separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemName: dataType, itemText: dataType}
type uniquePT = {$: 'unique', id: dataType, items: dataType}
type wrap_as_objectPT = {$: 'wrap-as-object', propertyName: dataType, value: dataType, items: dataType}
type itemlist_container_filterPT = {$: 'itemlist-container.filter', updateCounters: booleanType}

// type boolean
type booleanType = notPT | andPT | orPT | betweenPT | containsPT | not_containsPT | starts_withPT | ends_withPT | match_regexPT | isNullPT | isEmptyPT | notEmptyPT | equalsPT | not_equalsPT | is_of_typePT | in_groupPT | itemlist_container_condition_filterPT | ((ctx: ctx) => any)
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
type not_containsPT = {$: 'not-contains', text: [dataType], allText: dataType}
type starts_withPT = {$: 'starts-with', startsWith: dataType, text: dataType}
type ends_withPT = {$: 'ends-with', endsWith: dataType, text: dataType}
type match_regexPT = {$: 'match-regex', 
/** e.g: [a-zA-Z]* */regex: dataType, text: dataType}
type isNullPT = {$: 'isNull', obj: dataType}
type isEmptyPT = {$: 'isEmpty', item: dataType}
type notEmptyPT = {$: 'notEmpty', item: dataType}
type equalsPT = {$: 'equals', item1: dataType, item2: dataType}
type not_equalsPT = {$: 'not-equals', item1: dataType, item2: dataType}
type is_of_typePT = {$: 'is-of-type', 
/** e.g., string,boolean,array */type: dataType, obj: dataType}
type in_groupPT = {$: 'in-group', group: dataType, item: dataType}
type itemlist_container_condition_filterPT = {$: 'itemlist-container.condition-filter', }

// type action
type actionType = action_ifPT | jb_runPT | write_valuePT | add_to_arrayPT | splicePT | remove_from_arrayPT | toggle_boolean_valuePT | touchPT | runActionsPT | run_action_on_itemsPT | delayPT | on_next_timerPT | http_getPT | http_fetchPT | action_switchPT | write_value_asynchPT | animation_startPT | animation_timelinePT | refresh_control_by_idPT | focus_on_first_elementPT | dialog_close_containing_popupPT | dialog_close_dialogPT | dialog_close_allPT | tree_regain_focusPT | tree_redrawPT | tree_expand_pathPT | url_history_map_url_to_resourcePT | text_editor_with_cursor_pathPT | run_transactionPT | goto_urlPT | ((ctx: ctx) => any)
type cmp_def_actionType = {
	type: 'action',
	params?: [param],
	impl: actionType,
}
type action_ifPT = {$: 'action.if', condition: booleanType, then: actionType, else: actionType}
type jb_runPT = {$: 'jb-run', 
/** profile name */profile: dataType, params: dataType}
type write_valuePT = {$: 'write-value', to: dataType, value: dataType}
type add_to_arrayPT = {$: 'add-to-array', array: dataType, toAdd: dataType}
type splicePT = {$: 'splice', array: dataType, fromIndex: dataType, noOfItemsToRemove: dataType, itemsToAdd: dataType}
type remove_from_arrayPT = {$: 'remove-from-array', array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}
type toggle_boolean_valuePT = {$: 'toggle-boolean-value', of: dataType}
type touchPT = {$: 'touch', data: dataType}
type runActionsPT = {$: 'runActions', actions: [actionType]}
type run_action_on_itemsPT = {$: 'run-action-on-items', items: dataType, action: actionType, 
/** notification for watch-ref, defualt behavior is after each action */notifications: dataType}
type delayPT = {$: 'delay', mSec: dataType}
type on_next_timerPT = {$: 'on-next-timer', action: actionType, delay: numberType}
type http_getPT = {$: 'http.get', url: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type http_fetchPT = {$: 'http.fetch', url: dataType, method: dataType, headers: dataType, body: dataType, 
/** convert result to json */json: booleanType, useProxy: dataType}
type action_switchPT = {$: 'action.switch', cases: [action_switch_caseType], defaultAction: actionType}
type write_value_asynchPT = {$: 'write-value-asynch', to: dataType, value: dataType}
type animation_startPT = {$: 'animation.start', animation: [animationType], 
/** query selector or elements, default is current control */target: dataType, 
/** alternate goes back to origin */direction: dataType, loop: booleanType, 
/** in mSec */duration: dataType}
type animation_timelinePT = {$: 'animation.timeline', animation: [animationType], 
/** query selector, default is current control */target: dataType}
type refresh_control_by_idPT = {$: 'refresh-control-by-id', id: dataType}
type focus_on_first_elementPT = {$: 'focus-on-first-element', selector: dataType}
type dialog_close_containing_popupPT = {$: 'dialog.close-containing-popup', OK: booleanType}
type dialog_close_dialogPT = {$: 'dialog.close-dialog', id: dataType, delay: dataType}
type dialog_close_allPT = {$: 'dialog.close-all', }
type tree_regain_focusPT = {$: 'tree.regain-focus', }
type tree_redrawPT = {$: 'tree.redraw', strong: booleanType}
type tree_expand_pathPT = {$: 'tree.expand-path', paths: dataType}
type url_history_map_url_to_resourcePT = {$: 'url-history.map-url-to-resource', params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}
type text_editor_with_cursor_pathPT = {$: 'text-editor.with-cursor-path', action: actionType, selector: dataType}
type run_transactionPT = {$: 'run-transaction', actions: [actionType], disableNotifications: booleanType}
type goto_urlPT = {$: 'goto-url', url: dataType, target: enumType}

// type prop
type propType = propPT | ((ctx: ctx) => any)
type cmp_def_propType = {
	type: 'prop',
	params?: [param],
	impl: propType,
}
type propPT = {$: 'prop', title: dataType, val: dataType, type: dataType}

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
type action_switch_caseType = action_switch_casePT | ((ctx: ctx) => any)
type cmp_def_action_switch_caseType = {
	type: 'action_switch_case',
	params?: [param],
	impl: action_switch_caseType,
}
type action_switch_casePT = {$: 'action.switch-case', condition: booleanType, action: actionType}

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
type lexer_ruleType = lexer_tokensPT | lexer_ignore_white_spacePT | lexer_numberPT | lexer_identifierPT | lexer_EOFPT | lexer_rulePT | ((ctx: ctx) => any)
type cmp_def_lexer_ruleType = {
	type: 'lexer_rule',
	params?: [param],
	impl: lexer_ruleType,
}
type lexer_tokensPT = {$: 'lexer.tokens', 
/** e.g. -,+,*,%,for,== */tokens: dataType}
type lexer_ignore_white_spacePT = {$: 'lexer.ignore-white-space', }
type lexer_numberPT = {$: 'lexer.number', }
type lexer_identifierPT = {$: 'lexer.identifier', regex: dataType}
type lexer_EOFPT = {$: 'lexer.EOF', }
type lexer_rulePT = {$: 'lexer-rule', 
/** [a-f0-9]+ */regex: dataType, 
/** return 'Hex'; */result: dataType}

// type bnf-expression
type bnf_expressionType = bnf_expressionPT | ((ctx: ctx) => any)
type cmp_def_bnf_expressionType = {
	type: 'bnf_expression',
	params?: [param],
	impl: bnf_expressionType,
}
type bnf_expressionPT = {$: 'bnf-expression', id: dataType, options: [expression_optionType]}

// type expression-option
type expression_optionType = expression_optionPT | ((ctx: ctx) => any)
type cmp_def_expression_optionType = {
	type: 'expression_option',
	params?: [param],
	impl: expression_optionType,
}
type expression_optionPT = {$: 'expression-option', 
/** e + e */syntax: dataType, 
/** $$ = $1 + $2; */calculate: dataType}

// type test
type testType = data_testPT | ui_testPT | ((ctx: ctx) => any)
type cmp_def_testType = {
	type: 'test',
	params?: [param],
	impl: testType,
}
type data_testPT = {$: 'data-test', calculate: dataType, runBefore: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType}
type ui_testPT = {$: 'ui-test', control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType}

// type ui-action
type ui_actionType = ui_action_clickPT | ui_action_keyboard_eventPT | ui_action_set_textPT | ((ctx: ctx) => any)
type cmp_def_ui_actionType = {
	type: 'ui_action',
	params?: [param],
	impl: ui_actionType,
}
type ui_action_clickPT = {$: 'ui-action.click', selector: dataType, methodToActivate: dataType}
type ui_action_keyboard_eventPT = {$: 'ui-action.keyboard-event', selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}
type ui_action_set_textPT = {$: 'ui-action.set-text', value: dataType, selector: dataType, delay: dataType}

// type animation
type animationType = animation_keyframesPT | animation_directionPT | animation_durationPT | animation_delayPT | animation_move_toPT | animation_rotatePT | animation_scalePT | animation_skewPT | animation_perspectivePT | animation_easingPT | animation_movementPT | ((ctx: ctx) => any)
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
type animation_move_toPT = {$: 'animation.move-to', 
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
type animation_stager_gridType = animation_stager_gridPT | ((ctx: ctx) => any)
type cmp_def_animation_stager_gridType = {
	type: 'animation_stager_grid',
	params?: [param],
	impl: animation_stager_gridType,
}
type animation_stager_gridPT = {$: 'animation.stager-grid', 
/** e.g. 2 */rows: dataType, 
/** e.g. 5 */columns: dataType, 
/** direction of staggering */axis: dataType}

// type animation.stager-val
type animation_stager_valType = animation_stager_increasePT | animation_stager_rangePT | ((ctx: ctx) => any)
type cmp_def_animation_stager_valType = {
	type: 'animation_stager_val',
	params?: [param],
	impl: animation_stager_valType,
}
type animation_stager_increasePT = {$: 'animation.stager-increase', 
/** e.g. 20 */increase: dataType, 
/** optional, e.g. 10 */start: dataType}
type animation_stager_rangePT = {$: 'animation.stager-range', 
/** e.g. 20 */from: dataType, 
/** e.g. 30 */to: dataType}

// type animation.easing
type animation_easingType = animation_in_out_easingPT | animation_elastic_easingPT | animation_spring_easingPT | ((ctx: ctx) => any)
type cmp_def_animation_easingType = {
	type: 'animation_easing',
	params?: [param],
	impl: animation_easingType,
}
type animation_in_out_easingPT = {$: 'animation.in-out-easing', method: dataType, inOut: dataType}
type animation_elastic_easingPT = {$: 'animation.elastic-easing', inOut: dataType, 
/** 1-10  Controls the overshoot of the curve */amplitude: dataType, 
/** 0.1-2 Controls how many times the curve goes back and forth */period: dataType}
type animation_spring_easingPT = {$: 'animation.spring-easing', 
/** 0-100 */mass: dataType, 
/** 0-100 */stiffness: dataType, 
/** 0-100 */damping: dataType, 
/** 0-100 */velocity: dataType}

// type position
type positionType = animation_fixed_posPT | ((ctx: ctx) => any)
type cmp_def_positionType = {
	type: 'position',
	params?: [param],
	impl: positionType,
}
type animation_fixed_posPT = {$: 'animation.fixed-pos', top: dataType, left: dataType}

// type feature
type featureType = ctrl_actionPT | alt_actionPT | button_disabledPT | card_initPT | feature_lightPT | watch_refPT | watch_observablePT | group_dataPT | html_attributePT | idPT | feature_hover_titlePT | variablePT | calculated_varPT | feature_initPT | feature_after_loadPT | feature_ifPT | hiddenPT | conditional_classPT | feature_keyboard_shortcutPT | feature_onEventPT | feature_onHoverPT | feature_onKeyPT | feature_onEnterPT | feature_onEscPT | group_auto_focus_on_first_inputPT | cssPT | css_dynamicPT | css_with_conditionPT | css_classPT | css_widthPT | css_heightPT | css_opacityPT | css_paddingPT | css_marginPT | css_transform_rotatePT | css_colorPT | css_transform_scalePT | css_boldPT | css_underlinePT | css_box_shadowPT | css_borderPT | d3_scatter_initPT | editable_boolean_keyboard_supportPT | editable_text_x_buttonPT | editable_text_helper_popupPT | field_databindPT | field_databind_textPT | field_defaultPT | field_init_valuePT | field_keyboard_shortcutPT | field_subscribePT | field_on_changePT | field_toolbarPT | validationPT | field_titlePT | field_column_widthPT | group_init_groupPT | group_dynamic_titlesPT | group_first_succeedingPT | group_itemlist_containerPT | itemlist_itemlist_selectedPT | itemlist_container_filter_fieldPT | itemlist_watch_items_with_headingPT | itemlist_no_containerPT | itemlist_initPT | itemlist_init_tablePT | itemlist_fast_filterPT | itemlist_selectionPT | itemlist_keyboard_selectionPT | itemlist_drag_and_dropPT | itemlist_drag_handlePT | itemlist_shown_only_on_item_hoverPT | itemlist_dividerPT | label_bind_textPT | menu_init_popup_menuPT | menu_init_menu_optionPT | picklist_dynamic_optionsPT | picklist_onChangePT | slider_initPT | slider_handle_arrow_keysPT | group_init_expandablePT | group_init_accordionPT | layout_verticalPT | layout_horizontalPT | layout_horizontal_fixed_splitPT | layout_horizontal_wrappedPT | layout_flexPT | layout_gridPT | flex_item_growPT | flex_item_basisPT | flex_item_align_selfPT | responsive_not_for_phonePT | mdl_style_init_dynamicPT | mdl_ripple_effectPT | table_init_table_or_itemlistPT | table_initPT | table_init_sortPT | group_themePT | tree_selectionPT | tree_keyboard_selectionPT | tree_drag_and_dropPT | textarea_init_textarea_editorPT | ((ctx: ctx) => any)
type cmp_def_featureType = {
	type: 'feature',
	params?: [param],
	impl: featureType,
}
type ctrl_actionPT = {$: 'ctrl-action', action: actionType}
type alt_actionPT = {$: 'alt-action', action: actionType}
type button_disabledPT = {$: 'button-disabled', enabledCondition: booleanType}
type card_initPT = {$: 'card.init', }
type feature_lightPT = {$: 'feature.light', }
type watch_refPT = {$: 'watch-ref', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component, including all features and variables */strongRefresh: booleanType, 
/** recalculate feature variables */recalcVars: booleanType, 
/** delay in activation, can be used to set priority */delay: dataType}
type watch_observablePT = {$: 'watch-observable', toWatch: dataType}
type group_dataPT = {$: 'group.data', data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: booleanType, 
/** watch childern change as well */includeChildren: dataType}
type html_attributePT = {$: 'html-attribute', attribute: dataType, value: dataType}
type idPT = {$: 'id', id: dataType}
type feature_hover_titlePT = {$: 'feature.hover-title', title: dataType}
type variablePT = {$: 'variable', name: dataType, value: dataType, 
/** E.g., selected item variable */watchable: booleanType, 
/** If specified, the var will be defined as global with this id */globalId: dataType}
type calculated_varPT = {$: 'calculated-var', name: dataType, value: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}
type feature_initPT = {$: 'feature.init', action: [actionType]}
type feature_after_loadPT = {$: 'feature.after-load', action: [actionType]}
type feature_ifPT = {$: 'feature.if', showCondition: dataType}
type hiddenPT = {$: 'hidden', showCondition: booleanType}
type conditional_classPT = {$: 'conditional-class', cssClass: dataType, condition: booleanType}
type feature_keyboard_shortcutPT = {$: 'feature.keyboard-shortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type feature_onEventPT = {$: 'feature.onEvent', event: dataType, action: [actionType], 
/** used for mouse events such as mousemove */debounceTime: dataType}
type feature_onHoverPT = {$: 'feature.onHover', action: [actionType]}
type feature_onKeyPT = {$: 'feature.onKey', 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType, doNotWrapWithLauchingElement: booleanType}
type feature_onEnterPT = {$: 'feature.onEnter', action: [actionType]}
type feature_onEscPT = {$: 'feature.onEsc', action: [actionType]}
type group_auto_focus_on_first_inputPT = {$: 'group.auto-focus-on-first-input', }
type cssPT = {$: 'css', css: dataType}
type css_dynamicPT = {$: 'css.dynamic', css: dataType}
type css_with_conditionPT = {$: 'css.with-condition', condition: booleanType, css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_opacityPT = {$: 'css.opacity', 
/** 0-1 */opacity: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_transform_rotatePT = {$: 'css.transform-rotate', 
/** 0-360 */angle: dataType, selector: dataType}
type css_colorPT = {$: 'css.color', color: dataType, background: dataType, selector: dataType}
type css_transform_scalePT = {$: 'css.transform-scale', 
/** 0-1 */x: dataType, 
/** 0-1 */y: dataType, selector: dataType}
type css_boldPT = {$: 'css.bold', }
type css_underlinePT = {$: 'css.underline', }
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type d3_scatter_initPT = {$: 'd3-scatter.init', }
type editable_boolean_keyboard_supportPT = {$: 'editable-boolean.keyboard-support', }
type editable_text_x_buttonPT = {$: 'editable-text.x-button', }
type editable_text_helper_popupPT = {$: 'editable-text.helper-popup', control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: booleanType, autoOpen: booleanType, onEnter: actionType, onEsc: actionType}
type field_databindPT = {$: 'field.databind', }
type field_databind_textPT = {$: 'field.databind-text', debounceTime: dataType, oneWay: booleanType}
type field_defaultPT = {$: 'field.default', value: dataType}
type field_init_valuePT = {$: 'field.init-value', value: dataType}
type field_keyboard_shortcutPT = {$: 'field.keyboard-shortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type field_subscribePT = {$: 'field.subscribe', action: actionType, includeFirst: booleanType}
type field_on_changePT = {$: 'field.on-change', action: actionType, includeFirst: booleanType}
type field_toolbarPT = {$: 'field.toolbar', toolbar: controlType}
type validationPT = {$: 'validation', validCondition: booleanType, errorMessage: dataType}
type field_titlePT = {$: 'field.title', title: dataType}
type field_column_widthPT = {$: 'field.column-width', width: dataType}
type group_init_groupPT = {$: 'group.init-group', }
type group_dynamic_titlesPT = {$: 'group.dynamic-titles', }
type group_first_succeedingPT = {$: 'group.first-succeeding', }
type group_itemlist_containerPT = {$: 'group.itemlist-container', id: dataType, defaultItem: dataType, maxItems: dataType, initialSelection: dataType}
type itemlist_itemlist_selectedPT = {$: 'itemlist.itemlist-selected', }
type itemlist_container_filter_fieldPT = {$: 'itemlist-container.filter-field', fieldData: dataType, filterType: filter_typeType}
type itemlist_watch_items_with_headingPT = {$: 'itemlist.watch-items-with-heading', items: dataType, itemVariableName: dataType, groupBy: itemlist_group_byType}
type itemlist_no_containerPT = {$: 'itemlist.no-container', }
type itemlist_initPT = {$: 'itemlist.init', }
type itemlist_init_tablePT = {$: 'itemlist.init-table', }
type itemlist_fast_filterPT = {$: 'itemlist.fast-filter', showCondition: dataType, filtersRef: dataType, 
/** watch childern change as well */includeChildren: dataType}
type itemlist_selectionPT = {$: 'itemlist.selection', databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: red;color: blue */cssForSelected: dataType}
type itemlist_keyboard_selectionPT = {$: 'itemlist.keyboard-selection', autoFocus: booleanType, onEnter: actionType}
type itemlist_drag_and_dropPT = {$: 'itemlist.drag-and-drop', }
type itemlist_drag_handlePT = {$: 'itemlist.drag-handle', }
type itemlist_shown_only_on_item_hoverPT = {$: 'itemlist.shown-only-on-item-hover', }
type itemlist_dividerPT = {$: 'itemlist.divider', space: dataType}
type label_bind_textPT = {$: 'label.bind-text', }
type menu_init_popup_menuPT = {$: 'menu.init-popup-menu', popupStyle: dialog_styleType}
type menu_init_menu_optionPT = {$: 'menu.init-menu-option', }
type picklist_dynamic_optionsPT = {$: 'picklist.dynamic-options', recalcEm: dataType}
type picklist_onChangePT = {$: 'picklist.onChange', action: actionType}
type slider_initPT = {$: 'slider.init', }
type slider_handle_arrow_keysPT = {$: 'slider.handle-arrow-keys', }
type group_init_expandablePT = {$: 'group.init-expandable', }
type group_init_accordionPT = {$: 'group.init-accordion', keyboardSupport: booleanType, autoFocus: booleanType}
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', spacing: dataType}
type layout_horizontal_fixed_splitPT = {$: 'layout.horizontal-fixed-split', leftWidth: dataType, rightWidth: dataType, spacing: dataType}
type layout_horizontal_wrappedPT = {$: 'layout.horizontal-wrapped', spacing: dataType}
type layout_flexPT = {$: 'layout.flex', alignItems: dataType, spacing: dataType, justifyContent: dataType, direction: dataType, wrap: dataType}
type layout_gridPT = {$: 'layout.grid', 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}
type flex_item_growPT = {$: 'flex-item.grow', factor: dataType}
type flex_item_basisPT = {$: 'flex-item.basis', factor: dataType}
type flex_item_align_selfPT = {$: 'flex-item.align-self', align: dataType}
type responsive_not_for_phonePT = {$: 'responsive.not-for-phone', }
type mdl_style_init_dynamicPT = {$: 'mdl-style.init-dynamic', query: dataType}
type mdl_ripple_effectPT = {$: 'mdl.ripple-effect', }
type table_init_table_or_itemlistPT = {$: 'table.init-table-or-itemlist', }
type table_initPT = {$: 'table.init', }
type table_init_sortPT = {$: 'table.init-sort', }
type group_themePT = {$: 'group.theme', theme: themeType}
type tree_selectionPT = {$: 'tree.selection', databind: dataType, autoSelectFirst: booleanType, onSelection: actionType, onRightClick: actionType}
type tree_keyboard_selectionPT = {$: 'tree.keyboard-selection', onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}
type tree_drag_and_dropPT = {$: 'tree.drag-and-drop', }
type textarea_init_textarea_editorPT = {$: 'textarea.init-textarea-editor', }

// type control
type controlType = cardPT | d3g_histogramPT | dividerPT | groupPT | inline_controlsPT | dynamic_controlsPT | control_with_conditionPT | inner_htmlPT | itemlist_container_searchPT | itemlist_with_groupsPT | itemlist_default_headingPT | itemlistPT | itemlogPT | markdownPT | sidenavPT | treePT | ((ctx: ctx) => any)
type cmp_def_controlType = {
	type: 'control',
	params?: [param],
	impl: controlType,
}
type cardPT = {$: 'card', title: dataType, subTitle: dataType, text: dataType, image: dataType, topButton: clickableType, menu: menuType, style: card_styleType, features: [featureType]}
type d3g_histogramPT = {$: 'd3g.histogram', title: dataType, items: dataType, pivot: d3g_pivotType, frame: d3g_frameType, itemTitle: dataType, ticks: dataType, axes: d3g_axesType, style: d3g_histogram_styleType, features: [d3_featureType]}
type dividerPT = {$: 'divider', style: divider_styleType, title: dataType, features: [featureType]}
type groupPT = {$: 'group', title: dataType, layout: layoutType, style: group_styleType, controls: [controlType], features: [featureType]}
type inline_controlsPT = {$: 'inline-controls', controls: [controlType]}
type dynamic_controlsPT = {$: 'dynamic-controls', controlItems: dataType, genericControl: controlType, itemVariable: dataType}
type control_with_conditionPT = {$: 'control-with-condition', condition: booleanType, control: controlType, title: dataType}
type inner_htmlPT = {$: 'inner-html', title: dataType, html: dataType, style: inner_html_styleType, features: [featureType]}
type itemlist_container_searchPT = {$: 'itemlist-container.search', title: dataType, searchIn: dataType, databind: dataType, style: editable_text_styleType, features: [featureType]}
type itemlist_with_groupsPT = {$: 'itemlist-with-groups', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, groupBy: itemlist_group_byType, headingCtrl: controlType, 
/** resources to watch */watch: dataType, itemVariable: dataType, features: [featureType]}
type itemlist_default_headingPT = {$: 'itemlist-default-heading', }
type itemlistPT = {$: 'itemlist', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}
type itemlogPT = {$: 'itemlog', title: dataType, items: dataType, controls: [controlType], style: itemlog_styleType, itemVariable: dataType, counter: dataType, features: [featureType]}
type markdownPT = {$: 'markdown', markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}
type sidenavPT = {$: 'sidenav', controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}
type treePT = {$: 'tree', nodeModel: tree_node_modelType, style: tree_styleType, features: [featureType]}

// type dialog-feature
type dialog_featureType = cssPT | css_dynamicPT | css_with_conditionPT | css_classPT | css_widthPT | css_heightPT | css_paddingPT | css_marginPT | css_box_shadowPT | css_borderPT | dialog_feature_unique_dialogPT | dialog_feature_drag_titlePT | dialog_feature_onClosePT | dialog_feature_close_when_clicking_outsidePT | dialog_feature_auto_focus_on_first_inputPT | dialog_feature_css_class_on_launching_elementPT | dialog_feature_max_zIndex_on_clickPT | dialog_feature_resizerPT | ((ctx: ctx) => any)
type cmp_def_dialog_featureType = {
	type: 'dialog_feature',
	params?: [param],
	impl: dialog_featureType,
}
type cssPT = {$: 'css', css: dataType}
type css_dynamicPT = {$: 'css.dynamic', css: dataType}
type css_with_conditionPT = {$: 'css.with-condition', condition: booleanType, css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, 
/** 0-1 */opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type dialog_feature_unique_dialogPT = {$: 'dialog-feature.unique-dialog', id: dataType, remeberLastLocation: booleanType}
type dialog_feature_drag_titlePT = {$: 'dialog-feature.drag-title', id: dataType}
type dialog_feature_onClosePT = {$: 'dialog-feature.onClose', action: actionType}
type dialog_feature_close_when_clicking_outsidePT = {$: 'dialog-feature.close-when-clicking-outside', delay: dataType}
type dialog_feature_auto_focus_on_first_inputPT = {$: 'dialog-feature.auto-focus-on-first-input', selectText: booleanType}
type dialog_feature_css_class_on_launching_elementPT = {$: 'dialog-feature.css-class-on-launching-element', }
type dialog_feature_max_zIndex_on_clickPT = {$: 'dialog-feature.max-zIndex-on-click', minZIndex: dataType}
type dialog_feature_resizerPT = {$: 'dialog-feature.resizer', 
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
type d3_featureType = d3_histogram_initPT | d3g_item_indicatorPT | ((ctx: ctx) => any)
type cmp_def_d3_featureType = {
	type: 'd3_feature',
	params?: [param],
	impl: d3_featureType,
}
type d3_histogram_initPT = {$: 'd3-histogram.init', }
type d3g_item_indicatorPT = {$: 'd3g.item-indicator', item: dataType}

// type d3g.axes
type d3g_axesType = d3g_buttom_and_left_axesPT | ((ctx: ctx) => any)
type cmp_def_d3g_axesType = {
	type: 'd3g_axes',
	params?: [param],
	impl: d3g_axesType,
}
type d3g_buttom_and_left_axesPT = {$: 'd3g.buttom-and-left-axes', }

// type d3g.scale
type d3g_scaleType = d3g_linear_scalePT | d3g_sqrt_scalePT | d3g_band_scalePT | d3g_ordinal_colorsPT | d3g_interpolate_colorsPT | ((ctx: ctx) => any)
type cmp_def_d3g_scaleType = {
	type: 'd3g_scale',
	params?: [param],
	impl: d3g_scaleType,
}
type d3g_linear_scalePT = {$: 'd3g.linear-scale', }
type d3g_sqrt_scalePT = {$: 'd3g.sqrt-scale', }
type d3g_band_scalePT = {$: 'd3g.band-scale', 
/** range [0,1] */paddingInner: dataType, 
/** range [0,1] */paddingOuter: dataType, 
/** 0 - aligned left, 0.5 - centered, 1 - aligned right */align: dataType}
type d3g_ordinal_colorsPT = {$: 'd3g.ordinal-colors', scale: dataType}
type d3g_interpolate_colorsPT = {$: 'd3g.interpolate-colors', scale: dataType}

// type d3g.range
type d3g_rangeType = d3g_auto_rangePT | d3g_from_toPT | ((ctx: ctx) => any)
type cmp_def_d3g_rangeType = {
	type: 'd3g_range',
	params?: [param],
	impl: d3g_rangeType,
}
type d3g_auto_rangePT = {$: 'd3g.auto-range', }
type d3g_from_toPT = {$: 'd3g.from-to', from: dataType, to: dataType}

// type d3g.domain
type d3g_domainType = d3g_domain_by_valuesPT | ((ctx: ctx) => any)
type cmp_def_d3g_domainType = {
	type: 'd3g_domain',
	params?: [param],
	impl: d3g_domainType,
}
type d3g_domain_by_valuesPT = {$: 'd3g.domain-by-values', }

// type divider.style
type divider_styleType = divider_brPT | divider_flex_auto_growPT | custom_stylePT | style_by_controlPT | style_with_featuresPT | ((ctx: ctx) => any)
type cmp_def_divider_styleType = {
	type: 'divider_style',
	params?: [param],
	impl: divider_styleType,
}
type divider_brPT = {$: 'divider.br', }
type divider_flex_auto_growPT = {$: 'divider.flex-auto-grow', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}

// type inner-html.style
type inner_html_styleType = inner_html_unsafePT | custom_stylePT | style_by_controlPT | style_with_featuresPT | ((ctx: ctx) => any)
type cmp_def_inner_html_styleType = {
	type: 'inner_html_style',
	params?: [param],
	impl: inner_html_styleType,
}
type inner_html_unsafePT = {$: 'inner-html.unsafe', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}

// type filter-type
type filter_typeType = filter_type_textPT | filter_type_exact_matchPT | filter_type_numericPT | ((ctx: ctx) => any)
type cmp_def_filter_typeType = {
	type: 'filter_type',
	params?: [param],
	impl: filter_typeType,
}
type filter_type_textPT = {$: 'filter-type.text', ignoreCase: booleanType}
type filter_type_exact_matchPT = {$: 'filter-type.exact-match', }
type filter_type_numericPT = {$: 'filter-type.numeric', }

// type itemlist.group-by
type itemlist_group_byType = itemlist_heading_group_byPT | ((ctx: ctx) => any)
type cmp_def_itemlist_group_byType = {
	type: 'itemlist_group_by',
	params?: [param],
	impl: itemlist_group_byType,
}
type itemlist_heading_group_byPT = {$: 'itemlist-heading.group-by', itemToGroupID: dataType, promoteGroups: [dataType]}

// type group.style
type group_styleType = itemlog_divPT | custom_stylePT | style_by_controlPT | style_with_featuresPT | card_cardPT | card_media_groupPT | card_actions_groupPT | card_menuPT | group_htmlTagPT | group_divPT | group_sectionPT | group_ul_liPT | group_expandablePT | group_accordionPT | group_sectionsPT | property_sheet_titles_leftPT | property_sheet_titles_abovePT | ((ctx: ctx) => any)
type cmp_def_group_styleType = {
	type: 'group_style',
	params?: [param],
	impl: group_styleType,
}
type itemlog_divPT = {$: 'itemlog.div', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type card_cardPT = {$: 'card.card', width: dataType, shadow: dataType}
type card_media_groupPT = {$: 'card.media-group', }
type card_actions_groupPT = {$: 'card.actions-group', }
type card_menuPT = {$: 'card.menu', }
type group_htmlTagPT = {$: 'group.htmlTag', htmlTag: dataType, groupClass: dataType, itemClass: dataType}
type group_divPT = {$: 'group.div', }
type group_sectionPT = {$: 'group.section', }
type group_ul_liPT = {$: 'group.ul-li', }
type group_expandablePT = {$: 'group.expandable', }
type group_accordionPT = {$: 'group.accordion', }
type group_sectionsPT = {$: 'group.sections', titleStyle: label_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}
type property_sheet_titles_leftPT = {$: 'property-sheet.titles-left', titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}
type property_sheet_titles_abovePT = {$: 'property-sheet.titles-above', titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}

// type markdown.style
type markdown_styleType = markdown_showdownPT | custom_stylePT | style_by_controlPT | style_with_featuresPT | ((ctx: ctx) => any)
type cmp_def_markdown_styleType = {
	type: 'markdown_style',
	params?: [param],
	impl: markdown_styleType,
}
type markdown_showdownPT = {$: 'markdown.showdown', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}

// type menu.option
type menu_optionType = menu_menuPT | menu_options_groupPT | menu_dynamic_optionsPT | menu_end_with_separatorPT | menu_separatorPT | menu_actionPT | ((ctx: ctx) => any)
type cmp_def_menu_optionType = {
	type: 'menu_option',
	params?: [param],
	impl: menu_optionType,
}
type menu_menuPT = {$: 'menu.menu', title: dataType, options: [menu_optionType], optionsFilter: dataType}
type menu_options_groupPT = {$: 'menu.options-group', options: [menu_optionType]}
type menu_dynamic_optionsPT = {$: 'menu.dynamic-options', items: dataType, genericOption: menu_optionType}
type menu_end_with_separatorPT = {$: 'menu.end-with-separator', options: [menu_optionType], separator: menu_optionType, title: dataType}
type menu_separatorPT = {$: 'menu.separator', }
type menu_actionPT = {$: 'menu.action', title: dataType, action: actionType, icon: dataType, shortcut: dataType, showCondition: booleanType}

// type picklist.options
type picklist_optionsType = picklist_optionsByCommaPT | picklist_optionsPT | picklist_coded_optionsPT | picklist_sorted_optionsPT | ((ctx: ctx) => any)
type cmp_def_picklist_optionsType = {
	type: 'picklist_options',
	params?: [param],
	impl: picklist_optionsType,
}
type picklist_optionsByCommaPT = {$: 'picklist.optionsByComma', options: dataType, allowEmptyValue: booleanType}
type picklist_optionsPT = {$: 'picklist.options', options: dataType, allowEmptyValue: booleanType}
type picklist_coded_optionsPT = {$: 'picklist.coded-options', options: dataType, code: dataType, text: dataType, allowEmptyValue: booleanType}
type picklist_sorted_optionsPT = {$: 'picklist.sorted-options', options: picklist_optionsType, 
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
type button_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | button_hrefPT | button_xPT | button_nativePT | button_mdl_icon12PT | button_table_cell_hrefPT | ((ctx: ctx) => any)
type cmp_def_button_styleType = {
	type: 'button_style',
	params?: [param],
	impl: button_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type button_hrefPT = {$: 'button.href', }
type button_xPT = {$: 'button.x', size: dataType}
type button_nativePT = {$: 'button.native', }
type button_mdl_icon12PT = {$: 'button.mdl-icon12', icon: dataType}
type button_table_cell_hrefPT = {$: 'button.table-cell-href', }

// type icon-with-action.style
type icon_with_action_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | button_mdl_icon12PT | ((ctx: ctx) => any)
type cmp_def_icon_with_action_styleType = {
	type: 'icon_with_action_style',
	params?: [param],
	impl: icon_with_action_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type button_mdl_icon12PT = {$: 'button.mdl-icon12', icon: dataType}

// type editable-text.style
type editable_text_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | editable_text_codemirrorPT | editable_text_inputPT | editable_text_textareaPT | editable_text_expandablePT | ((ctx: ctx) => any)
type cmp_def_editable_text_styleType = {
	type: 'editable_text_style',
	params?: [param],
	impl: editable_text_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type editable_text_codemirrorPT = {$: 'editable-text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: booleanType, lineNumbers: booleanType, readOnly: dataType, onCtrlEnter: actionType, hint: booleanType, maxLength: dataType}
type editable_text_inputPT = {$: 'editable-text.input', }
type editable_text_textareaPT = {$: 'editable-text.textarea', rows: dataType, cols: dataType, oneWay: booleanType}
type editable_text_expandablePT = {$: 'editable-text.expandable', buttonFeatures: [featureType], editableFeatures: [featureType], buttonStyle: button_styleType, editableStyle: editable_text_styleType, onToggle: actionType}

// type text.style
type text_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | text_codemirrorPT | ((ctx: ctx) => any)
type cmp_def_text_styleType = {
	type: 'text_style',
	params?: [param],
	impl: text_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type text_codemirrorPT = {$: 'text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: booleanType}

// type editable-boolean.style
type editable_boolean_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | editable_boolean_checkboxPT | editable_boolean_checkbox_with_titlePT | editable_boolean_expand_collapsePT | editable_boolean_checkbox_with_labelPT | ((ctx: ctx) => any)
type cmp_def_editable_boolean_styleType = {
	type: 'editable_boolean_style',
	params?: [param],
	impl: editable_boolean_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type editable_boolean_checkboxPT = {$: 'editable-boolean.checkbox', }
type editable_boolean_checkbox_with_titlePT = {$: 'editable-boolean.checkbox-with-title', }
type editable_boolean_expand_collapsePT = {$: 'editable-boolean.expand-collapse', }
type editable_boolean_checkbox_with_labelPT = {$: 'editable-boolean.checkbox-with-label', }

// type layout
type layoutType = layout_verticalPT | layout_horizontalPT | layout_horizontal_fixed_splitPT | layout_horizontal_wrappedPT | layout_flexPT | layout_gridPT | ((ctx: ctx) => any)
type cmp_def_layoutType = {
	type: 'layout',
	params?: [param],
	impl: layoutType,
}
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', spacing: dataType}
type layout_horizontal_fixed_splitPT = {$: 'layout.horizontal-fixed-split', leftWidth: dataType, rightWidth: dataType, spacing: dataType}
type layout_horizontal_wrappedPT = {$: 'layout.horizontal-wrapped', spacing: dataType}
type layout_flexPT = {$: 'layout.flex', alignItems: dataType, spacing: dataType, justifyContent: dataType, direction: dataType, wrap: dataType}
type layout_gridPT = {$: 'layout.grid', 
/** grid-template-columns, list of lengths */columnSizes: dataType, 
/** grid-template-rows, list of lengths */rowSizes: dataType, 
/** grid-column-gap */columnGap: dataType, 
/** grid-row-gap */rowGap: dataType}

// type label.style
type label_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | label_mdl_ripple_effectPT | label_mdl_buttonPT | ((ctx: ctx) => any)
type cmp_def_label_styleType = {
	type: 'label_style',
	params?: [param],
	impl: label_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type label_mdl_ripple_effectPT = {$: 'label.mdl-ripple-effect', }
type label_mdl_buttonPT = {$: 'label.mdl-button', width: dataType}

// type picklist.style
type picklist_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | picklist_nativePT | picklist_radioPT | picklist_radio_verticalPT | picklist_native_md_look_openPT | picklist_native_md_lookPT | picklist_label_listPT | picklist_button_listPT | picklist_hyperlinksPT | picklist_groupsPT | ((ctx: ctx) => any)
type cmp_def_picklist_styleType = {
	type: 'picklist_style',
	params?: [param],
	impl: picklist_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type picklist_nativePT = {$: 'picklist.native', }
type picklist_radioPT = {$: 'picklist.radio', 
/** e.g. display: none */radioCss: dataType, text: dataType}
type picklist_radio_verticalPT = {$: 'picklist.radio-vertical', }
type picklist_native_md_look_openPT = {$: 'picklist.native-md-look-open', }
type picklist_native_md_lookPT = {$: 'picklist.native-md-look', }
type picklist_label_listPT = {$: 'picklist.label-list', labelStyle: label_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}
type picklist_button_listPT = {$: 'picklist.button-list', buttonStyle: button_styleType, itemlistStyle: itemlist_styleType, 
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

// type theme
type themeType = theme_material_designPT | ((ctx: ctx) => any)
type cmp_def_themeType = {
	type: 'theme',
	params?: [param],
	impl: themeType,
}
type theme_material_designPT = {$: 'theme.material-design', }

// type tree.node-model
type tree_node_modelType = tree_json_read_onlyPT | tree_jsonPT | tree_node_modelPT | ((ctx: ctx) => any)
type cmp_def_tree_node_modelType = {
	type: 'tree_node_model',
	params?: [param],
	impl: tree_node_modelType,
}
type tree_json_read_onlyPT = {$: 'tree.json-read-only', object: dataType, rootPath: dataType}
type tree_jsonPT = {$: 'tree.json', object: dataType, rootPath: dataType}
type tree_node_modelPT = {$: 'tree.node-model', rootPath: dataType, 
/** from parent path to children paths */children: dataType, 
/** value of path */pathToItem: dataType, 
/** icon name from material icons */icon: dataType, 
/** path as input. differnt from children() == 0, as you can drop into empty array */isChapter: booleanType, maxDepth: dataType, fieldCache: booleanType, includeRoot: booleanType}

// type tree.style
type tree_styleType = custom_stylePT | style_by_controlPT | style_with_featuresPT | tree_plainPT | tree_expand_boxPT | ((ctx: ctx) => any)
type cmp_def_tree_styleType = {
	type: 'tree_style',
	params?: [param],
	impl: tree_styleType,
}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}
type style_with_featuresPT = {$: 'style-with-features', style: $asParentType, features: [featureType]}
type tree_plainPT = {$: 'tree.plain', showIcon: booleanType, noHead: booleanType}
type tree_expand_boxPT = {$: 'tree.expand-box', showIcon: booleanType, noHead: booleanType, lineWidth: dataType}
type cmpDef = cmp_def_anyType | cmp_def_dataType | cmp_def_aggregatorType | cmp_def_booleanType | cmp_def_actionType | cmp_def_propType | cmp_def_varType | cmp_def_systemType | cmp_def_data_switch_caseType | cmp_def_action_switch_caseType | cmp_def_jison_parserType | cmp_def_lexer_ruleType | cmp_def_bnf_expressionType | cmp_def_expression_optionType | cmp_def_testType | cmp_def_ui_actionType | cmp_def_animationType | cmp_def_animation_valType | cmp_def_animation_stager_gridType | cmp_def_animation_stager_valType | cmp_def_animation_easingType | cmp_def_positionType | cmp_def_featureType | cmp_def_controlType | cmp_def_dialog_featureType | cmp_def_d3g_frameType | cmp_def_d3_featureType | cmp_def_d3g_axesType | cmp_def_d3g_scaleType | cmp_def_d3g_rangeType | cmp_def_d3g_domainType | cmp_def_divider_styleType | cmp_def_inner_html_styleType | cmp_def_filter_typeType | cmp_def_itemlist_group_byType | cmp_def_group_styleType | cmp_def_markdown_styleType | cmp_def_menu_optionType | cmp_def_picklist_optionsType | cmp_def_picklist_promoteType | cmp_def_button_styleType | cmp_def_icon_with_action_styleType | cmp_def_editable_text_styleType | cmp_def_text_styleType | cmp_def_editable_boolean_styleType | cmp_def_layoutType | cmp_def_label_styleType | cmp_def_picklist_styleType | cmp_def_table_fieldType | cmp_def_themeType | cmp_def_tree_node_modelType | cmp_def_tree_styleType
function call : anyType;
function call(param: dataType) : anyType;
function pipeline : dataType;
function pipeline(...items: dataType | [aggregatorType][]) : dataType;
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
function first() : aggregatorType;
function last : aggregatorType;
function last() : aggregatorType;
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
function toUppercase : dataType;
function toUppercase(text: dataType) : dataType;
function toLowercase : dataType;
function toLowercase(text: dataType) : dataType;
function capitalize : dataType;
function capitalize(text: dataType) : dataType;
function join : aggregatorType;
function join(profile: { separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemName: dataType, itemText: dataType}) : aggregatorType;
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
/** notification for watch-ref, defualt behavior is after each action */notifications: dataType}) : actionType;
function runActionOnItems(items: dataType) : actionType;
function delay : actionType;
function delay(mSec: dataType) : actionType;
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
function prettyPrint(profile: dataType, colWidth: dataType) : dataType;
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
function uiTest : testType;
function uiTest(profile: { control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType}) : testType;
function uiTest(control: controlType) : testType;
function uiAction_click : ui_actionType;
function uiAction_click(selector: dataType, methodToActivate: dataType) : ui_actionType;
function uiAction_click(selector: dataType) : ui_actionType;
function uiAction_keyboardEvent : ui_actionType;
function uiAction_keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType;
function uiAction_keyboardEvent(selector: dataType) : ui_actionType;
function uiAction_setText : ui_actionType;
function uiAction_setText(profile: { value: dataType, selector: dataType, delay: dataType}) : ui_actionType;
function uiAction_setText(value: dataType) : ui_actionType;
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
function ctrlAction : featureType;
function ctrlAction(action: actionType) : featureType;
function altAction : featureType;
function altAction(action: actionType) : featureType;
function buttonDisabled : featureType;
function buttonDisabled(enabledCondition: booleanType) : featureType;
function card : controlType;
function card(profile: { title: dataType, subTitle: dataType, text: dataType, image: dataType, topButton: clickableType, menu: menuType, style: card_styleType, features: [featureType]}) : controlType;
function card(title: dataType) : controlType;
function card_init : featureType;
function card_init() : featureType;
function feature_light : featureType;
function feature_light() : featureType;
function watchRef : featureType;
function watchRef(profile: { 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** allow refresh originated from the components or its children */allowSelfRefresh: booleanType, 
/** rebuild the component, including all features and variables */strongRefresh: booleanType, 
/** recalculate feature variables */recalcVars: booleanType, 
/** delay in activation, can be used to set priority */delay: dataType}) : featureType;
function watchRef(
/** reference to data */ref: dataType) : featureType;
function watchObservable : featureType;
function watchObservable(toWatch: dataType) : featureType;
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
/** E.g., selected item variable */watchable: booleanType, 
/** If specified, the var will be defined as global with this id */globalId: dataType}) : featureType;
function variable(name: dataType) : featureType;
function calculatedVar : featureType;
function calculatedVar(profile: { name: dataType, value: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}) : featureType;
function calculatedVar(name: dataType) : featureType;
function feature_init : featureType;
function feature_init(...action: [actionType][]) : featureType;
function feature_afterLoad : featureType;
function feature_afterLoad(...action: [actionType][]) : featureType;
function feature_if : featureType;
function feature_if(showCondition: dataType) : featureType;
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
function feature_onHover(...action: [actionType][]) : featureType;
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
function refreshControlById(id: dataType) : actionType;
function group_autoFocusOnFirstInput : featureType;
function group_autoFocusOnFirstInput() : featureType;
function focusOnFirstElement : actionType;
function focusOnFirstElement(selector: dataType) : actionType;
function css : featureType | dialog_featureType;
function css(css: dataType) : featureType | dialog_featureType;
function css_dynamic : featureType | dialog_featureType;
function css_dynamic(css: dataType) : featureType | dialog_featureType;
function css_withCondition : featureType | dialog_featureType;
function css_withCondition(condition: booleanType, css: dataType) : featureType | dialog_featureType;
function css_withCondition(condition: booleanType) : featureType | dialog_featureType;
function css_class : featureType | dialog_featureType;
function css_class(class: dataType) : featureType | dialog_featureType;
function css_width : featureType | dialog_featureType;
function css_width(profile: { width: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_width(width: dataType) : featureType | dialog_featureType;
function css_height : featureType | dialog_featureType;
function css_height(profile: { height: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_height(height: dataType) : featureType | dialog_featureType;
function css_opacity : featureType;
function css_opacity(
/** 0-1 */opacity: dataType, selector: dataType) : featureType;
function css_opacity(
/** 0-1 */opacity: dataType) : featureType;
function css_padding : featureType | dialog_featureType;
function css_padding(profile: { top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_padding(top: dataType) : featureType | dialog_featureType;
function css_margin : featureType | dialog_featureType;
function css_margin(profile: { top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType;
function css_margin(top: dataType) : featureType | dialog_featureType;
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
function d3Scatter_init : featureType;
function d3Scatter_init() : featureType;
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
function dialogFeature_dragTitle(id: dataType) : dialog_featureType;
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
function dialogFeature_resizer : dialog_featureType;
function dialogFeature_resizer(
/** effective only for dialog with a single codemirror element */resizeInnerCodemirror: booleanType) : dialog_featureType;
function divider : controlType;
function divider(profile: { style: divider_styleType, title: dataType, features: [featureType]}) : controlType;
function divider(style: divider_styleType) : controlType;
function divider_br : divider_styleType;
function divider_br() : divider_styleType;
function divider_flexAutoGrow : divider_styleType;
function divider_flexAutoGrow() : divider_styleType;
function editableBoolean_keyboardSupport : featureType;
function editableBoolean_keyboardSupport() : featureType;
function editableText_xButton : featureType;
function editableText_xButton() : featureType;
function editableText_helperPopup : featureType;
function editableText_helperPopup(profile: { control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: booleanType, autoOpen: booleanType, onEnter: actionType, onEsc: actionType}) : featureType;
function editableText_helperPopup(control: controlType) : featureType;
function field_databind : featureType;
function field_databind() : featureType;
function field_databindText : featureType;
function field_databindText(debounceTime: dataType, oneWay: booleanType) : featureType;
function field_databindText(debounceTime: dataType) : featureType;
function field_data : dataType;
function field_data() : dataType;
function field_default : featureType;
function field_default(value: dataType) : featureType;
function field_initValue : featureType;
function field_initValue(value: dataType) : featureType;
function field_keyboardShortcut : featureType;
function field_keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType;
function field_keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType;
function field_subscribe : featureType;
function field_subscribe(action: actionType, includeFirst: booleanType) : featureType;
function field_subscribe(action: actionType) : featureType;
function field_onChange : featureType;
function field_onChange(action: actionType, includeFirst: booleanType) : featureType;
function field_onChange(action: actionType) : featureType;
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
function dynamicControls(profile: { controlItems: dataType, genericControl: controlType, itemVariable: dataType}) : controlType;
function dynamicControls(controlItems: dataType) : controlType;
function group_dynamicTitles : featureType;
function group_dynamicTitles() : featureType;
function group_firstSucceeding : featureType;
function group_firstSucceeding() : featureType;
function controlWithCondition : controlType;
function controlWithCondition(profile: { condition: booleanType, control: controlType, title: dataType}) : controlType;
function controlWithCondition(condition: booleanType) : controlType;
function innerHtml : controlType;
function innerHtml(profile: { title: dataType, html: dataType, style: inner_html_styleType, features: [featureType]}) : controlType;
function innerHtml(title: dataType) : controlType;
function innerHtml_unsafe : inner_html_styleType;
function innerHtml_unsafe() : inner_html_styleType;
function group_itemlistContainer : featureType;
function group_itemlistContainer(profile: { id: dataType, defaultItem: dataType, maxItems: dataType, initialSelection: dataType}) : featureType;
function group_itemlistContainer(id: dataType) : featureType;
function itemlist_itemlistSelected : featureType;
function itemlist_itemlistSelected() : featureType;
function itemlistContainer_filter : aggregatorType;
function itemlistContainer_filter(updateCounters: booleanType) : aggregatorType;
function itemlistContainer_conditionFilter : booleanType;
function itemlistContainer_conditionFilter() : booleanType;
function itemlistContainer_search : controlType;
function itemlistContainer_search(profile: { title: dataType, searchIn: dataType, databind: dataType, style: editable_text_styleType, features: [featureType]}) : controlType;
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
function itemlistContainer_searchInAllProperties : dataType;
function itemlistContainer_searchInAllProperties() : dataType;
function itemlistWithGroups : controlType;
function itemlistWithGroups(profile: { title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, groupBy: itemlist_group_byType, headingCtrl: controlType, 
/** resources to watch */watch: dataType, itemVariable: dataType, features: [featureType]}) : controlType;
function itemlistWithGroups(title: dataType) : controlType;
function itemlist_watchItemsWithHeading : featureType;
function itemlist_watchItemsWithHeading(profile: { items: dataType, itemVariableName: dataType, groupBy: itemlist_group_byType}) : featureType;
function itemlist_watchItemsWithHeading(items: dataType) : featureType;
function itemlistDefaultHeading : controlType;
function itemlistDefaultHeading() : controlType;
function itemlistHeading_groupBy : itemlist_group_byType;
function itemlistHeading_groupBy(itemToGroupID: dataType, promoteGroups: [dataType]) : itemlist_group_byType;
function itemlistHeading_groupBy(itemToGroupID: dataType) : itemlist_group_byType;
function itemlist : controlType;
function itemlist(profile: { title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, itemVariable: dataType, 
/** by default itemlist is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}) : controlType;
function itemlist(title: dataType) : controlType;
function itemlist_noContainer : featureType;
function itemlist_noContainer() : featureType;
function itemlist_init : featureType;
function itemlist_init() : featureType;
function itemlist_initTable : featureType;
function itemlist_initTable() : featureType;
function itemlist_fastFilter : featureType;
function itemlist_fastFilter(profile: { showCondition: dataType, filtersRef: dataType, 
/** watch childern change as well */includeChildren: dataType}) : featureType;
function itemlist_fastFilter(showCondition: dataType) : featureType;
function itemlist_selection : featureType;
function itemlist_selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: red;color: blue */cssForSelected: dataType}) : featureType;
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
function itemlog : controlType;
function itemlog(profile: { title: dataType, items: dataType, controls: [controlType], style: itemlog_styleType, itemVariable: dataType, counter: dataType, features: [featureType]}) : controlType;
function itemlog(title: dataType) : controlType;
function itemlog_div : group_styleType;
function itemlog_div() : group_styleType;
function label_bindText : featureType;
function label_bindText() : featureType;
function label_highlight : dataType;
function label_highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType;
function label_highlight(base: dataType) : dataType;
function markdown : controlType;
function markdown(profile: { markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}) : controlType;
function markdown(markdown: dataType) : controlType;
function markdown_showdown : markdown_styleType;
function markdown_showdown() : markdown_styleType;
function menu_menu : menu_optionType;
function menu_menu(profile: { title: dataType, options: [menu_optionType], optionsFilter: dataType}) : menu_optionType;
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
function menu_action(profile: { title: dataType, action: actionType, icon: dataType, shortcut: dataType, showCondition: booleanType}) : menu_optionType;
function menu_action(title: dataType) : menu_optionType;
function menu_initPopupMenu : featureType;
function menu_initPopupMenu(popupStyle: dialog_styleType) : featureType;
function menu_initMenuOption : featureType;
function menu_initMenuOption() : featureType;
function picklist_dynamicOptions : featureType;
function picklist_dynamicOptions(recalcEm: dataType) : featureType;
function picklist_onChange : featureType;
function picklist_onChange(action: actionType) : featureType;
function picklist_optionsByComma : picklist_optionsType;
function picklist_optionsByComma(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType;
function picklist_optionsByComma(options: dataType) : picklist_optionsType;
function picklist_options : picklist_optionsType;
function picklist_options(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType;
function picklist_options(options: dataType) : picklist_optionsType;
function picklist_codedOptions : picklist_optionsType;
function picklist_codedOptions(profile: { options: dataType, code: dataType, text: dataType, allowEmptyValue: booleanType}) : picklist_optionsType;
function picklist_codedOptions(options: dataType) : picklist_optionsType;
function picklist_sortedOptions : picklist_optionsType;
function picklist_sortedOptions(options: picklist_optionsType, 
/** e.g input:80,group:90. 0 mark means hidden. no mark means 50 */marks: dataType) : picklist_optionsType;
function picklist_sortedOptions(options: picklist_optionsType) : picklist_optionsType;
function picklist_promote : picklist_promoteType;
function picklist_promote(groups: dataType, options: dataType) : picklist_promoteType;
function picklist_promote(groups: dataType) : picklist_promoteType;
function customStyle : dataType;
function customStyle(profile: { template: dataType, css: dataType, features: [featureType]}) : dataType;
function customStyle(template: dataType) : dataType;
function styleByControl : dataType;
function styleByControl(control: controlType, modelVar: dataType) : dataType;
function styleByControl(control: controlType) : dataType;
function styleWithFeatures : dataType;
function styleWithFeatures(style: $asParentType, features: [featureType]) : dataType;
function styleWithFeatures(style: $asParentType) : dataType;
function sidenav : controlType;
function sidenav(profile: { controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}) : controlType;
function slider_init : featureType;
function slider_init() : featureType;
function slider_handleArrowKeys : featureType;
function slider_handleArrowKeys() : featureType;
function button_href : button_styleType;
function button_href() : button_styleType;
function button_x : button_styleType;
function button_x(size: dataType) : button_styleType;
function button_native : button_styleType;
function button_native() : button_styleType;
function button_mdlIcon12 : button_styleType | icon_with_action_styleType;
function button_mdlIcon12(icon: dataType) : button_styleType | icon_with_action_styleType;
function card_card : group_styleType;
function card_card(width: dataType, shadow: dataType) : group_styleType;
function card_card(width: dataType) : group_styleType;
function card_mediaGroup : group_styleType;
function card_mediaGroup() : group_styleType;
function card_actionsGroup : group_styleType;
function card_actionsGroup() : group_styleType;
function card_menu : group_styleType;
function card_menu() : group_styleType;
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
function editableBoolean_expandCollapse : editable_boolean_styleType;
function editableBoolean_expandCollapse() : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel : editable_boolean_styleType;
function editableBoolean_checkboxWithLabel() : editable_boolean_styleType;
function editableText_input : editable_text_styleType;
function editableText_input() : editable_text_styleType;
function editableText_textarea : editable_text_styleType;
function editableText_textarea(profile: { rows: dataType, cols: dataType, oneWay: booleanType}) : editable_text_styleType;
function editableText_textarea(rows: dataType) : editable_text_styleType;
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
function group_expandable : group_styleType;
function group_expandable() : group_styleType;
function group_initExpandable : featureType;
function group_initExpandable() : featureType;
function group_accordion : group_styleType;
function group_accordion() : group_styleType;
function group_initAccordion : featureType;
function group_initAccordion(keyboardSupport: booleanType, autoFocus: booleanType) : featureType;
function group_initAccordion(keyboardSupport: booleanType) : featureType;
function group_sections : group_styleType;
function group_sections(profile: { titleStyle: label_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType;
function group_sections(titleStyle: label_styleType) : group_styleType;
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
function layout_flex(profile: { alignItems: dataType, spacing: dataType, justifyContent: dataType, direction: dataType, wrap: dataType}) : layoutType | featureType;
function layout_flex(alignItems: dataType) : layoutType | featureType;
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
function responsive_notForPhone : featureType;
function responsive_notForPhone() : featureType;
function mdlStyle_initDynamic : featureType;
function mdlStyle_initDynamic(query: dataType) : featureType;
function mdl_rippleEffect : featureType;
function mdl_rippleEffect() : featureType;
function label_mdlRippleEffect : label_styleType;
function label_mdlRippleEffect() : label_styleType;
function label_mdlButton : label_styleType;
function label_mdlButton(width: dataType) : label_styleType;
function picklist_native : picklist_styleType;
function picklist_native() : picklist_styleType;
function picklist_radio : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType;
function picklist_radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType;
function picklist_radioVertical : picklist_styleType;
function picklist_radioVertical() : picklist_styleType;
function picklist_nativeMdLookOpen : picklist_styleType;
function picklist_nativeMdLookOpen() : picklist_styleType;
function picklist_nativeMdLook : picklist_styleType;
function picklist_nativeMdLook() : picklist_styleType;
function picklist_labelList : picklist_styleType;
function picklist_labelList(profile: { labelStyle: label_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType;
function picklist_labelList(labelStyle: label_styleType) : picklist_styleType;
function picklist_buttonList : picklist_styleType;
function picklist_buttonList(profile: { buttonStyle: button_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red;color: blue;font-weight: bold; */cssForSelected: dataType}) : picklist_styleType;
function picklist_buttonList(buttonStyle: button_styleType) : picklist_styleType;
function picklist_hyperlinks : picklist_styleType;
function picklist_hyperlinks() : picklist_styleType;
function picklist_groups : picklist_styleType;
function picklist_groups() : picklist_styleType;
function propertySheet_titlesLeft : group_styleType;
function propertySheet_titlesLeft(profile: { titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType;
function propertySheet_titlesLeft(titleStyle: label_styleType) : group_styleType;
function propertySheet_titlesAbove : group_styleType;
function propertySheet_titlesAbove(profile: { titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType;
function propertySheet_titlesAbove(titleStyle: label_styleType) : group_styleType;
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
function tree_nodeModel : tree_node_modelType;
function tree_nodeModel(profile: { rootPath: dataType, 
/** from parent path to children paths */children: dataType, 
/** value of path */pathToItem: dataType, 
/** icon name from material icons */icon: dataType, 
/** path as input. differnt from children() == 0, as you can drop into empty array */isChapter: booleanType, maxDepth: dataType, fieldCache: booleanType, includeRoot: booleanType}) : tree_node_modelType;
function tree_nodeModel(rootPath: dataType) : tree_node_modelType;
function json_pathSelector : dataType;
function json_pathSelector(
/** object to start with */base: dataType, 
/** string with  separator or array */path: dataType) : dataType;
function json_pathSelector(
/** object to start with */base: dataType) : dataType;
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
function tree_dragAndDrop : featureType;
function tree_dragAndDrop() : featureType;
function urlHistory_mapUrlToResource : actionType;
function urlHistory_mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType;
function watchableAsText : dataType;
function watchableAsText(ref: dataType) : dataType;
function textEditor_withCursorPath : actionType;
function textEditor_withCursorPath(action: actionType, selector: dataType) : actionType;
function textEditor_withCursorPath(action: actionType) : actionType;
function textEditor_isDirty : dataType;
function textEditor_isDirty() : dataType;
function textarea_initTextareaEditor : featureType;
function textarea_initTextareaEditor() : featureType;
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
declare var math : math;,type json = {
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
declare var fs : fs;,type uiAction = {
click : ui_actionType,
click(selector: dataType, methodToActivate: dataType) : ui_actionType,
click(selector: dataType) : ui_actionType,
keyboardEvent : ui_actionType,
keyboardEvent(profile: { selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}) : ui_actionType,
keyboardEvent(selector: dataType) : ui_actionType,
setText : ui_actionType,
setText(profile: { value: dataType, selector: dataType, delay: dataType}) : ui_actionType,
setText(value: dataType) : ui_actionType,
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
declare var animation : animation;,type card = {
init : featureType,
init() : featureType,
card : group_styleType,
card(width: dataType, shadow: dataType) : group_styleType,
card(width: dataType) : group_styleType,
mediaGroup : group_styleType,
mediaGroup() : group_styleType,
actionsGroup : group_styleType,
actionsGroup() : group_styleType,
menu : group_styleType,
menu() : group_styleType,
}
declare var card : card;,type feature = {
light : featureType,
light() : featureType,
hoverTitle : featureType,
hoverTitle(title: dataType) : featureType,
init : featureType,
init(...action: [actionType][]) : featureType,
afterLoad : featureType,
afterLoad(...action: [actionType][]) : featureType,
if : featureType,
if(showCondition: dataType) : featureType,
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
onHover(...action: [actionType][]) : featureType,
onKey : featureType,
onKey(profile: { 
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType, action: actionType, doNotWrapWithLauchingElement: booleanType}) : featureType,
onKey(
/** E.g., a,27,Enter,Esc,Ctrl+C or Alt+V */key: dataType) : featureType,
onEnter : featureType,
onEnter(...action: [actionType][]) : featureType,
onEsc : featureType,
onEsc(...action: [actionType][]) : featureType,
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
dynamicTitles : featureType,
dynamicTitles() : featureType,
firstSucceeding : featureType,
firstSucceeding() : featureType,
itemlistContainer : featureType,
itemlistContainer(profile: { id: dataType, defaultItem: dataType, maxItems: dataType, initialSelection: dataType}) : featureType,
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
expandable : group_styleType,
expandable() : group_styleType,
initExpandable : featureType,
initExpandable() : featureType,
accordion : group_styleType,
accordion() : group_styleType,
initAccordion : featureType,
initAccordion(keyboardSupport: booleanType, autoFocus: booleanType) : featureType,
initAccordion(keyboardSupport: booleanType) : featureType,
sections : group_styleType,
sections(profile: { titleStyle: label_styleType, sectionStyle: group_styleType, innerGroupStyle: group_styleType}) : group_styleType,
sections(titleStyle: label_styleType) : group_styleType,
theme : featureType,
theme(theme: themeType) : featureType,
}
declare var group : group;,type css = {
dynamic : featureType | dialog_featureType,
dynamic(css: dataType) : featureType | dialog_featureType,
withCondition : featureType | dialog_featureType,
withCondition(condition: booleanType, css: dataType) : featureType | dialog_featureType,
withCondition(condition: booleanType) : featureType | dialog_featureType,
class : featureType | dialog_featureType,
class(class: dataType) : featureType | dialog_featureType,
width : featureType | dialog_featureType,
width(profile: { width: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType,
width(width: dataType) : featureType | dialog_featureType,
height : featureType | dialog_featureType,
height(profile: { height: dataType, overflow: dataType, minMax: dataType, selector: dataType}) : featureType | dialog_featureType,
height(height: dataType) : featureType | dialog_featureType,
opacity : featureType,
opacity(
/** 0-1 */opacity: dataType, selector: dataType) : featureType,
opacity(
/** 0-1 */opacity: dataType) : featureType,
padding : featureType | dialog_featureType,
padding(profile: { top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType,
padding(top: dataType) : featureType | dialog_featureType,
margin : featureType | dialog_featureType,
margin(profile: { top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}) : featureType | dialog_featureType,
margin(top: dataType) : featureType | dialog_featureType,
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
}
declare var css : css;,type d3Scatter = {
init : featureType,
init() : featureType,
}
declare var d3Scatter : d3Scatter;,type d3g = {
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
closeDialog : actionType,
closeDialog(id: dataType, delay: dataType) : actionType,
closeDialog(id: dataType) : actionType,
closeAll : actionType,
closeAll() : actionType,
}
declare var dialog : dialog;,type dialogFeature = {
uniqueDialog : dialog_featureType,
uniqueDialog(id: dataType, remeberLastLocation: booleanType) : dialog_featureType,
uniqueDialog(id: dataType) : dialog_featureType,
dragTitle : dialog_featureType,
dragTitle(id: dataType) : dialog_featureType,
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
declare var divider : divider;,type editableBoolean = {
keyboardSupport : featureType,
keyboardSupport() : featureType,
checkbox : editable_boolean_styleType,
checkbox() : editable_boolean_styleType,
checkboxWithTitle : editable_boolean_styleType,
checkboxWithTitle() : editable_boolean_styleType,
expandCollapse : editable_boolean_styleType,
expandCollapse() : editable_boolean_styleType,
checkboxWithLabel : editable_boolean_styleType,
checkboxWithLabel() : editable_boolean_styleType,
}
declare var editableBoolean : editableBoolean;,type editableText = {
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
expandable : editable_text_styleType,
expandable(profile: { buttonFeatures: [featureType], editableFeatures: [featureType], buttonStyle: button_styleType, editableStyle: editable_text_styleType, onToggle: actionType}) : editable_text_styleType,
}
declare var editableText : editableText;,type field = {
databind : featureType,
databind() : featureType,
databindText : featureType,
databindText(debounceTime: dataType, oneWay: booleanType) : featureType,
databindText(debounceTime: dataType) : featureType,
data : dataType,
data() : dataType,
default : featureType,
default(value: dataType) : featureType,
initValue : featureType,
initValue(value: dataType) : featureType,
keyboardShortcut : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType, action: actionType) : featureType,
keyboardShortcut(
/** e.g. Alt+C */key: dataType) : featureType,
subscribe : featureType,
subscribe(action: actionType, includeFirst: booleanType) : featureType,
subscribe(action: actionType) : featureType,
onChange : featureType,
onChange(action: actionType, includeFirst: booleanType) : featureType,
onChange(action: actionType) : featureType,
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
declare var field : field;,type innerHtml = {
unsafe : inner_html_styleType,
unsafe() : inner_html_styleType,
}
declare var innerHtml : innerHtml;,type itemlist = {
itemlistSelected : featureType,
itemlistSelected() : featureType,
watchItemsWithHeading : featureType,
watchItemsWithHeading(profile: { items: dataType, itemVariableName: dataType, groupBy: itemlist_group_byType}) : featureType,
watchItemsWithHeading(items: dataType) : featureType,
noContainer : featureType,
noContainer() : featureType,
init : featureType,
init() : featureType,
initTable : featureType,
initTable() : featureType,
fastFilter : featureType,
fastFilter(profile: { showCondition: dataType, filtersRef: dataType, 
/** watch childern change as well */includeChildren: dataType}) : featureType,
fastFilter(showCondition: dataType) : featureType,
selection : featureType,
selection(profile: { databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, 
/** e.g. background: red;color: blue */cssForSelected: dataType}) : featureType,
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
search(profile: { title: dataType, searchIn: dataType, databind: dataType, style: editable_text_styleType, features: [featureType]}) : controlType,
search(title: dataType) : controlType,
filterField : featureType,
filterField(fieldData: dataType, filterType: filter_typeType) : featureType,
filterField(fieldData: dataType) : featureType,
searchInAllProperties : dataType,
searchInAllProperties() : dataType,
}
declare var itemlistContainer : itemlistContainer;,type filterType = {
text : filter_typeType,
text(ignoreCase: booleanType) : filter_typeType,
exactMatch : filter_typeType,
exactMatch() : filter_typeType,
numeric : filter_typeType,
numeric() : filter_typeType,
}
declare var filterType : filterType;,type itemlistHeading = {
groupBy : itemlist_group_byType,
groupBy(itemToGroupID: dataType, promoteGroups: [dataType]) : itemlist_group_byType,
groupBy(itemToGroupID: dataType) : itemlist_group_byType,
}
declare var itemlistHeading : itemlistHeading;,type itemlog = {
div : group_styleType,
div() : group_styleType,
}
declare var itemlog : itemlog;,type label = {
bindText : featureType,
bindText() : featureType,
highlight : dataType,
highlight(profile: { base: dataType, highlight: dataType, cssClass: dataType}) : dataType,
highlight(base: dataType) : dataType,
mdlRippleEffect : label_styleType,
mdlRippleEffect() : label_styleType,
mdlButton : label_styleType,
mdlButton(width: dataType) : label_styleType,
}
declare var label : label;,type markdown = {
showdown : markdown_styleType,
showdown() : markdown_styleType,
}
declare var markdown : markdown;,type menu = {
menu : menu_optionType,
menu(profile: { title: dataType, options: [menu_optionType], optionsFilter: dataType}) : menu_optionType,
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
action(profile: { title: dataType, action: actionType, icon: dataType, shortcut: dataType, showCondition: booleanType}) : menu_optionType,
action(title: dataType) : menu_optionType,
initPopupMenu : featureType,
initPopupMenu(popupStyle: dialog_styleType) : featureType,
initMenuOption : featureType,
initMenuOption() : featureType,
}
declare var menu : menu;,type picklist = {
dynamicOptions : featureType,
dynamicOptions(recalcEm: dataType) : featureType,
onChange : featureType,
onChange(action: actionType) : featureType,
optionsByComma : picklist_optionsType,
optionsByComma(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType,
optionsByComma(options: dataType) : picklist_optionsType,
options : picklist_optionsType,
options(options: dataType, allowEmptyValue: booleanType) : picklist_optionsType,
options(options: dataType) : picklist_optionsType,
codedOptions : picklist_optionsType,
codedOptions(profile: { options: dataType, code: dataType, text: dataType, allowEmptyValue: booleanType}) : picklist_optionsType,
codedOptions(options: dataType) : picklist_optionsType,
sortedOptions : picklist_optionsType,
sortedOptions(options: picklist_optionsType, 
/** e.g input:80,group:90. 0 mark means hidden. no mark means 50 */marks: dataType) : picklist_optionsType,
sortedOptions(options: picklist_optionsType) : picklist_optionsType,
promote : picklist_promoteType,
promote(groups: dataType, options: dataType) : picklist_promoteType,
promote(groups: dataType) : picklist_promoteType,
native : picklist_styleType,
native() : picklist_styleType,
radio : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType, text: dataType) : picklist_styleType,
radio(
/** e.g. display: none */radioCss: dataType) : picklist_styleType,
radioVertical : picklist_styleType,
radioVertical() : picklist_styleType,
nativeMdLookOpen : picklist_styleType,
nativeMdLookOpen() : picklist_styleType,
nativeMdLook : picklist_styleType,
nativeMdLook() : picklist_styleType,
labelList : picklist_styleType,
labelList(profile: { labelStyle: label_styleType, itemlistStyle: itemlist_styleType, 
/** e.g. background: red OR >a { color: red } */cssForSelected: dataType}) : picklist_styleType,
labelList(labelStyle: label_styleType) : picklist_styleType,
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
init : featureType,
init() : featureType,
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
mdlIcon12 : button_styleType | icon_with_action_styleType,
mdlIcon12(icon: dataType) : button_styleType | icon_with_action_styleType,
tableCellHref : button_styleType,
tableCellHref() : button_styleType,
}
declare var button : button;,type text = {
codemirror : text_styleType,
codemirror(profile: { cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: booleanType}) : text_styleType,
codemirror(cm_settings: dataType) : text_styleType,
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
flex(profile: { alignItems: dataType, spacing: dataType, justifyContent: dataType, direction: dataType, wrap: dataType}) : layoutType | featureType,
flex(alignItems: dataType) : layoutType | featureType,
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
declare var flexItem : flexItem;,type responsive = {
notForPhone : featureType,
notForPhone() : featureType,
}
declare var responsive : responsive;,type mdlStyle = {
initDynamic : featureType,
initDynamic(query: dataType) : featureType,
}
declare var mdlStyle : mdlStyle;,type mdl = {
rippleEffect : featureType,
rippleEffect() : featureType,
}
declare var mdl : mdl;,type propertySheet = {
titlesLeft : group_styleType,
titlesLeft(profile: { titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType,
titlesLeft(titleStyle: label_styleType) : group_styleType,
titlesAbove : group_styleType,
titlesAbove(profile: { titleStyle: label_styleType, titleText: dataType, 
/** grid-column-gap */spacing: dataType}) : group_styleType,
titlesAbove(titleStyle: label_styleType) : group_styleType,
}
declare var propertySheet : propertySheet;,type table = {
initTableOrItemlist : featureType,
initTableOrItemlist() : featureType,
init : featureType,
init() : featureType,
initSort : featureType,
initSort() : featureType,
}
declare var table : table;,type theme = {
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
nodeModel : tree_node_modelType,
nodeModel(profile: { rootPath: dataType, 
/** from parent path to children paths */children: dataType, 
/** value of path */pathToItem: dataType, 
/** icon name from material icons */icon: dataType, 
/** path as input. differnt from children() == 0, as you can drop into empty array */isChapter: booleanType, maxDepth: dataType, fieldCache: booleanType, includeRoot: booleanType}) : tree_node_modelType,
nodeModel(rootPath: dataType) : tree_node_modelType,
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
dragAndDrop : featureType,
dragAndDrop() : featureType,
}
declare var tree : tree;,type urlHistory = {
mapUrlToResource : actionType,
mapUrlToResource(profile: { params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}) : actionType,
}
declare var urlHistory : urlHistory;,type textEditor = {
withCursorPath : actionType,
withCursorPath(action: actionType, selector: dataType) : actionType,
withCursorPath(action: actionType) : actionType,
isDirty : dataType,
isDirty() : dataType,
}
declare var textEditor : textEditor;,type textarea = {
initTextareaEditor : featureType,
initTextareaEditor() : featureType,
}
declare var textarea : textarea;