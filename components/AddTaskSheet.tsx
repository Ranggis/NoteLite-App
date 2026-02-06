import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Dimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
  Keyboard, Image, ActivityIndicator, Modal
} from 'react-native';
import Animated, { 
  useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing, FadeIn, FadeOut
} from 'react-native-reanimated';
import { X, Image as ImageIcon, Trash2, Check, Zap, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Task } from '../services/database';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTaskSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (title: string, desc: string, priority: number, imageUrl?: string) => void;
  taskToEdit?: Task | null;
}

export default function AddTaskSheet({ isVisible, onClose, onSave, taskToEdit }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isVisible) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDesc(taskToEdit.description || "");
        setPriority(taskToEdit.priority);
        setImage(taskToEdit.image_url || null);
      } else {
        setTitle("");
        setDesc("");
        setPriority(1);
        setImage(null);
      }
      translateY.value = withTiming(0, {
        duration: 450,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [isVisible, taskToEdit]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, 0], [0, 1]),
  }));

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    if (uri.startsWith('http')) return uri;
    const data = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;
    data.append('file', { uri, name: filename, type } as any);
    data.append('upload_preset', 'notelite'); 
    data.append('cloud_name', 'dccobi5fz'); 

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dccobi5fz/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (e) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsUploading(true);
    let uploadedUrl = image || "";
    if (image && !image.startsWith('http')) {
      const res = await uploadToCloudinary(image);
      if (res) uploadedUrl = res;
    }
    onSave(title, desc, priority, uploadedUrl);
    setIsUploading(false);
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.modalWrapper}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, animatedStyle]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.dragHandle} />
            
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{taskToEdit ? "Edit Task" : "New Task"}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="#1A1A1A" strokeWidth={3} />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.inputTitle}
              placeholder="Apa yang ingin kamu kerjakan?"
              placeholderTextColor="#C7C7CC"
              value={title}
              onChangeText={setTitle}
              autoFocus={!taskToEdit}
            />

            <TextInput 
              style={styles.inputDesc}
              placeholder="Tambahkan catatan (opsional)..."
              placeholderTextColor="#C7C7CC"
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            {/* PRIORITY SELECTOR */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap size={14} color="#8E8E93" fill="#8E8E93" />
                <Text style={styles.sectionLabel}>PRIORITY</Text>
              </View>
              <View style={styles.priorityRow}>
                {[1, 2, 3].map((p) => {
                  const isActive = priority === p;
                  const color = p === 3 ? '#FF3B30' : p === 2 ? '#FF9500' : Colors.primary;
                  return (
                    <TouchableOpacity 
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityPill, 
                        isActive && { backgroundColor: color + '15', borderColor: color }
                      ]}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: isActive ? color : '#C7C7CC' }]} />
                      <Text style={[styles.priorityText, isActive && { color: color }]}>
                        {p === 1 ? 'Low' : p === 2 ? 'Medium' : 'Urgent'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* IMAGE ATTACHMENT */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ImageIcon size={14} color="#8E8E93" />
                <Text style={styles.sectionLabel}>ATTACHMENT</Text>
              </View>
              {image ? (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity style={styles.addAttachment} onPress={pickImage}>
                  <Plus size={20} color={Colors.primary} />
                  <Text style={styles.addAttachmentText}>Add image reference</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ACTION BUTTON */}
            <TouchableOpacity 
              style={[styles.saveButton, (!title.trim() || isUploading) && styles.disabledButton]} 
              onPress={handleSave}
              disabled={isUploading || !title.trim()}
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.buttonInner}>
                  <Check size={20} color="white" strokeWidth={3} />
                  <Text style={styles.saveButtonText}>
                    {taskToEdit ? "Update Task" : "Create Task"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 }, android: { elevation: 20 } }),
  },
  dragHandle: { width: 36, height: 4, backgroundColor: '#E5E5EA', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  
  inputTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.5 },
  inputDesc: { fontSize: 16, color: '#8E8E93', marginBottom: 28, fontWeight: '500' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 1 },

  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityPill: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, 
    borderRadius: 20, borderWidth: 1.5, borderColor: '#F2F2F7', backgroundColor: '#F9F9FB' 
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  priorityText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },

  addAttachment: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#E5E5EA', gap: 10 
  },
  addAttachmentText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  
  imageWrapper: { width: '100%', height: 160, borderRadius: 20, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 12 },

  saveButton: { 
    backgroundColor: '#1A1A1A', paddingVertical: 16, borderRadius: 20, 
    alignItems: 'center', marginTop: 10,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } } })
  },
  disabledButton: { opacity: 0.3 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});