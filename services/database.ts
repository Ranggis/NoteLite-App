import * as SQLite from 'expo-sqlite';

// Buka database (Gunakan openDatabaseSync untuk versi terbaru expo-sqlite)
const db = SQLite.openDatabaseSync('notelite.db');

export interface Task {
  id?: number;
  title: string;
  description?: string;
  category_id?: number;
  due_date?: string;
  priority: number; // 1: Low, 2: Medium, 3: High
  is_completed: number; // 0 atau 1
  completed_at?: string | null;
  image_url?: string | null;
}

export interface SubTask {
  id?: number;
  task_id: number;
  title: string;
  is_completed: number;
}

export const database = {
  // 1. Inisialisasi Tabel
  async initDatabase() {
    try {
      // UNCOMMENT baris di bawah ini, jalankan aplikasi SEKALI, lalu COMMENT lagi.
      // await db.execAsync(`DROP TABLE IF EXISTS tasks;`); 

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          due_date TEXT,
          priority INTEGER DEFAULT 1,
          is_completed INTEGER DEFAULT 0,
          completed_at TEXT,   -- Kolom yang tadi hilang
          image_url TEXT        -- Kolom gambar
        );
      `);
      console.log("Database & Tables Checked Successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  },
  // 2. Tambah Tugas (Memperbaiki error 'undefined')
  async addTask(task: Task) {
    const result = await db.runAsync(
      'INSERT INTO tasks (title, description, category_id, due_date, priority, is_completed, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        task.title, 
        task.description ?? '',      // Pastikan string jika undefined
        task.category_id ?? null,    // Pastikan null jika undefined
        task.due_date ?? '',         // Pastikan string jika undefined
        task.priority ?? 1,          // Pastikan number jika undefined
        0,                           // Default is_completed = 0
        task.image_url ?? null       // Pastikan null jika undefined
      ]
    );
    return result.lastInsertRowId;
  },

  // 3. Ambil Semua Tugas
  async getTasks() {
    return await db.getAllAsync<Task>(
      'SELECT * FROM tasks ORDER BY is_completed ASC, priority DESC, id DESC'
    );
  },

  // 4. Update Status Selesai
  async toggleTaskStatus(id: number, currentStatus: number) {
    const newStatus = currentStatus === 0 ? 1 : 0;
    
    // Set jam selesai jika status berubah jadi SELESAI
    const completedAt = newStatus === 1 
      ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
      : null;

    await db.runAsync(
      'UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?', 
      [newStatus, completedAt, id]
    );
  },

  // 5. Update Task (Memperbaiki error 'undefined' menggunakan ?? atau ||)
  async updateTask(id: number, task: Partial<Task>) {
    await db.runAsync(
      'UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?',
      [
        task.title ?? '',            // Error Fix: Jika undefined gunakan string kosong
        task.description ?? '',      // Error Fix: Jika undefined gunakan string kosong
        task.priority ?? 1,          // Error Fix: Jika undefined gunakan 1
        id                           // ID sudah pasti number
      ]
    );
  },

  // 6. Hapus Tugas
  async deleteTask(id: number) {
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  }
};