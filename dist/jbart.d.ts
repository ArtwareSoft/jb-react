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



// type data
type dataType = pipelinePT | pipePT | data_ifPT | listPT | firstSucceedingPT | property_namesPT | propertiesPT | prefixPT | suffixPT | remove_prefixPT | remove_suffixPT | remove_suffix_regexPT | assignPT | objPT | ifPT | to_stringPT | to_uppercasePT | to_lowercasePT | capitalizePT | logPT | asIsPT | objectPT | json_stringifyPT | json_parsePT | splitPT | replacePT | parentPT | extract_prefixPT | extract_suffixPT | rangePT | type_ofPT | class_namePT | http_getPT | isRefPT | asRefPT | data_switchPT | newlinePT | jison_parsePT | extract_textPT | break_textPT | zip_arraysPT | remove_sectionsPT | mergePT | dynamic_objectPT | filter_empty_propertiesPT | trimPT | remove_prefix_regexPT | pretty_printPT | fs_readFilePT | fs_statPT | fs_readdirPT | fs_directory_contentPT | test_dialog_contentPT | field_dataPT | itemlist_container_search_in_all_propertiesPT | highlightPT | custom_stylePT | style_by_controlPT | ((ctx: ctx) => any)
type cmp_def_dataType = {
	type: 'data',
	params?: [param],
	impl: dataType,
}
type pipelinePT = {$: 'pipeline', items: dataType | [aggregatorType]}
type pipePT = {$: 'pipe', items: dataType | [aggregatorType]}
type data_ifPT = {$: 'data.if', condition: booleanType, then: dataType, else: dataType}
type listPT = {$: 'list', items: [dataType]}
type firstSucceedingPT = {$: 'firstSucceeding', items: [dataType]}
type property_namesPT = {$: 'property-names', obj: dataType}
type propertiesPT = {$: 'properties', obj: dataType}
type prefixPT = {$: 'prefix', separator: dataType, text: dataType}
type suffixPT = {$: 'suffix', separator: dataType, text: dataType}
type remove_prefixPT = {$: 'remove-prefix', separator: dataType, text: dataType}
type remove_suffixPT = {$: 'remove-suffix', separator: dataType, text: dataType}
type remove_suffix_regexPT = {$: 'remove-suffix-regex', suffix: dataType, text: dataType}
type assignPT = {$: 'assign', property: [propType]}
type objPT = {$: 'obj', property: [propType]}
type ifPT = {$: 'if', condition: booleanType, then: dataType, $else: dataType}
type to_stringPT = {$: 'to-string', text: dataType}
type to_uppercasePT = {$: 'to-uppercase', text: dataType}
type to_lowercasePT = {$: 'to-lowercase', text: dataType}
type capitalizePT = {$: 'capitalize', text: dataType}
type logPT = {$: 'log', obj: dataType}
type asIsPT = {$: 'asIs', $asIs: dataType}
type objectPT = {$: 'object', }
type json_stringifyPT = {$: 'json.stringify', value: dataType, 
/** use space or tab to make pretty output */space: dataType}
type json_parsePT = {$: 'json.parse', text: dataType}
type splitPT = {$: 'split', separator: dataType, text: dataType, part: dataType}
type replacePT = {$: 'replace', find: dataType, replace: dataType, text: dataType, useRegex: booleanType, 
/** g,i,m */regexFlags: dataType}
type parentPT = {$: 'parent', item: dataType}
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
/** convert result to json */json: dataType}
type isRefPT = {$: 'isRef', obj: dataType}
type asRefPT = {$: 'asRef', obj: dataType}
type data_switchPT = {$: 'data.switch', cases: [data_switch_caseType], default: dataType}
type newlinePT = {$: 'newline', }
type jison_parsePT = {$: 'jison.parse', parser: jison_parserType, goal: dataType, text: dataType, debug: dataType}
type extract_textPT = {$: 'extract-text', text: dataType, startMarkers: dataType, endMarker: dataType, 
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
type fs_directory_contentPT = {$: 'fs.directory-content', directory: dataType, filter: dataType}
type test_dialog_contentPT = {$: 'test.dialog-content', id: dataType}
type field_dataPT = {$: 'field.data', }
type itemlist_container_search_in_all_propertiesPT = {$: 'itemlist-container.search-in-all-properties', }
type highlightPT = {$: 'highlight', base: dataType, highlight: dataType, cssClass: dataType}
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}

// type aggregator
type aggregatorType = slicePT | sortPT | firstPT | lastPT | countPT | reversePT | samplePT | assign_with_indexPT | filterPT | joinPT | uniquePT | wrap_as_object_with_arrayPT | wrap_as_objectPT | d3_histogramPT | itemlist_container_filterPT | ((ctx: ctx) => any)
type cmp_def_aggregatorType = {
	type: 'aggregator',
	params?: [param],
	impl: aggregatorType,
}
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
type assign_with_indexPT = {$: 'assign-with-index', property: [propType]}
type filterPT = {$: 'filter', filter: booleanType}
type joinPT = {$: 'join', separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemName: dataType, itemText: dataType}
type uniquePT = {$: 'unique', id: dataType, items: dataType}
type wrap_as_object_with_arrayPT = {$: 'wrap-as-object-with-array', arrayProperty: dataType, items: dataType}
type wrap_as_objectPT = {$: 'wrap-as-object', itemToPropName: dataType, items: dataType}
type d3_histogramPT = {$: 'd3.histogram', bins: dataType, values: dataType}
type itemlist_container_filterPT = {$: 'itemlist-container.filter', updateCounters: dataType}

// type boolean
type booleanType = notPT | andPT | orPT | betweenPT | containsPT | not_containsPT | starts_withPT | ends_withPT | match_regexPT | isNullPT | isEmptyPT | notEmptyPT | equalsPT | not_equalsPT | is_of_typePT | in_groupPT | ((ctx: ctx) => any)
type cmp_def_booleanType = {
	type: 'boolean',
	params?: [param],
	impl: booleanType,
}
type notPT = {$: 'not', of: booleanType}
type andPT = {$: 'and', items: [booleanType]}
type orPT = {$: 'or', items: [booleanType]}
type betweenPT = {$: 'between', from: dataType, to: dataType, val: dataType}
type containsPT = {$: 'contains', text: [dataType], allText: dataType, inOrder: dataType}
type not_containsPT = {$: 'not-contains', text: [dataType], allText: dataType}
type starts_withPT = {$: 'starts-with', startsWith: dataType, text: dataType}
type ends_withPT = {$: 'ends-with', endsWith: dataType, text: dataType}
type match_regexPT = {$: 'match-regex', text: dataType, 
/** e.g: [a-zA-Z]* */regex: dataType, 
/** regex must match all text */fillText: dataType}
type isNullPT = {$: 'isNull', obj: dataType}
type isEmptyPT = {$: 'isEmpty', item: dataType}
type notEmptyPT = {$: 'notEmpty', item: dataType}
type equalsPT = {$: 'equals', item1: dataType, item2: dataType}
type not_equalsPT = {$: 'not-equals', item1: dataType, item2: dataType}
type is_of_typePT = {$: 'is-of-type', 
/** string,boolean */type: dataType, obj: dataType}
type in_groupPT = {$: 'in-group', group: dataType, item: dataType}

