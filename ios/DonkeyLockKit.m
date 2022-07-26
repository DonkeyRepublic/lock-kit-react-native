//
//  DonkeyLockKit.m
//  DonkeyLockKit
//
//  Created by Aleksander Maj on 26/07/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(DonkeyLockKit, RCTEventEmitter)

RCT_EXTERN_METHOD(setLogLevel: (nonnull NSNumber *)logLevel)
RCT_EXTERN_METHOD(setEnvironment: (BOOL)isTestEnvironment)
RCT_EXTERN_METHOD(initializeSdk: (nonnull NSString *)sdkToken callback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(initializeLock: (nonnull NSString *)lockName eKey: (nonnull NSString *)eKey passkey: (nonnull NSString *)passkey callback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(lock: (nonnull NSString *)lockName callback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(unlock: (nonnull NSString *)lockName callback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(prepareEndRental: (nonnull NSString *)lockName callback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(finalizeLock: (nonnull NSString *)lockName callback: (RCTResponseSenderBlock)callback)

@end
