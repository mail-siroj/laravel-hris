export interface ErdTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    key?: 'PK' | 'FK' | 'UK';
    nullable?: boolean;
    description: string;
  }[];
}

export const ERD_TABLES: ErdTable[] = [
  {
    name: 'users',
    description: 'Akun otentikasi login sistem & Filament admin',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key auto-increment' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Nama akun pengguna' },
      { name: 'email', type: 'VARCHAR(255)', key: 'UK', description: 'Email unik login' },
      { name: 'password', type: 'VARCHAR(255)', description: 'Bcrypt hashed password' },
      { name: 'remember_token', type: 'VARCHAR(100)', nullable: true, description: 'Token sesi persistensi' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'Waktu pembuatan akun' },
    ],
  },
  {
    name: 'departments',
    description: 'Struktur departemen / divisi organisasi',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'code', type: 'VARCHAR(20)', key: 'UK', description: 'Kode unik (ITE, HRD, FIN, dll)' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Nama departemen resmi' },
      { name: 'description', type: 'TEXT', nullable: true, description: 'Deskripsi tugas divisi' },
      { name: 'manager_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> employees.id (Kepala Divisi)' },
      { name: 'budget', type: 'DECIMAL(15,2)', nullable: true, description: 'Alokasi budget tahunan' },
    ],
  },
  {
    name: 'positions',
    description: 'Jabatan dan jenjang karir dalam divisi',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'department_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> departments.id' },
      { name: 'code', type: 'VARCHAR(30)', key: 'UK', description: 'Kode jabatan (SE-ARCH, dll)' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Nama jabatan resmi' },
      { name: 'level', type: 'ENUM', description: 'Staff, Senior, Lead, Manager, Director' },
      { name: 'base_salary_min', type: 'DECIMAL(15,2)', description: 'Standar minimum gaji' },
      { name: 'base_salary_max', type: 'DECIMAL(15,2)', description: 'Standar maksimum gaji' },
    ],
  },
  {
    name: 'employees',
    description: 'Master data profil karyawan & status kepegawaian',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'VARCHAR(30)', key: 'UK', description: 'Nomor induk karyawan (EMP-2026-XXX)' },
      { name: 'nik', type: 'CHAR(16)', key: 'UK', description: 'Nomor Induk Kependudukan (KTP)' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Nama lengkap' },
      { name: 'birth_place', type: 'VARCHAR(100)', description: 'Kota kelahiran' },
      { name: 'birth_date', type: 'DATE', description: 'Tanggal lahir' },
      { name: 'gender', type: 'ENUM', description: 'Laki-laki / Perempuan' },
      { name: 'marital_status', type: 'ENUM', description: 'Status pernikahan untuk pajak PPh21' },
      { name: 'email', type: 'VARCHAR(255)', key: 'UK', description: 'Email korporat' },
      { name: 'phone', type: 'VARCHAR(25)', description: 'Nomor telepon / WhatsApp' },
      { name: 'department_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> departments.id' },
      { name: 'position_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> positions.id' },
      { name: 'manager_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> employees.id (Atasan langsung)' },
      { name: 'user_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> users.id' },
      { name: 'join_date', type: 'DATE', description: 'Tanggal mulai bekerja' },
      { name: 'status', type: 'ENUM', description: 'Tetap, Kontrak, Probation, Magang' },
      { name: 'base_salary', type: 'DECIMAL(15,2)', description: 'Gaji pokok bulanan' },
      { name: 'annual_leave_quota', type: 'TINYINT', description: 'Jatah hak cuti tahunan (12)' },
      { name: 'annual_leave_used', type: 'TINYINT', description: 'Jumlah cuti tahunan yang telah diambil' },
    ],
  },
  {
    name: 'attendances',
    description: 'Catatan presensi harian dengan koordinat GPS dan foto selfie',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'date', type: 'DATE', description: 'Tanggal presensi' },
      { name: 'clock_in', type: 'TIME', nullable: true, description: 'Jam kedatangan' },
      { name: 'clock_out', type: 'TIME', nullable: true, description: 'Jam kepulangan' },
      { name: 'status', type: 'ENUM', description: 'Hadir, Terlambat, Izin, Sakit, Alpha' },
      { name: 'latitude', type: 'DECIMAL(10,7)', nullable: true, description: 'Koordinat lintang pengguna' },
      { name: 'longitude', type: 'DECIMAL(10,7)', nullable: true, description: 'Koordinat bujur pengguna' },
      { name: 'distance_meters', type: 'DECIMAL(8,2)', nullable: true, description: 'Jarak ke kantor dalam meter' },
      { name: 'office_verified', type: 'BOOLEAN', description: 'True jika radius <= toleransi kantor' },
      { name: 'selfie_path', type: 'VARCHAR(255)', nullable: true, description: 'Path snapshot foto wajah' },
    ],
  },
  {
    name: 'leave_requests',
    description: 'Pengajuan cuti dan workflow 2-tier approval (Manager -> HR)',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'leave_type', type: 'ENUM', description: 'Cuti Tahunan, Sakit, Melahirkan, Khusus' },
      { name: 'start_date', type: 'DATE', description: 'Tanggal mulai' },
      { name: 'end_date', type: 'DATE', description: 'Tanggal selesai' },
      { name: 'total_days', type: 'TINYINT', description: 'Durasi hari kerja' },
      { name: 'reason', type: 'TEXT', description: 'Alasan pengajuan cuti' },
      { name: 'attachment_path', type: 'VARCHAR(255)', nullable: true, description: 'Lampiran surat dokter / bukti' },
      { name: 'status', type: 'ENUM', description: 'pending, manager_approved, approved, rejected' },
      { name: 'manager_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> employees.id' },
      { name: 'hr_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> employees.id' },
    ],
  },
  {
    name: 'overtimes',
    description: 'Pengajuan lembur dan kompensasi upah lembur per jam',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'date', type: 'DATE', description: 'Tanggal lembur' },
      { name: 'start_time', type: 'TIME', description: 'Jam mulai lembur' },
      { name: 'end_time', type: 'TIME', description: 'Jam selesai lembur' },
      { name: 'total_hours', type: 'DECIMAL(4,2)', description: 'Durasi lembur' },
      { name: 'reason', type: 'TEXT', description: 'Deskripsi pekerjaan lembur' },
      { name: 'status', type: 'ENUM', description: 'pending, manager_approved, approved, rejected' },
    ],
  },
  {
    name: 'payrolls',
    description: 'Buku besar penggajian bulanan, BPJS, PPh 21, dan slip gaji',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'month', type: 'TINYINT', description: 'Bulan (1-12)' },
      { name: 'year', type: 'SMALLINT', description: 'Tahun periode (2026)' },
      { name: 'base_salary', type: 'DECIMAL(15,2)', description: 'Gaji Pokok' },
      { name: 'allowance_transport', type: 'DECIMAL(15,2)', description: 'Tunjangan Transportasi' },
      { name: 'allowance_meal', type: 'DECIMAL(15,2)', description: 'Tunjangan Makan' },
      { name: 'allowance_position', type: 'DECIMAL(15,2)', description: 'Tunjangan Jabatan' },
      { name: 'overtime_pay', type: 'DECIMAL(15,2)', description: 'Akumulasi upah lembur' },
      { name: 'bonus', type: 'DECIMAL(15,2)', description: 'Bonus performa / insentif' },
      { name: 'total_earnings', type: 'DECIMAL(15,2)', description: 'Total pendapatan bruto' },
      { name: 'bpjs_kesehatan', type: 'DECIMAL(15,2)', description: 'Iuran BPJS Kes 1%' },
      { name: 'bpjs_ketenagakerjaan', type: 'DECIMAL(15,2)', description: 'Iuran JHT & JP 3%' },
      { name: 'pph21_tax', type: 'DECIMAL(15,2)', description: 'Pajak PPh 21 TER' },
      { name: 'total_deductions', type: 'DECIMAL(15,2)', description: 'Total potongan gaji' },
      { name: 'net_salary', type: 'DECIMAL(15,2)', description: 'Gaji Bersih Take Home Pay' },
      { name: 'status', type: 'ENUM', description: 'draft, published, paid' },
    ],
  },
  {
    name: 'performance_appraisals',
    description: 'Penilaian kinerja 360 / KPI berkala dengan 5 pilar kompetensi',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'evaluator_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'period', type: 'VARCHAR(20)', description: 'Periode penilaian (Q1/Q2/Q3/Q4)' },
      { name: 'attendance_score', type: 'DECIMAL(5,2)', description: 'Skor Kehadiran (20%)' },
      { name: 'discipline_score', type: 'DECIMAL(5,2)', description: 'Skor Disiplin (20%)' },
      { name: 'teamwork_score', type: 'DECIMAL(5,2)', description: 'Skor Kerja Sama (20%)' },
      { name: 'productivity_score', type: 'DECIMAL(5,2)', description: 'Skor Produktivitas (25%)' },
      { name: 'communication_score', type: 'DECIMAL(5,2)', description: 'Skor Komunikasi (15%)' },
      { name: 'final_score', type: 'DECIMAL(5,2)', description: 'Nilai akhir tertimbang (1-100)' },
      { name: 'grade', type: 'ENUM', description: 'Sangat Baik, Baik, Cukup, Kurang' },
    ],
  },
  {
    name: 'shifts',
    description: 'Master data jam kerja shift operasional (Pagi, Siang, Malam, Reguler)',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'code', type: 'VARCHAR(20)', key: 'UK', description: 'Kode shift (PAGI, SIANG, MALAM, REG)' },
      { name: 'name', type: 'VARCHAR(100)', description: 'Nama shift resmi' },
      { name: 'start_time', type: 'TIME', description: 'Jam masuk shift (HH:mm)' },
      { name: 'end_time', type: 'TIME', description: 'Jam pulang shift (HH:mm)' },
      { name: 'early_check_in_tolerance_minutes', type: 'SMALLINT', description: 'Batas menit awal buka loket presensi' },
      { name: 'late_grace_minutes', type: 'SMALLINT', description: 'Batas menit dispensasi keterlambatan' },
      { name: 'is_night_shift', type: 'BOOLEAN', description: 'True jika shift melintasi tengah malam' },
    ],
  },
  {
    name: 'shift_patterns',
    description: 'Definisi pola rotasi shift berulang yang dikonfigurasi manajer',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Nama pola rotasi (e.g. 2-2-2-1)' },
      { name: 'description', type: 'TEXT', nullable: true, description: 'Deskripsi pola' },
      { name: 'cycle_days', type: 'TINYINT', description: 'Jumlah hari dalam satu siklus (e.g. 7, 8, 14)' },
      { name: 'pattern_schedule', type: 'JSON', description: 'JSON array urutan shift per hari siklus' },
    ],
  },
  {
    name: 'employee_shift_schedules',
    description: 'Jadwal shift penugasan harian karyawan per tanggal',
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED', key: 'PK', description: 'Primary Key' },
      { name: 'employee_id', type: 'BIGINT UNSIGNED', key: 'FK', description: 'FK -> employees.id' },
      { name: 'shift_id', type: 'BIGINT UNSIGNED', key: 'FK', nullable: true, description: 'FK -> shifts.id (Null jika OFF)' },
      { name: 'date', type: 'DATE', description: 'Tanggal jadwal bertugas' },
      { name: 'is_off_day', type: 'BOOLEAN', description: 'True jika hari libur / OFF' },
      { name: 'notes', type: 'VARCHAR(255)', nullable: true, description: 'Catatan pola atau penyesuaian manajer' },
    ],
  },
];

