import { useEffect, useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity, FlatList } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import styles from '../estilo';

import { Rua } from '../model/Rua';
import { useNavigation, useRoute } from '@react-navigation/native';

type RuaAgrupada = {
  nome: string;
  totalVagas: number;
  vagasLivres: number;
  vagasOcupadas: number;
};

export default function CadastroRua() {
  const[formRua, setFormRua] = useState<Partial<Rua>>({})
  const [tipoUsuario, setTipoUsuario] = useState<string>('');
  const [ruasCadastradas, setRuasCadastradas] = useState<RuaAgrupada[]>([]);
  const [carregandoRuas, setCarregandoRuas] = useState(true);
  const [ruaOriginal, setRuaOriginal] = useState<string>('');

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (route.params) {
      setFormRua(route.params.rua);
      setRuaOriginal(route.params.rua?.rua || '');
    }
  }, [route.params]);

  useEffect(() => {
    buscarTipoUsuario();

    const unsubscribe = firestore.collection('Ruas').onSnapshot(
      (snapshot) => {
        const mapa = new Map<string, RuaAgrupada>();

        snapshot.forEach((doc) => {
          const dados = doc.data();
          const nomeRua = dados?.rua || 'Rua sem nome';
          const status = dados?.status || 'livre';

          if (!mapa.has(nomeRua)) {
            mapa.set(nomeRua, {
              nome: nomeRua,
              totalVagas: 0,
              vagasLivres: 0,
              vagasOcupadas: 0,
            });
          }

          const rua = mapa.get(nomeRua)!;
          rua.totalVagas += 1;

          if (status === 'livre') {
            rua.vagasLivres += 1;
          } else {
            rua.vagasOcupadas += 1;
          }
        });

        const ruasOrdenadas = Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        setRuasCadastradas(ruasOrdenadas);
        setCarregandoRuas(false);
      },
      (error) => {
        console.error('Erro ao listar ruas cadastradas:', error);
        setCarregandoRuas(false);
      }
    );

    return unsubscribe;
  }, []);

  const buscarTipoUsuario = async () => {
    try {
      const docSnap = await firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .get();
      if (docSnap.exists) {
        const tipo = docSnap.data()?.tipo;
        setTipoUsuario(tipo);
        if (tipo !== '2') {
          alert('Apenas administradores podem cadastrar ruas.');
          navigation.goBack();
        }
      }
    } catch (e) {
      console.error("Erro ao buscar tipo de usuário:", e);
    }
  };

  const limparFormulario = () => {
    setFormRua({});
    setRuaOriginal('');
  };

  const editarRua = (rua: RuaAgrupada) => {
    setFormRua({
      rua: rua.nome,
      vaga: String(rua.totalVagas),
    });
    setRuaOriginal(rua.nome);
  };

  const atualizarRuaExistente = async (nomeRuaOriginal: string, novoNomeRua: string, novaQuantidade: number) => {
    const refRua = firestore.collection("Ruas")
    const ruasSnapshot = await refRua.where('rua', '==', nomeRuaOriginal).get();

    if (ruasSnapshot.empty) {
      alert('Não foi possível localizar a rua para edição.');
      return false;
    }

    if (novoNomeRua !== nomeRuaOriginal) {
      const ruaComMesmoNome = await refRua.where('rua', '==', novoNomeRua).get();

      if (!ruaComMesmoNome.empty) {
        alert('Já existe uma rua cadastrada com esse nome.');
        return false;
      }
    }

    const vagasExistentes = ruasSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        rua: doc.data()?.rua || '',
        vaga: doc.data()?.vaga || '0',
        status: doc.data()?.status || 'livre',
      }))
      .sort((a, b) => Number(a.vaga) - Number(b.vaga));

    const vagasOcupadas = vagasExistentes.filter((item) => item.status !== 'livre');

    if (novaQuantidade < vagasOcupadas.length) {
      alert(`Não é possível reduzir para ${novaQuantidade} vaga(s), porque existem ${vagasOcupadas.length} vaga(s) ocupada(s).`);
      return false;
    }

    let vagasMantidas = [...vagasExistentes];

    if (novaQuantidade < vagasExistentes.length) {
      const quantidadeParaRemover = vagasExistentes.length - novaQuantidade;
      const vagasLivres = vagasExistentes
        .filter((item) => item.status === 'livre')
        .sort((a, b) => Number(b.vaga) - Number(a.vaga));

      const vagasParaRemover = vagasLivres.slice(0, quantidadeParaRemover);

      if (vagasParaRemover.length < quantidadeParaRemover) {
        alert('Só é possível reduzir a quantidade removendo vagas livres.');
        return false;
      }

      await Promise.all(vagasParaRemover.map((item) => refRua.doc(item.id).delete()));
      const idsRemovidos = new Set(vagasParaRemover.map((item) => item.id));
      vagasMantidas = vagasExistentes.filter((item) => !idsRemovidos.has(item.id));
    }

    await Promise.all(
      vagasMantidas.map((item, index) =>
        refRua.doc(item.id).update({
          rua: novoNomeRua,
          vaga: String(index + 1),
          status: item.status,
        })
      )
    );

    if (novaQuantidade > vagasMantidas.length) {
      const promessas = [];

      for (let i = vagasMantidas.length + 1; i <= novaQuantidade; i++) {
        const idRua = refRua.doc();
        promessas.push(
          idRua.set({
            id: idRua.id,
            rua: novoNomeRua,
            vaga: String(i),
            status: 'livre',
          })
        );
      }

      await Promise.all(promessas);
    }

    return true;
  };

  const salvar = async () => {
    const refRua = firestore.collection("Ruas")
    const quantidade = parseInt(formRua.vaga || '0', 10);
    const nomeRua = formRua.rua?.trim();

    if (!nomeRua) {
      alert('Informe o nome da rua.');
      return;
    }

    if (!quantidade || quantidade <= 0) {
      alert('Número de vagas deve ser maior que 0.');
      return;
    }

    try {
      if (ruaOriginal) {
        const atualizou = await atualizarRuaExistente(ruaOriginal, nomeRua, quantidade);

        if (!atualizou) {
          return;
        }

        alert('Rua atualizada!');
        limparFormulario();
        return;
      }

      const ruaExistente = await refRua.where('rua', '==', nomeRua).get();

      if (!ruaExistente.empty) {
        alert('Essa rua já está cadastrada. Use a edição para alterar a quantidade de vagas.');
        return;
      }

      for (let i = 1; i <= quantidade; i++) {
        const novaVaga = new Rua({
          rua: nomeRua,
          vaga: i.toString(),
          status: 'livre'
        });
        const idRua = refRua.doc();
        novaVaga.id = idRua.id;
        await idRua.set(novaVaga.toFirestore());
      }

      alert('Cadastro realizado com sucesso!');
      limparFormulario();
    } catch (error) {
      console.error('Erro ao salvar rua:', error);
      alert('Erro ao salvar rua.');
    }
  }

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.titulo}>🛣️ Cadastro de Rua</Text>

        <View style={styles.inputView}>
          <TextInput
            label='Nome da rua'
            onChangeText={valor => setFormRua({ ...formRua, rua: valor })}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
            value={formRua.rua}
          />
          <TextInput
            label='Número de vagas'
            onChangeText={valor => setFormRua({ ...formRua, vaga: valor })}
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
            value={formRua.vaga}
            keyboardType='numeric'
          />
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={salvar}>
            <Text style={styles.buttonText}>{ruaOriginal ? '✅ Atualizar Rua' : '✅ Salvar'}</Text>
          </TouchableOpacity>
          {ruaOriginal ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={limparFormulario}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar edição</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.inputView, { flex: 1, marginTop: 10 }]}>
          <Text style={styles.label}>Ruas cadastradas</Text>
          {carregandoRuas ? (
            <Text style={styles.listText}>Carregando ruas...</Text>
          ) : (
            <FlatList
              data={ruasCadastradas}
              keyExtractor={(item) => item.nome}
              contentContainerStyle={styles.flatlistContentContainer}
              ListEmptyComponent={<Text style={styles.listText}>Nenhuma rua cadastrada.</Text>}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>Rua: {item.nome}</Text>
                  <Text style={styles.listText}>Vagas: {item.totalVagas}</Text>
                  <Text style={styles.listText}>Livres: {item.vagasLivres}</Text>
                  <Text style={styles.listText}>Ocupadas: {item.vagasOcupadas}</Text>

                  <TouchableOpacity
                    style={[styles.button, { marginTop: 10 }]}
                    onPress={() => editarRua(item)}
                  >
                    <Text style={styles.buttonText}>Editar rua</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
