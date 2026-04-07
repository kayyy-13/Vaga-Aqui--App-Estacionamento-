import { StyleSheet } from 'react-native';

const colors = {
  primary: '#014e40', // titulos e elementos principais
  secondary: '#005A5B', // fundo do containerHome
  accent1: '#007369', // lables e bordas
  accent2: '#6e8788', // Botões principais e labels de formulário
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
  // filtros de admin
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.accent2,
    borderColor: colors.accent2,
  },
  filterButtonInactive: {
    backgroundColor: colors.white,
    borderColor: colors.accent1,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  filterButtonTextInactive: {
    color: colors.accent1,
    fontWeight: 'bold',
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
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  optionsContainer: {
    width: '100%',
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  activeText: {
    color: '#007369',
    fontWeight: '700',
  },
  expiredText: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.accent2,
    fontWeight: '700',
  },
  flatlistContentContainer: {
    paddingBottom: 30,
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricCard: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    minWidth: 100,
    marginBottom: 10,
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
  chartContainer: {
    width: '90%',
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  chartColumn: {
    alignItems: 'center',
    width: '30%',
  },
  chartBar: {
    width: '100%',
    maxWidth: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: 20,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
    flex: 1,
  },
  chartValueLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    color: colors.accent1,
    marginTop: 2,
  },
  reservaScrollContent: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  reservaScreen: {
    flex: 1,
    width: '100%',
  },
  reservaList: {
    flex: 1,
    width: '100%',
  },
  reservaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  reservaIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservaHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  reservaSearchWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  reservaSearchIcon: {
    position: 'absolute',
    left: 14,
    top: 20,
    zIndex: 1,
  },
  reservaSearchInput: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingLeft: 26,
    borderRadius: 14,
  },
  reservaFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  reservaFilterChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
  },
  reservaFilterChipActive: {
    backgroundColor: colors.accent2,
    borderColor: colors.accent2,
  },
  reservaFilterChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: colors.accent1,
  },
  reservaFilterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  reservaFilterChipTextInactive: {
    color: colors.accent1,
    fontWeight: '700',
  },
  reservaRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    gap: 8,
  },
  reservaRefreshButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  reservaListContent: {
    paddingBottom: 24,
  },
  reservaListSeparator: {
    height: 14,
  },
  reservaCardsContainer: {
    gap: 14,
  },
  reservaStreetCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(1,78,64,0.08)',
  },
  reservaStreetCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  reservaStreetCardSelected: {
    borderColor: colors.accent3,
    shadowColor: '#003840',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reservaStreetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  reservaStreetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  reservaStreetMeta: {
    color: '#5d6a67',
    marginTop: 4,
    fontSize: 13,
  },
  reservaStreetCount: {
    fontSize: 16,
    color: colors.accent2,
    fontWeight: '700',
    marginBottom: 14,
  },
  reservaBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  reservaBadgeAvailable: {
    backgroundColor: 'rgba(2,166,118,0.14)',
  },
  reservaBadgeFull: {
    backgroundColor: 'rgba(211,47,47,0.12)',
  },
  reservaBadgeTextAvailable: {
    color: '#007369',
    fontWeight: '800',
    fontSize: 12,
  },
  reservaBadgeTextFull: {
    color: '#d32f2f',
    fontWeight: '800',
    fontSize: 12,
  },
  reservaStreetButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reservaStreetButtonActive: {
    backgroundColor: colors.accent2,
  },
  reservaStreetButtonDisabled: {
    backgroundColor: '#b9c1bf',
  },
  reservaStreetButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  reservaEmptyCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  reservaEmptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  reservaEmptyText: {
    color: '#5d6a67',
    textAlign: 'center',
  },
  reservaLoadingCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  reservaLoadingText: {
    color: colors.primary,
    fontWeight: '700',
  },
  reservaFormCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 18,
    marginTop: 22,
  },
  reservaFormTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  reservaFormSubtitle: {
    fontSize: 14,
    color: '#5d6a67',
    marginBottom: 10,
  },
  reservaSubmitDisabled: {
    backgroundColor: '#aab3b0',
  },
  homeScreen: {
    flex: 1,
    width: '100%',
  },
  homeContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  homeGreeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  homeSubtitle: {
    fontSize: 16,
    color: colors.accent2,
    marginBottom: 18,
  },
  homeMiniList: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  homeMiniListItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(1,78,64,0.06)',
  },
  homeMiniListText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  homeAdminHint: {
    marginTop: 18,
    color: colors.accent1,
    fontWeight: '700',
  },
  homeAdminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  homeAdminCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 18,
  },
  homeAdminCardWide: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 18,
  },
  homeAdminLabel: {
    color: colors.accent1,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  homeAdminValue: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
  },
});
