/* ধ্বনি স্টুডিও — সাইটের মূল ডেটা।
   নতুন আর্টিস্ট বা ডেমো যোগ করতে চাইলে এই ফাইলটাই এডিট করুন।
   (আপলোড পেজ থেকে যোগ করা ডেমো ব্রাউজারের স্টোরেজে জমা হয়।) */

const CATEGORIES = [
  { key: "news", label: "নিউজ ভয়েস", labelEn: "News & Bulletin", icon: "📰", blurb: "সংবাদ পাঠ, হেডলাইন প্যাকেজ ও ব্রেকিং নিউজ প্রোমো।" },
  { key: "ads", label: "অ্যাডস ভয়েস", labelEn: "TV / Radio Ads", icon: "📣", blurb: "টিভিসি, রেডিও জিঙ্গল ও ডিজিটাল ক্যাম্পেইনের এনার্জেটিক ভয়েস।" },
  { key: "documentary", label: "ডকুমেন্টারি", labelEn: "Documentary", icon: "🎞️", blurb: "গভীর, বিশ্বাসযোগ্য টোনে তথ্যচিত্রের ধারাবর্ণনা।" },
  { key: "drama", label: "ড্রামা / ডাবিং", labelEn: "Drama & Dubbing", icon: "🎭", blurb: "চরিত্রাভিনয়, অ্যানিমেশন ও সিরিজ ডাবিং।" },
  { key: "ivr", label: "আইভিআর", labelEn: "IVR & On-hold", icon: "☎️", blurb: "কল সেন্টার প্রম্পট, অন-হোল্ড মেসেজ ও গ্রিটিংস।" },
  { key: "audiobook", label: "অডিওবুক", labelEn: "Audiobook", icon: "📚", blurb: "দীর্ঘ ফর্ম্যাটের গল্প ও বইয়ের ন্যারেশন।" },
  { key: "elearning", label: "ই-লার্নিং", labelEn: "E-learning", icon: "🎓", blurb: "কোর্স মডিউল, এক্সপ্লেইনার ও ট্রেনিং কনটেন্ট।" },
  { key: "podcast", label: "পডকাস্ট", labelEn: "Podcast & Promo", icon: "🎙️", blurb: "শো ইন্ট্রো, আউট্রো ও স্পনসর রিড।" }
];

const LANGUAGES = ["বাংলা", "ইংরেজি", "হিন্দি", "চট্টগ্রামের আঞ্চলিক", "সিলেটি"];

const BUDGETS = [
  "১০,০০০ টাকার নিচে",
  "১০,০০০ - ২৫,০০০ টাকা",
  "২৫,০০০ - ৫০,০০০ টাকা",
  "৫০,০০০ - ১,০০,০০০ টাকা",
  "১,০০,০০০+ টাকা"
];

