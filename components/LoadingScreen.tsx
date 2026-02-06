// components/LoadingScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LoadingScreen() {
  const fullText = "NOTE LITE";
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  
  // Animasi Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Animasi munculnya container utama
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 2. Efek Mengetik (Typing Effect)
    let currentText = "";
    let index = 0;
    
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setDisplayText(currentText);
        index++;
      } else {
        clearInterval(typingInterval);
        // Setelah selesai mengetik, munculkan garis bawah
        showUnderline();
        // Berhenti mengedipkan kursor setelah beberapa saat
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 150); // Kecepatan mengetik (ms)

    // 3. Animasi Kursor Berkedip
    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    cursorAnimation.start();

    return () => {
      clearInterval(typingInterval);
      cursorAnimation.stop();
    };
  }, []);

  const showUnderline = () => {
    Animated.spring(lineScale, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.textRow}>
          <Text style={styles.title}>{displayText}</Text>
          
          {/* Kursor yang mengikuti tulisan */}
          {showCursor && (
            <Animated.View 
              style={[styles.cursor, { opacity: cursorOpacity }]} 
            />
          )}
        </View>

        {/* Garis bawah yang melebar setelah mengetik selesai */}
        <Animated.View 
          style={[
            styles.underline, 
            { transform: [{ scaleX: lineScale }] }
          ]} 
        />
        
        <Text style={styles.subtitle}>
          Simplify your thoughts.
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
          <Text style={styles.systemText}>SYSTEM SECURE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // Menjaga posisi agar tidak goyang saat mengetik
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '200',
    letterSpacing: 10,
    // Note: paddingLeft kecil untuk mengimbangi letterSpacing agar center
    paddingLeft: 10,
  },
  cursor: {
    width: 2,
    height: 30,
    backgroundColor: Colors.primary,
    marginLeft: 4,
  },
  underline: {
    height: 1,
    width: 100,
    backgroundColor: Colors.primary,
    marginTop: 5,
    borderRadius: 2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 25,
    letterSpacing: 5,
    fontWeight: '300',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759', // Hijau indikator ready
    marginRight: 8,
  },
  systemText: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  }
});