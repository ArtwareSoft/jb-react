jb.ns('editableNumber')

jb.component('editableNumber', {
  type: 'control',
  category: 'input:30',
  params: [
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'editable-number.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'symbol', as: 'string', description: 'leave empty to parse symbol from value'},
    {id: 'min', as: 'number', defaultValue: 0},
    {id: 'max', as: 'number', defaultValue: 10},
    {id: 'displayString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'dataString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'autoScale', as: 'boolean', defaultValue: true, description: 'adjust its scale if at edges', type: 'boolean'},
    {id: 'step', as: 'number', defaultValue: 1, description: 'used by slider'},
    {id: 'initialPixelsPerUnit', as: 'number', description: 'used by slider'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
      class editableNumber {
        constructor(params) {
          Object.assign(this,params);
          if (this.min == null) this.min = NaN;
          if (this.max == null) this.max = NaN;
        }
        numericPart(dataString) {
          if (typeof dataString == 'number') return dataString
          if (dataString == '') return NaN;
          var parts = (''+dataString).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/); // prefix-number-suffix
          if (parts)
            this.symbol = parts[1] || parts[3]
          return +(parts && parts[2])
        }

        calcDisplayString(number,ctx) {
          if (isNaN(number)) return this.placeholder || '';
          return this.displayString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }

        calcDataString(number,ctx) {
          if (isNaN(number)) return '';
          return this.dataString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }
      }
      return jb.ui.ctrl(ctx.setVars({ editableNumber: new editableNumber(ctx.params) }))
  }
})


