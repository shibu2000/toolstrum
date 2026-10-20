import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, StudioId } from '../design-system/tokens';
import { AppIcon } from '../design-system/icons';
import { HomeScreen } from '../features/home/HomeScreen';
import { CatalogScreen } from '../features/catalog/CatalogScreen';
import { HistoryScreen } from '../features/history/HistoryScreen';
import { MyFilesScreen } from '../features/files/MyFilesScreen';
import { StudioDetailScreen } from '../features/studios/StudioDetailScreen';
import { UniversalWorkspaceScreen } from '../features/tools/UniversalWorkspaceScreen';
import { useAppStore } from '../store/useAppStore';

export type RootStackParamList = {
  Tabs: undefined;
  StudioDetail: { studioId: StudioId };
  ToolWorkspace: { toolId: number };
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Catalog: undefined;
  History: undefined;
  MyFiles: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { setSelectedStudioFilter } = useAppStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 56 + Math.max(insets.bottom, 8),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarActiveTintColor: Colors.primaryContainer,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="Home" size={size || 22} color={color} />
          ),
        }}
      >
        {({ navigation: tabNav }: any) => (
          <HomeScreen
            onNavigateToCatalog={(studioId) => {
              if (studioId) setSelectedStudioFilter(studioId);
              tabNav.navigate('Catalog');
            }}
            onNavigateToTool={(toolId) => navigation.navigate('ToolWorkspace', { toolId })}
            onNavigateToTab={(tab) => {
              if (tab === 'catalog') tabNav.navigate('Catalog');
              if (tab === 'history') tabNav.navigate('History');
              if (tab === 'files') tabNav.navigate('MyFiles');
            }}
            onOpenSettings={() => navigation.navigate('Settings')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Catalog"
        options={{
          tabBarLabel: 'All Tools',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="grid_view" size={size || 22} color={color} />
          ),
        }}
      >
        {({ navigation: tabNav }: any) => (
          <CatalogScreen
            onNavigateToTool={(toolId) => navigation.navigate('ToolWorkspace', { toolId })}
            onOpenSettings={() => navigation.navigate('Settings')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="History"
        options={{
          tabBarLabel: 'Recent',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="schedule" size={size || 22} color={color} />
          ),
        }}
      >
        {({ navigation: tabNav }: any) => (
          <HistoryScreen
            onNavigateToTool={(toolId) => navigation.navigate('ToolWorkspace', { toolId })}
            onNavigateToCatalog={() => tabNav.navigate('Catalog')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MyFiles"
        options={{
          tabBarLabel: 'My Files',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="folder" size={size || 22} color={color} />
          ),
        }}
      >
        {({ navigation: tabNav }: any) => (
          <MyFilesScreen onNavigateToCatalog={() => tabNav.navigate('Catalog')} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Settings Screen (Screen 9 from Stitch design spec)
function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { managedFiles, clearAllManagedFiles } = useAppStore();

  const totalBytes = managedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCleanStorage = () => {
    if (managedFiles.length === 0) {
      Alert.alert('Storage Clean', 'Sandbox storage is already completely empty (0 B).');
      return;
    }
    Alert.alert(
      'Clean Sandbox Storage',
      `Clear ${managedFiles.length} temporary output file${managedFiles.length === 1 ? '' : 's'} (${formatSize(totalBytes)})?\n\nOriginal files on your device remain untouched.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Storage',
          style: 'destructive',
          onPress: () => {
            clearAllManagedFiles();
            Alert.alert('Storage Cleaned', 'Temporary files removed successfully.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.settingsContainer, { paddingTop: insets.top + 16 }]}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="arrow_back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Settings & Storage</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Core Controls */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <AppIcon name="ShieldCheck" size={20} color={Colors.statusSuccess} />
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Privacy & Sandboxing</Text>
              <Text style={styles.settingDesc}>
                100% on-device processing. No background tracking, analytics, or document telemetry.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={handleCleanStorage}
          >
            <View style={[styles.settingIconBox, { backgroundColor: '#FEE2E2' }]}>
              <AppIcon name="trash" size={20} color={Colors.statusError} />
            </View>
            <View style={styles.settingDetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.settingName}>Clean Sandbox Storage</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.statusError }}>
                  {formatSize(totalBytes)}
                </Text>
              </View>
              <Text style={styles.settingDesc}>
                {managedFiles.length} file{managedFiles.length === 1 ? '' : 's'} cached. Tap to safely purge temporary outputs.
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <AppIcon name="Sparkles" size={20} color={Colors.accentViolet} />
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Modular Roadmap (v2.0 / v3.0)</Text>
              <Text style={styles.settingDesc}>
                Heavy video/audio transcoding and neural ML modules queued for modular add-ons.
              </Text>
            </View>
          </View>
        </View>

        {/* App Release Specs Card */}
        <View style={[styles.settingsCard, { marginTop: 16 }]}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.onSurface, marginBottom: 12 }}>
            App Information
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>Version</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.onSurface }}>1.0.0 (Production Release)</Text>
          </View>

          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>Tools Available</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.statusSuccess }}>401 Active Offline Tools</Text>
          </View>

          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>Canonical Catalog</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.onSurface }}>500 Utilities Across 16 Studios</Text>
          </View>

          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>Telemetry & Tracking</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.statusSuccess }}>Zero (100% Offline)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const linking: any = {
  prefixes: ['toolstrum://', 'com.toolstrum.app://'],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: 'home',
          Catalog: 'catalog',
          History: 'history',
          MyFiles: 'files',
        },
      },
      StudioDetail: 'studio/:studioId',
      ToolWorkspace: {
        path: 'tool/:toolId',
        parse: {
          toolId: (id: string) => Number(id),
        },
      },
      Settings: 'settings',
    },
  },
};

export const RootNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="StudioDetail">
            {({ route, navigation }: any) => (
              <StudioDetailScreen
                studioId={route.params.studioId}
                onNavigateToTool={(toolId) =>
                  navigation.navigate('ToolWorkspace', { toolId })
                }
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ToolWorkspace" initialParams={{ toolId: 446 }}>
            {({ route, navigation }: any) => (
              <UniversalWorkspaceScreen
                toolId={route.params.toolId}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  settingsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  settingDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 10,
  },
});
