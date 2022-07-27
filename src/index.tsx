import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'donkey-lock-kit' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const DonkeyLockKit = NativeModules.DonkeyLockKit
  ? NativeModules.DonkeyLockKit
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export enum LogLevel {
  OFF,
  ERROR,
  INFO,
  DEBUG,
}

export enum Environment {
  TEST,
  LIVE,
}


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

/** 
 * Defines the log levels for the framework, can be done only before initializing SDK
 */
export function setLogLevel(logLevel: LogLevel) {
  return DonkeyLockKit.setLogLevel(logLevel);
}

/** 
 * Defines the server environment for the framework., can be done only before initializing SDK
 */
export function setEnvironment(environment: Environment) {
  return DonkeyLockKit.setEnvironment(environment === Environment.TEST);
}

/** 
 * In order to interact with Donkey bike locks, SDK must be initialized with the [sdkToken] provided by Donkey Republic.
 */
export function initializeSdk(
  sdkToken: string,
  callback: (result: Result) => void
) {
  return DonkeyLockKit.initializeSdk(sdkToken, callback);
}

/**
 * Initializing of lock has to be done before any `unlock`, `lock`, `prepareEndRental` or `finalizeLock`
 * This function needs to be called only once per rental
 * @param deviceName value of the given lock device name for bluetooth communication
 * @param key value of the valid eKey for the lock
 * @param passkey value associated with the provided e-key
 */
export function initializeLock(
  deviceName: string,
  key: string,
  passkey: string,
  callback: (result: Result) => void
) {
  return DonkeyLockKit.initializeLock(deviceName, key, passkey, callback);
}

/**
 * For locking a Donkey bike, use this function
 * @param deviceName value of the given lock device name for bluetooth communication
 */
export function lock(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.lock(deviceName, callback);
}

/**
 * For unlocking a Donkey bike, use this function
 * @param deviceName value of the given lock device name for bluetooth communication
 */
export function unlock(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.unlock(deviceName, callback);
}

/**
 * For preparing Donkey bike for end rental, use this function. `prepareEndRental` invokes checking of the lock state including
 * the `extra_lock_check` - necessary operation before ending rental to make sure the vehicle is safe from any misuse. 
 * In the case of lock being unlocked, this function will try to lock it as well.
 * Note however that this does not end the rental. Remember to call the required endpoint on TOMP.
 * @param deviceName value of the given lock device name for bluetooth communication
 */
export function prepareEndRental(
  deviceName: string,
  callback: (result: Result) => void
) {
  return DonkeyLockKit.prepareEndRental(deviceName, callback);
}

/**
 * Finalizing lock should be done after `prepareEndRental` to clear all the outstanding cache and disconnecting of the bluetooth lock.
 * Note that once the lock is finalized, it is not possible to do any more of lock actions.
 * @param deviceName value of the given lock device name for bluetooth communication
 */
export function finalizeLock(
  deviceName: string,
  callback: (result: Result) => void
) {
  return DonkeyLockKit.finalizeLock(deviceName, callback);
}
