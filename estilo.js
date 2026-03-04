import { StyleSheet } from 'react-native';

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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 140,
    marginBottom: 40,
  },
  inputView: {
    width: '55%',
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
    width: '55%',
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  buttonSecondaryText: {
    color: colors.primary,
  },
  listItem: {
    backgroundColor: colors.lightGray,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.primary,
    padding: 10,
    marginTop: 15,
    width: 300,
    borderRadius: 10,
  },
  listText: {
    fontSize: 18,
  },
});
