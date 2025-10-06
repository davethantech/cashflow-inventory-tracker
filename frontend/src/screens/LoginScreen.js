import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Headline,
  Caption,
  ActivityIndicator
} from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import { translations } from '../utils/translations';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  
  const { login, requestOTP, language } = useContext(AuthContext);
  const t = translations[language];

  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(t.error, t.enterPhoneNumber);
      return;
    }

    setLoading(true);
    try {
      await requestOTP(phoneNumber);
      setStep('otp');
      Alert.alert(t.success, t.otpSent);
    } catch (error) {
      Alert.alert(t.error, t.otpRequestFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert(t.error, t.enterValidOTP);
      return;
    }

    setLoading(true);
    try {
      await login(phoneNumber, otp);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert(t.error, t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Headline style={styles.title}>{t.appName}</Headline>
          <Caption style={styles.subtitle}>
            {t.appDescription}
          </Caption>
        </View>

        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <TextInput
                label={t.phoneNumber}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon name="phone" />}
                placeholder="+2348012345678"
              />
              
              <Button
                mode="contained"
                onPress={handleRequestOTP}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                {t.requestOTP}
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.instruction}>
                {t.enterOTPSentTo} {phoneNumber}
              </Text>
              
              <TextInput
                label={t.enterOTP}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
                left={<TextInput.Icon name="lock" />}
              />
              
              <View style={styles.otpActions}>
                <Button
                  mode="outlined"
                  onPress={() => setStep('phone')}
                  style={styles.secondaryButton}
                >
                  {t.changeNumber}
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  {t.verifyOTP}
                </Button>
              </View>
              
              <Button
                mode="text"
                onPress={handleRequestOTP}
                style={styles.resendButton}
              >
                {t.resendOTP}
              </Button>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Caption style={styles.footerText}>
            {t.byContinuingYouAgree} {t.termsAndConditions}
          </Caption>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  secondaryButton: {
    marginRight: 8,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resendButton: {
    marginTop: 16,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default LoginScreen;
