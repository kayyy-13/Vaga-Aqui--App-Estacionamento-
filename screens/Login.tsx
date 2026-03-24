import { useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, ImageBackground } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

/**
 * Tela de login para usuários comuns.
 * Permite autenticação via email e senha, verificando tipo de usuário.
 */
export default function Login() {
  const [email, setEmail] = useState(''); // Estado para email do usuário
  const [senha, setSenha] = useState(''); // Estado para senha do usuário

  const navigation = useNavigation();

  /**
   * Realiza login do usuário, verificando se é usuário comum.
   */
  const logar = async () => {
    try {
      const userCredentials = await auth.signInWithEmailAndPassword(email, senha);
      console.log("Logado como: " + userCredentials.user?.email);

      // Verificar se o usuário é normal
      const userDoc = await firestore.collection("Usuario").doc(userCredentials.user?.uid).get();
      const userData = userDoc.data();

      if (userData?.tipo === '1') {
        navigation.replace('Menu');
      } else {
        alert('Esta é a tela de login para usuários normais. Use a tela de administrador se aplicável.');
        await auth.signOut();
      }
    } catch (erro) {
      alert(erro.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/LOGIN.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>TELA DE LOGIN</Text>

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
          <TouchableOpacity style={styles.button} onPress={logar}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => navigation.replace('AdminLogin')}>
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Login como Administrador</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.replace('Register')}>
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
