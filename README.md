# Arweave-Likes

Every data transaction on Arweave should be capable of being liked by a user, just once and only once. Also, they should be capable of unliking an Arweave data transaction as well. This module provides the functionality to like a data transaction and unlike a data transaction. As well as allowing the dApp to establish a price to like transactions for the creator. 

> Browser Only

## Init

* arweave : Arweave(JS)
* price : winston // amount each like and unlike costs

## API

* like
* unlike
* count
* subscribe fn // for events

## Challenges

The like and unlike functions must check for previous existing transactions for the given transaction id. And manage accordingly to prevent duplicate transactions. Of course duplicate transactions can occur outside of this package, but the count job must dedupe
the responses. 

Obviously with large datasets of likes querying and pagination will be slow and time consuming and annoying to the server. So an alternate approach is to allow the consumer of this package to inject a cache via the constructor, if injected then the like and unlike functions can write to a cache, and there can be a buildCache function that basically re-initializes the cache by performing pagination searches to re-sync the proper count.

So the injected cache must match a specific API so that any cache system can be injected into the `arweave-likes` package. 

``` js
{
  get(key),
  inc(key),
  dec(key),
  remove(key)
}
```

It is important that the count retrieves the count from the cache if possible, and get the last block height, then query arweave to get the newest transactions and update the count and dispatch another transaction to update the count.

Another important note is that it should cost some AR for each like and unlike, the AR should go to the creator/owner of the data item, and the count transactions should only find transactions of the like protocol that paid the amount of AR to the owner of the data.


