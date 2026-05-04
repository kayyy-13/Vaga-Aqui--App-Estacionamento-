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
import styles from '../estilo';
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
        return '#ffc107'; // 🟡
      case 'em análise':
        return '#007bff'; // 🔵
      case 'resolvido':
        return '#28a745'; // 🟢
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
      {/* Header com usuário e data */}
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
            👤 {item.usuarioNome}
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

      {/* Tipo */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 14, color: '#555', fontWeight: '600' }}>
          📝 {getTipoEmoji(item.tipo)} {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
        </Text>
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
        <Ionicons name="eye" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>
          Detalhar
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
          Carregando denúncias...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingHorizontal: 16 }]}>
      <Text style={[styles.titulo, { marginBottom: 20, textAlign: 'center' }]}>
        📋 Centro de Denúncias
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
            Nenhuma denúncia ou problema{'\n'}reportado ainda
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
                    👤 {suporteSelecionado.usuarioNome}
                  </Text>

                  <Text style={{ color: '#555', marginBottom: 4 }}>
                    📅 {formatarData(suporteSelecionado.data)}
                  </Text>

                  <Text style={{ color: '#555', marginBottom: 8 }}>
                    📝 {getTipoEmoji(suporteSelecionado.tipo)} {suporteSelecionado.tipo.charAt(0).toUpperCase() + suporteSelecionado.tipo.slice(1)}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: '#fff',
                      backgroundColor: getStatusColor(suporteSelecionado.status),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {getStatusEmoji(suporteSelecionado.status)} {suporteSelecionado.status}
                  </Text>
                </View>

                {/* Descrição Completa */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Descrição Completa
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

                {/* Alterar Status */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Alterar Status
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {['aberto', 'em análise', 'resolvido', 'fechado'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={{
                        backgroundColor: suporteSelecionado.status === status ? getStatusColor(status) : '#e9ecef',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: suporteSelecionado.status === status ? 2 : 0,
                        borderColor: '#fff',
                      }}
                      onPress={() => atualizarStatus(suporteSelecionado.id!, status)}
                    >
                      <Text
                        style={{
                          color: suporteSelecionado.status === status ? '#fff' : '#333',
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {getStatusEmoji(status)} {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Mensagens */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Conversa ({mensagens.length})
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
                      maxHeight: 200,
                    }}
                  >
                    {mensagens.length === 0 ? (
                      <Text style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                        Nenhuma mensagem ainda
                      </Text>
                    ) : (
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {mensagens.map((msg) => (
                          <View
                            key={msg.id}
                            style={{
                              backgroundColor: msg.autor === 'Administrador' ? '#007AFF' : '#e9ecef',
                              padding: 10,
                              borderRadius: 8,
                              marginBottom: 8,
                              alignSelf: msg.autor === 'Administrador' ? 'flex-end' : 'flex-start',
                              maxWidth: '80%',
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
                                marginTop: 4,
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

                {/* Enviar Mensagem */}
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Enviar Mensagem
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      textAlignVertical: 'top',
                      paddingTop: 12,
                      minHeight: 80,
                      marginBottom: 12,
                    },
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