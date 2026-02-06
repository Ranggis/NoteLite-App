import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Modal, TouchableOpacity, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn, Easing } from 'react-native-reanimated';
import { Task } from '../services/database';
import { Colors } from '../constants/Colors';
import { CheckCircle2, Clock, BarChart3, Target, Zap, X, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Fungsi Easing untuk animasi "Apple-Style" yang halus tanpa bounce
const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

interface StatisticsViewProps {
  isVisible: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function StatisticsView({ isVisible, onClose, tasks }: StatisticsViewProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_completed === 1).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const high = tasks.filter(t => t.priority === 3).length;
    const med = tasks.filter(t => t.priority === 2).length;
    const low = tasks.filter(t => t.priority === 1).length;

    return { total, completed, pending, progress, high, med, low };
  }, [tasks]);

  return (
    <Modal visible={isVisible} animationType="none" transparent statusBarTranslucent>
      <View style={styles.modalOverlay}>
        {/* BACKDROP */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.backdropLayer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* SHEET CONTENT */}
        <Animated.View 
          entering={FadeInDown.duration(400).easing(SMOOTH_EASING)} 
          style={styles.sheet}
        >
          <View style={styles.dragHandle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Analytics</Text>
              <Text style={styles.subtitle}>Your productivity overview</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#1A1A1A" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* HERO CARD */}
            <Animated.View entering={FadeInDown.delay(100).duration(400).easing(SMOOTH_EASING)} style={styles.heroCard}>
              <View style={styles.heroInfo}>
                <View style={styles.trendingBadge}>
                  <TrendingUp size={14} color={Colors.primary} strokeWidth={3} />
                  <Text style={styles.trendingText}>On Track</Text>
                </View>
                <Text style={styles.heroLabel}>Completion Score</Text>
                <Text style={styles.heroValue}>{stats.progress}<Text style={styles.heroUnit}>%</Text></Text>
              </View>
              <View style={styles.heroVisual}>
                 <Target color="white" size={32} strokeWidth={2.5} />
              </View>
            </Animated.View>

            {/* QUICK STATS GRID */}
            <View style={styles.grid}>
              <StatTile 
                label="Total" 
                value={stats.total} 
                icon={<BarChart3 size={18} color={Colors.primary} />} 
                delay={200} 
              />
              <StatTile 
                label="Done" 
                value={stats.completed} 
                icon={<CheckCircle2 size={18} color="#34C759" />} 
                delay={300} 
              />
              <StatTile 
                label="Pending" 
                value={stats.pending} 
                icon={<Clock size={18} color="#FF9500" />} 
                delay={400} 
              />
            </View>

            {/* PRIORITY DISTRIBUTION */}
            <Animated.View entering={FadeInDown.delay(500).duration(400).easing(SMOOTH_EASING)} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Zap size={18} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.sectionTitle}>Task Priority</Text>
              </View>

              <View style={styles.priorityBox}>
                <PriorityBar label="Urgent" count={stats.high} total={stats.total} color="#FF3B30" />
                <PriorityBar label="Normal" count={stats.med} total={stats.total} color="#FF9500" />
                <PriorityBar label="Optional" count={stats.low} total={stats.total} color="#8E8E93" />
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function StatTile({ label, value, icon, delay }: any) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(400).easing(SMOOTH_EASING)} 
      style={styles.tile}
    >
      <View style={styles.tileIconContainer}>{icon}</View>
      <View>
        <Text style={styles.tileValue}>{value}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function PriorityBar({ label, count, total, color }: any) {
  const widthPercent = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.pBarContainer}>
      <View style={styles.pBarHeader}>
        <View style={styles.pBarLabelGroup}>
          <View style={[styles.pBarDot, { backgroundColor: color }]} />
          <Text style={styles.pBarLabel}>{label}</Text>
        </View>
        <Text style={styles.pBarCount}>{count} tasks</Text>
      </View>
      <View style={styles.pBarBackground}>
        <Animated.View 
          entering={FadeInRight.delay(600).duration(1000).easing(SMOOTH_EASING)}
          style={[styles.pBarFill, { width: `${widthPercent}%`, backgroundColor: color }]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdropLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    height: '82%',
    width: '100%',
    paddingTop: 12,
    ...Platform.select({ 
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 }, 
      android: { elevation: 20 } 
    })
  },

  dragHandle: {
    width: 40, height: 5, backgroundColor: '#E5E5EA',
    borderRadius: 3, alignSelf: 'center', marginBottom: 20
  },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 28, marginBottom: 25
  },

  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8E8E93', fontWeight: '500', marginTop: 2 },
  
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center'
  },

  scrollContent: { paddingHorizontal: 24 },

  heroCard: {
    backgroundColor: '#1A1A1A', 
    borderRadius: 28, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  heroInfo: { flex: 1 },
  trendingBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, marginBottom: 12
  },
  trendingText: { color: 'white', fontSize: 11, fontWeight: '700', marginLeft: 5 },
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  heroValue: { color: 'white', fontSize: 50, fontWeight: '800', letterSpacing: -1.5 },
  heroUnit: { fontSize: 22, color: 'rgba(255,255,255,0.4)' },
  heroVisual: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center'
  },

  grid: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  tile: {
    flex: 1, backgroundColor: '#F9F9FB', borderRadius: 22,
    padding: 16, borderWidth: 1, borderColor: '#F2F2F7'
  },
  tileIconContainer: { marginBottom: 10 },
  tileValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  tileLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginTop: 1 },

  sectionContainer: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  
  priorityBox: {
    backgroundColor: 'white', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F2F2F7',
  },

  pBarContainer: { marginBottom: 18 },
  pBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pBarLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  pBarDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  pBarLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  pBarCount: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  pBarBackground: { height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' },
  pBarFill: { height: '100%', borderRadius: 3 },
});