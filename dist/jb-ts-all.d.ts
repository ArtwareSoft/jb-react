
// type data
type dataType = pipelinePT | pipePT | data_ifPT | listPT | firstSucceedingPT | property_namesPT | propertiesPT | prefixPT | suffixPT | remove_prefixPT | remove_suffixPT | remove_suffix_regexPT | to_stringPT | to_uppercasePT | to_lowercasePT | capitalizePT | logPT | asIsPT | objectPT | json_stringifyPT | json_parsePT | splitPT | replacePT | parentPT | extract_prefixPT | extract_suffixPT | rangePT | type_ofPT | class_namePT | http_getPT | isRefPT | asRefPT | data_switchPT | newlinePT | custom_stylePT | style_by_controlPT | highlightPT | field_dataPT | itemlist_container_search_in_all_propertiesPT | ((ctx: ctx) => any)
type cmp_def_dataType = {
	type: 'data',
	params?: [param],
	impl: dataType,
}
type pipelinePT = {$: 'pipeline', items: dataType | aggregatorType}
type pipePT = {$: 'pipe', items: dataType | aggregatorType}
type data_ifPT = {$: 'data.if', condition: booleanType,then: dataType,else: dataType}
type listPT = {$: 'list', items: dataType}
type firstSucceedingPT = {$: 'firstSucceeding', items: dataType}
type property_namesPT = {$: 'property-names', obj: dataType}
type propertiesPT = {$: 'properties', obj: dataType}
type prefixPT = {$: 'prefix', separator: dataType,text: dataType}
type suffixPT = {$: 'suffix', separator: dataType,text: dataType}
type remove_prefixPT = {$: 'remove-prefix', separator: dataType,text: dataType}
type remove_suffixPT = {$: 'remove-suffix', separator: dataType,text: dataType}
type remove_suffix_regexPT = {$: 'remove-suffix-regex', suffix: dataType,text: dataType}
type to_stringPT = {$: 'to-string', text: dataType}
type to_uppercasePT = {$: 'to-uppercase', text: dataType}
type to_lowercasePT = {$: 'to-lowercase', text: dataType}
type capitalizePT = {$: 'capitalize', text: dataType}
type logPT = {$: 'log', obj: dataType}
type asIsPT = {$: 'asIs', $asIs: dataType}
type objectPT = {$: 'object', }
type json_stringifyPT = {$: 'json.stringify', value: dataType,space: dataType}
type json_parsePT = {$: 'json.parse', text: dataType}
type splitPT = {$: 'split', separator: dataType,text: dataType,part: dataType}
type replacePT = {$: 'replace', find: dataType,replace: dataType,text: dataType,useRegex: booleanType,regexFlags: dataType}
type parentPT = {$: 'parent', item: dataType}
type extract_prefixPT = {$: 'extract-prefix', separator: dataType,text: dataType,regex: booleanType,keepSeparator: booleanType}
type extract_suffixPT = {$: 'extract-suffix', separator: dataType,text: dataType,regex: booleanType,keepSeparator: booleanType}
type rangePT = {$: 'range', from: dataType,to: dataType}
type type_ofPT = {$: 'type-of', obj: dataType}
type class_namePT = {$: 'class-name', obj: dataType}
type http_getPT = {$: 'http.get', url: dataType,json: dataType}
type isRefPT = {$: 'isRef', obj: dataType}
type asRefPT = {$: 'asRef', obj: dataType}
type data_switchPT = {$: 'data.switch', cases: data_switch_caseType,default: dataType}
type newlinePT = {$: 'newline', }
type custom_stylePT = {$: 'custom-style', template: dataType,css: dataType,features: featureType}
type style_by_controlPT = {$: 'style-by-control', control: controlType,modelVar: dataType}
type highlightPT = {$: 'highlight', base: dataType,highlight: dataType,cssClass: dataType}
type field_dataPT = {$: 'field.data', }
type itemlist_container_search_in_all_propertiesPT = {$: 'itemlist-container.search-in-all-properties', }

// type aggregator
type aggregatorType = slicePT | sortPT | firstPT | lastPT | countPT | reversePT | samplePT | calculate_propertiesPT | filterPT | joinPT | uniquePT | itemlist_container_filterPT | ((ctx: ctx) => any)
type cmp_def_aggregatorType = {
	type: 'aggregator',
	params?: [param],
	impl: aggregatorType,
}
type slicePT = {$: 'slice', start: dataType,end: dataType}
type sortPT = {$: 'sort', propertyName: dataType,lexical: booleanType,ascending: booleanType}
type firstPT = {$: 'first', }
type lastPT = {$: 'last', }
type countPT = {$: 'count', items: dataType}
type reversePT = {$: 'reverse', items: dataType}
type samplePT = {$: 'sample', size: dataType,items: dataType}
type calculate_propertiesPT = {$: 'calculate-properties', property: calculated_propertyType,items: dataType}
type filterPT = {$: 'filter', filter: booleanType}
type joinPT = {$: 'join', separator: dataType,prefix: dataType,suffix: dataType,items: dataType,itemName: dataType,itemText: dataType}
type uniquePT = {$: 'unique', id: dataType,items: dataType}
type itemlist_container_filterPT = {$: 'itemlist-container.filter', }

