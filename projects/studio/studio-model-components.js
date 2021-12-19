// jb.component('studio.val', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path) => jb.tgp.valOfPath(path)
// })

// jb.component('studio.isPrimitiveValue', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path) =>	jb.studio.isPrimitiveValue(jb.tgp.valOfPath(path))
// })

// jb.component('studio.isOfType', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true},
//     {id: 'type', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path,_type) =>	jb.tgp.isOfType(path,_type)
// })

// jb.component('tgp.isArrayType', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path) =>	jb.tgp.isArrayType(path)
// })

// jb.component('tgp.parentPath', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path) => jb.tgp.parentPath(path)
// })

// jb.component('tgp.paramType', {
//   params: [
//     {id: 'path', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,path) =>	jb.studio.paramType(path)
// })

// jb.component('tgp.PTsOfType', {
//   params: [
//     {id: 'type', as: 'string', mandatory: true}
//   ],
//   impl: (ctx,_type) => jb.tgp.PTsOfType(_type)
// })


// jb.component('tgp.categoriesOfType', {
//   params: [
//     {id: 'type', as: 'string', mandatory: true},
//   ],
//   impl: (ctx,type) => {
// 		const comps = jb.comps;
// 		const pts = jb.tgp.PTsOfType(type);
// 		const categories = jb.utils.unique([
//       'common',
//       ...pts.flatMap(pt=> [
//         ...(comps[pt].category||'').split(',').map(c=>c.split(':')[0]),
// 				...(pt.indexOf('.') != -1 ? pt.split('.').slice(0,1) : []),
//         ].filter(x=>x)),
//       'all'])
// 			.map(c=>({	code: c, pts: ptsOfCategory(c) }))
//       .filter(c=>c.pts.length)
// 		return categories

// 		function ptsOfCategory(category) {
// 			const pts_with_marks = pts.filter(pt=>
// 					category == 'all' 
//           || pt.split('.')[0] == category 
//           || (comps[pt].category||'').split(',').map(x=>x.split(':')[0]).indexOf(category) != -1
//           || category == 'common' && pt.indexOf('.') == -1 && !comps[pt].category 
//         ).map(pt=>({
// 					pt: pt,
// 					mark: (comps[pt].category||'').split(',')
// 						.filter(c=>c.indexOf(category) == 0)
// 						.map(c=>Number(c.split(':')[1] || 50))[0] || 50
// 				}))
// 				// .map(x=> {
// 				// 	if (x.mark == null)
// 				// 		x.mark = 50;
// 				// 	return x
// 				// })
// 				.filter(x=>x.mark != 0)
// 			pts_with_marks.sort((c1,c2)=>c2.mark-c1.mark)
// 			return pts_with_marks.map(pt=>pt.pt)
// 		}
// 	}
// })

// jb.component('tgp.shortTitle', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.shortTitle(path)
// })

// jb.component('tgp.summary', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.summary(path)
// })

// jb.component('tgp.nonControlChildren', {
//   params: [
//     {id: 'path', as: 'string'},
//     {id: 'includeFeatures', as: 'boolean', type: 'boolean'}
//   ],
//   impl: (ctx,path,includeFeatures) =>	jb.tgp.nonControlChildren(path,includeFeatures)
// })

// jb.component('tgp.compName', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.tgp.compNameOfPath(path) || ''
// })

// jb.component('tgp.paramDef', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.tgp.paramDef(path)
// })

// jb.component('tgp.enumOptions', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>
// 		((jb.tgp.paramDef(path) || {}).options ||'').split(',').map(x=> ({code: x.split(':')[0],text: x.split(':')[0]}))
// })

// jb.component('tgp.propName', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.propName(path)
// })

// jb.component('tgp.moreParams', {
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.studio.jbEditorMoreParams(path)
// })

// jb.component('tgp.profileAsText', {
//   type: 'data',
//   params: [
//     {id: 'path', as: 'string'},
//     {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'},
//   ],
//   impl: tgpTextEditor.watchableAsText(tgp.ref('%$path%'),'%$oneWay%')
// })

