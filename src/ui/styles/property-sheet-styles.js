jb.component('property-sheet.titles-above', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 20 }
  ],
  impl :{$: 'customStyle', 
    features :{$: 'group.init-group'},
    template: `<div>
      <div *ngFor="let ctrl of ctrls" class="property">
        <label class="property-title">{{ctrl.title}}</label>
        <div *jbComp="ctrl.comp"></div>
      </div>
      </div>
    `,
    css: `.property { margin-bottom: %$spacing%px }
      .property:last-child { margin-bottom:0 }
      .property>.property-title {
        width:100px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
      }
      .property>div { display:inline-block }`
  }
})

jb.component('property-sheet.titles-above-float-left', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 20 },
    { id: 'fieldWidth', as: 'number', defaultValue: 200 },
  ],
  impl :{$: 'customStyle', 
    features :{$: 'group.init-group'},
    template: `<div>
        <div *ngFor="let ctrl of ctrls" class="property">
          <label class="property-title">{{ctrl.title}}</label>
          <div *jbComp="ctrl.comp"></div>
        </div>
        <div class="clearfix"></div>
      </div>
    `,
    css: `.property { 
          float: left;
          width: %$fieldWidth%px;
          margin-right: %$spacing}%px 
        }
      .clearfix { clear: both }
      .property:last-child { margin-right:0 }
      .property>.property-title {
        margin-bottom: 3px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        font-size:14px;
      }`,
  }
})

jb.component('property-sheet.titles-left', {
  type: 'group.style',
  params: [
    { id: 'vSpacing', as: 'number', defaultValue: 20 },
    { id: 'hSpacing', as: 'number', defaultValue: 20 },
    { id: 'titleWidth', as: 'number', defaultValue: 100 },
  ],
  impl :{$: 'customStyle', 
    features :{$: 'group.init-group'},
    template: `<div>
      <div *ngFor="let ctrl of ctrls" class="property">
        <label class="property-title">{{ctrl.title}}</label>
        <div *jbComp="ctrl.comp" class="property-ctrl"></div>
      </div>
    </div>`,
    css: `.property { margin-bottom: %$vSpacing%px; display: flex }
      .property:last-child { margin-bottom:0px }
      .property>.property-title {
        width: %$titleWidth%px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
        margin-right: %$hSpacing%px;
      }
      .property>*:last-child { margin-right:0 }`
  }
})
