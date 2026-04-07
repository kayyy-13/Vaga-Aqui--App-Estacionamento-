import { ImageBackground, KeyboardAvoidingView, Text, View } from 'react-native';
import { auth, firestore } from '../firebase';
import styles from '../estilo';

import { Usuario } from "../model/Usuario";
import { useEffect, useState } from "react";

type RuaResumo = {
  nome: string;
  livres: number;
};

type AdminResumo = {
  totalVagas: number;
  vagasLivres: number;
  reservasAtivas: number;
};

/**
 * Tela inicial do usuário logado.
 * Exibe mensagem de boas-vindas e opções baseadas no tipo de usuário.
 */
export default function Home() {
  const [usuario, setUsuario] = useState<Usuario | null>(null); // Estado para armazenar dados do usuário logado
  const [ruasResumo, setRuasResumo] = useState<RuaResumo[]>([]);
  const [adminResumo, setAdminResumo] = useState<AdminResumo>({
    totalVagas: 0,
    vagasLivres: 0,
    reservasAtivas: 0,
  });

  useEffect(() => {
    listarUsuario(); // Carrega dados do usuário ao montar o componente
    const unsubscribe = listarResumoRuas();
    return unsubscribe;
  }, []);

  /**
   * Busca os dados do usuário logado no Firestore.
   */
  const listarUsuario = () => {
    firestore.collection("Usuario")
      .doc(auth.currentUser?.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          setUsuario({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
          } as Usuario);
        }
      });
  };

  const listarResumoRuas = () => {
    return firestore.collection("Ruas").onSnapshot((snapshot) => {
      const mapa = new Map<string, number>();
      let totalVagas = 0;
      let vagasLivres = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const nomeRua = data.rua || 'Rua sem nome';
        const livresAtuais = mapa.get(nomeRua) || 0;
        const vagaLivre = data.status === 'livre';

        totalVagas += 1;
        if (vagaLivre) {
          vagasLivres += 1;
        }

        mapa.set(nomeRua, vagaLivre ? livresAtuais + 1 : livresAtuais);
      });

      const resumo = Array.from(mapa.entries())
        .map(([nome, livres]) => ({ nome, livres }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      setRuasResumo(resumo);
      setAdminResumo((prev) => ({
        ...prev,
        totalVagas,
        vagasLivres,
      }));
    });
  };

  useEffect(() => {
    if (usuario?.tipo !== '2') {
      return;
    }

    const unsubscribe = firestore.collectionGroup('Resvaga').onSnapshot((snapshot) => {
      let reservasAtivas = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const statusReserva = data.statusReserva || 'ativa';
        if (statusReserva === 'ativa' && data.expiraEm > Date.now()) {
          reservasAtivas += 1;
        }
      });

      setAdminResumo((prev) => ({
        ...prev,
        reservasAtivas,
      }));
    });

    return unsubscribe;
  }, [usuario?.tipo]);

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.homeScreen}>
      <ImageBackground source={require('../assets/fundo.png')} resizeMode='stretch' style={styles.homeScreen}>
        <View style={styles.homeContent}>
          {usuario?.tipo === '2' ? (
            <>
              <Text style={styles.homeGreeting}>Ola, {usuario?.nome || 'administrador'} 👋</Text>
              <Text style={styles.homeSubtitle}>Painel rapido do sistema</Text>

              <View style={styles.homeAdminGrid}>
                <View style={styles.homeAdminCard}>
                  <Text style={styles.homeAdminLabel}>Total de vagas</Text>
                  <Text style={styles.homeAdminValue}>{adminResumo.totalVagas}</Text>
                </View>

                <View style={styles.homeAdminCard}>
                  <Text style={styles.homeAdminLabel}>Vagas livres</Text>
                  <Text style={styles.homeAdminValue}>{adminResumo.vagasLivres}</Text>
                </View>

                <View style={styles.homeAdminCardWide}>
                  <Text style={styles.homeAdminLabel}>Reservas ativas</Text>
                  <Text style={styles.homeAdminValue}>{adminResumo.reservasAtivas}</Text>
                </View>
              </View>

              <Text style={styles.homeAdminHint}>Acompanhe o fluxo do estacionamento em tempo real.</Text>
            </>
          ) : (
            <>
              <Text style={styles.homeGreeting}>Ola, {usuario?.nome || 'usuario'} 👋</Text>
              <Text style={styles.homeSubtitle}>Confira rapidamente como estao as vagas:</Text>

              <View style={styles.homeMiniList}>
                {ruasResumo.length === 0 ? (
                  <Text style={styles.homeMiniListText}>Nenhuma rua cadastrada no momento.</Text>
                ) : (
                  ruasResumo.map((rua) => (
                    <View key={rua.nome} style={styles.homeMiniListItem}>
                      <Text style={styles.homeMiniListText}>
                        {`📍 ${rua.nome} - ${rua.livres > 0 ? `${rua.livres} vagas livres` : 'Lotado'}`}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
