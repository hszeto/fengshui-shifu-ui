import React, { useState, useEffect } from 'react';
import {
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
import { styles } from './src/styles/appStyles';

export default function App() {
  const [birthDate, setBirthDate] = useState<string>('1990-01-01');
  const [gender, setGender] = useState<string>('male');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [baziResult, setBaziResult] = useState<BaziCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check backend API connection status
    checkApiHealth().then((data) => setApiHealth(data));
    // Initial calculation for demo
    handleCalculate('1990-01-01', 'male');
  }, []);

  const handleCalculate = async (dateToUse?: string, genderToUse?: string) => {
    setLoading(true);
    setError(null);

    const targetDate = dateToUse || birthDate;
    const targetGender = genderToUse || gender;
    const res = await calculateBazi(targetDate, targetGender);

    if (res) {
      setBaziResult(res);
    } else {
      setError('Unable to connect to the server. Please try again later.');
    }
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
              Server {apiHealth ? 'Connected' : 'Standby'}
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

        {/* Error Banner */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

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
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
