extension('ui', 'userReqTx', {
  // interface - complete notification is done by calling complete OR completeByChildren
  userReqChildTx({ parent, ctx }) {
    return {
      next(renderingUpdate) {
        parent.next(renderingUpdate)
      },      
      complete(renderingUpdate) { 
        jb.log('userReqTx userReqChildTx complete',{ctx,renderingUpdate})
        this.completed = true
        renderingUpdate && this.next(renderingUpdate)
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
      updates: [],
      cb: jb.callbag.subject(userReq.reqId || userReq.widgetId),
      next(renderingUpdate) {
        this.updates.push(renderingUpdate)
        const {widgetId} = userReq
        const updatesCounter = jb.ui.headless[widgetId].updatesCounter = (jb.ui.headless[widgetId].updatesCounter || 0) + 1
        const txCounter = jb.ui.headless[widgetId].txCounter || 0
        jb.log(`headless widget delta out ${txCounter}-${updatesCounter}`, { widgetId, ctx, delta: renderingUpdate.delta })
        this.cb.next({userReq, ...renderingUpdate})
        ctx.vars.testRenderingUpdate && ctx.vars.testRenderingUpdate.next({userReq, ...renderingUpdate})
      },      
      complete(renderingUpdate) {
        if (this.updates.length == 0) return
        if (renderingUpdate)
          this.next({ userReq, ...renderingUpdate })
        const update = this.updates.length == 1 ? this.updates[0] : { $: 'updates', updates: this.updates }
        this.updates = []
        jb.log('userReqTx top complete',{ctx,update})
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
          this.complete()
      }
    }
  },
})