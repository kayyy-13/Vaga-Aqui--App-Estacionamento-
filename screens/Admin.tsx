import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../firebase';
import { Resvaga } from '../model/Resvaga';
import styles, { themeColors } from '../estilo';

type Atividade = {
  id: string;
  titulo: string;
  descricao: string;
  data: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type VagaResumo = {
  rua: string;
  status: string;
};

export default function Admin() {
  const navigation = useNavigation<any>();
  const [totalVagas, setTotalVagas] = useState(0);
  const [vagasOcupadas, setVagasOcupadas] = useState(0);
  const [reservasDia, setReservasDia] = useState(0);
  const [denunciasPendentes, setDenunciasPendentes] = useState(0);
  const [ruaMaisUtilizada, setRuaMaisUtilizada] = useState('Sem dados');
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  useEffect(() => {
    let vagasPorId: Record<string, VagaResumo> = {};
    let reservasCache: Array<{ id: string; reserva: Resvaga }> = [];
    let atividadesReservas: Atividade[] = [];
    let atividadesDenuncias: Atividade[] = [];

    const atualizarAtividades = () => {
      setAtividades(
        [...atividadesDenuncias, ...atividadesReservas]
          .sort((a, b) => b.data - a.data)
          .slice(0, 5)
      );
    };

    const atualizarResumoReservas = () => {
      const hoje = new Date().toLocaleDateString('pt-BR');
      const usoPorRua: Record<string, number> = {};
      let dia = 0;

      atividadesReservas = reservasCache.map(({ id, reserva }) => {
        const statusReserva = reserva.statusReserva || 'ativa';
        const reservaAtiva = statusReserva === 'ativa' && reserva.expiraEm > Date.now();
        const rua = vagasPorId[reserva.idVaga]?.rua || 'Rua não identificada';

        usoPorRua[rua] = (usoPorRua[rua] || 0) + 1;

        if (reserva.data === hoje && reservaAtiva) {
          dia++;
        }

        return {
          id: `reserva-${id}`,
          titulo: 'Reserva registrada',
          descricao: `${rua} • ${reserva.data || 'sem data'} ${reserva.hora || ''}`.trim(),
          data: reserva.expiraEm || reserva.finalizadaEm || Date.now(),
          icon: 'calendar',
          color: themeColors.secondary,
        };
      });

      const ruaMaisUsada = Object.entries(usoPorRua).sort((a, b) => b[1] - a[1])[0];
      setReservasDia(dia);
      setRuaMaisUtilizada(ruaMaisUsada ? `${ruaMaisUsada[0]} (${ruaMaisUsada[1]})` : 'Sem dados');
      atualizarAtividades();
    };

    const unsubscribeRuas = firestore.collection('Ruas').onSnapshot(
      (snapshot) => {
        const vagas: Record<string, VagaResumo> = {};
        let ocupadasAgora = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || 'livre';
          vagas[doc.id] = {
            rua: data.rua || data.nome || 'Rua sem nome',
            status,
          };

          if (status !== 'livre') {
            ocupadasAgora++;
          }
        });

        vagasPorId = vagas;
        setTotalVagas(snapshot.size);
        setVagasOcupadas(ocupadasAgora);
        atualizarResumoReservas();
      },
      (error) => {
        console.error('Erro ao buscar vagas:', error);
      }
    );

    const unsubscribeReservas = firestore.collectionGroup('Resvaga').onSnapshot(
      (snapshot) => {
        reservasCache = snapshot.docs.map((doc) => ({
          id: doc.id,
          reserva: new Resvaga(doc.data()),
        }));

        atualizarResumoReservas();
      },
      (error) => {
        console.error('Erro ao buscar reservas:', error);
      }
    );

    const unsubscribeDenuncias = firestore.collection('suporte').onSnapshot(
      (snapshot) => {
        let pendentes = 0;

        atividadesDenuncias = snapshot.docs.map((doc) => {
          const denuncia = doc.data();
          const status = denuncia.status || 'aberto';
          const tipo = denuncia.tipo || 'denúncia';
          const data = denuncia.data?.toDate?.()?.getTime?.() || Date.now();

          if (status !== 'resolvido' && status !== 'fechado') {
            pendentes++;
          }

          return {
            id: `denuncia-${doc.id}`,
            titulo: status === 'resolvido' ? 'Denúncia resolvida' : 'Denúncia recebida',
            descricao: `${tipo} • ${status}`,
            data,
            icon: status === 'resolvido' ? 'checkmark-circle' : 'alert-circle',
            color: status === 'resolvido' ? themeColors.success : themeColors.warning,
          };
        });

        setDenunciasPendentes(pendentes);
        atualizarAtividades();
      },
      (error) => {
        console.error('Erro ao buscar denúncias:', error);
      }
    );

    return () => {
      unsubscribeRuas();
      unsubscribeReservas();
      unsubscribeDenuncias();
    };
  }, []);

  const taxaOcupacao = useMemo(() => {
    if (totalVagas === 0) {
      return 0;
    }

    return Math.round((vagasOcupadas / totalVagas) * 100);
  }, [totalVagas, vagasOcupadas]);

  const chartItems = [
    { label: 'Livres', value: Math.max(totalVagas - vagasOcupadas, 0), color: themeColors.success },
    { label: 'Ocupadas', value: vagasOcupadas, color: themeColors.danger },
    { label: 'Reservas', value: reservasDia, color: themeColors.secondary },
    { label: 'Pendentes', value: denunciasPendentes, color: themeColors.warning },
  ];

  const maxChartValue = Math.max(...chartItems.map((item) => item.value), 1);

  const quickActions = [
    { label: 'Gerenciar usuários', icon: 'people', route: 'Gerenciar Usuários', color: themeColors.secondary },
    { label: 'Cadastro de ruas', icon: 'map', route: 'Cadastro de Ruas', color: themeColors.accent1 },
    { label: 'Reservas', icon: 'calendar', route: 'Reservas do App', color: themeColors.accent2 },
    { label: 'Denúncias', icon: 'alert-circle', route: 'Denúncias', color: themeColors.warning },
  ] as const;

  return (
    <ScrollView
      style={styles.adminScreen}
      contentContainerStyle={styles.adminContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.adminTitle}>Área do Administrador</Text>
      <Text style={styles.adminSubtitle}>Resumo operacional do estacionamento</Text>

      <View style={styles.adminMetricsGrid}>
        <View style={styles.adminMetricCard}>
          <View style={[styles.adminMetricIcon, { backgroundColor: 'rgba(4,217,196,0.16)' }]}>
            <Ionicons name="car" size={30} color={themeColors.accent2} />
          </View>
          <Text style={styles.adminMetricLabel}>Total de vagas</Text>
          <Text style={styles.adminMetricValue}>{totalVagas}</Text>
        </View>

        <View style={styles.adminMetricCard}>
          <View style={[styles.adminMetricIcon, { backgroundColor: 'rgba(255,107,107,0.16)' }]}>
            <Ionicons name="radio-button-on" size={30} color={themeColors.danger} />
          </View>
          <Text style={styles.adminMetricLabel}>Ocupadas</Text>
          <Text style={styles.adminMetricValue}>{vagasOcupadas}</Text>
        </View>

        <View style={styles.adminMetricCard}>
          <View style={[styles.adminMetricIcon, { backgroundColor: 'rgba(242,217,4,0.16)' }]}>
            <Ionicons name="alert-circle" size={30} color={themeColors.warning} />
          </View>
          <Text style={styles.adminMetricLabel}>Denúncias</Text>
          <Text style={styles.adminMetricValue}>{denunciasPendentes}</Text>
        </View>
      </View>

      <View style={styles.adminStatsRow}>
        <View style={styles.adminStatCard}>
          <Text style={styles.adminStatLabel}>Taxa de ocupação</Text>
          <Text style={styles.adminStatValue}>{taxaOcupacao}%</Text>
        </View>
        <View style={styles.adminStatCard}>
          <Text style={styles.adminStatLabel}>Reservas do dia</Text>
          <Text style={styles.adminStatValue}>{reservasDia}</Text>
        </View>
      </View>

      <View style={styles.adminWideStatCard}>
        <Text style={styles.adminStatLabel}>Rua mais utilizada</Text>
        <Text style={styles.adminWideStatValue}>{ruaMaisUtilizada}</Text>
      </View>

      <View style={styles.adminPanel}>
        <View style={styles.adminSectionHeader}>
          <Text style={styles.adminSectionTitle}>Visão geral</Text>
          <Text style={styles.adminSectionMeta}>{taxaOcupacao}% ocupação</Text>
        </View>

        <View style={styles.adminChart}>
          {chartItems.map((item) => {
            const height = Math.max((item.value / maxChartValue) * 130, 16);
            return (
              <View key={item.label} style={styles.adminChartColumn}>
                <Text style={styles.adminChartValue}>{item.value}</Text>
                <View style={styles.adminChartTrack}>
                  <View style={[styles.adminChartFill, { height, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.adminChartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.adminPanel}>
        <View style={styles.adminSectionHeader}>
          <Text style={styles.adminSectionTitle}>Ações rápidas</Text>
        </View>

        <View style={styles.adminQuickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.route}
              style={styles.adminQuickAction}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={[styles.adminQuickIcon, { backgroundColor: `${action.color}26` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.adminQuickText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.adminPanel}>
        <View style={styles.adminSectionHeader}>
          <Text style={styles.adminSectionTitle}>Denúncias pendentes</Text>
          <Text style={styles.adminSectionMeta}>{denunciasPendentes}</Text>
        </View>

        <TouchableOpacity
          style={styles.adminPendingCard}
          onPress={() => navigation.navigate('Denúncias')}
        >
          <Ionicons name="alert-circle" size={30} color={themeColors.warning} />
          <View style={styles.adminPendingInfo}>
            <Text style={styles.adminPendingTitle}>
              {denunciasPendentes === 0 ? 'Nenhuma denúncia pendente' : `${denunciasPendentes} denúncia(s) aguardando análise`}
            </Text>
            <Text style={styles.adminPendingText}>Toque para abrir a central de denúncias.</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.adminPanel}>
        <View style={styles.adminSectionHeader}>
          <Text style={styles.adminSectionTitle}>Últimas atividades</Text>
        </View>

        {atividades.length === 0 ? (
          <Text style={styles.adminEmptyText}>Nenhuma atividade recente.</Text>
        ) : (
          atividades.map((atividade) => (
            <View key={atividade.id} style={styles.adminActivityItem}>
              <View style={[styles.adminActivityIcon, { backgroundColor: `${atividade.color}24` }]}>
                <Ionicons name={atividade.icon} size={18} color={atividade.color} />
              </View>
              <View style={styles.adminActivityTextWrap}>
                <Text style={styles.adminActivityTitle}>{atividade.titulo}</Text>
                <Text style={styles.adminActivityText}>{atividade.descricao}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
