import { cookies, headers } from "next/headers";

export const LANGS = ["ar", "he", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = { ar: "العربية", he: "עברית", en: "English" };

// Times are shown in the business's local time, not the server's.
export const TIME_ZONE = "Asia/Jerusalem";

// Western digits in every language so numbers read the same for everyone.
export const LOCALES: Record<Lang, string> = {
  ar: "ar-u-nu-latn",
  he: "he-IL",
  en: "en-GB",
};

const en = {
  appTagline: "Every work day, counted.",
  appSubtitle: "Check in when you arrive. Your days and pay status, always up to date.",
  createAccountTitle: "Create your account",
  welcomeBack: "Welcome back",
  signupHint: "It takes less than a minute.",
  loginHint: "Log in to check in for today.",
  fullName: "Full name",
  email: "Email",
  phone: "Phone number",
  optional: "(optional)",
  password: "Password",
  createAccount: "Create account",
  logIn: "Log in",
  haveAccount: "Already have an account?",
  newHere: "New here?",
  createAnAccount: "Create an account",
  wrongLogin: "Wrong email or password.",
  emailTaken: "This email already has an account. Please log in.",
  checkEmail: "Check your email to confirm your account, then log in.",
  emailConfirmed: "Your email is confirmed. Please log in.",

  admin: "Admin",
  worker: "Worker",
  account: "Account",
  logOut: "Log out",
  language: "Language",

  today: "Today",
  pendingTitle: "Checked in, waiting for approval",
  pendingText: "Your admin will confirm this day soon.",
  approvedTitle: "Approved",
  approvedText: "This day is counted in your total.",
  rejectedTitle: "Not approved",
  rejectedText: "Talk to your admin if this is a mistake.",
  yourDays: "Your days",
  waitingForApprovalCount: "{n} waiting for approval",
  day: "day",
  days: "days",
  paid: "Paid",
  partlyPaid: "Partly paid",
  notPaidYet: "Not paid yet",
  notPaid: "Not paid",

  noGeolocation: "This phone or browser can't share its location.",
  allowLocation: "Please allow location access so your workplace can be recorded.",
  gettingLocation: "Getting your location…",
  arrived: "I've arrived at work",
  locationSaved: "Your location is saved with your check-in.",
  alreadyCheckedIn: "You already checked in today.",

  waitingForApproval: "Waiting for approval",
  workers: "Workers",
  daysIn: "Days in {month}",
  workersToPay: "Workers to pay",
  allCaughtUp: "All caught up. New check-ins will show up here.",
  allWorkers: "All workers",
  month: "Month",
  show: "Show",
  noWorkers: "No workers have signed up yet.",
  where: "Where",
  waitingCount: "{n} waiting",
  markPaid: "Mark paid",
  markUnpaid: "Mark unpaid",
  couldNotSave: "Could not save:",
  nothingSaved: "Nothing was saved. Refresh the page and try again.",

  checkedInAt: "checked in at {time}",
  seeOnMap: "See location on map",
  noLocation: "No location",
  withinMeters: "within {n} m",
  countsAs: "Counts as",
  oneDay: "1 day",
  oneHalfDays: "1.5 days",
  twoDays: "2 days",
  sitePlaceholder: "Site or address",
  forWhom: "For whom",
  clientPlaceholder: "Client",
  note: "Note",
  notePlaceholder: "What was done",
  approve: "Approve",
  reject: "Reject",
  saveChanges: "Save changes",
  status_pending: "Pending",
  status_approved: "Approved",
  status_rejected: "Rejected",

  daysInMonth: "days in {month}",
  makeAdmin: "Make admin",
  removeAdmin: "Remove admin",
  noCheckinsMonth: "No check-ins this month.",
  noName: "(no name)",
};

export type Dict = typeof en;

const ar: Dict = {
  appTagline: "كل يوم عمل محسوب.",
  appSubtitle: "سجّل حضورك عند الوصول. أيامك وحالة الدفع دائمًا محدّثة.",
  createAccountTitle: "إنشاء حساب جديد",
  welcomeBack: "أهلًا بعودتك",
  signupHint: "يستغرق أقل من دقيقة.",
  loginHint: "سجّل الدخول لتسجيل حضور اليوم.",
  fullName: "الاسم الكامل",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  optional: "(اختياري)",
  password: "كلمة المرور",
  createAccount: "إنشاء حساب",
  logIn: "تسجيل الدخول",
  haveAccount: "لديك حساب؟",
  newHere: "جديد هنا؟",
  createAnAccount: "أنشئ حسابًا",
  wrongLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  emailTaken: "هذا البريد مسجّل مسبقًا. يرجى تسجيل الدخول.",
  checkEmail: "افحص بريدك الإلكتروني لتأكيد الحساب، ثم سجّل الدخول.",
  emailConfirmed: "تم تأكيد بريدك الإلكتروني. يرجى تسجيل الدخول.",

  admin: "مدير",
  worker: "عامل",
  account: "الحساب",
  logOut: "تسجيل الخروج",
  language: "اللغة",

  today: "اليوم",
  pendingTitle: "تم تسجيل الحضور، بانتظار الموافقة",
  pendingText: "سيؤكد المدير هذا اليوم قريبًا.",
  approvedTitle: "تمت الموافقة",
  approvedText: "هذا اليوم محسوب ضمن مجموع أيامك.",
  rejectedTitle: "لم تتم الموافقة",
  rejectedText: "تحدّث مع المدير إذا كان هذا خطأ.",
  yourDays: "أيامك",
  waitingForApprovalCount: "{n} بانتظار الموافقة",
  day: "يوم",
  days: "أيام",
  paid: "مدفوع",
  partlyPaid: "مدفوع جزئيًا",
  notPaidYet: "لم يُدفع بعد",
  notPaid: "غير مدفوع",

  noGeolocation: "هذا الهاتف أو المتصفح لا يستطيع مشاركة الموقع.",
  allowLocation: "يرجى السماح بالوصول إلى الموقع لتسجيل مكان العمل.",
  gettingLocation: "جارٍ تحديد موقعك…",
  arrived: "وصلت إلى العمل",
  locationSaved: "يتم حفظ موقعك مع تسجيل الحضور.",
  alreadyCheckedIn: "لقد سجّلت حضورك اليوم مسبقًا.",

  waitingForApproval: "بانتظار الموافقة",
  workers: "العمال",
  daysIn: "أيام {month}",
  workersToPay: "عمال بانتظار الدفع",
  allCaughtUp: "لا يوجد شيء جديد. ستظهر هنا تسجيلات الحضور الجديدة.",
  allWorkers: "جميع العمال",
  month: "الشهر",
  show: "عرض",
  noWorkers: "لم يسجّل أي عامل بعد.",
  where: "المكان",
  waitingCount: "{n} بالانتظار",
  markPaid: "تحديد كمدفوع",
  markUnpaid: "إلغاء الدفع",
  couldNotSave: "تعذّر الحفظ:",
  nothingSaved: "لم يتم حفظ أي شيء. حدّث الصفحة وحاول مرة أخرى.",

  checkedInAt: "سجّل الحضور الساعة {time}",
  seeOnMap: "عرض الموقع على الخريطة",
  noLocation: "لا يوجد موقع",
  withinMeters: "بدقة {n} م",
  countsAs: "يُحسب كـ",
  oneDay: "يوم واحد",
  oneHalfDays: "يوم ونصف",
  twoDays: "يومان",
  sitePlaceholder: "الموقع أو العنوان",
  forWhom: "لمن",
  clientPlaceholder: "الزبون",
  note: "ملاحظة",
  notePlaceholder: "ما الذي تم إنجازه",
  approve: "موافقة",
  reject: "رفض",
  saveChanges: "حفظ التغييرات",
  status_pending: "بالانتظار",
  status_approved: "تمت الموافقة",
  status_rejected: "مرفوض",

  daysInMonth: "أيام في {month}",
  makeAdmin: "تعيين كمدير",
  removeAdmin: "إزالة صلاحية المدير",
  noCheckinsMonth: "لا توجد تسجيلات حضور هذا الشهر.",
  noName: "(بدون اسم)",
};

const he: Dict = {
  appTagline: "כל יום עבודה נספר.",
  appSubtitle: "מחתימים כניסה כשמגיעים. הימים ומצב התשלום שלך תמיד מעודכנים.",
  createAccountTitle: "יצירת חשבון",
  welcomeBack: "ברוך שובך",
  signupHint: "זה לוקח פחות מדקה.",
  loginHint: "התחבר כדי להחתים כניסה להיום.",
  fullName: "שם מלא",
  email: "אימייל",
  phone: "מספר טלפון",
  optional: "(לא חובה)",
  password: "סיסמה",
  createAccount: "יצירת חשבון",
  logIn: "התחברות",
  haveAccount: "כבר יש לך חשבון?",
  newHere: "חדש כאן?",
  createAnAccount: "צור חשבון",
  wrongLogin: "אימייל או סיסמה שגויים.",
  emailTaken: "לאימייל הזה כבר יש חשבון. נא להתחבר.",
  checkEmail: "בדוק את האימייל שלך כדי לאשר את החשבון, ואז התחבר.",
  emailConfirmed: "האימייל שלך אושר. נא להתחבר.",

  admin: "מנהל",
  worker: "עובד",
  account: "חשבון",
  logOut: "התנתקות",
  language: "שפה",

  today: "היום",
  pendingTitle: "נכנסת, ממתין לאישור",
  pendingText: "המנהל יאשר את היום הזה בקרוב.",
  approvedTitle: "אושר",
  approvedText: "היום הזה נספר בסך הימים שלך.",
  rejectedTitle: "לא אושר",
  rejectedText: "דבר עם המנהל אם זו טעות.",
  yourDays: "הימים שלך",
  waitingForApprovalCount: "{n} ממתינים לאישור",
  day: "יום",
  days: "ימים",
  paid: "שולם",
  partlyPaid: "שולם חלקית",
  notPaidYet: "עדיין לא שולם",
  notPaid: "לא שולם",

  noGeolocation: "הטלפון או הדפדפן הזה לא יכול לשתף מיקום.",
  allowLocation: "נא לאפשר גישה למיקום כדי לתעד את מקום העבודה.",
  gettingLocation: "מאתר את המיקום שלך…",
  arrived: "הגעתי לעבודה",
  locationSaved: "המיקום שלך נשמר יחד עם הכניסה.",
  alreadyCheckedIn: "כבר החתמת כניסה היום.",

  waitingForApproval: "ממתינים לאישור",
  workers: "עובדים",
  daysIn: "ימים ב{month}",
  workersToPay: "עובדים לתשלום",
  allCaughtUp: "אין משהו חדש. כניסות חדשות יופיעו כאן.",
  allWorkers: "כל העובדים",
  month: "חודש",
  show: "הצג",
  noWorkers: "עדיין לא נרשמו עובדים.",
  where: "איפה",
  waitingCount: "{n} ממתינים",
  markPaid: "סמן כשולם",
  markUnpaid: "בטל תשלום",
  couldNotSave: "לא ניתן לשמור:",
  nothingSaved: "שום דבר לא נשמר. רענן את הדף ונסה שוב.",

  checkedInAt: "נכנס בשעה {time}",
  seeOnMap: "הצג מיקום במפה",
  noLocation: "אין מיקום",
  withinMeters: "בדיוק של {n} מ׳",
  countsAs: "נספר כ־",
  oneDay: "יום אחד",
  oneHalfDays: "יום וחצי",
  twoDays: "יומיים",
  sitePlaceholder: "אתר או כתובת",
  forWhom: "עבור מי",
  clientPlaceholder: "לקוח",
  note: "הערה",
  notePlaceholder: "מה נעשה",
  approve: "אישור",
  reject: "דחייה",
  saveChanges: "שמירת שינויים",
  status_pending: "ממתין",
  status_approved: "אושר",
  status_rejected: "נדחה",

  daysInMonth: "ימים ב{month}",
  makeAdmin: "הפוך למנהל",
  removeAdmin: "הסר הרשאת מנהל",
  noCheckinsMonth: "אין כניסות החודש.",
  noName: "(ללא שם)",
};

export const DICTS: Record<Lang, Dict> = { en, ar, he };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

// The language from the "lang" cookie, else the browser's preference, else Arabic.
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get("lang")?.value;
  if (isLang(saved)) return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (code === "iw") return "he";
    if (isLang(code)) return code;
  }
  return "ar";
}

export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export async function getI18n() {
  const lang = await getLang();
  return { lang, t: DICTS[lang], locale: LOCALES[lang], dir: lang === "en" ? "ltr" : "rtl" } as const;
}
