/*
* @Author: zll
* @Date:   2020-12-03 15:19:03
* @Last Modified by:   zll
* @Last Modified time: 2020-12-03 15:24:58
*/

(function () {
	var PENDING = 'pending';
	var FULFILLED = 'fulfilled';
	var REJECTED = 'rejected';
	function Promise(executor) {
	    var self = this;
	    self.PromiseState = PENDING;
	    self.PromiseResult = undefined
	    self.onFulfilled = [];//成功的回调
	    self.onRejected = []; //失败的回调
	    function resolve(value) {
	        if (self.PromiseState === PENDING) {
	            self.PromiseState = FULFILLED;
	            self.PromiseResult = value;
	            self.onFulfilled.forEach(fn => fn(self.PromiseResult));
	        }
	    }
	    function reject(reason) {
	        if (self.PromiseState === PENDING) {
	            self.PromiseState = REJECTED;
	            // self.reason = reason;
	            self.PromiseResult = reason;
	            self.onRejected.forEach(fn => fn(self.PromiseResult));
	        }
	    }

	    try {
	        executor(resolve, reject);
	    } catch (e) {
	        reject(e);
	    }
	}

	Promise.prototype={
		customize: true,
		constructor: Promise,
		then:function (onFulfilled, onRejected) {
			  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled :function (value) {
			  	return value
			  }
		    onRejected = typeof onRejected === 'function' ? onRejected : function (reason) {
		    	throw reason
		    }
		    var self = this;
		    var promise2 = new Promise((resolve, reject) => {
		        switch (self.PromiseState) {
						case FULFILLED:
							setTimeout(function() {
								try {
									let x = onFulfilled(self.PromiseResult);
									resolvePromise(promise2, x, resolve, reject);
								} catch (e) {
									reject(e);
								}
							})
							break
						case REJECTED:
							setTimeout(function() {
								try {
									let x = onRejected(self.PromiseResult);
									resolvePromise(promise2, x, resolve, reject);
								} catch (e) {
									reject(e);
								}
							});
							break
						default:
							self.onFulfilled.push(function() {
								setTimeout(() => {
									try {
										let x = onFulfilled(self.PromiseResult);
										resolvePromise(promise2, x, resolve, reject);
									} catch (e) {
										reject(e);
									}
								})
							})
							self.onRejected.push(function() {
								setTimeout(() => {
									try {
										let x = onRejected(self.PromiseResult);
										resolvePromise(promise2, x, resolve, reject);
									} catch (e) {
										reject(e);
									}
								})
							})
					}
		    });
		    return promise2;
		}
	}
	function resolvePromise(promise, x, resolve, reject) {
	    var self = this;
	    if (promise === x) {
	        reject(new TypeError('Chaiing cycle detected for promise #<promise>'));
	    }
	    if (x!= null && typeof x === 'object' || typeof x === 'function') {
	        var used; 
	        try {
	        	// 这里不给这个会报错
	            var then = x.then;
	            if (typeof then === 'function') {
	                then.call(x, function(y) {
	                    if (used) return;
	                    used = true;
	                    resolvePromise(promise, y, resolve, reject);
	                }, function(r) {
	                    if (used) return;
	                    used = true;
	                    reject(r);
	                });

	            }else{
	                if (used) return;
	                used = true;
	                resolve(x);
	            }
	        } catch (e) {
	            if (used) return;
	            used = true;
	            reject(e);
	        }
	    } else {
	        resolve(x);
	    }
	    
	}
	try {
		if (window !== undefined) {
			window.Promise = Promise
		}
		if (typeof module === 'object' &&typeof  module.export === 'object') {
			module.export  = Promise
		}
	}catch (e) {}
})()
var p1 = new Promise(function (resolve, reject) {
	resolve(10)
})
p1.then(res => {
	console.log(res)
	return res + 10
}).then(res => {
	console.log(res)
})
console.log(1)