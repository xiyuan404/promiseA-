const Promise = require('./promise')

const { readFile } = require('./test-utils')

describe('core', () => {
  test('异步处理', (done) => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('异步数据')
      }, 1000)
    })

    p.then((data) => {
      expect(data).toBe('异步数据') // 验证返回值是否正确
      done() // 确保 Jest 知道测试完成
    })
  })

  test('p.then是同步的,then中的回调是异步的', () => {
    let syncExecuted = false // 用于追踪同步代码是否已经执行
    p = new Promise((resolve, reject) => {
      resolve(1)
    })
    p.then((data) => {
      expect(syncExecuted).toBe(true)
    })

    syncExecuted = true
  })

  test('then may be called multiple times on the same promise.', () => {})
})

describe('链式调用', () => {
  /**
   * 返回值透传到下一次链式调用，避免深层嵌套
   */
  test('happy path', () => {
    const expectedData = {
      domain: 'github.io',
      path: '/docs',
    }
    readFile('./config.json')
      .then((data) => {
        expect(data).toEqual(expectedData)
        return 'return'
      })
      .then((data) => {
        expect(data).toBe('return')
        done()
      })
  })

  test('throw error', () => {
    const expectedData = {
      domain: 'github.io',
      path: '/docs',
    }
    readFile('./config.json')
      .then((data) => {
        expect(data).toEqual(expectedData)
        throw new Error('woops!something went wrong')
      })
      .then(
        () => {},
        (reason) => {
          expect(reason).toBe('woops!something went wrong')
        }
      )
  })
})

describe('Promise Resolution Procedure', () => {
  /**
   * then callback return value process
   */
  test('如果 promise 和 x 引用的同一对象，则以 TypeError 理由拒绝 (避免循环引用)', () => {
    const p = new Promise((resolve, reject) => {
      resolve(1)
    })

    p.then((data) => {
      return p
    }).then(null, (err) => {
      expect(err).toBe(
        '[TypeError: Chaining cycle detected for promise #<Promise>]'
      )
    })
  })

  test('如果 x 是一个 promise ，采用它的状态', () => {})

  test('递归解析', () => {})
})
