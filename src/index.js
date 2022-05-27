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

  return Object.freeze({
    load,
    like,
    unlike,
    likes
  })
}