import * as React from 'react';

import { StyleSheet, View, Text, DeviceEventEmitter } from 'react-native';
import { initializeSdk, initializeLock, lock, setLogLevel, setEnvironment, LogLevel, Environment } from 'donkey-lock-kit';


export default function App() {
  const [sdkInitialized, setSdkInitialized] = React.useState<string | undefined>();
  const [lockInitialized, setLockInitialized] = React.useState<string | undefined>();
  const [lockUpdate, setLockUpdate] = React.useState<string | undefined>();
  const [lockResult, setLockResult] = React.useState<string | undefined>();
  const LOCK_NAME = 'AXA:541930432D2CF3A47725'

  DeviceEventEmitter.addListener('onLockUpdate', (description) => { setLockUpdate(description) });


  React.useEffect(() => {
    setLogLevel(LogLevel.DEBUG)
    setEnvironment(Environment.TEST)
    initializeSdk('<PROVIDE SDK TOKEN>', (message) => {
      setSdkInitialized(message)
      initializeLock(LOCK_NAME, 'key', 'passkey', (message) => {
        setLockInitialized(message)
        lock(LOCK_NAME, (message) => { setLockResult(message) });
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>SDK initialized: {sdkInitialized}</Text>
      <Text>Lock initialized: {lockInitialized}</Text>
      <Text>Lock update: {lockUpdate}</Text>
      <Text>Lock result: {lockResult}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
