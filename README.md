# credstash-promise
credstash client wrapper with promises and typescript types

## installation

```bash
npm install credstash-promise --save

#if you don't already refer to aws-sdk, you need to add it, it is a peer dependency:
npm install aws-sdk --save
```

## usage

```node
var credstash = require('credstash-promise');

credstash.get('secret-name').then(function(err, secret){
  console.log(err, secret);
});
```