const ARTISTS = [
  {
    id: 1, slug: "tanvir-hasan", name: "তানভীর হাসান",
    tagline: "গম্ভীর ও বিশ্বাসযোগ্য সংবাদকণ্ঠ",
    bio: "১২ বছর ধরে জাতীয় টেলিভিশনে সংবাদ পাঠ ও প্রোমো ভয়েস দিচ্ছেন। তাঁর ব্যারিটোন টোন হেডলাইন প্যাকেজ ও ব্রেকিং নিউজে বাড়তি ওজন যোগ করে।",
    city: "ঢাকা", gender: "male", languages: "বাংলা, ইংরেজি",
    specialties: ["news", "documentary", "podcast"],
    experienceYears: 12, ratePerMinute: 3500, accent: "deep", featured: true
  },
  {
    id: 2, slug: "nusrat-jahan", name: "নুসরাত জাহান",
    tagline: "উষ্ণ, বন্ধুত্বপূর্ণ ব্র্যান্ড ভয়েস",
    bio: "টিভিসি ও ডিজিটাল ক্যাম্পেইনের জন্য বাংলাদেশের অন্যতম চাহিদাসম্পন্ন নারীকণ্ঠ। ৪০০+ ব্র্যান্ড ক্যাম্পেইনে কাজ করেছেন।",
    city: "ঢাকা", gender: "female", languages: "বাংলা, ইংরেজি",
    specialties: ["ads", "ivr", "elearning"],
    experienceYears: 9, ratePerMinute: 4000, accent: "warm", featured: true
  },
  {
    id: 3, slug: "rafiqul-islam", name: "রফিকুল ইসলাম",
    tagline: "সিনেমাটিক ন্যারেটর",
    bio: "তথ্যচিত্র ও কর্পোরেট ফিল্মের জন্য পরিচিত গভীর ন্যারেটিভ কণ্ঠ। বিটিভি, ডিসকভারি এশিয়া ও একাধিক এনজিও ফিল্মে কাজ করেছেন।",
    city: "চট্টগ্রাম", gender: "male", languages: "বাংলা, ইংরেজি, চট্টগ্রামের আঞ্চলিক",
    specialties: ["documentary", "audiobook", "news"],
    experienceYears: 15, ratePerMinute: 3800, accent: "cinematic", featured: true
  },
  {
    id: 4, slug: "samira-chowdhury", name: "সামিরা চৌধুরী",
    tagline: "ই-লার্নিং ও এক্সপ্লেইনার স্পেশালিস্ট",
    bio: "স্পষ্ট উচ্চারণ ও পরিমিত গতির জন্য প্রশংসিত। শিক্ষা প্ল্যাটফর্ম ও কর্পোরেট ট্রেনিং কনটেন্টে ৬ বছরের অভিজ্ঞতা।",
    city: "ঢাকা", gender: "female", languages: "বাংলা, ইংরেজি",
    specialties: ["elearning", "ivr", "podcast"],
    experienceYears: 6, ratePerMinute: 2800, accent: "clear", featured: false
  },
  {
    id: 5, slug: "arif-mahmud", name: "আরিফ মাহমুদ",
    tagline: "হাই-এনার্জি অ্যাডস ও প্রোমো",
    bio: "রেডিও প্রোমো ও রিটেইল অ্যাডে দ্রুতগতির, উদ্দীপনাময় কণ্ঠ। এফএম রেডিওতে ৮ বছরের আরজে অভিজ্ঞতা।",
    city: "ঢাকা", gender: "male", languages: "বাংলা, ইংরেজি, হিন্দি",
    specialties: ["ads", "podcast", "drama"],
    experienceYears: 8, ratePerMinute: 3000, accent: "energetic", featured: true
  },
  {
    id: 6, slug: "farhana-rahman", name: "ফারহানা রহমান",
    tagline: "ড্রামা ও ডাবিং আর্টিস্ট",
    bio: "বিদেশি সিরিজের বাংলা ডাবিং ও রেডিও নাটকে দীর্ঘ অভিজ্ঞতা। এক কণ্ঠে একাধিক চরিত্র ফুটিয়ে তুলতে পারদর্শী।",
    city: "ঢাকা", gender: "female", languages: "বাংলা, হিন্দি",
    specialties: ["drama", "audiobook", "ads"],
    experienceYears: 11, ratePerMinute: 3200, accent: "expressive", featured: false
  },
  {
    id: 7, slug: "shakib-ahmed", name: "শাকিব আহমেদ",
    tagline: "কর্পোরেট ও আইভিআর ভয়েস",
    bio: "কর্পোরেট প্রেজেন্টেশন, আইভিআর ও ট্রেনিং ভিডিওতে নির্ভরযোগ্য নিউট্রাল টোন। ইংরেজি উচ্চারণে দক্ষ।",
    city: "সিলেট", gender: "male", languages: "বাংলা, ইংরেজি, সিলেটি",
    specialties: ["ivr", "elearning", "news"],
    experienceYears: 7, ratePerMinute: 2500, accent: "neutral", featured: false
  },
  {
    id: 8, slug: "maliha-tasnim", name: "মালিহা তাসনিম",
    tagline: "তরুণ, ফ্রেশ সোশ্যাল মিডিয়া ভয়েস",
    bio: "রিল, টিকটক ও ইউটিউব শর্টসের জন্য তরুণ ও ট্রেন্ডি কণ্ঠ। জেন-জি ব্র্যান্ড ক্যাম্পেইনের পছন্দের আর্টিস্ট।",
    city: "ঢাকা", gender: "female", languages: "বাংলা, ইংরেজি",
    specialties: ["ads", "podcast", "elearning"],
    experienceYears: 4, ratePerMinute: 2200, accent: "fresh", featured: false
  }
];

