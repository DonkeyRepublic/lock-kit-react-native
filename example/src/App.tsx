import * as React from 'react';
import {
  Button,
  NativeEventEmitter,
  NativeModules,
  Permission,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import {
  ConnectionUpdate,
  Environment,
  finalizeLock,
  initializeLock,
  initializeSdk,
  lock,
  LogLevel,
  prepareEndRental,
  Result,
  setEnvironment,
  setLogLevel,
  unlock,
} from 'donkey-lock-kit';

const SDK_TOKEN = 'wzfV-C-biSt2kPmY6hstoyZpH17ufN6M6GRVZYj5';
const ENVIRONMENT = Environment.TEST;
const LOG_LEVEL = LogLevel.DEBUG;
const LOCK_NAME = 'AXA:541930432D2CF3A47725';
const KEY = 'key';
const PASSKEY = 'passkey';

const UPDATE_EVENTS = ['onLockUpdate', 'onUnlockUpdate', 'onEndRentalUpdate'];

async function requestPermissions(): Promise<string> {
  if (Platform.OS !== 'android') {
    return 'n/a (iOS asks on first Bluetooth use)';
  }
  const permissions: Permission[] =
    Platform.Version >= 31
      ? [
          'android.permission.BLUETOOTH_SCAN',
          'android.permission.BLUETOOTH_CONNECT',
          'android.permission.BLUETOOTH_ADVERTISE',
          'android.permission.ACCESS_FINE_LOCATION',
        ]
      : ['android.permission.ACCESS_FINE_LOCATION'];
  const results = await PermissionsAndroid.requestMultiple(permissions);
  return JSON.stringify(results, null, 1);
}

export default function App() {
  const [permissions, setPermissions] = React.useState('');
  const [lastUpdate, setLastUpdate] = React.useState('');
  const [lastResult, setLastResult] = React.useState('');

  const askPermissions = () =>
    requestPermissions().then(setPermissions, (e) => setPermissions(String(e)));

  React.useEffect(() => {
    askPermissions();

    // On iOS the RCTEventEmitter drops events unless listeners are registered through NativeEventEmitter.
    const emitter = new NativeEventEmitter(
      Platform.OS === 'ios' ? NativeModules.DonkeyLockKit : undefined
    );
    const subscriptions = UPDATE_EVENTS.map((event) =>
      emitter.addListener(event, (payload: unknown) => {
        const update = payload as ConnectionUpdate;
        setLastUpdate(
          `${event}: ${update.code} ${update.description ?? ''}` +
            (update.rssi !== undefined ? ` rssi=${update.rssi}` : '')
        );
      })
    );
    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  const onResult = (action: string) => (result: Result) =>
    setLastResult(
      `${action}: ${result.status} ${result.code ?? ''} ${result.detail ?? ''}`
    );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text>Lock: {LOCK_NAME}</Text>
      <Button title="Request permissions" onPress={askPermissions} />
      <Button
        title="Init SDK"
        onPress={() => {
          setLogLevel(LOG_LEVEL);
          setEnvironment(ENVIRONMENT);
          initializeSdk(SDK_TOKEN, onResult('initializeSdk'));
        }}
      />
      <Button
        title="Init lock"
        onPress={() =>
          initializeLock(LOCK_NAME, KEY, PASSKEY, onResult('initializeLock'))
        }
      />
      <Button
        title="Unlock"
        onPress={() => unlock(LOCK_NAME, onResult('unlock'))}
      />
      <Button title="Lock" onPress={() => lock(LOCK_NAME, onResult('lock'))} />
      <Button
        title="Prepare end rental"
        onPress={() => prepareEndRental(LOCK_NAME, onResult('prepareEndRental'))}
      />
      <Button
        title="Finalize lock"
        onPress={() => finalizeLock(LOCK_NAME, onResult('finalizeLock'))}
      />
      <Text>Last update: {lastUpdate}</Text>
      <Text>Last result: {lastResult}</Text>
      <Text>Permissions: {permissions}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 64,
  },
});
