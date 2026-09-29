export interface CodeFile {
  id: string;
  name: string;
  category: string;
  language: string;
  path: string;
  description: string;
  content: string;
}

export const LARAVEL_PROJECT_TREE = `hris-enterprise/
├── app/
│   ├── Enums/
│   │   ├── AttendanceStatus.php
│   │   ├── EmployeeStatus.php
│   │   ├── LeaveStatus.php
│   │   ├── LeaveType.php
│   │   └── PayrollStatus.php
│   ├── Filament/
│   │   ├── Pages/
│   │   │   └── Dashboard.php
│   │   ├── Resources/
│   │   │   ├── AttendanceResource.php
│   │   │   ├── DepartmentResource.php
│   │   │   ├── EmployeeResource.php
│   │   │   ├── LeaveResource.php
│   │   │   ├── OvertimeResource.php
│   │   │   ├── PayrollResource.php
│   │   │   └── PerformanceAppraisalResource.php
│   │   └── Widgets/
│   │       ├── AttendanceOverviewChart.php
│   │       ├── DepartmentHeadcountChart.php
│   │       └── StatsOverviewWidget.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AttendanceApiController.php
│   │   │   │   ├── EmployeeApiController.php
│   │   │   │   └── LeaveApiController.php
│   │   │   └── PayrollSlipController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureOfficeGeofence.php
│   │   │   └── VerifyHRPermissions.php
│   │   └── Requests/
│   │       ├── StoreAttendanceRequest.php
│   │       ├── StoreEmployeeRequest.php
│   │       └── StoreLeaveRequest.php
│   ├── Jobs/
│   │   ├── GenerateMonthlyPayrollJob.php
│   │   └── SendLeaveNotificationJob.php
│   ├── Models/
│   │   ├── Announcement.php
│   │   ├── Attendance.php
│   │   ├── Department.php
│   │   ├── Employee.php
│   │   ├── LeaveRequest.php
│   │   ├── Overtime.php
│   │   ├── Payroll.php
│   │   ├── PerformanceAppraisal.php
│   │   ├── Position.php
│   │   └── User.php
│   ├── Policies/
│   │   ├── EmployeePolicy.php
│   │   ├── LeaveRequestPolicy.php
│   │   └── PayrollPolicy.php
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   ├── AttendanceRepositoryInterface.php
│   │   │   └── PayrollRepositoryInterface.php
│   │   └── Eloquent/
│   │       ├── AttendanceRepository.php
│   │       └── PayrollRepository.php
│   └── Services/
│       ├── AttendanceGeofenceService.php
│       ├── LeaveWorkflowService.php
│       └── PayrollCalculationService.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
│   ├── auth.php
│   ├── backup.php
│   ├── excel.php
│   ├── filament.php
│   └── permission.php
├── database/
│   ├── factories/
│   │   ├── EmployeeFactory.php
│   │   └── PayrollFactory.php
│   ├── migrations/
│   │   ├── 2026_01_01_000001_create_departments_table.php
│   │   ├── 2026_01_01_000002_create_positions_table.php
│   │   ├── 2026_01_01_000003_create_employees_table.php
│   │   ├── 2026_01_01_000004_create_attendances_table.php
│   │   ├── 2026_01_01_000005_create_leaves_table.php
│   │   ├── 2026_01_01_000006_create_overtimes_table.php
│   │   ├── 2026_01_01_000007_create_payrolls_table.php
│   │   ├── 2026_01_01_000008_create_performance_appraisals_table.php
│   │   └── 2026_01_01_000009_create_announcements_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── EmployeeSeeder.php
│       └── RoleAndPermissionSeeder.php
├── routes/
│   ├── api.php
│   ├── console.php
│   └── web.php
├── tests/
│   └── Feature/
│       ├── AttendanceGeofenceTest.php
│       ├── LeaveApprovalWorkflowTest.php
│       └── PayrollCalculationTest.php
├── compose.yaml
├── Dockerfile
└── composer.json`;

