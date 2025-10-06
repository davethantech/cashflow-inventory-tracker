import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Headline, Caption, ActivityIndicator } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      navigation.replace('Dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Headline style={styles.title}>Cashflow Tracker</Headline>
          <Caption style={styles.subtitle}>Manage your business sales and inventory easily</Caption>
        </View>

        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="+2348012345678"
              />
              <Button mode="contained" onPress={handleRequestOTP} loading={loading} style={styles.button}>
                Request OTP
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.instruction}>Enter OTP sent to {phoneNumber}</Text>
              <TextInput
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
              <Button mode="contained" onPress={handleVerifyOTP} loading={loading} style={styles.button}>
                Verify OTP
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2196F3', marginBottom: 8 },
  subtitle: { textAlign: 'center', fontSize: 16 },
  form: { marginBottom: 20 },
  input: { marginBottom: 16, backgroundColor: 'white' },
  button: { marginTop: 8, paddingVertical: 8 },
  instruction: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
});

export default LoginScreen;
