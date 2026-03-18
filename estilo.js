import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#e9ce33',
  white: '#fff',
  bg: '#527954',
  lightGray: '#e9e9e9b8',
};

const containerBase = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

export default StyleSheet.create({
  container: {
    ...containerBase,
    backgroundColor: colors.white,
  },
  containerHome: {
    ...containerBase,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontSize: Math.max(16, Math.min(width * 0.05, 24)), // Mínimo 16, máximo 24
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: Math.max(50, height * 0.15), // Mínimo 50
    marginBottom: Math.max(20, height * 0.05),
  },
  label: {
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  inputView: {
    width: '85%', // Aumentado para melhor adaptação
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
    fontSize: Math.max(14, Math.min(width * 0.04, 18)),
  },
  buttonView: {
    width: '85%', // Aumentado
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: Math.max(20, height * 0.025), // Aumentado mínimo para 20
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Altura mínima para garantir visibilidade
  },
  buttonText: {
    color: '#000', // Mudado para preto para melhor contraste
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  listItem: {
    backgroundColor: colors.lightGray,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.primary,
    padding: Math.max(8, width * 0.025), // Mínimo 8
    marginTop: Math.max(10, height * 0.02),
    width: width * 0.85, // Largura baseada na tela
    borderRadius: 10,
  },
  listText: {
    fontSize: Math.max(14, Math.min(width * 0.045, 20)),
  },
});
