package com.donkeylockkit

import bike.donkey.lockkit.DonkeyConfig
import bike.donkey.lockkit.DonkeyLockKit
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class DonkeyLockKitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "DonkeyLockKit"
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Int, b: Int, promise: Promise) {
    promise.resolve(a * b)
  }

  @ReactMethod
  fun initializeSdk(sdkToken: String, callback: Callback) {
    DonkeyLockKit.config.environment = DonkeyConfig.ServerEnvironment.TEST
    DonkeyLockKit.config.logLevel = DonkeyConfig.LogLevel.DEBUG
    DonkeyLockKit.initializeSdk(reactApplicationContext, sdkToken) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }
}
