import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
}

export default function VehicleRegistration() {
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    listarVeiculos();
  }, []);

  const listarVeiculos = async () => {
    try {
      const snapshot = await firestore
        .collection('Usuario')
        .doc(auth.currentUser?.uid)
        .collection('Veiculos')
        .get();

      const lista: Veiculo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Veiculo));

      setVeiculos(lista);
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
    }
  };

  const adicionarVeiculo = async () => {
    if (!placa.trim() || !modelo.trim() || !cor.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const novoVeiculo = {
        placa: placa.toUpperCase(),
        modelo,
        cor,
      };

      await firestore
        .collection('Usuario')
        .doc(auth.currentUser?.uid)
        .collection('Veiculos')
        .add(novoVeiculo);

      Alert.alert('Sucesso', 'Veículo adicionado com sucesso!');
      setPlaca('');
      setModelo('');
      setCor('');
      listarVeiculos();
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      Alert.alert('Erro', 'Erro ao adicionar veículo.');
    }
  };

  const excluirVeiculo = async (id: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja excluir este veículo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: async () => {
          try {
            await firestore
              .collection('Usuario')
              .doc(auth.currentUser?.uid)
              .collection('Veiculos')
              .doc(id)
              .delete();

            Alert.alert('Sucesso', 'Veículo excluído com sucesso!');
            listarVeiculos();
          } catch (error) {
            console.error('Erro ao excluir veículo:', error);
            Alert.alert('Erro', 'Erro ao excluir veículo.');
          }
        }}
      ]
    );
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonRow}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>🚗 Cadastro de Veículo</Text>

        <View style={styles.inputView}>
          <TextInput
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            style={styles.input}
            autoCapitalize="characters"
            maxLength={7}
          />

          <TextInput
            label="Modelo"
            value={modelo}
            onChangeText={setModelo}
            style={styles.input}
          />

          <TextInput
            label="Cor"
            value={cor}
            onChangeText={setCor}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={adicionarVeiculo}>
            <Text style={styles.buttonText}>➕ Adicionar veículo</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.titulo, { fontSize: 20, marginTop: 20, marginBottom: 10 }]}>Meus Veículos</Text>

        <FlatList
          data={veiculos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listText}>Placa: {item.placa}</Text>
              <Text style={styles.listText}>Modelo: {item.modelo}</Text>
              <Text style={styles.listText}>Cor: {item.cor}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete, { marginTop: 10 }]}
                onPress={() => excluirVeiculo(item.id)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>Nenhum veículo cadastrado.</Text>}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}