import crocks from 'crocks'
import * as R from 'ramda'

const { Async } = crocks
const { compose, equals, find, map, path, pluck, prop, propEq, reduce, reject, uniq } = R

/**
 * @param {Arweave} arweave
 */
export default function (arweave) {
  const post = Async.fromPromise(arweave.api.post.bind(arweave.api))
  const gql = query => post('graphql', { query })

  const createTx = Async.fromPromise(arweave.createTransaction.bind(arweave))
  const dispatch = Async.fromPromise(async (tx) => {
    if (global.arweaveWallet) {
      return await arweaveWallet.dispatch(tx)
    }
    await arweave.transactions.sign(tx)
    await arweave.transactions.post(tx)
  })

  /**
   * @param {string} tx - transaction id
   */
  function load(tx) {

  }

  return Object.freeze({
    load,
    like,
    unlike,
    count
  })
}

function likesQuery(tx) {
  return `
query {
  transactions()
}
  `
}