// type action
type actionType = action_ifPT | jb_runPT | write_valuePT | remove_from_arrayPT | toggle_boolean_valuePT | touchPT | runActionsPT | http_postPT | action_switchPT | open_dialogPT | dialog_close_containing_popupPT | dialog_close_dialogPT | dialog_close_all_popupsPT | dialog_close_allPT | itemlist_container_addPT | itemlist_container_deletePT | menu_open_context_menuPT | tree_regain_focusPT | tree_redrawPT | url_history_map_url_to_resourcePT | goto_urlPT | reset_wspyPT | ((ctx: ctx) => any)
type cmp_def_actionType = {
	type: 'action',
	params?: [param],
	impl: actionType,
}
type action_ifPT = {$: 'action.if', condition: booleanType, then: actionType, else: actionType}
type jb_runPT = {$: 'jb-run', 
/** profile name */profile: dataType, params: dataType}
type write_valuePT = {$: 'write-value', to: dataType, value: dataType}
type remove_from_arrayPT = {$: 'remove-from-array', array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType}
type toggle_boolean_valuePT = {$: 'toggle-boolean-value', of: dataType}
type touchPT = {$: 'touch', data: dataType}
type runActionsPT = {$: 'runActions', actions: [actionType]}
type http_postPT = {$: 'http.post', url: dataType, postData: dataType, 
/** convert result to json */jsonResult: dataType}
type action_switchPT = {$: 'action.switch', cases: [action_switch_caseType], defaultAction: actionType}
type open_dialogPT = {$: 'open-dialog', id: dataType, style: dialog_styleType, content: controlType, menu: controlType, title: dataType, onOK: actionType, modal: booleanType, features: [dialog_featureType]}
type dialog_close_containing_popupPT = {$: 'dialog.close-containing-popup', OK: booleanType}
type dialog_close_dialogPT = {$: 'dialog.close-dialog', id: dataType, delay: dataType}
type dialog_close_all_popupsPT = {$: 'dialog.close-all-popups', }
type dialog_close_allPT = {$: 'dialog.close-all', }
type itemlist_container_addPT = {$: 'itemlist-container.add', }
type itemlist_container_deletePT = {$: 'itemlist-container.delete', item: dataType}
type menu_open_context_menuPT = {$: 'menu.open-context-menu', menu: menu_optionType, popupStyle: dialog_styleType, features: [dialog_featureType]}
type tree_regain_focusPT = {$: 'tree.regain-focus', }
type tree_redrawPT = {$: 'tree.redraw', strong: booleanType}
type url_history_map_url_to_resourcePT = {$: 'url-history.map-url-to-resource', params: [dataType], resource: dataType, 
/** base string to add/ingnore in url */base: dataType, onUrlChange: actionType}
type goto_urlPT = {$: 'goto-url', url: dataType, target: enumType}
type reset_wspyPT = {$: 'reset-wspy', param: dataType}

// type prop
type propType = propPT | ((ctx: ctx) => any)
type cmp_def_propType = {
	type: 'prop',
	params?: [param],
	impl: propType,
}
type propPT = {$: 'prop', title: dataType, val: dataType, type: dataType}

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
type ui_action_clickPT = {$: 'ui-action.click', selector: dataType}
type ui_action_keyboard_eventPT = {$: 'ui-action.keyboard-event', selector: dataType, type: dataType, keyCode: dataType, ctrl: dataType}
type ui_action_set_textPT = {$: 'ui-action.set-text', value: dataType, selector: dataType, delay: dataType}

