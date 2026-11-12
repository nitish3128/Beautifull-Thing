// ============================================================
//  🌸  SITE CONFIG  —  MOON × Ritika
//  All text, media, songs, poetry lives here.
//  Touch only this file to personalise everything.
// ============================================================

const CONFIG = window.CONFIG = {

  /* ── Identity ─────────────────────────────────────────── */
  name: "Ritika",
  nicknames: [
    "Crazy Lady 🌪️",
    "My Moon 🌙",
    "Dazzling Nemesis ✨",
    "Ritzzz 🎀",
    "My 11:11 🪻",
    "Malika-ye-Husn 👑",
    "Mizaj-ye-sukoon 🌕",
    "dariya-ye-inayat 🪄",
  ],
  coverTagline: "thanks for existing My 11:11 🪻",
  coverDate: "11 · 11 · Forever 🌙",

  /* ── Music Stages ─────────────────────────────────────────
     Default song: Kabhi To Nazar Milao (loops across all chapters)
     chapterSong:  plays when user taps the chapter title pill
  ────────────────────────────────────────────────────────── */
  stages: [
    {
      title: "Chapter I · Pehli Nazar 🌸",
      songName: "Pehli Nazar",
      song: "assets/songs/song1.mp3",
      chapterSong: "assets/songs/Pehli Nazar Mein Race 320 Kbps.mp3",
      theme: "theme-blush",
      emoji: "🌸",
      poetLabel: "✦ Opening",
    },
    {
      title: "Chapter II · Maula Mere 🌙",
      songName: "Maula Mere",
      song: "assets/songs/song1.mp3",
      chapterSong: "assets/songs/Roop_Kumar_Rathod_-_Maula_Mere_Maula_(mp3.pm).mp3",
      theme: "theme-lavender",
      emoji: "🌙",
      poetLabel: "✦ Ghalib & Faiz",
    },
    {
      title: "Chapter III · O Re Piya ✨",
      songName: "O Re Piya",
      song: "assets/songs/song1.mp3",
      chapterSong: "assets/songs/O Re Piya Aaja Nachle 320 Kbps.mp3",
      theme: "theme-peach",
      emoji: "✨",
      poetLabel: "✦ Rumi & Neruda",
    },
    {
      title: "Chapter IV · Malika-ye-Husn 👑",
      songName: "Tera Chehra",
      song: "assets/songs/song1.mp3",
      chapterSong: "assets/songs/Tera Chehra Adnan Sami 320 Kbps.mp3",
      theme: "theme-sky",
      emoji: "👑",
      poetLabel: "✦ Gulzar & Tagore",
    },
    {
      title: "Chapter V · Mann Ki Lagan 🕊️",
      songName: "Mann Ki Lagan",
      song: "assets/songs/song1.mp3",
      chapterSong: "assets/songs/Mann Ki Lagan Paap 320 Kbps.mp3",
      theme: "theme-sunset",
      emoji: "🕊️",
      poetLabel: "✦ Sufi & Eternal",
    },
  ],

  /* ── Photos — each with a hand-written caption ─────────── */
  photos: [
    {
      src: "assets/photos/photo8.jpg",
      caption: "Hara rang tujhpe kuch alag hi khilta hai — jaise bahar ne tujhse ijaazat li ho 🌿☀️",
    },
    {
      src: "assets/photos/photo9.jpg",
      caption: "Even staircases look cinematic when you're on them 🎞️✨",
    },
    {
      src: "assets/photos/photo10.jpg",
      caption: "Woh aankhein — jaise julf-numa baadlon ke peeche chhupa koi chaand 🖤💜",
    },
    {
      src: "assets/photos/photo17.jpg",
      caption: "Teri zulf ko chhukar jo hawa gujri, jannat ki or ruksat hui🌸✨",
    },
    {
      src: "assets/photos/photo7.jpg",
      caption: "Teri is muskan se jannat me bhi baahar... 🌸✨",
    },
    {
      src: "assets/photos/photo1.jpg",
      caption: "Streetlights bhi jaante hain — aap main character hain 🌙🛣️",
    },
    {
      src: "assets/photos/photo2.jpg",
      caption: "Musafir itna sundar ho ki pahad bhi sharmaye... 🌄💜",
    },
    {
      src: "assets/photos/photo4.jpg",
      caption: " Bachpana tera, itrana tera, husn tera aur narajgi bhi teri....waah🎞️🌸",
    },
    {
      src: "assets/photos/photo12.jpg",
      caption: "In ankho ke siva dunia me rakha kya hai....💜",
    },
    {
      src: "assets/photos/photo5.jpg",
      caption: "ye pal haseen .... 🌷",
    },
    {
      src: "assets/photos/photo13.jpg",
      caption: "Tere hone se sab roshn hai, tu na ho to purnima bhi amavsya🌸",
    },
    {
      src: "assets/photos/photo3.jpg",
      caption: "Teri muskaan mein itna kuch hai jo alfaaz kabhi nahi keh sakte 🌺",
    },
    {
      src: "assets/photos/photo11.jpg",
      caption: "Teri Khushi Se Roshan ye jahan Sara hai...💫",
    },
    {
      src: "assets/photos/photo14.jpg",
      caption: "Ek aisi muskaan jo kisi bhi aam din ko tyohaar bana de 🪔✨",
    },
    {
      src: "assets/photos/photo15.jpg",
      caption: "Appki sadgi me hi kayamat ki adaa hai..🌸💫",
    },
    {
      src: "assets/photos/photo16.jpg",
      caption: "Every heart stops when you smile...🪻💜",
    },
  ],

  /* ── Videos & Soundtrack ────────────────────────────── */
  videoSong: "assets/songs/lag_jaa_gale_mix.mp3",
  videos: [
    {
      src: "assets/videos/video1.mp4",
      poster: "assets/photos/photo1.jpg",
      caption: "Yeh wala pal — pura ka pura tumhara 🎬💜",
      label: "A moment, unfiltered 🌙",
    },
    {
      src: "assets/videos/video2.mp4",
      poster: "assets/photos/video2_poster.jpg",
      caption: "Camera bhi aappe ruk jaata hai — Ti-lismi Husn hai 🪔✨",
      label: "Because some things deserve to be remembered 🌸",
    },
    {
      src: "assets/videos/video3.mp4",
      poster: "assets/photos/video3_poster.jpg",
      caption: "Safed libaas mein chaand zameen par utar aaya ho jaise... 🤍✨",
      label: "Noor-e-Kamaal 🕊️",
    },
    {
      src: "assets/videos/video4.mp4",
      poster: "assets/photos/video4_poster.jpg",
      caption: "Har ada mein ek sukoon, har lamhe mein ek ehsaas... 💜✨",
      label: "Ada-e-Dilkash 💫",
    },
  ],

  /* ══════════════════════════════════════════════════════════
     LITERARY WISHES — 55 entries
     Drawn from: Mirza Ghalib · Faiz Ahmed Faiz · Gulzar
     Rumi · Pablo Neruda · Rabindranath Tagore
     Kahlil Gibran · John Keats · Harivanshrai Bachchan
     Ramdhari Singh Dinkar · Victor Hugo · Original
  ══════════════════════════════════════════════════════════ */
  wishes: [

    /* ── Chapter I  ·  Poetic & Timeless ── */
    {
      text: "धूप में निकलो घटाओं में नहा कर देखो,\nज़िंदगी क्या है किताबों को हटा कर देखो।\nफ़ासिला नज़रों का धोखा भी तो हो सकता है,\nवो जिसे ढूँढ रहे हो उसे पा कर देखो। 🌸",
      by: "",
    },
    {
      text: "कुछ अलग ही बात है तुम्हारी मौजूदगी में —\nजैसे किसी तपती दोपहर को ठंडी हवा का झोंका छू जाए। 🍃✨",
      by: "",
    },
    {
      text: "वो तो ख़ुशबू है हवाओं में बिखर जाएगा,\nमसअला फूल का है, फूल किधर जाएगा!\nअक्स-ए-ख़ुशबू हूँ बिखरने से न रोके कोई,\nऔर बिखर जाऊँ तो मुझ को न समेटे कोई। 🌷",
      by: "",
    },
    {
      text: "उजाले अपनी यादों के हमारे साथ रहने दो,\nन जाने किस गली में ज़िंदगी की शाम हो जाए।\nकभी तो आसमाँ से चाँद उतरे जाम हो जाए,\nतुम्हारे नाम की इक ख़ूबसूरत शाम हो जाए। 🌙",
      by: "",
    },
    {
      text: "She walks in beauty, like the night\nof cloudless climes and starry skies;\nand all that's best of dark and bright\nmeet in her aspect and her eyes. ✨",
      by: "",
    },

    /* ── Chapter I  ·  Faiz Ahmed Faiz ── */
    {
      text: "तेरी सूरत से है आलम में बहारों को सबात,\nतेरी आँखों के सिवा दुनिया में रक्खा क्या है!",
      by: "— Faiz Ahmed Faiz 🌹",
    },
    {
      text: "कभी तो सुब्ह तेरे कुंज-ए-लब से हो आग़ाज़,\nकभी तो शब सर-ए-काकुल से मुश्कबार चले।",
      by: "— Faiz Ahmed Faiz 🌹",
    },
    {
      text: "\"The dawn begins at the edge of your lips —\nand the night drifts perfumed from your hair.\"",
      by: "— Faiz Ahmed Faiz (trans.)",
    },

    /* ── Chapter II  ·  Mirza Ghalib ── */
    {
      text: "उनके देखे से जो आ जाती है मुँह पर रौनक,\nवो समझते हैं कि बीमार का हाल अच्छा है।",
      by: "— Mirza Ghalib 🖋️",
    },
    {
      text: "जब वो जमाल-ए-दिल-फ़रोज़ सूरत-ए-मेहर-ए-नीमरोज़,\nआप ही हो नज़ारा-सोज़ पर्दा-ए-साज़-ओ-बर्ग में।",
      by: "— Mirza Ghalib 🖋️",
    },
    {
      text: "\"When that heart-illuminating beauty appears,\nradiant as the midday sun —\nher very gaze sets everything ablaze.\"",
      by: "— Mirza Ghalib (trans.)",
    },
    {
      text: "हज़ारों ख्वाहिशें ऐसी कि हर ख्वाहिश पे दम निकले,\nबहुत निकले मेरे अरमान, लेकिन फिर भी कम निकले।",
      by: "— Mirza Ghalib 🖋️",
    },

    /* ── Chapter II  ·  Gulzar ── */
    {
      text: "माथे पर जो बिंदिया सजाती है वो,\nमानो चाँद पर कोई शाम उतर आई हो।\nउसकी सादगी का कोई जवाब नहीं,\nवो बिन श्रृंगार के भी क़हर ढाती हो।",
      by: "— Gulzar 🌿",
    },
    {
      text: "वो हाथ जो बालों को सँवारते हैं अचानक,\nवक्त को भी कुछ देर के लिए रोक देते हैं।",
      by: "— Gulzar 🌿",
    },
    {
      text: "\"Raat ki aaghosh mein teri aankhon ka noor —\njaisa aandheron mein koyi diya jal utha ho.\"",
      by: "— Gulzar 🌿",
    },
    {
      text: "तू सिर्फ़ एक शख्स नहीं, एक पूरा मौसम है —\nजब आती है, सब कुछ महक उठता है।",
      by: "— Gulzar (paraphrased) 🌿",
    },

    /* ── Chapter II  ·  Harivanshrai Bachchan ── */
    {
      text: "जो बीत गई सो बात गई,\nजीवन में एक सितारा था —\nमाना वो बेहद प्यारा था।\nवो डूब गया तो डूब गया।",
      by: "— Harivanshrai Bachchan ✦",
    },
    {
      text: "मदिरालय जाने को घर से चलता है पीनेवाला,\nकिस पथ से जाऊँ असमंजस में है वो भोलाभाला।",
      by: "— Harivanshrai Bachchan, Madhushala ✦",
    },
    {
      text: "\"She is not just a person — she is a whole season.\nWhen she arrives, everything blooms.\" 🌸",
      by: "— inspired by Bachchan",
    },

    /* ── Chapter III  ·  Rumi ── */
    {
      text: "\"In your light I learn how to love.\nIn your beauty, how to make poems.\nYou dance inside my chest where no-one sees you,\nbut sometimes I do — and that sight becomes this art.\"",
      by: "— Jalaluddin Rumi 🌀",
    },
    {
      text: "\"The beauty you see in me\nis a reflection of you.\"",
      by: "— Jalaluddin Rumi 🌀",
    },
    {
      text: "\"Whenever beauty looks, love is also there.\nWhenever beauty shows a rosy cheek,\nlove lights her fire from that flame.\nBeauty is the mine — Love is the diamond.\"",
      by: "— Jalaluddin Rumi 🌀",
    },
    {
      text: "\"Close your eyes, fall in love, stay there.\" 💜",
      by: "— Jalaluddin Rumi 🌀",
    },
    {
      text: "\"Out beyond ideas of wrongdoing and rightdoing,\nthere is a field — I'll meet you there.\nWhen the soul lies down in that grass,\nthe world is too full to talk about.\"",
      by: "— Jalaluddin Rumi 🌀",
    },

    /* ── Chapter III  ·  Pablo Neruda ── */
    {
      text: "\"I love you without knowing how, or when, or from where.\nI love you simply, without problems or pride:\nI love you in this way because I do not know\nany other way of loving but this.\"",
      by: "— Pablo Neruda, Sonnet XVII 🌊",
    },
    {
      text: "\"As if you were on fire from within —\nthe moon lives in the lining of your skin.\"",
      by: "— Pablo Neruda 🌊",
    },
    {
      text: "\"I want to do with you\nwhat spring does with the cherry trees.\"",
      by: "— Pablo Neruda 🌊",
    },
    {
      text: "\"You are like nobody since I love you.\nLet me spread you out among yellow garlands.\nWho writes your name in letters of smoke\namong the stars of the south?\"",
      by: "— Pablo Neruda 🌊",
    },
    {
      text: "\"Tonight I can write the saddest lines —\nbut I write them to tell you: she was beautiful.\"",
      by: "— Pablo Neruda (adapted) 🌊",
    },

    /* ── Chapter IV  ·  Rabindranath Tagore ── */
    {
      text: "\"Beauty is simply reality\nseen with the eyes of love.\" 🌺",
      by: "— Rabindranath Tagore 🪷",
    },
    {
      text: "\"I seem to have loved you in numberless forms,\nnumberless times,\nin life after life, in age after age — forever.\"",
      by: "— Rabindranath Tagore 🪷",
    },
    {
      text: "\"Love adorns itself;\nit seeks to prove inward joy\nby outward beauty.\"",
      by: "— Rabindranath Tagore 🪷",
    },
    {
      text: "\"She is delicate as a lily,\nyet her heart is bolder and stronger\nthan anything this world knows.\"",
      by: "— Rabindranath Tagore 🪷",
    },
    {
      text: "\"Where the mind is without fear\nand the head is held high —\ninto that heaven of freedom, my beloved,\nlet the world awaken.\"",
      by: "— Rabindranath Tagore, Gitanjali 🪷",
    },

    /* ── Chapter IV  ·  Kahlil Gibran ── */
    {
      text: "\"Beauty is not in the face;\nbeauty is a light in the heart.\" 💡",
      by: "— Kahlil Gibran 🌙",
    },
    {
      text: "\"You are the bows from which your children\nare sent forth as living arrows.\nThe archer sees the mark upon the path of the infinite.\"\nAnd she — she is the bow that bends with grace. 🌿",
      by: "— Kahlil Gibran (adapted)",
    },
    {
      text: "\"And forget not that the earth delights\nto feel your bare feet,\nand the winds long to play with your hair.\"",
      by: "— Kahlil Gibran, The Prophet 🌙",
    },

    /* ── John Keats ── */
    {
      text: "\"A thing of beauty is a joy forever:\nIts loveliness increases; it will never\npass into nothingness.\"",
      by: "— John Keats, Endymion 🌿",
    },
    {
      text: "\"She walks in beauty, like the night\nof cloudless climes and starry skies;\nAnd all that's best of dark and bright\nmeet in her aspect and her eyes.\"",
      by: "— Lord Byron (for you, Ritika) 🌙",
    },

    /* ── Victor Hugo ── */
    {
      text: "\"To love another person\nis to see the face of God.\" ✨",
      by: "— Victor Hugo, Les Misérables",
    },
    {
      text: "\"She was not beautiful to everyone —\nshe was beautiful to him, in that particular way\nthat makes a person the whole world.\"",
      by: "— inspired by Victor Hugo",
    },

    /* ── Chapter IV  ·  Soulful & Elegant ── */
    {
      text: "जो गुज़ारी न जा सकी हम से,\nहम ने वो ज़िंदगी गुज़ारी है...\nमगर जब से देखा है रुख़-ए-महताब तुम्हारा,\nज़िंदगी भी हम से संवरने लगी है। 💜",
      by: "",
    },
    {
      text: "तेरी सादगी में वो बात है जो किसी बनावट में नहीं,\nजैसे दरिया का शांत बहना, जैसे रात की पहली ओस।\nतेरी एक मुस्कान ही काफ़ी है,\nहर बेज़ार लम्हे को गुलज़ार करने के लिए। 🪔✨",
      by: "",
    },
    {
      text: "हज़ार बर्क़ गिरे लाख आँधियाँ उट्ठें,\nवो फूल खिल के रहेंगे जो खिलने वाले हैं।\nतेरी हँसी से महकती है ये फ़ज़ा सारी,\nतू मुस्कुराए तो मौसम बदल से जाते हैं। 🌸",
      by: "",
    },
    {
      text: "चाँद भी निकला सितारों की भी महफ़िल चमकी,\nमगर उस हुस्न का सानी इस फ़लक पर न मिला।\nतेरी आँखों में जो गहराइयाँ हैं,\nउनमें डूब कर हर दर्द हल्का सा लगता है। 🌙",
      by: "",
    },
    {
      text: "हाथ छूटे भी तो रिश्ते नहीं छूटा करते,\nवक़्त की शाख़ से लम्हे नहीं टूटा करते।\nतू जहाँ भी रहे, रौशनी की तरह महके,\nदुआ यही है कि तेरे चेहरे का नूर हमेशा सलामत रहे। 💫",
      by: "",
    },
    {
      text: "जिस की दीद में रौशन थीं बस्तियाँ दिल की,\nवो एक शख़्स जो सब से जुदा सा लगता है।\nनज़र उठा के जो देखे तो बहार ठहर जाए,\nक़दम बढ़ाए तो हर रास्ता महक जाए। 🌺",
      by: "",
    },
    {
      text: "हवा के दोश पे रखे हुए चिराग़ हैं हम,\nअगर बुझे भी तो अपनी ज़िया लुटा के बुझे।\nतू सलामत रहे अपनी ही सादगी और नूर के साथ,\nतेरे होने से ही इस महफ़िल में रौनक़ है। 👑",
      by: "",
    },
    {
      text: "छाप तिलक सब छीनी रे तोसे नैना मिलाइके,\nप्रेम भटी का मदवा पिलाइके, मतवारी कर दीन्ही रे।\nन कोई शिकवा, न कोई गुज़ारिश तुमसे,\nबस दुआ है कि तू हमेशा यूँ ही हँसती रहे। 🪻",
      by: "",
    },

    /* ── Ramdhari Singh Dinkar ── */
    {
      text: "\"क्षमा शोभती उस भुजंग को जिसके पास गरल हो,\nउसको क्या जो दंतहीन, विषरहित, विनीत, सरल हो।\"",
      by: "— Ramdhari Singh Dinkar ⚡",
    },
    {
      text: "\"सिंहासन खाली करो कि जनता आती है।\"\nAur Ritika — tu aati hai toh sab kuch apne aap khali ho jaata hai uske liye. 👑",
      by: "— Dinkar (adapted for you)",
    },

    /* ── Closing ── */
    {
      text: "\"The most beautiful thing in the world\nis a heart that is both strong and kind.\"\nYours is both, Ritika. Both. 💜",
      by: "— Stupid Boy..",
    },
    {
      text: "Just be the Way you are —\nThe crazy lady, The Moon,\n& Ritzzz.\nAlways.... 🪻💜",
      by: "— Nitish T.",
    },
  ],

  /* ── Final messages ────────────────────────────────────── */
  finalMessage: "✨Ritika, you are truly one of a kind.\nThank you for being you. 💖",
  finalHindiLine: "Bas yun hi rehna — 🌙\nMy crazy lady, Mere chaand, The Glamrous Ritslyn._ve-\n Be Yourself.... 💜🪻",

  /* ── Song note (shown if song file missing) ──────────────
     Tell the user which file to drop where:
     song2.mp3 → Maula Mere Maula
     song3.mp3 → O Re Piya
     song4.mp3 → Tera Chehra (Adnan Sami)
     song5.mp3 → Mann Ki Lagan
  ─────────────────────────────────────────────────────────*/
};
