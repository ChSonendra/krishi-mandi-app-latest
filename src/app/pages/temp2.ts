import React, { useEffect, useState } from "react";
import { Text, View, SafeAreaView, ScrollView, Platform } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import { style } from "./stylesheets/Style";
import PPButton from "./Container/PPButton";
import * as config from '../configs/config.json'
import PPTextField from "./Container/PPTextField";
import PPHTextField from "./Container/PPHStack";

const Payment = () => {
  try {
    const [requestBody, setRequestBody] = useState<string>('');
    const [merchantId, setMerchantId] = useState<string>('');
    const [appId, setAppId] = useState<string>('');

    const [checksum, setChecksum] = useState<string>('');

    const [openEnvironment, setOpenEnvironment] = useState(false);
    const [environmentDropDownValue, setEnvironmentValue] = useState('PRODUCTION');

    const [environements, setEnvironment] = useState([
      { label: 'SANDBOX', value: 'SANDBOX' },
      { label: 'PRODUCTION', value: 'PRODUCTION' }
    ]);

    const [packageName, setPackageName] = useState<string>('');
    const [callbackURL, setCallbackURL] = useState<string>('reactDemoAppScheme');
    console.log("atleast we reach here")
    const handleStartTransaction = () => {
      PhonePePaymentSDK.startTransaction(
        requestBody,
        checksum,
        packageName,
        callbackURL
      ).then(a => {
        setMessage(JSON.stringify(a));
      }).catch(error => {
        setMessage("error:" + error.message);
      })
    };

    const initPhonePeSDK = () => {
      console.log("here in init")
      PhonePePaymentSDK.init(
        environmentDropDownValue,
        config.paymentconfig.merchantId,
        appId,
        true
      ).then(result => {
        console.log("sdk initialized successfully")
        setMessage("Message: SDK Initialisation ->" + JSON.stringify(result));
        handleIsPhonePeAppInstalled()
        handleIsGPayAppInstalled()
        handleIsPaytmInstalled()
      }).catch((error) => {
        console.log("here in catch init", error)
        setMessage("error:" + error.message);
      })
    };

    useEffect(() => {
      initPhonePeSDK()
    },
      [])

    const [PhonePeAppInstalled, setPhonePeAppInstalled] = useState(false);
    const [GPayAppInstalled, setGPayAppInstalled] = useState(false);
    const [PaytmAppInstalled, setPaytmAppInstalled] = useState(false);
    const [message, setMessage] = useState<string>('Message: ');

    const handleIsPhonePeAppInstalled = () => {
      PhonePePaymentSDK.isPhonePeInstalled().then(a => {
        console.log("a == ", a)
        setPhonePeAppInstalled(a);
        if (a) {
          console.log("phone app installed", a)
          setMessage("Message: PhonePe App Installed")
        } else {
          setMessage("Message: PhonePe App Unavailable")
        }
      }).catch(error => {
        setMessage("error:" + error.message);
      })
    };

    const handleIsGPayAppInstalled = () => {
      PhonePePaymentSDK.isGPayAppInstalled().then(a => {
        setGPayAppInstalled(a);
        if (a) {
          setMessage("Message: Gpay App Installed")
        } else {
          setMessage("Message: Gpay App Unavailable")
        }
      }).catch(error => {
        setMessage("error:" + error.message);
      })
    };

    const handleIsPaytmInstalled = () => {
      PhonePePaymentSDK.isPaytmAppInstalled().then(a => {
        setPaytmAppInstalled(a);
        if (a) {
          setMessage("Message: Paytm App Installed")
        } else {
          setMessage("Message: Paytm App Unavailable")
        }
      }).catch(error => {
        setMessage("error:" + error.message);
      })
    };

    const getPackageSignatureForAndroid = () => {
      if (Platform.OS === 'android') {
        PhonePePaymentSDK.getPackageSignatureForAndroid().then(packageSignture => {
          setMessage(JSON.stringify(packageSignture));
        }).catch(error => {
          setMessage("error:" + error.message);
        })
      }
    };

    const getUpiAppsForAndroid = () => {
      if (Platform.OS === 'android') {
        PhonePePaymentSDK.getUpiAppsForAndroid().then(upiApps => {
          if (upiApps != null) {
            console.log("upi Apps ", upiApps)
            setMessage(JSON.stringify(JSON.parse(upiApps)));
          }
        }).catch(error => {
          setMessage("error:" + error.message);
        })
      }
    };

    return (
      <SafeAreaView>
        <View style={style.container}>
          <ScrollView>
            <Text style={style.heading}>RN Merchant Demo App</Text>

            <PPTextField
              title="Merchant ID:"
              placeholder="Enter Merchant ID"
              setValue={setMerchantId}
            />

            <PPTextField
              title="APP ID:"
              placeholder="Enter App ID"
              setValue={setAppId}
            />

            <Text>Environment:</Text>
            <DropDownPicker
              open={openEnvironment}
              listMode="SCROLLVIEW"
              value={environmentDropDownValue}
              items={environements}
              setOpen={setOpenEnvironment}
              setValue={setEnvironmentValue}
              setItems={setEnvironment}
              style={style.dropdown}
            />

            <PPButton
              title="Init SDK"
              onPress={initPhonePeSDK}
            />

            <PPTextField
              title="Request Body:"
              placeholder="Enter request body"
              setValue={setRequestBody}
            />

            <PPTextField
              title="Checksum:"
              placeholder="Enter CheckSum"
              setValue={setChecksum}
            />

            {Platform.OS == "android" &&
              <PPTextField
                title="Package Name: "
                placeholder="Enter package name"
                setValue={setPackageName}
              />
            }
            {Platform.OS == "ios" &&

              <PPTextField
                title="App Schema:"
                value={callbackURL}
                placeholder="Enter app schema url"
                setValue={setCallbackURL}
              />
            }

            <PPButton
              title="Start Transaction"
              onPress={handleStartTransaction}
            />

            <View style={style.bckView}>
              <PPButton
                title="Check PhonePe"
                onPress={handleIsPhonePeAppInstalled}
              />
              <PPButton
                title="Check PayTm"
                onPress={handleIsPaytmInstalled}
              />
              <PPButton
                title="Check  GPay"
                onPress={handleIsGPayAppInstalled}
              />
            </View>

            {
              Platform.OS == "android" &&
              <View style={style.bckView}>
                <PPButton
                  title="Get Package Signature"
                  onPress={getPackageSignatureForAndroid}
                />
                <PPButtont
                  title="Get UPI Apps"
                  onPress={getUpiAppsForAndroid}
                />
              </View>
            }
            <Text style={{ marginVertical: 4 }}>{message}</Text>
            <View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
  catch (error) {
    console.log("errorin home paymenty", error);
  }
}

export default Payment;

temp2.import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export interface AppProps {
}

export interface AppState {
}

export default class AppComponent extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
    };
  }

  public render() {
    return (
      <View>
         <Text>App Component</Text>
      </View>
    );
  }
}
