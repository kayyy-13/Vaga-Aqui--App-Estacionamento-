import { useEffect, useMemo, useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, ImageBackground, Platform, ScrollView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Resvaga } from '../model/Resvaga';

type VagaOption = {
  id: string;
  vaga: string;
  status: string;
};

type RuaCard = {
  nome: string;
  total: number;
  livres: number;
  ocupadas: number;
  vagasSelecionaveis: VagaOption[];
  possuiVagaSelecionavel: boolean;
};

export default function CadastroResvaga() {
  const [formResvaga, setFormResvaga] = useState<Partial<Resvaga>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState<Date | undefined>(undefined);
  const [ruasResumo, setRuasResumo] = useState<RuaCard[]>([]);
  const [vagasDaRuaSelecionada, setVagasDaRuaSelecionada] = useState<VagaOption[]>([]);
  const [ruaSelecionada, setRuaSelecionada] = useState<string>('');
  const [idVagaAntiga, setIdVagaAntiga] = useState<string>('');
  const [buscaRua, setBuscaRua] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'disponiveis' | 'lotadas'>('todos');
  const [mostrarDetalhesRua, setMostrarDetalhesRua] = useState(false);
  const [carregandoRuas, setCarregandoRuas] = useState(true);
  const [atualizandoRuas, setAtualizandoRuas] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useEffect(() => {
    const reservaEdicao = route.params?.resvaga;

    if (reservaEdicao) {
      setFormResvaga(reservaEdicao);
      setIdVagaAntiga(reservaEdicao.idVaga || '');

      if (reservaEdicao.data) {
        const partes = reservaEdicao.data.split('/');
        setDataSelecionada(new Date(`${partes[2]}-${partes[1]}-${partes[0]}`));
      }

      if (reservaEdicao.hora) {
        const [h, m] = reservaEdicao.hora.split(':').map(Number);
        const dt = new Date();
        dt.setHours(h, m, 0, 0);
        setHoraSelecionada(dt);
      }
    }
  }, [route.params]);

  useEffect(() => {
    setCarregandoRuas(true);
    const unsubscribe = firestore.collection('Ruas').onSnapshot(
      async (snapshot) => {
        try {
          const mapa = new Map<string, RuaCard>();
          let ruaDaVagaAntiga = '';

          if (idVagaAntiga) {
            const docAntiga = await firestore.collection('Ruas').doc(idVagaAntiga).get();
            if (docAntiga.exists) {
              ruaDaVagaAntiga = docAntiga.data()?.rua || '';
            }
          }

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const nomeRua = data.rua || 'Rua sem nome';

            if (!mapa.has(nomeRua)) {
              mapa.set(nomeRua, {
                nome: nomeRua,
                total: 0,
                livres: 0,
                ocupadas: 0,
                vagasSelecionaveis: [],
                possuiVagaSelecionavel: false,
              });
            }

            const rua = mapa.get(nomeRua)!;
            const vaga: VagaOption = {
              id: doc.id,
              vaga: data.vaga || '',
              status: data.status || '',
            };

            rua.total += 1;

            if (vaga.status === 'livre') {
              rua.livres += 1;
              rua.vagasSelecionaveis.push(vaga);
            } else {
              rua.ocupadas += 1;
            }

            if (idVagaAntiga && vaga.id === idVagaAntiga && ruaDaVagaAntiga === nomeRua) {
              const jaExiste = rua.vagasSelecionaveis.some((item) => item.id === vaga.id);
              if (!jaExiste) {
                rua.vagasSelecionaveis.push(vaga);
              }
            }

            rua.possuiVagaSelecionavel = rua.vagasSelecionaveis.length > 0;
          });

          const resumoOrdenado = Array.from(mapa.values())
            .map((rua) => ({
              ...rua,
              vagasSelecionaveis: [...rua.vagasSelecionaveis].sort((a, b) => Number(a.vaga) - Number(b.vaga)),
              possuiVagaSelecionavel: rua.vagasSelecionaveis.length > 0,
            }))
            .sort((a, b) => a.nome.localeCompare(b.nome));

          setRuasResumo(resumoOrdenado);

          if (ruaSelecionada) {
            const ruaAtual = resumoOrdenado.find((item) => item.nome === ruaSelecionada);
            setVagasDaRuaSelecionada(ruaAtual?.vagasSelecionaveis || []);
            setFormResvaga((prev) => ({
              ...prev,
              idVaga: prev.idVaga && ruaAtual?.vagasSelecionaveis.some((vaga) => vaga.id === prev.idVaga) ? prev.idVaga : '',
            }));
          } else if (ruaDaVagaAntiga) {
            selecionarRua(ruaDaVagaAntiga, resumoOrdenado, true);
          }
        } catch (e) {
          console.error('Erro ao buscar resumo das ruas:', e);
        } finally {
          setCarregandoRuas(false);
          setAtualizandoRuas(false);
        }
      },
      (error) => {
        console.error('Erro ao acompanhar ruas em tempo real:', error);
        setCarregandoRuas(false);
        setAtualizandoRuas(false);
      }
    );

    return unsubscribe;
  }, [idVagaAntiga, ruaSelecionada]);

  const atualizarLista = async () => {
    try {
      setAtualizandoRuas(true);
      const snapshot = await firestore.collection('Ruas').get();
      if (!snapshot.empty) {
        const ruasUnicas = new Set(snapshot.docs.map((doc) => doc.data().rua || 'Rua sem nome'));
        if (ruasUnicas.size >= 0) {
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao atualizar lista manualmente:', e);
      alert('Nao foi possivel atualizar a lista.');
    } finally {
      setAtualizandoRuas(false);
    }
  };

  const selecionarRua = (nomeRua: string, ruasBase?: RuaCard[], abrirDetalhes = true) => {
    const origem = ruasBase || ruasResumo;
    const rua = origem.find((item) => item.nome === nomeRua);

    setRuaSelecionada(nomeRua);
    setVagasDaRuaSelecionada(rua?.vagasSelecionaveis || []);
    setMostrarDetalhesRua(abrirDetalhes);
    setFormResvaga((prev) => ({
      ...prev,
      idVaga: prev.idVaga && rua?.vagasSelecionaveis.some((vaga) => vaga.id === prev.idVaga) ? prev.idVaga : '',
    }));
  };

  const salvar = async () => {
    if (!formResvaga.tipo || !formResvaga.idVaga || !formResvaga.data || !formResvaga.hora) {
      alert('Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    try {
      const refResvaga = firestore
        .collection('Usuario')
        .doc(auth.currentUser?.uid)
        .collection('Resvaga');

      const novoResvaga = new Resvaga(formResvaga);

      if (formResvaga.id) {
        const idResvaga = refResvaga.doc(formResvaga.id);
        await idResvaga.update(novoResvaga.toFirestore());

        if (idVagaAntiga && idVagaAntiga !== formResvaga.idVaga) {
          await firestore.collection('Ruas').doc(idVagaAntiga).update({ status: 'livre' });
          await firestore.collection('Ruas').doc(formResvaga.idVaga).update({ status: 'ocupada' });
        }

        alert('Reserva atualizada com sucesso!');
      } else {
        const idResvaga = refResvaga.doc();
        novoResvaga.id = idResvaga.id;
        novoResvaga.expiraEm = Date.now() + 30 * 60 * 1000;
        await idResvaga.set(novoResvaga.toFirestore());
        await firestore.collection('Ruas').doc(formResvaga.idVaga).update({ status: 'ocupada' });
        alert('Reserva feita com sucesso!');
      }

      setFormResvaga({});
      setDataSelecionada(undefined);
      setHoraSelecionada(undefined);
      setRuaSelecionada('');
      setVagasDaRuaSelecionada([]);
      setIdVagaAntiga('');
      setBuscaRua('');
      setFiltroStatus('todos');
      setMostrarDetalhesRua(false);
    } catch (e) {
      console.error('Erro ao salvar reserva:', e);
      alert('Erro ao salvar reserva!');
    }
  };

  const onChangeData = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setFormResvaga((prev) => ({
        ...prev,
        data: selectedDate.toLocaleDateString('pt-BR'),
      }));
    }
  };

  const onChangeHora = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setHoraSelecionada(selectedTime);
      setFormResvaga((prev) => ({
        ...prev,
        hora: selectedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }));
    }
  };

  const ruasFiltradas = useMemo(() => {
    return ruasResumo.filter((rua) => {
      const matchBusca = rua.nome.toLowerCase().includes(buscaRua.toLowerCase());

      if (filtroStatus === 'disponiveis') {
        return matchBusca && rua.possuiVagaSelecionavel;
      }

      if (filtroStatus === 'lotadas') {
        return matchBusca && !rua.possuiVagaSelecionavel;
      }

      return matchBusca;
    });
  }, [buscaRua, filtroStatus, ruasResumo]);

  const reservaCompleta = !!(formResvaga.tipo && formResvaga.idVaga && formResvaga.data && formResvaga.hora);
  const ruaAtual = ruasResumo.find((item) => item.nome === ruaSelecionada) || null;

  const renderRuaCard = ({ item }: { item: RuaCard }) => (
    <Pressable
      style={({ pressed }) => [
        styles.reservaStreetCard,
        pressed && styles.reservaStreetCardPressed,
      ]}
      onPress={() => selecionarRua(item.nome)}
    >
      <View style={styles.reservaStreetTop}>
        <View>
          <Text style={styles.reservaStreetTitle}>Rua {item.nome}</Text>
          <Text style={styles.reservaStreetMeta}>Total de vagas: {item.total}</Text>
        </View>

        <View style={[styles.reservaBadge, item.possuiVagaSelecionavel ? styles.reservaBadgeAvailable : styles.reservaBadgeFull]}>
          <Text style={item.possuiVagaSelecionavel ? styles.reservaBadgeTextAvailable : styles.reservaBadgeTextFull}>
            {item.possuiVagaSelecionavel ? 'Disponivel' : 'Lotada'}
          </Text>
        </View>
      </View>

      <Text style={styles.reservaStreetCount}>
        {item.livres > 0 ? `${item.livres} vaga(s) livres` : 'Nenhuma vaga livre'}
      </Text>

      <View
        style={[
          styles.reservaStreetButton,
          item.possuiVagaSelecionavel ? styles.reservaStreetButtonActive : styles.reservaStreetButtonDisabled,
        ]}
      >
        <Text style={styles.reservaStreetButtonText}>Ver detalhes</Text>
      </View>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.reservaScreen}>
      <ImageBackground source={require('../assets/fundo.png')} resizeMode="stretch" style={styles.reservaScreen}>
        {!mostrarDetalhesRua && (
          <FlatList
            data={ruasFiltradas}
            keyExtractor={(item) => item.nome}
            renderItem={renderRuaCard}
            style={styles.reservaList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reservaScrollContent}
            ItemSeparatorComponent={() => <View style={styles.reservaListSeparator} />}
            ListHeaderComponent={
              <>
                <View style={styles.reservaHeader}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.reservaIconButton}
                  >
                    <Ionicons name="arrow-back" size={22} color="#014e40" />
                  </TouchableOpacity>

                  <Text style={styles.reservaHeaderTitle}>Vagas disponiveis</Text>

                  <TouchableOpacity onPress={atualizarLista} style={styles.reservaIconButton}>
                    <Ionicons name="filter" size={20} color="#014e40" />
                  </TouchableOpacity>
                </View>

                <View style={styles.reservaSearchWrapper}>
                  <Ionicons name="search" size={18} color="#6b7d78" style={styles.reservaSearchIcon} />
                  <TextInput
                    mode="flat"
                    label="Buscar por nome da rua"
                    value={buscaRua}
                    onChangeText={setBuscaRua}
                    style={styles.reservaSearchInput}
                    activeUnderlineColor="#005A5B"
                  />
                </View>

                <View style={styles.reservaFilterRow}>
                  {[
                    { key: 'todos', label: 'Todos' },
                    { key: 'disponiveis', label: 'Disponiveis' },
                    { key: 'lotadas', label: 'Lotadas' },
                  ].map((item) => {
                    const ativo = filtroStatus === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.reservaFilterChip, ativo ? styles.reservaFilterChipActive : styles.reservaFilterChipInactive]}
                        onPress={() => setFiltroStatus(item.key as 'todos' | 'disponiveis' | 'lotadas')}
                      >
                        <Text style={ativo ? styles.reservaFilterChipTextActive : styles.reservaFilterChipTextInactive}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.reservaRefreshButton} onPress={atualizarLista}>
                  <Ionicons name="refresh" size={16} color="#014e40" />
                  <Text style={styles.reservaRefreshButtonText}>
                    {atualizandoRuas ? 'Atualizando...' : 'Atualizar lista'}
                  </Text>
                </TouchableOpacity>
              </>
            }
            ListEmptyComponent={
              carregandoRuas ? (
                <View style={styles.reservaLoadingCard}>
                  <ActivityIndicator size="large" color="#014e40" />
                  <Text style={styles.reservaLoadingText}>Carregando vagas...</Text>
                </View>
              ) : (
                <View style={styles.reservaEmptyCard}>
                  <Text style={styles.reservaEmptyTitle}>Nenhuma rua encontrada</Text>
                  <Text style={styles.reservaEmptyText}>Tente ajustar a busca ou os filtros.</Text>
                </View>
              )
            }
          />
        )}

        {mostrarDetalhesRua && ruaAtual && (
          <ScrollView style={styles.reservaList} contentContainerStyle={styles.reservaScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.reservaHeader}>
            <TouchableOpacity
              onPress={() => {
                if (mostrarDetalhesRua) {
                  setMostrarDetalhesRua(false);
                  return;
                }
                navigation.goBack();
              }}
              style={styles.reservaIconButton}
            >
              <Ionicons name="arrow-back" size={22} color="#014e40" />
            </TouchableOpacity>

            <Text style={styles.reservaHeaderTitle}>{mostrarDetalhesRua ? 'Detalhes da rua' : 'Vagas disponiveis'}</Text>

            <TouchableOpacity onPress={atualizarLista} style={styles.reservaIconButton}>
              <Ionicons name={mostrarDetalhesRua ? 'refresh' : 'filter'} size={20} color="#014e40" />
            </TouchableOpacity>
          </View>
            <View style={styles.reservaFormCard}>
              <Text style={styles.reservaFormTitle}>Rua {ruaAtual.nome}</Text>
              <Text style={styles.reservaFormSubtitle}>
                {ruaAtual.livres} vaga(s) livres de {ruaAtual.total}
              </Text>

              <TouchableOpacity style={styles.reservaRefreshButton} onPress={atualizarLista}>
                <Ionicons name="refresh" size={16} color="#014e40" />
                <Text style={styles.reservaRefreshButtonText}>Atualizar lista</Text>
              </TouchableOpacity>

              <Text style={styles.labelFormTitle}>Tipo de vaga</Text>
              <Picker
                selectedValue={formResvaga.tipo}
                onValueChange={(valor) => setFormResvaga({ ...formResvaga, tipo: valor })}
                style={styles.pickerContainer}
              >
                <Picker.Item label="Selecione..." value="" />
                <Picker.Item label="Normal" value="normal" />
                <Picker.Item label="Deficiente" value="deficiente" />
                <Picker.Item label="Idoso" value="idoso" />
              </Picker>

              <Text style={styles.labelFormTitle}>Vaga</Text>
              <Picker
                selectedValue={formResvaga.idVaga}
                onValueChange={(valor) => setFormResvaga({ ...formResvaga, idVaga: valor })}
                style={styles.pickerContainer}
              >
                <Picker.Item label="Selecione..." value="" />
                {vagasDaRuaSelecionada.map((vaga) => (
                  <Picker.Item key={vaga.id} label={`Vaga ${vaga.vaga}`} value={vaga.id} />
                ))}
              </Picker>

              <Text style={styles.labelFormTitle}>Data da reserva</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  label="Data da reserva"
                  value={formResvaga.data || ''}
                  editable={false}
                  style={styles.input}
                  activeUnderlineColor="#005A5B"
                  right={<TextInput.Icon icon="calendar" />}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dataSelecionada || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={onChangeData}
                  minimumDate={new Date()}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.labelFormTitle}>Hora da reserva</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <TextInput
                  label="Hora da reserva"
                  value={formResvaga.hora || ''}
                  editable={false}
                  style={styles.input}
                  activeUnderlineColor="#005A5B"
                  right={<TextInput.Icon icon="clock" />}
                />
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={horaSelecionada || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                  onChange={onChangeHora}
                />
              )}

              <TouchableOpacity
                style={[styles.button, !reservaCompleta && styles.reservaSubmitDisabled]}
                onPress={salvar}
                disabled={!reservaCompleta}
              >
                <Text style={styles.buttonText}>Salvar reserva</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
