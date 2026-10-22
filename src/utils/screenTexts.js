// 6 screens (AI, Life Meter, Memories, Notes, Voices, Goals) ke shabd + theme ke rang.
// Kisi language me shabd na mile to English dikhta hai. Nayi language: neeche us code ka naya block jodo.
import { useApp } from '../context/AppContext';

const en = {
  // common
  save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', share: 'Share', download: 'Download', loading: 'Loading...',
  copied: 'Copied to clipboard', binMoved: 'Moved to Bin', binFail: 'Could not move to Bin. Phone storage is full.',
  // AI chat
  aiTitle: 'AI Life Assistant', aiMode: 'Life Box Pro Mode', aiHey: 'Hey! 👋', aiFriend: "I'm your Life Box friend",
  aiChatAny: 'Chat with me about anything.', aiReport: 'Report this reply', aiReported: 'Reported. Thank you!', aiSending: 'Sending...',
  aiRetry: 'Could not send. Tap to retry', aiReportConfirm: 'Report this AI reply as harmful or incorrect?', aiPhoto: 'Photo attached',
  aiGetPro: 'Get Pro', aiSeePlans: 'See plans', aiPh: 'Ask me anything...', aiHistory: 'Chat history', aiNewChat: 'New chat',
  aiNoChats: 'No chats yet. Say hi to start one!', aiDeleteChat: 'Delete this chat?',
  // Notes
  nTitle: 'Life Box Notes', nSecure: 'Your secure personal notepad', nOne: 'note', nMany: 'notes', nFav: 'favourite',
  nSearch: 'Search notes...', nAll: '🌸 All', nFavChip: '⭐ Favourites', nSecFav: '⭐ FAVOURITES', nSecAll: 'ALL NOTES',
  nNoFav: 'No favourites yet', nNone: 'No notes yet', nNothing: 'Nothing found', nTapStar: 'Tap the star on a note to pin it to the top.',
  nTapPlus: 'Tap + to write your first note!', nTry: 'Try another word.', nEditT: 'Edit Note', nNewT: 'New Note',
  nTitlePh: 'Note title...', nBodyPh: 'Write your note details here...', words: 'words', chars: 'characters',
  nSaved: 'Note saved', nWriteFirst: 'Write something first', nFavAdd: 'Added to favourites ⭐', nFavDel: 'Removed from favourites',
  nFull: '⚠️ Phone storage for the app is full. Your latest change may not be saved. Delete some old notes or memories.',
  // Memories
  mTitle: 'Memories Vault', mCherish: 'Cherish your special moments', mCount1: '{n} memory saved', mCountN: '{n} memories saved',
  mSearch: 'Search memories or tags...', tAll: 'All', tMilestone: 'Milestone', tFriends: 'Friends & Love', tProject: 'Project / Code', tSpecial: 'Special Moment',
  mNone: 'No memories yet', mNothing: 'Nothing found', mTapPlus: 'Tap + to save your first moment!', mTry: 'Try another word or tag.',
  mEditT: 'Edit Memory', mNewT: 'New Memory', mTitlePh: 'Memory title...', mAdd: 'Tap to add a photo or video',
  mHint: 'Photos are shrunk automatically. Videos up to 30 MB.', mRemove: 'Remove photo / video', mDescPh: 'Write about this memory...',
  mErrBig: 'This video is too big. Please pick a video under 30 MB.', mErrRead: "Couldn't read this file. Please try another one.",
  mErrTitle: 'Please add a title for your memory.', mErrSave: "Couldn't save this file on your phone. Please try a smaller photo.",
  mFull: '⚠️ Phone storage for the app is full. Your latest change may not be saved. Delete some old memories or use smaller photos/videos.',
  // Life Meter
  lTitle: 'Life Meter', lSub: 'Your life in numbers', lHistory: 'History', lBorn: 'Born {d}', lEntries: '{n} saved',
  lEnter: 'Enter date of birth', lSee: 'See how much life you have lived.', lName: 'Name (optional)', lDone: 'Done',
  lErrDob: 'Please choose a valid date of birth.', lErrFuture: "Date of birth can't be in the future.", lAge: 'AGE', lBornOn: 'Born on a {w}',
  lHb: 'Happy Birthday! 🎉', lNextB: 'Next birthday in {n}', lFoot: 'Some figures are calculated from average human values.',
  lNothing: 'Nothing here yet', lNothingSub: 'Every date of birth you check will show up here.', lDelQ: 'Delete this entry?', lUndo: "This can't be undone.", lDeleted: 'Deleted',
  yOne: 'year', yMany: 'years', moOne: 'month', moMany: 'months', dOne: 'day', dMany: 'days', eOne: 'entry', eMany: 'entries',
  sDays: 'Days lived', sWeeks: 'Weeks', sMonths: 'Months', sHours: 'Hours', sMin: 'Minutes', sSec: 'Seconds', sHeart: 'Heartbeats', sBreath: 'Breaths',
  sBlink: 'Eye blinks', sSteps: 'Steps', sDist: 'Distance', sEarth: '{n}x around the Earth', sWater: 'Water drunk', sFood: 'Food eaten', sSleep: 'Time asleep', sSleepY: '{n} years', sMoon: 'Full moons',
  lShHead: '🎂 Life Meter', lShBorn: 'Born: {d} ({w})', lShAge: 'Age: {a}', lShDays: '📅 Days lived: {v}', lShHours: '⏰ Hours: {v}', lShHeart: '❤️ Heartbeats: {v}',
  lShBreath: '🌬️ Breaths: {v}', lShSteps: '👣 Steps: {v}', lShWater: '💧 Water drunk: {v} L', lShFood: '🍽️ Food eaten: {v} kg', lShMade: 'Made with Life Box',
  // Voices
  vTitle: 'Life Box Voices', vSub: 'Your uploaded audio & ideas', vSearch: 'Search voice thoughts...', vNone: 'No audio files found. Tap + to upload one!',
  vAudio: 'Audio File', vNow: 'Now Playing', vAdded: 'Added on {d}', vClose: 'Close Player', vUpload: 'Upload Audio File', vAdding: 'Adding your voice...',
  vSelect: 'Tap to select audio file from phone', vFmt: 'MP3, WAV, AAC supported',
  vTip: 'Short clips of a few MB save best. If your phone storage is full, delete old voices first.',
  vBig: '⚠️ This file is too big. Please pick one under 50 MB.', vNoSave: '⚠️ Could not save this file on your phone.',
  vFull: '⚠️ Storage is full. Try a smaller file or delete old voices.', vAddedT: '🎧 Voice added to your vault.', vBinned: '🗑️ Voice moved to Bin.',
  vBinFail: '⚠️ Could not move to Bin. Storage is full, free some space first.', vPlayErr: '⚠️ Playback error: Unable to play audio source.',
  vShare: 'Check out my voice note: {t}',
  // Goals
  gTitle: 'Life Box Goals', gSub: 'Small days, built into big streaks', gSearch: 'Search goals...', gActive: 'Active ({n})', gDoneTab: 'Completed ({n})',
  gNone: 'No goals yet. Tap + and start your first streak.', gNoMatch: 'No active goals match your search.', gFinished: 'Finished goals will show up here.',
  gCompleted: 'Completed', gMissed1: '⚠️ {n} day missed', gMissedN: '⚠️ {n} days missed', gStreak: '{n}-day streak', gReady: 'Ready when it opens', gDoneCount: 'Done: {a}/{b}',
  gNew: 'New goal', gWhat: 'What do you want to do every day?', gWhatPh: 'e.g. Gym at 6:35 AM', gUnlock: 'Unlock time',
  gUnlockSub: 'Your daily log opens at this time, not a minute earlier.', gPrep: 'Prep reminder',
  gPrepSub: 'A phone notification to get you ready. Must be earlier than the unlock time.', gStart: 'Start date',
  gStartSub: 'The goal keeps running month after month until you finish it.',
  gInfo: 'You will get a prep reminder at {a}, the log unlocks at {b}, and if you skip a day you will get a missed alert at 11:55 PM.',
  gFinishQ: 'Finish this goal?', gDeleteQ: 'Delete this goal?',
  gFinishSub: 'Daily unlock, missed banners and reminders will stop. Your history stays saved under Completed.',
  gDeleteSub: 'It moves to your Bin. Daily unlock and reminders will stop.', gFinish: 'Finish',
  gTOnlyToday: '🔒 Only today can be logged.', gTOpens: '🔒 This goal opens today at {t}.', gTNote: '✍️ Write a short note about today.',
  gTSaved: '✅ Progress saved. Keep going!', gTName: '✍️ Give your goal a name.', gTTimes: '⏰ Choose both times.',
  gTEarlier: '⚠️ Reminder time must be earlier than the unlock time.', gTCreated: '🎯 Goal created. Your first day is waiting.',
  gTBin: '🗑️ Goal moved to Bin.', gTDone: '🏆 Goal completed. Reminders are off.',
  // Goal detail + Help/Feedback/About/Legal
  gdConsistency: 'consistency', gdFinish: 'Finish', gdOpens: 'Opens daily at', gdReminder: 'Reminder at', gdStarted: 'Started',
  gdStreak: 'Current streak', gdBest: 'Best streak', gdDays: 'Days done', gdCompleted: 'Goal completed',
  gdFinishedOn: 'Finished on {d}. Daily unlock, missed banners and reminders are switched off.',
  gdMonthLogged: '{a} of {b} days logged', gdEach: 'Each day opens at {t} and locks again as soon as you save.',
  gdStarts: 'This goal starts on {d}. Your first day opens at {t}.', gdNoDays: 'No days to show for this month.',
  gdDay: 'Day {n}', gdDone: 'Done', gdMissed: 'Missed', gdOpen: 'Open now', gdNotLogged: 'Not logged', gdLocked: 'Locked',
  gdSavedAt: 'Saved at {t}', gdMissedMsg: 'You missed this day. Tomorrow is a fresh start.',
  gdPh: 'How did it go today? e.g. Crushed leg day 💪', gdSaveToday: 'Save today’s progress', gdOpensToday: 'Opens today at {t}.',
  zLastUpd: 'Last updated: {d}', zLegalNote: '',
  zTermsBadge: 'User Guidelines & Agreement', zLegalBadge: 'Intellectual Property & Services',
  zPrivBadge: 'Local-first, private cloud after login', zAboutBadge: 'Your life, organised', zDevBy: 'Developed by Radhe Rocky Star',
  zFbThanks: 'Thank you! ❤️', zFbReached: 'Your feedback has reached the developer. We read every message and use it to make Life Box better.',
  zFbAnother: 'Send another', zFbIntro: 'Tell us what you love, what is not working, or what you would like to see next. Your feedback is sent privately to the developer.',
  zFbSuggestion: 'Suggestion', zFbBug: 'Bug', zFbCompliment: 'Compliment', zFbOther: 'Other',
  zFbPh: 'Write your feedback...', zFbEmailPh: 'Your email (optional, only if you want a reply)', zFbSending: 'Sending...', zFbSubmit: 'Submit',
  zFbNote: 'Please don’t include passwords or sensitive information. See our Privacy Policy for how feedback is handled.',
  zFbShort: 'Please write a little more (at least 10 characters).', zFbWait: 'Please wait a few seconds before sending again.',
  zFbNA: "Feedback isn't available right now. Please contact us from Help & Contact.",
  zFbFail: "We couldn't send your feedback. Please try again in a moment.", zFbNet: "Couldn't send. Please check your internet connection and try again.",
  zHelpNeed: 'Need help? Talk to us', zHelpSub: 'Have a question, a problem or an idea? Tap a button below to reach the developer directly. We read every message.',
  zHelpEmail: 'Email us', zHelpReply: 'We usually reply within a few days. For faster help with a problem, include your phone model, Android version and a screenshot.',
  zHelpFaq: 'Frequently asked questions',
  // Memories book: crop, text style, text limit
  tsClassic: 'Classic', tsElegant: 'Elegant', tsHand: 'Handwritten', tsStory: 'Storybook', tsType: 'Typewriter', tsModern: 'Modern', tsRomantic: 'Romantic', tsDeco: 'Art Deco',
  mSpreadView: 'Open book (2 pages)', mSingleView: 'One page (bigger)', mRotateHint: 'Turn your phone sideways for a bigger book',
  mDownload: 'Download book as PDF', cvLabel: 'Cover colour', cvHint: 'Pick the colour of your album cover.', cvWhite: 'White', cvBlack: 'Black', cvRed: 'Red', cvPurple: 'Purple', cvPink: 'Pink', pdfMaking: 'Making your book PDF…', pdfPleaseWait: 'Please wait, this can take a few seconds.', pdfSaved: 'Your book is saved as a PDF.\n\nFolder: {path}', pdfFail: 'Could not make the PDF. Please try again.',
  mStyleLabel: 'Text style', mStyleHint: 'Your words on every book page will be written in this style.',
  mStyleSample: 'Every little moment becomes a beautiful memory forever',
  mCapHint: 'Half goes above the photo, half below', mCapCount: '{a}/{b} words',
  mCrop: 'Crop', mCropTitle: 'Crop photo', mCropSub: 'Drag the box. What you see fills the page.', mCropApply: 'Apply',
  mCropRotate: 'Rotate', mCropReset: 'Reset', mRatioPage: 'Page', mRatioFree: 'Free',
};

