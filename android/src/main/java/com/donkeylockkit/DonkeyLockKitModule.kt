package com.donkeylockkit

import bike.donkey.lockkit.DonkeyConfig
import bike.donkey.lockkit.DonkeyLockKit
import bike.donkey.lockkit.errors.LockError
import bike.donkey.lockkit.errors.OngoingActionError
import bike.donkey.lockkit.errors.UninitializedSdkError
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.locks.Lock

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
    DonkeyLockKit.config.logLevel = when (logLevel) {
      1 -> DonkeyConfig.LogLevel.ERROR
      2 -> DonkeyConfig.LogLevel.INFO
      3 -> DonkeyConfig.LogLevel.DEBUG
      else -> DonkeyConfig.LogLevel.OFF
    }
  }

  @ReactMethod
  fun initializeSdk(sdkToken: String, callback: Callback) {
    DonkeyLockKit.initializeSdk(reactApplicationContext, sdkToken) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun initializeLock(deviceName: String, key: String, passkey: String, callback: Callback) {
    DonkeyLockKit.initializeLock(deviceName, key, passkey) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun lock(deviceName: String, callback: Callback) {
    DonkeyLockKit.lock(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onLockUpdate", it.description)
    }) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun unlock(deviceName: String, callback: Callback) {
    DonkeyLockKit.unlock(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onUnlockUpdate", it.description)
    }) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun prepareEndRental(deviceName: String, callback: Callback) {
    DonkeyLockKit.prepareEndRental(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onEndRentalUpdate", it.description)
    }) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun finalizeLock(deviceName: String, callback: Callback) {
    DonkeyLockKit.finalizeLock(deviceName) { result ->
      callback(result.toReactResult())
    }
  }

  private fun Result<Any>.toReactResult(): ReadableMap {
    val map = Arguments.createMap()
    fold(
      onSuccess = { map.putString("status", "success") },
      onFailure = {
        map.putString(
          "status", when (it) {
            is OngoingActionError -> "OngoingAction"
            is UninitializedSdkError -> "Uninitialized"
            is LockError -> it.code
            else -> "Unknown"
          }
        )
        map.putString("message", it.message)
        map.putString("detail", (it as? LockError)?.detail)
      }
    )
    return map
  }
}
