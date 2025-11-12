/* ============================================
   FARM2FUTURE - VOICE GUIDE FEATURE
   AI Farm Assistant with Audio Guidance
   ============================================ */

class VoiceGuide {
  constructor() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.transcript = [];
    this.currentSegmentIndex = 0;
    this.currentLanguage = localStorage.getItem('voiceGuideLanguage') || 'en';
    
    // Check if browser supports speech synthesis
    this.speechSupported = 'speechSynthesis' in window;
    
    // Voice guide script segments - Bilingual (English/Hindi)
    this.allSegments = {
      en: [
      {
        id: 'welcome',
        text: "Welcome to the Soil Health Advisor! I'm your AI assistant, here to help you analyze your soil and get personalized crop recommendations.",
        duration: 5000,
        focus: 'hero-section'
      },
      {
        id: 'ai-upload',
        text: "The easiest way to get started is by uploading a photo of your soil. Just drag and drop an image, or click to browse. Our AI will analyze it instantly and identify your soil type.",
        duration: 9000,
        focus: 'uploadSection'
      },
      {
        id: 'analysis',
        text: "Once analyzed, you'll see your soil type, confidence level, and detailed recommendations for the best crops and fertilizers for your specific soil.",
        duration: 8000,
        focus: 'resultsSection'
      },
      {
        id: 'manual-option',
        text: "If you already know your soil type, you can use the manual selection option to get instant recommendations without uploading a photo.",
        duration: 7000,
        focus: 'manualSection'
      },
        {
          id: 'closing',
          text: "Get started now by uploading your soil photo! Click the speaker icon anytime if you need help.",
          duration: 5000,
          focus: null
        }
      ],
      hi: [
        {
          id: 'welcome',
          text: "मिट्टी स्वास्थ्य सलाहकार में आपका स्वागत है! मैं आपका AI सहायक हूं, आपकी मिट्टी का विश्लेषण करने और व्यक्तिगत फसल सिफारिशें प्राप्त करने में मदद के लिए यहां हूं।",
          duration: 7000,
          focus: 'hero-section'
        },
        {
          id: 'ai-upload',
          text: "शुरू करने का सबसे आसान तरीका है अपनी मिट्टी की फोटो अपलोड करना। बस एक छवि को ड्रैग और ड्रॉप करें, या ब्राउज़ करने के लिए क्लिक करें। हमारा AI इसे तुरंत विश्लेषण करेगा और आपकी मिट्टी के प्रकार की पहचान करेगा।",
          duration: 11000,
          focus: 'uploadSection'
        },
        {
          id: 'analysis',
          text: "विश्लेषण के बाद, आप अपनी मिट्टी का प्रकार, विश्वास स्तर, और आपकी विशिष्ट मिट्टी के लिए सर्वोत्तम फसलों और उर्वरकों के लिए विस्तृत सिफारिशें देखेंगे।",
          duration: 10000,
          focus: 'resultsSection'
        },
        {
          id: 'manual-option',
          text: "यदि आप पहले से ही अपनी मिट्टी का प्रकार जानते हैं, तो आप फोटो अपलोड किए बिना तुरंत सिफारिशें प्राप्त करने के लिए मैनुअल चयन विकल्प का उपयोग कर सकते हैं।",
          duration: 10000,
          focus: 'manualSection'
        },
        {
          id: 'closing',
          text: "अभी अपनी मिट्टी की फोटो अपलोड करके शुरू करें! यदि आपको मदद की आवश्यकता हो तो कभी भी स्पीकर आइकन पर क्लिक करें।",
          duration: 6000,
          focus: null
        }
      ]
    };
    
    this.segments = this.allSegments[this.currentLanguage];
    
