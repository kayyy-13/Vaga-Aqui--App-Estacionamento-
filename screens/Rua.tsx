import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Button, TouchableOpacity, ImageBackground} from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';

import { Rua } from '../model/Rua';
import { useNavigation, useRoute } from '@react-navigation/native';


export default function CadastroRua() {
  const[formRua, setFormRua] = useState<Partial<Rua>>({})

  const route = useRoute();         // Cria a rota para receber o raca no editar

  useEffect( () => {                // Recebe o objeto tipo para editar
    if (route.params) {
      setFormRua(route.params.rua); // Preenche o form com rua para edição
    }    
  }, [route.params])

  const salvar = () => {
    const refRua = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Rua")

    const novoRua = new Rua(formRua);


    if (formRua.id) {
      const idRua  = refRua.doc(formRua.id);

      idRua.update(novoRua.toFirestore())
      .then( () => {
        alert('Cadastro atualizado!');
        limpar();
      })
    } else {
      const idRua  = refRua.doc();
      novoRua.id = idRua.id;
      idRua.set(novoRua.toFirestore())

      alert('Ocupação de vaga adicionado com sucesso!')    
      limpar();
    }
  }

  const limpar = () => {
    setFormRua({});
  }

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>
        <Text style={styles.titulo}>CADASTRO DE OCUPAÇÃO DE VAGAS</Text>

        <View style={styles.inputView}>
          <TextInput 
            label='Nome da Rua' 
            onChangeText={valor => setFormRua({
              ...formRua,
              rua : valor
            })}            
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
            value={formRua.rua}
          />
           <TextInput 
            label='N° da Vaga' 
            onChangeText={valor => setFormRua({
              ...formRua,
              vaga : valor
            })}            
            style={styles.input}
            activeUnderlineColor='#e9ce33ff'
            value={formRua.vaga}
          />
           <Picker
            selectedValue={formRua.status}
            onValueChange={valor => setFormRua({ ...formRua, status: valor })}
            style={{ backgroundColor: '#fff', marginTop: 5 }}
          >
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Ocupada" value="ocupada" />
            <Picker.Item label="Livre" value="livre" />

          </Picker>

        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={salvar}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSec]} onPress={limpar}>
            <Text style={[styles.buttonText, styles.buttonSecText]}>Limpar</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}