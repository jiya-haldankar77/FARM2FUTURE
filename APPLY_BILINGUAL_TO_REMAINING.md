# Apply Bilingual Support to Remaining Pages

## ✅ COMPLETED

### 1. Dashboard (voice-guide-dashboard.js) - ✅ DONE
### 2. Soil Advisor (voice-guide.js) - ✅ DONE

---

## ⏳ PENDING - Apply Same Pattern

### 3. Water Tracker (voice-guide-water.js)
### 4. Government Schemes (voice-guide-schemes.js)

---

## 📝 Hindi Translations Needed

### Water Tracker - Hindi Segments

```javascript
hi: [
  {
    id: 'welcome',
    text: "जल उपयोग ट्रैकर में आपका स्वागत है! मैं आपका AI सहायक हूं, आपके खेत की जल खपत की निगरानी और अनुकूलन में मदद के लिए यहां हूं।",
    duration: 7000,
    focus: 'header'
  },
  {
    id: 'tracking-form',
    text: "अपने दैनिक जल उपयोग को ट्रैक करके शुरू करें। तारीख चुनें, अपना राज्य और फसल का प्रकार चुनें, फिर लीटर में उपयोग किए गए पानी की मात्रा दर्ज करें। यह आपको अपने उपभोग पैटर्न की निगरानी करने में मदद करता है।",
    duration: 13000,
    focus: 'tracker-section'
  },
  {
    id: 'summary',
    text: "आपका उपयोग सारांश कुल जल खपत और औसत दैनिक उपयोग दिखाता है। आप अपने डेटा को PDF में निर्यात कर सकते हैं या अपने जल रिकॉर्ड का पूरा इतिहास देख सकते हैं।",
    duration: 11000,
    focus: 'summary-section'
  },
  {
    id: 'advisor',
    text: "स्मार्ट जल सलाहकार आपकी फसल, स्थान और उपयोग पैटर्न के आधार पर व्यक्तिगत सिफारिशें प्रदान करता है। यह आपको पानी बचाने और दक्षता में सुधार करने में मदद करता है।",
    duration: 11000,
    focus: 'advisor-section'
  },
  {
    id: 'chart',
    text: "जल उपयोग ट्रेंड चार्ट समय के साथ आपकी खपत को दृश्य रूप से दिखाता है, जिससे पैटर्न को पहचानना और जल संरक्षण के अवसरों की पहचान करना आसान हो जाता है।",
    duration: 11000,
    focus: 'chart-section'
  },
  {
    id: 'closing',
    text: "सूचित निर्णय लेने और टिकाऊ खेती में योगदान करने के लिए आज ही अपने जल उपयोग को ट्रैक करना शुरू करें। यदि आपको मदद की आवश्यकता हो तो कभी भी स्पीकर आइकन पर क्लिक करें!",
    duration: 10000,
    focus: null
  }
]
```

### Government Schemes - Hindi Segments

```javascript
hi: [
  {
    id: 'welcome',
    text: "सरकारी योजना सिफारिशों में आपका स्वागत है! मैं आपका AI सहायक हूं, आपकी खेती की जरूरतों से मेल खाने वाली सरकारी योजनाओं और सब्सिडी की खोज में मदद के लिए यहां हूं।",
    duration: 10000,
    focus: 'header'
  },
  {
    id: 'form-intro',
    text: "व्यक्तिगत योजना सिफारिशें प्राप्त करने के लिए, फॉर्म भरकर शुरू करें। राज्य, जिला, फसल का प्रकार, खेत का आकार और वार्षिक आय सहित अपना विवरण दर्ज करें।",
    duration: 11000,
    focus: 'form-card'
  },
  {
    id: 'form-fields',
    text: "स्थान-विशिष्ट योजनाओं को खोजने के लिए अपना राज्य और जिला चुनें। अपनी प्राथमिक फसल चुनें और एकड़ में अपने खेत का आकार दर्ज करें। आपकी वार्षिक आय हमें आपको पात्र सब्सिडी से मिलाने में मदद करती है।",
    duration: 14000,
    focus: 'form-grid'
  },
  {
    id: 'submit',
    text: "एक बार जब आप सभी विवरण भर लें, तो 'योजना सिफारिशें प्राप्त करें' बटन पर क्लिक करें। हमारा AI आपकी जानकारी का विश्लेषण करेगा और आपके लिए सर्वोत्तम सरकारी योजनाएं खोजेगा।",
    duration: 11000,
    focus: 'submit-btn'
  },
  {
    id: 'results',
    text: "आपकी व्यक्तिगत योजना सिफारिशें नीचे दिखाई देंगी। प्रत्येक कार्ड योजना का नाम, विवरण, लाभ और पात्रता मानदंड दिखाता है। किसी भी योजना के बारे में अधिक जानने के लिए 'विवरण देखें' पर क्लिक करें।",
    duration: 13000,
    focus: 'results-section'
  },
  {
    id: 'closing',
    text: "अपने खेती व्यवसाय के लिए सरकारी सहायता का लाभ उठाएं! उन योजनाओं की खोज करने के लिए अभी फॉर्म भरें जो आपको बढ़ने में मदद कर सकती हैं। यदि आपको मदद की आवश्यकता हो तो कभी भी स्पीकर आइकन पर क्लिक करें!",
    duration: 12000,
    focus: null
  }
]
```

---

## 🔧 Changes Required for Each File

Apply these exact same changes that were done to Dashboard and Soil Advisor:

1. Add `this.currentLanguage = localStorage.getItem('voiceGuideLanguage') || 'en';`
2. Change `this.segments` to `this.allSegments = { en: [...], hi: [...] }`
3. Add `this.segments = this.allSegments[this.currentLanguage];`
4. Add language selector HTML to widget
5. Add language selector event listeners
6. Add `switchLanguage()` method
7. Add `updateTranscriptModal()` method
8. Update `play()` alert message for bilingual
9. Update speech synthesis to use `hi-IN` for Hindi
10. Add language selector CSS styles

---

## ✅ Status

| Page | File | Status |
|------|------|--------|
| Dashboard | voice-guide-dashboard.js | ✅ Complete |
| Soil Advisor | voice-guide.js | ✅ Complete |
| Water Tracker | voice-guide-water.js | ⏳ Ready (translations above) |
| Gov Schemes | voice-guide-schemes.js | ⏳ Ready (translations above) |

The pattern is established - same changes for Water and Schemes!
