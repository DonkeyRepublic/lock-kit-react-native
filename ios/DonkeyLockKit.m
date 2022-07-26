#import <React/RCTBridgeModule.h>
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNDonkeyLockKitSpec.h"
#endif

@interface RCT_EXTERN_REMAP_MODULE(DonkeyLockKit, LockKitWrapperObjC, NSObject)

RCT_EXTERN_METHOD(setLogLevel: (NSNumber *)logLevel)
RCT_EXTERN_METHOD(setEnvironment: (BOOL)isTestEnvironment)
RCT_EXTERN_METHOD(initializeSdk: (NSString *)sdkToken callback (RCTResponseSenderBlock *)callback)

@end

@implementation LockKitWrapperObjC

// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_REMAP_METHOD(multiply,
                 multiplyWithA:(double)a withB:(double)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  NSNumber *result = @(a * b);

  resolve(result);
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeDonkeyLockKitSpecJSI>(params);
}
#endif

@end