// type boolean
type booleanType = notPT | andPT | orPT | betweenPT | containsPT | not_containsPT | starts_withPT | ends_withPT | match_regexPT | isNullPT | isEmptyPT | notEmptyPT | equalsPT | not_equalsPT | is_of_typePT | in_groupPT | ((ctx: ctx) => any)
type cmp_def_booleanType = {
	type: 'boolean',
	params?: [param],
	impl: booleanType,
}
type notPT = {$: 'not', of: booleanType}
type andPT = {$: 'and', items: booleanType}
type orPT = {$: 'or', items: booleanType}
type betweenPT = {$: 'between', from: dataType,to: dataType,val: dataType}
type containsPT = {$: 'contains', text: dataType,allText: dataType,inOrder: dataType}
type not_containsPT = {$: 'not-contains', text: dataType,allText: dataType}
type starts_withPT = {$: 'starts-with', startsWith: dataType,text: dataType}
type ends_withPT = {$: 'ends-with', endsWith: dataType,text: dataType}
type match_regexPT = {$: 'match-regex', text: dataType,regex: dataType,fillText: dataType}
type isNullPT = {$: 'isNull', obj: dataType}
type isEmptyPT = {$: 'isEmpty', item: dataType}
type notEmptyPT = {$: 'notEmpty', item: dataType}
type equalsPT = {$: 'equals', item1: dataType,item2: dataType}
type not_equalsPT = {$: 'not-equals', item1: dataType,item2: dataType}
type is_of_typePT = {$: 'is-of-type', type: dataType,obj: dataType}
type in_groupPT = {$: 'in-group', group: dataType,item: dataType}

// type action
type actionType = action_ifPT | jb_runPT | write_valuePT | remove_from_arrayPT | toggle_boolean_valuePT | touchPT | runActionsPT | on_next_timerPT | http_postPT | action_switchPT | open_dialogPT | dialog_close_containing_popupPT | dialog_close_dialogPT | dialog_close_all_popupsPT | dialog_close_allPT | menu_open_context_menuPT | itemlist_container_addPT | itemlist_container_deletePT | goto_urlPT | tree_regain_focusPT | tree_redrawPT | ((ctx: ctx) => any)
type cmp_def_actionType = {
	type: 'action',
	params?: [param],
	impl: actionType,
}
type action_ifPT = {$: 'action.if', condition: booleanType,then: actionType,else: actionType}
type jb_runPT = {$: 'jb-run', profile: dataType,params: dataType}
type write_valuePT = {$: 'write-value', to: dataType,value: dataType}
type remove_from_arrayPT = {$: 'remove-from-array', array: dataType,itemToRemove: dataType,index: dataType}
type toggle_boolean_valuePT = {$: 'toggle-boolean-value', of: dataType}
type touchPT = {$: 'touch', data: dataType}
type runActionsPT = {$: 'runActions', actions: actionType}
type on_next_timerPT = {$: 'on-next-timer', action: actionType,delay: dataType}
type http_postPT = {$: 'http.post', url: dataType,postData: dataType,jsonResult: dataType}
type action_switchPT = {$: 'action.switch', cases: action_switch_caseType,defaultAction: actionType}
type open_dialogPT = {$: 'open-dialog', id: dataType,style: dialog_styleType,content: controlType,menu: controlType,title: dataType,onOK: actionType,modal: booleanType,features: dialog_featureType}
type dialog_close_containing_popupPT = {$: 'dialog.close-containing-popup', OK: booleanType}
type dialog_close_dialogPT = {$: 'dialog.close-dialog', id: dataType,delay: dataType}
type dialog_close_all_popupsPT = {$: 'dialog.close-all-popups', }
type dialog_close_allPT = {$: 'dialog.close-all', }
type menu_open_context_menuPT = {$: 'menu.open-context-menu', menu: menu_optionType,popupStyle: dialog_styleType,features: dialog_featureType}
type itemlist_container_addPT = {$: 'itemlist-container.add', }
type itemlist_container_deletePT = {$: 'itemlist-container.delete', item: dataType}
type goto_urlPT = {$: 'goto-url', url: dataType,target: dataType}
type tree_regain_focusPT = {$: 'tree.regain-focus', }
type tree_redrawPT = {$: 'tree.redraw', strong: booleanType}

// type calculated-property
type calculated_propertyType = calculated_propertyPT | ((ctx: ctx) => any)
type cmp_def_calculated_propertyType = {
	type: 'calculated_property',
	params?: [param],
	impl: calculated_propertyType,
}
type calculated_propertyPT = {$: 'calculated-property', title: dataType,val: dataType,type: dataType}

// type data.switch-case
type data_switch_caseType = data_switch_casePT | ((ctx: ctx) => any)
type cmp_def_data_switch_caseType = {
	type: 'data_switch_case',
	params?: [param],
	impl: data_switch_caseType,
}
type data_switch_casePT = {$: 'data.switch-case', condition: booleanType,value: dataType}

// type action.switch-case
type action_switch_caseType = action_switch_casePT | ((ctx: ctx) => any)
type cmp_def_action_switch_caseType = {
	type: 'action_switch_case',
	params?: [param],
	impl: action_switch_caseType,
}
type action_switch_casePT = {$: 'action.switch-case', condition: booleanType,action: actionType}

