import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate, 
  FadeInDown,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { database, Task } from '../../services/database';
import { Plus, CheckCircle2, Trash2, ListPlus, PieChart, ChevronRight, ClipboardList, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import AddTaskSheet from '../../components/AddTaskSheet';
import StatisticsView from '../../components/StatisticsView';

const SPRING_CONFIG = { damping: 18, stiffness: 120 };

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const menuExpansion = useSharedValue(0);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  // Data Stats (Memoized)
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_completed === 1).length;
    return { 
      total, 
      completed, 
      remaining: total - completed, 
      progress: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  }, [tasks]);

  // Fetch data dari database
  const fetchTasks = useCallback(async () => {
    try {
      const data = await database.getTasks();
      // Urutkan: belum selesai di atas, lalu berdasarkan prioritas tertinggi
      const sortedData = [...data].sort((a, b) => 
        (a.is_completed - b.is_completed) || (b.priority - a.priority)
      );
      setTasks(sortedData);
    } catch (e) {
      console.error("Gagal ambil data:", e);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Handle Save (Add & Edit) - INI FIXNYA
  const handleSaveTask = async (title: string, desc: string, priority: number, imageUrl?: string) => {
    try {
      if (taskToEdit && taskToEdit.id) {
        // Mode Update
        await database.updateTask(taskToEdit.id, { 
          title, 
          description: desc, 
          priority, 
          image_url: imageUrl 
        });
      } else {
        // Mode Tambah
        await database.addTask({ 
          title, 
          description: desc, 
          priority, 
          is_completed: 0, 
          image_url: imageUrl 
        });
      }
      // WAJIB panggil fetchTasks setelah operasi DB selesai
      await fetchTasks();
    } catch (e) {
      console.error("Gagal simpan ke DB:", e);
    }
  };

  const toggleMenu = () => {
    const target = isMenuOpen ? 0 : 1;
    menuExpansion.value = withSpring(target, SPRING_CONFIG);
    setIsMenuOpen(!isMenuOpen);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setIsSheetVisible(true);
    if (isMenuOpen) toggleMenu();
  };

  const handleToggleDone = async (item: Task) => {
    if (!item.id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await database.toggleTaskStatus(item.id, item.is_completed);
    swipeableRefs.current.get(item.id)?.close();
    await fetchTasks();
  };

  const handleDelete = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await database.deleteTask(id);
    swipeableRefs.current.delete(id);
    await fetchTasks();
  };

  // ANIMASI BACKDROP & FAB
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuExpansion.value, [0, 1], [0, 1]),
    zIndex: isMenuOpen ? 900 : -1,
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isMenuOpen ? 0 : 1) }],
    opacity: withTiming(isMenuOpen ? 0 : 1),
  }));

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Swipeable
        ref={(ref) => { if (ref && item.id) swipeableRefs.current.set(item.id, ref); }}
        renderRightActions={() => (
          <TouchableOpacity style={styles.swipeDelete} onPress={() => item.id && handleDelete(item.id)}>
            <View style={styles.deleteBox}><Trash2 color="#FF3B30" size={24} /></View>
          </TouchableOpacity>
        )}
      >
        <TouchableOpacity 
          style={styles.taskCard} 
          activeOpacity={0.8}
          onPress={() => { setTaskToEdit(item); setIsSheetVisible(true); }}
        >
          <TouchableOpacity 
            onPress={() => handleToggleDone(item)}
            style={[styles.checkBtn, item.is_completed === 1 && styles.checkBtnDone]}
          >
            {item.is_completed === 1 && <CheckCircle2 size={18} color="white" strokeWidth={3} />}
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, item.is_completed === 1 && styles.titleDone]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.pPill, { backgroundColor: item.priority === 3 ? '#FFE5E5' : item.priority === 2 ? '#FFF3E0' : '#F2F2F7' }]}>
                <View style={[styles.pDot, { backgroundColor: item.priority === 3 ? '#FF3B30' : item.priority === 2 ? '#FF9500' : '#8E8E93' }]} />
              </View>
            </View>
            <Text style={styles.taskDesc} numberOfLines={1}>{item.description || "No description"}</Text>
          </View>
          <ChevronRight size={16} color="#C7C7CC" />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        
        {/* HEADER */}
        <View style={styles.headerArea}>
          <View>
            <Text style={styles.dateLabel}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
            <Text style={styles.greetLabel}>My Tasks</Text>
          </View>
          <TouchableOpacity onPress={() => setIsStatsVisible(true)} style={styles.circleBtn}>
            <PieChart size={22} color={Colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* BENTO STATS */}
        <View style={styles.statsRow}>
          <View style={[styles.sCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.sValueWhite}>{stats.progress}%</Text>
            <Text style={styles.sLabelWhite}>Progress</Text>
          </View>
          <View style={styles.sCard}>
            <Text style={styles.sValue}>{stats.remaining}</Text>
            <Text style={styles.sLabel}>Pending</Text>
          </View>
          <View style={styles.sCard}>
            <Text style={styles.sValue}>{stats.total}</Text>
            <Text style={styles.sLabel}>Total</Text>
          </View>
        </View>

        <FlatList 
          data={tasks} 
          renderItem={renderTask} 
          keyExtractor={t => t.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <ClipboardList size={60} color="#F2F2F7" />
              <Text style={styles.emptyTitle}>Empty Task</Text>
            </View>
          }
        />

        {/* OVERLAYS */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
        </Animated.View>

        <View style={styles.fabArea} pointerEvents="box-none">
          {isMenuOpen ? (
            <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(150)} style={styles.expandedMenu}>
              <TouchableOpacity style={styles.menuBtn} onPress={handleOpenAdd}>
                <ListPlus size={20} color="white" />
                <Text style={styles.menuLabel}>Add New</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#333' }]} onPress={() => { toggleMenu(); setIsStatsVisible(true); }}>
                <PieChart size={20} color="white" /><Text style={styles.menuLabel}>Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeFab} onPress={toggleMenu}><X color="white" size={24} strokeWidth={3} /></TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.mainFab, fabAnimatedStyle]}>
              <TouchableOpacity style={styles.fabTouch} onPress={toggleMenu}>
                <Plus color="white" size={32} strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <AddTaskSheet 
          isVisible={isSheetVisible} 
          taskToEdit={taskToEdit} 
          onClose={() => setIsSheetVisible(false)} 
          onSave={handleSaveTask} 
        />
        <StatisticsView isVisible={isStatsVisible} tasks={tasks} onClose={() => setIsStatsVisible(false)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerArea: { paddingHorizontal: 24, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase' },
  greetLabel: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', letterSpacing: -1 },
  circleBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  sCard: { flex: 1, height: 80, backgroundColor: '#F9F9FB', borderRadius: 18, marginHorizontal: 4, padding: 15, justifyContent: 'center', borderWidth: 1, borderColor: '#F2F2F7' },
  sValueWhite: { fontSize: 22, fontWeight: '800', color: 'white' },
  sLabelWhite: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  sValue: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  sLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },

  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7' },
  checkBtn: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: Colors.primary, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  checkBtnDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  taskContent: { flex: 1 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  taskDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  titleDone: { textDecorationLine: 'line-through', color: '#C7C7CC' },
  pPill: { padding: 6, borderRadius: 10 },
  pDot: { width: 6, height: 6, borderRadius: 3 },
  
  swipeDelete: { justifyContent: 'center', alignItems: 'center', width: 70 },
  deleteBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFE5E5', justifyContent: 'center', alignItems: 'center' },
  emptyView: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#E5E5E5', marginTop: 10 },
  
  backdrop: { backgroundColor: 'rgba(255,255,255,0.8)' },
  fabArea: { position: 'absolute', bottom: 35, left: 0, right: 0, alignItems: 'center', zIndex: 1001 },
  mainFab: { 
    width: 64,
    height: 64,
    borderRadius: 32,  // ← ini yang benar untuk lingkaran
    backgroundColor: Colors.primary,
    justifyContent: 'center',   // ← tambahkan
    alignItems: 'center',       // ← tambahkan
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10
  },
  fabTouch: { flex: 1, justifyContent: 'center', alignItems: "center" },
  expandedMenu: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 8, flexDirection: 'row', alignItems: 'center' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, marginHorizontal: 4 },
  menuLabel: { color: 'white', fontWeight: '700', marginLeft: 8 },
  closeFab: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
});