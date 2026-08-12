import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { checkApiHealth, calculateBazi, BaziCalculationResult, HealthResponse } from './src/services/api';

export default function App() {
  const [birthDate, setBirthDate] = useState<string>('1990-01-01');
  const [gender, setGender] = useState<string>('male');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [baziResult, setBaziResult] = useState<BaziCalculationResult | null>(null);

  useEffect(() => {
    // Check backend API connection status
    checkApiHealth().then((data) => setApiHealth(data));
    // Initial calculation for demo
    handleCalculate('1990-01-01', 'male');
  }, []);

  const handleCalculate = async (dateToUse?: string, genderToUse?: string) => {
    setLoading(true);
    const targetDate = dateToUse || birthDate;
    const targetGender = genderToUse || gender;
    const res = await calculateBazi(targetDate, targetGender);
    setBaziResult(res);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <View style={styles.brandContainer}>
            <MaterialCommunityIcons name="yin-yang" size={32} color="#FFFFFF" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.brandTitle}>FengShui-Shifu</Text>
              <Text style={styles.brandSubtitle}>风水师傅 • AI Fortune & Spatial Audit</Text>
            </View>
          </View>

          {/* API Health Status Badge */}
          <View style={styles.healthBadge}>
            <View style={[styles.statusDot, apiHealth ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.healthText}>
              {apiHealth ? `API Live (${apiHealth.rails_version ? 'Rails 8' : 'Online'})` : 'API Standby'}
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroBadge}>✨ Free Instant BaZi & Kua Calculator</Text>
          <Text style={styles.heroTitle}>Align Your Space & Energy</Text>
          <Text style={styles.heroDescription}>
            Enter your date of birth to reveal your Chinese Astrology Day Master, personal Kua direction, and daily energy forecast.
          </Text>

          {/* Guest Input Form */}
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="1990-05-15"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
            />

            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>♂ Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>♀ Female</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.calculateBtn}
              onPress={() => handleCalculate()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.calculateBtnText}>Calculate My Energy Blueprint 🔮</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Card */}
        {baziResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionHeader}> Your Celestial Energy Profile</Text>

            <View style={styles.resultGrid}>
              {/* Day Master Element */}
              <View style={[styles.resultCard, styles.goldBorder]}>
                <Text style={styles.cardTag}>DAY MASTER (日主)</Text>
                <Text style={styles.dayMasterTitle}>{baziResult.day_master.name}</Text>
                <Text style={styles.dayMasterChinese}>{baziResult.day_master.chinese}</Text>
                <Text style={styles.cardDesc}>
                  Polarity: {baziResult.day_master.polarity} {baziResult.day_master.element}
                </Text>
              </View>

              {/* Kua / Gua Number */}
              <View style={[styles.resultCard, styles.redBorder]}>
                <Text style={styles.cardTag}>KUA NUMBER (卦号)</Text>
                <Text style={styles.kuaNumber}>#{baziResult.kua_number}</Text>
                <Text style={styles.cardDesc}>Group: {baziResult.kua_profile.group} Group</Text>
                <View style={styles.directionPill}>
                  <Text style={styles.directionText}>
                    Top Wealth Direction: {baziResult.kua_profile.sheng_qi} (Sheng Qi)
                  </Text>
                </View>
              </View>
            </View>

            {/* Daily Forecast Teaser */}
            <View style={styles.teaserCard}>
              <Text style={styles.teaserBadge}>⚡ Today's Forecast</Text>
              <Text style={styles.teaserText}>{baziResult.today_luck_teaser}</Text>
            </View>
          </View>
        )}

        {/* Daily Almanac (Tung Shing / 黄历) Section */}
        <View style={styles.almanacSection}>
          <Text style={styles.sectionHeader}>📅 Today's Chinese Almanac (Tung Shing / 黄历)</Text>
          <View style={styles.almanacGrid}>
            <View style={styles.almanacBoxGood}>
              <Text style={styles.almanacLabelGood}>✓ Auspicious Today</Text>
              <Text style={styles.almanacItem}>• Strategic Planning & Signing Contracts</Text>
              <Text style={styles.almanacItem}>• Rearranging Desk Facing Direction</Text>
              <Text style={styles.almanacItem}>• Networking & Wealth Investments</Text>
            </View>
            <View style={styles.almanacBoxAvoid}>
              <Text style={styles.almanacLabelAvoid}>✗ Inauspicious Today</Text>
              <Text style={styles.almanacItem}>• Major Home Ground Breaking</Text>
              <Text style={styles.almanacItem}>• Impulsive Financial Arguments</Text>
            </View>
          </View>
        </View>

        {/* Paid Plan CTA */}
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaTag}>PREMIUM AI SPATIAL AUDIT</Text>
          <Text style={styles.ctaTitle}>Upload Photos & Videos of Your Home</Text>
          <Text style={styles.ctaSubtitle}>
            Our Gemini AI analyzes your room layout, detects poison arrows, and overlays your Bagua map with Google Maps external street orientation.
          </Text>
          <TouchableOpacity style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Upgrade to Premium ($9.99/mo) 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 FengShui-Shifu (风水师傅). All rights reserved.</Text>
          <Text style={styles.footerSub}>Powered by Rails 8 API + Expo React Native Web + Gemini AI</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: '#10B981',
  },
  dotOffline: {
    backgroundColor: '#F59E0B',
  },
  healthText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  heroBadge: {
    color: '#E5A93C',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 22,
    marginBottom: 24,
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(217, 4, 41, 0.2)',
    borderColor: '#D90429',
  },
  genderText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#F8FAFC',
  },
  calculateBtn: {
    backgroundColor: '#D90429',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 40,
    width: '100%',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  resultCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  goldBorder: {
    borderColor: '#E5A93C',
  },
  redBorder: {
    borderColor: '#D90429',
  },
  cardTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  dayMasterTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#E5A93C',
  },
  dayMasterChinese: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginVertical: 2,
  },
  kuaNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D90429',
  },
  cardDesc: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 6,
  },
  directionPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  directionText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  teaserCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderColor: '#475569',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  teaserBadge: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teaserText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
  },
  almanacSection: {
    marginTop: 40,
  },
  almanacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  almanacBoxGood: {
    flex: 1,
    minWidth: 240,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  almanacLabelGood: {
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  almanacBoxAvoid: {
    flex: 1,
    minWidth: 240,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  almanacLabelAvoid: {
    color: '#EF4444',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  almanacItem: {
    color: '#CBD5E1',
    fontSize: 13,
    marginVertical: 2,
  },
  ctaBanner: {
    marginTop: 40,
    backgroundColor: 'linear-gradient(135deg, #1E1B4B 0%, #31103F 100%)',
    backgroundColorFallback: '#1E1B4B',
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#6366F1',
    alignItems: 'center',
  },
  ctaTag: {
    color: '#A855F7',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: '#C084FC',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 20,
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
  },
  footerSub: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
  },
});
