import { StyleSheet } from 'react-native';

const colors = {
  primary: '#014e40', // titulos e elementos principais
  secondary: '#005A5B', // fundo do containerHome
  accent1: '#007369', // lables e bordas
  accent2: '#003840', // Botões principais e labels de formulário
  accent3: '#02A676',
  accent4: '#005A5B', // Botão de voltar e bordas de listas
  white: '#fff',
  lightGray: '#e9e9e9b8',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.white,
  },
  containerHome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.secondary,
  },
  titulo: {
    fontSize: 22, //titulo principais
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  label: {
    color: colors.accent1,
    fontWeight: 'bold',
    marginTop: 10, //distancia de itens
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  inputView: {
    width: '85%',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  inputPicker: {
    marginBottom: 20,
    backgroundColor: colors.white,
    paddingLeft: 8,
  },
  textPicker: {
    fontSize: 16,
  },
  buttonView: {
    width: '85%',
  },
  button: {
    backgroundColor: colors.accent2,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.accent1,
    borderWidth: 2,
  },
  buttonSecondaryText: {
    color: colors.accent1,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.accent1,
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: colors.accent1,
  },
  buttonFlex: {
    flex: 1,
  },
  //cancelar reserva
  buttonDelete: {
    backgroundColor: '#d32f2f',
    flex: 1,
  },
  //style "minhas reservas"
  listItem: {
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent3,
    padding: 10,
    marginTop: 10,
    width: '90%',
    borderRadius: 10,
    alignSelf: 'center',
  },
  listText: {
    fontSize: 17,
  },
  labelFormTitle: {
    color: colors.accent2,
    fontWeight: 'bold',
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    marginTop: 5,
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent3,
    padding: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: colors.white,
    marginLeft: 14,
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  //style "perfil"
  profileFormContainer: {
    width: '90%',
    marginTop: 20,
  },
  flatlistContentContainer: {
    paddingBottom: 30,
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '28%',
  },
  metricTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    color: colors.accent2,
    fontWeight: 'bold',
    marginTop: 5,
  },
});
