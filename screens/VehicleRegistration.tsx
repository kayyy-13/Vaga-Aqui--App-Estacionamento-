import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles, { themeColors } from '../estilo';

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
    <View style={styles.vehicleScreen}>
      <ScrollView contentContainerStyle={styles.vehicleContent} showsVerticalScrollIndicator={false}>
        <View style={styles.vehicleHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.vehicleBackButton}>
            <Ionicons name="arrow-back" size={22} color={themeColors.secondary} />
          </TouchableOpacity>
          <View style={styles.vehicleHeaderText}>
            <Text style={styles.vehicleTitle}>Cadastro de Veículo</Text>
            <Text style={styles.vehicleSubtitle}>Gerencie os veículos ligados à sua conta</Text>
          </View>
        </View>

        <View style={styles.vehicleFormCard}>
          <TextInput
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            style={[styles.input, styles.vehicleInput]}
            autoCapitalize="characters"
            maxLength={7}
            activeUnderlineColor={themeColors.accent1}
          />

          <TextInput
            label="Modelo"
            value={modelo}
            onChangeText={setModelo}
            style={[styles.input, styles.vehicleInput]}
            activeUnderlineColor={themeColors.accent1}
          />

          <TextInput
            label="Cor"
            value={cor}
            onChangeText={setCor}
            style={[styles.input, styles.vehicleInput]}
            activeUnderlineColor={themeColors.accent1}
          />

          <TouchableOpacity style={styles.vehiclePrimaryButton} onPress={adicionarVeiculo}>
            <Ionicons name="add-circle" size={20} color={themeColors.white} />
            <Text style={styles.buttonText}>Adicionar veículo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleSectionHeader}>
          <Text style={styles.vehicleSectionTitle}>Meus Veículos</Text>
          <Text style={styles.vehicleCount}>{veiculos.length}</Text>
        </View>

        <View style={styles.vehicleList}>
          {veiculos.length === 0 ? (
            <View style={styles.vehicleEmptyCard}>
              <Ionicons name="car-outline" size={34} color={themeColors.textSecondary} />
              <Text style={styles.vehicleEmptyText}>Nenhum veículo cadastrado.</Text>
            </View>
          ) : (
            veiculos.map((item) => (
              <View key={item.id} style={styles.vehicleCard}>
                <View style={styles.vehicleCardIcon}>
                  <Ionicons name="car" size={24} color={themeColors.accent2} />
                </View>

                <View style={styles.vehicleCardInfo}>
                  <Text style={styles.vehiclePlate}>{item.placa}</Text>
                  <Text style={styles.vehicleDetail}>Modelo: {item.modelo}</Text>
                  <Text style={styles.vehicleDetail}>Cor: {item.cor}</Text>
                </View>

              <TouchableOpacity
                style={styles.vehicleDeleteButton}
                onPress={() => excluirVeiculo(item.id)}
              >
                  <Ionicons name="trash" size={18} color={themeColors.white} />
              </TouchableOpacity>
            </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
