package com.donkeylockkit

import bike.donkey.lockkit.DonkeyConfig
import bike.donkey.lockkit.DonkeyLockKit
import bike.donkey.lockkit.errors.LockError
import bike.donkey.lockkit.errors.OngoingActionError
import bike.donkey.lockkit.errors.UninitializedSdkError
import bike.donkey.lockkit.updates.ConnectionUpdate
import com.facebook.react.bridge.*
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
        .emit("onLockUpdate", it.toReactUpdate())
    }) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun unlock(deviceName: String, callback: Callback) {
    DonkeyLockKit.unlock(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onUnlockUpdate", it.toReactUpdate())
    }) { result ->
      callback(result.toReactResult())
    }
  }

  @ReactMethod
  fun prepareEndRental(deviceName: String, callback: Callback) {
    DonkeyLockKit.prepareEndRental(deviceName, onUpdate = {
      reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onEndRentalUpdate", it.toReactUpdate())
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
        map.putString("status", "failure")
        map.putString(
          "code", when (it) {
            is OngoingActionError -> "ongoing_action"
            is UninitializedSdkError -> "uninitialized_sdk"
            is LockError -> it.toErrorCode()
            else -> "fatal_error"
          }
        )
        map.putString("detail", (it as? LockError)?.detail ?: it.message)
      }
    )
    return map
  }

  private fun LockError.toErrorCode() = when (this) {
    LockError.OutOfKeys -> "out_of_keys"
    LockError.BluetoothOff -> "bluetooth_off"
    LockError.BluetoothUnauthorized -> "bluetooth_unauthorized"
    LockError.LocationOff -> "location_off"
    LockError.LocationPermission -> "location_permission"
    LockError.OfflineDuringPickup -> "offline_during_pickup"
    LockError.SearchTimeout -> "search_timeout"
    is LockError.ConnectionError -> "fatal_error"
    LockError.ConnectionTimeout -> "connection_timeout"
    LockError.UnlockTimeout -> "unlock_timeout"
    is LockError.UnlockCommandError -> "fatal_error"
    LockError.LockTimeout -> "lock_timeout"
    is LockError.LockCommandError -> "fatal_error"
    LockError.PostConnectionLockCheckFailed -> "post_connection_lock_check_failed"
    is LockError.ExtraLockCheckFailed -> "extra_lock_check_failed"
    is LockError.FatalError -> "fatal_error"
  }

  private fun ConnectionUpdate.toReactUpdate(): ReadableMap {
    val map = Arguments.createMap()
    map.putString(
      "code", when (this) {
        ConnectionUpdate.Searching -> "searching"
        is ConnectionUpdate.WeakSignal -> "weak_signal"
        ConnectionUpdate.Connecting -> "connecting"
        ConnectionUpdate.Connected -> "connected"
        is ConnectionUpdate.ReadCharacteristics -> "reading_lock_data"
        ConnectionUpdate.SendingCommand -> "sending_command"
        ConnectionUpdate.PushToLock -> "push_to_lock"
        ConnectionUpdate.ExtraLockCheck -> "extra_lock_check"
      }
    )
    map.putString("description", description)
    if (this is ConnectionUpdate.WeakSignal) map.putInt("rssi", rssi)
    return map
  }
}