/* audioUrl খালি রাখলে ব্রাউজার নিজেই একটি "নমুনা টোন" তৈরি করে বাজায়।
   আসল রেকর্ডিং দিতে চাইলে: audioUrl: "assets/audio/আপনার-ফাইল.mp3" */
const DEMOS = [
  { id: 1, artistId: 1, title: "প্রাইম টাইম নিউজ বুলেটিন", category: "news", language: "বাংলা", tone: "গম্ভীর • আত্মবিশ্বাসী", description: "রাত ৮টার বুলেটিন ওপেনিং ও তিনটি হেডলাইন রিড।", durationSec: 14, audioUrl: "" },
  { id: 2, artistId: 1, title: "ব্রেকিং নিউজ স্টিং", category: "news", language: "বাংলা", tone: "আর্জেন্ট • হাই এনার্জি", description: "১০ সেকেন্ডের ব্রেকিং নিউজ ট্যাগ লাইন।", durationSec: 9, audioUrl: "" },
  { id: 3, artistId: 1, title: "নদীর গল্প — ডকুমেন্টারি", category: "documentary", language: "বাংলা", tone: "শান্ত • ন্যারেটিভ", description: "পদ্মা নদীকে ঘিরে তৈরি তথ্যচিত্রের ওপেনিং ন্যারেশন।", durationSec: 16, audioUrl: "" },
  { id: 4, artistId: 2, title: "টেলিকম টিভিসি — ৩০ সেকেন্ড", category: "ads", language: "বাংলা", tone: "প্রাণবন্ত • উষ্ণ", description: "নতুন ডেটা প্যাকের টিভি বিজ্ঞাপনের ভয়েসওভার।", durationSec: 13, audioUrl: "" },
  { id: 5, artistId: 2, title: "ই-কমার্স ঈদ ক্যাম্পেইন", category: "ads", language: "বাংলা", tone: "উৎসবমুখর", description: "ঈদ সেলের ১৫ সেকেন্ড রেডিও স্পট।", durationSec: 10, audioUrl: "" },
  { id: 6, artistId: 2, title: "ব্যাংক আইভিআর গ্রিটিং", category: "ivr", language: "বাংলা", tone: "পেশাদার • পরিষ্কার", description: "কল সেন্টারের ওয়েলকাম ও মেনু প্রম্পট।", durationSec: 12, audioUrl: "" },
  { id: 7, artistId: 3, title: "সুন্দরবন — প্রকৃতির প্রহরী", category: "documentary", language: "বাংলা", tone: "সিনেমাটিক • ধীরলয়", description: "ওয়াইল্ডলাইফ ডকুমেন্টারির ট্রেলার ন্যারেশন।", durationSec: 18, audioUrl: "" },
  { id: 8, artistId: 3, title: "অডিওবুক — 'হাজার বছর ধরে'", category: "audiobook", language: "বাংলা", tone: "গল্পকথক", description: "উপন্যাসের প্রথম অধ্যায়ের নমুনা পাঠ।", durationSec: 20, audioUrl: "" },
  { id: 9, artistId: 4, title: "কোর্স মডিউল ০১ — ইন্ট্রো", category: "elearning", language: "বাংলা", tone: "শিক্ষামূলক • বন্ধুত্বপূর্ণ", description: "অনলাইন কোর্সের পরিচিতি মডিউল।", durationSec: 15, audioUrl: "" },
  { id: 10, artistId: 4, title: "অ্যাপ এক্সপ্লেইনার ভিডিও", category: "elearning", language: "বাংলা", tone: "স্মার্ট • ঝরঝরে", description: "ফিনটেক অ্যাপের ৬০ সেকেন্ড এক্সপ্লেইনার।", durationSec: 12, audioUrl: "" },
  { id: 11, artistId: 4, title: "পডকাস্ট ইন্ট্রো — 'শিখি প্রতিদিন'", category: "podcast", language: "বাংলা", tone: "প্রাণবন্ত", description: "সাপ্তাহিক পডকাস্টের ওপেনিং।", durationSec: 9, audioUrl: "" },
  { id: 12, artistId: 5, title: "রিটেইল মেগা সেল প্রোমো", category: "ads", language: "বাংলা", tone: "দ্রুত • উচ্ছ্বসিত", description: "শপিং মলের ফ্ল্যাশ সেল রেডিও স্পট।", durationSec: 11, audioUrl: "" },
  { id: 13, artistId: 5, title: "স্পোর্টস চ্যানেল প্রোমো", category: "ads", language: "বাংলা", tone: "পাওয়ারফুল", description: "ক্রিকেট সিরিজের ব্রডকাস্ট প্রোমো।", durationSec: 12, audioUrl: "" },
  { id: 14, artistId: 5, title: "অ্যানিমেশন চরিত্র — 'বুদ্ধু ভাই'", category: "drama", language: "বাংলা", tone: "কমেডি • ক্যারেক্টার", description: "শিশুতোষ অ্যানিমেশনের চরিত্রকণ্ঠ।", durationSec: 10, audioUrl: "" },
  { id: 15, artistId: 6, title: "সিরিজ ডাবিং — আবেগঘন দৃশ্য", category: "drama", language: "বাংলা", tone: "আবেগপ্রবণ", description: "টার্কিশ সিরিজের বাংলা ডাবিং নমুনা।", durationSec: 14, audioUrl: "" },
  { id: 16, artistId: 6, title: "রেডিও নাটক — 'চিঠি'", category: "drama", language: "বাংলা", tone: "নাটকীয়", description: "রেডিও নাটকের একক দৃশ্য।", durationSec: 16, audioUrl: "" },
  { id: 17, artistId: 7, title: "কর্পোরেট আইভিআর মেনু", category: "ivr", language: "বাংলা", tone: "নিউট্রাল • পরিষ্কার", description: "মাল্টি-লেভেল কল মেনু প্রম্পট।", durationSec: 13, audioUrl: "" },
  { id: 18, artistId: 7, title: "ইংরেজি নিউজ রিড", category: "news", language: "ইংরেজি", tone: "ফর্মাল", description: "English bulletin sample read.", durationSec: 12, audioUrl: "" },
  { id: 19, artistId: 8, title: "রিল ভয়েসওভার — ক্যাফে ব্র্যান্ড", category: "ads", language: "বাংলা", tone: "ট্রেন্ডি • ফ্রেশ", description: "১৫ সেকেন্ডের ইনস্টাগ্রাম রিল স্ক্রিপ্ট।", durationSec: 9, audioUrl: "" },
  { id: 20, artistId: 8, title: "পডকাস্ট আউট্রো + স্পনসর রিড", category: "podcast", language: "বাংলা", tone: "ক্যাজুয়াল", description: "শো শেষের স্পনসর মেনশন।", durationSec: 11, audioUrl: "" }
];

/* প্রতিটি ডেমোর জন্য স্থির seed ও শোনার সংখ্যা (ডিজাইনের ধারাবাহিকতার জন্য) */
DEMOS.forEach(function (d, i) {
  d.synthSeed = 118 + i * 17;
  d.plays = 40 + ((d.synthSeed * 7) % 900);
  d.builtin = true;
});