// type control
type controlType = groupPT | dynamic_controlsPT | control_first_succeedingPT | control_with_conditionPT | labelPT | imagePT | buttonPT | icon_with_actionPT | editable_textPT | editable_booleanPT | editable_numberPT | menu_controlPT | itemlistPT | itemlist_container_searchPT | itemlist_container_more_items_buttonPT | picklistPT | material_iconPT | tablePT | tabsPT | treePT | ((ctx: ctx) => any)
type cmp_def_controlType = {
	type: 'control',
	params?: [param],
	impl: controlType,
}
type groupPT = {$: 'group', title: dataType,style: group_styleType,controls: controlType,features: featureType}
type dynamic_controlsPT = {$: 'dynamic-controls', controlItems: dataType,genericControl: controlType,itemVariable: dataType}
type control_first_succeedingPT = {$: 'control.first-succeeding', title: dataType,style: first_succeeding_styleType,controls: controlType,features: featureType}
type control_with_conditionPT = {$: 'control-with-condition', condition: booleanType,control: controlType,title: dataType}
type labelPT = {$: 'label', title: dataType,style: label_styleType,features: featureType}
type imagePT = {$: 'image', url: dataType,imageWidth: dataType,imageHeight: dataType,width: dataType,height: dataType,units: dataType,style: image_styleType,features: featureType}
type buttonPT = {$: 'button', title: dataType,action: actionType,style: button_styleType,features: featureType}
type icon_with_actionPT = {$: 'icon-with-action', icon: dataType,title: dataType,action: actionType,style: icon_with_action_styleType,features: featureType}
type editable_textPT = {$: 'editable-text', title: dataType,databind: dataType,updateOnBlur: booleanType,style: editable_text_styleType,features: featureType}
type editable_booleanPT = {$: 'editable-boolean', databind: dataType,style: editable_boolean_styleType,title: dataType,textForTrue: dataType,textForFalse: dataType,features: featureType}
type editable_numberPT = {$: 'editable-number', databind: dataType,title: dataType,style: editable_number_styleType,symbol: dataType,min: dataType,max: dataType,displayString: dataType,dataString: dataType,autoScale: dataType,step: dataType,initialPixelsPerUnit: dataType,features: featureType}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType,style: menu_styleType,features: featureType}
type itemlistPT = {$: 'itemlist', title: dataType,items: dataType,controls: controlType,style: itemlist_styleType,watchItems: dataType,itemVariable: dataType,features: featureType}
type itemlist_container_searchPT = {$: 'itemlist-container.search', title: dataType,searchIn: dataType,databind: dataType,style: editable_text_styleType,features: featureType}
type itemlist_container_more_items_buttonPT = {$: 'itemlist-container.more-items-button', title: dataType,delta: dataType,style: button_styleType,features: featureType}
type picklistPT = {$: 'picklist', title: dataType,databind: dataType,options: picklist_optionsType,promote: picklist_promoteType,style: picklist_styleType,features: featureType}
type material_iconPT = {$: 'material-icon', icon: dataType,title: dataType,style: icon_styleType,features: featureType}
type tablePT = {$: 'table', title: dataType,items: dataType,fields: table_fieldType,style: table_styleType,watchItems: dataType,visualSizeLimit: dataType,features: featureType}
type tabsPT = {$: 'tabs', tabs: controlType,style: tabs_styleType,features: featureType}
type treePT = {$: 'tree', nodeModel: tree_nodeModelType,style: tree_styleType,features: featureType}

