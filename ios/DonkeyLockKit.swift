//
//  DonkeyLockKit.swift
//  DonkeyLockKit
//
//  Created by Aleksander Maj on 26/07/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import DonkeyLockKit
import Foundation

@objc(LockKitWrapper)
class LockKitWrapper: NSObject {
    @objc(setLogLevel:)
    func set(logLevel: NSNumber) {
        LockKit.shared.set(logLevel: .init(logLevel: logLevel))
    }

    @objc(setEnvironment:)
    func setEnvironment(isTestEnvironment: Bool) {
        LockKit.shared.set(serverEnvironment: isTestEnvironment ? .test : .live)
    }

    @objc
    func initializeSDK(
        sdkToken: String,
        callback: RCTResponseSenderBlock
    ) {
        LockKit.shared.initializeSDK(sdkToken: sdkToken) { result in
            switch result {
            case .success:
                return callback(["status": "success"])
            case .failure(let error):
                return callback(["status": "failure"])
            }
        }
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

extension LockKit.InitializeSDKError {
    var snakeCaseString: String {
        switch self {

        }
    }
}
