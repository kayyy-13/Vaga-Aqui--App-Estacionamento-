import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../firebase';
import styles, { themeColors } from '../estilo';
import { Usuario } from '../model/Usuario';

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'administradores'>('usuarios');

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
              setUsuarios(prev =>
                prev.map(u => (u.id === usuario.id ? new Usuario({ ...u, bloqueado: novoStatus }) : u))
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

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const usuariosPorAba = usuarios.filter((usuario) => {
      const isAdministrador = usuario.tipo === '2';

      return abaAtiva === 'administradores' ? isAdministrador : !isAdministrador;
    });

    if (!termo) {
      return usuariosPorAba;
    }

    return usuariosPorAba.filter((usuario) => {
      return (
        usuario.nome?.toLowerCase().includes(termo) ||
        usuario.email?.toLowerCase().includes(termo) ||
        usuario.fone?.toLowerCase().includes(termo)
      );
    });
  }, [abaAtiva, busca, usuarios]);

  const resumoUsuarios = useMemo(() => {
    const bloqueados = usuarios.filter((usuario) => usuario.bloqueado).length;
    const administradores = usuarios.filter((usuario) => usuario.tipo === '2').length;

    return {
      total: usuarios.length,
      ativos: usuarios.length - bloqueados,
      bloqueados,
      comuns: usuarios.length - administradores,
      administradores,
    };
  }, [usuarios]);

  const getInitials = (name: string) => {
    const initials = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    return initials || 'U';
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{getInitials(item.nome)}</Text>
        </View>

        <View style={styles.userCardInfo}>
          <Text style={styles.userCardName}>{item.nome || 'Usuário sem nome'}</Text>
          <Text style={styles.userCardEmail}>{item.email || 'E-mail não informado'}</Text>
          <View style={styles.userPhoneRow}>
            <Ionicons name="call" size={14} color={themeColors.textSecondary} />
            <Text style={styles.userPhoneText}>{item.fone || 'Telefone não informado'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userMetaRow}>
        <View style={[styles.userPill, item.bloqueado ? styles.userPillDanger : styles.userPillSuccess]}>
          <Ionicons
            name={item.bloqueado ? 'close-circle' : 'checkmark-circle'}
            size={15}
            color={item.bloqueado ? themeColors.danger : themeColors.success}
          />
          <Text style={[styles.userPillText, item.bloqueado ? styles.userPillDangerText : styles.userPillSuccessText]}>
            {item.bloqueado ? 'Bloqueado' : 'Ativo'}
          </Text>
        </View>

        <View style={styles.userPill}>
          <Ionicons name={item.tipo === '2' ? 'shield-checkmark' : 'person'} size={15} color={themeColors.accent1} />
          <Text style={styles.userPillText}>{item.tipo === '2' ? 'Administrador' : 'Usuário'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.userActionButton, { backgroundColor: item.bloqueado ? themeColors.accent2 : themeColors.danger }]}
        onPress={() => toggleBloqueio(item)}
      >
        <Ionicons name={item.bloqueado ? 'lock-open' : 'ban'} size={18} color={themeColors.white} />
        <Text style={styles.userActionButtonText}>
          {item.bloqueado ? 'Desbloquear' : 'Bloquear'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👥 Gerenciar Usuários</Text>

      <View style={styles.userSearchBox}>
        <Ionicons name="search" size={18} color={themeColors.textSecondary} />
        <TextInput
          style={styles.userSearchInput}
          placeholder="Buscar usuário"
          placeholderTextColor={themeColors.textSecondary}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.userSummaryRow}>
        <View style={styles.userSummaryItem}>
          <Ionicons name="people" size={18} color={themeColors.accent1} />
          <Text style={styles.userSummaryText}>{resumoUsuarios.total}</Text>
        </View>
        <View style={styles.userSummaryItem}>
          <Ionicons name="checkmark-circle" size={18} color={themeColors.success} />
          <Text style={styles.userSummaryText}>{resumoUsuarios.ativos}</Text>
        </View>
        <View style={styles.userSummaryItem}>
          <Ionicons name="close-circle" size={18} color={themeColors.danger} />
          <Text style={styles.userSummaryText}>{resumoUsuarios.bloqueados}</Text>
        </View>
      </View>

      <View style={styles.userTabs}>
        <TouchableOpacity
          style={[styles.userTab, abaAtiva === 'usuarios' && styles.userTabActive]}
          onPress={() => setAbaAtiva('usuarios')}
        >
          <Ionicons
            name="person"
            size={17}
            color={abaAtiva === 'usuarios' ? themeColors.background : themeColors.accent1}
          />
          <Text style={[styles.userTabText, abaAtiva === 'usuarios' && styles.userTabTextActive]}>
            Usuários ({resumoUsuarios.comuns})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userTab, abaAtiva === 'administradores' && styles.userTabActive]}
          onPress={() => setAbaAtiva('administradores')}
        >
          <Ionicons
            name="shield-checkmark"
            size={17}
            color={abaAtiva === 'administradores' ? themeColors.background : themeColors.accent1}
          />
          <Text style={[styles.userTabText, abaAtiva === 'administradores' && styles.userTabTextActive]}>
            Admins ({resumoUsuarios.administradores})
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <Text style={styles.userFeedbackText}>Carregando usuários...</Text>
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.userListContent}
          ListEmptyComponent={<Text style={styles.userFeedbackText}>Nenhum usuário encontrado.</Text>}
          renderItem={renderUsuario}
        />
      )}
    </View>
  );
}