// type feature
type featureType = group_init_groupPT | group_dynamic_titlesPT | label_bind_titlePT | ctrl_actionPT | alt_actionPT | button_disabledPT | field_databindPT | field_databind_textPT | field_databind_rangePT | field_defaultPT | field_subscribePT | field_toolbarPT | validationPT | editable_text_x_buttonPT | editable_text_helper_popupPT | editable_boolean_keyboard_supportPT | group_waitPT | watch_refPT | watch_observablePT | group_dataPT | idPT | varPT | global_varPT | bind_refsPT | calculated_varPT | featuresPT | feature_initPT | feature_after_loadPT | feature_ifPT | hiddenPT | conditional_classPT | feature_hover_titlePT | feature_keyboard_shortcutPT | feature_onHoverPT | feature_onKeyPT | feature_onEnterPT | feature_onEscPT | feature_onDeletePT | group_auto_focus_on_first_inputPT | cssPT | css_classPT | css_widthPT | css_heightPT | css_opacityPT | css_paddingPT | css_marginPT | css_transform_rotatePT | css_colorPT | css_transform_scalePT | css_box_shadowPT | css_borderPT | menu_init_popup_menuPT | menu_init_menu_optionPT | menu_selectionPT | itemlist_no_containerPT | itemlist_initPT | itemlist_selectionPT | itemlist_keyboard_selectionPT | itemlist_drag_and_dropPT | itemlist_drag_handlePT | itemlist_shown_only_on_item_hoverPT | itemlist_dividerPT | group_itemlist_containerPT | itemlist_itemlist_selectedPT | itemlist_container_filter_fieldPT | picklist_dynamic_optionsPT | picklist_onChangePT | group_themePT | slider_initPT | slider_text_handleArrowKeysPT | slider_edit_as_text_popupPT | table_initPT | table_init_sortPT | group_init_tabsPT | mdl_style_init_dynamicPT | mdl_ripple_effectPT | flex_layout_container_align_main_axisPT | flex_item_growPT | flex_item_basisPT | flex_item_align_selfPT | responsive_only_for_phonePT | responsive_not_for_phonePT | group_init_expandablePT | group_init_accordionPT | tree_selectionPT | tree_keyboard_selectionPT | tree_drag_and_dropPT | ((ctx: ctx) => any)
type cmp_def_featureType = {
	type: 'feature',
	params?: [param],
	impl: featureType,
}
type group_init_groupPT = {$: 'group.init-group', }
type group_dynamic_titlesPT = {$: 'group.dynamic-titles', }
type label_bind_titlePT = {$: 'label.bind-title', }
type ctrl_actionPT = {$: 'ctrl-action', action: actionType}
type alt_actionPT = {$: 'alt-action', action: actionType}
type button_disabledPT = {$: 'button-disabled', enabledCondition: booleanType}
type field_databindPT = {$: 'field.databind', }
type field_databind_textPT = {$: 'field.databind-text', debounceTime: dataType,oneWay: booleanType}
type field_databind_rangePT = {$: 'field.databind-range', }
type field_defaultPT = {$: 'field.default', value: dataType}
type field_subscribePT = {$: 'field.subscribe', action: actionType,includeFirst: booleanType}
type field_toolbarPT = {$: 'field.toolbar', toolbar: controlType}
type validationPT = {$: 'validation', validCondition: booleanType,errorMessage: dataType}
type editable_text_x_buttonPT = {$: 'editable-text.x-button', }
type editable_text_helper_popupPT = {$: 'editable-text.helper-popup', control: controlType,popupId: dataType,popupStyle: dialog_styleType,showHelper: dataType,onEnter: actionType,onEsc: actionType}
type editable_boolean_keyboard_supportPT = {$: 'editable-boolean.keyboard-support', }
type group_waitPT = {$: 'group.wait', for: dataType,loadingControl: controlType,error: controlType,varName: dataType}
type watch_refPT = {$: 'watch-ref', ref: dataType,includeChildren: dataType}
type watch_observablePT = {$: 'watch-observable', toWatch: dataType}
type group_dataPT = {$: 'group.data', data: dataType,itemVariable: dataType,watch: dataType,includeChildren: dataType}
type idPT = {$: 'id', id: dataType}
type varPT = {$: 'var', name: dataType,value: dataType,mutable: dataType}
type global_varPT = {$: 'global-var', name: dataType,value: dataType}
type bind_refsPT = {$: 'bind-refs', watchRef: dataType,includeChildren: dataType,updateRef: dataType,value: dataType}
type calculated_varPT = {$: 'calculated-var', name: dataType,value: dataType,watchRefs: dataType}
type featuresPT = {$: 'features', features: featureType}
type feature_initPT = {$: 'feature.init', action: actionType}
type feature_after_loadPT = {$: 'feature.after-load', action: actionType}
type feature_ifPT = {$: 'feature.if', showCondition: dataType}
type hiddenPT = {$: 'hidden', showCondition: booleanType}
type conditional_classPT = {$: 'conditional-class', cssClass: dataType,condition: booleanType}
type feature_hover_titlePT = {$: 'feature.hover-title', title: dataType}
type feature_keyboard_shortcutPT = {$: 'feature.keyboard-shortcut', key: dataType,action: actionType}
type feature_onHoverPT = {$: 'feature.onHover', action: actionType}
type feature_onKeyPT = {$: 'feature.onKey', code: dataType,action: actionType}
type feature_onEnterPT = {$: 'feature.onEnter', action: actionType}
type feature_onEscPT = {$: 'feature.onEsc', action: actionType}
type feature_onDeletePT = {$: 'feature.onDelete', action: actionType}
type group_auto_focus_on_first_inputPT = {$: 'group.auto-focus-on-first-input', }
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType,overflow: dataType,minMax: dataType,selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType,overflow: dataType,minMax: dataType,selector: dataType}
type css_opacityPT = {$: 'css.opacity', opacity: dataType,selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType,left: dataType,right: dataType,bottom: dataType,selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType,left: dataType,right: dataType,bottom: dataType,selector: dataType}
type css_transform_rotatePT = {$: 'css.transform-rotate', angle: dataType,selector: dataType}
type css_colorPT = {$: 'css.color', color: dataType,background: dataType,selector: dataType}
type css_transform_scalePT = {$: 'css.transform-scale', x: dataType,y: dataType,selector: dataType}
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType,spreadRadius: dataType,shadowColor: dataType,opacity: dataType,horizontal: dataType,vertical: dataType,selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType,side: dataType,style: dataType,color: dataType,selector: dataType}
type menu_init_popup_menuPT = {$: 'menu.init-popup-menu', popupStyle: dialog_styleType}
type menu_init_menu_optionPT = {$: 'menu.init-menu-option', }
type menu_selectionPT = {$: 'menu.selection', autoSelectFirst: booleanType}
type itemlist_no_containerPT = {$: 'itemlist.no-container', }
type itemlist_initPT = {$: 'itemlist.init', }
type itemlist_selectionPT = {$: 'itemlist.selection', databind: dataType,selectedToDatabind: dataType,databindToSelected: dataType,onSelection: actionType,onDoubleClick: actionType,autoSelectFirst: booleanType,cssForSelected: dataType}
type itemlist_keyboard_selectionPT = {$: 'itemlist.keyboard-selection', onEnter: actionType,autoFocus: booleanType}
type itemlist_drag_and_dropPT = {$: 'itemlist.drag-and-drop', }
type itemlist_drag_handlePT = {$: 'itemlist.drag-handle', }
type itemlist_shown_only_on_item_hoverPT = {$: 'itemlist.shown-only-on-item-hover', }
type itemlist_dividerPT = {$: 'itemlist.divider', space: dataType}
type group_itemlist_containerPT = {$: 'group.itemlist-container', id: dataType,defaultItem: dataType,maxItems: dataType,initialSelection: dataType}
type itemlist_itemlist_selectedPT = {$: 'itemlist.itemlist-selected', }
type itemlist_container_filter_fieldPT = {$: 'itemlist-container.filter-field', fieldData: dataType,filterType: filter_typeType}
type picklist_dynamic_optionsPT = {$: 'picklist.dynamic-options', recalcEm: dataType}
type picklist_onChangePT = {$: 'picklist.onChange', action: actionType}
type group_themePT = {$: 'group.theme', theme: themeType}
type slider_initPT = {$: 'slider.init', }
type slider_text_handleArrowKeysPT = {$: 'slider-text.handleArrowKeys', }
type slider_edit_as_text_popupPT = {$: 'slider.edit-as-text-popup', }
type table_initPT = {$: 'table.init', }
type table_init_sortPT = {$: 'table.init-sort', }
type group_init_tabsPT = {$: 'group.init-tabs', keyboardSupport: dataType,autoFocus: dataType}
type mdl_style_init_dynamicPT = {$: 'mdl-style.init-dynamic', query: dataType}
type mdl_ripple_effectPT = {$: 'mdl.ripple-effect', }
type flex_layout_container_align_main_axisPT = {$: 'flex-layout-container.align-main-axis', align: dataType}
type flex_item_growPT = {$: 'flex-item.grow', factor: dataType}
type flex_item_basisPT = {$: 'flex-item.basis', factor: dataType}
type flex_item_align_selfPT = {$: 'flex-item.align-self', align: dataType}
type responsive_only_for_phonePT = {$: 'responsive.only-for-phone', }
type responsive_not_for_phonePT = {$: 'responsive.not-for-phone', }
type group_init_expandablePT = {$: 'group.init-expandable', }
type group_init_accordionPT = {$: 'group.init-accordion', keyboardSupport: dataType,autoFocus: dataType}
type tree_selectionPT = {$: 'tree.selection', databind: dataType,autoSelectFirst: booleanType,onSelection: actionType,onRightClick: actionType}
type tree_keyboard_selectionPT = {$: 'tree.keyboard-selection', onKeyboardSelection: actionType,onEnter: actionType,onRightClickOfExpanded: actionType,autoFocus: booleanType,applyMenuShortcuts: menu_optionType}
type tree_drag_and_dropPT = {$: 'tree.drag-and-drop', }

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

