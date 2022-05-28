import crocks from 'crocks'
import * as R from 'ramda'

const { Async } = crocks
const { compose, equals, find, map, path, pluck, prop, propEq, reduce, reject, uniq } = R

/**
 * @param {Arweave} arweave
 * @param {string} price - price to like a transaction
 * @param {Cache} cache - cache service that supports get, set, remove, query
 */
export default function (arweave, price) {
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
   * @param {string} txId - transaction id
   * @param {string} walletAddress
   */
  function like(txId, walletAddress) {
    return Async.of({ tx: txId, addr: walletAddress })
      .chain(canLike)
      .chain(createTx)
      .map(tx => {
        tx.addTag('Content-Type', 'application/json')
        tx.addTag('Protocol', 'likes')
        tx.addTag('TxId', txId)
      })
      .chain(dispatch)

  }

  /**
   * @param {string} txId - transaction id
   * @param {string} walletAddress
   */
  function unlike(txId, walletAddress) {
    return Async.of({ tx: txId, addr: walletAddress, status: 'inactive' })
      .chain(canUnlike)
      .chain(createTx)
      .map(tx => {
        tx.addTag('Content-Type', 'application/json')
        tx.addTag('Protocol', 'likes')
        tx.addTag('TxId', txId)
        tx.addTag('Status', 'inactive')
      })
      .chain(dispatch)

  }

  return Object.freeze({
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