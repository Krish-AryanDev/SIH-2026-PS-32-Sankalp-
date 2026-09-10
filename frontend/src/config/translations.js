/**
 * Simple English & Hindi Translations Dictionary
 * Designed with simple, clear, and farmer-friendly vocabulary.
 */
export const TRANSLATIONS = {
  en: {
    // Language names
    langName: 'English',
    langLabel: 'ENGLISH',
    
    // Common / Global
    ministryHeader: 'Ministry of Consumer Affairs, Food & Public Distribution\n| Department of Consumer Affairs (DoCA)',
    ministrySubtitle: 'Powered by DoCA Smart Automation Platform',
    back: '← Back',
    select: 'Select',
    selected: '✓ Selected',
    verifiedCentre: 'State Government verified centre',
    loading: 'Loading...',
    error: 'Error',
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    returnHome: '← Return to Home Screen',

    // Language Selector Modal
    selectLanguageTitle: '🌐 Select Language / भाषा चुनें',
    
    // Login Screen
    portalTitle: 'Kisan Mitra',
    portalSubtitle: 'Farmer Procurement Portal',
    loginHeader: 'Farmer Login',
    aadharTab: 'Aadhar',
    kisanTab: 'Kisan ID',
    enterAadharLabel: 'Enter 12-digit Aadhar Number',
    enterAadharPlaceholder: '12-digit Aadhar (e.g. 123456789012)',
    enterKisanLabel: 'Enter 11-digit Kisan ID',
    enterKisanPlaceholder: '11-digit Kisan ID (e.g. 12345678901)',
    otpSentTo: 'Enter 6-digit OTP sent to',
    enterOtpPlaceholder: '• • • • • •',
    didntReceiveOtp: "Didn't receive code?",
    resendOtpIn: 'Resend OTP in',
    resendOtpButton: '🔄 Resend OTP',
    changeNumberButton: '✏️ Change Aadhar / Kisan ID',
    sendOtpButton: 'Send OTP →',
    sendingOtp: 'Sending OTP...',
    verifyProceedButton: 'Verify & Proceed ✓',
    verifyingOtp: 'Verifying OTP...',
    govVerifiedBadge: 'Government Verified',
    secureLoginBadge: 'Secure & Direct',
    otpNoticeText: 'We will send a 6-digit OTP to your Aadhaar-linked mobile number for quick verification.',
    validAadharError: 'Please enter a valid 12-digit Aadhar Number.',
    validKisanError: 'Please enter a valid 11-digit Kisan ID.',
    validOtpError: 'Please enter a valid 6-digit OTP.',
    sessionExpiredError: 'Session expired. Please request a new OTP.',
    otpSentSuccess: 'OTP sent successfully to registered mobile number.',

    // Home Screen
    welcomeBack: 'Welcome back,',
    farmerGreeting: 'Farmer',
    paymentCardTitle: 'PAYMENT',
    paymentCardSubtitle: 'Track Your Payments',
    queueCardTitle: 'QUEUE TRACKING',
    queueCardSubtitle: 'Live Mandi Queue',
    notificationsCardTitle: 'NOTIFICATIONS',
    notificationsCardSubtitle: 'View SMS & Alerts',
    procurementCardTitle: 'PROCUREMENT STATUS',
    procurementCardSubtitle: 'Track My Produce',

    // Active Gate Pass Card
    activeGatePassTag: '🟢 ACTIVE GATE PASS',
    slotLabel: '⏰ Slot:',
    mandiLabel: '🏢',
    tokenLabel: 'Token:',
    cancelSlotBtn: '❌ Cancel Slot',

    // Book Feature Card
    bookSlotTitle: 'BOOK YOUR SLOT',
    bookSlotSubtitle: 'Schedule procurement timing',
    slotAlreadyBookedTitle: 'SLOT ALREADY BOOKED',
    slotAlreadyBookedSubtitle: 'Active Gate Pass reserved. Tap to manage.',

    // Cancel Slot Modal
    cancelModalTitle: 'Cancel Scheduled Slot?',
    cancelModalMessage: 'Are you sure you want to cancel your scheduled slot for',
    cancelModalSubtext: 'This will release your reserved slot for other waiting farmers.',
    keepSlotBtn: 'Keep My Slot',
    yesCancelBtn: 'Yes, Cancel',
    cancellingSlot: 'Cancelling...',
    cancelSuccessMessage: '✓ Your slot booking has been cancelled successfully.',
    cancelFailedMessage: 'Failed to cancel slot. Please try again.',

    // Already Booked Modal
    alreadyBookedModalTitle: 'Active Gate Pass in Progress',
    alreadyBookedModalMessage: 'You already have a reserved slot for',
    alreadyBookedModalSubtext: 'Farmers are limited to 1 active Gate Pass at a time. To book another date or shift, you must cancel this existing booking first.',
    keepCurrentSlotBtn: 'Keep Slot',
    cancelAndRebookBtn: 'Cancel & Re-book',

    // Profile Modal
    farmerProfileTitle: 'Farmer Profile',
    kisanIdLabel: 'Kisan ID:',
    phoneLabel: '📱 Phone',
    locationLabel: '📍 Location',
    pincodeLabel: '📮 Pincode',
    logOutBtn: '🚪 Log Out',

    // Slot Booking Screen
    bookSlotScreenTitle: 'Book Your Slot',
    selectDateSection: 'Select Procurement Date',
    estimateProduceSection: 'Estimate Produce',
    enterProduceAmount: 'Enter Produce Amount',
    selectPreferredShift: 'Select Preferred Shift',
    morningShift: 'Morning Shift',
    morningTiming: '08:00 AM - 12:00 PM',
    morningRecommended: '⭐ Recommended for faster unloading',
    afternoonShift: 'Afternoon Shift',
    afternoonTiming: '12:30 PM - 06:00 PM',
    selectMandiSection: 'Select Nearby Procurement Mandi',
    confirmAndBookBtn: 'Confirm & Book Slot',
    activeSlotAlreadyBookedBtn: '🔒 Active Slot Already Booked',
    reservingSlot: 'Reserving Slot...',
    shiftAvailable: 'Shift available for booking',
    shiftFull: 'Shift is full for this quantity',
    pleaseSelectMandi: 'Please select a procurement centre.',
    pleaseEnterQuantity: 'Please enter a valid produce quantity.',

    // Digital Gate Pass Receipt Modal
    bookingConfirmedTitle: 'Slot Booking Confirmed!',
    bookingConfirmedSubtitle: 'Digital Gate Pass Token Generated Successfully',
    gatePassTokenHeader: 'GATE PASS TOKEN',
    showTokenInstruction: 'Show this token at the Mandi weighbridge entrance',
    receiptMandi: '🏢 Procurement Mandi:',
    receiptDate: '📅 Scheduled Date:',
    receiptSlot: '⏰ Assigned Time Slot:',
    receiptProduce: '🌾 Crop & Produce:',
    receiptFarmerId: '👤 Farmer Kisan ID:',
    doneButton: 'Done / Return to Home',

    // Units
    kg: 'Kg',
    quintal: 'Quintal',
    ton: 'Ton',

    // Crops
    wheat: 'Wheat',
    paddy: 'Paddy',
    mustard: 'Mustard',
    gram: 'Gram (Chana)',
    soybean: 'Soybean',

    // Coming Soon Screen
    comingSoonTitle: 'Coming Soon',
    comingSoonDesc: 'This service is currently under preparation and will be available soon.',
    backToHomeBtn: '← Back to Home',
  },

  hi: {
    // Language names
    langName: 'हिन्दी',
    langLabel: 'HINDI',

    // Common / Global
    ministryHeader: 'उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय\n| उपभोक्ता मामले विभाग (DoCA)',
    ministrySubtitle: 'DoCA स्मार्ट ऑटोमेशन प्लेटफॉर्म द्वारा संचालित',
    back: '← पीछे जाएं',
    select: 'चुनें',
    selected: '✓ चुना गया',
    verifiedCentre: 'राज्य सरकार द्वारा प्रमाणित खरीद केंद्र',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    ok: 'ठीक है',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    returnHome: '← होम स्क्रीन पर वापस जाएं',

    // Language Selector Modal
    selectLanguageTitle: '🌐 Select Language / भाषा चुनें',

    // Login Screen
    portalTitle: 'किसान मित्र',
    portalSubtitle: 'किसान खरीद पोर्टल',
    loginHeader: 'किसान लॉगिन',
    aadharTab: 'आधार कार्ड',
    kisanTab: 'किसान आईडी',
    enterAadharLabel: '12 अंकों का आधार नंबर दर्ज करें',
    enterAadharPlaceholder: '12 अंकों का आधार नंबर (उदा. 123456789012)',
    enterKisanLabel: '11 अंकों की किसान आईडी दर्ज करें',
    enterKisanPlaceholder: '11 अंकों की किसान आईडी (उदा. 12345678901)',
    otpSentTo: 'ओटीपी दर्ज करें, जो भेजा गया है:',
    enterOtpPlaceholder: '• • • • • •',
    didntReceiveOtp: 'ओटीपी नहीं मिला?',
    resendOtpIn: 'दोबारा ओटीपी भेजें',
    resendOtpButton: '🔄 दोबारा ओटीपी भेजें',
    changeNumberButton: '✏️ आधार / किसान आईडी बदलें',
    sendOtpButton: 'ओटीपी प्राप्त करें →',
    sendingOtp: 'ओटीपी भेजा जा रहा है...',
    verifyProceedButton: 'सत्यापित करें और आगे बढ़ें ✓',
    verifyingOtp: 'सत्यापन हो रहा है...',
    govVerifiedBadge: 'सरकारी प्रमाणित',
    secureLoginBadge: 'सुरक्षित एवं सीधा लॉगिन',
    otpNoticeText: 'त्वरित सत्यापन के लिए आपके आधार से जुड़े मोबाइल नंबर पर 6 अंकों का ओटीपी भेजा जाएगा।',
    validAadharError: 'कृपया सही 12 अंकों का आधार नंबर दर्ज करें।',
    validKisanError: 'कृपया सही 11 अंकों की किसान आईडी दर्ज करें।',
    validOtpError: 'कृपया 6 अंकों का सही ओटीपी दर्ज करें।',
    sessionExpiredError: 'समय समाप्त हो गया। कृपया नया ओटीपी मंगाएं।',
    otpSentSuccess: 'पंजीकृत मोबाइल नंबर पर ओटीपी सफलतापूर्वक भेज दिया गया है।',

    // Home Screen
    welcomeBack: 'स्वागत है,',
    farmerGreeting: 'किसान',
    paymentCardTitle: 'भुगतान स्थिति',
    paymentCardSubtitle: 'अपने भुगतान देखें',
    queueCardTitle: 'कतार ट्रैकिंग',
    queueCardSubtitle: 'मंडी की लाइव कतार',
    notificationsCardTitle: 'सूचनाएं व संदेश',
    notificationsCardSubtitle: 'एसएमएस व अलर्ट देखें',
    procurementCardTitle: 'खरीद स्थिति',
    procurementCardSubtitle: 'फसल खरीद ट्रैक करें',

    // Active Gate Pass Card
    activeGatePassTag: '🟢 सक्रिय गेट पास',
    slotLabel: '⏰ समय स्लॉट:',
    mandiLabel: '🏢 मंडी:',
    tokenLabel: 'टोकन:',
    cancelSlotBtn: '❌ स्लॉट रद्द करें',

    // Book Feature Card
    bookSlotTitle: 'स्लॉट बुक करें',
    bookSlotSubtitle: 'मंडी में फसल लाने का समय चुनें',
    slotAlreadyBookedTitle: 'स्लॉट पहले से बुक है',
    slotAlreadyBookedSubtitle: 'सक्रिय गेट पास मौजूद है। विवरण के लिए टैप करें।',

    // Cancel Slot Modal
    cancelModalTitle: 'क्या आप स्लॉट रद्द करना चाहते हैं?',
    cancelModalMessage: 'क्या आप वाकई अपना बुक किया गया स्लॉट रद्द करना चाहते हैं?',
    cancelModalSubtext: 'यह स्लॉट रद्द होकर दूसरे किसान भाई के लिए उपलब्ध हो जाएगा।',
    keepSlotBtn: 'स्लॉट चालू रखें',
    yesCancelBtn: 'हाँ, रद्द करें',
    cancellingSlot: 'रद्द किया जा रहा है...',
    cancelSuccessMessage: '✓ आपका स्लॉट सफलतापूर्वक रद्द कर दिया गया है।',
    cancelFailedMessage: 'स्लॉट रद्द नहीं हो सका। कृपया पुनः प्रयास करें।',

    // Already Booked Modal
    alreadyBookedModalTitle: 'गेट पास पहले से सक्रिय है',
    alreadyBookedModalMessage: 'आपके पास पहले से एक सक्रिय गेट पास है।',
    alreadyBookedModalSubtext: 'एक समय में केवल 1 गेट पास रखा जा सकता है। नई तारीख या समय लेने के लिए पहले पुराना स्लॉट रद्द करें।',
    keepCurrentSlotBtn: 'स्लॉट रखें',
    cancelAndRebookBtn: 'रद्द करके नया बुक करें',

    // Profile Modal
    farmerProfileTitle: 'किसान प्रोफाइल',
    kisanIdLabel: 'किसान आईडी:',
    phoneLabel: '📱 मोबाइल',
    locationLabel: '📍 स्थान',
    pincodeLabel: '📮 पिनकोड',
    logOutBtn: '🚪 लॉग आउट',

    // Slot Booking Screen
    bookSlotScreenTitle: 'अपना स्लॉट बुक करें',
    selectDateSection: 'फसल लाने की तारीख चुनें',
    estimateProduceSection: 'फसल की मात्रा (वजन)',
    enterProduceAmount: 'फसल की मात्रा दर्ज करें',
    selectPreferredShift: 'पसंदीदा समय (शिफ्ट) चुनें',
    morningShift: 'सुबह की शिफ्ट',
    morningTiming: 'सुबह 08:00 - दोपहर 12:00',
    morningRecommended: '⭐ जल्दी तुलाई के लिए अनुशंसित',
    afternoonShift: 'दोपहर की शिफ्ट',
    afternoonTiming: 'दोपहर 12:30 - शाम 06:00',
    selectMandiSection: 'नजदीकी खरीद केंद्र (मंडी) चुनें',
    confirmAndBookBtn: 'स्लॉट पक्का करें और बुक करें',
    activeSlotAlreadyBookedBtn: '🔒 स्लॉट पहले से बुक है',
    reservingSlot: 'स्लॉट बुक हो रहा है...',
    shiftAvailable: 'यह शिफ्ट बुकिंग के लिए उपलब्ध है',
    shiftFull: 'इस मात्रा के लिए यह शिफ्ट भरी हुई है',
    pleaseSelectMandi: 'कृपया खरीद केंद्र (मंडी) चुनें।',
    pleaseEnterQuantity: 'कृपया फसल की सही मात्रा दर्ज करें।',

    // Digital Gate Pass Receipt Modal
    bookingConfirmedTitle: 'स्लॉट बुकिंग सफल!',
    bookingConfirmedSubtitle: 'डिजिटल गेट पास टोकन तैयार हो गया है',
    gatePassTokenHeader: 'गेट पास टोकन',
    showTokenInstruction: 'मंडी के प्रवेश द्वार / धर्मकांटे पर यह टोकन दिखाएं',
    receiptMandi: '🏢 खरीद मंडी:',
    receiptDate: '📅 चुनी गई तारीख:',
    receiptSlot: '⏰ निर्धारित समय:',
    receiptProduce: '🌾 फसल व मात्रा:',
    receiptFarmerId: '👤 किसान आईडी:',
    doneButton: 'हो गया / होम पर जाएं',

    // Units
    kg: 'किलो',
    quintal: 'क्विंटल',
    ton: 'टन',

    // Crops
    wheat: 'गेहूं (Wheat)',
    paddy: 'धान (Paddy)',
    mustard: 'सरसों (Mustard)',
    gram: 'चना (Gram)',
    soybean: 'सोयाबीन (Soybean)',

    // Coming Soon Screen
    comingSoonTitle: 'जल्द उपलब्ध होगा',
    comingSoonDesc: 'यह सुविधा अभी तैयार की जा रही है और जल्द ही आपके लिए उपलब्ध होगी।',
    backToHomeBtn: '← होम पर वापस जाएं',
  },
};

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'ENGLISH', native: 'English' },
  { code: 'hi', label: 'HINDI', native: 'हिन्दी' },
];

/**
 * Helper to get translation dictionary with fallback to English
 */
export function getTranslations(lang = 'en') {
  const code = (lang === 'hi' || lang === 'HINDI') ? 'hi' : 'en';
  return TRANSLATIONS[code] || TRANSLATIONS.en;
}
