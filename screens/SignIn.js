import React from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {AuthContext} from '../App';

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
  error: {
    color: 'red',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10
  },
});

async function login({username, password}) {
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
    return {error: error};
  }
}

export default function SignInScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errMsg, setErrMsg] = React.useState('');
  const {signIn} = React.useContext(AuthContext);

  return (
    <View>
      {/* <Text numberOfLines={1} style={styles.label}>
        Your credential
      </Text> */}
      {errMsg.length > 0 && <Text style={styles.error}>{errMsg}</Text>}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={v => setUsername(v.toLocaleLowerCase())}
        style={{
          height: 40,
          backgroundColor: 'white',
          borderWidth: 0,
          marginBottom: 1,
          padding: 10,
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          height: 40,
          backgroundColor: 'white',
          borderWidth: 0,
          marginBottom: 5,
          padding: 10,
        }}
      />
      <Button
        title="Sign in"
        disabled={username.length == 0 || password.length == 0}
        onPress={async () => {
          const resp = await login({username, password});
          if (resp.error !== undefined) {
            setErrMsg(resp.error);
          } else {
            signIn(resp);
          }
        }}
      />
    </View>
  );
}
