import { View, Text, StyleSheet } from 'react-native';
import { TODAY } from '@shared/utils';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DayCheck</Text>
      <Text style={styles.subtitle}>
        {TODAY.y}-{String(TODAY.m + 1).padStart(2, '0')}-{String(TODAY.d).padStart(2, '0')}
      </Text>
      <Text style={styles.note}>Native app — Phase 1 scaffold ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 36,
    marginBottom: 8,
    color: '#0A0A0B',
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    color: '#9A9A9F',
    marginBottom: 24,
  },
  note: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#D7D7DB',
    letterSpacing: 1,
  },
});
