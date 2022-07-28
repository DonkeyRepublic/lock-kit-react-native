//
//  DonkeyLockKit.swift
//  DonkeyLockKit
//
//  Created by Aleksander Maj on 26/07/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import DonkeyLockKit

@objc(DonkeyLockKit)
class DonkeyLockKit: RCTEventEmitter {
    @objc func setLogLevel(_ logLevel: NSNumber) {
        LockKit.shared.set(logLevel: .init(logLevel: logLevel))
    }

    @objc func setEnvironment(_ isTestEnvironment: Bool) {
        LockKit.shared.set(serverEnvironment: isTestEnvironment ? .test : .live)
    }

    @objc func initializeSdk(_ sdkToken: String, callback: @escaping RCTResponseSenderBlock) {
        LockKit.shared.initializeSDK(sdkToken: sdkToken) { result in
            callback([result.toDictionary])
        }
    }

    @objc func initializeLock(_ lockName: String, eKey: String, passkey: String, callback: @escaping RCTResponseSenderBlock) {
        let result = LockKit.shared.initializeLock(lockName: lockName, eKey: eKey, passkey: passkey)
        callback([result.toDictionary])
    }

    @objc func lock(_ lockName: String, callback: @escaping RCTResponseSenderBlock) {
        LockKit.shared.lock(
            lockName: lockName,
            onStatusChanged: { update in
                self.sendEvent(withName: "onLockUpdate", body: update.toDictionary)
            }
        ) { result in
            callback([result.toDictionary])
        }
    }

    @objc func unlock(_ lockName: String, callback: @escaping RCTResponseSenderBlock) {
        LockKit.shared.unlock(lockName: lockName, onStatusChanged: { update in
            self.sendEvent(withName: "onUnlockUpdate", body: update.toDictionary)
        }) { result in
            callback([result.toDictionary])
        }
    }

    @objc func prepareEndRental(_ lockName: String, callback: @escaping RCTResponseSenderBlock) {
        LockKit.shared.prepareEndRental(lockName: lockName, onStatusChanged: { update in
            self.sendEvent(withName: "onEndRentalUpdate", body: update.toDictionary)
        }) { result in
            callback([result.toDictionary])
        }
    }

    @objc func finalizeLock(_ lockName: String, callback: @escaping RCTResponseSenderBlock) {
        let result = LockKit.shared.finalizeLock(lockName: lockName)
        callback([result.toDictionary])
    }

    override func supportedEvents() -> [String]! {
        return ["onLockUpdate", "onUnlockUpdate", "onEndRentalUpdate"]
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        true
    }
}

extension LogLevel {
    init(logLevel: NSNumber) {
        switch logLevel.intValue {
        case 1: self = .error
        case 2: self = .info
        case 3: self = .debug
        default: self = .off
        }
    }
}

extension Result where Success == Void, Failure: DonkeyLockKitError {
    var toDictionary: [String: Any] {
        switch self {
        case .success:
            return ["status": "success"]
        case .failure(let error):
            return [
                "status": "failure",
                "code": error.code,
                "detail": error.detail
            ]
                .compactMapValues { $0 }
        }
    }
}
protocol DonkeyLockKitError: Error {
    var code: String { get }
    var detail: String? { get }
}

extension InitializeSDKError: DonkeyLockKitError {
    var code: String {
        return "uninitialized_sdk"
   }

    var detail: String? {
        switch self {
        case .tokenNotSet:
            return "token_not_set"
        case .tokenInvalid:
            return "token_invalid"
        case .ongoingInitializationWithDifferentToken:
            return "ongoing_initialization_with_different_token"
        case .failedToInitializeStorage:
            return "failed_to_initialize_storage"
        @unknown default:
            return nil
        }
    }
}

extension InitializeLockError: DonkeyLockKitError {
    var code: String {
        switch self {
        case .failedToInitializeSDK(let error):
            return error.code
        case .ongoingLockAction:
            return "ongoing_action"
        @unknown default:
            return "fatal_error"
        }
    }

    var detail: String? {
        switch self {
        case .failedToInitializeSDK(let initializeSDKError):
            return initializeSDKError.detail
        case .ongoingLockAction:
            return nil
        @unknown default:
            return nil
        }
    }
}

extension LockError: DonkeyLockKitError {
    var code: String {
        switch self {
        case .failedToInitializeSDK(let error):
            return error.code
        case .lockNotRecognized:
            return "lock_not_recognized"
        case .ongoingLockAction:
            return "ongoing_action"
        case .bluetoothOff:
            return "bluetooth_off"
        case .bluetoothUnauthorized:
            return "bluetooth_unauthorized"
        case .searchTimeout:
            return "search_timeout"
        case .connectionTimeout:
            return "connection_timeout"
        case .lockTimeout:
            return "lock_timeout"
        case .unlockTimeout:
            return "unlock_timeout"
        case .postConnectionLockCheckFailed:
            return "post_connection_lock_check_failed"
        case .extraLockCheckFailed:
            return "extra_lock_check_failed"
        case .invalidEkey:
            return "out_of_keys"
        case .outOfCommands:
            return "out_of_keys"
        case .fullTimeout:
            return "fatal_error"
        case .offlineDuringPickup:
            return "offline_during_pickup"
        case .unknown:
            return "fatal_error"
        @unknown default:
            return "fatal_error"
        }
    }

    var detail: String? {
        switch self {
        case .failedToInitializeSDK(let error):
            return error.detail
        case .unknown(message: let message):
            return message
        default:
            return nil
        }
    }
}

extension FinalizeLockError: DonkeyLockKitError {
    var code: String {
        switch self {
        case .failedToInitializeSDK(let error):
            return error.code
        case .ongoingLockAction:
            return "ongoing_action"
        case .lockNotRecognized:
            return "lock_not_recognized"
        @unknown default:
            return "fatal_error"
        }
    }

    var detail: String? {
        switch self {
        case .failedToInitializeSDK(let error):
            return error.detail
        default:
            return nil
        }
    }
}

extension StatusUpdate {
    var toDictionary: [String: Any] {
        var result: [String: Any] = ["code": self.code]
        switch self {
        case .weakSignal(rssi: let rssi):
            result["rssi"] = rssi
        default:
            break
        }
        return result
    }

    var code: String {
        switch self {
            case .searching:
                return "searching"
            case .weakSignal:
                return "weak_signal"
            case .connecting:
                return "connecting"
            case .connected:
                return "connected"
            case .readingLockData:
                return "reading_lock_data"
            case .postConnectionLockCheck:
                return "reading_lock_data"
            case .sendingCommand:
                return "sending_command"
            case .waitingForUserAction:
                return "push_to_unlock"
            case .extraLockCheck:
                return "extra_lock_check"
            @unknown default:
                return "unknown"
        }
    }
}
