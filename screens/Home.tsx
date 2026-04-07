import { ImageBackground, KeyboardAvoidingView, Text } from 'react-native';
import { auth, firestore } from '../firebase';
import styles from '../estilo';

import { Usuario } from "../model/Usuario";
import { useEffect, useState } from "react";

/**
 * Tela inicial do usuário logado.
 * Exibe mensagem de boas-vindas e opções baseadas no tipo de usuário.
 */
export default function Home() {
  const [usuario, setUsuario] = useState<Usuario | null>(null); // Estado para armazenar dados do usuário logado

  useEffect(() => {
    listarUsuario(); // Carrega dados do usuário ao montar o componente
  }, []);

  /**
   * Busca os dados do usuário logado no Firestore.
   */
  const listarUsuario = () => {
    firestore.collection("Usuario")
      .doc(auth.currentUser?.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          setUsuario({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
          } as Usuario);
        }
      });
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/fundo.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>Bem-vindo!</Text>

        {usuario?.tipo === '2' && (
          <Text style={styles.titulo}>Você é um usuário administrador</Text>
        )}

      

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
