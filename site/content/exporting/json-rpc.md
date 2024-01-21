---
title: JSON-RPC
weight: 14
---

You can call into BBT using [JSON-RPC](https://www.jsonrpc.org/) on the URL http://localhost:23119/better-bibtex/json-rpc . An example could look like:

```bash
curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "collection.scanAUX", "params": ["/My Library/thesis/article1", "/Users/phantom/Downloads/output.aux"] }'
```

The available methods are:

{{% json-rpc %}}

mind that the `items.export` method had a bug where it would double-wrap the JSON-RPC response; the extra layer has been removed in 6.7.143, but if you were expecting the previous result you will have to update your code.
