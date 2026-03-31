import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../firebase';
import { Rua } from '../model/Rua';
import { Resvaga } from '../model/Resvaga';
import styles from '../estilo';

export default function Admin() {
  const navigation = useNavigation();
  const [totalVagas, setTotalVagas] = useState(0);
  const [vagasOcupadas, setVagasOcupadas] = useState(0);
  const [reservasDia, setReservasDia] = useState(0);

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      // Buscar ruas
      const ruasSnap = await firestore.collection('Ruas').get();
      let total = 0;
      ruasSnap.forEach(doc => {
        const rua = new Rua(doc.data());
        total += parseInt(rua.vaga) || 0;
      });
      setTotalVagas(total);

      // Buscar todas as reservas
      const reservasSnap = await firestore.collectionGroup('Resvaga').get();
      const hoje = new Date().toLocaleDateString('pt-BR');
      let ocupadas = 0;
      let dia = 0;
      reservasSnap.forEach(doc => {
        const res = new Resvaga(doc.data());
        if (res.expiraEm > Date.now()) {
          ocupadas++;
        }
        if (res.data === hoje) {
          dia++;
        }
      });
      setVagasOcupadas(ocupadas);
      setReservasDia(dia);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Área do Administrador</Text>

      <View style={styles.dashboard}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Total de Vagas</Text>
          <Text style={styles.metricValue}>{totalVagas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Vagas Ocupadas</Text>
          <Text style={styles.metricValue}>{vagasOcupadas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Reservas do Dia</Text>
          <Text style={styles.metricValue}>{reservasDia}</Text>
        </View>
      </View>

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
          <Text style={styles.buttonText}>Lista de Reservas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