const hi = {
  save: 'सेव करें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'बदलें', share: 'शेयर', download: 'डाउनलोड', loading: 'लोड हो रहा है...',
  copied: 'क्लिपबोर्ड में कॉपी हुआ', binMoved: 'बिन में भेजा', binFail: 'बिन में नहीं भेज पाए। फोन की स्टोरेज भरी है।',
  aiTitle: 'एआई लाइफ असिस्टेंट', aiMode: 'लाइफ बॉक्स प्रो मोड', aiHey: 'नमस्ते! 👋', aiFriend: 'मैं आपका लाइफ बॉक्स दोस्त हूँ',
  aiChatAny: 'मुझसे किसी भी बारे में बात करें।', aiReport: 'इस जवाब की रिपोर्ट करें', aiReported: 'रिपोर्ट हो गई। धन्यवाद!', aiSending: 'भेज रहे हैं...',
  aiRetry: 'भेज नहीं पाए। दोबारा दबाएं', aiReportConfirm: 'इस एआई जवाब को हानिकारक या गलत बताकर रिपोर्ट करें?', aiPhoto: 'फोटो जुड़ गई',
  aiGetPro: 'प्रो लें', aiSeePlans: 'प्लान देखें', aiPh: 'कुछ भी पूछें...', aiHistory: 'चैट हिस्ट्री', aiNewChat: 'नई चैट',
  aiNoChats: 'अभी कोई चैट नहीं। नमस्ते कहकर शुरू करें!', aiDeleteChat: 'यह चैट हटाएं?',
  nTitle: 'लाइफ बॉक्स नोट्स', nSecure: 'आपकी सुरक्षित निजी नोटबुक', nOne: 'नोट', nMany: 'नोट्स', nFav: 'पसंदीदा',
  nSearch: 'नोट्स खोजें...', nAll: '🌸 सभी', nFavChip: '⭐ पसंदीदा', nSecFav: '⭐ पसंदीदा', nSecAll: 'सभी नोट्स',
  nNoFav: 'अभी कोई पसंदीदा नहीं', nNone: 'अभी कोई नोट नहीं', nNothing: 'कुछ नहीं मिला', nTapStar: 'किसी नोट का स्टार दबाकर उसे ऊपर लगाएं।',
  nTapPlus: 'पहला नोट लिखने के लिए + दबाएं!', nTry: 'कोई और शब्द आज़माएं।', nEditT: 'नोट बदलें', nNewT: 'नया नोट',
  nTitlePh: 'नोट का शीर्षक...', nBodyPh: 'अपने नोट की बातें यहाँ लिखें...', words: 'शब्द', chars: 'अक्षर',
  nSaved: 'नोट सेव हो गया', nWriteFirst: 'पहले कुछ लिखें', nFavAdd: 'पसंदीदा में जोड़ा ⭐', nFavDel: 'पसंदीदा से हटाया',
  nFull: '⚠️ ऐप की फोन स्टोरेज भर गई है। आपका ताज़ा बदलाव सेव नहीं हो पाया होगा। कुछ पुराने नोट्स या यादें हटाएं।',
  mTitle: 'यादों की तिजोरी', mCherish: 'अपने खास पलों को सहेजें', mCount1: '{n} याद सेव', mCountN: '{n} यादें सेव',
  mSearch: 'यादें या टैग खोजें...', tAll: 'सभी', tMilestone: 'उपलब्धि', tFriends: 'दोस्त और प्यार', tProject: 'प्रोजेक्ट / कोड', tSpecial: 'खास पल',
  mNone: 'अभी कोई याद नहीं', mNothing: 'कुछ नहीं मिला', mTapPlus: 'पहला पल सहेजने के लिए + दबाएं!', mTry: 'कोई और शब्द या टैग आज़माएं।',
  mEditT: 'याद बदलें', mNewT: 'नई याद', mTitlePh: 'याद का शीर्षक...', mAdd: 'फोटो या वीडियो जोड़ने के लिए दबाएं',
  mHint: 'फोटो अपने आप छोटी हो जाती है। वीडियो 30 MB तक।', mRemove: 'फोटो / वीडियो हटाएं', mDescPh: 'इस याद के बारे में लिखें...',
  mErrBig: 'यह वीडियो बहुत बड़ा है। 30 MB से छोटा वीडियो चुनें।', mErrRead: 'यह फाइल पढ़ नहीं पाए। कोई और फाइल चुनें।',
  mErrTitle: 'कृपया अपनी याद का शीर्षक लिखें।', mErrSave: 'यह फाइल फोन में सेव नहीं हो पाई। छोटी फोटो चुनें।',
  mFull: '⚠️ ऐप की फोन स्टोरेज भर गई है। आपका ताज़ा बदलाव सेव नहीं हो पाया होगा। कुछ पुरानी यादें हटाएं या छोटी फोटो/वीडियो लें।',
  lTitle: 'लाइफ मीटर', lSub: 'आपकी ज़िंदगी, आँकड़ों में', lHistory: 'हिस्ट्री', lBorn: 'जन्म {d}', lEntries: '{n} सेव',
  lEnter: 'जन्म तारीख डालें', lSee: 'देखें आपने कितनी ज़िंदगी जी है।', lName: 'नाम (वैकल्पिक)', lDone: 'हो गया',
  lErrDob: 'कृपया सही जन्म तारीख चुनें।', lErrFuture: 'जन्म तारीख आने वाले समय की नहीं हो सकती।', lAge: 'उम्र', lBornOn: 'जन्म: {w}',
  lHb: 'जन्मदिन मुबारक! 🎉', lNextB: 'अगला जन्मदिन {n} में', lFoot: 'कुछ आँकड़े इंसानों के औसत मानों से निकाले गए हैं।',
  lNothing: 'यहाँ अभी कुछ नहीं', lNothingSub: 'आप जो भी जन्म तारीख देखेंगे, वह यहाँ दिखेगी।', lDelQ: 'यह एंट्री हटाएं?', lUndo: 'यह वापस नहीं हो सकता।', lDeleted: 'हटा दिया',
  yOne: 'साल', yMany: 'साल', moOne: 'महीना', moMany: 'महीने', dOne: 'दिन', dMany: 'दिन', eOne: 'एंट्री', eMany: 'एंट्री',
  sDays: 'जिए दिन', sWeeks: 'हफ्ते', sMonths: 'महीने', sHours: 'घंटे', sMin: 'मिनट', sSec: 'सेकंड', sHeart: 'दिल की धड़कनें', sBreath: 'साँसें',
  sBlink: 'पलकें झपकीं', sSteps: 'कदम', sDist: 'दूरी', sEarth: 'धरती के {n} चक्कर', sWater: 'पिया हुआ पानी', sFood: 'खाया हुआ खाना', sSleep: 'सोने में बिताया समय', sSleepY: '{n} साल', sMoon: 'पूर्णिमा',
  lShHead: '🎂 लाइफ मीटर', lShBorn: 'जन्म: {d} ({w})', lShAge: 'उम्र: {a}', lShDays: '📅 जिए दिन: {v}', lShHours: '⏰ घंटे: {v}', lShHeart: '❤️ धड़कनें: {v}',
  lShBreath: '🌬️ साँसें: {v}', lShSteps: '👣 कदम: {v}', lShWater: '💧 पिया पानी: {v} L', lShFood: '🍽️ खाया खाना: {v} kg', lShMade: 'लाइफ बॉक्स से बनाया',
  vTitle: 'लाइफ बॉक्स आवाज़', vSub: 'आपकी अपलोड की ऑडियो और विचार', vSearch: 'आवाज़ खोजें...', vNone: 'कोई ऑडियो फाइल नहीं मिली। अपलोड करने के लिए + दबाएं!',
  vAudio: 'ऑडियो फाइल', vNow: 'अब चल रहा है', vAdded: 'जोड़ा गया: {d}', vClose: 'प्लेयर बंद करें', vUpload: 'ऑडियो फाइल अपलोड करें', vAdding: 'आपकी आवाज़ जोड़ रहे हैं...',
  vSelect: 'फोन से ऑडियो फाइल चुनने के लिए दबाएं', vFmt: 'MP3, WAV, AAC चलेंगे',
  vTip: 'कुछ MB की छोटी क्लिप सबसे अच्छी सेव होती हैं। फोन की स्टोरेज भरी हो तो पहले पुरानी आवाज़ें हटाएं।',
  vBig: '⚠️ यह फाइल बहुत बड़ी है। 50 MB से छोटी फाइल चुनें।', vNoSave: '⚠️ यह फाइल फोन में सेव नहीं हो पाई।',
  vFull: '⚠️ स्टोरेज भर गई है। छोटी फाइल लें या पुरानी आवाज़ें हटाएं।', vAddedT: '🎧 आवाज़ आपकी तिजोरी में जुड़ गई।', vBinned: '🗑️ आवाज़ बिन में भेजी गई।',
  vBinFail: '⚠️ बिन में नहीं भेज पाए। स्टोरेज भरी है, पहले जगह बनाएं।', vPlayErr: '⚠️ चलाने में दिक्कत: ऑडियो नहीं चल पाई।',
  vShare: 'मेरा वॉइस नोट सुनें: {t}',
  gTitle: 'लाइफ बॉक्स लक्ष्य', gSub: 'छोटे दिन, बड़ी स्ट्रीक', gSearch: 'लक्ष्य खोजें...', gActive: 'चालू ({n})', gDoneTab: 'पूरे हुए ({n})',
  gNone: 'अभी कोई लक्ष्य नहीं। + दबाकर अपनी पहली स्ट्रीक शुरू करें।', gNoMatch: 'आपकी खोज से कोई चालू लक्ष्य नहीं मिला।', gFinished: 'पूरे हुए लक्ष्य यहाँ दिखेंगे।',
  gCompleted: 'पूरा हुआ', gMissed1: '⚠️ {n} दिन छूटा', gMissedN: '⚠️ {n} दिन छूटे', gStreak: '{n} दिन की स्ट्रीक', gReady: 'खुलने पर तैयार', gDoneCount: 'पूरा: {a}/{b}',
  gNew: 'नया लक्ष्य', gWhat: 'आप रोज़ क्या करना चाहते हैं?', gWhatPh: 'जैसे: सुबह 6:35 बजे जिम', gUnlock: 'खुलने का समय',
  gUnlockSub: 'आपका रोज़ का लॉग इसी समय खुलेगा, एक मिनट पहले नहीं।', gPrep: 'तैयारी की याद दिलाना',
  gPrepSub: 'तैयार होने के लिए फोन नोटिफिकेशन। यह खुलने के समय से पहले होना चाहिए।', gStart: 'शुरू होने की तारीख',
  gStartSub: 'लक्ष्य पूरा करने तक यह महीने दर महीने चलता रहेगा।',
  gInfo: 'आपको {a} बजे तैयारी की याद मिलेगी, लॉग {b} बजे खुलेगा, और अगर कोई दिन छूटा तो रात 11:55 बजे छूटने का अलर्ट आएगा।',
  gFinishQ: 'यह लक्ष्य पूरा करें?', gDeleteQ: 'यह लक्ष्य हटाएं?',
  gFinishSub: 'रोज़ का खुलना, छूटे दिनों के बैनर और याद दिलाना बंद हो जाएंगे। आपका इतिहास "पूरे हुए" में सेव रहेगा।',
  gDeleteSub: 'यह आपके बिन में चला जाएगा। रोज़ का खुलना और याद दिलाना बंद हो जाएगा।', gFinish: 'पूरा करें',
  gTOnlyToday: '🔒 सिर्फ आज का दिन दर्ज हो सकता है।', gTOpens: '🔒 यह लक्ष्य आज {t} बजे खुलेगा।', gTNote: '✍️ आज के बारे में छोटा नोट लिखें।',
  gTSaved: '✅ प्रगति सेव हो गई। लगे रहें!', gTName: '✍️ अपने लक्ष्य का नाम लिखें।', gTTimes: '⏰ दोनों समय चुनें।',
  gTEarlier: '⚠️ याद दिलाने का समय खुलने के समय से पहले होना चाहिए।', gTCreated: '🎯 लक्ष्य बन गया। आपका पहला दिन इंतज़ार कर रहा है।',
  gTBin: '🗑️ लक्ष्य बिन में भेजा गया।', gTDone: '🏆 लक्ष्य पूरा हुआ। याद दिलाना बंद है।',
  // Goal detail + Help/Feedback/About/Legal
  gdConsistency: 'निरंतरता', gdFinish: 'पूरा करें', gdOpens: 'रोज़ खुलता है', gdReminder: 'याद दिलाना', gdStarted: 'शुरू हुआ',
  gdStreak: 'मौजूदा स्ट्रीक', gdBest: 'सबसे अच्छी स्ट्रीक', gdDays: 'पूरे दिन', gdCompleted: 'लक्ष्य पूरा हुआ',
  gdFinishedOn: '{d} को पूरा हुआ। रोज़ का खुलना, छूटे दिनों के बैनर और याद दिलाना बंद हैं।',
  gdMonthLogged: '{b} में से {a} दिन दर्ज', gdEach: 'हर दिन {t} बजे खुलता है और सेव करते ही फिर बंद हो जाता है।',
  gdStarts: 'यह लक्ष्य {d} को शुरू होगा। आपका पहला दिन {t} बजे खुलेगा।', gdNoDays: 'इस महीने दिखाने के लिए कोई दिन नहीं।',
  gdDay: 'दिन {n}', gdDone: 'पूरा', gdMissed: 'छूटा', gdOpen: 'अभी खुला है', gdNotLogged: 'दर्ज नहीं', gdLocked: 'बंद',
  gdSavedAt: '{t} पर सेव हुआ', gdMissedMsg: 'यह दिन छूट गया। कल नई शुरुआत है।',
  gdPh: 'आज कैसा रहा? जैसे: आज जमकर वर्कआउट किया 💪', gdSaveToday: 'आज की प्रगति सेव करें', gdOpensToday: 'आज {t} बजे खुलेगा।',
  zLastUpd: 'आखिरी अपडेट: {d}', zLegalNote: 'कानूनी दस्तावेज़ अंग्रेज़ी में हैं, ताकि उनका अर्थ बिल्कुल सटीक रहे।',
  zTermsBadge: 'उपयोग के नियम और सहमति', zLegalBadge: 'बौद्धिक संपदा और सेवाएँ',
  zPrivBadge: 'पहले आपके फ़ोन में, लॉगिन के बाद निजी क्लाउड', zAboutBadge: 'आपकी ज़िंदगी, सलीके से', zDevBy: 'डेवलपर: राधे रॉकी स्टार',
  zFbThanks: 'धन्यवाद! ❤️', zFbReached: 'आपका फ़ीडबैक डेवलपर तक पहुँच गया है। हम हर संदेश पढ़ते हैं और Life Box को बेहतर बनाने में उसका उपयोग करते हैं।',
  zFbAnother: 'एक और भेजें', zFbIntro: 'बताइए आपको क्या पसंद है, क्या काम नहीं कर रहा, या आगे क्या देखना चाहेंगे। आपका फ़ीडबैक सीधे डेवलपर को निजी तौर पर जाता है।',
  zFbSuggestion: 'सुझाव', zFbBug: 'बग', zFbCompliment: 'तारीफ़', zFbOther: 'अन्य',
  zFbPh: 'अपना फ़ीडबैक लिखें...', zFbEmailPh: 'आपका ईमेल (वैकल्पिक, सिर्फ़ जवाब चाहिए तो)', zFbSending: 'भेज रहे हैं...', zFbSubmit: 'भेजें',
  zFbNote: 'कृपया पासवर्ड या संवेदनशील जानकारी न लिखें। फ़ीडबैक कैसे संभाला जाता है, यह हमारी प्राइवेसी पॉलिसी में देखें।',
  zFbShort: 'कृपया थोड़ा और लिखें (कम से कम 10 अक्षर)।', zFbWait: 'दोबारा भेजने से पहले कुछ सेकंड रुकें।',
  zFbNA: 'फ़ीडबैक अभी उपलब्ध नहीं है। कृपया Help & Contact से हमसे संपर्क करें।',
  zFbFail: 'आपका फ़ीडबैक नहीं भेज पाए। कृपया थोड़ी देर बाद फिर कोशिश करें।', zFbNet: 'भेज नहीं पाए। कृपया इंटरनेट जाँचकर फिर कोशिश करें।',
  zHelpNeed: 'मदद चाहिए? हमसे बात करें', zHelpSub: 'कोई सवाल, समस्या या आइडिया है? नीचे का बटन दबाकर सीधे डेवलपर तक पहुँचें। हम हर संदेश पढ़ते हैं।',
  zHelpEmail: 'ईमेल करें', zHelpReply: 'हम आमतौर पर कुछ दिनों में जवाब देते हैं। जल्दी मदद के लिए अपने फ़ोन का मॉडल, Android वर्ज़न और स्क्रीनशॉट भेजें।',
  zHelpFaq: 'अक्सर पूछे जाने वाले सवाल',
  // Memories book: crop, text style, text limit
  tsClassic: 'क्लासिक', tsElegant: 'एलिगेंट', tsHand: 'हाथ की लिखावट', tsStory: 'स्टोरीबुक', tsType: 'टाइपराइटर', tsModern: 'मॉडर्न', tsRomantic: 'रोमांटिक', tsDeco: 'आर्ट डेको',
  mSpreadView: 'खुली किताब (2 पन्ने)', mSingleView: 'एक पन्ना (बड़ा)', mRotateHint: 'बड़ी किताब देखने के लिए फोन आड़ा करें',
  mDownload: 'किताब PDF में डाउनलोड करें', cvLabel: 'कवर का रंग', cvHint: 'अपने एल्बम के कवर का रंग चुनिए।', cvWhite: 'सफ़ेद', cvBlack: 'काला', cvRed: 'लाल', cvPurple: 'बैंगनी', cvPink: 'गुलाबी', pdfMaking: 'आपकी किताब की PDF बन रही है…', pdfPleaseWait: 'कृपया रुकिए, कुछ सेकंड लग सकते हैं।', pdfSaved: 'आपकी किताब PDF के रूप में सेव हो गई।\n\nफ़ोल्डर: {path}', pdfFail: 'PDF नहीं बन पाई। कृपया फिर कोशिश करें।',
  mStyleLabel: 'लिखावट का अंदाज़', mStyleHint: 'किताब के हर पन्ने पर आपके शब्द इसी अंदाज़ में लिखे जाएंगे।',
  mStyleSample: 'हर छोटा पल हमेशा के लिए एक खूबसूरत याद बन जाता है',
  mCapHint: 'आधा फोटो के ऊपर, आधा नीचे आएगा', mCapCount: '{a}/{b} शब्द',
  mCrop: 'क्रॉप', mCropTitle: 'फोटो क्रॉप करें', mCropSub: 'डिब्बा खिसकाएं। जो दिखे वही पन्ने पर भर जाएगा।', mCropApply: 'लगाएं',
  mCropRotate: 'घुमाएं', mCropReset: 'रीसेट', mRatioPage: 'पन्ना', mRatioFree: 'खुला',
};

