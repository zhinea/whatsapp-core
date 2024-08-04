# High Available Whatsapp Service

## Initialize the services

```ts
import { createService, CreateServiceOptions } from "@zhinea/whatsapp-core";

const service = new createService(<CreateServiceOptions>{
    logger: 'info',
    database: {
        mongodb_uri: 'your-mongodb-uri',
        // example: 'mongodb+srv://user:pass@hostname/db?retryWrites=true&w=majority'
    }
})

// listen a new message
service.on('messages', function(data){
    console.log(data)
})

//send a message
service.getSock(instanceId)!.sendMessage(jid, {
    text: 'here text'
})
```

## All Events
| Event    | Description                                                                                                        |
|----------|--------------------------------------------------------------------------------------------------------------------|
| `logout` | Automatically triggered when an instance fails to connect or an <br/>instance manually logs out of their whatsapp. |
| `qrcode`   | is triggered when there is an instance that is making a pairing request. return a instanceId and qrcode string     |


### Types of Event
```ts
type Event = {
    logout: {
        instanceId: string
    },
    qrcode: {
        instanceId: string
        qr: string
    }
}
```

### Example

```ts
// ...
import { LogoutPayloadEvent } from "@zhinea/whatsapp-core";

service.on("logout", (data: LogoutPayloadEvent) => {
    console.log(data.instanceId)
})
```