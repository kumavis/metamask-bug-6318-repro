const Web3 = require('web3')
const timeout = (duration) => new Promise(resolve => setTimeout(resolve, duration))

start().catch(console.error)

async function start () {
  await ethereum.enable()
  
  doItManually()
  // doItWithWeb3js()
}

// function doItWithWeb3js () {
//   const web3 = new Web3(ethereum)
//   web3.eth.filter('latest', (error, result) => {
//     console.error(error)
//     console.log(result)
//   })
// }

async function doItManually () {
  const rpc = createRpcWrapper(ethereum)
  const filterId = await rpc.eth_newBlockFilter()
  console.log(filterId)

  while (true) {
    const changes = await rpc.eth_getFilterChanges(filterId)
    changes.forEach((blockHash) => console.log('saw block with hash', blockHash))
    await timeout(1000)
  }
}

function createRpcWrapper (provider) {
  let reqId = 0

  return new Proxy({}, {
    get (_, method) {
      return makeRequest.bind(null, method)
    }
  })

  function makeRequest(method, ...params) {
    let resolve, reject, promise = new Promise((...args) => { resolve = args[0], reject = args[1] })
    const req = { id: reqId++, jsonrpc: '2.0', method, params }
    provider.sendAsync(req, (err, res) => {
      if (err) return reject(err)
      if (res.error) return reject(res.error)
      resolve(res.result)
    })
    return promise
  }
}