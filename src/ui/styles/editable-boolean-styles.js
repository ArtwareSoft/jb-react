jb.component('editable-boolean.checkbox', {
  type: 'editable-boolean.style',
  impl :{$: 'customStyle', 
      features :{$: 'field.databind' },
      template: `<input type="checkbox" [ngModel]="jbModel()" (change)="jbModel($event.target.checked)" (keyup)="jbModel($event.target.checked,'keyup')">`,
	}
})

jb.component('editable-boolean.checkbox-with-title', {
  type: 'editable-boolean.style',
  impl :{$: 'customStyle', 
      features :{$: 'field.databind' },
      template: `<div><input type="checkbox" [ngModel]="jbModel()" (change)="jbModel($event.target.checked)" (keyup)="jbModel($event.target.checked,'keyup')">{{text()}}</div>`,
	}
})

jb.component('editable-boolean.flipswitch', {
  type: 'editable-boolean.style',
  impl :{$: 'customStyle', 
      features :{$: 'field.databind' },
      template: `<div><input class="flipswitch" type="checkbox" [ngModel]="jbModel()" (change)="jbModel($event.target.checked)" (keyup)="jbModel($event.target.checked,'keyup')"></div>`,
      css: `.flipswitch
{
    position: relative;
    background: white;
    width: 80px;
    height: 21px;
    margin-left: 0;
    border-radius: 5px;
    -webkit-appearance: initial;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    outline:none;
    font: 12px Arial;
    cursor:pointer;
    border:1px solid #ccc;
}
.flipswitch:after
{
    position:absolute;
    top:5%;
    display:block; 
    line-height:20px;
    width:45%;
    height:90%;
    background:#fff;
    box-sizing:border-box;
    text-align:center;
    transition: all 0.3s ease-in 0s; 
    color:black;
    border:#eee 1px solid;
    border-radius:3px;
}
.flipswitch:after
{
    left:2%;
    content: "No";
}
.flipswitch:checked:after
{
    left:52%;
    content: "Yes";  
}
      `
  }
})

jb.component('editable-boolean.expand-collapse', {
  type: 'editable-boolean.style',
  impl :{$: 'customStyle',
      features :{$: 'field.databind' },
      template: `<div><input type="checkbox" [ngModel]="jbModel()" (change)="jbModel($event.checked)" (keyup)="jbModel($event.target.checked,'keyup')">
      	<i class="material-icons noselect" (click)="toggle()">{{jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}}</i>
      </div>`,
      css: `i { font-size:16px; cursor: pointer; }
      		input { display: none }`
   }
})