    this.init();
  }
  
  init() {
    if (!this.speechSupported) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    
    this.createVoiceWidget();
    this.setupEventListeners();
  }
  
  createVoiceWidget() {
    // Create floating voice widget with language selector
    const widget = document.createElement('div');
    widget.id = 'voice-guide-widget';
    widget.className = 'voice-widget';
    widget.innerHTML = `
      <div class="language-selector">
        <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
          English
        </button>
        <button class="lang-btn ${this.currentLanguage === 'hi' ? 'active' : ''}" data-lang="hi">
          हिंदी
        </button>
      </div>
      <div class="voice-widget-container">
        <button id="voiceGuideBtn" class="voice-btn" aria-label="Play voice guide">
          <i class="fas fa-volume-up"></i>
        </button>
        <div class="voice-waveform" id="voiceWaveform">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="voice-controls" id="voiceControls" style="display: none;">
        <button id="voicePauseBtn" class="voice-control-btn" aria-label="Pause">
          <i class="fas fa-pause"></i>
        </button>
        <button id="voiceStopBtn" class="voice-control-btn" aria-label="Stop">
          <i class="fas fa-stop"></i>
        </button>
        <button id="voiceTranscriptBtn" class="voice-control-btn" aria-label="Show transcript">
          <i class="fas fa-file-alt"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Create transcript modal
    this.createTranscriptModal();
    
    // Add styles
    this.addStyles();
  }
  
  createTranscriptModal() {
    const modal = document.createElement('div');
    modal.id = 'voice-transcript-modal';
    modal.className = 'voice-modal';
    const title = this.currentLanguage === 'hi' ? 'वॉयस गाइड ट्रांसक्रिप्ट' : 'Voice Guide Transcript';
    modal.innerHTML = `
      <div class="voice-modal-content">
        <div class="voice-modal-header">
          <h3><i class="fas fa-file-alt"></i> ${title}</h3>
          <button id="closeTranscriptBtn" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="voice-modal-body" id="transcriptContent">
          ${this.segments.map((seg, idx) => `
            <div class="transcript-segment" data-segment="${idx}">
              <div class="segment-number">${idx + 1}</div>
              <p>${seg.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  setupEventListeners() {
    const voiceBtn = document.getElementById('voiceGuideBtn');
    const pauseBtn = document.getElementById('voicePauseBtn');
    const stopBtn = document.getElementById('voiceStopBtn');
    const transcriptBtn = document.getElementById('voiceTranscriptBtn');
    const closeTranscriptBtn = document.getElementById('closeTranscriptBtn');
    const modal = document.getElementById('voice-transcript-modal');
    const langBtns = document.querySelectorAll('.lang-btn');
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => this.togglePlayPause());
    }
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePlayPause());
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }
    
    if (transcriptBtn) {
      transcriptBtn.addEventListener('click', () => this.showTranscript());
    }
    
    if (closeTranscriptBtn) {
      closeTranscriptBtn.addEventListener('click', () => this.hideTranscript());
    }
    
    // Language selector
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        this.switchLanguage(lang);
      });
    });
    
    // Close modal on outside click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideTranscript();
        }
      });
    }
  }
  
  switchLanguage(lang) {
    if (lang === this.currentLanguage) return;
    if (this.isPlaying) this.stop();
    
    this.currentLanguage = lang;
    localStorage.setItem('voiceGuideLanguage', lang);
    this.segments = this.allSegments[lang];
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    this.updateTranscriptModal();
  }
  
  updateTranscriptModal() {
    const title = this.currentLanguage === 'hi' ? 'वॉयस गाइड ट्रांसक्रिप्ट' : 'Voice Guide Transcript';
    const modalHeader = document.querySelector('.voice-modal-header h3');
    if (modalHeader) {
      modalHeader.innerHTML = `<i class="fas fa-file-alt"></i> ${title}`;
    }
    
    const transcriptContent = document.getElementById('transcriptContent');
    if (transcriptContent) {
      transcriptContent.innerHTML = this.segments.map((seg, idx) => `
        <div class="transcript-segment" data-segment="${idx}">
          <div class="segment-number">${idx + 1}</div>
          <p>${seg.text}</p>
        </div>
      `).join('');
    }
  }
  
  togglePlayPause() {
    if (!this.isPlaying) {
      this.play();
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }
  
  play() {
    if (!this.speechSupported) {
      const msg = this.currentLanguage === 'hi' 
        ? 'वॉयस गाइड आपके ब्राउज़र में समर्थित नहीं है। कृपया Chrome, Edge, या Safari का उपयोग करें।'
        : 'Voice guide is not supported in your browser. Please use Chrome, Edge, or Safari.';
      alert(msg);
      return;
    }
    
    this.isPlaying = true;
    this.isPaused = false;
    this.currentSegmentIndex = 0;
    
    this.updateUI('playing');
    this.playSegment(0);
  }
  
  playSegment(index) {
    if (index >= this.segments.length) {
      this.stop();
      return;
    }
    
    const segment = this.segments[index];
    this.currentSegmentIndex = index;
    
    // Highlight current segment in transcript
    this.highlightSegment(index);
    
    // Focus on relevant dashboard section
    if (segment.focus) {
      this.focusSection(segment.focus);
    }
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find appropriate voice
    const voices = speechSynthesis.getVoices();
    let preferredVoice;
    
    if (this.currentLanguage === 'hi') {
      preferredVoice = voices.find(voice => 
        voice.lang.includes('hi') || voice.name.includes('Hindi')
      );
    } else {
      preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen')
      );
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        // Play next segment
        setTimeout(() => {
          this.playSegment(index + 1);
        }, 500); // Small pause between segments
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.stop();
    };
    
    this.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }
  
  pause() {
    if (this.isPlaying && !this.isPaused) {
      speechSynthesis.pause();
      this.isPaused = true;
      this.updateUI('paused');
    }
  }
  
  resume() {
    if (this.isPlaying && this.isPaused) {
      speechSynthesis.resume();
      this.isPaused = false;
      this.updateUI('playing');
    }
  }
  
  stop() {
    speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSegmentIndex = 0;
    this.currentUtterance = null;
    this.updateUI('stopped');
    this.clearHighlights();
  }
  
  updateUI(state) {
    const voiceBtn = document.getElementById('voiceGuideBtn');
    const controls = document.getElementById('voiceControls');
    const waveform = document.getElementById('voiceWaveform');
    const pauseBtn = document.getElementById('voicePauseBtn');
    
    if (!voiceBtn) return;
    
    switch (state) {
      case 'playing':
        voiceBtn.innerHTML = '<i class="fas fa-pause"></i>';
        voiceBtn.classList.add('active');
        if (controls) controls.style.display = 'flex';
        if (waveform) waveform.classList.add('active');
        if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        break;
        
      case 'paused':
        voiceBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (waveform) waveform.classList.remove('active');
        if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        break;
        
      case 'stopped':
        voiceBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        voiceBtn.classList.remove('active');
        if (controls) controls.style.display = 'none';
        if (waveform) waveform.classList.remove('active');
        break;
    }
  }
  
  focusSection(sectionId) {
    // Remove previous highlights
    document.querySelectorAll('.voice-highlight').forEach(el => {
      el.classList.remove('voice-highlight');
    });
    
    // Add highlight to current section
    let element;
    switch (sectionId) {
      case 'hero-section':
        element = document.querySelector('.hero-section, .main-header, h1');
        break;
      case 'uploadSection':
        element = document.getElementById('uploadSection');
        if (!element) element = document.querySelector('.upload-card, .upload-section');
        break;
      case 'resultsSection':
        element = document.getElementById('resultsSection');
        if (!element) element = document.querySelector('.results-section, .analysis-results');
        break;
      case 'manualSection':
        element = document.getElementById('manualSection');
        if (!element) element = document.querySelector('.manual-section, .manual-form');
        break;
    }
    
    if (element) {
      element.classList.add('voice-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  highlightSegment(index) {
    // Clear previous highlights
    document.querySelectorAll('.transcript-segment').forEach(seg => {
      seg.classList.remove('active');
    });
    
    // Highlight current segment
    const segment = document.querySelector(`.transcript-segment[data-segment="${index}"]`);
    if (segment) {
      segment.classList.add('active');
      segment.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  clearHighlights() {
    document.querySelectorAll('.voice-highlight').forEach(el => {
      el.classList.remove('voice-highlight');
    });
    document.querySelectorAll('.transcript-segment').forEach(seg => {
      seg.classList.remove('active');
    });
  }
  
  showTranscript() {
    const modal = document.getElementById('voice-transcript-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  hideTranscript() {
    const modal = document.getElementById('voice-transcript-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  addStyles() {
    if (document.getElementById('voice-guide-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'voice-guide-styles';
    style.textContent = `
      /* Language Selector */
      .language-selector {
        display: flex;
        gap: 5px;
        background: white;
        padding: 4px;
        border-radius: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 8px;
      }
      
      .lang-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 16px;
        background: transparent;
        color: #228B22;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .lang-btn:hover {
        background: #E8F5E9;
      }
      
      .lang-btn.active {
        background: linear-gradient(135deg, #228B22, #2EA82E);
        color: white;
      }
      
      /* Voice Widget */
      .voice-widget {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      
      .voice-widget-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .voice-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #228B22, #2EA82E);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 24px;
        box-shadow: 0 4px 20px rgba(34, 139, 34, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }
      
      .voice-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(34, 139, 34, 0.6);
      }
      
      .voice-btn.active {
        background: linear-gradient(135deg, #1B6B1B, #228B22);
      }
      
      /* Waveform Animation */
      .voice-waveform {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
      }
      
      .voice-waveform.active {
        opacity: 1;
      }
      
      .voice-waveform span {
        width: 3px;
        height: 20px;
        background: rgba(34, 139, 34, 0.6);
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
      }
      
      .voice-waveform span:nth-child(1) { animation-delay: 0s; }
      .voice-waveform span:nth-child(2) { animation-delay: 0.1s; }
      .voice-waveform span:nth-child(3) { animation-delay: 0.2s; }
      .voice-waveform span:nth-child(4) { animation-delay: 0.3s; }
      
      @keyframes wave {
        0%, 100% { height: 20px; }
        50% { height: 40px; }
      }
      
      /* Voice Controls */
      .voice-controls {
        display: flex;
        gap: 8px;
        background: white;
        padding: 8px;
        border-radius: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      
      .voice-control-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #F5F5F5;
        color: #228B22;
        border: none;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .voice-control-btn:hover {
        background: #228B22;
        color: white;
        transform: scale(1.1);
      }
      
      /* Transcript Modal */
      .voice-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .voice-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }
      
      .voice-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #E0E0E0;
      }
      
      .voice-modal-header h3 {
        margin: 0;
        color: #228B22;
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .close-modal-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #95A5A6;
        cursor: pointer;
        transition: color 0.3s ease;
      }
      
      .close-modal-btn:hover {
        color: #2C3E50;
      }
      
      .voice-modal-body {
        padding: 24px;
        overflow-y: auto;
      }
      
      .transcript-segment {
        display: flex;
        gap: 16px;
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 8px;
        background: #F5F5F5;
        transition: all 0.3s ease;
      }
      
      .transcript-segment.active {
        background: #E8F5E9;
        border-left: 4px solid #228B22;
      }
      
      .segment-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #228B22;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .transcript-segment.active .segment-number {
        background: #1B6B1B;
      }
      
      .transcript-segment p {
        margin: 0;
        color: #2C3E50;
        line-height: 1.6;
      }
      
      /* Voice Highlight Effect */
      .voice-highlight {
        animation: pulse-highlight 2s ease-in-out;
        position: relative;
      }
      
      @keyframes pulse-highlight {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(34, 139, 34, 0);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(34, 139, 34, 0.3);
        }
      }
      
      /* Mobile Responsive */
      @media (max-width: 768px) {
        .voice-widget {
          bottom: 20px;
          right: 20px;
        }
        
        .voice-btn {
          width: 50px;
          height: 50px;
          font-size: 20px;
        }
        
        .voice-waveform {
          width: 70px;
          height: 70px;
        }
        
        .voice-control-btn {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
        
        .voice-modal-content {
          max-width: 100%;
          max-height: 90vh;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize voice guide when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for voices to load
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
      window.voiceGuide = new VoiceGuide();
    };
    
    // Fallback if voices are already loaded
    setTimeout(() => {
      if (!window.voiceGuide) {
        window.voiceGuide = new VoiceGuide();
      }
    }, 100);
  }
});

console.log('✅ Voice Guide feature loaded successfully!');
