import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../firebase';
import { Resvaga } from '../model/Resvaga';
import styles from '../estilo';

export default function Admin() {
  const navigation = useNavigation<any>();
  const [totalVagas, setTotalVagas] = useState(0);
  const [vagasOcupadas, setVagasOcupadas] = useState(0);
  const [reservasDia, setReservasDia] = useState(0);

  useEffect(() => {
    const unsubscribeRuas = firestore.collection('Ruas').onSnapshot(
      (snapshot) => {
        const total = snapshot.size;

        setTotalVagas(total);
      },
      (error) => {
        console.error('Erro ao buscar vagas:', error);
      }
    );

    const unsubscribeReservas = firestore.collectionGroup('Resvaga').onSnapshot(
      (snapshot) => {
        const hoje = new Date().toLocaleDateString('pt-BR');
        let ocupadas = 0;
        let dia = 0;

        snapshot.forEach((doc) => {
          const res = new Resvaga(doc.data());
          const statusReserva = res.statusReserva || 'ativa';
          const reservaAtiva = statusReserva === 'ativa' && res.expiraEm > Date.now();

          if (reservaAtiva) {
            ocupadas++;
          }

          if (res.data === hoje && reservaAtiva) {
            dia++;
          }
        });

        setVagasOcupadas(ocupadas);
        setReservasDia(dia);
      },
      (error) => {
        console.error('Erro ao buscar reservas:', error);
      }
    );

    return () => {
      unsubscribeRuas();
      unsubscribeReservas();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Área do Administrador</Text>

      <View style={styles.dashboard}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>🚗 Total de Vagas</Text>
          <Text style={styles.metricValue}>{totalVagas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>🔴 Vagas Ocupadas</Text>
          <Text style={styles.metricValue}>{vagasOcupadas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Reservas do Dia</Text>
          <Text style={styles.metricValue}>{reservasDia}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Visão geral rápida</Text>
        <View style={styles.chartBars}>
          {[
            { label: 'Total', value: totalVagas, color: '#02A676', formatted: `${totalVagas}` },
            { label: 'Ocupadas', value: vagasOcupadas, color: '#d32f2f', formatted: `${vagasOcupadas}` },
            { label: 'Dia', value: reservasDia, color: '#005A5B', formatted: `${reservasDia}` },
          ].map(item => {
            const maxValue = Math.max(totalVagas, vagasOcupadas, reservasDia, 1);
            const height = (item.value / maxValue) * 140;
            return (
              <View key={item.label} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: Math.max(height, 20) }]}> 
                  <View style={[styles.chartBarFill, { backgroundColor: item.color }]} />
                </View>
                <Text style={styles.chartValueLabel}>{item.formatted}</Text>
                <Text style={styles.chartBarLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.buttonView}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Gerenciar Usuários')}
        >
          <Text style={styles.buttonText}>👥 Gerenciar Usuários</Text>
        </TouchableOpacity>

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
