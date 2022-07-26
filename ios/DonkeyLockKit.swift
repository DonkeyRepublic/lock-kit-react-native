//
//  DonkeyLockKit.swift
//  DonkeyLockKit
//
//  Created by Aleksander Maj on 26/07/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

//import DonkeyLockKit
import Foundation

@objc(LockKitWrapperObjC)
class LockKitWrapper: NSObject {
    @objc
    func setLogLevel(_ logLevel: NSNumber) {
        print(#function)
        //LockKit.shared.set(logLevel: .init(logLevel: logLevel))
    }

    @objc(setEnvironment:)
    func setEnvironment(_ isTestEnvironment: Bool) {
        print(#function)
        //LockKit.shared.set(serverEnvironment: isTestEnvironment ? .test : .live)
    }

    @objc(initializeSdk:callback:)
    func initializeSDK(
        _ sdkToken: String,
        callback: @escaping RCTResponseSenderBlock
    ) {
        print(#function)
//
//        LockKit.shared.initializeSDK(sdkToken: sdkToken) { result in
//            switch result {
//            case .success:
//                return callback([["status": "success"]])
//            case .failure(let error):
//                return callback(
//                    [
//                        [
//                            "status": error.statusString,
//                            "detail": error.detailString
//                        ]
//                    ]
//                )
//            }
//        }
    }
}

//class LockKitWrapperConfiguration: NSObject {
//    var logLevel: WrapperLogLevel
//}

//typedef NS_CLOSED_ENUM(NSInteger, WrapperLogLevel) {
//    WrapperLogLevelDebug,
//    WrapperLogLevelInfo,
//    WrapperLogLevelError,
//    WrapperLogLevelOff
//};

extension LogLevel {
    init(logLevel: NSNumber) {
        switch logLevel.intValue {
        case 0: self = .debug
        case 1: self = .info
        case 2: self = .error
        case 3: self = .off
        default: self = .off
        }
    }
}

extension InitializeSDKError {
    var statusString: String {
        return "uninitialized_sdk"
   }

    var detailString: String {
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
            return "unknown"
        }
    }
}
