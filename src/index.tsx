import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'donkey-lock-kit' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const DonkeyLockKit = NativeModules.DonkeyLockKit ? NativeModules.DonkeyLockKit : new Proxy(
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

export type Result = { status: string, message?: string, detail?: string }

export type ConnectionUpdate = { code: string, description: string, initialSensor?: number, lockSwRevision?: string, rssi?: number }

export function setLogLevel(logLevel: LogLevel) {
  return DonkeyLockKit.setLogLevel(logLevel);
}

export function setEnvironment(environment: Environment) {
  return DonkeyLockKit.setEnvironment(environment === Environment.TEST);
}

export function initializeSdk(sdkToken: string, callback: (result: Result) => void) {
  return DonkeyLockKit.initializeSdk(sdkToken, callback);
}

export function initializeLock(deviceName: string, key: string, passkey: string, callback: (result: Result) => void) {
  return DonkeyLockKit.initializeLock(deviceName, key, passkey, callback);
}

export function lock(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.lock(deviceName, callback);
}

export function unlock(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.unlock(deviceName, callback);
}

export function prepareEndRental(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.prepareEndRental(deviceName, callback);
}

export function finalizeLock(deviceName: string, callback: (result: Result) => void) {
  return DonkeyLockKit.finalizeLock(deviceName, callback);
}
