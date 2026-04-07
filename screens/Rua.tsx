import { useEffect, useState } from 'react';
import { Text, View, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import styles from '../estilo';

import { Rua } from '../model/Rua';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CadastroRua() {
  const[formRua, setFormRua] = useState<Partial<Rua>>({})
  const [tipoUsuario, setTipoUsuario] = useState<string>('');

  const route = useRoute<any>();         // Cria a rota para receber o raca no editar
  const navigation = useNavigation<any>();

  useEffect( () => {                // Recebe o objeto tipo para editar
    if (route.params) {
      setFormRua(route.params.rua); // Preenche o form com rua para edição
    }
    buscarTipoUsuario();
  }, [route.params])

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

  const salvar = () => {
    const refRua = firestore.collection("Ruas")

    if (formRua.id) {
      const idRua = refRua.doc(formRua.id);
      idRua.update(new Rua(formRua).toFirestore())
        .then(() => {
          alert('Rua atualizada!');
          setFormRua({});
        })
        .catch(error => {
          console.error('Erro ao atualizar rua:', error);
          alert('Erro ao atualizar rua.');
        });
    } else {
      const quantidade = parseInt(formRua.vaga || '0', 10);
      if (!formRua.rua?.trim()) {
        alert('Informe o nome da rua.');
        return;
      }
      if (!quantidade || quantidade <= 0) {
        alert('Número de vagas deve ser maior que 0.');
        return;
      }

      for (let i = 1; i <= quantidade; i++) {
        const novaVaga = new Rua({
          rua: formRua.rua,
          vaga: i.toString(),
          status: 'livre'
        });
        const idRua = refRua.doc();
        novaVaga.id = idRua.id;
        idRua.set(novaVaga.toFirestore());
      }
      alert('Cadastro realizado com sucesso!');
      setFormRua({});
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
            <Text style={styles.buttonText}>✅ Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
