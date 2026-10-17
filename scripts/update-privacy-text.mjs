// translations.js me 10 bhashaon ka privacyDesc naye (sahi) text se badalta hai.
// Chalao: node scripts/update-privacy-text.mjs
import fs from 'node:fs';

const FILE = 'src/utils/translations.js';
const TEXT = [
  // en
  'At Life Box ❤️, your privacy comes first. Without logging in, all your memories, notes, goals and vault items stay only on your own device. If you log in, your data is also saved to your private cloud space linked to your account (Google Firebase) so you can open it on other devices. Only you can access it, and we never sell or share it with anyone.',
  // hi
  'लाइफ बॉक्स ❤️ में आपकी गोपनीयता सबसे पहले है। बिना लॉगिन के आपकी सारी यादें, नोट्स, लक्ष्य और वॉल्ट का डेटा सिर्फ आपके अपने डिवाइस पर रहता है। लॉगिन करने पर आपका डेटा आपके अकाउंट से जुड़ी निजी क्लाउड जगह (Google Firebase) में भी सेव होता है, ताकि आप उसे दूसरे डिवाइस पर खोल सकें। उसे सिर्फ आप देख सकते हैं, और हम उसे कभी बेचते या किसी के साथ साझा नहीं करते।',
  // zh
  '在 Life Box ❤️，您的隐私永远排在第一位。未登录时，您的所有回忆、笔记、目标和保险库内容只保存在您自己的设备上。登录后，您的数据还会保存到与您账号关联的私人云空间（Google Firebase），方便您在其他设备上使用。只有您本人可以访问，我们绝不会出售或与任何人分享。',
  // es
  'En Life Box ❤️, tu privacidad es lo primero. Sin iniciar sesión, tus recuerdos, notas, metas y elementos de la bóveda se guardan solo en tu dispositivo. Si inicias sesión, tus datos también se guardan en tu espacio privado en la nube vinculado a tu cuenta (Google Firebase) para que puedas abrirlos en otros dispositivos. Solo tú puedes acceder a ellos y nunca los vendemos ni los compartimos con nadie.',
  // ja
  'Life Box ❤️ ではプライバシーを最優先にしています。ログインしていない間、思い出・メモ・目標・保管庫のデータはお使いのデバイスにのみ保存されます。ログインすると、他のデバイスでも使えるように、アカウントに紐づく非公開のクラウド領域（Google Firebase）にも保存されます。アクセスできるのはあなただけで、データを販売したり第三者と共有したりすることはありません。',
  // de
  'Bei Life Box ❤️ steht deine Privatsphäre an erster Stelle. Ohne Anmeldung bleiben alle Erinnerungen, Notizen, Ziele und Tresor-Inhalte ausschließlich auf deinem Gerät. Wenn du dich anmeldest, werden deine Daten zusätzlich in deinem privaten, mit deinem Konto verknüpften Cloud-Speicher (Google Firebase) gesichert, damit du sie auf anderen Geräten öffnen kannst. Nur du hast Zugriff, und wir verkaufen oder teilen sie niemals mit Dritten.',
  // fr
  'Chez Life Box ❤️, votre vie privée passe avant tout. Sans connexion, vos souvenirs, notes, objectifs et éléments du coffre restent uniquement sur votre appareil. Si vous vous connectez, vos données sont aussi enregistrées dans votre espace cloud privé lié à votre compte (Google Firebase) afin que vous puissiez les ouvrir sur d’autres appareils. Vous seul y avez accès, et nous ne les vendons ni ne les partageons jamais.',
  // ar
  'في Life Box ❤️ خصوصيتك أولاً. بدون تسجيل الدخول تبقى جميع ذكرياتك وملاحظاتك وأهدافك ومحتويات الخزنة على جهازك فقط. وعند تسجيل الدخول يتم حفظ بياناتك أيضاً في مساحتك السحابية الخاصة المرتبطة بحسابك (Google Firebase) لتتمكن من فتحها على أجهزة أخرى. أنت وحدك من يستطيع الوصول إليها، ولا نبيعها ولا نشاركها مع أي جهة.',
  // ru
  'В Life Box ❤️ ваша конфиденциальность на первом месте. Без входа в аккаунт все ваши воспоминания, заметки, цели и содержимое сейфа хранятся только на вашем устройстве. Если вы входите в аккаунт, данные также сохраняются в вашем личном облачном хранилище, привязанном к аккаунту (Google Firebase), чтобы вы могли открыть их на других устройствах. Доступ есть только у вас, и мы никогда не продаём и не передаём их третьим лицам.',
  // pt
  'No Life Box ❤️, a sua privacidade vem primeiro. Sem iniciar sessão, todas as suas memórias, notas, metas e itens do cofre ficam apenas no seu dispositivo. Se iniciar sessão, os seus dados também são guardados no seu espaço privado na nuvem ligado à sua conta (Google Firebase), para que os possa abrir noutros dispositivos. Só você tem acesso e nunca os vendemos nem os partilhamos com ninguém.',
];
// Pehchaan: har bhasha ki purani line me kya hona chahiye (Latin wali bhashaon ke liye order par bharosa)
const CHECK = [/Life Box/, /[ऀ-ॿ]/, /[一-鿿]/, /./, /[぀-ヿ]/, /./, /./, /[؀-ۿ]/, /[Ѐ-ӿ]/, /./];

const lines = fs.readFileSync(FILE, 'utf8').split('\n');
const idx = lines.map((l, i) => (/^\s*privacyDesc:\s*"/.test(l) ? i : -1)).filter((i) => i >= 0);
if (idx.length !== TEXT.length) throw new Error(`privacyDesc ${idx.length} mile, ${TEXT.length} chahiye. Kuch nahi badla.`);
idx.forEach((i, n) => {
  if (!CHECK[n].test(lines[i])) throw new Error(`Line ${i + 1} ki bhasha order se match nahi hui. Kuch nahi badla.`);
  if (!/^\s*privacyDesc:\s*".*",?\s*$/.test(lines[i])) throw new Error(`Line ${i + 1} ek line me nahi hai. Kuch nahi badla.`);
});
idx.forEach((i, n) => {
  const indent = lines[i].match(/^\s*/)[0];
  lines[i] = `${indent}privacyDesc: "${TEXT[n]}",`;
});
fs.writeFileSync(FILE, lines.join('\n'));
console.log(`${idx.length} bhashaon ka privacyDesc badal diya.`);
