import { useEffect, useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Resvaga } from '../model/Resvaga';

export default function CadastroResvaga() {
  const [formResvaga, setFormResvaga] = useState<Partial<Resvaga>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState<Date | undefined>(undefined);
  const [vagasDisponiveis, setVagasDisponiveis] = useState<any[]>([]);
  const [ruasDisponiveis, setRuasDisponiveis] = useState<any[]>([]);
  const [vagasDaRuaSelecionada, setVagasDaRuaSelecionada] = useState<any[]>([]);
  const [ruaSelecionada, setRuaSelecionada] = useState<string>('');
  const [idVagaAntiga, setIdVagaAntiga] = useState<string>('');

  const navigation = useNavigation();
  const route = useRoute<any>();

  useEffect(() => {
    if (route.params) {
      setFormResvaga(route.params.resvaga);
      setIdVagaAntiga(route.params.resvaga.idVaga || '');
      if (route.params.resvaga?.data) {
        const partes = route.params.resvaga.data.split('/');
        const data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        setDataSelecionada(data);
      }
      if (route.params.resvaga?.hora) {
        const [h, m] = route.params.resvaga.hora.split(':').map(Number);
        const dt = new Date();
        dt.setHours(h, m, 0, 0);
        setHoraSelecionada(dt);
      }
    }
    buscarRuasDisponiveis();
  }, [route.params]);

  const buscarRuasDisponiveis = async () => {
    try {
      const snapshot = await firestore.collection("Ruas").where("status", "==", "livre").get();
      const ruasSet = new Set<string>();
      snapshot.docs.forEach(doc => ruasSet.add(doc.data().rua));

      // Se é edição, incluir a rua da vaga antiga
      if (idVagaAntiga) {
        const docAntiga = await firestore.collection("Ruas").doc(idVagaAntiga).get();
        if (docAntiga.exists) {
          ruasSet.add(docAntiga.data()?.rua);
        }
      }

      const ruas = Array.from(ruasSet).map(rua => ({ label: rua, value: rua }));
      setRuasDisponiveis(ruas);
    } catch (e) {
      console.error("Erro ao buscar ruas disponíveis:", e);
    }
  };

  const buscarVagasDaRua = async (rua: string) => {
    try {
      const snapshot = await firestore.collection("Ruas").where("rua", "==", rua).where("status", "==", "livre").get();
      let vagas = snapshot.docs.map(doc => ({ id: doc.id, vaga: doc.data().vaga }));

      // Se é edição e a vaga antiga está nesta rua, incluir ela mesmo se ocupada
      if (idVagaAntiga) {
        const docAntiga = await firestore.collection("Ruas").doc(idVagaAntiga).get();
        if (docAntiga.exists && docAntiga.data()?.rua === rua && !vagas.find(v => v.id === idVagaAntiga)) {
          vagas.push({ id: idVagaAntiga, vaga: docAntiga.data()?.vaga });
        }
      }

      setVagasDaRuaSelecionada(vagas);
    } catch (e) {
      console.error("Erro ao buscar vagas da rua:", e);
    }
  };

  const salvar = async () => {
    // validação básica: todos os campos devem estar preenchidos
    if (!formResvaga.tipo || !formResvaga.idVaga || !formResvaga.data || !formResvaga.hora) {
      alert('Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    try {
      const refResvaga = firestore
        .collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Resvaga");

      const novoResvaga = new Resvaga(formResvaga);

      if (formResvaga.id) {
        const idResvaga = refResvaga.doc(formResvaga.id);
        await idResvaga.update(novoResvaga.toFirestore());

        // Se a vaga mudou, liberar a antiga e ocupar a nova
        if (idVagaAntiga && idVagaAntiga !== formResvaga.idVaga) {
          await firestore.collection("Ruas").doc(idVagaAntiga).update({ status: "livre" });
          await firestore.collection("Ruas").doc(formResvaga.idVaga).update({ status: "ocupada" });
        }

        alert('Reserva atualizada com sucesso!');
      } else {
        const idResvaga = refResvaga.doc();
        novoResvaga.id = idResvaga.id;
        novoResvaga.expiraEm = Date.now() + 30 * 60 * 1000; // 30 minutos
        await idResvaga.set(novoResvaga.toFirestore());

        // Atualizar status da vaga para ocupada
        await firestore.collection("Ruas").doc(formResvaga.idVaga).update({ status: "ocupada" });

        alert('Reserva feita com sucesso!');
      }

      setFormResvaga({});
      setDataSelecionada(undefined);
      setRuaSelecionada('');
      setVagasDaRuaSelecionada([]);
      setIdVagaAntiga('');
      buscarRuasDisponiveis();
    } catch (e) {
      console.error("Erro ao salvar reserva:", e);
      alert("Erro ao salvar reserva!");
    }
  };

  const onChangeData = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      setFormResvaga({
        ...formResvaga,
        data: dataFormatada,
      });
    }
  };

  const onChangeHora = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setHoraSelecionada(selectedTime);
      const horaFormatada = selectedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setFormResvaga({
        ...formResvaga,
        hora: horaFormatada,
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/fundo.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>RESERVA DE VAGAS</Text>

        <View style={styles.inputView}>
          <Text style={styles.labelFormTitle}>Tipo de Vaga</Text>
          <Picker
            selectedValue={formResvaga.tipo}
            onValueChange={valor => setFormResvaga({ ...formResvaga, tipo: valor })}
            style={styles.pickerContainer}
          >
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Normal" value="normal" />
            <Picker.Item label="Deficiente" value="deficiente" />
            <Picker.Item label="Idoso" value="idoso" />
          </Picker>

          <Text style={styles.labelFormTitle}>Selecionar Rua</Text>
          <Picker
            selectedValue={ruaSelecionada}
            onValueChange={valor => {
              setRuaSelecionada(valor);
              setFormResvaga({ ...formResvaga, idVaga: '' });
              if (valor) {
                buscarVagasDaRua(valor);
              } else {
                setVagasDaRuaSelecionada([]);
              }
            }}
            style={styles.pickerContainer}
          >
            <Picker.Item label="Selecione..." value="" />
            {ruasDisponiveis.map(rua => (
              <Picker.Item key={rua.value} label={rua.label} value={rua.value} />
            ))}
          </Picker>

          <Text style={styles.labelFormTitle}>Selecionar Vaga</Text>
          <Picker
            selectedValue={formResvaga.idVaga}
            onValueChange={valor => setFormResvaga({ ...formResvaga, idVaga: valor })}
            style={styles.pickerContainer}
            enabled={ruaSelecionada !== ''}
          >
            <Picker.Item label="Selecione..." value="" />
            {vagasDaRuaSelecionada.map(vaga => (
              <Picker.Item key={vaga.id} label={`Vaga ${vaga.vaga}`} value={vaga.id} />
            ))}
          </Picker>

          <Text style={styles.labelFormTitle}>Data da Reserva</Text>

          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              label="Data da Reserva"
              value={formResvaga.data || ''}
              editable={false}
              style={styles.input}
              activeUnderlineColor="#e9ce33ff"
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

          <Text style={styles.labelFormTitle}>Hora da Reserva</Text>

          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <TextInput
              label="Hora da Reserva"
              value={formResvaga.hora || ''}
              editable={false}
              style={styles.input}
              activeUnderlineColor="#e9ce33ff"
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
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity
            style={[
              styles.button,
              !(formResvaga.tipo && formResvaga.idVaga && formResvaga.data && formResvaga.hora) && { backgroundColor: '#aaa' },
            ]}
            onPress={salvar}
            disabled={!(formResvaga.tipo && formResvaga.idVaga && formResvaga.data && formResvaga.hora)}
          >
            <Text style={styles.backButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
