/**
 * Check apakah saat ini di luar jam kerja developer.
 * Jika ya, return warning supaya agent tanya kondisi dulu.
 *
 * Jam kerja: Senin-Jumat 08:00-17:00 WIB (UTC+7)
 * Sabtu-Minggu: opsional (tidak trigger warning)
 */
export function checkEnergy() {
  // Use UTC+7 for WIB
  const now = new Date();
  const wibOffset = 7 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const wibMinutes = utcMinutes + wibOffset;

  const wibHour = Math.floor((wibMinutes % 1440) / 60);
  const wibDay = now.getUTCDay(); // 0=Sun, 6=Sat

  // Adjust day if WIB offset pushes past midnight
  const adjustedDay =
    wibMinutes >= 1440 ? (wibDay + 1) % 7 : wibDay;

  const isWeekday = adjustedDay >= 1 && adjustedDay <= 5;
  const isWorkHours = wibHour >= 8 && wibHour < 17;

  const dayNames = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
  ];

  const result: {
    current_time_wib: string;
    day: string;
    is_work_hours: boolean;
    is_weekday: boolean;
    warning: string | null;
    suggestion: string | null;
  } = {
    current_time_wib: `${String(wibHour).padStart(2, "0")}:${String(
      wibMinutes % 60
    ).padStart(2, "0")} WIB`,
    day: dayNames[adjustedDay],
    is_work_hours: isWorkHours,
    is_weekday: isWeekday,
    warning: null,
    suggestion: null,
  };

  if (isWeekday && !isWorkHours) {
    if (wibHour >= 17) {
      result.warning = `Sekarang ${result.current_time_wib} — sudah lewat jam kerja (17:00).`;
      result.suggestion =
        "WAJIB tanyakan kondisi developer sebelum mulai task: 'Sudah lewat jam kerja, mau lanjut atau istirahat dulu?'";
    } else if (wibHour < 8) {
      result.warning = `Sekarang ${result.current_time_wib} — belum jam kerja (08:00).`;
      result.suggestion =
        "Tanyakan apakah developer sengaja kerja pagi atau lupa waktu.";
    }
  } else if (!isWeekday) {
    result.warning = `Hari ${result.day} — weekend/opsional.`;
    result.suggestion =
      "Weekend opsional. Jangan push task berat kecuali developer yang minta.";
  }

  return result;
}
