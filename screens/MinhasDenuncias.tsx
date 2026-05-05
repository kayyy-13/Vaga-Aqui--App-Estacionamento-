import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { firestore, auth } from '../firebase';
import styles, { themeColors } from '../estilo';
import { Suporte } from '../model/Suporte';
import { Ionicons } from '@expo/vector-icons';

interface Mensagem {
  id: string;
  texto: string;
  data: Date;
  autor: string;
}

export default function MinhasDenuncias() {
  const [suportes, setSuportes] = useState<Suporte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [suporteSelecionado, setSuporteSelecionado] = useState<Suporte | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);

  useEffect(() => {
    carregarMinhasDenuncias();
    const unsubscribe = firestore
      .collection('suporte')
      .where('usuarioId', '==', auth.currentUser?.uid)
      .onSnapshot(
        () => carregarMinhasDenuncias(),
        (error) => console.error('Erro ao ouvir mudanças:', error)
      );
    return () => unsubscribe();
  }, []);

  const carregarMinhasDenuncias = async () => {
    try {
      setCarregando(true);
      const snapshot = await firestore
        .collection('suporte')
        .where('usuarioId', '==', auth.currentUser?.uid)
        .get();

      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate?.() || new Date(),
      } as Suporte));

      setSuportes(dados.sort((a, b) => b.data.getTime() - a.data.getTime()));
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
      Alert.alert('Erro', 'Falha ao carregar suas denúncias');
    } finally {
      setCarregando(false);
    }
  };

  const abrirDetalhes = async (suporte: Suporte) => {
    setSuporteSelecionado(suporte);
    setModalVisible(true);
    await carregarMensagens(suporte.id!);
  };

  const carregarMensagens = async (suporteId: string) => {
    try {
      setCarregandoMensagens(true);
      const snapshot = await firestore
        .collection('suporte')
        .doc(suporteId)
        .collection('mensagens')
        .orderBy('data', 'asc')
        .get();

      const mensagensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate?.() || new Date(),
      } as Mensagem));

      setMensagens(mensagensData);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      Alert.alert('Erro', 'Falha ao carregar mensagens');
    } finally {
      setCarregandoMensagens(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return themeColors.warning; // 🟡
      case 'em análise':
        return themeColors.secondary; // 🔵
      case 'resolvido':
        return themeColors.success; // 🟢
      case 'fechado':
        return themeColors.disabled; // ⚪
      default:
        return themeColors.disabled;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'aberto':
        return '🟡';
      case 'em análise':
        return '🔵';
      case 'resolvido':
        return '🟢';
      case 'fechado':
        return '⚪';
      default:
        return '⚪';
    }
  };

  const getTipoEmoji = (tipo: string) => {
    return tipo === 'denúncia' ? '🚨' : '⚙️';
  };

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(data);
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'Aberto - Aguardando análise';
      case 'em análise':
        return 'Em análise - Estamos trabalhando nisso';
      case 'resolvido':
        return 'Resolvido - Problema solucionado';
      case 'fechado':
        return 'Fechado - Caso encerrado';
      default:
        return status;
    }
  };

  const renderCard = ({ item }: { item: Suporte }) => (
    <View style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}> 
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardTitle}>
            📝 {getTipoEmoji(item.tipo)} {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
          </Text>
          <Text style={styles.cardSubtitle}>
            📅 {formatarData(item.data)}
          </Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}> 
            <Text style={styles.badgeText}>
              {getStatusEmoji(item.status)} {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.cardText} numberOfLines={3}>
          📍 {item.descricao}
        </Text>
      </View>

      <View style={[styles.cardSection, { marginBottom: 0 }]}> 
        <Text style={styles.cardSectionLabel}>Status Atual</Text>
        <Text style={styles.cardText}>{getStatusTexto(item.status)}</Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.cardButton]} onPress={() => abrirDetalhes(item)}>
        <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
        <Text style={[styles.buttonText, { marginLeft: 6 }]}>Ver Conversa</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={themeColors.secondary} />
        <Text style={styles.textHelper}>
          Carregando suas denúncias...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pageContent}>
      <Text style={[styles.titulo, { marginBottom: 20, textAlign: 'center' }]}>
        📋 Minhas Denúncias
      </Text>

      {suportes.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            Você ainda não fez nenhuma{'\n'}denúncia ou relatório
          </Text>
          <Text style={styles.emptyStateText}>
            Use a aba "Suporte" para{'\n'}reportar problemas
          </Text>
        </View>
      ) : (
        <FlatList
          data={suportes}
          keyExtractor={(item) => item.id || ''}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatlistContentContainer}
        />
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.flexOne} behavior="padding">
          <ScrollView
            contentContainerStyle={styles.pageContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.titulo, { margin: 0 }]}>Detalhes da Denúncia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            {suporteSelecionado && (
              <>
                {/* Informações Básicas */}
                <View style={styles.modalSection}>
                  <Text style={styles.cardTitle}>
                    📝 {getTipoEmoji(suporteSelecionado.tipo)} {suporteSelecionado.tipo.charAt(0).toUpperCase() + suporteSelecionado.tipo.slice(1)}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    📅 Enviado em {formatarData(suporteSelecionado.data)}
                  </Text>

                  <View style={[styles.badge, { backgroundColor: getStatusColor(suporteSelecionado.status), marginTop: 8 }]}> 
                    <Text style={styles.badgeText}>
                      {getStatusEmoji(suporteSelecionado.status)} {suporteSelecionado.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Descrição Completa */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Sua Descrição
                </Text>
                <View
                  style={[
                    styles.modalSection,
                    {
                      backgroundColor: themeColors.card,
                      borderLeftWidth: 3,
                      borderLeftColor: getStatusColor(suporteSelecionado.status),
                    },
                  ]}
                >
                  <Text style={styles.modalText}>
                    {suporteSelecionado.descricao}
                  </Text>
                </View>

                {/* Status detalhado */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Status Atual
                </Text>
                <View
                  style={[
                    styles.modalSection,
                    {
                      backgroundColor: 'rgba(4,217,196,0.12)',
                      borderLeftWidth: 3,
                      borderLeftColor: themeColors.secondary,
                    },
                  ]}
                >
                  <Text style={[styles.cardSectionLabel, { color: themeColors.secondary }]}> 
                    📊 {getStatusTexto(suporteSelecionado.status)}
                  </Text>
                  <Text style={styles.modalText}>
                    A administração está trabalhando no seu caso. Você será notificado de qualquer atualização.
                  </Text>
                </View>

                {/* Mensagens */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Conversa com a Administração ({mensagens.length})
                </Text>

                {carregandoMensagens ? (
                  <View style={[styles.modalSection, { alignItems: 'center', padding: 20 }]}> 
                    <ActivityIndicator size="small" color={themeColors.secondary} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.modalSection,
                      {
                        backgroundColor: themeColors.card,
                        maxHeight: 300,
                      },
                    ]}
                  >
                    {mensagens.length === 0 ? (
                      <Text style={[styles.modalText, { textAlign: 'center', fontStyle: 'italic' }]}> 
                        Nenhuma mensagem da administração ainda.{'\n'}Aguarde o contato.
                      </Text>
                    ) : (
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {mensagens.map((msg) => (
                          <View
                            key={msg.id}
                            style={[
                              styles.messageBubble,
                              {
                                backgroundColor: msg.autor === 'Administrador' ? themeColors.secondary : themeColors.card,
                                alignSelf: msg.autor === 'Administrador' ? 'flex-start' : 'flex-end',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.modalText,
                                {
                                  color: msg.autor === 'Administrador' ? themeColors.white : themeColors.textPrimary,
                                  lineHeight: 18,
                                },
                              ]}
                            >
                              {msg.texto}
                            </Text>
                            <Text
                              style={[
                                styles.messageBubbleMeta,
                                {
                                  color: msg.autor === 'Administrador' ? themeColors.white : themeColors.textSecondary,
                                },
                              ]}
                            >
                              {msg.autor} • {formatarData(msg.data)}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.botao,
                    {
                      backgroundColor: themeColors.disabled,
                    },
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.textoBotao, { color: '#fff' }]}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}