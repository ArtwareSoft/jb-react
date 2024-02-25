component('chatRoom.list', {
  type: 'http-service',
  params: [],
  impl: ({}) => ({
    match: req => jb.http.getURLParam(req,'op') == 'connectToChartRoom',
    serve: req => {

    }
  })
})

// component('chatRoom.connect', {
//   type: 'http-service',
//   params: [],
//   impl: ({}) => ({
//     match: req => jb.http.getURLParam(req,'op') == 'connectToChartRoom',
//     serve: req => {
//         connect(role: A | B, chatRoomType, chatRoomName: optional -> if not given creates a new chatRoom)
//         list() - list all chat rooms with participants
      
//         const role =
//     }
//   })
// })