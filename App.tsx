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
  const [birthYear, setBirthYear] = useState<string>('1990');
  const [birthMonth, setBirthMonth] = useState<string>('01');
  const [birthDay, setBirthDay] = useState<string>('01');
  const [birthHour, setBirthHour] = useState<string>('');
  const [birthMinute, setBirthMinute] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [baziResult, setBaziResult] = useState<BaziCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check backend API connection status
    checkApiHealth().then((data) => setApiHealth(data));
    // Initial calculation for demo
    handleCalculate('1990', '01', '01', undefined, undefined, '');
  }, []);

  const handleCalculate = async (
    yearToUse?: string,
    monthToUse?: string,
    dayToUse?: string,
    hourToUse?: string,
    minuteToUse?: string,
    genderToUse?: string
  ) => {
    setLoading(true);
    setError(null);

    const y = (yearToUse !== undefined ? yearToUse : birthYear).trim();
    const m = (monthToUse !== undefined ? monthToUse : birthMonth).trim();
    const d = (dayToUse !== undefined ? dayToUse : birthDay).trim();
    const hr = (hourToUse !== undefined ? hourToUse : birthHour).trim();
    const min = (minuteToUse !== undefined ? minuteToUse : birthMinute).trim();
    const targetGender = genderToUse !== undefined ? genderToUse : gender;

    const yNum = parseInt(y, 10);
    const mNum = parseInt(m, 10);
    const dNum = parseInt(d, 10);

    if (isNaN(yNum) || yNum < 1900 || yNum > 2100) {
      setError('Please enter a valid 4-digit Year (e.g. 1990).');
      setLoading(false);
      return;
    }
    if (isNaN(mNum) || mNum < 1 || mNum > 12) {
      setError('Please enter a valid Month between 1 and 12.');
      setLoading(false);
      return;
    }
    if (isNaN(dNum) || dNum < 1 || dNum > 31) {
      setError('Please enter a valid Day between 1 and 31.');
      setLoading(false);
      return;
    }

    // Format optional birth time (HH:MM)
    // If Hour is provided, format as HH:MM (defaulting Minute to 00 if left blank).
    // If Hour is blank, birth time is omitted (and clearing orphaned Minute box if entered).
    let formattedTime: string | undefined = undefined;
    if (hr !== '') {
      const hrNum = parseInt(hr, 10);
      if (isNaN(hrNum) || hrNum < 0 || hrNum > 23) {
        setError('Please enter a valid Hour between 00 and 23.');
        setLoading(false);
        return;
      }
      const minNum = min !== '' ? parseInt(min, 10) : 0;
      if (isNaN(minNum) || minNum < 0 || minNum > 59) {
        setError('Please enter a valid Minute between 00 and 59.');
        setLoading(false);
        return;
      }
      const formattedHr = hrNum < 10 ? `0${hrNum}` : `${hrNum}`;
      const formattedMin = minNum < 10 ? `0${minNum}` : `${minNum}`;
      formattedTime = `${formattedHr}:${formattedMin}`;
    } else if (min !== '') {
      setBirthMinute('');
    }

    const formattedMonth = mNum < 10 ? `0${mNum}` : `${mNum}`;
    const formattedDay = dNum < 10 ? `0${dNum}` : `${dNum}`;
    const formattedDate = `${yNum}-${formattedMonth}-${formattedDay}`;

    const res = await calculateBazi(formattedDate, targetGender, formattedTime);

    if (res.success && res.data) {
      setBaziResult(res.data);
    } else {
      setError(res.error || 'Failed to calculate BaZi. Please try again.');
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
            <Text style={styles.formLabel}>Date of Birth</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateColYear}>
                <TextInput
                  style={styles.dateInput}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  placeholder="YYYY"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.dateSubLabel}>Year</Text>
              </View>
              <View style={styles.dateColMonth}>
                <TextInput
                  style={styles.dateInput}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  placeholder="MM"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSubLabel}>Month</Text>
              </View>
              <View style={styles.dateColDay}>
                <TextInput
                  style={styles.dateInput}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  placeholder="DD"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSubLabel}>Day</Text>
              </View>
            </View>

            {/* Optional Birth Time */}
            <Text style={styles.formLabel}>Birth Time (Optional, 24-hr local time at birthplace)</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <TextInput
                  style={styles.dateInput}
                  value={birthHour}
                  onChangeText={setBirthHour}
                  placeholder="HH"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSubLabel}>Hour (00-23)</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeCol}>
                <TextInput
                  style={styles.dateInput}
                  value={birthMinute}
                  onChangeText={setBirthMinute}
                  placeholder="MM"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSubLabel}>Min (00-59)</Text>
              </View>
            </View>

            {/* Optional Gender */}
            <Text style={styles.formLabel}>Gender (Optional)</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => setGender(gender === 'male' ? '' : 'male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>♂ Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => setGender(gender === 'female' ? '' : 'female')}
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

        {/* Paid Plan CTA. Hidden for future development.*/}
        {false && (
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
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 FengShui-Shifu (风水师傅). All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