// type image
type imageType = imagePT | ((ctx: ctx) => any)
type cmp_def_imageType = {
	type: 'image',
	params?: [param],
	impl: imageType,
}
type imagePT = {$: 'image', url: dataType,imageWidth: dataType,imageHeight: dataType,width: dataType,height: dataType,units: dataType,style: image_styleType,features: featureType}

// type image.style
type image_styleType = image_defaultPT | ((ctx: ctx) => any)
type cmp_def_image_styleType = {
	type: 'image_style',
	params?: [param],
	impl: image_styleType,
}
type image_defaultPT = {$: 'image.default', }

// type clickable
type clickableType = buttonPT | icon_with_actionPT | menu_controlPT | ((ctx: ctx) => any)
type cmp_def_clickableType = {
	type: 'clickable',
	params?: [param],
	impl: clickableType,
}
type buttonPT = {$: 'button', title: dataType,action: actionType,style: button_styleType,features: featureType}
type icon_with_actionPT = {$: 'icon-with-action', icon: dataType,title: dataType,action: actionType,style: icon_with_action_styleType,features: featureType}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType,style: menu_styleType,features: featureType}

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

// type dialog-feature
type dialog_featureType = cssPT | css_classPT | css_widthPT | css_heightPT | css_paddingPT | css_marginPT | css_box_shadowPT | css_borderPT | dialog_feature_unique_dialogPT | dialog_feature_keyboard_shortcutPT | dialog_feature_near_launcher_positionPT | dialog_feature_onClosePT | dialog_feature_close_when_clicking_outsidePT | dialog_feature_auto_focus_on_first_inputPT | dialog_feature_css_class_on_launching_elementPT | dialog_feature_max_zIndex_on_clickPT | dialog_feature_drag_titlePT | dialog_feature_resizerPT | ((ctx: ctx) => any)
type cmp_def_dialog_featureType = {
	type: 'dialog_feature',
	params?: [param],
	impl: dialog_featureType,
}
type cssPT = {$: 'css', css: dataType}
type css_classPT = {$: 'css.class', class: dataType}
type css_widthPT = {$: 'css.width', width: dataType,overflow: dataType,minMax: dataType,selector: dataType}
type css_heightPT = {$: 'css.height', height: dataType,overflow: dataType,minMax: dataType,selector: dataType}
type css_paddingPT = {$: 'css.padding', top: dataType,left: dataType,right: dataType,bottom: dataType,selector: dataType}
type css_marginPT = {$: 'css.margin', top: dataType,left: dataType,right: dataType,bottom: dataType,selector: dataType}
type css_box_shadowPT = {$: 'css.box-shadow', blurRadius: dataType,spreadRadius: dataType,shadowColor: dataType,opacity: dataType,horizontal: dataType,vertical: dataType,selector: dataType}
type css_borderPT = {$: 'css.border', width: dataType,side: dataType,style: dataType,color: dataType,selector: dataType}
type dialog_feature_unique_dialogPT = {$: 'dialog-feature.unique-dialog', id: dataType,remeberLastLocation: booleanType}
type dialog_feature_keyboard_shortcutPT = {$: 'dialog-feature.keyboard-shortcut', shortcut: dataType,action: actionType}
type dialog_feature_near_launcher_positionPT = {$: 'dialog-feature.near-launcher-position', offsetLeft: dataType,offsetTop: dataType,rightSide: dataType}
type dialog_feature_onClosePT = {$: 'dialog-feature.onClose', action: actionType}
type dialog_feature_close_when_clicking_outsidePT = {$: 'dialog-feature.close-when-clicking-outside', delay: dataType}
type dialog_feature_auto_focus_on_first_inputPT = {$: 'dialog-feature.auto-focus-on-first-input', selectText: dataType}
type dialog_feature_css_class_on_launching_elementPT = {$: 'dialog-feature.css-class-on-launching-element', }
type dialog_feature_max_zIndex_on_clickPT = {$: 'dialog-feature.max-zIndex-on-click', minZIndex: dataType}
type dialog_feature_drag_titlePT = {$: 'dialog-feature.drag-title', id: dataType}
type dialog_feature_resizerPT = {$: 'dialog-feature.resizer', resizeInnerCodemirror: dataType}

