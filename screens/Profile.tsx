import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';
import { Usuario } from '../model/Usuario';

export default function Profile() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const listarUsuario = async () => {
      try {
        const doc = await firestore.collection('Usuario').doc(auth.currentUser?.uid).get();
        if (doc.exists) {
          setUsuario({ id: doc.id, ...doc.data() } as Usuario);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    listarUsuario();
  }, []);

  const logout = () => {
    auth
      .signOut()
      .then(() => navigation.replace('Login'))
      .catch(err => console.error('Erro ao sair:', err));
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Perfil</Text>

        <View style={styles.profileFormContainer}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.text}>{usuario?.nome || 'Carregando...'}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.text}>{usuario?.email || 'Carregando...'}</Text>

          <Text style={styles.label}>Tipo de usuário</Text>
          <Text style={styles.text}>{usuario?.tipo === '2' ? 'Administrador' : 'Usuário comum'}</Text>
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