// jb.component('studio.profileValueAsText', {
//   type: 'data',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => ({
// 		$jb_path: () => path.split('~'),
// 			$jb_val: function(value) {
// 				if (value == undefined) {
// 					const val = jb.tgp.valOfPath(path);
// 					if (val == null)
// 						return '';
// 					if (jb.studio.isPrimitiveValue(val))
// 						return '' + val
// 					if (jb.tgp.compNameOfPath(path))
// 						return '=' + jb.tgp.compNameOfPath(path)
// 				}
// 				else if (value.indexOf('=') != 0)
// 					jb.studio.writeValueOfPath(path, valToWrite(value),ctx);

//         function valToWrite(val) {
//           const type = (jb.tgp.paramDef(path) || {}).as
//           if (type == 'number' && Number(val)) return +val
//           if (type == 'boolean')
//             return val === 'true' ? true : val === 'false' ? false : '' + val
//           return '' + val
//         }
//       }
//     })
// })

// jb.component('tgp.insertControl', {
//   type: 'action',
//   params: [
//     {id: 'comp', mandatory: true, description: 'comp name or comp json'},
//     {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
//   ],
//   impl: (ctx,comp,path) =>	jb.tgp.insertControl(path, comp,ctx)
// })

// jb.component('tgp.wrap', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'},
//     {id: 'comp', as: 'string'}
//   ],
//   impl: (ctx,path,comp) => jb.tgp.wrap(path,comp,ctx)
// })

// jb.component('tgp.wrapWithGroup', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.wrapWithGroup(path,ctx)
// })

// jb.component('tgp.addProperty', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.addProperty(path,ctx)
// })

// jb.component('tgp.duplicateControl', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.duplicateControl(path,ctx)
// })

// jb.component('tgp.duplicateArrayItem', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.duplicateArrayItem(path,ctx)
// })

// jb.component('tgp.addArrayItem', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'},
//     {id: 'toAdd', as: 'single'},
//     {id: 'index', as: 'number', defaultValue: -1}
//   ],
//   impl: (ctx,path,toAdd,index) =>
//     index == -1 ? jb.tgp.addArrayItem(path, {srcCtx: ctx, toAdd})
//       : jb.tgp.addArrayItem(path, {srcCtx: ctx, toAdd, index})
// })

// jb.component('tgp.wrapWithArray', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path,toAdd) => jb.tgp.wrapWithArray(path,ctx)
// })

// jb.component('tgp.canWrapWithArray', {
//   type: 'boolean',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.paramDef(path) && (jb.tgp.paramDef(path).type || '').indexOf('[') != -1 && !Array.isArray(jb.tgp.valOfPath(path))
// })

// jb.component('tgp.isArrayItem', {
//   type: 'boolean',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	Array.isArray(jb.tgp.valOfPath(jb.tgp.parentPath(path)))
// })

// jb.component('tgp.setComp', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'},
//     {id: 'comp', as: 'single'}
//   ],
//   impl: (ctx,path,comp) => jb.tgp.setComp(path, comp,ctx)
// })

// jb.component('tgp.delete', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.studio._delete(path,ctx)
// })

// jb.component('tgp.isDisabled', {
//   type: 'boolean',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.tgp.isDisabled(path,ctx)
// })

// jb.component('tgp.toggleDisabled', {
//   type: 'action',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.tgp.toggleDisabled(path,ctx)
// })

// jb.component('tgp.iconOfType', {
//   type: 'data',
//   params: [
//     {id: 'type', as: 'string'}
//   ],
//   impl: (ctx,type) => {
// 		if (type.match(/.style$/))
// 			type = 'style';
// 		return ({
// 			action: 'play_arrow',
// 			data: 'data_usage',
// 			aggregator: 'data_usage',
// 			control: 'airplay',
// 			style: 'format_paint',
// 			feature: 'brush'
// 		}[type] || 'extension')
// 	}
// })

// jb.component('studio.isDisabled', {
//   type: 'boolean',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) =>	jb.tgp.isDisabled(path)
// })

// jb.component('tgp.paramsOfPath', {
//   type: 'tree.node-model',
//   params: [
//     {id: 'path', as: 'string'}
//   ],
//   impl: (ctx,path) => jb.tgp.paramsOfPath(path)
// })

// jb.component('tgp.titleToId', {
//   type: 'data',
//   params: [
//     {id: 'name', as: 'string', defaultValue: '%%'}
//   ],
//   impl: (ctx,name) => jb.macro.titleToId(name)
// })

