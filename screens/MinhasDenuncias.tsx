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
import styles from '../estilo';
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
        return '#ffc107'; // 🟡
      case 'em análise':
        return '#007bff'; // 🔵
      case 'resolvido':
        return '#28a745'; // 🟢
      case 'fechado':
        return '#6c757d'; // ⚪
      default:
        return '#6c757d';
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
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
      }}
    >
      {/* Header com tipo e data */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
            📝 {getTipoEmoji(item.tipo)} {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            📅 {formatarData(item.data)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 12,
              color: '#fff',
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {getStatusEmoji(item.status)} {item.status}
          </Text>
        </View>
      </View>

      {/* Descrição */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            color: '#444',
            lineHeight: 20,
          }}
          numberOfLines={3}
        >
          📍 {item.descricao}
        </Text>
      </View>

      {/* Status detalhado */}
      <View
        style={{
          backgroundColor: '#f8f9fa',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#333', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
          📊 Status Atual
        </Text>
        <Text style={{ color: '#555', fontSize: 13, lineHeight: 18 }}>
          {getStatusTexto(item.status)}
        </Text>
      </View>

      {/* Botão Detalhar */}
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          borderRadius: 8,
          paddingVertical: 10,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
        onPress={() => abrirDetalhes(item)}
      >
        <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>
          Ver Conversa
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#666' }}>
          Carregando suas denúncias...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingHorizontal: 16 }]}>
      <Text style={[styles.titulo, { marginBottom: 20, textAlign: 'center' }]}>
        📋 Minhas Denúncias
      </Text>

      {suportes.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={{ color: '#999', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
            Você ainda não fez nenhuma{'\n'}denúncia ou relatório
          </Text>
          <Text style={{ color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            Use a aba "Suporte" para{'\n'}reportar problemas
          </Text>
        </View>
      ) : (
        <FlatList
          data={suportes}
          keyExtractor={(item) => item.id || ''}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            contentContainerStyle={[styles.container, { paddingVertical: 20 }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={[styles.titulo, { margin: 0 }]}>Detalhes da Denúncia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {suporteSelecionado && (
              <>
                {/* Informações Básicas */}
                <View
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 8,
                      color: '#333',
                      fontSize: 16,
                    }}
                  >
                    📝 {getTipoEmoji(suporteSelecionado.tipo)} {suporteSelecionado.tipo.charAt(0).toUpperCase() + suporteSelecionado.tipo.slice(1)}
                  </Text>

                  <Text style={{ color: '#555', marginBottom: 4 }}>
                    📅 Enviado em {formatarData(suporteSelecionado.data)}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      color: '#fff',
                      backgroundColor: getStatusColor(suporteSelecionado.status),
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                      marginTop: 8,
                    }}
                  >
                    {getStatusEmoji(suporteSelecionado.status)} {suporteSelecionado.status.toUpperCase()}
                  </Text>
                </View>

                {/* Descrição Completa */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Sua Descrição
                </Text>
                <View
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeftWidth: 3,
                    borderLeftColor: getStatusColor(suporteSelecionado.status),
                  }}
                >
                  <Text style={{ color: '#333', lineHeight: 20 }}>
                    {suporteSelecionado.descricao}
                  </Text>
                </View>

                {/* Status detalhado */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Status Atual
                </Text>
                <View
                  style={{
                    backgroundColor: '#e8f4fd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeftWidth: 3,
                    borderLeftColor: '#007AFF',
                  }}
                >
                  <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                    📊 {getStatusTexto(suporteSelecionado.status)}
                  </Text>
                  <Text style={{ color: '#555', fontSize: 13 }}>
                    A administração está trabalhando no seu caso. Você será notificado de qualquer atualização.
                  </Text>
                </View>

                {/* Mensagens */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Conversa com a Administração ({mensagens.length})
                </Text>

                {carregandoMensagens ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <ActivityIndicator size="small" color="#007AFF" />
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 16,
                      maxHeight: 300,
                    }}
                  >
                    {mensagens.length === 0 ? (
                      <Text style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                        Nenhuma mensagem da administração ainda.{'\n'}Aguarde o contato.
                      </Text>
                    ) : (
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {mensagens.map((msg) => (
                          <View
                            key={msg.id}
                            style={{
                              backgroundColor: msg.autor === 'Administrador' ? '#007AFF' : '#e9ecef',
                              padding: 12,
                              borderRadius: 8,
                              marginBottom: 8,
                              alignSelf: msg.autor === 'Administrador' ? 'flex-start' : 'flex-end',
                              maxWidth: '85%',
                            }}
                          >
                            <Text
                              style={{
                                color: msg.autor === 'Administrador' ? '#fff' : '#333',
                                fontSize: 14,
                                lineHeight: 18,
                              }}
                            >
                              {msg.texto}
                            </Text>
                            <Text
                              style={{
                                color: msg.autor === 'Administrador' ? '#e6f3ff' : '#666',
                                fontSize: 10,
                                marginTop: 6,
                              }}
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
                      backgroundColor: '#6c757d',
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