// type control
type controlType = buttonPT | icon_with_actionPT | cardPT | d3_chart_scatterPT | dividerPT | editable_booleanPT | editable_numberPT | editable_textPT | groupPT | inline_controlsPT | dynamic_controlsPT | control_first_succeedingPT | control_with_conditionPT | material_iconPT | imagePT | inner_htmlPT | itemlist_container_searchPT | itemlist_container_more_items_buttonPT | itemlist_with_groupsPT | itemlist_default_headingPT | itemlistPT | itemlogPT | labelPT | markdownPT | menu_controlPT | picklistPT | sidenavPT | tablePT | tabsPT | textPT | rich_textPT | treePT | ((ctx: ctx) => any)
type cmp_def_controlType = {
	type: 'control',
	params?: [param],
	impl: controlType,
}
type buttonPT = {$: 'button', title: dataType, action: actionType, style: button_styleType, features: [featureType]}
type icon_with_actionPT = {$: 'icon-with-action', icon: dataType, title: dataType, action: actionType, style: icon_with_action_styleType, features: [featureType]}
type cardPT = {$: 'card', title: dataType, subTitle: dataType, text: dataType, image: dataType, topButton: clickableType, menu: menuType, style: card_styleType, features: [featureType]}
type d3_chart_scatterPT = {$: 'd3.chart-scatter', title: dataType, items: dataType, frame: d3_frameType, pivots: [d3_pivotType], itemTitle: dataType, visualSizeLimit: dataType, style: d3_scatter_styleType, features: [featureType]}
type dividerPT = {$: 'divider', style: divider_styleType, title: dataType, features: [featureType]}
type editable_booleanPT = {$: 'editable-boolean', databind: dataType, style: editable_boolean_styleType, title: dataType, textForTrue: dataType, textForFalse: dataType, features: [featureType]}
type editable_numberPT = {$: 'editable-number', databind: dataType, title: dataType, style: editable_number_styleType, 
/** leave empty to parse symbol from value */symbol: dataType, min: dataType, max: dataType, displayString: dataType, dataString: dataType, 
/** adjust its scale if at edges */autoScale: dataType, 
/** used by slider */step: dataType, 
/** used by slider */initialPixelsPerUnit: dataType, features: [featureType]}
type editable_textPT = {$: 'editable-text', title: dataType, databind: dataType, updateOnBlur: booleanType, style: editable_text_styleType, features: [featureType]}
type groupPT = {$: 'group', title: dataType, style: group_styleType, controls: [controlType], features: [featureType]}
type inline_controlsPT = {$: 'inline-controls', controls: [controlType]}
type dynamic_controlsPT = {$: 'dynamic-controls', controlItems: dataType, genericControl: controlType, itemVariable: dataType}
type control_first_succeedingPT = {$: 'control.first-succeeding', title: dataType, style: first_succeeding_styleType, controls: [controlType], features: [featureType]}
type control_with_conditionPT = {$: 'control-with-condition', condition: booleanType, control: controlType, title: dataType}
type material_iconPT = {$: 'material-icon', icon: dataType, title: dataType, style: icon_styleType, features: [featureType]}
type imagePT = {$: 'image', url: dataType, imageWidth: dataType, imageHeight: dataType, width: dataType, height: dataType, units: dataType, style: image_styleType, features: [featureType]}
type inner_htmlPT = {$: 'inner-html', title: dataType, html: dataType, style: inner_html_styleType, features: [featureType]}
type itemlist_container_searchPT = {$: 'itemlist-container.search', title: dataType, searchIn: dataType, databind: dataType, style: editable_text_styleType, features: [featureType]}
type itemlist_container_more_items_buttonPT = {$: 'itemlist-container.more-items-button', title: dataType, delta: dataType, style: button_styleType, features: [featureType]}
type itemlist_with_groupsPT = {$: 'itemlist-with-groups', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, groupBy: itemlist_group_byType, headingCtrl: controlType, 
/** resources to watch */watch: dataType, itemVariable: dataType, features: [featureType]}
type itemlist_default_headingPT = {$: 'itemlist-default-heading', }
type itemlistPT = {$: 'itemlist', title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, watchItems: dataType, itemVariable: dataType, features: [featureType]}
type itemlogPT = {$: 'itemlog', title: dataType, items: dataType, controls: [controlType], style: itemlog_styleType, itemVariable: dataType, counter: dataType, features: [featureType]}
type labelPT = {$: 'label', title: dataType, style: label_styleType, features: [featureType]}
type markdownPT = {$: 'markdown', markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType]}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType, style: menu_styleType, features: [featureType]}
type picklistPT = {$: 'picklist', title: dataType, databind: dataType, options: picklist_optionsType, promote: picklist_promoteType, style: picklist_styleType, features: [featureType]}
type sidenavPT = {$: 'sidenav', controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType]}
type tablePT = {$: 'table', title: dataType, items: dataType, fields: [table_fieldType], style: table_styleType, watchItems: dataType, 
/** by default table is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}
type tabsPT = {$: 'tabs', tabs: [controlType], style: tabs_styleType, features: [featureType]}
type textPT = {$: 'text', text: dataType, style: text_styleType, title: dataType, features: [featureType]}
type rich_textPT = {$: 'rich-text', text: dataType, title: dataType, style: rich_text_styleType, features: [featureType]}
type treePT = {$: 'tree', nodeModel: tree_nodeModelType, style: tree_styleType, features: [featureType]}

// type clickable
type clickableType = buttonPT | icon_with_actionPT | menu_controlPT | ((ctx: ctx) => any)
type cmp_def_clickableType = {
	type: 'clickable',
	params?: [param],
	impl: clickableType,
}
type buttonPT = {$: 'button', title: dataType, action: actionType, style: button_styleType, features: [featureType]}
type icon_with_actionPT = {$: 'icon-with-action', icon: dataType, title: dataType, action: actionType, style: icon_with_action_styleType, features: [featureType]}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType, style: menu_styleType, features: [featureType]}

// type feature
type featureType = ctrl_actionPT | alt_actionPT | button_disabledPT | card_initPT | group_waitPT | watch_refPT | watch_observablePT | group_dataPT | idPT | varPT | bind_refsPT | calculated_varPT | featuresPT | feature_initPT | feature_after_loadPT | feature_ifPT | hiddenPT | conditional_classPT | feature_hover_titlePT | feature_keyboard_shortcutPT | feature_onHoverPT | feature_onKeyPT | feature_onEnterPT | feature_onEscPT | feature_onDeletePT | group_auto_focus_on_first_inputPT | cssPT | css_classPT | css_widthPT | css_heightPT | css_opacityPT | css_paddingPT | css_marginPT | css_transform_rotatePT | css_colorPT | css_transform_scalePT | css_box_shadowPT | css_borderPT | d3_scatter_initPT | editable_boolean_keyboard_supportPT | editable_text_x_buttonPT | editable_text_helper_popupPT | field_databindPT | field_databind_textPT | field_databind_rangePT | field_defaultPT | field_subscribePT | field_toolbarPT | validationPT | group_init_groupPT | group_dynamic_titlesPT | group_itemlist_containerPT | itemlist_itemlist_selectedPT | itemlist_container_filter_fieldPT | itemlist_watch_items_with_headingPT | itemlist_no_containerPT | itemlist_initPT | itemlist_selectionPT | itemlist_keyboard_selectionPT | itemlist_drag_and_dropPT | itemlist_drag_handlePT | itemlist_shown_only_on_item_hoverPT | itemlist_dividerPT | label_bind_titlePT | menu_init_popup_menuPT | menu_init_menu_optionPT | picklist_dynamic_optionsPT | picklist_onChangePT | slider_initPT | slider_text_handleArrowKeysPT | slider_edit_as_text_popupPT | group_init_expandablePT | group_init_accordionPT | flex_layout_container_align_main_axisPT | flex_item_growPT | flex_item_basisPT | flex_item_align_selfPT | responsive_not_for_phonePT | mdl_style_init_dynamicPT | mdl_ripple_effectPT | table_initPT | table_init_sortPT | group_init_tabsPT | text_bind_textPT | group_themePT | tree_selectionPT | tree_keyboard_selectionPT | tree_drag_and_dropPT | ((ctx: ctx) => any)
type cmp_def_featureType = {
	type: 'feature',
	params?: [param],
	impl: featureType,
}
type ctrl_actionPT = {$: 'ctrl-action', action: actionType}
type alt_actionPT = {$: 'alt-action', action: actionType}
type button_disabledPT = {$: 'button-disabled', enabledCondition: booleanType}
type card_initPT = {$: 'card.init', }
type group_waitPT = {$: 'group.wait', for: dataType, loadingControl: controlType, error: controlType, varName: dataType}
type watch_refPT = {$: 'watch-ref', 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** delay in activation, can be used to set priority */delay: dataType}
type watch_observablePT = {$: 'watch-observable', toWatch: dataType}
type group_dataPT = {$: 'group.data', data: dataType, 
/** optional. define data as a local variable */itemVariable: dataType, watch: dataType, 
/** watch childern change as well */includeChildren: dataType}
type idPT = {$: 'id', id: dataType}
type varPT = {$: 'var', name: dataType, value: dataType, 
/** E.g., selected item variable */mutable: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType}
type bind_refsPT = {$: 'bind-refs', watchRef: dataType, 
/** watch childern change as well */includeChildren: dataType, updateRef: dataType, value: dataType}
type calculated_varPT = {$: 'calculated-var', name: dataType, value: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType}
type featuresPT = {$: 'features', features: [featureType]}
type feature_initPT = {$: 'feature.init', action: [actionType]}
type feature_after_loadPT = {$: 'feature.after-load', action: [actionType]}
type feature_ifPT = {$: 'feature.if', showCondition: dataType}
type hiddenPT = {$: 'hidden', showCondition: booleanType}
type conditional_classPT = {$: 'conditional-class', cssClass: dataType, condition: booleanType}
type feature_hover_titlePT = {$: 'feature.hover-title', title: dataType}
type feature_keyboard_shortcutPT = {$: 'feature.keyboard-shortcut', 
/** e.g. Alt+C */key: dataType, action: actionType}
type feature_onHoverPT = {$: 'feature.onHover', action: [actionType]}
type feature_onKeyPT = {$: 'feature.onKey', code: dataType, action: [actionType]}
type feature_onEnterPT = {$: 'feature.onEnter', action: [actionType]}
type feature_onEscPT = {$: 'feature.onEsc', action: [actionType]}
type feature_onDeletePT = {$: 'feature.onDelete', action: [actionType]}
type group_auto_focus_on_first_inputPT = {$: 'group.auto-focus-on-first-input', }
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_opacityPT = {$: 'css.opacity', opacity: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_transform_rotatePT = {$: 'css.transform-rotate', angle: dataType, selector: dataType}
type css_colorPT = {$: 'css.color', color: dataType, background: dataType, selector: dataType}
type css_transform_scalePT = {$: 'css.transform-scale', x: dataType, y: dataType, selector: dataType}
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type d3_scatter_initPT = {$: 'd3-scatter.init', }
type editable_boolean_keyboard_supportPT = {$: 'editable-boolean.keyboard-support', }
type editable_text_x_buttonPT = {$: 'editable-text.x-button', }
type editable_text_helper_popupPT = {$: 'editable-text.helper-popup', control: controlType, popupId: dataType, popupStyle: dialog_styleType, 
/** show/hide helper according to input content */showHelper: dataType, onEnter: actionType, onEsc: actionType}
type field_databindPT = {$: 'field.databind', }
type field_databind_textPT = {$: 'field.databind-text', debounceTime: dataType, oneWay: booleanType}
type field_databind_rangePT = {$: 'field.databind-range', }
type field_defaultPT = {$: 'field.default', value: dataType}
type field_subscribePT = {$: 'field.subscribe', action: actionType, includeFirst: booleanType}
type field_toolbarPT = {$: 'field.toolbar', toolbar: controlType}
type validationPT = {$: 'validation', validCondition: booleanType, errorMessage: dataType}
type group_init_groupPT = {$: 'group.init-group', }
type group_dynamic_titlesPT = {$: 'group.dynamic-titles', }
type group_itemlist_containerPT = {$: 'group.itemlist-container', id: dataType, defaultItem: dataType, maxItems: dataType, initialSelection: dataType}
type itemlist_itemlist_selectedPT = {$: 'itemlist.itemlist-selected', }
type itemlist_container_filter_fieldPT = {$: 'itemlist-container.filter-field', fieldData: dataType, filterType: filter_typeType}
type itemlist_watch_items_with_headingPT = {$: 'itemlist.watch-items-with-heading', items: dataType, itemVariableName: dataType, groupBy: itemlist_group_byType}
type itemlist_no_containerPT = {$: 'itemlist.no-container', }
type itemlist_initPT = {$: 'itemlist.init', }
type itemlist_selectionPT = {$: 'itemlist.selection', databind: dataType, selectedToDatabind: dataType, databindToSelected: dataType, onSelection: actionType, onDoubleClick: actionType, autoSelectFirst: booleanType, cssForSelected: dataType}
type itemlist_keyboard_selectionPT = {$: 'itemlist.keyboard-selection', onEnter: actionType, autoFocus: booleanType}
type itemlist_drag_and_dropPT = {$: 'itemlist.drag-and-drop', }
type itemlist_drag_handlePT = {$: 'itemlist.drag-handle', }
type itemlist_shown_only_on_item_hoverPT = {$: 'itemlist.shown-only-on-item-hover', }
type itemlist_dividerPT = {$: 'itemlist.divider', space: dataType}
type label_bind_titlePT = {$: 'label.bind-title', }
type menu_init_popup_menuPT = {$: 'menu.init-popup-menu', popupStyle: dialog_styleType}
type menu_init_menu_optionPT = {$: 'menu.init-menu-option', }
type picklist_dynamic_optionsPT = {$: 'picklist.dynamic-options', recalcEm: dataType}
type picklist_onChangePT = {$: 'picklist.onChange', action: actionType}
type slider_initPT = {$: 'slider.init', }
type slider_text_handleArrowKeysPT = {$: 'slider-text.handleArrowKeys', }
type slider_edit_as_text_popupPT = {$: 'slider.edit-as-text-popup', }
type group_init_expandablePT = {$: 'group.init-expandable', }
type group_init_accordionPT = {$: 'group.init-accordion', keyboardSupport: dataType, autoFocus: dataType}
type flex_layout_container_align_main_axisPT = {$: 'flex-layout-container.align-main-axis', align: dataType}
type flex_item_growPT = {$: 'flex-item.grow', factor: dataType}
type flex_item_basisPT = {$: 'flex-item.basis', factor: dataType}
type flex_item_align_selfPT = {$: 'flex-item.align-self', align: dataType}
type responsive_not_for_phonePT = {$: 'responsive.not-for-phone', }
type mdl_style_init_dynamicPT = {$: 'mdl-style.init-dynamic', query: dataType}
type mdl_ripple_effectPT = {$: 'mdl.ripple-effect', }
type table_initPT = {$: 'table.init', }
type table_init_sortPT = {$: 'table.init-sort', }
type group_init_tabsPT = {$: 'group.init-tabs', keyboardSupport: dataType, autoFocus: dataType}
type text_bind_textPT = {$: 'text.bind-text', }
type group_themePT = {$: 'group.theme', theme: themeType}
type tree_selectionPT = {$: 'tree.selection', databind: dataType, autoSelectFirst: booleanType, onSelection: actionType, onRightClick: actionType}
type tree_keyboard_selectionPT = {$: 'tree.keyboard-selection', onKeyboardSelection: actionType, onEnter: actionType, onRightClickOfExpanded: actionType, autoFocus: booleanType, applyMenuShortcuts: menu_optionType}
type tree_drag_and_dropPT = {$: 'tree.drag-and-drop', }

// type dialog-feature
type dialog_featureType = cssPT | css_classPT | css_widthPT | css_heightPT | css_paddingPT | css_marginPT | css_box_shadowPT | css_borderPT | dialog_feature_unique_dialogPT | dialog_feature_keyboard_shortcutPT | dialog_feature_near_launcher_positionPT | dialog_feature_onClosePT | dialog_feature_close_when_clicking_outsidePT | dialog_feature_auto_focus_on_first_inputPT | dialog_feature_css_class_on_launching_elementPT | dialog_feature_max_zIndex_on_clickPT | dialog_feature_drag_titlePT | dialog_feature_resizerPT | ((ctx: ctx) => any)
type cmp_def_dialog_featureType = {
	type: 'dialog_feature',
	params?: [param],
	impl: dialog_featureType,
}
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType, overflow: dataType, minMax: dataType, selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType, left: dataType, right: dataType, bottom: dataType, selector: dataType}
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType, spreadRadius: dataType, shadowColor: dataType, opacity: dataType, horizontal: dataType, vertical: dataType, selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType, side: dataType, style: dataType, color: dataType, selector: dataType}
type dialog_feature_unique_dialogPT = {$: 'dialog-feature.unique-dialog', id: dataType, remeberLastLocation: booleanType}
type dialog_feature_keyboard_shortcutPT = {$: 'dialog-feature.keyboard-shortcut', 
/** Ctrl+C or Alt+V */shortcut: dataType, action: actionType}
type dialog_feature_near_launcher_positionPT = {$: 'dialog-feature.near-launcher-position', offsetLeft: dataType, offsetTop: dataType, rightSide: dataType}
type dialog_feature_onClosePT = {$: 'dialog-feature.onClose', action: actionType}
type dialog_feature_close_when_clicking_outsidePT = {$: 'dialog-feature.close-when-clicking-outside', delay: dataType}
type dialog_feature_auto_focus_on_first_inputPT = {$: 'dialog-feature.auto-focus-on-first-input', selectText: dataType}
type dialog_feature_css_class_on_launching_elementPT = {$: 'dialog-feature.css-class-on-launching-element', }
type dialog_feature_max_zIndex_on_clickPT = {$: 'dialog-feature.max-zIndex-on-click', minZIndex: dataType}
type dialog_feature_drag_titlePT = {$: 'dialog-feature.drag-title', id: dataType}
type dialog_feature_resizerPT = {$: 'dialog-feature.resizer', 
/** effective only for dialog with a single codemirror element */resizeInnerCodemirror: dataType}

