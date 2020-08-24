import React from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import { AuthContext } from '../App';


async function login({ username, password }) {
  try {
    let resp = await fetch('https://rest.10z.dev/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    let json = await resp.json();
    return json;
  } catch (error) {
    console.log('error: ', error);
    return { error: error };
  }
}

export default function SignInScreen() {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errMsg, setErrMsg] = React.useState('');
  const { signIn } = React.useContext(AuthContext);

  const btnDisabled = loading || username.length == 0 || password.length == 0
  return (
    <SafeAreaView>
      <Text numberOfLines={1} style={styles.title}>
        Sign In
      </Text>
      {errMsg.length > 0 && <Text style={styles.error}>{errMsg}</Text>}
      <TextInput
        placeholder="Username"
        placeholderTextColor={'#7f7f7f'}
        value={username}
        onChangeText={v => setUsername(v.toLocaleLowerCase())}
        style={[styles.Input]}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={'#7f7f7f'}
        style={[styles.Input]}
      />
      <TouchableHighlight
        disabled={btnDisabled}
        style={[styles.Button, { backgroundColor: btnDisabled ? '#c1c7c9' : '#447bfc' }]}
        onPress={async () => {
          setLoading(true);
          const resp = await login({ username, password });
          if (resp.error !== undefined) {
            setErrMsg(resp.error);
          } else {
            signIn(resp);
          }
          setLoading(false);
        }}>
        <Text style={styles.ButtonText}>{loading ? 'Working... ' : 'Log in'}</Text>
      </TouchableHighlight>
      {loading && <ActivityIndicator />}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  baseText: {
    fontWeight: 'bold',
  },
  innerText: {
    color: 'red',
  },
  label: {
    color: '#666',
    fontSize: 16,
    paddingLeft: 5,
    marginTop: 10,
  },
  Input: {
    height: 40,
    color: '#333',
    backgroundColor: 'white',
    borderWidth: 0,
    marginBottom: 1,
    padding: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    paddingTop: 20,
    paddingBottom: 20,
  },
  Button: {
    backgroundColor: "#447bfc",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 2,
    margin: 5,
    marginTop: 10,
  },
  ButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  }
});