export const SCREEN_TEXTS = { en, hi };

const fill = (str, vars) => String(str).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));

// st('key', {n: 3}) -> current language ka text (na mile to English)
export function useScreenT() {
  const { c, currentLang } = useApp();
  const dict = SCREEN_TEXTS[currentLang] || {};
  const st = (key, vars) => fill(dict[key] ?? en[key] ?? key, vars);
  const loc = (currentLang || 'en') + '-u-nu-latn'; // date/month naam ke liye, ginti latin hi rahegi
  return { c, st, loc, lang: currentLang || 'en' };
}

// Dark / light ke hisaab se text ke rang (Notes, Memories, AI, Life Meter me use hote hain)
export const tokensOf = (c) => ({
  ink: c.text,
  sub: c.textSub,
  label: c.isDark ? '#fda4af' : '#a8264f',
  acc: c.selectedText,
  mid: c.choiceText,
  soft: c.isDark ? '#94a3b8' : '#b0587a',
  body: c.isDark ? '#cbd5e1' : '#7a3552',
  icon: c.accentDeep,
});

export const glassOf = (c) =>
  c.isDark
    ? { background: c.glass, border: '1px solid ' + c.glassBorder, borderTop: '1px solid ' + c.glassTop, boxShadow: c.glassShadow }
    : {
        background: 'linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,0.82) 55%,rgba(255,234,243,0.96) 100%)',
        border: '1px solid rgba(251,113,133,0.25)',
        borderTop: '1px solid #ffffff',
        boxShadow: 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35), 0 0 22px -8px rgba(251,113,133,0.35)',
      };

export const tintsOf = (c) =>
  c.isDark
    ? [
        'linear-gradient(160deg, #1e293b 0%, #3a1f33 100%)',
        'linear-gradient(160deg, #1e293b 0%, #3a2a22 100%)',
        'linear-gradient(160deg, #1e293b 0%, #2c2447 100%)',
        'linear-gradient(160deg, #1e293b 0%, #1f3a33 100%)',
        'linear-gradient(160deg, #1e293b 0%, #1f2f45 100%)',
      ]
    : [
        'linear-gradient(160deg,#ffffff 0%,#ffeaf3 100%)',
        'linear-gradient(160deg,#ffffff 0%,#fff0e6 100%)',
        'linear-gradient(160deg,#ffffff 0%,#f5ecff 100%)',
        'linear-gradient(160deg,#ffffff 0%,#e9f9f0 100%)',
        'linear-gradient(160deg,#ffffff 0%,#e8f3ff 100%)',
      ];

export const pageBgOf = (c, lightBg) => (c.isDark ? c.pageBg : lightBg);
