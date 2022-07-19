package com.donkeylockkit

import bike.donkey.lockkit.DonkeyConfig
import bike.donkey.lockkit.DonkeyLockKit
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class DonkeyLockKitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "DonkeyLockKit"
  }

  @ReactMethod
  fun setEnvironment(isTestEnvironment: Boolean) {
    DonkeyLockKit.config.environment =
      if (isTestEnvironment) DonkeyConfig.ServerEnvironment.TEST else DonkeyConfig.ServerEnvironment.LIVE
  }

  @ReactMethod
  fun setLogLevel(logLevel: Int) {
    DonkeyLockKit.config.logLevel = when(logLevel) {
      1 -> DonkeyConfig.LogLevel.ERROR
      2 -> DonkeyConfig.LogLevel.INFO
      3 -> DonkeyConfig.LogLevel.DEBUG
      else -> DonkeyConfig.LogLevel.OFF
    }
  }

  @ReactMethod
  fun initializeSdk(sdkToken: String, callback: Callback) {
    DonkeyLockKit.initializeSdk(reactApplicationContext, sdkToken) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }

  @ReactMethod
  fun initializeLock(deviceName: String, key: String, passkey: String, callback: Callback) {
    DonkeyLockKit.initializeLock(deviceName, key, passkey) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }

  @ReactMethod
  fun lock(deviceName: String, callback: Callback) {
    DonkeyLockKit.lock(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onLockUpdate", it.description)
    }) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }

  @ReactMethod
  fun unlock(deviceName: String, callback: Callback) {
    DonkeyLockKit.unlock(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onUnlockUpdate", it.description)
    }) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }

  @ReactMethod
  fun prepareEndRental(deviceName: String, callback: Callback) {
    DonkeyLockKit.prepareEndRental(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onEndRentalUpdate", it.description)
    }) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }

  @ReactMethod
  fun finalizeLock(deviceName: String, callback: Callback) {
    DonkeyLockKit.finalizeLock(deviceName) { result ->
      result.fold(
        onSuccess = { callback("Success") },
        onFailure = { callback(it.message) }
      )
    }
  }
}
