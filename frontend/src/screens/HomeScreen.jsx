import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { slotService } from '../services/slotService';
import { AVAILABLE_LANGUAGES, getTranslations } from '../config/translations';

export default function HomeScreen({
  farmerData,
  token,
  activeBooking,
  language = 'en',
  onLanguageChange,
  onNavigate,
  onLogout,
  onCancelBooking,
}) {
  const t = getTranslations(language);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('HOME');
  const [currentBooking, setCurrentBooking] = useState(activeBooking);

  // Cancel slot & already booked states
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isAlreadyBookedModalVisible, setIsAlreadyBookedModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Sync with prop updates
  useEffect(() => {
    if (activeBooking) {
      setCurrentBooking(activeBooking);
    }
  }, [activeBooking]);

  // Fetch persisted active gate pass from backend on screen load / app restart
  useEffect(() => {
    let isMounted = true;
    if (token) {
      slotService.fetchActivePass(token).then((res) => {
        if (isMounted && res.success && res.booking) {
          setCurrentBooking(res.booking);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleConfirmCancel = async () => {
    if (!currentBooking) return;
    setIsCancelling(true);
    try {
      const res = await slotService.cancelBooking(
        { procurement_id: currentBooking.procurement_id },
        token
      );
      if (res.success) {
        setCurrentBooking(null);
        if (onCancelBooking) onCancelBooking();
        setIsCancelModalVisible(false);
        setCancelFeedback(t.cancelSuccessMessage);
        setTimeout(() => setCancelFeedback(''), 4500);
      } else {
        setIsCancelModalVisible(false);
        setCancelFeedback(t.cancelFailedMessage + ' ' + (res.message || ''));
        setTimeout(() => setCancelFeedback(''), 4500);
      }
    } catch (err) {
      console.error('Error cancelling slot:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const farmerName = farmerData?.Name || t.farmerGreeting;

  const handleLanguageSelect = (lang) => {
    if (onLanguageChange) {
      onLanguageChange(lang.code);
    }
    setIsLangModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#154A18" />

      {/* TOP HEADER SECTION (DARK GREEN) */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          {/* PROFILE AVATAR BUTTON */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setIsProfileModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          </TouchableOpacity>

          {/* LANGUAGE DROPDOWN PILL */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setIsLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.globeIcon}>🌐</Text>
            <Text style={styles.langText}>{t.langLabel}</Text>
            <Text style={styles.dropdownArrow}>⌵</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT WITH BACKGROUND IMAGE */}
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* WELCOME SECTION */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeSubtitle}>{t.welcomeBack}</Text>
            <Text style={styles.welcomeName}>{farmerName}!</Text>
          </View>

          {/* 2X2 GRID CARDS SECTION */}
          <View style={styles.gridContainer}>
            {/* 1. PAYMENT CARD */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => onNavigate('PAYMENT')}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconWrapper}>
                <Text style={styles.rupeeIcon}>₹</Text>
              </View>
              <Text style={styles.cardTitle}>{t.paymentCardTitle}</Text>
              <Text style={styles.cardSubtitle}>{t.paymentCardSubtitle}</Text>
            </TouchableOpacity>

            {/* 2. QUEUE TRACKING CARD */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => onNavigate('QUEUE')}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconWrapper}>
                <Text style={styles.clockIcon}>🕒</Text>
              </View>
              <Text style={styles.cardTitle}>{t.queueCardTitle}</Text>
              <Text style={styles.cardSubtitle}>{t.queueCardSubtitle}</Text>
            </TouchableOpacity>

            {/* 3. NOTIFICATIONS CARD */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => onNavigate('NOTIFICATIONS')}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconWrapper}>
                <View style={styles.notificationIconWrapper}>
                  <Text style={styles.envelopeIcon}>✉️</Text>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>3</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cardTitle}>{t.notificationsCardTitle}</Text>
              <Text style={styles.cardSubtitle}>{t.notificationsCardSubtitle}</Text>
            </TouchableOpacity>

            {/* 4. PROCUREMENT STATUS CARD */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => onNavigate('PROCUREMENT')}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconWrapper}>
                <Text style={styles.procurementIcon}>📋</Text>
              </View>
              <Text style={styles.cardTitle}>{t.procurementCardTitle}</Text>
              <Text style={styles.cardSubtitle}>{t.procurementCardSubtitle}</Text>
            </TouchableOpacity>
          </View>

          {/* CANCELLATION FEEDBACK BANNER */}
          {cancelFeedback ? (
            <View style={styles.cancelFeedbackBanner}>
              <Text style={styles.cancelFeedbackText}>{cancelFeedback}</Text>
            </View>
          ) : null}

          {/* ACTIVE BOOKING PASS (IF AVAILABLE) */}
          {currentBooking && (
            <View style={styles.activeBookingBanner}>
              <View style={styles.activeBookingHeader}>
                <Text style={styles.activeBookingTag}>{t.activeGatePassTag}</Text>
                <Text style={styles.activeBookingDate}>{currentBooking.date}</Text>
              </View>
              <Text style={styles.activeBookingSlotText}>
                {t.slotLabel} {currentBooking.assignedSlot || t.morningShift}
              </Text>
              <Text style={styles.activeBookingMandiText} numberOfLines={1}>
                {t.mandiLabel} {currentBooking.centreName || 'Rajasthan Mandi'}
              </Text>

              {/* TOKEN PILL */}
              <View style={styles.activeBookingTokenPill}>
                <Text style={styles.activeBookingTokenText}>
                  {t.tokenLabel} {currentBooking.token}
                </Text>
              </View>

              {/* CANCEL ACTION BUTTON */}
              <TouchableOpacity
                style={styles.cancelSlotButton}
                onPress={() => setIsCancelModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelSlotButtonText}>❌ {t.cancelSlotBtn}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MAIN FEATURE ACTION: BOOK YOUR SLOT */}
          <TouchableOpacity
            style={[
              styles.bookSlotCard,
              currentBooking && styles.bookSlotCardLocked,
            ]}
            onPress={() => {
              if (currentBooking) {
                setIsAlreadyBookedModalVisible(true);
              } else {
                onNavigate('SLOT_BOOK');
              }
            }}
            activeOpacity={0.85}
          >
            <View style={styles.bookSlotIconWrapper}>
              <Text style={styles.bookSlotCalendarIcon}>
                {currentBooking ? '🔒' : '📅'}
              </Text>
              <View
                style={[
                  styles.bookSlotCheckBadge,
                  currentBooking && styles.bookSlotLockedBadge,
                ]}
              >
                <Text style={styles.bookSlotCheckText}>
                  {currentBooking ? '!' : '✓'}
                </Text>
              </View>
            </View>
            <View style={styles.bookSlotTextContainer}>
              <Text
                style={[
                  styles.bookSlotTitle,
                  currentBooking && styles.bookSlotTitleLocked,
                ]}
              >
                {currentBooking ? t.slotAlreadyBookedTitle : t.bookSlotTitle}
              </Text>
              <Text style={styles.bookSlotSubtitle}>
                {currentBooking
                  ? t.slotAlreadyBookedSubtitle
                  : t.bookSlotSubtitle}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveBottomTab('HOME')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navIcon, activeBottomTab === 'HOME' && styles.activeNavIcon]}>
              🏠
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => onNavigate('QUEUE')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🕒</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => onNavigate('HELP')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>❓</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LANGUAGE SELECTOR MODAL */}
      <Modal
        visible={isLangModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLangModalVisible(false)}
        >
          <View style={styles.langModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectLanguageTitle}</Text>
            </View>
            {AVAILABLE_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOptionItem,
                  (language === lang.code) && styles.selectedLangItem,
                ]}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    (language === lang.code) && styles.selectedLangText,
                  ]}
                >
                  {lang.native} ({lang.label})
                </Text>
                {language === lang.code && (
                  <Text style={styles.selectedCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PROFILE / LOGOUT MODAL */}
      <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsProfileModalVisible(false)}
        >
          <View style={styles.profileModalContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarIcon}>👤</Text>
              </View>
              <Text style={styles.profileName}>{farmerName}</Text>
              <Text style={styles.profileIdText}>
                {t.kisanIdLabel} {farmerData?.farmerID || 'N/A'}
              </Text>
            </View>

            <View style={styles.profileDetailsCard}>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>{t.phoneLabel}</Text>
                <Text style={styles.profileDetailValue}>
                  {farmerData?.phoneNumber ? `+91 ${farmerData.phoneNumber}` : 'N/A'}
                </Text>
              </View>
              <View style={styles.profileDivider} />
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>{t.locationLabel}</Text>
                <Text style={styles.profileDetailValue}>
                  {[farmerData?.city, farmerData?.state].filter(Boolean).join(', ') || 'N/A'}
                </Text>
              </View>
              {farmerData?.pincode ? (
                <>
                  <View style={styles.profileDivider} />
                  <View style={styles.profileDetailRow}>
                    <Text style={styles.profileDetailLabel}>{t.pincodeLabel}</Text>
                    <Text style={styles.profileDetailValue}>{farmerData.pincode}</Text>
                  </View>
                </>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setIsProfileModalVisible(false);
                onLogout();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>{t.logOutBtn}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CANCEL SLOT CONFIRMATION MODAL */}
      <Modal
        visible={isCancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isCancelling) setIsCancelModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!isCancelling) setIsCancelModalVisible(false);
          }}
        >
          <View style={styles.cancelModalCard}>
            <View style={styles.cancelWarningIconCircle}>
              <Text style={styles.cancelWarningIconText}>⚠️</Text>
            </View>

            <Text style={styles.cancelModalTitle}>{t.cancelModalTitle}</Text>

            <Text style={styles.cancelModalMessage}>
              {t.cancelModalMessage}{' '}
              <Text style={styles.boldText}>{currentBooking?.date}</Text> (
              <Text style={styles.boldText}>{currentBooking?.assignedSlot}</Text>) at{' '}
              <Text style={styles.boldText}>{currentBooking?.centreName}</Text>?
            </Text>

            <Text style={styles.cancelModalSubtext}>
              {t.cancelModalSubtext}
            </Text>

            <View style={styles.cancelModalActionsRow}>
              <TouchableOpacity
                style={[styles.cancelModalKeepButton, isCancelling && { opacity: 0.6 }]}
                onPress={() => setIsCancelModalVisible(false)}
                disabled={isCancelling}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalKeepButtonText}>{t.keepSlotBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelModalConfirmButton, isCancelling && { opacity: 0.7 }]}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
                activeOpacity={0.8}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.cancelModalConfirmButtonText}>{t.yesCancelBtn}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ALREADY BOOKED INFORMATIONAL MODAL */}
      <Modal
        visible={isAlreadyBookedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAlreadyBookedModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsAlreadyBookedModalVisible(false)}
        >
          <View style={styles.cancelModalCard}>
            <View style={styles.lockWarningIconCircle}>
              <Text style={styles.lockWarningIconText}>🔒</Text>
            </View>

            <Text style={styles.alreadyBookedModalTitle}>{t.alreadyBookedModalTitle}</Text>

            <Text style={styles.cancelModalMessage}>
              {t.alreadyBookedModalMessage}{' '}
              <Text style={styles.boldText}>{currentBooking?.date}</Text> (
              <Text style={styles.boldText}>{currentBooking?.assignedSlot}</Text>) at{' '}
              <Text style={styles.boldText}>{currentBooking?.centreName}</Text>.
            </Text>

            <Text style={styles.cancelModalSubtext}>
              {t.alreadyBookedModalSubtext}
            </Text>

            <View style={styles.cancelModalActionsRow}>
              <TouchableOpacity
                style={styles.cancelModalKeepButton}
                onPress={() => setIsAlreadyBookedModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalKeepButtonText}>{t.keepCurrentSlotBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalConfirmButton}
                onPress={() => {
                  setIsAlreadyBookedModalVisible(false);
                  setIsCancelModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalConfirmButtonText}>{t.cancelAndRebookBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },

  /* --- TOP HEADER --- */
  topHeader: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarButton: {
    padding: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#A8D5BA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  avatarIcon: {
    fontSize: 24,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
    elevation: 2,
  },
  globeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  langText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 0.5,
  },
  dropdownArrow: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 6,
  },
  ministrySubtitle: {
    fontSize: 11,
    color: '#D2E7D2',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
    paddingHorizontal: 10,
  },

  /* --- BACKGROUND & SCROLL --- */
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.85,
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  /* --- WELCOME SECTION --- */
  welcomeSection: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  welcomeSubtitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: -0.3,
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: -0.3,
  },

  /* --- 2X2 GRID --- */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    minHeight: 145,
  },
  cardIconWrapper: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rupeeIcon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  clockIcon: {
    fontSize: 42,
  },
  notificationIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  envelopeIcon: {
    fontSize: 42,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  procurementIcon: {
    fontSize: 42,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#2E3B2E',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },

  /* --- ACTIVE BOOKING PASS STYLES --- */
  activeBookingBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.8,
    borderColor: '#1B5E20',
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeBookingTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBookingDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#556B2F',
  },
  activeBookingSlotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 2,
  },
  activeBookingMandiText: {
    fontSize: 13,
    color: '#2E3B2E',
    fontWeight: '500',
    marginBottom: 8,
  },
  activeBookingTokenPill: {
    backgroundColor: '#F3F8F2',
    borderWidth: 1,
    borderColor: '#A8C3A8',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  activeBookingTokenText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 0.5,
  },
  cancelSlotButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1.2,
    borderColor: '#EF9A9A',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  cancelSlotButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C62828',
  },

  /* --- CANCELLATION FEEDBACK BANNER --- */
  cancelFeedbackBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#81C784',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  cancelFeedbackText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },

  /* --- BOOK YOUR SLOT FEATURE CARD --- */
  bookSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.8,
    borderColor: '#2E7D32',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 10,
  },
  bookSlotIconWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  bookSlotCalendarIcon: {
    fontSize: 40,
  },
  bookSlotCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bookSlotCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookSlotTextContainer: {
    flex: 1,
  },
  bookSlotCardLocked: {
    borderColor: '#E65100',
    backgroundColor: 'rgba(255, 248, 225, 0.95)',
  },
  bookSlotLockedBadge: {
    backgroundColor: '#E65100',
  },
  bookSlotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 0.4,
  },
  bookSlotTitleLocked: {
    color: '#E65100',
  },
  bookSlotSubtitle: {
    fontSize: 13,
    color: '#2E3B2E',
    fontWeight: '500',
    marginTop: 2,
  },

  /* --- BOTTOM NAVIGATION --- */
  bottomNavContainer: {
    backgroundColor: '#1B5E20',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 16 : 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  navItem: {
    padding: 6,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.85,
  },
  activeNavIcon: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  bottomNavFooter: {
    fontSize: 10,
    color: '#C8E6C9',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* --- MODAL STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  langModalContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 6,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  langOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 3,
  },
  selectedLangItem: {
    backgroundColor: '#E8F5E9',
  },
  langOptionText: {
    fontSize: 15,
    color: '#2E3B2E',
    fontWeight: '600',
  },
  selectedLangText: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  selectedCheckmark: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 16,
  },

  /* --- PROFILE MODAL STYLES --- */
  profileModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    elevation: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#2E7D32',
    marginBottom: 8,
  },
  profileAvatarIcon: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  profileIdText: {
    fontSize: 13,
    color: '#556B2F',
    fontWeight: '600',
    marginTop: 2,
  },
  profileDetailsCard: {
    backgroundColor: '#F7FAF3',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D7E7D7',
    marginBottom: 18,
  },
  profileDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  profileDetailLabel: {
    fontSize: 13,
    color: '#556B2F',
    fontWeight: '600',
  },
  profileDetailValue: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#E0EDE0',
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* --- CANCEL CONFIRMATION MODAL STYLES --- */
  cancelModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cancelWarningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  cancelWarningIconText: {
    fontSize: 28,
  },
  cancelModalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  cancelModalMessage: {
    fontSize: 14,
    color: '#37474F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  cancelModalSubtext: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  cancelModalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    columnGap: 10,
  },
  cancelModalKeepButton: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalKeepButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  cancelModalConfirmButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cancelModalConfirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lockWarningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  lockWarningIconText: {
    fontSize: 28,
  },
  alreadyBookedModalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
    textAlign: 'center',
  },
});
