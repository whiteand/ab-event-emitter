# ab-event-emitter

## Install

```
npm install ab-event-emitter
```

## Usage

```javascript
import { EventEmitter } from "ab-event-emitter";

const events = new EventEmitter();

events.on("message", (message) => {
  console.log(message);
});

events.emit("message", "something");
// console.log('something')
```

## API

```javascript

```

### `on(event: E, listener: (data: EventData) => void): () => void`

Subscribe `listener` to `event`.

`event` - any string

`listener` - function that takes some data associated with event and returns void

`<returned value>` - function that you can call in order to unsubscribe

### `off(event: E, listener: (data: EventData) => void): EventEmitter`

Unsubscribe `listener` from `event`.

`event` - any string

`listener` - function that takes some data associated with event and returns void

`<returned value>` - the event emitte.r

### `emit(event: E, data: EventData): EventEmitter`

Calls all listeners with `data` passed as the first parameter

### `offAll(): EventEmitter`

Unsubscribe from all events.

### `listenersNumber(event: E): number`

Returns number of listeners subscribed to `event`

### `getListenedEvents(): (keyof EventConfig)[]`

Returns array of events which have listeners

### `getListeners(event: E): ((data: EventData) => void)[]`

Returns array of listeners assigned to `event`
