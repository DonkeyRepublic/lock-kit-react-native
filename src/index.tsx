import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'donkey-lock-kit' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const DonkeyLockKit = NativeModules.DonkeyLockKit  ? NativeModules.DonkeyLockKit  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return DonkeyLockKit.multiply(a, b);
}

export function initializeSdk(sdkToken: string, callback: Function) {
  return DonkeyLockKit.initializeSdk(sdkToken, callback);
}
