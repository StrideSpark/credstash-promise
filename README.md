# credstash-promise
credstash client wrapper with promises and typescript types

## installation

```bash
npm install credstash-promise
```

## usage

```node
var credstash = require('credstash-promise');

credstash.get('secret-name').then(function(err, secret){
  console.log(err, secret);
});
```