// type dialog.style
type dialog_styleType = dialog_defaultPT | dialog_popupPT | dialog_dialog_ok_cancelPT | dialog_context_menu_popupPT | ((ctx: ctx) => any)
type cmp_def_dialog_styleType = {
	type: 'dialog_style',
	params?: [param],
	impl: dialog_styleType,
}
type dialog_defaultPT = {$: 'dialog.default', }
type dialog_popupPT = {$: 'dialog.popup', }
type dialog_dialog_ok_cancelPT = {$: 'dialog.dialog-ok-cancel', okLabel: dataType,cancelLabel: dataType}
type dialog_context_menu_popupPT = {$: 'dialog.context-menu-popup', offsetTop: dataType,rightSide: dataType}

// type menu.option
type menu_optionType = menu_menuPT | menu_options_groupPT | menu_dynamic_optionsPT | menu_end_with_separatorPT | menu_separatorPT | menu_actionPT | ((ctx: ctx) => any)
type cmp_def_menu_optionType = {
	type: 'menu_option',
	params?: [param],
	impl: menu_optionType,
}
type menu_menuPT = {$: 'menu.menu', title: dataType,options: menu_optionType,optionsFilter: dataType}
type menu_options_groupPT = {$: 'menu.options-group', options: menu_optionType}
type menu_dynamic_optionsPT = {$: 'menu.dynamic-options', items: dataType,genericOption: menu_optionType}
type menu_end_with_separatorPT = {$: 'menu.end-with-separator', options: menu_optionType,separator: menu_optionType,title: dataType}
type menu_separatorPT = {$: 'menu.separator', }
type menu_actionPT = {$: 'menu.action', title: dataType,action: actionType,icon: dataType,shortcut: dataType,showCondition: booleanType}

// type menu
type menuType = menu_controlPT | ((ctx: ctx) => any)
type cmp_def_menuType = {
	type: 'menu',
	params?: [param],
	impl: menuType,
}
type menu_controlPT = {$: 'menu.control', menu: menu_optionType,style: menu_styleType,features: featureType}

// type menu.style
type menu_styleType = menu_style_pulldownPT | menu_style_context_menuPT | menu_style_apply_multi_levelPT | menu_style_popup_as_optionPT | menu_style_popup_thumbPT | menu_style_toolbarPT | ((ctx: ctx) => any)
type cmp_def_menu_styleType = {
	type: 'menu_style',
	params?: [param],
	impl: menu_styleType,
}
type menu_style_pulldownPT = {$: 'menu-style.pulldown', innerMenuStyle: menu_styleType,leafOptionStyle: menu_option_styleType,layout: group_styleType}
type menu_style_context_menuPT = {$: 'menu-style.context-menu', leafOptionStyle: menu_option_styleType}
type menu_style_apply_multi_levelPT = {$: 'menu-style.apply-multi-level', menuStyle: menu_styleType,leafStyle: menu_styleType,separatorStyle: menu_styleType}
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

