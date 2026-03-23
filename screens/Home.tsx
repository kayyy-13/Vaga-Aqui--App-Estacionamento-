import { Button, ImageBackground, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Usuario } from "../model/Usuario";
import { useEffect, useState } from "react";

export default function Home() {
  const[usuario, setUsuario] = useState<Usuario[]>([]); 

  const navigation = useNavigation()

  const logout = () =>{
    auth
    .signOut()
    .then( () => {
      navigation.replace('Login')
    })
  }

  useEffect( () => {                // Recebe o objeto resvaga para editar
      listarUsuario();
  }, [])

  const listarUsuario = () => {
      const refUsuario = firestore.collection("Usuario")
          .doc(auth.currentUser?.uid)
          .get()
          .then(DocumentSnapshot =>{
              setUsuario({
                  id: DocumentSnapshot.id,
                  ...DocumentSnapshot.data()
              })                
          })
      
  } 

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>Bem-vindo!</Text>

        {usuario.tipo === '2' && (
          
          <Text style={styles.titulo}>Você é um usuário administrador</Text>
        )}

      

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

