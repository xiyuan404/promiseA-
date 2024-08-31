/**
 * 返回promise实例，实现了then方法，接收成功和失败的回调
 * 异步操作， 成功resolve, 失败reject
 */

/**
 * 状态宏管理
 */

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

/**
 * @callStack
 * new Promise 调用构造函数，传入executor callback
 * 构造函数内部， 传入resolve和reject参数 执行executor callback
 */

const resolvePromise = function (promise, x, resolve, reject) {
  // 循环引用，自己等待自己完成
  if (promise === x) {
    // 用一个类型错误，结束掉 promise
    return reject(
      new TypeError(
        `[TypeError: Chaining cycle detected for promise #<myPromise>]`
      )
    )
  }

  // 判断 x 是否为对象(排除null情况)或函数
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called = false
    // 检索 x.then 可能会抛出异常
    try {
      // 检索 x.then
      let then = x.then
      // 判断 then 是否为函数
      // 这是最小判断，满足此条件后，认定为 promise 实例
      if (typeof then === 'function') {
        // 执行 x.then 会再次检索 then 属性，有风险发生错误
        then.call(
          x,
          (y) => {
            // 添加锁，避免成功后执行失败
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          (r) => {
            // 添加锁，避免失败后执行成功
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // then 方法不是函数，为普通值——{then:123}
        resolve(x)
      }
    } catch (e) {
      // 存在异常，执行 reject(e)
      // 添加锁，避免失败后执行成功
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 既不是对象也不是函数，说明是普通值，调用 resolve(x) 完成
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCbs = []
    this.onRejectedCbs = []
    const resolve = (val) => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = val
        // 依次执行收集的callback
        this.onResolvedCbs.forEach((cb) => cb())
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason

        this.onRejectedCbs.forEach((cb) => cb())
      }
    }
    try {
      executor(resolve, reject)
    } catch {
      reject(e)
    }
  }

  /**
   * 链式调用.then方法,传入onFulfilled方法
   */
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (e) => {
            throw e
          }
    const p2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(p2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(p2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      if (this.status === PENDING) {
        // 收集回调
        this.onResolvedCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(p2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(p2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return p2
  }
}

Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
