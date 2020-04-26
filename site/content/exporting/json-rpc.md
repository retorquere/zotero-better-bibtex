---
title: JSON-RPC
weight: 14
---

You can call into BBT using [JSON-RPC](https://www.jsonrpc.org/) on the URL http://localhost:23119/better-bibtex/json-rpc . An example could look like:

```
curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "collection.scanAUX", "params": ["/My Library/thesis/article1", "/Users/phantom/Downloads/output.aux"] }'
```

The available methods are:

{{% json-rpc %}}
