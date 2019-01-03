type param = {
    id: string,
    type?: tgpType,
    defaultValue?: any,
    essential?: boolean,
    dynamic?: boolean,
    as?: 'string' | 'boolean' | 'number'
}

type jbObj = {
    component(id: string, componentDef: cmpDef),
    comps: [cmpDef]
}
type ctx = {
    setVars({any}),
    setData(any),
    run(profile: profile),
    exp(exp: string),
    params: {any},
    entries(object): [any]
}
//declare var jb: jbObj

//import __ from './jb-react-all.d.ts'

interface T<Name> {$: Name}
interface buttonPT1 extends T<'button'>{action: actionType}
interface labelPT1 extends T<'label'>{label: string}

type ctrlType1 = buttonPT1 | labelPT1 | ((ctx: ctx) => any)

var x: ctrlType1 = {$: 'button'}
// type writeValuePT = {$: 'write-value', value: string, to?: string  }
// type gotoUrlPT = {$: 'goto-url', url: string}
// type actionType = writeValuePT | gotoUrlPT | ((ctx: ctx) => any)
