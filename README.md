# donkey-lock-kit
Donkey Lock Kit for React Native
## Installation

```sh
npm install donkey-lock-kit
```

## Usage

```js
import {
  ConnectionUpdate,
  setLogLevel,
  LogLevel,
  setEnvironment,
  Environment,
  initializeSdk,
  initializeLock,
  lock,
  Result,
  unlock,
  prepareEndRental,
  finalizeLock,
} from 'donkey-lock-kit';

// ...
// optionally update the config values
setLogLevel(LogLevel.DEBUG)
setEnvironment(Environment.TEST)

// initialize the sdk
initializeSdk('<INSERT SDK TOKEN>', (result: Result) => { ... });

// initialize the lock before doing any other action with it (initialize only once)
initializeLock('<DEVICE_NAME>', '<KEY>', '<PASSKEY>', (result: Result) => { ... });

// example usage for unlocking
unlock('<DEVICE_NAME>', (result: Result) => { ... });

// listen for unlock updates
DeviceEventEmitter.addListener('onUnlockUpdate', (update: ConnectionUpdate) => { ... });

// example usage for locking
lock('<DEVICE_NAME>', (result: Result) => { ... });

// listen for lock updates
DeviceEventEmitter.addListener('onLockUpdate', (update: ConnectionUpdate) => { ... });

// example usage for preparing end rental
prepareEndRental('<DEVICE_NAME>', (result: Result) => { ... });

// listen for end rental updates
DeviceEventEmitter.addListener('onEndRentalUpdate', (update: ConnectionUpdate) => { ... });

// remember to finalize the lock when not having any more use for it (usually after end rental on TOMP)
finalizeLock('<DEVICE_NAME>', (result: Result) => { ... });
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
