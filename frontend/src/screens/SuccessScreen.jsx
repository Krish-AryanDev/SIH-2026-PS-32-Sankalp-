import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';

export default function SuccessScreen({ farmerData, token, onLogout }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF3E6" />

      {/* BACKGROUND DECORATIONS (pointerEvents="none" to prevent blocking touch events on Android) */}
      <Text pointerEvents="none" style={styles.topLeftLeaf}>🌿</Text>
      <Text pointerEvents="none" style={styles.topRightLeaf}>🌿</Text>

      {/* BOTTOM LANDSCAPE SCENE */}
      <View pointerEvents="none" style={styles.landscapeContainer}>
        <View style={styles.hillBackRight} />
        <View style={styles.hillFrontLeft} />
        <View style={styles.hillFrontRight} />
        <Text style={styles.bgTractor}>🚜</Text>
        <Text style={styles.bgWheatLeft}>🌾</Text>
        <Text style={styles.bgWheatRight}>🌾🌾</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO SECTION */}
        <View style={styles.logoSection}>
          <View style={styles.logoIconRow}>
            <Text style={styles.logoLeaf}>🌱</Text>
            <Text style={styles.logoTractor}>🚜</Text>
            <Text style={styles.logoShield}>🛡️</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTitle}>Kisan Mitra</Text>
            <Text style={styles.logoSubtitle}>किसान मित्र | Farmer Portal</Text>
          </View>
        </View>

        {/* SUCCESS CARD */}
        <View style={styles.successCard}>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeIcon}>✓</Text>
          </View>

          {/* REQUIRED EXACT TEXT */}
          <Text style={styles.successTitle}>success login</Text>
          <Text style={styles.successSubtitle}>
            Welcome back! Your identity has been verified successfully.
          </Text>

          {/* FARMER DETAILS (IF AVAILABLE) */}
          {farmerData && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👤 Name:</Text>
                <Text style={styles.detailValue}>{farmerData.Name || 'N/A'}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🚜 Kisan ID:</Text>
                <Text style={styles.detailValue}>{farmerData.farmerID || 'N/A'}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📱 Phone:</Text>
                <Text style={styles.detailValue}>
                  {farmerData.phoneNumber
                    ? `+91 ${farmerData.phoneNumber}`
                    : 'N/A'}
                </Text>
              </View>

              {(farmerData.city || farmerData.state) && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Location:</Text>
                    <Text style={styles.detailValue}>
                      {[farmerData.city, farmerData.state].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* LOGOUT / BACK BUTTON */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Log Out / Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF3E6',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    paddingVertical: 24,
  },

  /* --- BACKGROUND DECORATIONS --- */
  topLeftLeaf: {
    position: 'absolute',
    top: 20,
    left: -10,
    fontSize: 50,
    opacity: 0.15,
    transform: [{ rotate: '120deg' }],
    zIndex: 0,
  },
  topRightLeaf: {
    position: 'absolute',
    top: 100,
    right: -20,
    fontSize: 60,
    opacity: 0.15,
    transform: [{ rotate: '-45deg' }],
    zIndex: 0,
  },
  landscapeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 0,
    overflow: 'hidden',
  },
  hillBackRight: {
    position: 'absolute',
    bottom: -150,
    right: -50,
    width: 400,
    height: 300,
    borderRadius: 200,
    backgroundColor: '#E8DEC4',
    borderWidth: 2,
    borderColor: '#DFD2B5',
  },
  hillFrontLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 350,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#EAE1CA',
    borderWidth: 2,
    borderColor: '#DFD2B5',
  },
  hillFrontRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 150,
    borderRadius: 150,
    backgroundColor: '#E3D7BA',
  },
  bgTractor: {
    position: 'absolute',
    bottom: 70,
    left: 60,
    fontSize: 45,
    opacity: 0.15,
  },
  bgWheatLeft: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    fontSize: 30,
    opacity: 0.15,
  },
  bgWheatRight: {
    position: 'absolute',
    bottom: 60,
    right: 50,
    fontSize: 35,
    opacity: 0.15,
  },

  /* --- LOGO SECTION --- */
  logoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  logoLeaf: {
    position: 'absolute',
    top: -15,
    left: 5,
    fontSize: 20,
    zIndex: 2,
  },
  logoTractor: {
    fontSize: 40,
    color: '#1B5E20',
  },
  logoShield: {
    fontSize: 28,
    marginLeft: 2,
    marginBottom: 5,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  logoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3B2E',
    marginTop: -2,
  },

  /* --- SUCCESS CARD --- */
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8DEC8',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  successBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
    marginBottom: 16,
  },
  successBadgeIcon: {
    fontSize: 32,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#556B2F',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* --- DETAILS --- */
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F7FAF3',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7E7D7',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#2E3B2E',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E0EDE0',
    marginVertical: 4,
  },

  /* --- LOGOUT BUTTON --- */
  logoutButton: {
    width: '100%',
    backgroundColor: '#1B5E20',
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
