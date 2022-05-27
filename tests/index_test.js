import { test } from 'uvu'
import * as assert from 'uvu/assert'
import Arweave from 'arweave'
import Likes from '../src/index.js'
import ArLocal from 'arlocal'

test('likes test', async () => {
  const arLocal = new ArLocal.default()

  await arLocal.start()

  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  })

  const w = await arweave.wallets.generate()
  const addr = await arweave.wallets.jwtToAddress(w)
  await arweave.api.get(`mint/${addr}/${arweave.ar.arToWinston('100')}`)
  global.arweaveWallet = {
    async dispatch(tx) {
      const id = tx._id
      await arweave.transactions.sign(tx, w)
      await arweave.transactions.post(tx)
      return tx
    }
  }

  const testDoc = await arweave.createTransaction({ data: 'Hello World' })
  const { id } = await arweaveWallet.dispatch(testDoc)
  const _likes = Likes(arweave)
  await _likes.like(id)
  const likes = await _likes.load(id)


  assert.equal(likes, 1)

  await arLocal.stop()
})

test.run()