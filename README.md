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

## Types

### Result

```js
/**
 * Result type for all asynchronous actions in DonkeyLockKit library
 */
export type Result = {
  /**
   * "success" or "failure"
   */
  status: string;
  /**
   * error code for failure status, possible values:
   * "ongoing_action" - While having one lock action in progress and try to perform another one. Note that when this error is thrown, it doesn't stop the original action.
   * "uninitialized_sdk" - When trying to perform any action while initializeSdk was not called with valid sdk token. It can also be thrown when initializeSdk uses unauthorized sdkToken.
   * "out_of_keys" - When eKey has run out of the available commands for performing action on the lock. Please use new eKey if this occurs.
   * "bluetooth_off" - Bluetooth is turned off on the phone device, notify user to enable it in order to perform the action.
   * "bluetooth_unauthorized" - The app does not have bluetooth permission, notify user to allow using bluetooth in order to perform the action.
   * "location_off" - [Android only] Location Services are turned off on the phone device, notify user to enable it in order to perform the action.
   * "location_permission" - [Android only] The app does not have location permission, notify user to allow using of location in order to perform the action.
   * "offline_during_pickup" - During the first unlock for the eKey, the app should be online to determine whether it was properly picked up. If not, this error gets thrown.
   * "search_timeout" - The app could not find the advertisement of the searched bluetooth device
   * "connection_timeout" - The app could not establish connection to the bluetooth device due to it taking too long. Notify user to keep the phone close to the bluetooth device and try again.
   * "unlock_timeout" - The bluetooth device didn't unlock in specified time
   * "lock_timeout" - The bluetooth device wasn't locked in specified time. Notify the user to physically push the lock to lock it when trying to perform lock again.
   * "post_connection_lock_check_failed" - During special conditions, this error can be thrown upon reading characteristics when lock isn't properly locked.
   * "extra_lock_check_failed" - `extra_lock_check` connection update, the lock device unlocks
   * "fatal_error" - When unexpected error shows up during processes not related to establishing connection. Check detail to find out more information.
   */
  code?: string;
  /**
   * optional message to determine deeper cause of the error, e.g. original error message for "fatal_error"
   */
  detail?: string;
};
```

### ConnectionUpdate

```js
/**
 * Type to notify client application about the progress of the relevant lock functions (unlock, lock, prepareEndRental).
 * Add listener through `DeviceEventEmitter.addListener` with proper type:
 *  * onLockUpdate for lock action
 *  * onUnlockUpdate for unlock action
 *  * onEndRentalUpdate for prepareEndRental action
 */
export type ConnectionUpdate = {
  /**
   * code informing about progress and current stage of the action, possible values:
   * "searching" - The app has initiated bluetooth scan for the particular bluetooth device
   * "weak_signal" - The searched device has been found, but the signal strength of the advertisement is too weak and therefore cannot establish connection yet.
   * "connecting" - The searched device has been found and is close enough to establish connection. The app has initiated establishing of connection to the particular bluetooth device.
   * "connected" - The connection to the bluetooth device has been established. Note that if the device has been previously connected, this update will be called at the start of any `unlock`, `lock`, or `prepareEndRental`.
   * "reading_lock_data" - The app has read the characteristic data from the bluetooth device in order to determine next action.
   * "sending_command" - The app has sent eKey data to the bluetooth device to perform the desired action.
   * "push_to_lock" - The bluetooth device notified the app it had enabled the lock mechanism and user needs to manually push the lock to lock it.
   * "extra_lock_check" - During `prepareEndRental` after making sure the device is properly locked the app does `extra_lock_check` to make sure it stays locked.
   */
  code: string;
  /**
   * value describing each code for logging purposes
   */
  description: string;
  /**
   * optional value for "weak_signal" code with rssi signal strength
   */
  rssi?: number;
};
```

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
