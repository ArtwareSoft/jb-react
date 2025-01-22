dsl('zui')

/*
I am building a zoomable user interface that presents items retrieved from LLM (Language Model) queries.
Users interact with the system through zooming and panning. 
The system can use the LLM to retrieve 1, 3, or 30 items at a time. 
It can utilize either a smart/expensive LLM or a faster, cheaper llm model. 
Retrieving more items takes longer and incurs a higher cost. 
Additionally, the system leverages the LLM to suggest "query chips" to users. 
When selected, these chips make the query more specific but reduce quality of the current content as less relevant. 
I use context version counter to reflect that.

The value for the user can be determined by the content displayed on the screen, measured as a function of visible pixels and LLM quality. 
To calculate the real user value, future value must also be integrated. 
This requires modeling a probabilistic space of potential future user states and available content 
to determine the optimal LLM queries to execute now to maximize the function. LLM queries can retrieve between 1 and 50 items and can take 1-50 seconds.

For example, consider a doctor in an emergency department using the system to diagnose a patient. 
The doctor enters basic patient symptoms, such as "age 30, dizziness, headache." 
The system quickly displays 3 possible conditions as icons, providing details such as abbreviations, categories, and likelihood. 
It also gradually offers "context chips" like "high blood pressure" to refine the query.
To fetch this data, the system decides how many conditions to retrieve and at what LLM quality. For instance:

3 fast items with icon data (3 seconds)
50 high-quality items with icon data (50 seconds)
5 low-quality query chips (2 seconds)
5 high-quality query chips (10 seconds)
When the 3 low-quality items arrive, the user might zoom into one condition to view it as a card with more detailed properties. 
To support this, the system might preemptively initiate:
3 fast items with card data (7 seconds)
3 high-quality items with card data (15 seconds)
The system should anticipate the user's zoom behavior and pre-fetch the "3 fast items with card data" and "3 high-quality items with card data" ahead of time, 
focusing on the conditions with the highest likelihood.
*/

// extension('zui', 'Markov' , {
//     reward(state) {
//         // help needed here
//         const iconMode = st.zoomPan.zoom > 3
//         return Math.sum(...st.items.map(item=>this.itemVisibleSize(st.zoomPan, item.pos)* iconMode ? item.iconQuality : item.cardQuality))
//     },
//     agentPolicy(state) {
//         // create task action
//         // objectives
//         // fast data to the user, high quality of data, coverage of data by probability of future user engagement with the data
        
//         //tradeoffs: limited budget - limited no of running tasks, limited $
//     },
//     evaluateTask(task) {
//         const {noOfItems, details, smartModel} = task
//         // details: 1 - icon, 2 - card
//         // const estimatedTime = noOfItems * details * smartModel // please fix to comply with this table
//         // [1]

//     },
//     userPolicy(state) {
//         // help needed here
//         const relevanceCenter = { x: Math.sqrt(state.items.length), y: Math.sqrt(state.items.length) }
//         state.userState = state.userState || { mode: "exploration", remainingSteps: 5 }
        
//         if (--state.userState.remainingSteps <= 0) {
//             state.userState = {
//                 mode: state.userState.mode === "exploration" ? "exploitation" : "exploration",
//                 remainingSteps: state.userState.mode === "exploration" ? 5 : 3
//             }
//         }
    
//         if (state.userState.mode === "exploration") {
//             return { zoomPan: { center: relevanceCenter, zoom: Math.min(state.zoomPan.zoom * 1.5, 50) } }
//         } else {
//             const nearestItem = state.items
//                 .filter(item => isVisible(item.pos, state.zoomPan))
//                 .reduce((nearest, item) => {
//                     const dist = distanceTo(item.pos, relevanceCenter)
//                     return !nearest || dist < nearest.dist ? { item, dist } : nearest
//                 }, null)
    
//             return nearestItem
//                 ? { zoomPan: { center: nearestItem.item.pos, zoom: Math.max(state.zoomPan.zoom / 1.5, 1) } }
//                 : { zoomPan: { center: relevanceCenter, zoom: Math.min(state.zoomPan.zoom * 1.5, 50) } }
//         }
    
//         function distanceTo(pos, center) {
//             return Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.y - center.y, 2))
//         }
    
//         function isVisible(pos, zoomPan) {
//             return distanceTo(pos, zoomPan.center) <= zoomPan.zoom
//         }
//     },
//     itemVisibleSize(zoomPan, pos) {
//         const distance = Math.sqrt(Math.pow(pos.x - zoomPan.center.x, 2) +  Math.pow(pos.y - zoomPan.center.y, 2))
//         const maxDistance = zoomPan.zoom; // Zoom level defines visible range
//         if (distance > maxDistance) return 0; // Item is not visible
//         return Math.max(0, 1 - distance / maxDistance); // Size decreases with distance
//     },

//     MDPSimulator: class MDPSimulator { // Markov Decision Processes
//         // state.zoomPan
//         // zoomPan.center - center of view port using items unit. viewPort size is sqrt(noOfItems)**2. 
//         // items are positioned with more relevant items in the middle spreading out
//         // st.zoomPan.zoom - 1 means only single item is shown, 10 means 10x10 items can be shown
//         transition(currentState, action) {
//             const st = {...currentState}
//             if (action.task) {
//                 const task = {...action.task}
//                 task.start = st.timeStep
//                 st.runningTask.push(task)
//             }
//             if (action.zoomPan) {
//                 st.zoomPan = action.zoomPan
//                 st.items.forEach(item=>{
//                     const visibleSize = jb.zui.itemVisibleSize(st.zoomPan, item.pos)
//                     if (visibleSize > 0 && item.firstShow == 0)
//                         item.firstShow = st.timeStep
//                     item.userTime += visibleSize
//                 })
//             }

//             st.runningTask.filter(task.start+task.duration == st.timeStep).forEach(finishedTask=>{
//                 if (finishedTask.newItems)
//                     st.items = finishedTask.newItems
//                 finishedTask.items.forEach(item=>{
//                     const stItem = st.items.find(it=>it.pos == item.pos)
//                     stItem.iconQuality = finishedTask.icon ? finishedTask.llmQuality : 0
//                     stItem.cardQuality = finishedTask.card ? finishedTask.llmQuality : 0
//                     stItem.ctxVer = st.ctxVer
//                 })
//             })
//             st.runningTask = st.runningTask.filter(task.start+task.duration <= st.timeStep)
//             st.timeStep++
//             return st
//         }
//       }
// })

// component('taskForPolicy', {
//   type: 'task',
//   params: [
//     {id: 'order', as: 'number'},
//     {id: 'estimatedDuration', as: 'number'},
//     {id: 'mark', as: 'number'}
//   ]
// })