// type d3.scatter-style
type d3_scatter_styleType = d3_scatter_plainPT | custom_stylePT | style_by_controlPT | ((ctx: ctx) => any)
type cmp_def_d3_scatter_styleType = {
	type: 'd3_scatter_style',
	params?: [param],
	impl: d3_scatter_styleType,
}
type d3_scatter_plainPT = {$: 'd3-scatter.plain', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}

// type d3.frame
type d3_frameType = d3_framePT | ((ctx: ctx) => any)
type cmp_def_d3_frameType = {
	type: 'd3_frame',
	params?: [param],
	impl: d3_frameType,
}
type d3_framePT = {$: 'd3.frame', width: dataType, height: dataType, top: dataType, right: dataType, bottom: dataType, left: dataType}

// type d3.histogram-style
type d3_histogram_styleType = d3_histogram_plainPT | custom_stylePT | style_by_controlPT | ((ctx: ctx) => any)
type cmp_def_d3_histogram_styleType = {
	type: 'd3_histogram_style',
	params?: [param],
	impl: d3_histogram_styleType,
}
type d3_histogram_plainPT = {$: 'd3-histogram.plain', }
type custom_stylePT = {$: 'custom-style', template: dataType, css: dataType, features: [featureType]}
type style_by_controlPT = {$: 'style-by-control', control: controlType, modelVar: dataType}

// type d3-feature
type d3_featureType = d3_histogram_initPT | d3_item_indicatorPT | ((ctx: ctx) => any)
type cmp_def_d3_featureType = {
	type: 'd3_feature',
	params?: [param],
	impl: d3_featureType,
}
type d3_histogram_initPT = {$: 'd3-histogram.init', }
type d3_item_indicatorPT = {$: 'd3.item-indicator', item: dataType}

// type d3.axes
type d3_axesType = d3_buttom_and_left_axesPT | ((ctx: ctx) => any)
type cmp_def_d3_axesType = {
	type: 'd3_axes',
	params?: [param],
	impl: d3_axesType,
}
type d3_buttom_and_left_axesPT = {$: 'd3.buttom-and-left-axes', }

// type d3.pivot
type d3_pivotType = d3_pivotPT | ((ctx: ctx) => any)
type cmp_def_d3_pivotType = {
	type: 'd3_pivot',
	params?: [param],
	impl: d3_pivotType,
}
type d3_pivotPT = {$: 'd3.pivot', title: dataType, value: dataType, scale: d3_scaleType, range: d3_rangeType, domain: d3_domainType}

// type d3.scale
type d3_scaleType = d3_linear_scalePT | d3_sqrt_scalePT | d3_ordinal_scalePT | d3_colorsPT | ((ctx: ctx) => any)
type cmp_def_d3_scaleType = {
	type: 'd3_scale',
	params?: [param],
	impl: d3_scaleType,
}
type d3_linear_scalePT = {$: 'd3.linear-scale', }
type d3_sqrt_scalePT = {$: 'd3.sqrt-scale', }
type d3_ordinal_scalePT = {$: 'd3.ordinal-scale', list: dataType}
type d3_colorsPT = {$: 'd3.colors', }

// type d3.range
type d3_rangeType = d3_auto_rangePT | d3_from_toPT | ((ctx: ctx) => any)
type cmp_def_d3_rangeType = {
	type: 'd3_range',
	params?: [param],
	impl: d3_rangeType,
}
type d3_auto_rangePT = {$: 'd3.auto-range', }
type d3_from_toPT = {$: 'd3.from-to', from: dataType, to: dataType}

// type d3.domain
type d3_domainType = d3_domain_by_valuesPT | ((ctx: ctx) => any)
type cmp_def_d3_domainType = {
	type: 'd3_domain',
	params?: [param],
	impl: d3_domainType,
}
type d3_domain_by_valuesPT = {$: 'd3.domain-by-values', }

