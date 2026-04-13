# Execute Plan — Eksekusi Plan dengan Disiplin

Eksekusi implementation plan yang sudah di-approve step by step.

## Instructions

### Step 1: Load Plan
1. Baca plan dari conversation context atau file yang ditunjuk developer
2. Konfirmasi: "Saya akan eksekusi plan [nama]. Total [N] steps. Mulai?"

### Step 2: Eksekusi Per Step
Untuk SETIAP step dalam plan:
1. Announce: "Step [N]: [deskripsi]"
2. Eksekusi perubahan
3. Verify: cek apakah perubahan benar
4. Report: "Step [N] selesai. [detail singkat]"
5. Jika ada test → jalankan test setelah step
6. Jika step GAGAL → STOP, laporkan error, tunggu instruksi

JANGAN skip step. JANGAN reorder tanpa konfirmasi.

### Step 3: Checkpoint
Setelah setiap 3 steps, tanya developer:
"3 steps selesai. Mau review dulu atau lanjut?"

### Step 4: Selesai
Setelah semua steps selesai:
1. Summary: file apa saja yang diubah
2. Jalankan test suite (jika ada)
3. Update `~/.claude/project-docs/{slug}/CURRENT_STATE.md`
4. Update `~/.claude/project-docs/{slug}/AUDIT_LOG.md`
5. Tanya: "Semua selesai. Mau commit?"
