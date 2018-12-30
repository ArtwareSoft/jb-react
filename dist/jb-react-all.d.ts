type tgpType = 'data' | 'control' | 'action'
type profile = ctrlPT | actionPT

type param = {
    id: string,
    type?: tgpType,
    defaultValue?: any,
    essential?: boolean,
    dynamic?: boolean,
    as?: 'string' | 'boolean' | 'number'
}

type cmp_def = {
    type: tgpType,
    params: [param],
    impl: profile,
}

type jbObj = {
    component(id: string, componentDef: cmp_def),
    comps: [cmp_def]
}
type ctx = {
    setVars({any}),
    setData(any),
    run(profile: profile),
    exp(exp: string),
    params: {any},
    entries(object): []
}

declare var jb: jbObj

type buttonPT = {$: 'button', action: actionPT}
type labelPT = {$: 'label', label: string}
type ctrlPT = buttonPT | labelPT | ((ctx: ctx) => any)

type writeValuePT = {$: 'write-value', value: string, to?: string  }
type gotoUrlPT = {$: 'goto-url', url: string}
type actionPT = writeValuePT | gotoUrlPT | ((ctx: ctx) => any)
