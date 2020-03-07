import { first } from "rxjs/operator/first";

type enum1 = 'a' | 'b';
type enum2 = 'c' | 'd';
type control = string;
type controlProfile = () => control;
type group = {
    enum1list?: enum1[],
    enum2list?: enum2[],
    strs?: string[],
    controls: controlProfile[]
}

function pipelineNum() : number { return 3}
function pipelineStr() : string { return ''}
function pipeline() : dataType { return ''};
type first = (items: []) => [];
type d1 = pipelineStr | pipeline;

type dataType = string | ((...args) => dataType);

type TextF1 = (byName: {text: string, title?: string, style?: number}) => dataType;
type TextF2 =  (aa: string, bb: string) => dataType;
type TextF = TextF1 & TextF2
const text : TextF = (()=> 'aa');
function f(data: d1) : string;



f(pipelineStr)


const aa: group = {}