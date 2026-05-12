import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TODAY } from '@shared/utils';
import { supabase } from '../lib/supabase';
import { useT } from '@shared/i18n';

export default function HomeScreen() {
  const t = useT();

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DayCheck</Text>
      <Text style={styles.date}>
        {TODAY.y}-{String(TODAY.m + 1).padStart(2, '0')}-{String(TODAY.d).padStart(2, '0')}
      </Text>
      <Text style={styles.note}>Phase 2: auth ✓</Text>
      <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
        <Text style={styles.signOutLabel}>{t.signOut}</Text>
      </TouchableOpacity>
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
    gap: 12,
  },
  title: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 36,
    color: '#0A0A0B',
  },
  date: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    color: '#9A9A9F',
  },
  note: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#D7D7DB',
    letterSpacing: 1,
    marginTop: 8,
  },
  signOutBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECECEE',
    borderRadius: 8,
  },
  signOutLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: '#9A9A9F',
  },
});