// type itemlist.style
type itemlist_styleType = itemlist_ul_liPT | itemlist_horizontalPT | ((ctx: ctx) => any)
type cmp_def_itemlist_styleType = {
	type: 'itemlist_style',
	params?: [param],
	impl: itemlist_styleType,
}
type itemlist_ul_liPT = {$: 'itemlist.ul-li', }
type itemlist_horizontalPT = {$: 'itemlist.horizontal', ,spacing: dataType}

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

// type picklist.options
type picklist_optionsType = picklist_optionsByCommaPT | picklist_optionsPT | picklist_coded_optionsPT | picklist_sorted_optionsPT | ((ctx: ctx) => any)
type cmp_def_picklist_optionsType = {
	type: 'picklist_options',
	params?: [param],
	impl: picklist_optionsType,
}
type picklist_optionsByCommaPT = {$: 'picklist.optionsByComma', options: dataType,allowEmptyValue: booleanType}
type picklist_optionsPT = {$: 'picklist.options', options: dataType,allowEmptyValue: booleanType}
type picklist_coded_optionsPT = {$: 'picklist.coded-options', options: dataType,code: dataType,text: dataType,allowEmptyValue: booleanType}
type picklist_sorted_optionsPT = {$: 'picklist.sorted-options', options: picklist_optionsType,marks: dataType}

// type picklist.promote
type picklist_promoteType = picklist_promotePT | ((ctx: ctx) => any)
type cmp_def_picklist_promoteType = {
	type: 'picklist_promote',
	params?: [param],
	impl: picklist_promoteType,
}
type picklist_promotePT = {$: 'picklist.promote', groups: dataType,options: dataType}

// type theme
type themeType = theme_material_designPT | ((ctx: ctx) => any)
type cmp_def_themeType = {
	type: 'theme',
	params?: [param],
	impl: themeType,
}
type theme_material_designPT = {$: 'theme.material-design', }

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

// type table-field
type table_fieldType = fieldPT | field_indexPT | field_controlPT | field_buttonPT | ((ctx: ctx) => any)
type cmp_def_table_fieldType = {
	type: 'table_field',
	params?: [param],
	impl: table_fieldType,
}
type fieldPT = {$: 'field', title: dataType,data: dataType,width: dataType,numeric: booleanType,extendItems: booleanType,class: dataType}
type field_indexPT = {$: 'field.index', title: dataType,width: dataType,class: dataType}
type field_controlPT = {$: 'field.control', title: dataType,control: controlType,width: dataType,dataForSort: dataType,numeric: booleanType}
type field_buttonPT = {$: 'field.button', title: dataType,buttonText: dataType,action: actionType,width: dataType,dataForSort: dataType,numeric: booleanType,style: table_button_styleType,features: featureType}

// type button.style
type button_styleType = table_button_hrefPT | button_hrefPT | button_xPT | button_mdl_raisedPT | button_mdl_flat_ripplePT | button_mdl_iconPT | button_mdl_round_iconPT | button_mdl_icon_12_with_ripplePT | button_mdl_icon_12PT | button_mdl_card_flatPT | ((ctx: ctx) => any)
type cmp_def_button_styleType = {
	type: 'button_style',
	params?: [param],
	impl: button_styleType,
}
type table_button_hrefPT = {$: 'table-button.href', }
type button_hrefPT = {$: 'button.href', }
type button_xPT = {$: 'button.x', size: dataType}
type button_mdl_raisedPT = {$: 'button.mdl-raised', }
type button_mdl_flat_ripplePT = {$: 'button.mdl-flat-ripple', }
type button_mdl_iconPT = {$: 'button.mdl-icon', icon: dataType}
type button_mdl_round_iconPT = {$: 'button.mdl-round-icon', icon: dataType}
type button_mdl_icon_12_with_ripplePT = {$: 'button.mdl-icon-12-with-ripple', icon: dataType}
type button_mdl_icon_12PT = {$: 'button.mdl-icon-12', icon: dataType}
type button_mdl_card_flatPT = {$: 'button.mdl-card-flat', }