// type dialog.style
type dialog_styleType = dialog_defaultPT | dialog_popupPT | dialog_dialog_ok_cancelPT | dialog_context_menu_popupPT | ((ctx: ctx) => any)
type cmp_def_dialog_styleType = {
	type: 'dialog_style',
	params?: [param],
	impl: dialog_styleType,
}
type dialog_defaultPT = {$: 'dialog.default', }
type dialog_popupPT = {$: 'dialog.popup', }
type dialog_dialog_ok_cancelPT = {$: 'dialog.dialog-ok-cancel', okLabel: dataType, cancelLabel: dataType}
type dialog_context_menu_popupPT = {$: 'dialog.context-menu-popup', offsetTop: dataType, rightSide: dataType}

// type divider.style
type divider_styleType = divider_brPT | divider_flex_auto_growPT | ((ctx: ctx) => any)
type cmp_def_divider_styleType = {
	type: 'divider_style',
	params?: [param],
	impl: divider_styleType,
}
type divider_brPT = {$: 'divider.br', }
type divider_flex_auto_growPT = {$: 'divider.flex-auto-grow', }

// type editable-number.style
type editable_number_styleType = editable_number_inputPT | editable_number_slider_no_textPT | editable_number_sliderPT | editable_number_mdl_sliderPT | ((ctx: ctx) => any)
type cmp_def_editable_number_styleType = {
	type: 'editable_number_style',
	params?: [param],
	impl: editable_number_styleType,
}
type editable_number_inputPT = {$: 'editable-number.input', }
type editable_number_slider_no_textPT = {$: 'editable-number.slider-no-text', }
type editable_number_sliderPT = {$: 'editable-number.slider', }
type editable_number_mdl_sliderPT = {$: 'editable-number.mdl-slider', }

// type icon-with-action.style
type icon_with_action_styleType = icon_icon_in_buttonPT | icon_materialPT | button_mdl_iconPT | button_mdl_round_iconPT | button_mdl_icon_12_with_ripplePT | button_mdl_icon_12PT | ((ctx: ctx) => any)
type cmp_def_icon_with_action_styleType = {
	type: 'icon_with_action_style',
	params?: [param],
	impl: icon_with_action_styleType,
}
type icon_icon_in_buttonPT = {$: 'icon.icon-in-button', }
type icon_materialPT = {$: 'icon.material', }
type button_mdl_iconPT = {$: 'button.mdl-icon', icon: dataType}
type button_mdl_round_iconPT = {$: 'button.mdl-round-icon', icon: dataType}
type button_mdl_icon_12_with_ripplePT = {$: 'button.mdl-icon-12-with-ripple', icon: dataType}
type button_mdl_icon_12PT = {$: 'button.mdl-icon-12', icon: dataType}

// type image
type imageType = imagePT | ((ctx: ctx) => any)
type cmp_def_imageType = {
	type: 'image',
	params?: [param],
	impl: imageType,
}
type imagePT = {$: 'image', url: dataType, imageWidth: dataType, imageHeight: dataType, width: dataType, height: dataType, units: dataType, style: image_styleType, features: [featureType]}

// type image.style
type image_styleType = image_defaultPT | ((ctx: ctx) => any)
type cmp_def_image_styleType = {
	type: 'image_style',
	params?: [param],
	impl: image_styleType,
}
type image_defaultPT = {$: 'image.default', }

// type inner-html.style
type inner_html_styleType = inner_html_unsafePT | ((ctx: ctx) => any)
type cmp_def_inner_html_styleType = {
	type: 'inner_html_style',
	params?: [param],
	impl: inner_html_styleType,
}
type inner_html_unsafePT = {$: 'inner-html.unsafe', }

// type filter-type
type filter_typeType = filter_type_textPT | filter_type_exact_matchPT | filter_type_numericPT | ((ctx: ctx) => any)
type cmp_def_filter_typeType = {
	type: 'filter_type',
	params?: [param],
	impl: filter_typeType,
}
type filter_type_textPT = {$: 'filter-type.text', ignoreCase: dataType}
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

// type itemlist.style
type itemlist_styleType = itemlist_ul_liPT | itemlist_horizontalPT | ((ctx: ctx) => any)
type cmp_def_itemlist_styleType = {
	type: 'itemlist_style',
	params?: [param],
	impl: itemlist_styleType,
}
type itemlist_ul_liPT = {$: 'itemlist.ul-li', }
type itemlist_horizontalPT = {$: 'itemlist.horizontal', , spacing: dataType}

// type group.style
type group_styleType = itemlog_divPT | card_cardPT | card_media_groupPT | card_actions_groupPT | card_menuPT | group_sectionPT | group_divPT | group_ul_liPT | group_expandablePT | group_accordionPT | group_tabsPT | toolbar_simplePT | layout_verticalPT | layout_horizontalPT | layout_horizontal_fixed_splitPT | layout_horizontal_wrappedPT | layout_flexPT | property_sheet_titles_abovePT | property_sheet_titles_above_float_leftPT | property_sheet_titles_leftPT | tabs_simplePT | ((ctx: ctx) => any)
type cmp_def_group_styleType = {
	type: 'group_style',
	params?: [param],
	impl: group_styleType,
}
type itemlog_divPT = {$: 'itemlog.div', }
type card_cardPT = {$: 'card.card', width: dataType, shadow: dataType}
type card_media_groupPT = {$: 'card.media-group', }
type card_actions_groupPT = {$: 'card.actions-group', }
type card_menuPT = {$: 'card.menu', }
type group_sectionPT = {$: 'group.section', }
type group_divPT = {$: 'group.div', groupClass: dataType, itemClass: dataType}
type group_ul_liPT = {$: 'group.ul-li', }
type group_expandablePT = {$: 'group.expandable', }
type group_accordionPT = {$: 'group.accordion', }
type group_tabsPT = {$: 'group.tabs', width: dataType}
type toolbar_simplePT = {$: 'toolbar.simple', }
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', , spacing: dataType}
type layout_horizontal_fixed_splitPT = {$: 'layout.horizontal-fixed-split', , leftWidth: dataType, rightWidth: dataType, spacing: dataType}
type layout_horizontal_wrappedPT = {$: 'layout.horizontal-wrapped', , spacing: dataType}
type layout_flexPT = {$: 'layout.flex', align: dataType, direction: dataType, wrap: dataType}
type property_sheet_titles_abovePT = {$: 'property-sheet.titles-above', spacing: dataType}
type property_sheet_titles_above_float_leftPT = {$: 'property-sheet.titles-above-float-left', spacing: dataType, fieldWidth: dataType}
type property_sheet_titles_leftPT = {$: 'property-sheet.titles-left', vSpacing: dataType, hSpacing: dataType, titleWidth: dataType}
type tabs_simplePT = {$: 'tabs.simple', }

// type label.style
type label_styleType = label_spanPT | label_pPT | label_h1PT | label_headingPT | label_card_titlePT | label_card_supporting_textPT | label_mdl_ripple_effectPT | label_mdl_buttonPT | ((ctx: ctx) => any)
type cmp_def_label_styleType = {
	type: 'label_style',
	params?: [param],
	impl: label_styleType,
}
type label_spanPT = {$: 'label.span', }
type label_pPT = {$: 'label.p', }
type label_h1PT = {$: 'label.h1', }
type label_headingPT = {$: 'label.heading', level: dataType}
type label_card_titlePT = {$: 'label.card-title', }
type label_card_supporting_textPT = {$: 'label.card-supporting-text', }
type label_mdl_ripple_effectPT = {$: 'label.mdl-ripple-effect', }
type label_mdl_buttonPT = {$: 'label.mdl-button', width: dataType}

// type markdown.style
type markdown_styleType = markdown_showdownPT | ((ctx: ctx) => any)
type cmp_def_markdown_styleType = {
	type: 'markdown_style',
	params?: [param],
	impl: markdown_styleType,
}
type markdown_showdownPT = {$: 'markdown.showdown', }

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

// type menu
type menuType = menu_controlPT | ((ctx: ctx) => any)
type cmp_def_menuType = {
	type: 'menu',
	params?: [param],
	impl: menuType,
}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType, style: menu_styleType, features: [featureType]}

