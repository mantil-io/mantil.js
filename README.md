# mantil.js

mantil.js is a JavaScript SDK for developing Mantil applications.

## Instalation

```
npm install @mantil-io/mantil.js
```

## Using the WebSocket API

Using this SDK we can easily connect to a WebSocket endpoint of a mantil project.

To connect, use the `createWsApi` method:
```
import { createWsApi } from '@mantil-io/mantil.js';

const api = createWsApi();
```

This will attempt to find the API URL using the global variable `mantilEnv` (see [here](https://github.com/mantil-io/mantil.js/blob/master/src/global.d.ts#L10)). Mantil will add a `mantil_env.js` script which defines this variable to the root of every deployed static website, so you can just include it in your `public/index.html` file:
```
<script type="text/javascript" src="/mantil_env.js"></script>
```

Alternatively, you can pass a custom URL to the `createWsApi` function:
```
const api = createWsApi('wss://...');
```

Now you can use the `api` object to:
1. Subscribe to subjects:
```
api.subscribe('subject', message => console.log(message));
```
2. Invoke api methods:
```
const rsp = await api.request('ping.default');
console.log(rsp);
```
This will invoke the `default` method of the `ping` API.