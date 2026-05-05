import { StyleSheet } from 'react-native';

const colors = {
  primary: '#05F2AF', // destaque principal
  secondary: '#0597F2', // 2º tom para botões e ênfase
  accent1: '#04C4D9', // labels, bordas e tags
  accent2: '#04D9C4', // botões secundários e destaques
  accent3: '#05F2AF',
  accent4: '#04C4D9',
  white: '#fff',
  lightGray: 'rgba(255,255,255,0.12)',
  background: '#051F40',
  card: '#072A5A',
  textPrimary: '#E8F8FF',
  textSecondary: '#BBDFFF',
  danger: '#FF6B6B',
  success: '#05F2AF',
  warning: '#F2D904',
  info: '#0597F2',
  disabled: '#5B7A9B',
};

export const themeColors = colors;

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.background,
  },
  pageContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  flexOne: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardSection: {
    marginBottom: 16,
  },
  cardSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusChipText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  emptyStateTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSection: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  modalText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  messageBubbleMeta: {
    fontSize: 10,
    marginTop: 6,
    color: colors.textSecondary,
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  infoBoxTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  },
  infoBoxText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  textHelper: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
    minHeight: 120,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  whitePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  pickerStyle: {
    color: colors.textPrimary,
  },
  containerHome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.background,
  },
  titulo: {
    fontSize: 22, //titulo principais
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 330,
    height: 250,
  
  },
  label: {
    color: colors.accent1,
    fontWeight: 'bold',
    marginTop: 10, //distancia de itens
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  inputView: {
    width: '85%',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  inputPicker: {
    marginBottom: 20,
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
    borderColor: colors.accent1,
    borderWidth: 2,
  },
  buttonSecondaryText: {
    color: colors.accent1,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.accent1,
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: colors.accent1,
  },
  buttonFlex: {
    flex: 1,
  },
  // Botões padronizados do app
  botao: {
    backgroundColor: colors.accent2,
    width: '85%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  textoBotao: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.danger,
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
  lightCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(5, 242, 175, 0.25)',
    padding: 12,
    marginTop: 10,
    width: '90%',
    borderRadius: 12,
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
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent1,
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.danger,
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  activeText: {
    color: colors.accent2,
    fontWeight: '700',
  },
  expiredText: {
    color: colors.danger,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(5,151,242,0.18)',
  },
  reservaStreetCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  reservaStreetCardSelected: {
    borderColor: colors.accent3,
    shadowColor: '#000',
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
    color: colors.textSecondary,
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
    backgroundColor: 'rgba(4,217,196,0.16)',
  },
  reservaBadgeFull: {
    backgroundColor: 'rgba(255,107,107,0.16)',
  },
  reservaBadgeTextAvailable: {
    color: colors.accent1,
    fontWeight: '800',
    fontSize: 12,
  },
  reservaBadgeTextFull: {
    color: colors.danger,
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
    backgroundColor: colors.disabled,
  },
  reservaStreetButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  reservaEmptyCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reservaLoadingCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    color: colors.textSecondary,
    marginBottom: 10,
  },
  reservaSubmitDisabled: {
    backgroundColor: colors.disabled,
  },
  homeScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  homeMiniListItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(4,196,217,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 18,
  },
  homeAdminCardWide: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
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
