import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { firestore } from '../firebase';
import styles, { themeColors } from '../estilo';
import { Suporte } from '../model/Suporte';
import { Ionicons } from '@expo/vector-icons';

interface Mensagem {
  id: string;
  texto: string;
  data: Date;
  autor: string;
}

export default function Denuncias() {
  const [suportes, setSuportes] = useState<Suporte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [suporteSelecionado, setSuporteSelecionado] = useState<Suporte | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  useEffect(() => {
    carregarSuportes();
    const unsubscribe = firestore
      .collection('suporte')
      .onSnapshot(
        () => carregarSuportes(),
        (error) => console.error('Erro ao ouvir mudanças:', error)
      );
    return () => unsubscribe();
  }, []);

  const carregarSuportes = async () => {
    try {
      setCarregando(true);
      const snapshot = await firestore.collection('suporte').get();
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate?.() || new Date(),
      } as Suporte));

      setSuportes(dados.sort((a, b) => b.data.getTime() - a.data.getTime()));
    } catch (error) {
      console.error('Erro ao carregar suportes:', error);
      Alert.alert('Erro', 'Falha ao carregar denúncias');
    } finally {
      setCarregando(false);
    }
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
    try {
      await firestore.collection('suporte').doc(id).update({
        status: novoStatus,
        data: new Date(),
      });

      // Atualizar localmente
      setSuportes(prev =>
        prev.map(s =>
          s.id === id ? { ...s, status: novoStatus as any, data: new Date() } : s
        )
      );

      // Atualizar também no modal se estiver aberto
      if (suporteSelecionado && suporteSelecionado.id === id) {
        setSuporteSelecionado({ ...suporteSelecionado, status: novoStatus as any });
      }

      Alert.alert('Sucesso', `Status alterado para "${novoStatus}"!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Falha ao atualizar status');
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

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !suporteSelecionado?.id) {
      Alert.alert('Erro', 'Digite uma mensagem');
      return;
    }

    try {
      setEnviandoMensagem(true);
      const mensagemData = {
        texto: novaMensagem,
        data: new Date(),
        autor: 'Administrador',
      };

      await firestore
        .collection('suporte')
        .doc(suporteSelecionado.id)
        .collection('mensagens')
        .add(mensagemData);

      // Adicionar à lista local
      setMensagens(prev => [...prev, {
        id: Date.now().toString(),
        ...mensagemData,
      }]);

      setNovaMensagem('');
      Alert.alert('Sucesso', 'Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Falha ao enviar mensagem');
    } finally {
      setEnviandoMensagem(false);
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

  const renderCard = ({ item }: { item: Suporte }) => (
    <View style={[styles.card, styles.denunciaCard, { borderLeftColor: getStatusColor(item.status) }]}> 
      <View style={styles.cardHeader}>
        <View style={[styles.cardHeaderInfo, styles.denunciaCardHeaderInfo]}>
          <Text style={[styles.cardTitle, styles.denunciaCardTitle]}>
            👤 {item.usuarioNome}
          </Text>
          <Text style={[styles.cardSubtitle, styles.denunciaCardSubtitle]}>
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

      <View style={[styles.cardSection, styles.denunciaCardSection]}>
        <Text style={[styles.cardText, styles.denunciaCardText, { fontWeight: '600' }]}> 
          📝 {getTipoEmoji(item.tipo)} {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
        </Text>
      </View>

      <View style={[styles.cardSection, styles.denunciaCardSection]}>
        <Text style={[styles.cardText, styles.denunciaCardText]} numberOfLines={3}>
          📍 {item.descricao}
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.cardButton]} onPress={() => abrirDetalhes(item)}>
        <Ionicons name="eye" size={16} color="#fff" />
        <Text style={[styles.buttonText, { marginLeft: 6 }]}>Detalhar</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={themeColors.secondary} />
        <Text style={styles.textHelper}>
          Carregando denúncias...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pageContent}>
      <Text style={[styles.titulo, { marginBottom: 20, textAlign: 'center' }]}>
        📋 Centro de Denúncias
      </Text>

      {suportes.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            Nenhuma denúncia ou problema{'\n'}reportado ainda
          </Text>
        </View>
      ) : (
        <FlatList
          data={suportes}
          keyExtractor={(item) => item.id || ''}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.denunciaFlatlistContentContainer}
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
                <View style={[styles.modalSection, styles.denunciaModalSection]}>
                  <Text style={[styles.cardTitle, styles.denunciaCardTitle]}>
                    👤 {suporteSelecionado.usuarioNome}
                  </Text>

                  <Text style={[styles.cardSubtitle, styles.denunciaCardSubtitle]}>
                    📅 {formatarData(suporteSelecionado.data)}
                  </Text>

                  <Text style={[styles.cardText, styles.denunciaCardText]}>
                    📝 {getTipoEmoji(suporteSelecionado.tipo)} {suporteSelecionado.tipo.charAt(0).toUpperCase() + suporteSelecionado.tipo.slice(1)}
                  </Text>

                  <View style={[styles.badge, { backgroundColor: getStatusColor(suporteSelecionado.status), marginTop: 8 }]}> 
                    <Text style={styles.badgeText}>
                      {getStatusEmoji(suporteSelecionado.status)} {suporteSelecionado.status}
                    </Text>
                  </View>

                </View>

                {/* Descrição Completa */}
                <Text style={[styles.label, styles.denunciaLabel, { marginBottom: 8 }]}>
                  Descrição Completa
                </Text>
                <View
                  style={[
                    styles.modalSection,
                    styles.denunciaModalSection,
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

                {/* Alterar Status */}
                <Text style={[styles.label, styles.denunciaLabel, { marginBottom: 8 }]}>
                  Alterar Status
                </Text>
                <View style={styles.rowWrap}>
                  {['aberto', 'em análise', 'resolvido', 'fechado'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: suporteSelecionado.status === status ? getStatusColor(status) : themeColors.card,
                        },
                      ]}
                      onPress={() => atualizarStatus(suporteSelecionado.id!, status)}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          {
                            color: suporteSelecionado.status === status ? themeColors.white : themeColors.textPrimary,
                          },
                        ]}
                      >
                        {getStatusEmoji(status)} {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Mensagens */}
                <Text style={[styles.label, styles.denunciaLabel, { marginBottom: 8 }]}>
                  Conversa ({mensagens.length})
                </Text>

                {carregandoMensagens ? (
                  <View style={[styles.modalSection, styles.denunciaModalSection, { alignItems: 'center', padding: 20 }]}> 
                    <ActivityIndicator size="small" color={themeColors.secondary} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.modalSection,
                      styles.denunciaModalSection,
                      {
                        backgroundColor: themeColors.card,
                        maxHeight: 200,
                        padding: 12,
                        marginBottom: 16,
                      },
                    ]}
                  >
                    {mensagens.length === 0 ? (
                      <Text style={[styles.modalText, { textAlign: 'center', fontStyle: 'italic', color: themeColors.textSecondary }]}> 
                        Nenhuma mensagem ainda
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
                                alignSelf: msg.autor === 'Administrador' ? 'flex-end' : 'flex-start',
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

                {/* Enviar Mensagem */}
                <Text style={[styles.label, styles.denunciaLabel, { marginBottom: 8 }]}>
                  Enviar Mensagem
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { marginBottom: 12 },
                  ]}
                  placeholder="Digite sua mensagem..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={novaMensagem}
                  onChangeText={setNovaMensagem}
                  editable={!enviandoMensagem}
                />

                <TouchableOpacity
                  style={[
                    styles.botao,
                    { opacity: enviandoMensagem ? 0.6 : 1, marginBottom: 12 },
                  ]}
                  onPress={enviarMensagem}
                  disabled={enviandoMensagem}
                >
                  {enviandoMensagem ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.textoBotao}>Enviar Mensagem</Text>
                  )}
                </TouchableOpacity>

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
