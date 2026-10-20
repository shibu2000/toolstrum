import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Line,
  G,
} from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  showBadge?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  showBadge = true,
}) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Defs>
          {/* Background Squircle Gradient */}
          <LinearGradient id="m-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#1E1B4B" />
            <Stop offset="0.6" stopColor="#0F172A" />
            <Stop offset="1" stopColor="#020617" />
          </LinearGradient>

          {/* Edge Glow */}
          <LinearGradient id="m-edge" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#818CF8" stopOpacity="0.8" />
            <Stop offset="0.5" stopColor="#C084FC" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#38BDF8" stopOpacity="0.7" />
          </LinearGradient>

          {/* Top Wing Left */}
          <LinearGradient id="m-t-left" x1="12" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#6366F1" />
            <Stop offset="1" stopColor="#4F46E5" />
          </LinearGradient>

          {/* Top Wing Right */}
          <LinearGradient id="m-t-right" x1="32" y1="16" x2="52" y2="28" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#A855F7" />
            <Stop offset="1" stopColor="#7C3AED" />
          </LinearGradient>

          {/* Stem */}
          <LinearGradient id="m-t-stem" x1="32" y1="20" x2="32" y2="52" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#EC4899" />
            <Stop offset="0.35" stopColor="#8B5CF6" />
            <Stop offset="0.75" stopColor="#06B6D4" />
            <Stop offset="1" stopColor="#10B981" />
          </LinearGradient>

          {/* Core Beam */}
          <LinearGradient id="m-beam" x1="32" y1="16" x2="32" y2="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.6" stopColor="#67E8F9" />
            <Stop offset="1" stopColor="#34D399" />
          </LinearGradient>
        </Defs>

        {showBadge && (
          <>
            <Rect
              x="2"
              y="2"
              width="60"
              height="60"
              rx="16"
              fill="url(#m-bg)"
              stroke="url(#m-edge)"
              strokeWidth="1.5"
            />
            <Circle cx="32" cy="14" r="14" fill="#818CF8" opacity={0.25} />
            <Circle cx="32" cy="42" r="12" fill="#06B6D4" opacity="0.2" />
          </>
        )}

        <G>
          {/* Left Wing */}
          <Path
            d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z"
            fill="url(#m-t-left)"
          />

          {/* Right Wing */}
          <Path
            d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z"
            fill="url(#m-t-right)"
          />

          {/* Center Bevel */}
          <Path
            d="M26 14H38L35 24H29L26 14Z"
            fill="#E9D5FF"
            opacity={0.9}
          />

          {/* Vertical Stem */}
          <Path
            d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z"
            fill="url(#m-t-stem)"
          />

          {/* Laser Chords */}
          <Line
            x1="32"
            y1="16"
            x2="32"
            y2="46"
            stroke="url(#m-beam)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Resonance Nodes */}
          <Circle cx="32" cy="20" r="1.8" fill="#FFFFFF" />
          <Circle cx="32" cy="30" r="1.4" fill="#FFFFFF" opacity={0.9} />
          <Circle cx="32" cy="40" r="1.2" fill="#E0F2FE" opacity={0.8} />
        </G>
      </Svg>
    </View>
  );
};
