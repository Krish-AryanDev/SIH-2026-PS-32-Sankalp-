import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { slotService } from '../services/slotService';
import { AVAILABLE_LANGUAGES, getTranslations } from '../config/translations';

// Helper to generate next 6 upcoming dates
const generateUpcomingDates = () => {
  const dates = [];
  const today = new Date();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const isoDate = d.toISOString().split('T')[0];
    dates.push({
      id: isoDate,
      day: day < 10 ? `0${day}` : `${day}`,
      month,
      isoDate,
      fullLabel: `${day} ${month}`,
    });
  }
  return dates;
};

export default function SlotBookingScreen({
  farmerData,
  token,
  activeBooking,
  language = 'en',
  onLanguageChange,
  onBack,
  onBookingComplete,
}) {
  const t = getTranslations(language);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const datesList = useMemo(() => generateUpcomingDates(), []);

  // State selections
  const [selectedDate, setSelectedDate] = useState(datesList[0]?.isoDate || '2026-09-15');
  const [selectedSession, setSelectedSession] = useState('morning'); // 'morning' | 'afternoon'
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [unit, setUnit] = useState('Kg'); // 'Ton' | 'Quintal' | 'Kg'
  const [quantityInput, setQuantityInput] = useState('25000');

  // Active pass tracking to prevent duplicate booking
  const [currentActivePass, setCurrentActivePass] = useState(activeBooking);

  // Sync prop updates or load from backend
  useEffect(() => {
    if (activeBooking) {
      setCurrentActivePass(activeBooking);
    } else if (token) {
      let isMounted = true;
      slotService.fetchActivePass(token).then((res) => {
        if (isMounted && res.success && res.booking) {
          setCurrentActivePass(res.booking);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [activeBooking, token]);

  // Centers & Availability states
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [isLoadingCentres, setIsLoadingCentres] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({
    checking: false,
    canBook: true,
    message: 'Shift available for booking',
  });

  // Booking action state
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  // 1. Fetch Procurement Centres on mount
  useEffect(() => {
    let isMounted = true;
    const loadCentres = async () => {
      setIsLoadingCentres(true);
      try {
        const res = await slotService.fetchProcurementCentres(
          {
            date: selectedDate,
            crop_type: selectedCrop,
            pincode: farmerData?.pincode || '303007',
          },
          token
        );
        if (isMounted && res.success && res.centres.length > 0) {
          setCentres(res.centres);
          setSelectedCentre(res.centres[0]);
        }
      } catch (err) {
        console.error('Failed to load centres:', err);
      } finally {
        if (isMounted) setIsLoadingCentres(false);
      }
    };
    loadCentres();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedCrop, token, farmerData?.pincode]);

  // 2. Real-time availability check when Center, Date, Session, or Quantity changes
  useEffect(() => {
    if (!selectedCentre) return;

    let isMounted = true;
    const checkShiftAvailability = async () => {
      setAvailabilityStatus((prev) => ({ ...prev, checking: true }));

      const tons = slotService.convertToTons(quantityInput, unit);
      const qtyrange = slotService.getQtyRange(tons);

      try {
        const res = await slotService.checkAvailability(
          {
            centercode: selectedCentre.centrecode,
            date: selectedDate,
            session: selectedSession,
            crop_type: selectedCrop,
            qtyrange,
          },
          token
        );
        if (isMounted) {
          setAvailabilityStatus({
            checking: false,
            canBook: res.canBook,
            message: res.message || (res.canBook ? 'Shift is available' : 'Shift is full for this quantity'),
          });
        }
      } catch (err) {
        if (isMounted) {
          setAvailabilityStatus({
            checking: false,
            canBook: true,
            message: 'Shift available',
          });
        }
      }
    };

    const timeout = setTimeout(checkShiftAvailability, 400);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [selectedCentre, selectedDate, selectedSession, quantityInput, unit, selectedCrop, token]);

  // Handle produce input sanitize
  const handleQuantityChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    setQuantityInput(sanitized);
    if (errorMessage) setErrorMessage('');
  };

  // Convert quantity for dynamic preview
  const currentQuantityInTons = useMemo(() => {
    return slotService.convertToTons(quantityInput, unit);
  }, [quantityInput, unit]);

  const formattedSelectionText = useMemo(() => {
    const rawVal = parseFloat(quantityInput) || 0;
    if (unit === 'Kg') {
      return `${rawVal.toLocaleString('en-IN')} Kg (${(rawVal / 1000).toFixed(2)} Tons)`;
    }
    if (unit === 'Quintal') {
      return `${rawVal.toLocaleString('en-IN')} Quintals (${(rawVal / 10).toFixed(2)} Tons)`;
    }
    return `${rawVal.toLocaleString('en-IN')} Tons (${(rawVal * 1000).toLocaleString('en-IN')} Kg)`;
  }, [quantityInput, unit]);

  // 3. Final Book Action
  const handleConfirmBooking = async () => {
    setErrorMessage('');
    if (currentActivePass) {
      setErrorMessage(
        `You already have an active Gate Pass for ${currentActivePass.date} (${currentActivePass.assignedSlot}). Please cancel your existing pass first before booking another.`
      );
      return;
    }

    if (!selectedCentre) {
      setErrorMessage('Please select a procurement centre.');
      return;
    }

    const numQty = parseFloat(quantityInput);
    if (!numQty || numQty <= 0) {
      setErrorMessage('Please enter a valid produce quantity.');
      return;
    }

    setIsBooking(true);
    const tons = slotService.convertToTons(quantityInput, unit);
    const qtyrange = slotService.getQtyRange(tons);

    try {
      const result = await slotService.bookSlot(
        {
          centercode: selectedCentre.centrecode,
          date: selectedDate,
          session: selectedSession,
          croptype: selectedCrop,
          qtyrange,
          farmer_id: farmerData?.farmerID || null,
        },
        token
      );

      if (result.success && result.data) {
        setConfirmedBookingData({
          ...result.data,
          centreName: selectedCentre.address,
          district: selectedCentre.district,
          date: selectedDate,
          session: selectedSession,
          crop: selectedCrop,
          enteredProduce: formattedSelectionText,
        });
        setIsReceiptModalVisible(true);
      } else {
        setErrorMessage(result.message || 'Unable to book slot. Please try another shift.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* TOP HEADER (DARK GREEN) */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.headerBackButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.headerBackText}>{t.back}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setIsLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.globeIcon}>🌐</Text>
            <Text style={styles.langText}>{t.langLabel}</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TITLE */}
          <Text style={styles.screenTitle}>{t.bookSlotScreenTitle}</Text>

          {/* ACTIVE PASS LOCK BANNER */}
          {currentActivePass ? (
            <View style={styles.alreadyBookedBanner}>
              <View style={styles.alreadyBookedHeader}>
                <View style={styles.lockIconCircle}>
                  <Text style={styles.lockIconText}>🔒</Text>
                </View>
                <View style={styles.alreadyBookedTextCol}>
                  <Text style={styles.alreadyBookedTitle}>{t.slotAlreadyBookedTitle}</Text>
                  <Text style={styles.alreadyBookedSubtitle}>
                    {t.slotLabel} {currentActivePass.date} ({currentActivePass.assignedSlot})
                  </Text>
                </View>
              </View>
              <Text style={styles.alreadyBookedNotice}>
                {t.alreadyBookedModalSubtext}
              </Text>
              <TouchableOpacity
                style={styles.alreadyBookedReturnBtn}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Text style={styles.alreadyBookedReturnBtnText}>{t.returnHome}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* MAIN CARD CONTAINER */}
          <View style={styles.mainCard}>
            {/* MANDI ICON & SELECTED CENTRE BANNER */}
            <View style={styles.mandiBannerHeader}>
              <View style={styles.mandiIllustrationBox}>
                <Text style={styles.mandiIllustrationIcon}>🏢</Text>
                <View style={styles.mandiClockBadge}>
                  <Text style={styles.mandiClockIcon}>🕒</Text>
                </View>
              </View>

              <Text style={styles.mandiNameTitle}>
                {selectedCentre?.address || 'Rajasthan Mandi Procurement Centre'}
              </Text>
              <View style={styles.verifiedTagRow}>
                <Text style={styles.verifiedCheckIcon}>🛡️</Text>
                <Text style={styles.verifiedTagText}>{t.verifiedCentre}</Text>
              </View>
            </View>

            {/* DATE SELECTOR */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>{t.selectDateSection}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateScrollRow}
              >
                {datesList.map((item) => {
                  const isSelected = selectedDate === item.isoDate;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.dateCard, isSelected && styles.dateCardActive]}
                      onPress={() => setSelectedDate(item.isoDate)}
                      activeOpacity={0.8}
                    >
                      {isSelected && (
                        <View style={styles.dateCheckBadge}>
                          <Text style={styles.dateCheckBadgeText}>✓</Text>
                        </View>
                      )}
                      <Text style={[styles.dateDayText, isSelected && styles.dateDayTextActive]}>
                        {item.day}
                      </Text>
                      <Text style={[styles.dateMonthText, isSelected && styles.dateMonthTextActive]}>
                        {item.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ESTIMATE PRODUCE SECTION (INPUT BOX + 3 UNITS) */}
            <View style={styles.sectionBlock}>
              <View style={styles.labelWithSelectionRow}>
                <Text style={styles.produceSectionTitle}>{t.estimateProduceSection}</Text>
                <Text style={styles.currentSelectionPill}>
                  {formattedSelectionText}
                </Text>
              </View>

              {/* INPUT BOX */}
              <View style={styles.quantityInputContainer}>
                <View style={styles.quantityIconWrapper}>
                  <Text style={styles.quantityScaleIcon}>⚖️</Text>
                </View>
                <TextInput
                  style={styles.quantityInput}
                  placeholder={t.enterProduceAmount}
                  placeholderTextColor="#7A8B7A"
                  keyboardType="numeric"
                  value={quantityInput}
                  onChangeText={handleQuantityChange}
                />
                <Text style={styles.quantityUnitSuffix}>{unit}</Text>
              </View>

              {/* 3 UNIT TOGGLE BUTTONS (Ton | Quintal | Kg) */}
              <View style={styles.unitToggleContainer}>
                {['Ton', 'Quintal', 'Kg'].map((u) => {
                  const isActive = unit === u;
                  const unitLabel = u === 'Ton' ? t.ton : u === 'Quintal' ? t.quintal : t.kg;
                  return (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitButton, isActive && styles.unitButtonActive]}
                      onPress={() => setUnit(u)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.unitButtonText, isActive && styles.unitButtonTextActive]}>
                        {unitLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SHIFT / SESSION SELECTOR (MORNING / AFTERNOON) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>{t.selectPreferredShift}</Text>
              <View style={styles.sessionToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.sessionButton,
                    selectedSession === 'morning' && styles.sessionButtonActive,
                  ]}
                  onPress={() => setSelectedSession('morning')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sessionIcon}>🌅</Text>
                  <View style={styles.sessionTextCol}>
                    <Text
                      style={[
                        styles.sessionTitle,
                        selectedSession === 'morning' && styles.sessionTitleActive,
                      ]}
                    >
                      {t.morningShift}
                    </Text>
                    <Text style={styles.sessionSubtitle}>{t.morningTiming}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sessionButton,
                    selectedSession === 'afternoon' && styles.sessionButtonActive,
                  ]}
                  onPress={() => setSelectedSession('afternoon')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sessionIcon}>🌇</Text>
                  <View style={styles.sessionTextCol}>
                    <Text
                      style={[
                        styles.sessionTitle,
                        selectedSession === 'afternoon' && styles.sessionTitleActive,
                      ]}
                    >
                      {t.afternoonShift}
                    </Text>
                    <Text style={styles.sessionSubtitle}>{t.afternoonTiming}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* REAL-TIME AVAILABILITY BADGE */}
              <View
                style={[
                  styles.availabilityBadge,
                  availabilityStatus.canBook
                    ? styles.availabilityBadgeSuccess
                    : styles.availabilityBadgeWarning,
                ]}
              >
                {availabilityStatus.checking ? (
                  <ActivityIndicator size="small" color="#1B5E20" style={{ marginRight: 6 }} />
                ) : (
                  <Text style={styles.availabilityBadgeIcon}>
                    {availabilityStatus.canBook ? '🟢' : '🔴'}
                  </Text>
                )}
                <Text
                  style={[
                    styles.availabilityBadgeText,
                    availabilityStatus.canBook
                      ? styles.availabilityTextSuccess
                      : styles.availabilityTextWarning,
                  ]}
                >
                  {availabilityStatus.checking
                    ? t.loading
                    : availabilityStatus.message}
                </Text>
              </View>
            </View>

            {/* SELECT ANOTHER PROCUREMENT CENTRE */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeadingLarge}>{t.selectMandiSection}:</Text>

              {isLoadingCentres ? (
                <View style={styles.loadingCentresBox}>
                  <ActivityIndicator size="small" color="#1B5E20" />
                  <Text style={styles.loadingCentresText}>{t.loading}</Text>
                </View>
              ) : (
                centres.map((item) => {
                  const isSelected = selectedCentre?.centrecode === item.centrecode;
                  return (
                    <View
                      key={item.centrecode}
                      style={[styles.centreListItem, isSelected && styles.centreListItemActive]}
                    >
                      <View style={styles.centrePinIconWrapper}>
                        <Text style={styles.centrePinIcon}>📍</Text>
                      </View>

                      <View style={styles.centreDetailsCol}>
                        <Text style={styles.centreNameText}>{item.address}</Text>
                        <Text style={styles.centreDistrictText}>{item.district}</Text>
                      </View>

                      <View style={styles.centreActionCol}>
                        <Text style={styles.centreStatusBadge}>Available</Text>
                        <TouchableOpacity
                          style={[
                            styles.selectCentreButton,
                            isSelected && styles.selectCentreButtonActive,
                          ]}
                          onPress={() => setSelectedCentre(item)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.selectCentreButtonText,
                              isSelected && styles.selectCentreButtonTextActive,
                            ]}
                          >
                            {isSelected ? t.selected : t.select}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* ERROR BANNER */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* CONFIRM BOOKING ACTION BUTTON */}
            <TouchableOpacity
              style={[
                styles.confirmBookingButton,
                (!availabilityStatus.canBook || isBooking || Boolean(currentActivePass)) && styles.confirmButtonDisabled,
                Boolean(currentActivePass) && styles.confirmButtonLocked,
              ]}
              onPress={handleConfirmBooking}
              disabled={!availabilityStatus.canBook || isBooking || Boolean(currentActivePass)}
              activeOpacity={0.85}
            >
              {currentActivePass ? (
                <Text style={styles.confirmBookingButtonText}>{t.activeSlotAlreadyBookedBtn}</Text>
              ) : isBooking ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.confirmBookingButtonText}> {t.reservingSlot}</Text>
                </View>
              ) : (
                <Text style={styles.confirmBookingButtonText}>{t.confirmAndBookBtn}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM NAV BAR */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavRow}>
          <TouchableOpacity style={styles.navItem} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.navIcon}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <Text style={styles.navIcon}>🕒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <Text style={styles.navIcon}>👤</Text>
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
                onPress={() => {
                  if (onLanguageChange) onLanguageChange(lang.code);
                  setIsLangModalVisible(false);
                }}
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

      {/* DIGITAL GATE PASS RECEIPT MODAL */}
      <Modal
        visible={isReceiptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsReceiptModalVisible(false);
          if (onBookingComplete) onBookingComplete(confirmedBookingData);
          else onBack();
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.receiptCard}>
            {/* SUCCESS ICON */}
            <View style={styles.receiptSuccessIconCircle}>
              <Text style={styles.receiptSuccessIconText}>✓</Text>
            </View>

            <Text style={styles.receiptTitle}>{t.bookingConfirmedTitle}</Text>
            <Text style={styles.receiptSubtitle}>
              {t.bookingConfirmedSubtitle}
            </Text>

            {/* TOKEN PASS BOX */}
            <View style={styles.tokenPassBox}>
              <Text style={styles.tokenLabel}>{t.gatePassTokenHeader}</Text>
              <Text style={styles.tokenValue}>{confirmedBookingData?.token || 'TOKEN-GEN-2026'}</Text>
              <Text style={styles.tokenInstruction}>
                {t.showTokenInstruction}
              </Text>
            </View>

            {/* DETAILS LIST */}
            <View style={styles.receiptDetailsCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>{t.receiptMandi}</Text>
                <Text style={styles.receiptRowValue} numberOfLines={1}>
                  {confirmedBookingData?.centreName || 'Jaipur Mandi'}
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>{t.receiptDate}</Text>
                <Text style={styles.receiptRowValue}>{confirmedBookingData?.date}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>{t.receiptSlot}</Text>
                <Text style={[styles.receiptRowValue, styles.slotHighlight]}>
                  {confirmedBookingData?.assignedSlot || '08:00 - 10:00 AM'}
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>{t.receiptProduce}</Text>
                <Text style={styles.receiptRowValue}>
                  {confirmedBookingData?.crop} ({confirmedBookingData?.reservedQty} Tons)
                </Text>
              </View>
            </View>

            {/* RETURN HOME ACTION */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setIsReceiptModalVisible(false);
                if (onBookingComplete) onBookingComplete(confirmedBookingData);
                else onBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>{t.doneButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF3E6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },

  /* --- TOP HEADER --- */
  topHeader: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 10,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBackButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6EB',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8DEC8',
  },
  globeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#1B5E20',
    marginLeft: 4,
  },
  ministrySubtitle: {
    fontSize: 11,
    color: '#D2E7D2',
    textAlign: 'center',
    fontWeight: '500',
  },

  /* --- SCREEN TITLE --- */
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 4,
  },

  /* --- MAIN CARD CONTAINER --- */
  mainCard: {
    backgroundColor: '#F7FAF3',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  /* --- MANDI BANNER HEADER --- */
  mandiBannerHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0EDE0',
    marginBottom: 16,
  },
  mandiIllustrationBox: {
    position: 'relative',
    marginBottom: 8,
  },
  mandiIllustrationIcon: {
    fontSize: 48,
  },
  mandiClockBadge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 1,
    borderWidth: 1,
    borderColor: '#1B5E20',
  },
  mandiClockIcon: {
    fontSize: 18,
  },
  mandiNameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  verifiedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheckIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  verifiedTagText: {
    fontSize: 13,
    color: '#556B2F',
    fontWeight: '600',
  },

  /* --- SECTION BLOCKS --- */
  sectionBlock: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E3B2E',
    marginBottom: 10,
  },
  sectionHeadingLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
    marginTop: 4,
  },

  /* --- DATE SELECTOR --- */
  dateScrollRow: {
    paddingVertical: 4,
  },
  dateCard: {
    width: 68,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EAEFE6',
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  dateCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
    borderWidth: 2,
    elevation: 3,
  },
  dateCheckBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#1B5E20',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dateCheckBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateDayText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E3B2E',
  },
  dateDayTextActive: {
    color: '#1B5E20',
  },
  dateMonthText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#556B2F',
    marginTop: 2,
  },
  dateMonthTextActive: {
    color: '#1B5E20',
  },

  /* --- ESTIMATE PRODUCE INPUT --- */
  labelWithSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produceSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513', // Warm earthen brown
  },
  currentSelectionPill: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '700',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#A8C3A8',
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  quantityIconWrapper: {
    marginRight: 8,
  },
  quantityScaleIcon: {
    fontSize: 20,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  quantityUnitSuffix: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#556B2F',
  },

  /* --- UNIT TOGGLE (TON | QUINTAL | KG) --- */
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2EBE2',
    borderRadius: 16,
    padding: 3,
    height: 44,
  },
  unitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
  },
  unitButtonActive: {
    backgroundColor: '#1B5E20',
    elevation: 2,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E3B2E',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },

  /* --- SESSION SELECTOR --- */
  sessionToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sessionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 4,
  },
  sessionButtonActive: {
    borderColor: '#1B5E20',
    backgroundColor: '#E8F5E9',
    elevation: 2,
  },
  sessionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sessionTextCol: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E3B2E',
  },
  sessionTitleActive: {
    color: '#1B5E20',
  },
  sessionSubtitle: {
    fontSize: 10,
    color: '#556B2F',
    marginTop: 1,
  },

  /* --- AVAILABILITY BADGE --- */
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  availabilityBadgeSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  availabilityBadgeWarning: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  availabilityBadgeIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  availabilityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  availabilityTextSuccess: {
    color: '#2E7D32',
  },
  availabilityTextWarning: {
    color: '#E65100',
  },

  /* --- CENTRE LIST ITEMS --- */
  loadingCentresBox: {
    padding: 20,
    alignItems: 'center',
  },
  loadingCentresText: {
    fontSize: 13,
    color: '#556B2F',
    marginTop: 6,
  },
  centreListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2EBE2',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C8DEC8',
  },
  centreListItemActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
    borderWidth: 1.5,
  },
  centrePinIconWrapper: {
    marginRight: 10,
  },
  centrePinIcon: {
    fontSize: 22,
  },
  centreDetailsCol: {
    flex: 1,
    paddingRight: 8,
  },
  centreNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
    textTransform: 'uppercase',
  },
  centreDistrictText: {
    fontSize: 12,
    color: '#556B2F',
    fontWeight: '500',
    marginTop: 2,
  },
  centreActionCol: {
    alignItems: 'flex-end',
  },
  centreStatusBadge: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 4,
  },
  selectCentreButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  selectCentreButtonActive: {
    backgroundColor: '#2E7D32',
  },
  selectCentreButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectCentreButtonTextActive: {
    color: '#FFFFFF',
  },

  /* --- ERROR BANNER --- */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  /* --- CONFIRM BUTTON --- */
  confirmBookingButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 25,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 6,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* --- BOTTOM NAVIGATION --- */
  bottomNavContainer: {
    backgroundColor: '#1B5E20',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
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
    fontSize: 22,
    opacity: 0.9,
  },
  bottomNavFooter: {
    fontSize: 9,
    color: '#C8E6C9',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 12,
  },

  /* --- RECEIPT MODAL --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
  },
  receiptSuccessIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    borderWidth: 2.5,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptSuccessIconText: {
    fontSize: 28,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: 12,
    color: '#556B2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  tokenPassBox: {
    width: '100%',
    backgroundColor: '#F3F8F2',
    borderWidth: 1.5,
    borderColor: '#1B5E20',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 11,
    color: '#556B2F',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tokenValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 2,
    marginVertical: 4,
  },
  tokenInstruction: {
    fontSize: 11,
    color: '#2E3B2E',
    textAlign: 'center',
  },
  receiptDetailsCard: {
    width: '100%',
    backgroundColor: '#F7FAF3',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0EDE0',
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptRowLabel: {
    fontSize: 12,
    color: '#556B2F',
    fontWeight: '600',
  },
  receiptRowValue: {
    fontSize: 12,
    color: '#2E3B2E',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  slotHighlight: {
    color: '#1B5E20',
    fontSize: 13,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E0EDE0',
    marginVertical: 4,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#1B5E20',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* --- ALREADY BOOKED LOCK BANNER STYLES --- */
  alreadyBookedBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.8,
    borderColor: '#FFA000',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  alreadyBookedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE082',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockIconText: {
    fontSize: 22,
  },
  alreadyBookedTextCol: {
    flex: 1,
  },
  alreadyBookedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
  },
  alreadyBookedSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4037',
    marginTop: 2,
  },
  alreadyBookedNotice: {
    fontSize: 12.5,
    color: '#4E342E',
    lineHeight: 18,
    marginBottom: 12,
  },
  alreadyBookedReturnBtn: {
    backgroundColor: '#E65100',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alreadyBookedReturnBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: 'bold',
  },
  confirmButtonLocked: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575',
  },

  /* --- LANGUAGE MODAL STYLES --- */
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
});
