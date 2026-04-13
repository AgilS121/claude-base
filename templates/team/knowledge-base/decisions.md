# Architectural Decision Records (ADR)

> Keputusan teknis/arsitektur penting yang berlaku cross-project.
> Gunakan `/capture-decision` untuk menambahkan entry baru.

---

## ADR-001 — Multi-Project Agent System Architecture
**Tanggal**: 2026-04-10
**Status**: Accepted
**Project**: All
**Diputuskan oleh**: dttuvnord

### Konteks
Tim mengelola 6+ project dengan stack berbeda (Yii 1, Laravel 8). Tidak ada shared context antar sesi Claude Code.

### Opsi yang Dipertimbangkan
1. Separate CLAUDE.md per project saja — simple tapi tidak ada cross-project awareness
2. Global orchestrator + registry + skills — complex tapi unified workflow

### Keputusan
Opsi 2: Global orchestrator (`~/.claude/CLAUDE.md`) + project registry + slash commands + stack profiles.

### Konsekuensi
- Positif: unified workflow, knowledge persistence, stack-aware assistance
- Negatif: setup overhead, maintenance cost
- Risiko: global CLAUDE.md bisa jadi terlalu besar jika tidak di-maintain
