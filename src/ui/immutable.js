(function() {

class ImmutableWithPath {
  constructor(resources) {
    this.resources = resources;
    this.resourceVersions = {};
    this.pathId = 0;
    this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])];
    this.resourceChange = new jb.rx.Subject();
    jb.delay(1).then(_=>jb.ui.originalResources = jb.resources)
  }
  val(ref) {
    if (ref == null) return ref;
    if (ref.$jb_val) return ref.$jb_val();
    if (!ref.$jb_path) return ref;
    if (ref.handler != this)
      return ref.handler.val(ref)

    var resource = ref.$jb_path[0];
    if (ref.$jb_resourceV == this.resourceVersions[resource])
      return ref.$jb_cache;
    this.refresh(ref);
    if (ref.$jb_invalid)
      return null;
    return ref.$jb_cache = ref.$jb_path.reduce((o,p)=>o[p],this.resources());
  }
  writeValue(ref,value,srcCtx) {
    if (!ref)
      return jb.logError('writeValue: null ref');
    if (this.val(ref) === value) return;
    jb.logPerformance('writeValue',value,ref,srcCtx);
    if (ref.$jb_val)
      return ref.$jb_val(value);
    return this.doOp(ref,{$set: value},srcCtx)
  }
  splice(ref,args,srcCtx) {
    return this.doOp(ref,{$splice: args },srcCtx)
  }
  move(fromRef,toRef,srcCtx) {
    var sameArray = fromRef.$jb_path.slice(0,-1).join('~') == toRef.$jb_path.slice(0,-1).join('~');
    var fromIndex = Number(fromRef.$jb_path.slice(-1));
    var toIndex = Number(toRef.$jb_path.slice(-1));
    var fromArray = this.refOfPath(fromRef.$jb_path.slice(0,-1)),toArray = this.refOfPath(toRef.$jb_path.slice(0,-1));
    if (isNaN(fromIndex) || isNaN(toIndex))
        return jb.logError('move: not array element',fromRef,toRef);

    var valToMove = jb.val(fromRef);
    if (sameArray) {
        if (fromIndex < toIndex) toIndex--; // the deletion changes the index
        return this.doOp(fromArray,{$splice: [[fromIndex,1],[toIndex,0,valToMove]] },srcCtx)
    }
    var events = [
        this.doOp(fromArray,{$splice: [[fromIndex,1]] },srcCtx,true),
        this.doOp(toArray,{$splice: [[toIndex,0,valToMove]] },srcCtx,true),
    ]
    events.forEach(opEvent=>{
        this.refresh(opEvent.ref,opEvent);
        opEvent.newVal = this.val(opEvent.ref);
        this.resourceChange.next(opEvent)
    })
  }
  push(ref,value,srcCtx) {
    return this.doOp(ref,{$push: value},srcCtx)
  }
  merge(ref,value,srcCtx) {
    return this.doOp(ref,{$merge: value},srcCtx)
  }
  doOp(ref,opOnRef,srcCtx,doNotNotify) {
    if (!this.isRef(ref))
      ref = this.asRef(ref);
    if (!ref) return;
    var oldRef = Object.assign({},ref);

    if (!this.refresh(ref)) return;
    if (ref.$jb_path.length == 0)
      return jb.logError('doOp: ref not found');

    var op = {}, resource = ref.$jb_path[0], oldResources = this.resources();
    var deleteOp = typeof opOnRef.$set == 'object' && opOnRef.$set == null;
    jb.path(op,ref.$jb_path,opOnRef); // create op as nested object
    this.markPath(ref.$jb_path);
    var opEvent = {op: opOnRef, path: ref.$jb_path, ref: ref, srcCtx: srcCtx, oldVal: jb.val(ref),
        oldRef: oldRef, resourceVersionsBefore: this.resourceVersions, timeStamp: new Date().getTime()};
    this.resources(jb.ui.update(this.resources(),op),opEvent);
    this.resourceVersions = Object.assign({},this.resourceVersions,jb.obj(resource,this.resourceVersions[resource] ? this.resourceVersions[resource]+1 : 1));
    this.restoreArrayIds(oldResources,this.resources(),ref.$jb_path); // 'update' removes $jb_id from the arrays at the path.
    opEvent.resourceVersionsAfter = this.resourceVersions;
    if (opOnRef.$push)
      opEvent.insertedPath = opEvent.path.concat([opEvent.oldVal.length]);
    if (deleteOp) {
      if (ref.$jb_path.length == 1) // deleting a resource - remove from versions and return
        return delete this.resourceVersions[resource];
      try {
        var parent = ref.$jb_path.slice(0,-1).reduce((o,p)=>o[p],this.resources());
        if (parent)
          delete parent[ref.$jb_path.slice(-1)[0]]
      } catch(e) {
        jb.logException('delete',e);
      }
    }
    if (!doNotNotify) {
        this.refresh(ref,opEvent);
        opEvent.newVal = this.val(ref);
        this.resourceChange.next(opEvent);
    }
    return opEvent;
  }
  restoreArrayIds(from,to,path) {
    if (from && to && from.$jb_id && Array.isArray(from) && Array.isArray(to) && !to.$jb_id && typeof to == 'object')
      to.$jb_id = from.$jb_id;
    if (path.length > 0)
      this.restoreArrayIds(from[path[0]], to[path[0]], path.slice(1))
  }
  asRef(obj,hint) {
    if (!obj) return obj;
    if (obj && (obj.$jb_path || obj.$jb_val))
        return obj;

    var path;
    if (hint && hint.resource) {
      var res = this.pathOfObject(obj,this.resources()[hint.resource]);
      path = res && [hint.resource].concat(res);
    }
    path = path || this.pathOfObject(obj,this.resources()); // try without the hint

    if (path)
      return {
        $jb_path: path,
        $jb_resourceV: this.resourceVersions[path[0]],
        $jb_cache: path.reduce((o,p)=>o[p],this.resources()),
        handler: this,
      }
    return obj;
  }
  isRef(ref) {
    return ref && (ref.$jb_path || ref.$jb_val);
  }
  objectProperty(obj,prop) {
    if (!obj)
      return jb.logError('objectProperty: null obj');
    var objRef = this.asRef(obj);
    if (objRef && objRef.$jb_path) {
      return {
        $jb_path: objRef.$jb_path.concat([prop]),
        $jb_resourceV: objRef.$jb_resourceV,
        $jb_cache: objRef.$jb_cache[prop],
        $jb_parentOfPrim: objRef.$jb_cache,
        handler: this,
      }
    } else {
      return obj[prop]; // not reffable
    }
  }
  refresh(ref,lastOpEvent,silent) {
    if (!ref) debugger;
    try {
      var path = ref.$jb_path, new_ref = {};
      if (!path)
        return !silent && jb.logError('refresh: empty path');
      var currentVersion = this.resourceVersions[path[0]] || 0;
      if (path.length == 1) return true;
      if (currentVersion == ref.$jb_resourceV) return true;
      if (currentVersion == ref.$jb_resourceV + 1 && lastOpEvent && typeof lastOpEvent.op.$set != 'undefined') {
        var res = this.refOfPath(ref.$jb_path,silent); // recalc ref by path
        if (res)
          return Object.assign(ref,res)
        ref.$jb_invalid = true;
        return !silent && jb.logError('refresh: parent not found: '+ path.join('~'));
      }

      if (ref.$jb_parentOfPrim) {
        var parent = this.asRef(ref.$jb_parentOfPrim,{resource: path[0]});
        if (!parent || !this.isRef(parent)) {
          this.asRef(ref.$jb_parentOfPrim,{resource: path[0]}); // for debug
          ref.$jb_invalid = true;
          return !silent && jb.logError('refresh: parent not found: '+ path.join('~'));
        }
        var prop = path.slice(-1)[0];
        new_ref = {
          $jb_path: parent.$jb_path.concat([prop]),
          $jb_resourceV: this.resourceVersions[path[0]],
          $jb_cache: parent.$jb_cache && parent.$jb_cache[prop],
          $jb_parentOfPrim: parent.$jb_path.reduce((o,p)=>o[p],this.resources()),
          handler: this,
        }
      } else {
        var object_path_found = ref.$jb_cache && this.pathOfObject(ref.$jb_cache,this.resources()[path[0]]);
        if (!object_path_found) {
          this.pathOfObject(ref.$jb_cache,this.resources()[path[0]]);
          ref.$jb_invalid = true;
          return !silent && jb.logError('refresh: object not found: ' + path.join('~'));
        }
        var new_path = [path[0]].concat(object_path_found);
        if (new_path) new_ref = {
          $jb_path: new_path,
          $jb_resourceV: this.resourceVersions[new_path[0]],
          $jb_cache: new_path.reduce((o,p)=>o[p],this.resources()),
          handler: this,
        }
      }
      Object.assign(ref,new_ref);
    } catch (e) {
       ref.$jb_invalid = true;
       return !silent && jb.logException(e,'ref refresh ',ref);
    }
    return true;
  }
  refOfPath(path,silent) {
      try {
        var val = path.reduce((o,p)=>o[p],this.resources());
        if (val == null || typeof val != 'object' || Array.isArray(val))
          var parent = path.slice(0,-1).reduce((o,p)=>o[p],this.resources());
        else
          var parent = null

        return {
            $jb_path: path,
            $jb_resourceV: this.resourceVersions[path[0]],
            $jb_cache: val,
            $jb_parentOfPrim: parent,
            handler: this,
          }
      } catch (e) {
        if (!silent)
          jb.logException(e,'ref from path ' + path);
      }
  }
  markPath(path) {
    var leaf = path.reduce((o,p)=>{
      o.$jb_id = o.$jb_id || (++this.pathId);
      return o[p]
    }, this.resources());
    if (leaf && typeof leaf == 'object')
      leaf.$jb_id = leaf.$jb_id || (++this.pathId);
  }
  pathOfObject(obj,lookIn,depth) {
    if (!obj || !lookIn || typeof lookIn != 'object' || typeof obj != 'object' || lookIn.$jb_path || lookIn.$jb_val || depth > 50)
      return;
    if (this.allowedTypes.indexOf(Object.getPrototypeOf(lookIn)) == -1)
      return;

    if (lookIn === obj || (lookIn.$jb_id && lookIn.$jb_id == obj.$jb_id))
      return [];
    for(var p in lookIn) {
      var res = this.pathOfObject(obj,lookIn[p],(depth||0)+1);
      if (res)
        return [p].concat(res);
    }
  }
  // valid(ref) {
  //   return ref.$jb_path && ref.$jb_path.filter(x=>!x).length == 0;
  // }
  refObservable(ref,cmp,settings) {
    if (ref && ref.$jb_observable)
      return ref.$jb_observable(cmp);
    if (!ref || !this.isRef(ref))
      return jb.rx.Observable.of();
    if (ref.$jb_path) {
      return this.resourceChange
        .takeUntil(cmp.destroyed)
        .filter(e=>
            e.ref.$jb_path[0] == ref.$jb_path[0])
        .filter(e=> {
          this.refresh(ref,e,true);
          if (settings && settings.throw && ref.$jb_invalid)
            throw 'invalid ref';
          var path = e.ref.$jb_path;
          var changeInParent = (ref.$jb_path||[]).join('~').indexOf(path.join('~')) == 0;
          if (settings && settings.includeChildren)
            return changeInParent || path.join('~').indexOf((ref.$jb_path||[]).join('~')) == 0;
          return changeInParent;
        })
        .distinctUntilChanged((e1,e2)=>
          e1.newVal == e2.newVal)
    }
    return jb.rx.Observable.of(jb.val(ref));
  }
}

