# Arweave-Likes

Every data transaction on Arweave should be capable of being liked by a user, just once and only once. Also, they should be capable of unliking an Arweave data transaction as well. This module provides the functionality to like a data transaction and unlike a data transaction.

> Browser Only

## API

* like
* unlike
* count

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