export const MERMAID_ERD = `erDiagram
    DEPARTMENTS ||--o{ POSITIONS : "has many"
    DEPARTMENTS ||--o{ EMPLOYEES : "has many"
    POSITIONS ||--o{ EMPLOYEES : "categorizes"
    USERS ||--o| EMPLOYEES : "authenticates"
    EMPLOYEES ||--o{ EMPLOYEES : "manages"
    EMPLOYEES ||--o{ ATTENDANCES : "records"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "applies"
    EMPLOYEES ||--o{ OVERTIMES : "requests"
    EMPLOYEES ||--o{ PAYROLLS : "receives"
    EMPLOYEES ||--o{ PERFORMANCE_APPRAISALS : "evaluated in"
    EMPLOYEES ||--o{ EMPLOYEE_SHIFT_SCHEDULES : "assigned to"
    SHIFTS ||--o{ EMPLOYEE_SHIFT_SCHEDULES : "scheduled in"
    SHIFTS ||--o{ ATTENDANCES : "validates"
    
    DEPARTMENTS {
        bigint id PK
        string code UK
        string name
        decimal budget
    }
    POSITIONS {
        bigint id PK
        bigint department_id FK
        string code UK
        string name
        enum level
    }
    EMPLOYEES {
        bigint id PK
        string employee_id UK
        char nik UK
        string name
        string email UK
        bigint department_id FK
        bigint position_id FK
        bigint manager_id FK
        decimal base_salary
        enum status
    }
    ATTENDANCES {
        bigint id PK
        bigint employee_id FK
        date date
        time clock_in
        time clock_out
        enum status
        decimal latitude
        decimal longitude
        boolean office_verified
    }
    LEAVE_REQUESTS {
        bigint id PK
        bigint employee_id FK
        enum leave_type
        date start_date
        date end_date
        enum status
    }
    PAYROLLS {
        bigint id PK
        bigint employee_id FK
        tinyint month
        smallint year
        decimal base_salary
        decimal net_salary
        enum status
    }
`;
