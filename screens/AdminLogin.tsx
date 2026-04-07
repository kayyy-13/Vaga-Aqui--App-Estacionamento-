import { useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, ImageBackground } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

export default function AdminLogin() {
  const[email, setEmail] = useState('')
  const[senha, setSenha] = useState('')

  const navigation = useNavigation<any>()

  const logarAdmin = async () => {
    try {
      const userCredentials = await auth.signInWithEmailAndPassword(email, senha);
      console.log("Logado como: " + userCredentials.user?.email);

      // Verificar se o usuário é admin
      const userDoc = await firestore.collection("Usuario").doc(userCredentials.user?.uid).get();
      const userData = userDoc.data();

      if (userData?.tipo === '2') {
        navigation.replace('Menu');
      } else {
        alert('Você não tem permissão para acessar como administrador.');
        await auth.signOut();
      }
    } catch (erro: any) {
      alert(erro?.message || 'Nao foi possivel realizar o login de administrador.');
    }
  }

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/LOGIN.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>LOGIN DE ADMINISTRADOR</Text>

        <View style={styles.inputView}>
          <TextInput
            label='E-mail'
            onChangeText={texto => setEmail(texto)}
            style={styles.input}
            activeUnderlineColor='#005A5B'
          />

          <TextInput
            label='Senha'
            onChangeText={texto => setSenha(texto)}
            secureTextEntry={true}
            style={styles.input}
            activeUnderlineColor='#005A5B'
          />
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={logarAdmin}>
            <Text style={styles.buttonText}>Login como Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.replace('Login')}>
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Voltar</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
