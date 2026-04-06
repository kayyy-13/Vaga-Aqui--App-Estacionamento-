import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { firestore } from '../firebase';
import styles from '../estilo';
import { Usuario } from '../model/Usuario';

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarUsuarios();
  }, []);

  const listarUsuarios = async () => {
    try {
      setCarregando(true);
      const snapshot = await firestore.collection('Usuario').get();
      const usuariosList: Usuario[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Usuario));
      setUsuarios(usuariosList);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de usuários.');
    } finally {
      setCarregando(false);
    }
  };

  const toggleBloqueio = async (usuario: Usuario) => {
    const novoStatus = usuario.bloqueado ? false : true;
    const mensagem = novoStatus ? 'bloquear' : 'desbloquear';

    Alert.alert(
      'Confirmação',
      `Deseja ${mensagem} o usuário ${usuario.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await firestore.collection('Usuario').doc(usuario.id).update({
                bloqueado: novoStatus,
              });
              // Atualizar localmente
              setUsuarios(prev =>
                prev.map(u => u.id === usuario.id ? { ...u, bloqueado: novoStatus } : u)
              );
              Alert.alert('Sucesso', `Usuário ${mensagem}do com sucesso.`);
            } catch (error) {
              console.error('Erro ao alterar status do usuário:', error);
              Alert.alert('Erro', `Não foi possível ${mensagem} o usuário.`);
            }
          },
        },
      ]
    );
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.listItem}>
      <Text style={styles.listText}>Nome: {item.nome}</Text>
      <Text style={styles.listText}>Email: {item.email}</Text>
      <Text style={styles.listText}>Telefone: {item.fone}</Text>
      <Text style={styles.listText}>Tipo: {item.tipo === '2' ? 'Administrador' : 'Usuário'}</Text>
      <Text style={[styles.listText, item.bloqueado ? styles.expiredText : styles.activeText]}>
        Status: {item.bloqueado ? 'Bloqueado' : 'Ativo'}
      </Text>

      <TouchableOpacity
        style={[styles.button, { marginTop: 10, backgroundColor: item.bloqueado ? '#4CAF50' : '#d32f2f' }]}
        onPress={() => toggleBloqueio(item)}
      >
        <Text style={styles.buttonText}>
          {item.bloqueado ? '🔓 Desbloquear' : '🚫 Bloquear'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👥 Gerenciar Usuários</Text>

      {carregando ? (
        <Text style={styles.listText}>Carregando usuários...</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatlistContentContainer}
          ListEmptyComponent={<Text style={styles.listText}>Nenhum usuário encontrado.</Text>}
          renderItem={renderUsuario}
        />
      )}
    </View>
  );
}