// type menu.style
type menu_styleType = menu_style_pulldownPT | menu_style_context_menuPT | menu_style_apply_multi_levelPT | menu_style_popup_as_optionPT | menu_style_popup_thumbPT | menu_style_toolbarPT | ((ctx: ctx) => any)
type cmp_def_menu_styleType = {
	type: 'menu_style',
	params?: [param],
	impl: menu_styleType,
}
type menu_style_pulldownPT = {$: 'menu-style.pulldown', innerMenuStyle: menu_styleType, leafOptionStyle: menu_option_styleType, layout: group_styleType}
type menu_style_context_menuPT = {$: 'menu-style.context-menu', leafOptionStyle: menu_option_styleType}
type menu_style_apply_multi_levelPT = {$: 'menu-style.apply-multi-level', menuStyle: menu_styleType, leafStyle: menu_styleType, separatorStyle: menu_styleType}
type menu_style_popup_as_optionPT = {$: 'menu-style.popup-as-option', }
type menu_style_popup_thumbPT = {$: 'menu-style.popup-thumb', }
type menu_style_toolbarPT = {$: 'menu-style.toolbar', }

// type menu-option.style
type menu_option_styleType = menu_style_option_linePT | menu_option_as_icon24PT | ((ctx: ctx) => any)
type cmp_def_menu_option_styleType = {
	type: 'menu_option_style',
	params?: [param],
	impl: menu_option_styleType,
}
type menu_style_option_linePT = {$: 'menu-style.option-line', }
type menu_option_as_icon24PT = {$: 'menu.option-as-icon24', }

// type menu-separator.style
type menu_separator_styleType = menu_separator_linePT | ((ctx: ctx) => any)
type cmp_def_menu_separator_styleType = {
	type: 'menu_separator_style',
	params?: [param],
	impl: menu_separator_styleType,
}
type menu_separator_linePT = {$: 'menu-separator.line', }

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
type button_styleType = button_hrefPT | button_xPT | button_mdl_raisedPT | button_mdl_flat_ripplePT | button_mdl_iconPT | button_mdl_round_iconPT | button_mdl_icon_12_with_ripplePT | button_mdl_icon_12PT | button_mdl_card_flatPT | table_button_hrefPT | ((ctx: ctx) => any)
type cmp_def_button_styleType = {
	type: 'button_style',
	params?: [param],
	impl: button_styleType,
}
type button_hrefPT = {$: 'button.href', }
type button_xPT = {$: 'button.x', size: dataType}
type button_mdl_raisedPT = {$: 'button.mdl-raised', }
type button_mdl_flat_ripplePT = {$: 'button.mdl-flat-ripple', }
type button_mdl_iconPT = {$: 'button.mdl-icon', icon: dataType}
type button_mdl_round_iconPT = {$: 'button.mdl-round-icon', icon: dataType}
type button_mdl_icon_12_with_ripplePT = {$: 'button.mdl-icon-12-with-ripple', icon: dataType}
type button_mdl_icon_12PT = {$: 'button.mdl-icon-12', icon: dataType}
type button_mdl_card_flatPT = {$: 'button.mdl-card-flat', }
type table_button_hrefPT = {$: 'table-button.href', }

