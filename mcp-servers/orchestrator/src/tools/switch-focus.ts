import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function switchFocus(
  claudeHome: string,
  profileKey: string
) {
  const path = join(claudeHome, "current-focus.json");
  const raw = await readFile(path, "utf-8");
  const focus = JSON.parse(raw);

  const profiles = focus.available_focus_profiles ?? {};

  if (profileKey === "general") {
    focus.mode = "general";
    focus.focus_label = "General (semua project terbuka)";
    focus.active_projects = [];
    focus.last_updated = new Date().toISOString().slice(0, 10);

    await writeFile(path, JSON.stringify(focus, null, 2), "utf-8");
    return {
      file: path,
      switched_to: "general",
      message: "Focus switched to General mode",
    };
  }

  if (!profiles[profileKey]) {
    return {
      error: true,
      message: `Profile '${profileKey}' tidak ditemukan.`,
      available: Object.keys(profiles),
    };
  }

  const profile = profiles[profileKey];
  focus.mode = "focused";
  focus.focus_label = profile.label;
  focus.active_projects = profile.active_projects;
  focus.last_updated = new Date().toISOString().slice(0, 10);

  await writeFile(path, JSON.stringify(focus, null, 2), "utf-8");

  return {
    file: path,
    switched_to: profileKey,
    label: profile.label,
    active_projects: profile.active_projects,
    message: `Focus switched to: ${profile.label}`,
  };
}
