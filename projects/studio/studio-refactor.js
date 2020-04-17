jb.component('studio.openExtractComponent', {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: runActions( writeValue('%$studio/refactor',obj()),
   openDialog({
    style: dialog.dialogOkCancel(),
    content: studio.extractComponentDialog('%$path%'),
    title: 'Extract Component',
    onOK: studio.calcExtractComponent({
        path: '%$path%',
        compName: '%$studio/refactor/compName%',
        description: '%$studio/refactor/description%',
        file: '%$studio/refactor/file%',
        activate: true
      }),
    modal: true,
    features: [
      dialogFeature.resizer(),
      css.width('730')
    ]
  }))
})

jb.component('studio.canExtractParam', {
	type: 'boolean',
	params: [
        {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    ],
    impl: (ctx,path) => path.match(/~/) && !path.match(/~impl$/)
})

jb.component('studio.calcExtractComponent', {
	description: 'returns the suggested component comp with save action',
	type: 'data',
	params: [
        {id: 'path', as: 'string', mandatory: true},
		{id: 'compName', as: 'string', mandatory: true },
		{id: 'description', as: 'string' },
		{id: 'file', as: 'string' },
		{id: 'activate', as: 'boolean' },
	],
	impl: (ctx,path,compName,description,file,activate) => {
        const st = jb.studio
        const parentComp = st.getComp(path.split('~')[0])
        const parentParams = parentComp.params || []
		const impl = st.clone(st.valOfPath(path))
		const usedParams = parentParams.map(p=> ({ ...p, fRegExp: new RegExp(`\\b${p.id}\\b`), sRegExp: new RegExp(`%\\$${p.id}`) }))
            .filter(p=>usesParam(p,impl))
        const newComp = {
            ...(parentComp.type && { type: parentComp.type }),
            ...(description && { description }),
            params: usedParams.map(p=> st.clone(parentParams.filter(pr => pr.id == p.id)[0])),
            impl
        }
        if (activate) {
            ctx.run(studio.newComp({compName, compContent: () => newComp, file}));
            jb.writeValue(jb.studio.refOfPath(path),
                {$: compName, ...jb.objFromEntries(newComp.params.map(p=>[p.id,`%$${p.id}%`]))},ctx)
        }

		return { compName, ...newComp}

		function usesParam(param, prof) {
			if (typeof prof == 'string')
				return param.sRegExp.test(prof)
			if (typeof prof == 'function')
				return param.fRegExp.test(prof.toString().split('=>')[0])
			if (typeof prof == 'object')
				return Object.keys(prof).reduce((agg,k) => agg || usesParam(param,prof[k]), false)
		}
	}
})

jb.component('studio.extractComponentDialog', {
    type: 'control',
    params: [
      {id: 'path', as: 'string', mandatory: true}
    ],
    impl: group({
      title: '',
      layout: layout.vertical('40'),
      controls: [
        group({
          layout: layout.horizontal('10'),
          controls: [
            editableText({
              title: 'component name',
              databind: '%$studio/refactor/compName%',
              features: [
                feature.init(If(not('%$studio/refactor/compName%'),writeValue('%$studio/refactor/compName%','%$studio/project%.cmp1'))),
                validation(matchRegex('^[A-Za-z_][\\.A-Za-z_0-9]*$', '%%'), 'invalid comp name'),
                validation(
                  not(inGroup(() => Object.keys(jb.studio.previewjb.comps))),
                  'component \"%%\" already exists'
                )
              ]
            }),
            editableText({
              title: 'description',
              databind: '%$studio/refactor/description%',
              style: editableText.mdcInput('300')
            }),
            picklist({
              title: 'file',
              databind: '%$studio/refactor/file%',
              options: picklist.options({options: sourceEditor.filesOfProject(), code: ''}),
              style: picklist.mdcSelect('200'),
              features: [css('~ .mdc-select__anchor { background-color: white !important }')]
            })
          ]
        }),
        editableText({
          title: 'content',
          databind: pipeline(studio.calcExtractComponent({
              path: '%$path%',
              compName: '%$studio/refactor/compName%',
              description: '%$studio/refactor/description%',
              file: '%$studio/refactor/file%'
            }), prettyPrint()),
          style: editableText.codemirror({}),
          features: watchRef({ref: '%$studio/refactor%', includeChildren: 'yes'})
        })
      ],
    })
})

// *********** extract param

jb.component('studio.openExtractParam', {
    type: 'action',
    params: [
        {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    ],
    impl: runActions(
    writeValue('%$studio/refactor',obj()),
    openDialog({
        style: dialog.dialogOkCancel(),
        content: studio.extractParamDialog('%$path%'),
        title: 'Extract Parameter',
        onOK: studio.calcExtractParam({
            path: '%$path%',
            id: '%$studio/refactor/paramName%',
            description: '%$studio/refactor/description%',
            activate: true
        }),
        modal: true,
        features: [dialogFeature.resizer(), 
            css.width('500')
        ]
    }))
})

jb.component('studio.calcExtractParam', {
	type: 'data',
	params: [
        {id: 'path', as: 'string', mandatory: true},
		{id: 'id', as: 'string' },
        {id: 'description', as: 'string' },
		{id: 'activate', as: 'boolean' },
	],
	impl: (ctx,path,id,description,activate) => {
        const st = jb.studio
        const compName = path.split('~')[0]
        const parentComp = st.getComp(compName)
        const type = ((st.paramDef(path) || {}).type || '').split('[')[0]
        const paramToAdd = {
            id,
            ...(type && { type }),
            ...(type == 'action' && { dynamic: true }),
            defaultValue: st.valOfPath(path),
            ...(description && { description })
        }
        const newParams = [...(jb.compParams(parentComp) || []), paramToAdd]

        if (activate) {
            jb.writeValue(st.refOfPath(`${compName}~params`),newParams, ctx),
            jb.writeValue(st.refOfPath(path), `%$${id}%`,ctx)
        }

		return paramToAdd
	}
})

jb.component('studio.extractParamDialog', {
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: group({
    title: '',
    layout: layout.vertical('40'),
    controls: [
      group({
        layout: layout.horizontal('10'),
        controls: [
          editableText({
            title: 'param name',
            databind: '%$studio/refactor/paramName%',
            features: [
              feature.init(
                If(
                  not('%$studio/refactor/paramName%'),
                  writeValue('%$studio/refactor/paramName%',
                    pipeline(
                      split({separator: '~', text: '%$path%'}),
                      filter(not(matchRegex('[0-9]+'))),
                      last(),
                      removeSuffix('s')
                    )
                  )
                )
              ),
              validation(matchRegex('^[A-Za-z_][\\.A-Za-z_0-9]*$', '%%'), 'invalid param name')
            ]
          }),
          editableText({
            title: 'description',
            databind: '%$studio/refactor/description%',
            style: editableText.mdcInput('300')
          })
        ]
      }),
      editableText({
        title: 'content',
        databind: pipeline(
          studio.calcExtractParam({
              path: '%$path%',
              id: '%$studio/refactor/paramName%',
              description: '%$studio/refactor/description%'
            }),
          prettyPrint()
        ),
        style: editableText.codemirror({}),
        features: watchRef({ref: '%$studio/refactor%', includeChildren: 'yes'})
      })
    ]
  })
})

// ** make local

jb.component('studio.canMakeLocal', {
	type: 'boolean',
	params: [
        {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    ],
    impl: (ctx,path) => {
        const st = jb.studio
        const comp = st.compOfPath(path);
        return comp && typeof comp.impl == 'object'
    }
})

jb.component('studio.calcMakeLocal', {
    type: 'data,action',
    params: [
      {id: 'path', as: 'string'},
      {id: 'activate', as: 'boolean' },
    ],
    impl: (ctx,path,activate) => {
        const st = jb.studio
        const comp = st.compOfPath(path);
        const valToReplace = st.valOfPath(path)
		const impl = st.clone(comp.impl)
        const params = (comp.params || []).map(p=> ({ ...p, 
            fRegExp: new RegExp(`\\b${p.id}\\b`), 
            sRegExp: new RegExp(`%\\$${p.id}`),
            simpleUsageRegExp: new RegExp(`%\\$${p.id}%`)
        }))
        const varsToAdd = {}
        params.forEach(p=>{
            const _noOfUsages = noOfUsages(p,impl)
            if (!_noOfUsages) return
            const val = paramVal(p)
            const _noOfSimpleUsages = noOfSimpleUsages(p,impl)
            if (_noOfUsages == _noOfSimpleUsages)
                replaceSimpleUsages(impl,p,val)
            else
                varsToAdd[p.id] = val
        })
        fixFunctionHeaders(impl)

        const res = { ...(Object.keys(varsToAdd).length && {$vars: varsToAdd}), $basedOn: valToReplace.$, ...impl }

        if (activate)
            st.writeValueOfPath(path,res,ctx)
        return res
        
        function paramVal(p) {
            return valToReplace[p.id] == null ? p.defaultValue : valToReplace[p.id]
        }

		function noOfUsages(param, prof) {
			if (typeof prof == 'string')
				return param.sRegExp.test(prof) ? 1 :0
			if (typeof prof == 'function')
				return param.fRegExp.test(prof.toString().split('=>')[0]) ? 1 :0
            if (typeof prof == 'object' && prof.$ == 'call' && prof.param == param.id)
				return 1
			if (typeof prof == 'object')
				return Object.keys(prof).reduce((agg,k) => agg + noOfUsages(param,prof[k]), 0)
		}        
		function noOfSimpleUsages(param, prof) { // simple usage meamns '%$param%'
			if (typeof prof == 'string')
				return param.simpleUsageRegExp.test(prof) ? 1 :0
            if (typeof prof == 'object' && prof.$ == 'call' && prof.param == param.id)
				return 1
			if (typeof prof == 'object')
                return Object.keys(prof).reduce((agg,k) => agg + noOfSimpleUsages(param,prof[k]), 0)
            return 0
		}        
		function replaceSimpleUsages(prof,param, val) {
			typeof prof == 'object' && jb.entries(prof).forEach(e =>{
                if (typeof e[1] == 'string' && param.simpleUsageRegExp.test(e[1]))
                    prof[e[0]] = val
                else if (typeof e[1] == 'object' && e[1].$ == 'call' && e[1].param == param.id)
                    prof[e[0]] = val
                else
                    replaceSimpleUsages(e[1],param, val)
            })
        }        

        // (ctx,{var1},{param1}) should become (ctx,{var1,param1})
		function fixFunctionHeaders(prof) {
			typeof prof == 'object' && jb.entries(prof).forEach(e =>{
                if (typeof e[1] == 'function') {
                    const f = e[1].toString()
                    const header = f.split('=>')[0]
                    if (header.match(/,\s*({[^}]*)(}\s*,{)([^}]*})\s*\)/)) {
                        const fixedFunc = st.evalProfile( [
                            header.replace(/,\s*({[^}]*)(}\s*,{)([^}]*})\s*\)/,',$1,$3)').replace(/{,/g,'{'),
                            '=>',
                            f.split('=>')[1]
                        ].join(' '));
                        prof[e[0]] = fixedFunc
                    }
                } else if (typeof e[1] == 'object')
                    fixFunctionHeaders(e[1])
            })
        }
    }
})

jb.component('studio.openMakeLocal', {
    type: 'action',
    params: [
        {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    ],
    impl: runActions(
    openDialog({
        style: dialog.dialogOkCancel(),
        content: editableText({
            title: 'content',
            databind: pipeline(
              studio.calcMakeLocal({path: '%$path%' }),
              prettyPrint()
            ),
            style: editableText.codemirror({}),
        }),
        title: 'Make Local',
        onOK: studio.calcMakeLocal({ path: '%$path%', activate: true }),
        modal: true,
        features: [dialogFeature.resizer(), 
            css.width('500')
        ]
    }))
})