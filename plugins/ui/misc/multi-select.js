component('multiSelect', {
  type: 'control',
  description: 'select list of options, check multiple',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'multiSelect-style', defaultValue: select.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('multiSelect.modelAsBooleanRef', {
  type: 'boolean',
  params: [
    {id: 'multiSelectModel'},
    {id: 'code'}
  ],
  impl: (ctx,multiSelectModel,code) => {
        const ref = multiSelectModel.databind()
        return { $jb_val: val => val === undefined ? has() : val === true ? add() : remove() }

        function has() { return jb.val(ref).indexOf(code) != -1 }
        function add() { if (!has(code)) jb.db.push(ref, code,ctx) }
        function remove() { 
            const index = jb.val(ref).indexOf(code)
            index != -1 && jb.db.splice(ref,[[index,1]],ctx)
        }
    }
})

