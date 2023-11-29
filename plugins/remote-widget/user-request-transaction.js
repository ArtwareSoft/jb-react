extension('ui', 'userReqTx', {
  initExtension() {
    return { userReqTxCounter: 0}
  },
  // interface - complete notification is done by calling complete OR completeByChildren
  userReqChildTx({ parent, ctx }) {
    return {
      next(renderingUpdate) {
        parent.next(renderingUpdate)
      },      
      complete(logTxt) { 
        jb.log(`userReqTx userReqChildTx complete ${logTxt}`,{ctx})
        this.completed = true
        parent.childCompleteNotfication(this)
      },

      completeByChildren(tActions, ctx) {
        this.childrenLeft = tActions.length
        tActions.forEach(childtAction=>
          childtAction(ctx.setVars({ userReqTx: jb.ui.userReqChildTx({ parent: this, ctx }) })))
      },
      childCompleteNotfication(callerChild) {
        jb.log('userReqTx userReqChildTx childCompleteNotfication',{ctx,callerChild, childrenLeft: this.childrenLeft})
        if (this.childrenLeft == null)
          jb.logError('childCompleteNotfication called before completeByChildren',{ctx})
        this.childrenLeft--;
        if (this.childrenLeft < 1) {
          this.completed = true
          parent.childCompleteNotfication(this)
        }
      },      
    }
  },

  userReqTx({ userReq, ctx }) {
    return {
      id: jb.ui.userReqTxCounter++,
      updates: [],
      cb: jb.callbag.subject(userReq.reqId || userReq.widgetId),
      next(renderingUpdate) {
        this.updates.push(renderingUpdate)
        const {widgetId} = userReq
        const updatesCounter = jb.ui.headless[widgetId].updatesCounter = (jb.ui.headless[widgetId].updatesCounter || 0) + 1
        const txCounter = jb.ui.headless[widgetId].txCounter || 0
        jb.log(`userReqTx delta ${txCounter}-${updatesCounter}`, { widgetId, ctx, renderingUpdate, delta: renderingUpdate.delta })
        this.cb.next({userReq, ...renderingUpdate})
        ctx.vars.testRenderingUpdate && ctx.vars.testRenderingUpdate.next({userReq, ...renderingUpdate})
      },      
      complete(logTxt) {
        //if (this.updates.length == 0) return
        const update = this.updates.length == 0 ? [] : this.updates.length == 1 ? this.updates[0] : { $: 'updates', updates: this.updates }
        this.updates = []
        jb.log(`userReqTx top complete ${logTxt}`,{ctx,update})
        this.onCompleteHandler && this.onCompleteHandler(update)
        const { widgetId } = userReq
        jb.ui.headless[widgetId].txCounter = (jb.ui.headless[widgetId].txCounter || 0) + 1
      },
      onComplete(handler) {
        this.onCompleteHandler = handler
      },
      completeByChildren(tActions, ctx) {
        this.childrenLeft = tActions.length
        tActions.forEach(childtAction=>
          childtAction(ctx.setVars({ userReqTx: jb.ui.userReqChildTx({ parent: this, ctx }) })))
      },
      childCompleteNotfication(callerChild) {
        jb.log('userReqTx top childCompleteNotfication',{ctx,callerChild, childrenLeft: this.childrenLeft})
        if (this.childrenLeft == null)
          jb.logError('childCompleteNotfication called before completeByChildren',{ctx})
        this.childrenLeft--;
        if (this.childrenLeft < 1)
          this.complete('last child')
      }
    }
  },
})