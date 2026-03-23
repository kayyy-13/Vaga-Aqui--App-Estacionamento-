import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

export default function Admin() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Área do Administrador</Text>

      <View style={styles.buttonView}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Cadastro de Ruas')}
        >
          <Text style={styles.buttonText}>Cadastro de Ruas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Reservas do App')}
        >
          <Text style={styles.buttonText}>Listar Reservas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
