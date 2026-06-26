// =====================================================================
// INPUT VALIDATOR
// Validasi prompt SEBELUM dikirim ke model AI.
// Tujuan: cegah biaya API sia-sia, cegah abuse, cegah prompt kosong/junk.
// =====================================================================

export type ValidationResult =
  | { valid: true; sanitized: string }
  | { valid: false; error: string };

const MIN_PROMPT_LENGTH = 2;
const MAX_PROMPT_LENGTH = 4000; // cukup longgar untuk konten kreator, tapi ada batas

// Pola yang mengindikasikan percobaan prompt injection / jailbreak.
// Tidak langsung blokir total (supaya tidak salah tangkap konten legit
// soal "AI" atau "system"), tapi dipakai untuk FLAG + log, bukan hard block,
// kecuali pola yang sangat jelas mencoba override instruksi.
const HARD_BLOCK_PATTERNS = [
  /ignore (all|any|the) (previous|prior|above) (instructions?|prompts?)/i,
  /disregard (all|any|the) (previous|prior|above) (instructions?|rules?)/i,
  /you are now [a-z\s]+(developer mode|dan|jailbreak)/i,
  /reveal (your |the )?system prompt/i,
  /print (your |the )?(system prompt|instructions)/i,
];

export function validateInput(rawPrompt: unknown): ValidationResult {
  if (typeof rawPrompt !== "string") {
    return { valid: false, error: "Prompt harus berupa teks." };
  }

  const trimmed = rawPrompt.trim();

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return { valid: false, error: "Prompt terlalu pendek atau kosong." };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `Prompt terlalu panjang (maks ${MAX_PROMPT_LENGTH} karakter).`,
    };
  }

  for (const pattern of HARD_BLOCK_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn("[input-validator] Blocked suspicious prompt pattern:", pattern);
      return {
        valid: false,
        error: "Prompt tidak dapat diproses. Coba ungkapkan permintaanmu dengan cara lain.",
      };
    }
  }

  return { valid: true, sanitized: trimmed };
}

// =====================================================================
// OUTPUT VALIDATOR
// Validasi hasil dari model AI SEBELUM dikirim ke user.
// Tujuan: cegah respons kosong/rusak, cegah kebocoran system prompt,
// pastikan output tidak melebihi batas wajar.
// =====================================================================

const MAX_OUTPUT_LENGTH = 8000;

export type OutputValidationResult =
  | { valid: true; sanitized: string }
  | { valid: false; error: string };

export function validateOutput(
  rawOutput: unknown,
  systemPrompt: string
): OutputValidationResult {
  if (typeof rawOutput !== "string" || rawOutput.trim().length === 0) {
    return {
      valid: false,
      error: "AI tidak menghasilkan respons. Coba generate ulang.",
    };
  }

  let output = rawOutput.trim();

  // Cegah kebocoran system prompt — kalau model "membocorkan" instruksi
  // internal secara verbatim (>40 karakter sama persis), potong bagian itu.
  const leakCheckLength = 40;
  if (
    systemPrompt.length >= leakCheckLength &&
    output.includes(systemPrompt.slice(0, leakCheckLength))
  ) {
    console.warn("[output-validator] Possible system prompt leak detected");
    return {
      valid: false,
      error: "Terjadi kesalahan pada respons AI. Coba generate ulang.",
    };
  }

  if (output.length > MAX_OUTPUT_LENGTH) {
    output = output.slice(0, MAX_OUTPUT_LENGTH) + "\n\n...(dipotong, terlalu panjang)";
  }

  return { valid: true, sanitized: output };
}