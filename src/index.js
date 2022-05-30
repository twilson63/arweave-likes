import crocks from 'crocks'
import * as R from 'ramda'

const { Async } = crocks
const { compose, equals, find, map, path, pluck, prop, propEq, reduce, reject, uniq } = R

/**
 * @param {Arweave} arweave
 * @param {string} price - price to like a transaction
 * @param {Cache} cache? - cache service that supports get, set, remove, query
 */
export default function (arweave, price, cache) {
  const post = Async.fromPromise(arweave.api.post.bind(arweave.api))
  const gql = query => post('graphql', { query })
  // const cacheInc = ({ id }) => Async.fromPromise(cache.inc.bind(cache))(id)
  // const cacheDec = ({ id }) => Async.fromPromise(cache.dec.bind(cache))(id)

  const createTx = Async.fromPromise(arweave.createTransaction.bind(arweave))
  const dispatch = Async.fromPromise(async (tx) => {
    if (global.arweaveWallet) {
      return await arweaveWallet.dispatch(tx)
    }
    return Promise.reject(new Error('Only supports arweaveWallet environments'))
  })

  /**
   * @param {string} txId - transaction id
   * @param {string} walletAddress
   */
  function like(txId, walletAddress) {
    return Async.of({ tx: txId, addr: walletAddress })
      .chain(canLike)
      .map(data => ({ data, target: data.owner, quantity: price }))
      .chain(createTx)
      .map(tx => {
        tx.addTag('Content-Type', 'application/json')
        tx.addTag('Protocol', 'Likes')
        tx.addTag('TxId', txId)
      })
      .chain(dispatch)
      .chain(cacheIncrement)
      .toPromise()

  }

  /**
   * @param {string} txId - transaction id
   * @param {string} walletAddress
   */
  function unlike(txId, walletAddress) {
    return Async.of({ tx: txId, addr: walletAddress, status: 'inactive' })
      .chain(canUnlike)
      .map(data => ({ data, target: data.owner, quantity: price }))
      .chain(createTx)
      .map(tx => {
        tx.addTag('Content-Type', 'application/json')
        tx.addTag('Protocol', 'likes')
        tx.addTag('TxId', txId)
        tx.addTag('Status', 'inactive')
      })
      .chain(dispatch)
      .toPromise()

  }

  function count(txId) {
    return Async.of(txId)
      // cache get
      // if not null send number and queue recount

      .toPromise()
  }

  return Object.freeze({
    like,
    unlike,
    count
  })
}

function buildLikesQuery(price) {
  return function (tx) {
    return `
query {
  transactions(
    first: 100,
    tags: [
    {name: "Protocol", values: ["Likes"]},
    {name: "TxId", values: ["${tx}"]}
  ], quantity: "${price}") {
    edges {
      node {
        id
        quantity
        target
        tags {
          name
          value
        }
      }
    }
  }
}
  `
  }
}