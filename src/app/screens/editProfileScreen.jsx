import React, { useState } from 'react';
import { View, StyleSheet,ToastAndroid } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, email, phone, onSave } = route.params;

  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newPhone, setNewPhone] = useState(phone);

  const handleSaveChanges = () => {
    // Basic validations
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      ToastAndroid.showWithGravity(
        "Please enter valid details",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      return;
    }
  
    // Email and phone number validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
  
    if (!emailRegex.test(newEmail) || !phoneRegex.test(newPhone)) {
      ToastAndroid.showWithGravity(
        "Please enter valid email and phone number",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      return;
    }
  
    // All validations passed, proceed to save changes
    onSave(newName, newEmail, newPhone);
    navigation.navigate('Profile');
  };
  

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Edit Profile" titleStyle={styles.cardTitle} />
        <Card.Content>
          <TextInput label="Name" value={newName} onChangeText={setNewName} style={styles.input} />
          <TextInput label="Email" value={newEmail} onChangeText={setNewEmail} style={styles.input} />
          <TextInput label="Phone" value={newPhone} onChangeText={setNewPhone} style={styles.input} />
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button mode="contained" onPress={handleSaveChanges} style={styles.button}>
            Update
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: 'green',
  },
});

export default EditProfileScreen;