// type group.style
type group_styleType = tabs_simplePT | layout_verticalPT | layout_horizontalPT | layout_horizontal_fixed_splitPT | layout_horizontal_wrappedPT | layout_flexPT | group_sectionPT | group_divPT | group_ul_liPT | group_expandablePT | group_accordionPT | group_tabsPT | toolbar_simplePT | property_sheet_titles_abovePT | property_sheet_titles_above_float_leftPT | property_sheet_titles_leftPT | card_cardPT | card_media_groupPT | card_actions_groupPT | card_menuPT | ((ctx: ctx) => any)
type cmp_def_group_styleType = {
	type: 'group_style',
	params?: [param],
	impl: group_styleType,
}
type tabs_simplePT = {$: 'tabs.simple', }
type layout_verticalPT = {$: 'layout.vertical', spacing: dataType}
type layout_horizontalPT = {$: 'layout.horizontal', ,spacing: dataType}
type layout_horizontal_fixed_splitPT = {$: 'layout.horizontal-fixed-split', ,leftWidth: dataType,rightWidth: dataType,spacing: dataType}
type layout_horizontal_wrappedPT = {$: 'layout.horizontal-wrapped', ,spacing: dataType}
type layout_flexPT = {$: 'layout.flex', align: dataType,direction: dataType,wrap: dataType}
type group_sectionPT = {$: 'group.section', }
type group_divPT = {$: 'group.div', groupClass: dataType,itemClass: dataType}
type group_ul_liPT = {$: 'group.ul-li', }
type group_expandablePT = {$: 'group.expandable', }
type group_accordionPT = {$: 'group.accordion', }
type group_tabsPT = {$: 'group.tabs', width: dataType}
type toolbar_simplePT = {$: 'toolbar.simple', }
type property_sheet_titles_abovePT = {$: 'property-sheet.titles-above', spacing: dataType}
type property_sheet_titles_above_float_leftPT = {$: 'property-sheet.titles-above-float-left', spacing: dataType,fieldWidth: dataType}
type property_sheet_titles_leftPT = {$: 'property-sheet.titles-left', vSpacing: dataType,hSpacing: dataType,titleWidth: dataType}
type card_cardPT = {$: 'card.card', width: dataType,shadow: dataType}
type card_media_groupPT = {$: 'card.media-group', }
type card_actions_groupPT = {$: 'card.actions-group', }
type card_menuPT = {$: 'card.menu', }

// type editable-text.style
type editable_text_styleType = editable_text_inputPT | editable_text_textareaPT | editable_text_mdl_inputPT | editable_text_mdl_input_no_floating_labelPT | editable_text_mdl_searchPT | ((ctx: ctx) => any)
type cmp_def_editable_text_styleType = {
	type: 'editable_text_style',
	params?: [param],
	impl: editable_text_styleType,
}
type editable_text_inputPT = {$: 'editable-text.input', }
type editable_text_textareaPT = {$: 'editable-text.textarea', rows: dataType,cols: dataType}
type editable_text_mdl_inputPT = {$: 'editable-text.mdl-input', width: dataType}
type editable_text_mdl_input_no_floating_labelPT = {$: 'editable-text.mdl-input-no-floating-label', width: dataType}
type editable_text_mdl_searchPT = {$: 'editable-text.mdl-search', }

// type first-succeeding.style
type first_succeeding_styleType = first_succeeding_stylePT | ((ctx: ctx) => any)
type cmp_def_first_succeeding_styleType = {
	type: 'first_succeeding_style',
	params?: [param],
	impl: first_succeeding_styleType,
}
type first_succeeding_stylePT = {$: 'first-succeeding.style', }

// type table.style
type table_styleType = table_with_headersPT | table_mdlPT | ((ctx: ctx) => any)
type cmp_def_table_styleType = {
	type: 'table_style',
	params?: [param],
	impl: table_styleType,
}
type table_with_headersPT = {$: 'table.with-headers', }
type table_mdlPT = {$: 'table.mdl', classForTable: dataType,classForTd: dataType}

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

// type tree.style
type tree_styleType = tree_ul_liPT | tree_no_headPT | ((ctx: ctx) => any)
type cmp_def_tree_styleType = {
	type: 'tree_style',
	params?: [param],
	impl: tree_styleType,
}
type tree_ul_liPT = {$: 'tree.ul-li', }
type tree_no_headPT = {$: 'tree.no-head', }

// type tree.nodeModel
type tree_nodeModelType = tree_json_read_onlyPT | tree_jsonPT | ((ctx: ctx) => any)
type cmp_def_tree_nodeModelType = {
	type: 'tree_nodeModel',
	params?: [param],
	impl: tree_nodeModelType,
}
type tree_json_read_onlyPT = {$: 'tree.json-read-only', object: dataType,rootPath: dataType}
type tree_jsonPT = {$: 'tree.json', object: dataType,rootPath: dataType}
type cmpDef = cmp_def_dataType | cmp_def_aggregatorType | cmp_def_booleanType | cmp_def_actionType | cmp_def_calculated_propertyType | cmp_def_data_switch_caseType | cmp_def_action_switch_caseType | cmp_def_controlType | cmp_def_featureType | cmp_def_label_styleType | cmp_def_imageType | cmp_def_image_styleType | cmp_def_clickableType | cmp_def_editable_number_styleType | cmp_def_dialog_featureType | cmp_def_dialog_styleType | cmp_def_menu_optionType | cmp_def_menuType | cmp_def_menu_styleType | cmp_def_menu_option_styleType | cmp_def_menu_separator_styleType | cmp_def_itemlist_styleType | cmp_def_filter_typeType | cmp_def_picklist_optionsType | cmp_def_picklist_promoteType | cmp_def_themeType | cmp_def_icon_with_action_styleType | cmp_def_table_fieldType | cmp_def_button_styleType | cmp_def_group_styleType | cmp_def_editable_text_styleType | cmp_def_first_succeeding_styleType | cmp_def_table_styleType | cmp_def_picklist_styleType | cmp_def_editable_boolean_styleType | cmp_def_tree_styleType | cmp_def_tree_nodeModelType