import { useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

/**
 * Tela de login para usuários comuns.
 * Permite autenticação via email e senha, verificando tipo de usuário.
 */
export default function Login() {
  const [email, setEmail] = useState(''); // Estado para email do usuário
  const [senha, setSenha] = useState(''); // Estado para senha do usuário

  const navigation = useNavigation<any>();

  /**
   * Verifica reservas e mostra notificações se necessário
   */
  const verificarReservas = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const agora = Date.now();
      const snapshot = await firestore
        .collection("Usuario")
        .doc(userId)
        .collection("Resvaga")
        .get();

      let reservasAtivas = 0;
      let reservasProximasAExpirar = 0;

      for (const doc of snapshot.docs) {
        const reserva = doc.data();

        // Se a reserva expirou, cancelar automaticamente
        if (reserva.expiraEm && reserva.expiraEm < agora) {
          try {
            // Liberar a vaga
            await firestore
              .collection("Ruas")
              .doc(reserva.idVaga)
              .update({ status: "livre" });

            // Deletar a reserva
            await doc.ref.delete();

            // Notificar que a reserva foi cancelada
            Alert.alert(
              '❌ Reserva Cancelada',
              `Sua reserva expirou após 30 minutos sem ocupação. A vaga foi liberada.`,
              [{ text: 'OK', onPress: () => {} }]
            );
          } catch (error) {
            console.error(`Erro ao cancelar reserva:`, error);
          }
        } else if (reserva.expiraEm && reserva.expiraEm > agora) {
          reservasAtivas++;
          const tempoRestante = reserva.expiraEm - agora;
          const minutosRestantes = Math.ceil(tempoRestante / 60000);

          // Notificar se faltam menos de 5 minutos
          if (tempoRestante <= 5 * 60 * 1000) {
            reservasProximasAExpirar++;
          }
        }
      }

      // Enviar notificação de boas-vindas com informações sobre reservas
      if (reservasAtivas > 0) {
        const mensagem = reservasProximasAExpirar > 0
          ? `Você tem ${reservasAtivas} reserva(s) ativa(s). ${reservasProximasAExpirar} está(ão) próxima(s) de expirar!`
          : `Bem-vindo! Você tem ${reservasAtivas} reserva(s) ativa(s).`;

        Alert.alert(
          '🅿️ Reservas Ativas',
          mensagem,
          [{ text: 'OK', onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error('Erro ao verificar reservas:', error);
    }
  };

  /**
   * Realiza login do usuário, verificando se é usuário comum.
   */
  const logar = async () => {
    try {
      const userCredentials = await auth.signInWithEmailAndPassword(email, senha);
      console.log("Logado como: " + userCredentials.user?.email);

      // Verificar se o usuário é normal
      const userDoc = await firestore.collection("Usuario").doc(userCredentials.user?.uid).get();
      const userData = userDoc.data();

      if (userData?.tipo === '1') {
        // Verificar reservas antes de navegar
        await verificarReservas();
        navigation.replace('Menu');
      } else {
        alert('Esta é a tela de login para usuários normais. Use a tela de administrador se aplicável.');
        await auth.signOut();
      }
    } catch (erro: any) {
      alert(erro?.message || 'Nao foi possivel realizar o login.');
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/LOGIN.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>TELA DE LOGIN</Text>

        <View style={styles.inputView}>
          <TextInput
            label='E-mail'
            onChangeText={texto => setEmail(texto)}
            style={styles.input}
            activeUnderlineColor='#005A5B'
          />

          <TextInput
            label='Senha'
            onChangeText={texto => setSenha(texto)}
            secureTextEntry={true}
            style={styles.input}
            activeUnderlineColor='#005A5B'
          />
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={logar}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => navigation.replace('AdminLogin')}>
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Login como Administrador</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.replace('Register')}>
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