function resourcesRef(val) {
  if (typeof val == 'undefined')
    return jb.resources;
  else
    jb.resources = val;
}

jb.valueByRefHandler = new ImmutableWithPath(resourcesRef);

jb.ui.refObservable = (ref,cmp,settings) =>
  jb.refHandler(ref).refObservable(ref,cmp,settings);

jb.ui.ImmutableWithPath = ImmutableWithPath;
jb.ui.resourceChange = jb.valueByRefHandler.resourceChange;

jb.ui.pathObservable = (path,handler,cmp) => {
  var ref = handler.refOfPath(path.split('~'));
  return handler.resourceChange
    .takeUntil(cmp.destroyed)
    .filter(e=>
        path.indexOf(e.oldRef.$jb_path.join('~')) == 0)
    .map(e=> {
    handler.refresh(ref,e,true);
    if (!ref.$jb_invalid)
        return ref.$jb_path.join('~')
    })
    .filter(newPath=>newPath != path)
    .take(1)
    .map(newPath=>({newPath: newPath, oldPath: path}))
}

jb.cleanRefHandlerProps = function(obj) {
  if (typeof obj != 'object') return obj;
  var out = Array.isArray(obj) ? [] : {};
  jb.entries(obj).forEach(e=>{
    if (e[0].indexOf('$jb_') == 0) return;
    if (e[1] && typeof e[1] == 'object')
      out[e[0]] = jb.cleanRefHandlerProps(e[1]);
    else
      out[e[0]] = e[1]
  })
  return out;
}


})()
