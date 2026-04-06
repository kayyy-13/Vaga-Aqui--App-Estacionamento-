import React, { useEffect, useState } from 'react';
import { FlatList, TextInput, View, Text, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';
import { Usuario } from '../model/Usuario';
import { Resvaga } from '../model/Resvaga';

export default function Profile() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState<'main' | 'notifications' | 'changePassword' | 'profileData'>('main');
  const [historico, setHistorico] = useState<Resvaga[]>([]);
  const [detalhesVagas, setDetalhesVagas] = useState<{[key: string]: {rua: string; vaga: string}}>({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'ativas' | 'finalizadas'>('ativas');
  const navigation = useNavigation<any>();

  useEffect(() => {
    const listarUsuario = async () => {
      try {
        const doc = await firestore.collection('Usuario').doc(auth.currentUser?.uid).get();
        if (doc.exists) {
          const userData = { id: doc.id, ...doc.data() } as Usuario;
          setUsuario(userData);
          setEditName(userData.nome || '');
          setEditEmail(userData.email || '');
          setEditPhone(userData.fone || '');
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    listarUsuario();
  }, []);

  const logout = () => {
    auth
      .signOut()
      .then(() => navigation.replace('Login'))
      .catch(err => console.error('Erro ao sair:', err));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const snapshot = await firestore
        .collection('Usuario')
        .doc(auth.currentUser?.uid)
        .collection('Resvaga')
        .get();

      const reservas: Resvaga[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Resvaga));

      const ids = reservas.map(r => r.idVaga).filter(id => id);
      const detalhes: {[key: string]: {rua: string; vaga: string}} = {};
      for (const id of ids) {
        const doc = await firestore.collection('Ruas').doc(id).get();
        if (doc.exists) {
          detalhes[id] = { rua: doc.data()?.rua || '', vaga: doc.data()?.vaga || '' };
        }
      }

      const reservasOrdenadas = reservas.sort((a, b) => {
        const expiredA = a.expiraEm <= Date.now() ? 1 : 0;
        const expiredB = b.expiraEm <= Date.now() ? 1 : 0;
        if (expiredA !== expiredB) return expiredA - expiredB;
        return (b.expiraEm || 0) - (a.expiraEm || 0);
      });

      setDetalhesVagas(detalhes);
      setHistorico(reservasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isExpired = (item: Resvaga) => {
    return item.expiraEm ? item.expiraEm <= Date.now() : false;
  };

  const formatExpiration = (item: Resvaga) => {
    if (!item.expiraEm) return '';
    const date = new Date(item.expiraEm);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = (item: Resvaga) => {
    if (!item.expiraEm) return false;
    
    const now = Date.now();
    
    // Pode cancelar se ainda não expirou
    return now <= item.expiraEm;
  };

  const cancelarReserva = async (item: Resvaga) => {
    Alert.alert(
      "Confirmação",
      "Você tem certeza que deseja cancelar esta reserva?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", onPress: async () => {
          try {
            await firestore.collection('Usuario').doc(auth.currentUser?.uid).collection('Resvaga').doc(item.id).delete();
            // Liberar a vaga
            await firestore.collection("Ruas").doc(item.idVaga).update({ status: "livre" });
            Alert.alert('Sucesso', 'Reserva cancelada com sucesso!');
            // Recarregar histórico
            loadHistory();
          } catch (e) {
            console.error("Erro ao cancelar reserva:", e);
            Alert.alert("Erro", "Erro ao cancelar reserva!");
          }
        }}
      ]
    );
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  const saveProfileData = async () => {
    if (!usuario) return;
    if (!editName.trim()) {
      setProfileMessage('O nome não pode ficar em branco.');
      return;
    }
    if (!editEmail.trim()) {
      setProfileMessage('O email não pode ficar em branco.');
      return;
    }

    try {
      const userRef = firestore.collection('Usuario').doc(auth.currentUser?.uid);

      if (auth.currentUser?.email !== editEmail) {
        try {
          await auth.currentUser?.updateEmail(editEmail);
        } catch (authError) {
          console.error('Erro ao atualizar email no Auth:', authError);
          setProfileMessage('Falha ao atualizar email. Faça login novamente e tente de novo.');
          return;
        }
      }

      await userRef.update({
        nome: editName,
        fone: editPhone,
        email: editEmail,
      });

      setUsuario(new Usuario({ ...usuario, nome: editName, fone: editPhone, email: editEmail }));
      setProfileMessage('Dados do perfil atualizados com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar dados do perfil:', error);
      setProfileMessage('Falha ao atualizar os dados.');
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordMessage('A senha não pode ficar em branco.');
      return;
    }

    if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
      setPasswordMessage('A senha deve ter exatamente 6 dígitos numéricos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('As senhas devem ser iguais.');
      return;
    }

    try {
      await auth.currentUser?.updatePassword(newPassword);
      setPasswordMessage('Senha alterada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setPasswordMessage('Não foi possível alterar a senha. Faça login novamente e tente de novo.');
    }
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'Minhas Reservas') {
      setShowSettings(false);
      setShowHistory(true);
      loadHistory();
      return;
    }

    if (screen === 'Configurações') {
      setShowHistory(false);
      setShowSettings(true);
      setSettingsScreen('main');
      return;
    }

    navigation.navigate(screen as never);
  };

  if (showSettings) {
    if (settingsScreen === 'notifications') {
      return (
        <View style={styles.profileContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={() => setSettingsScreen('main')} style={styles.backButtonRow}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titulo}>Notificações</Text>
          <View style={styles.optionsContainer}>
            <Text style={styles.text}>Notificações estão {notificationsEnabled ? 'ativadas' : 'desativadas'}.</Text>
            <TouchableOpacity style={styles.button} onPress={toggleNotifications}>
              <Text style={styles.buttonText}>{notificationsEnabled ? 'Desativar' : 'Ativar'} notificações</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (settingsScreen === 'changePassword') {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.profileContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={() => setSettingsScreen('main')} style={styles.backButtonRow}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titulo}>Alterar senha</Text>
          <View style={styles.optionsContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nova senha (6 dígitos)"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha (6 dígitos)"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {passwordMessage ? <Text style={styles.text}>{passwordMessage}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={changePassword}>
              <Text style={styles.buttonText}>Salvar nova senha</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }

    if (settingsScreen === 'profileData') {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.profileContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={() => setSettingsScreen('main')} style={styles.backButtonRow}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titulo}>Dados do perfil</Text>
          <View style={styles.optionsContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEditEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={editPhone}
              keyboardType="phone-pad"
              onChangeText={setEditPhone}
            />
            {profileMessage ? <Text style={styles.text}>{profileMessage}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={saveProfileData}>
              <Text style={styles.buttonText}>Salvar dados</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }


    return (
      <View style={styles.profileContainer}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.backButtonRow}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.titulo}>Configurações</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem} onPress={() => setSettingsScreen('notifications')}>
            <Text style={styles.optionIcon}>🔔</Text>
            <Text style={styles.optionText}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => setSettingsScreen('changePassword')}>
            <Text style={styles.optionIcon}>🔒</Text>
            <Text style={styles.optionText}>Alterar senha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => setSettingsScreen('profileData')}>
            <Text style={styles.optionIcon}>🧾</Text>
            <Text style={styles.optionText}>Dados do perfil</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  if (showHistory) {
    const filteredHistorico = historico.filter(item => {
      const expired = isExpired(item);
      return activeTab === 'ativas' ? !expired : expired;
    });

    return (
      <View style={styles.profileContainer}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.backButtonRow}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.titulo}>Minhas Reservas</Text>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ativas' && styles.activeTab]}
            onPress={() => setActiveTab('ativas')}
          >
            <Text style={[styles.tabText, activeTab === 'ativas' && styles.activeTabText]}>Ativas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'finalizadas' && styles.activeTab]}
            onPress={() => setActiveTab('finalizadas')}
          >
            <Text style={[styles.tabText, activeTab === 'finalizadas' && styles.activeTabText]}>Finalizadas</Text>
          </TouchableOpacity>
        </View>

        {loadingHistory ? (
          <Text style={styles.text}>Carregando histórico...</Text>
        ) : (
          <FlatList
            data={filteredHistorico}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const expired = isExpired(item);
              return (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>Data: {item.data}</Text>
                  <Text style={styles.listText}>Hora: {item.hora}</Text>
                  <Text style={styles.listText}>Tipo: {item.tipo}</Text>
                  <Text style={styles.listText}>
                    Vaga: {detalhesVagas[item.idVaga] ? `${detalhesVagas[item.idVaga].rua} - ${detalhesVagas[item.idVaga].vaga}` : item.idVaga}
                  </Text>
                  <Text style={[styles.listText, expired ? styles.expiredText : styles.activeText]}>
                    Status: {expired ? 'Expirada' : 'Ativa'}
                  </Text>
                  {item.expiraEm ? (
                    <Text style={[styles.listText, expired ? styles.expiredText : styles.activeText]}>
                      {expired ? 'Expirou em:' : 'Expira em:'} {formatExpiration(item)}
                    </Text>
                  ) : null}
                  {activeTab === 'ativas' && (
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity 
                        style={[styles.button, { flex: 1, marginRight: 5 }]}
                        onPress={() => navigation.navigate('Cadastro de Reserva', { resvaga: item })}
                      >
                        <Text style={styles.buttonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.button, styles.buttonDelete, { flex: 1, marginLeft: 5 }]}
                        onPress={() => {
                          if (canCancel(item)) {
                            cancelarReserva(item);
                          } else {
                            Alert.alert('Aviso', 'Esta reserva já expirou e não pode ser cancelada.');
                          }
                        }}
                      >
                        <Text style={styles.buttonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.text}>Nenhuma reserva encontrada nesta aba.</Text>}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario?.nome ? getInitials(usuario.nome) : '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {usuario?.nome || 'Carregando...'}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {usuario?.tipo !== '2' && (
          <>
<TouchableOpacity style={styles.optionItem} onPress={() => handleNavigate('VehicleRegistration')}>
              <Text style={styles.optionIcon}>🚗</Text>
              <Text style={styles.optionText}>Meus veículos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => handleNavigate('Minhas Reservas')}>
              <Text style={styles.optionIcon}>📜</Text>
              <Text style={styles.optionText}>Minhas Reservas</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.optionItem} onPress={() => handleNavigate('Configurações')}>
          <Text style={styles.optionIcon}>⚙️</Text>
          <Text style={styles.optionText}>Configurações</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
