import { useState } from 'react';
import { StyleSheet, Text, View, Button, KeyboardAvoidingView, TouchableOpacity, ImageBackground } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

export default function Login() {
  const[email, setEmail] = useState('')
  const[senha, setSenha] = useState('')

  const navigation = useNavigation()

  const logar = () => {
    auth
    .signInWithEmailAndPassword(email, senha)
    .then( userCredentials => {
      console.log("Logado como: " + userCredentials.user?.email)
      navigation.replace('Menu')
    })
    .catch(erro => alert(erro.message))
  }

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/login.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>TELA DE LOGIN</Text>

        <View style={styles.inputView}>
          <TextInput
            label='E-mail'
            onChangeText={texto => setEmail(texto)}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
          />

          <TextInput
            label='Senha'
            onChangeText={texto => setSenha(texto)}
            secureTextEntry={true}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
          />
        </View>      

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={logar}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSec]} onPress={() => navigation.replace('Register')}>
            <Text style={[styles.buttonText, styles.buttonSecText]}>Registrar</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>      
    </KeyboardAvoidingView>
  );
}
