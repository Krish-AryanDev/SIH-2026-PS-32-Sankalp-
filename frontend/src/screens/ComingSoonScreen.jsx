import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';

import { getTranslations } from '../config/translations';

export default function ComingSoonScreen({
  title = 'Feature',
  language = 'en',
  onBack,
}) {
  const t = getTranslations(language);

  // Map incoming feature title to translated title if available
  const displayTitle =
    title === 'Payment'
      ? t.paymentCardTitle
      : title === 'Queue Tracking'
      ? t.queueCardTitle
      : title === 'Notifications'
      ? t.notificationsCardTitle
      : title === 'Procurement Status'
      ? t.procurementCardTitle
      : title;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation / Back Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{t.backToHomeBtn}</Text>
        </TouchableOpacity>
        {displayTitle ? <Text style={styles.headerTitle}>{displayTitle}</Text> : null}
      </View>

      {/* Main Single Box / Div with White Background */}
      <View style={styles.container}>
        <View style={styles.comingSoonBox}>
          <Text style={styles.comingSoonIcon}>🌱</Text>
          <Text style={styles.comingSoonText}>{t.comingSoonTitle}</Text>
          <Text style={styles.comingSoonSubtext}>
            {t.comingSoonDesc}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t.backToHomeBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0F7F0',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3B2E',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  comingSoonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    textTransform: 'capitalize',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#556B2F',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