export const LARAVEL_CODE_FILES: CodeFile[] = [
  {
    id: 'migration_employees',
    name: '2026_01_01_000003_create_employees_table.php',
    category: 'Migrations',
    language: 'php',
    path: 'database/migrations/2026_01_01_000003_create_employees_table.php',
    description: 'Migration skema tabel employees lengkap dengan NIK, Foreign Keys, indeks performa, dan field personal.',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id', 30)->unique()->comment('Auto-generated: EMP-YYYY-XXXX');
            $table->char('nik', 16)->unique()->comment('Nomor Induk Kependudukan (KTP)');
            $table->string('name', 150)->index();
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->enum('gender', ['Laki-laki', 'Perempuan']);
            $table->enum('marital_status', ['Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'])->default('Belum Menikah');
            $table->string('email')->unique();
            $table->string('phone', 25);
            $table->text('address');
            
            // Relasi Organisasi
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('position_id')->constrained('positions')->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Kontrak & Kompensasi
            $table->date('join_date')->index();
            $table->enum('status', ['Tetap', 'Kontrak', 'Probation', 'Magang'])->default('Probation');
            $table->decimal('base_salary', 15, 2)->default(0.00);
            $table->string('photo_path')->nullable();
            
            // Informasi Perbankan & Ketenagakerjaan
            $table->string('bank_name', 50)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_holder', 150)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->string('bpjs_kesehatan_no', 30)->nullable();
            $table->string('bpjs_ketenagakerjaan_no', 30)->nullable();
            
            // Kuota Cuti
            $table->unsignedTinyInteger('annual_leave_quota')->default(12);
            $table->unsignedTinyInteger('annual_leave_used')->default(0);
            
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['department_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};`,
  },
  {
    id: 'migration_attendances',
    name: '2026_01_01_000004_create_attendances_table.php',
    category: 'Migrations',
    language: 'php',
    path: 'database/migrations/2026_01_01_000004_create_attendances_table.php',
    description: 'Migration skema tabel presensi GPS geofence, camera selfie, jam masuk, jam pulang, dan status.',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date')->index();
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->enum('status', ['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'])->default('Alpha');
            
            // Geolocation & Validation
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('distance_meters', 8, 2)->nullable();
            $table->boolean('office_verified')->default(false);
            $table->string('selfie_path')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->unique(['employee_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};`,
  },
  {
    id: 'migration_payrolls',
    name: '2026_01_01_000007_create_payrolls_table.php',
    category: 'Migrations',
    language: 'php',
    path: 'database/migrations/2026_01_01_000007_create_payrolls_table.php',
    description: 'Migration skema tabel payroll dengan komponen gaji pokok, tunjangan, lembur, BPJS, PPh21, dan take home pay.',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->unsignedTinyInteger('month')->index();
            $table->unsignedSmallInteger('year')->index();
            
            // Pendapatan (Earnings)
            $table->decimal('base_salary', 15, 2);
            $table->decimal('allowance_transport', 15, 2)->default(0.00);
            $table->decimal('allowance_meal', 15, 2)->default(0.00);
            $table->decimal('allowance_position', 15, 2)->default(0.00);
            $table->decimal('overtime_pay', 15, 2)->default(0.00);
            $table->decimal('bonus', 15, 2)->default(0.00);
            $table->decimal('total_earnings', 15, 2);
            
            // Potongan (Deductions)
            $table->decimal('bpjs_kesehatan', 15, 2)->default(0.00)->comment('1% Employee');
            $table->decimal('bpjs_ketenagakerjaan', 15, 2)->default(0.00)->comment('2% JHT + 1% JP');
            $table->decimal('pph21_tax', 15, 2)->default(0.00);
            $table->decimal('unpaid_leave_deduction', 15, 2)->default(0.00);
            $table->decimal('other_deductions', 15, 2)->default(0.00);
            $table->decimal('total_deductions', 15, 2);
            
            // Gaji Bersih (Take Home Pay)
            $table->decimal('net_salary', 15, 2);
            
            // Iuran Perusahaan (Informational)
            $table->decimal('bpjs_kesehatan_employer', 15, 2)->default(0.00)->comment('4% Employer');
            $table->decimal('bpjs_ketenagakerjaan_employer', 15, 2)->default(0.00)->comment('JKK, JKM, JHT, JP');
            
            $table->enum('status', ['draft', 'published', 'paid'])->default('draft');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};`,
  },
  {
    id: 'model_employee',
    name: 'Employee.php',
    category: 'Models',
    language: 'php',
    path: 'app/Models/Employee.php',
    description: 'Eloquent Model Employee dengan relationships, query scopes, accessors, dan auto ID generator.',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id', 'nik', 'name', 'birth_place', 'birth_date', 'gender',
        'marital_status', 'email', 'phone', 'address', 'department_id',
        'position_id', 'manager_id', 'user_id', 'join_date', 'status',
        'base_salary', 'photo_path', 'bank_name', 'bank_account_number',
        'bank_account_holder', 'npwp', 'bpjs_kesehatan_no', 'bpjs_ketenagakerjaan_no',
        'annual_leave_quota', 'annual_leave_used'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'base_salary' => 'decimal:2',
        'annual_leave_quota' => 'integer',
        'annual_leave_used' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->employee_id)) {
                $year = date('Y');
                $latest = self::whereYear('created_at', $year)->latest('id')->first();
                $seq = $latest ? ((int) substr($latest->employee_id, -3)) + 1 : 1;
                $model->employee_id = sprintf('EMP-%s-%03d', $year, $seq);
            }
        });
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    public function appraisals(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class);
    }

    public function getRemainingLeaveAttribute(): int
    {
        return max(0, $this->annual_leave_quota - $this->annual_leave_used);
    }
}`,
  },
  {
    id: 'filament_employee_resource',
    name: 'EmployeeResource.php',
    category: 'Filament v4',
    language: 'php',
    path: 'app/Filament/Resources/EmployeeResource.php',
    description: 'Filament v4 Resource untuk CRUD Karyawan dengan Form Wizard, validasi NIK, filter departemen, export Excel/PDF.',
    content: `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\EmployeeResource\\Pages;
use App\\Models\\Employee;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;
use Filament\\Tables\\Filters\\SelectFilter;
use Filament\\Tables\\Actions\\ExportBulkAction;
use pxlrbt\\FilamentExcel\\Exports\\ExcelExport;
use pxlrbt\\FilamentExcel\\Columns\\Column;

class EmployeeResource extends Resource
{
    protected static ?string $model = Employee::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Manajemen Karyawan';
    protected static ?string $recordTitleAttribute = 'name';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\\Components\\Section::make('Informasi Pokok & Identitas')
                    ->columns(3)
                    ->schema([
                        Forms\\Components\\TextInput::make('employee_id')
                            ->label('Employee ID')
                            ->disabled()
                            ->dehydrated(false)
                            ->placeholder('Auto Generated (EMP-YYYY-XXX)'),
                        Forms\\Components\\TextInput::make('nik')
                            ->label('NIK (16 Digit)')
                            ->required()
                            ->length(16)
                            ->numeric()
                            ->unique(ignoreRecord: true),
                        Forms\\Components\\TextInput::make('name')
                            ->label('Nama Lengkap')
                            ->required()
                            ->maxLength(150),
                        Forms\\Components\\TextInput::make('birth_place')
                            ->label('Tempat Lahir')
                            ->required(),
                        Forms\\Components\\DatePicker::make('birth_date')
                            ->label('Tanggal Lahir')
                            ->required()
                            ->native(false),
                        Forms\\Components\\Select::make('gender')
                            ->label('Jenis Kelamin')
                            ->options(['Laki-laki' => 'Laki-laki', 'Perempuan' => 'Perempuan'])
                            ->required(),
                        Forms\\Components\\Select::make('marital_status')
                            ->label('Status Pernikahan')
                            ->options([
                                'Belum Menikah' => 'Belum Menikah',
                                'Menikah' => 'Menikah',
                                'Cerai Hidup' => 'Cerai Hidup',
                                'Cerai Mati' => 'Cerai Mati',
                            ])
                            ->required(),
                        Forms\\Components\\TextInput::make('email')
                            ->label('Email Perusahaan')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true),
                        Forms\\Components\\TextInput::make('phone')
                            ->label('Nomor WhatsApp/HP')
                            ->tel()
                            ->required(),
                        Forms\\Components\\Textarea::make('address')
                            ->label('Alamat Domisili')
                            ->columnSpanFull()
                            ->required(),
                    ]),

                Forms\\Components\\Section::make('Jabatan & Penugasan')
                    ->columns(3)
                    ->schema([
                        Forms\\Components\\Select::make('department_id')
                            ->relationship('department', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\\Components\\Select::make('position_id')
                            ->relationship('position', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\\Components\\Select::make('manager_id')
                            ->relationship('manager', 'name')
                            ->label('Atasan Langsung (Manager)')
                            ->searchable(),
                        Forms\\Components\\DatePicker::make('join_date')
                            ->label('Tanggal Masuk')
                            ->required()
                            ->native(false),
                        Forms\\Components\\Select::make('status')
                            ->label('Status Kontrak')
                            ->options([
                                'Tetap' => 'Karyawan Tetap',
                                'Kontrak' => 'PKWT (Kontrak)',
                                'Probation' => 'Masa Percobaan',
                                'Magang' => 'Internship',
                            ])
                            ->required(),
                        Forms\\Components\\TextInput::make('base_salary')
                            ->label('Gaji Pokok (IDR)')
                            ->numeric()
                            ->prefix('Rp')
                            ->required(),
                        Forms\\Components\\FileUpload::make('photo_path')
                            ->label('Foto Profil Karyawan')
                            ->image()
                            ->avatar()
                            ->disk('public')
                            ->directory('employee-photos'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\ImageColumn::make('photo_path')
                    ->circular()
                    ->label('Foto'),
                Tables\\Columns\\TextColumn::make('employee_id')
                    ->label('ID')
                    ->fontFamily('mono')
                    ->sortable()
                    ->searchable(),
                Tables\\Columns\\TextColumn::make('name')
                    ->label('Nama Karyawan')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\\Columns\\TextColumn::make('department.name')
                    ->label('Departemen')
                    ->badge()
                    ->color('primary'),
                Tables\\Columns\\TextColumn::make('position.name')
                    ->label('Jabatan'),
                Tables\\Columns\\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Tetap' => 'success',
                        'Kontrak' => 'info',
                        'Probation' => 'warning',
                        default => 'gray',
                    }),
                Tables\\Columns\\TextColumn::make('base_salary')
                    ->label('Gaji Pokok')
                    ->money('IDR')
                    ->fontFamily('mono'),
            ])
            ->filters([
                SelectFilter::make('department_id')
                    ->relationship('department', 'name')
                    ->label('Departemen'),
                SelectFilter::make('status')
                    ->options([
                        'Tetap' => 'Tetap',
                        'Kontrak' => 'Kontrak',
                        'Probation' => 'Probation',
                    ]),
            ])
            ->actions([
                Tables\\Actions\\ViewAction::make(),
                Tables\\Actions\\EditAction::make(),
            ])
            ->bulkActions([
                ExportBulkAction::make()->exports([
                    ExcelExport::make('export_karyawan')
                        ->fromTable()
                        ->withFilename(fn () => 'Laporan_Karyawan_' . date('Ymd_His')),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListEmployees::route('/'),
            'create' => Pages\\CreateEmployee::route('/create'),
            'edit' => Pages\\EditEmployee::route('/{record}/edit'),
        ];
    }
}`,
  },
  {
    id: 'service_payroll',
    name: 'PayrollCalculationService.php',
    category: 'Services',
    language: 'php',
    path: 'app/Services/PayrollCalculationService.php',
    description: 'Clean Architecture Service untuk kalkulasi gaji bulanan, BPJS Kesehatan 1%, BPJS Ketenagakerjaan 3%, Lembur, PPh21 TER.',
    content: `<?php

namespace App\\Services;

use App\\Models\\Employee;
use App\\Models\\Payroll;
use App\\Models\\Overtime;
use App\\Models\\Attendance;
use Illuminate\\Support\\Facades\\DB;
use Carbon\\Carbon;

class PayrollCalculationService
{
    /**
     * Hitung payroll bulanan karyawan sesuai regulasi Ketenagakerjaan Indonesia.
     */
    public function generateForEmployee(Employee $employee, int $month, int $year): Payroll
    {
        return DB::transaction(function () use ($employee, $month, $year) {
            $baseSalary = $employee->base_salary;
            
            // Tunjangan Standar Berdasarkan Level Jabatan
            $allowanceTransport = 1000000;
            $allowanceMeal = 800000;
            $allowancePosition = match ($employee->position->level ?? 'Staff') {
                'Director' => 5000000,
                'Manager' => 3000000,
                'Lead' => 2000000,
                'Senior' => 1000000,
                default => 500000,
            };

            // Hitung Uang Lembur yang Telah Disetujui HR
            $approvedOvertimes = Overtime::where('employee_id', $employee->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'approved')
                ->get();

            $hourlyRate = $baseSalary / 173; // Formula baku Depnaker RI
            $overtimePay = 0;
            foreach ($approvedOvertimes as $ot) {
                // 1.5x untuk jam pertama, 2x jam berikutnya
                $firstHour = min(1, $ot->total_hours);
                $subsequentHours = max(0, $ot->total_hours - 1);
                $otPay = ($firstHour * 1.5 * $hourlyRate) + ($subsequentHours * 2.0 * $hourlyRate);
                $overtimePay += $otPay;
            }

            $bonus = 0; // Didapat dari insentif khusus jika ada

            $totalEarnings = $baseSalary + $allowanceTransport + $allowanceMeal + $allowancePosition + $overtimePay + $bonus;

            // Potongan BPJS Kesehatan (1% Karyawan, Max Cap Rp 12.000.000)
            $bpjsKesBasis = min($baseSalary, 12000000);
            $bpjsKesehatan = $bpjsKesBasis * 0.01;
            $bpjsKesehatanEmployer = $bpjsKesBasis * 0.04;

            // Potongan BPJS Ketenagakerjaan (JHT 2% + JP 1% Max Cap Rp 10.042.300)
            $jhtEmployee = $baseSalary * 0.02;
            $jpBasis = min($baseSalary, 10042300);
            $jpEmployee = $jpBasis * 0.01;
            $bpjsKetenagakerjaan = $jhtEmployee + $jpEmployee;

            $bpjsKetenagakerjaanEmployer = ($baseSalary * 0.037) + ($jpBasis * 0.02) + ($baseSalary * 0.0024) + ($baseSalary * 0.003);

            // Potongan Alpha/Mangkir
            $alphaCount = Attendance::where('employee_id', $employee->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'Alpha')
                ->count();
            $dailySalary = $baseSalary / 21;
            $unpaidLeaveDeduction = $alphaCount * $dailySalary;

            // Perhitungan Pajak PPh 21 TER (Tarif Efektif Rata-Rata PP 58/2023)
            $pph21Tax = $this->calculatePPh21TER($totalEarnings, $employee->marital_status);

            $otherDeductions = 0;
            $totalDeductions = $bpjsKesehatan + $bpjsKetenagakerjaan + $pph21Tax + $unpaidLeaveDeduction + $otherDeductions;
            $netSalary = max(0, $totalEarnings - $totalDeductions);

            return Payroll::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'base_salary' => $baseSalary,
                    'allowance_transport' => $allowanceTransport,
                    'allowance_meal' => $allowanceMeal,
                    'allowance_position' => $allowancePosition,
                    'overtime_pay' => round($overtimePay, 2),
                    'bonus' => $bonus,
                    'total_earnings' => round($totalEarnings, 2),
                    'bpjs_kesehatan' => round($bpjsKesehatan, 2),
                    'bpjs_ketenagakerjaan' => round($bpjsKetenagakerjaan, 2),
                    'pph21_tax' => round($pph21Tax, 2),
                    'unpaid_leave_deduction' => round($unpaidLeaveDeduction, 2),
                    'other_deductions' => round($otherDeductions, 2),
                    'total_deductions' => round($totalDeductions, 2),
                    'net_salary' => round($netSalary, 2),
                    'bpjs_kesehatan_employer' => round($bpjsKesehatanEmployer, 2),
                    'bpjs_ketenagakerjaan_employer' => round($bpjsKetenagakerjaanEmployer, 2),
                    'status' => 'published',
                    'notes' => sprintf('Payroll bulan %02d/%d berhasil di-generate secara otomatis', $month, $year),
                ]
            );
        });
    }

    /**
     * Hitung Pajak PPh 21 menggunakan TER PP 58/2023
     */
    private function calculatePPh21TER(float $grossIncome, string $maritalStatus): float
    {
        // Kategori A: TK/0, TK/1, K/0
        // Skema tarif efektif bulanan
        if ($grossIncome <= 5400000) return 0;
        if ($grossIncome <= 5650000) return $grossIncome * 0.0025;
        if ($grossIncome <= 5950000) return $grossIncome * 0.005;
        if ($grossIncome <= 6300000) return $grossIncome * 0.0075;
        if ($grossIncome <= 6750000) return $grossIncome * 0.01;
        if ($grossIncome <= 7500000) return $grossIncome * 0.015;
        if ($grossIncome <= 8550000) return $grossIncome * 0.02;
        if ($grossIncome <= 9650000) return $grossIncome * 0.03;
        if ($grossIncome <= 10050000) return $grossIncome * 0.04;
        if ($grossIncome <= 12600000) return $grossIncome * 0.05;
        if ($grossIncome <= 14950000) return $grossIncome * 0.06;
        if ($grossIncome <= 16400000) return $grossIncome * 0.07;
        if ($grossIncome <= 20000000) return $grossIncome * 0.08;
        if ($grossIncome <= 25000000) return $grossIncome * 0.09;
        if ($grossIncome <= 30000000) return $grossIncome * 0.10;
        return $grossIncome * 0.12;
    }
}`,
  },
  {
    id: 'service_geofence',
    name: 'AttendanceGeofenceService.php',
    category: 'Services',
    language: 'php',
    path: 'app/Services/AttendanceGeofenceService.php',
    description: 'Service perhitungan jarak Haversine Geolocation untuk verifikasi presensi di area kantor.',
    content: `<?php

namespace App\\Services;

class AttendanceGeofenceService
{
    // Koordinat Kantor Pusat (Wisma HR NEXA HQ)
    private const OFFICE_LATITUDE = -6.225014;
    private const OFFICE_LONGITUDE = 106.809652;
    private const ALLOWED_RADIUS_METERS = 200.0;

    /**
     * Hitung jarak user ke kantor menggunakan Haversine Formula dalam meter.
     */
    public function calculateDistance(float $userLat, float $userLng): float
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($userLat);
        $lonFrom = deg2rad($userLng);
        $latTo = deg2rad(self::OFFICE_LATITUDE);
        $lonTo = deg2rad(self::OFFICE_LONGITUDE);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    /**
     * Verifikasi apakah koordinat berada dalam batas radius kantor.
     */
    public function isWithinGeofence(float $userLat, float $userLng): bool
    {
        return $this->calculateDistance($userLat, $userLng) <= self::ALLOWED_RADIUS_METERS;
    }
}`,
  },
  {
    id: 'service_shift_scheduling',
    name: 'ShiftSchedulingService.php',
    category: 'Services',
    language: 'php',
    path: 'app/Services/ShiftSchedulingService.php',
    description: 'Clean Architecture Service untuk pembuatan jadwal rotasi berulang (Pagi, Siang, Malam, OFF) serta validasi check-in presensi.',
    content: `<?php

namespace App\\Services;

use App\\Models\\Shift;
use App\\Models\\ShiftPattern;
use App\\Models\\EmployeeShiftSchedule;
use App\\Models\\Attendance;
use Carbon\\Carbon;
use Illuminate\\Support\\Collection;
use Illuminate\\Support\\Facades\\DB;

class ShiftSchedulingService
{
    /**
     * Terapkan Pola Shift Berulang (Recurring Pattern) ke sekumpulan karyawan untuk rentang tanggal tertentu.
     */
    public function applyRecurringPattern(
        ShiftPattern $pattern,
        array $employeeIds,
        Carbon $startDate,
        int $daysCount
    ): int {
        return DB::transaction(function () use ($pattern, $employeeIds, $startDate, $daysCount) {
            $createdCount = 0;
            $cycleDays = max(1, $pattern->cycle_days);
            $scheduleItems = $pattern->pattern_schedule; // array of ['dayIndex' => x, 'shiftId' => y]

            foreach ($employeeIds as $empId) {
                for ($i = 0; $i < $daysCount; $i++) {
                    $currentDate = $startDate->copy()->addDays($i);
                    $patternIndex = $i % $cycleDays;
                    $item = $scheduleItems[$patternIndex] ?? $scheduleItems[0];
                    $isOff = ($item['shiftId'] ?? 'OFF') === 'OFF';

                    $shift = !$isOff ? Shift::find($item['shiftId']) : null;

                    EmployeeShiftSchedule::updateOrCreate(
                        [
                            'employee_id' => $empId,
                            'date' => $currentDate->toDateString(),
                        ],
                        [
                            'shift_id' => $isOff ? null : $shift?->id,
                            'is_off_day' => $isOff,
                            'notes' => 'Generated by recurring pattern: ' . $pattern->name,
                        ]
                    );

                    $createdCount++;
                }
            }

            return $createdCount;
        });
    }

    /**
     * Validasi Check-In karyawan terhadap jadwal shift kerja hari ini.
     * Mengembalikan status validitas beserta alasan jika check-in tidak valid.
     */
    public function validateCheckIn(int $employeeId, Carbon $checkInTime): array
    {
        $todayStr = $checkInTime->toDateString();
        $schedule = EmployeeShiftSchedule::with('shift')
            ->where('employee_id', $employeeId)
            ->where('date', $todayStr)
            ->first();

        // 1. Karyawan Terjadwal Libur / OFF
        if ($schedule && ($schedule->is_off_day || !$schedule->shift_id)) {
            return [
                'is_valid' => false,
                'status' => 'Alpha',
                'reason' => 'Presensi di luar jadwal kerja (Hari ini terjadwal LIBUR / OFF DAY).',
                'late_minutes' => 0,
            ];
        }

        $shift = $schedule?->shift ?? Shift::where('code', 'REG')->first();
        if (!$shift) {
            return ['is_valid' => true, 'status' => 'Hadir', 'reason' => null, 'late_minutes' => 0];
        }

        // Tentukan batas loket dibuka (startTime - earlyTolerance)
        $shiftStart = Carbon::createFromTimeString($shift->start_time, $checkInTime->timezone);
        $earliestAllowed = $shiftStart->copy()->subMinutes($shift->early_check_in_tolerance_minutes ?? 60);
        $lateThreshold = $shiftStart->copy()->addMinutes($shift->late_grace_minutes ?? 15);

        // 2. Check-In Terlalu Awal (Sebelum Loket Dibuka)
        if ($checkInTime->lt($earliestAllowed)) {
            $diffHours = round($checkInTime->diffInMinutes($shiftStart) / 60, 1);
            return [
                'is_valid' => false,
                'status' => 'Hadir',
                'reason' => sprintf(
                    'Check-in terlalu dini (%.1f jam sebelum loket shift %s dibuka pukul %s WIB).',
                    $diffHours,
                    $shift->name,
                    $earliestAllowed->format('H:i')
                ),
                'late_minutes' => 0,
            ];
        }

        // 3. Check-In Terlambat (Melewati Grace Period)
        if ($checkInTime->gt($lateThreshold)) {
            $lateMinutes = $checkInTime->diffInMinutes($shiftStart);
            return [
                'is_valid' => true,
                'status' => 'Terlambat',
                'reason' => null,
                'late_minutes' => $lateMinutes,
            ];
        }

        // 4. Check-In Tepat Waktu
        return [
            'is_valid' => true,
            'status' => 'Hadir',
            'reason' => null,
            'late_minutes' => 0,
        ];
    }
}`,
  },
  {
    id: 'spatie_seeder',
    name: 'RoleAndPermissionSeeder.php',
    category: 'Seeders',
    language: 'php',
    path: 'database/seeders/RoleAndPermissionSeeder.php',
    description: 'Spatie Permission & Role seeder untuk Super Admin, HR Manager, Manager, dan Employee.',
    content: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Daftar Hak Akses (Permissions)
        $permissions = [
            'view_employees', 'create_employees', 'edit_employees', 'delete_employees', 'import_employees', 'export_employees',
            'view_departments', 'manage_departments',
            'view_positions', 'manage_positions',
            'clock_in_out', 'view_all_attendance', 'manage_attendance', 'export_attendance',
            'apply_leaves', 'view_team_leaves', 'approve_manager_leaves', 'approve_hr_leaves',
            'apply_overtime', 'approve_manager_overtime', 'approve_hr_overtime',
            'view_payroll', 'generate_payroll', 'publish_payroll', 'download_slip_gaji',
            'evaluate_kpi', 'manage_announcements', 'view_reports', 'manage_system'
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // 1. Super Admin Role
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. HR Manager Role
        $hrManager = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $hrManager->givePermissionTo([
            'view_employees', 'create_employees', 'edit_employees', 'delete_employees', 'import_employees', 'export_employees',
            'view_departments', 'view_positions',
            'clock_in_out', 'view_all_attendance', 'manage_attendance', 'export_attendance',
            'apply_leaves', 'approve_hr_leaves',
            'approve_hr_overtime',
            'view_payroll', 'generate_payroll', 'publish_payroll', 'download_slip_gaji',
            'evaluate_kpi', 'manage_announcements', 'view_reports'
        ]);

        // 3. Department Manager Role
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->givePermissionTo([
            'view_employees',
            'view_departments', 'view_positions',
            'clock_in_out',
            'apply_leaves', 'view_team_leaves', 'approve_manager_leaves',
            'apply_overtime', 'approve_manager_overtime',
            'evaluate_kpi', 'view_reports', 'download_slip_gaji'
        ]);

        // 4. Employee Role
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $employee->givePermissionTo([
            'clock_in_out',
            'apply_leaves',
            'apply_overtime',
            'download_slip_gaji'
        ]);
    }
}`,
  },
  {
    id: 'policy_leave',
    name: 'LeaveRequestPolicy.php',
    category: 'Policies',
    language: 'php',
    path: 'app/Policies/LeaveRequestPolicy.php',
    description: 'Policy Otorisasi Alur Approval Cuti Berjenjang (Employee -> Manager -> HR).',
    content: `<?php

namespace App\\Policies;

use App\\Models\\User;
use App\\Models\\LeaveRequest;
use Illuminate\\Auth\\Access\\HandlesAuthorization;

class LeaveRequestPolicy
{
    use HandlesAuthorization;

    public function view(User $user, LeaveRequest $leave): bool
    {
        if ($user->hasRole(['super_admin', 'hr_manager'])) return true;
        if ($user->employee && $user->employee->id === $leave->employee_id) return true;
        if ($user->employee && $leave->employee && $leave->employee->manager_id === $user->employee->id) return true;
        
        return false;
    }

    public function approveManager(User $user, LeaveRequest $leave): bool
    {
        if ($leave->status !== 'pending') return false;
        
        // Atasan langsung atau Super Admin
        if ($user->hasRole('super_admin')) return true;
        return $user->employee && $leave->employee && $leave->employee->manager_id === $user->employee->id;
    }

    public function approveHr(User $user, LeaveRequest $leave): bool
    {
        if ($leave->status !== 'manager_approved') return false;
        
        // HR Manager atau Super Admin
        return $user->hasRole(['super_admin', 'hr_manager']);
    }

    public function reject(User $user, LeaveRequest $leave): bool
    {
        if (in_array($leave->status, ['approved', 'rejected'])) return false;
        return $this->approveManager($user, $leave) || $this->approveHr($user, $leave);
    }
}`,
  },
  {
    id: 'api_routes',
    name: 'routes/api.php',
    category: 'Routes & API',
    language: 'php',
    path: 'routes/api.php',
    description: 'RESTful API Endpoints untuk Absensi Geolocation, Pengajuan Cuti, Approval, Slip Gaji, dan KPI.',
    content: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\AttendanceApiController;
use App\\Http\\Controllers\\Api\\EmployeeApiController;
use App\\Http\\Controllers\\Api\\LeaveApiController;
use App\\Http\\Controllers\\Api\\PayrollApiController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    // Profil Karyawan Terotentikasi
    Route::get('/me', [EmployeeApiController::class, 'me']);

    // Modul Presensi Geofence
    Route::post('/attendance/clock-in', [AttendanceApiController::class, 'clockIn']);
    Route::post('/attendance/clock-out', [AttendanceApiController::class, 'clockOut']);
    Route::get('/attendance/history', [AttendanceApiController::class, 'history']);
    Route::get('/attendance/monthly-summary', [AttendanceApiController::class, 'monthlySummary']);

    // Modul Pengajuan Cuti & Approval Workflow
    Route::get('/leaves', [LeaveApiController::class, 'index']);
    Route::post('/leaves', [LeaveApiController::class, 'store']);
    Route::patch('/leaves/{id}/manager-approval', [LeaveApiController::class, 'managerApproval']);
    Route::patch('/leaves/{id}/hr-approval', [LeaveApiController::class, 'hrApproval']);
    Route::patch('/leaves/{id}/reject', [LeaveApiController::class, 'reject']);

    // Modul Payroll & Slip Gaji
    Route::get('/payroll/my-slips', [PayrollApiController::class, 'mySlips']);
    Route::get('/payroll/{id}/download-pdf', [PayrollApiController::class, 'downloadPdf']);
    Route::post('/payroll/generate-bulk', [PayrollApiController::class, 'generateBulk'])
        ->middleware('permission:generate_payroll');
});`,
  },
  {
    id: 'scheduler_jobs',
    name: 'routes/console.php',
    category: 'Scheduler & Queue',
    language: 'php',
    path: 'routes/console.php',
    description: 'Laravel 12 Task Scheduler & Queue worker untuk auto-alpha absensi dan auto-backup database.',
    content: `<?php

use Illuminate\\Support\\Facades\\Schedule;
use App\\Jobs\\MarkAbsentEmployeesJob;
use App\\Jobs\\GenerateMonthlyPayrollJob;

// Otomatis tandai karyawan Alpha jika belum check-in hingga pukul 12:00 WIB
Schedule::job(new MarkAbsentEmployeesJob)
    ->dailyAt('12:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();

// Otomatis generate draf payroll setiap tanggal 24 pukul 23:00 WIB
Schedule::job(new GenerateMonthlyPayrollJob(date('n'), date('Y')))
    ->monthlyOn(24, '23:00')
    ->timezone('Asia/Jakarta');

// Laravel Backup Database & Storage setiap tengah malam
Schedule::command('backup:clean')->dailyAt('01:00');
Schedule::command('backup:run --only-db')->dailyAt('02:00');`,
  },
  {
    id: 'dockerfile',
    name: 'Dockerfile (Production PHP 8.4)',
    category: 'DevOps & Deployment',
    language: 'dockerfile',
    path: 'Dockerfile',
    description: 'Multi-stage Dockerfile berbasis Alpine Linux, PHP 8.4-FPM, OPcache, Redis, GD, dan MySQL driver.',
    content: `FROM php:8.4-fpm-alpine AS base

WORKDIR /var/www/html

# Install dependencies sistem
RUN apk add --no-cache \\
    curl \\
    libpng-dev \\
    libxml2-dev \\
    zip \\
    unzip \\
    oniguruma-dev \\
    freetype-dev \\
    libjpeg-turbo-dev \\
    icu-dev \\
    linux-headers \\
    supervisor \\
    nginx

# Install Ekstensi PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \\
    && docker-php-ext-install -j$(nproc) \\
        pdo_mysql \\
        mbstring \\
        exif \\
        pcntl \\
        bcmath \\
        gd \\
        intl \\
        opcache

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \\
    && pecl install redis \\
    && docker-php-ext-enable redis \\
    && apk del .build-deps

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Copy kode aplikasi
COPY . .

# Konfigurasi Production Cache & Opcache
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 80 9000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]`,
  },
  {
    id: 'migration_shifts',
    name: '2026_01_01_000010_create_shifts_table.php',
    category: 'Migrations',
    language: 'php',
    path: 'database/migrations/2026_01_01_000010_create_shifts_table.php',
    description: 'Migration skema tabel master shift kerja, toleransi check-in dini, batas grace period, dan flag shift malam.',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->comment('PAGI, SIANG, MALAM, REG');
            $table->string('name', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('early_check_in_tolerance_minutes')->default(60);
            $table->unsignedSmallInteger('late_grace_minutes')->default(15);
            $table->boolean('is_night_shift')->default(false);
            $table->string('color', 30)->default('indigo');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('employee_shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date')->index();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->boolean('is_off_day')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['date', 'shift_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_shift_schedules');
        Schema::dropIfExists('shifts');
    }
};`,
  },
  {
    id: 'service_shift_validator',
    name: 'AttendanceShiftValidatorService.php',
    category: 'Services',
    language: 'php',
    path: 'app/Services/AttendanceShiftValidatorService.php',
    description: 'Clean Architecture Service untuk validasi kesesuaian waktu presensi terhadap shift yang ditugaskan dan mendeteksi invalid punch.',
    content: `<?php

namespace App\\Services;

use App\\Models\\Employee;
use App\\Models\\Shift;
use App\\Models\\EmployeeShiftSchedule;
use Carbon\\Carbon;

class AttendanceShiftValidatorService
{
    /**
     * Validasi waktu presensi terhadap jadwal shift yang ditugaskan.
     * Mengembalikan status (Hadir, Terlambat, Invalid), menit terlambat, dan alasan jika tidak valid.
     */
    public function validateCheckIn(Employee $employee, Carbon $checkInDateTime): array
    {
        $dateStr = $checkInDateTime->toDateString();
        $schedule = EmployeeShiftSchedule::with('shift')
            ->where('employee_id', $employee->id)
            ->where('date', $dateStr)
            ->first();

        // 1. Cek apakah karyawan terjadwal LIBUR (OFF DAY)
        if ($schedule && $schedule->is_off_day) {
            return [
                'status' => 'Alpha',
                'is_invalid_shift' => true,
                'invalid_reason' => 'Presensi dilakukan pada hari LIBUR (OFF DAY) tanpa penugasan lembur resmi.',
                'late_minutes' => 0,
                'shift_name' => 'Libur (OFF DAY)',
            ];
        }

        // Ambil shift yang terjadwal atau fallback ke shift reguler default
        $shift = $schedule?->shift ?? Shift::where('code', 'REG')->first();

        if (!$shift) {
            return [
                'status' => 'Hadir',
                'is_invalid_shift' => false,
                'invalid_reason' => null,
                'late_minutes' => 0,
                'shift_name' => 'Non-Shift Reguler',
            ];
        }

        $shiftStart = Carbon::parse($dateStr . ' ' . $shift->start_time);
        $earliestAllowed = $shiftStart->copy()->subMinutes($shift->early_check_in_tolerance_minutes);
        $lateThreshold = $shiftStart->copy()->addMinutes($shift->late_grace_minutes);

        // 2. Cek apakah check-in terlalu dini (di luar jendela shift)
        if ($checkInDateTime->lt($earliestAllowed)) {
            $diffHours = round($checkInDateTime->diffInMinutes($shiftStart) / 60, 1);
            return [
                'status' => 'Hadir',
                'is_invalid_shift' => true,
                'invalid_reason' => sprintf(
                    'Check-in di luar jadwal %s (%s jam sebelum loket dibuka pukul %s WIB).',
                    $shift->name,
                    $diffHours,
                    $earliestAllowed->format('H:i')
                ),
                'late_minutes' => 0,
                'shift_name' => $shift->name,
            ];
        }

        // 3. Cek apakah terlambat
        if ($checkInDateTime->gt($lateThreshold)) {
            $lateMinutes = $checkInDateTime->diffInMinutes($shiftStart);
            return [
                'status' => 'Terlambat',
                'is_invalid_shift' => false,
                'invalid_reason' => null,
                'late_minutes' => $lateMinutes,
                'shift_name' => $shift->name,
            ];
        }

        // 4. Hadir tepat waktu
        return [
            'status' => 'Hadir',
            'is_invalid_shift' => false,
            'invalid_reason' => null,
            'late_minutes' => 0,
            'shift_name' => $shift->name,
        ];
    }
}`,
  },
];
