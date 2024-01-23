import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { makeApiRequest } from '../services/api';
import { Button } from 'react-native-paper';
import { otpSecret } from '../configs/config.json'
import {ToastAndroid} from 'react-native';
import TextPin from '../components/ui/TextPin';
function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    if (phoneNumber.trim() === '' || phoneNumber.length !== 10) {
      Alert.alert('Please enter a valid 10-digit phone number.');
      setLoading(false); // Make sure to set loading to false here
    } else {
      try {
        const result = await makeApiRequest('consumer/sendOtpMobile', 'POST', {
          mobileNumber: phoneNumber,
          secretCode: otpSecret
        });
        if (result.status) {
          ToastAndroid.showWithGravity(
            "Otp sent Successfully",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
          navigation.navigate('Otp', { mobileNumber: phoneNumber });
        } else {
          ToastAndroid.showWithGravity(
            "couldn't send otp try again later",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
        }
      } catch (error) {
        ToastAndroid.showWithGravity(
          "some error occurred, please try again later",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      } finally {
        setLoading(false); // Set loading to false here
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://media.licdn.com/dms/image/D4D0BAQEAH5W3chL_Mg/company-logo_200_200/0/1687524964804?e=2147483647&v=beta&t=KUIE8QJh3Y8Z-x4JW7U4shwdP-mzQNuHbCf6gc_INao' }}
        style={styles.banner}
      />
      <TextPin
        mode={'outlined'}
        value={phoneNumber}
        onChange={text => setPhoneNumber(text.toString())}
        placeholder="Phone Number"
      />
      <View style={styles.buttonContainer}>
        <Button
          style={styles.loginButton}
          mode="contained"
          onPress={handleLogin}
          disabled={loading}
        >
          { loading ? (
            <ActivityIndicator style={{color:"blue",justifyContent:"center",alignContent:"center",alignItems:"center",alignSelf:"center"}} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  banner: {
    width: '100%',
    height: 150,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 100,
    width: '100%',
  },
  loginButton: {
    backgroundColor: 'green',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default LoginScreen;