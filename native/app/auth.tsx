import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Svg, Path, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { useT } from '@shared/i18n';

WebBrowser.maybeCompleteAuthSession();

const THEME = {
  bg: '#FFFFFF',
  text: '#0A0A0B',
  dim: '#9A9A9F',
  rule: '#ECECEE',
  accent: '#E02828',
};

type Mode = 'signin' | 'register';
type Step = 'auth' | 'email';

export default function AuthScreen() {
  const [step, setStep] = useState<Step>('auth');
  const [mode, setMode] = useState<Mode>('signin');

  if (step === 'email') {
    return <EmailStep mode={mode} onBack={() => setStep('auth')} />;
  }
  return (
    <AuthStep
      mode={mode}
      setMode={setMode}
      onContinueEmail={() => setStep('email')}
    />
  );
}

function AuthStep({
  mode,
  setMode,
  onContinueEmail,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  onContinueEmail: () => void;
}) {
  const t = useT();
  const [oauthError, setOauthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setOauthError('');
    setLoading(true);
    try {
      const redirectTo = makeRedirectUri({ scheme: 'daycheck', path: 'auth/callback' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('No URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success') {
        const parsed = Linking.parse(result.url);
        const params = parsed.queryParams ?? {};
        const code = params['code'] as string | undefined;
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
        }
      }
    } catch (err: any) {
      setOauthError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>DayCheck</Text>
          <Text style={styles.tagline}>·  {t.tagline}</Text>
        </View>

        <Text style={styles.title}>
          {mode === 'signin' ? t.signInTitle : t.registerTitle}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' ? t.signInSubtitle : t.registerSubtitle}
        </Text>

        <View style={styles.providerGroup}>
          <ProviderBtn
            onPress={handleGoogle}
            label={t.continueGoogle}
            icon={<GoogleIcon />}
            loading={loading}
          />
          {!!oauthError && <Text style={styles.errorText}>{oauthError}</Text>}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>{t.or}</Text>
            <View style={styles.dividerLine} />
          </View>

          <ProviderBtn
            onPress={onContinueEmail}
            label={mode === 'signin' ? t.continueEmail : t.signUpEmail}
            icon={<MailIcon />}
          />
        </View>
      </View>

      <View style={styles.footer}>
        {mode === 'signin' ? (
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t.newHere}</Text>
            <TouchableOpacity onPress={() => setMode('register')}>
              <Text style={styles.footerLink}>{t.createAccountLink}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t.alreadyHaveOne}</Text>
            <TouchableOpacity onPress={() => setMode('signin')}>
              <Text style={styles.footerLink}>{t.signInLink}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function EmailStep({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = email.trim().length > 3 && pwd.length >= 6;

  const submit = async () => {
    if (!valid) return;
    setError('');
    setLoading(true);
    const { error: err } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd })
      : await supabase.auth.signUp({ email: email.trim(), password: pwd });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (mode === 'register') setError(t.checkEmailNote);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.emailHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <Path d="M9 3L5 7L9 11" stroke={THEME.text} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.emailHeaderLabel}>
            {mode === 'signin' ? t.signInHeader : t.registerHeader}
          </Text>
        </View>

        <View style={styles.emailBody}>
          <Text style={styles.title}>
            {mode === 'signin' ? t.welcomeBack : t.aFewDetails}
          </Text>

          <View style={styles.fieldGroup}>
            <Field
              label={t.emailField}
              value={email}
              onChangeText={setEmail}
              placeholder={t.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label={t.passwordField}
              value={pwd}
              onChangeText={setPwd}
              placeholder={mode === 'register' ? t.passwordPlaceholder : '••••••••'}
              secureTextEntry
            />
          </View>

          {!!error && (
            <Text style={[styles.errorText, error === t.checkEmailNote && { color: THEME.dim }]}>
              {error}
            </Text>
          )}
        </View>

        <View style={styles.emailFooter}>
          <Text style={styles.footerText}>
            {mode === 'register' ? t.termsNote : ''}
          </Text>
          <TouchableOpacity
            onPress={submit}
            disabled={!valid || loading}
            style={[styles.primaryBtn, (!valid || loading) && { opacity: 0.4 }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryBtnText}>
                  {mode === 'signin' ? t.signInBtn : t.createAccountBtn}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.dim}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
        style={styles.fieldInput}
      />
    </View>
  );
}

function ProviderBtn({
  onPress,
  label,
  icon,
  loading,
}: {
  onPress: () => void;
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.providerBtn} disabled={loading}>
      <View style={styles.providerBtnIcon}>{icon}</View>
      {loading
        ? <ActivityIndicator color={THEME.text} size="small" />
        : <Text style={styles.providerBtnLabel}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

function GoogleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path fill="#4285F4" d="M15.6 8.2c0-.5 0-1-.1-1.4H8v2.8h4.3c-.2 1-.7 1.8-1.6 2.4v2h2.6c1.5-1.4 2.3-3.4 2.3-5.8z" />
      <Path fill="#34A853" d="M8 16c2.2 0 4-.7 5.3-2l-2.6-2c-.7.5-1.6.8-2.7.8-2.1 0-3.8-1.4-4.5-3.3H1v2C2.3 14.2 4.9 16 8 16z" />
      <Path fill="#FBBC05" d="M3.5 9.5C3.3 9 3.2 8.5 3.2 8s.1-1 .3-1.5v-2H1C.4 5.6 0 6.8 0 8s.4 2.4 1 3.5l2.5-2z" />
      <Path fill="#EA4335" d="M8 3.2c1.2 0 2.3.4 3.1 1.2L13.4 2C12 .7 10.2 0 8 0 4.9 0 2.3 1.8 1 4.5l2.5 2C4.2 4.6 5.9 3.2 8 3.2z" />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke={THEME.text} strokeWidth="1.4" />
      <Path d="M2 4l6 5 6-5" stroke={THEME.text} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const FONT_MONO = 'JetBrainsMono_400Regular';
const FONT_SERIF = 'Fraunces_500Medium';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  body: {
    flex: 1,
    padding: 28,
    paddingTop: 64,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 40,
  },
  brand: {
    fontFamily: FONT_SERIF,
    fontSize: 30,
    color: THEME.text,
    lineHeight: 34,
  },
  tagline: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: THEME.dim,
  },
  title: {
    fontFamily: FONT_SERIF,
    fontSize: 28,
    color: THEME.text,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: THEME.dim,
    lineHeight: 18,
    marginBottom: 32,
  },
  providerGroup: {
    gap: 10,
  },
  providerBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.rule,
    backgroundColor: THEME.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  providerBtnIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBtnLabel: {
    fontFamily: FONT_MONO,
    fontSize: 13,
    color: THEME.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.rule,
  },
  dividerLabel: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: THEME.dim,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 48,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.rule,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: THEME.dim,
  },
  footerLink: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: THEME.text,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: '#c0392b',
    lineHeight: 16,
  },
  // Email step
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    paddingTop: 56,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailHeaderLabel: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: THEME.dim,
  },
  emailBody: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  fieldGroup: {
    gap: 20,
    marginTop: 24,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: THEME.dim,
  },
  fieldInput: {
    fontFamily: FONT_MONO,
    fontSize: 15,
    color: THEME.text,
    borderBottomWidth: 1,
    borderBottomColor: THEME.rule,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  emailFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: THEME.rule,
    gap: 12,
  },
  primaryBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: THEME.text,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  primaryBtnText: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: THEME.bg,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
