import { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Button, TouchableOpacity, ImageBackground} from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Usuario } from '../model/Usuario';
import { Picker } from '@react-native-picker/picker';


export default function Register() {
  const[formUsuario, setFormUsuario] = useState<Partial<Usuario>>({})

  const navigation = useNavigation()

  const admin = () => {
    setFormUsuario({
      ...formUsuario,
      tipo : '2'
    })
    console.log('Será admin')
  }

  const normal = () => {
    setFormUsuario({
      ...formUsuario,
      tipo : '1'
    })
    console.log('Será normal')
  }


  const registrar = () => {
    auth
    .createUserWithEmailAndPassword(formUsuario.email, formUsuario.senha)
    .then( userCredentials => {
      console.log("Logado como: " + userCredentials.user?.email)
      
      const refUsuario = firestore.collection("Usuario");
      const idUsuario  = refUsuario.doc(auth.currentUser.uid);

      idUsuario.set({
        id    : auth.currentUser.uid,
        nome  : formUsuario.nome,
        email : formUsuario.email,
        senha : formUsuario.senha,
        fone  : formUsuario.fone,
        tipo  : formUsuario.tipo
      })

      navigation.replace('Menu')
    })
    .catch(erro => alert(erro.message))
  }

  
  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>CADASTRO DE USUÁRIOS</Text>

        <View style={styles.inputView}>
          <TextInput 
            label='Nome' 
            onChangeText={valor => setFormUsuario({
              ...formUsuario,
              nome : valor
            })}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
          />
          <TextInput 
            label='Email' 
            onChangeText={valor => setFormUsuario({
              ...formUsuario,
              email : valor
            })}
            style={styles.input}  
            activeUnderlineColor='#e9ce33ff'    
          />
          <TextInput 
            label='Senha' 
            onChangeText={valor => setFormUsuario({
              ...formUsuario,
              senha : valor
            })}
            secureTextEntry={true}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
          />
          <TextInput 
            label='Fone' 
            onChangeText={valor => setFormUsuario({
              ...formUsuario,
              fone : valor
            })}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
          />
         <Text style={{ color: '#e9ce33ff', fontWeight: 'bold', marginTop: 10 }}>PCD</Text>
          <Picker
            selectedValue={formUsuario.PCD}
            onValueChange={valor => setFormUsuario({ ...formUsuario, PCD: valor })}
            style={{ backgroundColor: '#fff', marginTop: 5 }}
          >
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Não" value="não" />
             <Picker.Item label="Sim" value="sim" />
          </Picker>
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={admin}>
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={normal}>
            <Text style={styles.buttonText}>Normal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={registrar}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSec]} onPress={() => navigation.replace('Login')}>
            <Text style={[styles.buttonText, styles.buttonSecText]}>Voltar</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}