// type editable-text.style
type editable_text_styleType = editable_text_codemirrorPT | editable_text_inputPT | editable_text_textareaPT | editable_text_mdl_inputPT | editable_text_mdl_input_no_floating_labelPT | editable_text_mdl_searchPT | ((ctx: ctx) => any)
type cmp_def_editable_text_styleType = {
	type: 'editable_text_style',
	params?: [param],
	impl: editable_text_styleType,
}
type editable_text_codemirrorPT = {$: 'editable-text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, debounceTime: dataType, lineWrapping: dataType, lineNumbers: dataType, readOnly: dataType, onCtrlEnter: actionType, hint: dataType}
type editable_text_inputPT = {$: 'editable-text.input', }
type editable_text_textareaPT = {$: 'editable-text.textarea', rows: dataType, cols: dataType}
type editable_text_mdl_inputPT = {$: 'editable-text.mdl-input', width: dataType}
type editable_text_mdl_input_no_floating_labelPT = {$: 'editable-text.mdl-input-no-floating-label', width: dataType}
type editable_text_mdl_searchPT = {$: 'editable-text.mdl-search', }

// type text.style
type text_styleType = text_codemirrorPT | text_multi_linePT | text_paragraphPT | ((ctx: ctx) => any)
type cmp_def_text_styleType = {
	type: 'text_style',
	params?: [param],
	impl: text_styleType,
}
type text_codemirrorPT = {$: 'text.codemirror', cm_settings: dataType, enableFullScreen: booleanType, 
/** resizer id or true (id is used to keep size in session storage) */resizer: booleanType, height: dataType, mode: dataType, lineWrapping: dataType}
type text_multi_linePT = {$: 'text.multi-line', rows: dataType, cols: dataType}
type text_paragraphPT = {$: 'text.paragraph', }

// type editable-boolean.style
type editable_boolean_styleType = editable_boolean_checkboxPT | editable_boolean_checkbox_with_titlePT | editable_boolean_expand_collapsePT | editable_boolean_mdl_slide_togglePT | ((ctx: ctx) => any)
type cmp_def_editable_boolean_styleType = {
	type: 'editable_boolean_style',
	params?: [param],
	impl: editable_boolean_styleType,
}
type editable_boolean_checkboxPT = {$: 'editable-boolean.checkbox', }
type editable_boolean_checkbox_with_titlePT = {$: 'editable-boolean.checkbox-with-title', }
type editable_boolean_expand_collapsePT = {$: 'editable-boolean.expand-collapse', }
type editable_boolean_mdl_slide_togglePT = {$: 'editable-boolean.mdl-slide-toggle', }

// type first-succeeding.style
type first_succeeding_styleType = first_succeeding_stylePT | ((ctx: ctx) => any)
type cmp_def_first_succeeding_styleType = {
	type: 'first_succeeding_style',
	params?: [param],
	impl: first_succeeding_styleType,
}
type first_succeeding_stylePT = {$: 'first-succeeding.style', }

// type picklist.style
type picklist_styleType = picklist_nativePT | picklist_native_md_lookPT | picklist_mdlPT | picklist_selection_listPT | picklist_groupsPT | ((ctx: ctx) => any)
type cmp_def_picklist_styleType = {
	type: 'picklist_style',
	params?: [param],
	impl: picklist_styleType,
}
type picklist_nativePT = {$: 'picklist.native', }
type picklist_native_md_lookPT = {$: 'picklist.native-md-look', }
type picklist_mdlPT = {$: 'picklist.mdl', noLabel: booleanType}
type picklist_selection_listPT = {$: 'picklist.selection-list', width: dataType}
type picklist_groupsPT = {$: 'picklist.groups', }

// type table.style
type table_styleType = table_with_headersPT | table_mdlPT | ((ctx: ctx) => any)
type cmp_def_table_styleType = {
	type: 'table_style',
	params?: [param],
	impl: table_styleType,
}
type table_with_headersPT = {$: 'table.with-headers', }
type table_mdlPT = {$: 'table.mdl', classForTable: dataType, classForTd: dataType}

// type table
type tableType = tablePT | ((ctx: ctx) => any)
type cmp_def_tableType = {
	type: 'table',
	params?: [param],
	impl: tableType,
}
type tablePT = {$: 'table', title: dataType, items: dataType, fields: [table_fieldType], style: table_styleType, watchItems: dataType, 
/** by default table is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType]}

// type table-field
type table_fieldType = fieldPT | field_indexPT | field_controlPT | field_buttonPT | ((ctx: ctx) => any)
type cmp_def_table_fieldType = {
	type: 'table_field',
	params?: [param],
	impl: table_fieldType,
}
type fieldPT = {$: 'field', title: dataType, data: dataType, width: dataType, numeric: booleanType, 
/** extend the items with the calculated field using the title as field name */extendItems: booleanType, class: dataType}
type field_indexPT = {$: 'field.index', title: dataType, width: dataType, class: dataType}
type field_controlPT = {$: 'field.control', title: dataType, control: controlType, width: dataType, dataForSort: dataType, numeric: booleanType}
type field_buttonPT = {$: 'field.button', title: dataType, buttonText: dataType, action: actionType, width: dataType, dataForSort: dataType, numeric: booleanType, style: table_button_styleType, features: [featureType]}

// type rich-text.style
type rich_text_styleType = rich_text_htmlPT | rich_text_html_in_sectionPT | ((ctx: ctx) => any)
type cmp_def_rich_text_styleType = {
	type: 'rich_text_style',
	params?: [param],
	impl: rich_text_styleType,
}
type rich_text_htmlPT = {$: 'rich-text.html', }
type rich_text_html_in_sectionPT = {$: 'rich-text.html-in-section', }

// type theme
type themeType = theme_material_designPT | ((ctx: ctx) => any)
type cmp_def_themeType = {
	type: 'theme',
	params?: [param],
	impl: themeType,
}
type theme_material_designPT = {$: 'theme.material-design', }

// type tree.nodeModel
type tree_nodeModelType = tree_json_read_onlyPT | tree_jsonPT | ((ctx: ctx) => any)
type cmp_def_tree_nodeModelType = {
	type: 'tree_nodeModel',
	params?: [param],
	impl: tree_nodeModelType,
}
type tree_json_read_onlyPT = {$: 'tree.json-read-only', object: dataType, rootPath: dataType}
type tree_jsonPT = {$: 'tree.json', object: dataType, rootPath: dataType}

// type tree.style
type tree_styleType = tree_ul_liPT | tree_no_headPT | ((ctx: ctx) => any)
type cmp_def_tree_styleType = {
	type: 'tree_style',
	params?: [param],
	impl: tree_styleType,
}
type tree_ul_liPT = {$: 'tree.ul-li', }
type tree_no_headPT = {$: 'tree.no-head', }
type cmpDef = cmp_def_dataType | cmp_def_aggregatorType | cmp_def_booleanType | cmp_def_actionType | cmp_def_propType | cmp_def_data_switch_caseType | cmp_def_action_switch_caseType | cmp_def_jison_parserType | cmp_def_lexer_ruleType | cmp_def_bnf_expressionType | cmp_def_expression_optionType | cmp_def_testType | cmp_def_ui_actionType | cmp_def_controlType | cmp_def_clickableType | cmp_def_featureType | cmp_def_dialog_featureType | cmp_def_d3_scatter_styleType | cmp_def_d3_frameType | cmp_def_d3_histogram_styleType | cmp_def_d3_featureType | cmp_def_d3_axesType | cmp_def_d3_pivotType | cmp_def_d3_scaleType | cmp_def_d3_rangeType | cmp_def_d3_domainType | cmp_def_dialog_styleType | cmp_def_divider_styleType | cmp_def_editable_number_styleType | cmp_def_icon_with_action_styleType | cmp_def_imageType | cmp_def_image_styleType | cmp_def_inner_html_styleType | cmp_def_filter_typeType | cmp_def_itemlist_group_byType | cmp_def_itemlist_styleType | cmp_def_group_styleType | cmp_def_label_styleType | cmp_def_markdown_styleType | cmp_def_menu_optionType | cmp_def_menuType | cmp_def_menu_styleType | cmp_def_menu_option_styleType | cmp_def_menu_separator_styleType | cmp_def_picklist_optionsType | cmp_def_picklist_promoteType | cmp_def_button_styleType | cmp_def_editable_text_styleType | cmp_def_text_styleType | cmp_def_editable_boolean_styleType | cmp_def_first_succeeding_styleType | cmp_def_picklist_styleType | cmp_def_table_styleType | cmp_def_tableType | cmp_def_table_fieldType | cmp_def_rich_text_styleType | cmp_def_themeType | cmp_def_tree_nodeModelType | cmp_def_tree_styleType
type macros = {
	call(param: dataType) : *Type,
	pipeline(items: dataType | [aggregatorType]) : dataType,
	pipe(items: dataType | [aggregatorType]) : dataType,
	jbRun(
/** profile name */profile: dataType, params: dataType) : actionType,
	list(items: [dataType]) : dataType,
	firstSucceeding(items: [dataType]) : dataType,
	propertyNames(obj: dataType) : dataType,
	properties(obj: dataType) : dataType,
	prefix(separator: dataType, text: dataType) : dataType,
	suffix(separator: dataType, text: dataType) : dataType,
	removePrefix(separator: dataType, text: dataType) : dataType,
	removeSuffix(separator: dataType, text: dataType) : dataType,
	removeSuffixRegex(suffix: dataType, text: dataType) : dataType,
	writeValue(to: dataType, value: dataType) : actionType,
	removeFromArray({ array: dataType, 
/** choose item or index */itemToRemove: dataType, 
/** choose item or index */index: dataType }) : actionType,
	toggleBooleanValue(of: dataType) : actionType,
	slice(
/** 0-based index */start: dataType, 
/** 0-based index of where to end the selection (not including itself) */end: dataType) : aggregatorType,
	sort({ 
/** sort by property inside object */propertyName: dataType, lexical: booleanType, ascending: booleanType }) : aggregatorType,
	first() : aggregatorType,
	last() : aggregatorType,
	count(items: dataType) : aggregatorType,
	reverse(items: dataType) : aggregatorType,
	sample(size: dataType, items: dataType) : aggregatorType,
	assign(property: [propType]) : dataType,
	obj(property: [propType]) : dataType,
	assignWithIndex(property: [propType]) : aggregatorType,
	prop(title: dataType, val: dataType, type: dataType) : propType,
	$if(condition: booleanType, then: dataType, $else: dataType) : dataType,
	not(of: booleanType) : booleanType,
	and(items: [booleanType]) : booleanType,
	or(items: [booleanType]) : booleanType,
	between({ from: dataType, to: dataType, val: dataType }) : booleanType,
	contains({ text: [dataType], allText: dataType, inOrder: dataType }) : booleanType,
	notContains(text: [dataType], allText: dataType) : booleanType,
	startsWith(startsWith: dataType, text: dataType) : booleanType,
	endsWith(endsWith: dataType, text: dataType) : booleanType,
	filter(filter: booleanType) : aggregatorType,
	matchRegex({ text: dataType, 
/** e.g: [a-zA-Z]* */regex: dataType, 
/** regex must match all text */fillText: dataType }) : booleanType,
	toString(text: dataType) : dataType,
	toUppercase(text: dataType) : dataType,
	toLowercase(text: dataType) : dataType,
	capitalize(text: dataType) : dataType,
	join({ separator: dataType, prefix: dataType, suffix: dataType, items: dataType, itemName: dataType, itemText: dataType }) : aggregatorType,
	unique(id: dataType, items: dataType) : aggregatorType,
	log(obj: dataType) : dataType,
	asIs($asIs: dataType) : dataType,
	object() : dataType,
	split({ separator: dataType, text: dataType, part: dataType }) : dataType,
	replace({ find: dataType, replace: dataType, text: dataType, useRegex: booleanType, 
/** g,i,m */regexFlags: dataType }) : dataType,
	touch(data: dataType) : actionType,
	isNull(obj: dataType) : booleanType,
	isEmpty(item: dataType) : booleanType,
	notEmpty(item: dataType) : booleanType,
	equals(item1: dataType, item2: dataType) : booleanType,
	notEquals(item1: dataType, item2: dataType) : booleanType,
	parent(item: dataType) : dataType,
	runActions(actions: [actionType]) : actionType,
	extractPrefix({ 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType }) : dataType,
	extractSuffix({ 
/** /w- alphnumberic, /s- whitespace, ^- beginline, $-endline */separator: dataType, text: dataType, 
/** separator is regex */regex: booleanType, keepSeparator: booleanType }) : dataType,
	range(from: dataType, to: dataType) : dataType,
	typeOf(obj: dataType) : dataType,
	className(obj: dataType) : dataType,
	isOfType(
/** string,boolean */type: dataType, obj: dataType) : booleanType,
	inGroup(group: dataType, item: dataType) : booleanType,
	isRef(obj: dataType) : dataType,
	asRef(obj: dataType) : dataType,
	newline() : dataType,
	lexerRule(
/** [a-f0-9]+ */regex: dataType, 
/** return 'Hex'; */result: dataType) : lexer_ruleType,
	bnfExpression(id: dataType, options: [expression_optionType]) : bnf_expressionType,
	expressionOption(
/** e + e */syntax: dataType, 
/** $$ = $1 + $2; */calculate: dataType) : expression_optionType,
	extractText({ text: dataType, startMarkers: dataType, endMarker: dataType, 
/** include the marker at part of the result */includingStartMarker: booleanType, 
/** include the marker at part of the result */includingEndMarker: booleanType, 
/** apply the markers repeatingly */repeating: booleanType, noTrim: booleanType, 
/** use regular expression in markers */useRegex: booleanType, 
/** return the inverse result. E.g. exclude remarks */exclude: booleanType }) : dataType,
	breakText({ text: dataType, 
/** multi level separators */separators: dataType, 
/** use regular expression in separators */useRegex: booleanType }) : dataType,
	zipArrays(
/** array of arrays */value: dataType) : dataType,
	removeSections({ text: dataType, startMarker: dataType, endMarker: dataType, keepEndMarker: booleanType }) : dataType,
	merge(objects: dataType) : dataType,
	dynamicObject({ items: dataType, propertyName: dataType, value: dataType }) : dataType,
	filterEmptyProperties(obj: dataType) : dataType,
	trim(text: dataType) : dataType,
	removePrefixRegex(prefix: dataType, text: dataType) : dataType,
	wrapAsObjectWithArray(arrayProperty: dataType, items: dataType) : aggregatorType,
	wrapAsObject(itemToPropName: dataType, items: dataType) : aggregatorType,
	prettyPrint(profile: dataType, colWidth: dataType) : dataType,
	dataTest({ calculate: dataType, runBefore: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType }) : testType,
	uiTest({ control: controlType, runBefore: actionType, action: actionType, expectedResult: booleanType, cleanUp: actionType, expectedCounters: dataType }) : testType,
	button({ title: dataType, action: actionType, style: button_styleType, features: [featureType] }) : controlType | clickableType,
	ctrlAction(action: actionType) : featureType,
	altAction(action: actionType) : featureType,
	buttonDisabled(enabledCondition: booleanType) : featureType,
	iconWithAction({ icon: dataType, title: dataType, action: actionType, style: icon_with_action_styleType, features: [featureType] }) : controlType | clickableType,
	card({ title: dataType, subTitle: dataType, text: dataType, image: dataType, topButton: clickableType, menu: menuType, style: card_styleType, features: [featureType] }) : controlType,
	watchRef({ 
/** reference to data */ref: dataType, 
/** watch childern change as well */includeChildren: dataType, 
/** delay in activation, can be used to set priority */delay: dataType }) : featureType,
	watchObservable(toWatch: dataType) : featureType,
	id(id: dataType) : featureType,
	var({ name: dataType, value: dataType, 
/** E.g., selected item variable */mutable: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType }) : featureType,
	bindRefs({ watchRef: dataType, 
/** watch childern change as well */includeChildren: dataType, updateRef: dataType, value: dataType }) : featureType,
	calculatedVar({ name: dataType, value: dataType, 
/** If specified, the var will be defined as global with this id */globalId: dataType, 
/** variable to watch. needs to be in array */watchRefs: dataType }) : featureType,
	features(features: [featureType]) : featureType,
	hidden(showCondition: booleanType) : featureType,
	conditionalClass(cssClass: dataType, condition: booleanType) : featureType,
	css(css: dataType) : featureType | dialog_featureType,
	openDialog({ id: dataType, style: dialog_styleType, content: controlType, menu: controlType, title: dataType, onOK: actionType, modal: booleanType, features: [dialog_featureType] }) : actionType,
	divider({ style: divider_styleType, title: dataType, features: [featureType] }) : controlType,
	editableBoolean({ databind: dataType, style: editable_boolean_styleType, title: dataType, textForTrue: dataType, textForFalse: dataType, features: [featureType] }) : controlType,
	editableNumber({ databind: dataType, title: dataType, style: editable_number_styleType, 
/** leave empty to parse symbol from value */symbol: dataType, min: dataType, max: dataType, displayString: dataType, dataString: dataType, 
/** adjust its scale if at edges */autoScale: dataType, 
/** used by slider */step: dataType, 
/** used by slider */initialPixelsPerUnit: dataType, features: [featureType] }) : controlType,
	editableText({ title: dataType, databind: dataType, updateOnBlur: booleanType, style: editable_text_styleType, features: [featureType] }) : controlType,
	validation(validCondition: booleanType, errorMessage: dataType) : featureType,
	group({ title: dataType, style: group_styleType, controls: [controlType], features: [featureType] }) : controlType,
	inlineControls(controls: [controlType]) : controlType,
	dynamicControls({ controlItems: dataType, genericControl: controlType, itemVariable: dataType }) : controlType,
	controlWithCondition({ condition: booleanType, control: controlType, title: dataType }) : controlType,
	materialIcon({ icon: dataType, title: dataType, style: icon_styleType, features: [featureType] }) : controlType,
	image({ url: dataType, imageWidth: dataType, imageHeight: dataType, width: dataType, height: dataType, units: dataType, style: image_styleType, features: [featureType] }) : controlType | imageType,
	innerHtml({ title: dataType, html: dataType, style: inner_html_styleType, features: [featureType] }) : controlType,
	itemlistWithGroups({ title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, groupBy: itemlist_group_byType, headingCtrl: controlType, 
/** resources to watch */watch: dataType, itemVariable: dataType, features: [featureType] }) : controlType,
	itemlistDefaultHeading() : controlType,
	itemlist({ title: dataType, items: dataType, controls: [controlType], style: itemlist_styleType, watchItems: dataType, itemVariable: dataType, features: [featureType] }) : controlType,
	itemlog({ title: dataType, items: dataType, controls: [controlType], style: itemlog_styleType, itemVariable: dataType, counter: dataType, features: [featureType] }) : controlType,
	label({ title: dataType, style: label_styleType, features: [featureType] }) : controlType,
	highlight({ base: dataType, highlight: dataType, cssClass: dataType }) : dataType,
	markdown({ markdown: dataType, style: markdown_styleType, title: dataType, features: [featureType] }) : controlType,
	picklist({ title: dataType, databind: dataType, options: picklist_optionsType, promote: picklist_promoteType, style: picklist_styleType, features: [featureType] }) : controlType,
	customStyle({ template: dataType, css: dataType, features: [featureType] }) : dataType,
	styleByControl(control: controlType, modelVar: dataType) : dataType,
	sidenav({ controls: [controlType], title: dataType, style: sidenav_styleType, features: [featureType] }) : controlType,
	table({ title: dataType, items: dataType, fields: [table_fieldType], style: table_styleType, watchItems: dataType, 
/** by default table is limmited to 100 shown items */visualSizeLimit: dataType, features: [featureType] }) : controlType | tableType,
	field({ title: dataType, data: dataType, width: dataType, numeric: booleanType, 
/** extend the items with the calculated field using the title as field name */extendItems: booleanType, class: dataType }) : table_fieldType,
	tabs({ tabs: [controlType], style: tabs_styleType, features: [featureType] }) : controlType,
	text({ text: dataType, style: text_styleType, title: dataType, features: [featureType] }) : controlType,
	richText({ text: dataType, title: dataType, style: rich_text_styleType, features: [featureType] }) : controlType,
	tree({ nodeModel: tree_nodeModelType, style: tree_styleType, features: [featureType] }) : controlType,
	gotoUrl(url: dataType, target: enumType) : actionType,
	resetWspy(param: dataType) : actionType,
}
// const {call,pipeline,pipe,jbRun,list,firstSucceeding,propertyNames,properties,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,writeValue,removeFromArray,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,assign,obj,assignWithIndex,prop,$if,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toString,toUppercase,toLowercase,capitalize,join,unique,log,asIs,object,split,replace,touch,isNull,isEmpty,notEmpty,equals,notEquals,parent,runActions,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,isRef,asRef,newline,lexerRule,bnfExpression,expressionOption,extractText,breakText,zipArrays,removeSections,merge,dynamicObject,filterEmptyProperties,trim,removePrefixRegex,wrapAsObjectWithArray,wrapAsObject,prettyPrint,dataTest,uiTest,button,ctrlAction,altAction,buttonDisabled,iconWithAction,card,watchRef,watchObservable,id,var,bindRefs,calculatedVar,features,hidden,conditionalClass,css,openDialog,divider,editableBoolean,editableNumber,editableText,validation,group,inlineControls,dynamicControls,controlWithCondition,materialIcon,image,innerHtml,itemlistWithGroups,itemlistDefaultHeading,itemlist,itemlog,label,highlight,markdown,picklist,customStyle,styleByControl,sidenav,table,field,tabs,text,richText,tree,gotoUrl,resetWspy} = jb.macros