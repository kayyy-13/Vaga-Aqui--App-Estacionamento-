import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, firestore } from '../firebase';
import styles from '../estilo';
import { Usuario } from '../model/Usuario';
import { useEffect } from 'react';

export default function Suporte() {
  const [tipo, setTipo] = useState<'denúncia' | 'problema' | 'outros'>('problema');
  const [tipoPersonalizado, setTipoPersonalizado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    listarUsuario();
  }, []);

  const listarUsuario = () => {
    firestore
      .collection('Usuario')
      .doc(auth.currentUser?.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          setUsuario({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          } as Usuario);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar usuário:', error);
      });
  };

  const enviarSuporte = async () => {
    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, descreva seu problema ou denúncia');
      return;
    }

    if (tipo === 'outros' && !tipoPersonalizado.trim()) {
      Alert.alert('Erro', 'Por favor, especifique o tipo de problema');
      return;
    }

    if (descricao.length < 10) {
      Alert.alert('Erro', 'A descrição deve ter no mínimo 10 caracteres');
      return;
    }

    if (!usuario) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setCarregando(true);

    try {
      // Preparar a descrição completa incluindo o tipo personalizado se necessário
      let descricaoCompleta = descricao;
      if (tipo === 'outros' && tipoPersonalizado.trim()) {
        descricaoCompleta = `[${tipoPersonalizado}] ${descricao}`;
      }

      await firestore.collection('suporte').add({
        usuarioId: auth.currentUser?.uid,
        tipo: tipo,
        descricao: descricaoCompleta,
        data: new Date(),
        status: 'aberto',
        usuarioNome: usuario.nome || 'Usuário sem nome',
      });

      Alert.alert('Sucesso', 'Seu ' + (tipo === 'outros' ? tipoPersonalizado : tipo) + ' foi enviado com sucesso!');
      setDescricao('');
      setTipoPersonalizado('');
      setTipo('problema');
    } catch (error) {
      console.error('Erro ao enviar suporte:', error);
      Alert.alert('Erro', 'Falha ao enviar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.container, { paddingVertical: 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.titulo, { marginBottom: 30 }]}>
          Central de Suporte
        </Text>

        {/* Campo Tipo */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.label, { marginBottom: 8 }]}>
            Tipo de Comunicação
          </Text>
          <View
            style={[
              styles.input,
              {
                justifyContent: 'center',
                paddingHorizontal: 0,
                paddingVertical: 0,
              },
            ]}
          >
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) =>
                setTipo(itemValue as 'denúncia' | 'problema' | 'outros')
              }
              style={{ color: '#333' }}
            >
              <Picker.Item label="Problema técnico" value="problema" />
              <Picker.Item label="Denúncia" value="denúncia" />
              <Picker.Item label="Outros" value="outros" />
            </Picker>
          </View>
        </View>

        {/* Campo Tipo Personalizado (aparece apenas quando "Outros" é selecionado) */}
        {tipo === 'outros' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.label, { marginBottom: 8 }]}>
              Especifique o tipo de problema
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Sugestão, elogio, dúvida..."
              placeholderTextColor="#999"
              value={tipoPersonalizado}
              onChangeText={setTipoPersonalizado}
              editable={!carregando}
            />
          </View>
        )}

        {/* Campo Descrição */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Descrição</Text>
          <TextInput
            style={[
              styles.input,
              {
                textAlignVertical: 'top',
                paddingTop: 12,
                minHeight: 120,
              },
            ]}
            placeholder="Descreva em detalhes o seu problema ou denúncia..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={descricao}
            onChangeText={setDescricao}
            editable={!carregando}
          />
          <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
            {descricao.length}/500
          </Text>
        </View>

        {/* Botão Enviar */}
        <TouchableOpacity
          style={[
            styles.botao,
            { opacity: carregando ? 0.6 : 1, marginTop: 20 },
          ]}
          onPress={enviarSuporte}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBotao}>Enviar {tipo}</Text>
          )}
        </TouchableOpacity>

        {/* Informações */}
        <View
          style={{
            marginTop: 30,
            padding: 15,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
            ℹ️ Informações importantes:
          </Text>
          <Text style={{ color: '#555', fontSize: 13, lineHeight: 18 }}>
            • Suas comunicações serão analisadas pela equipe de administração
            {'\n'}• Você receberá uma resposta em breve
            {'\n'}• Denúncias anônimas serão tratadas com confidencialidade
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
