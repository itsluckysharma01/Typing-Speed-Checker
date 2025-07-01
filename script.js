const typingText = document.querySelector(".typing-text p");
const input = document.querySelector(".wrapper .input-field");
const time = document.querySelector(".time span b");
const mistakes = document.querySelector(".mistake span");
const wpm = document.querySelector(".wpm span");
const cpm = document.querySelector(".cpm span");
const accuracySpan = document.querySelector(".accuracy span");
const btn = document.querySelector(".reset-btn"); // Select Try Again button by class
const pauseBtn = document.querySelector(".pause-btn");

// Debug: Check if buttons are found
console.log("Reset button found:", btn);
console.log("Pause button found:", pauseBtn);
//set values
let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = mistake = 0;
let isTyping = false;
let totalTyped = 0;
let accuracy = 100;
let isPaused = false;


function loadParagraph() {
    const paragraph = [
        "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
        "Programming is the art of telling another human what one wants the computer to do.",
        "In the world of technology, adaptability and continuous learning are the keys to success.",
        "Typing fast and accurately is a valuable skill in today's digital world.",
        "Practice makes perfect, and with dedication, you can improve your typing speed significantly.",
        "The best way to predict the future is to create it through innovation and hard work.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Every expert was once a beginner who never gave up on their dreams and aspirations."
    ];

    const randomIndex = Math.floor(Math.random() * paragraph.length);
    //clear previous text
    typingText.innerHTML = '';

    for (const char of paragraph[randomIndex]) {
        console.log(char)
        typingText.innerHTML+= `<span>${char}</span>`;
    }

    typingText.querySelectorAll('span')[0].classList.add('active');
    document.addEventListener("keydown", () => input.focus());
    typingText.addEventListener("click", () => { input.focus()})
    
    // Add visual feedback
    showMessage("Start typing to begin the test!", "info");
    
    // Hide pause button initially
    pauseBtn.style.display = 'none';
}

//handle user input
function initTyping() {
    if (isPaused) return; // Don't process input when paused
    
    const char=typingText.querySelectorAll('span');
    const typedChar = input.value.charAt(charIndex);

    if (charIndex < char.length  && timeLeft > 0) {

        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
            hideMessage();
            pauseBtn.style.display = 'block'; // Show pause button when typing starts
        }

        // Remove previous active class
        char.forEach(c => c.classList.remove('active'));

        if (char[charIndex].innerText === typedChar) {
            char[charIndex].classList.add('correct');
            playSound('correct');
            console.log("correct");
        }
        else {
            mistake++;
            char[charIndex].classList.add('incorrect');
            playSound('incorrect');
            console.log('incorrect')
        }
        
        charIndex++;
        totalTyped++;
        
        // Add active class to next character
        if (charIndex < char.length) {
            char[charIndex].classList.add('active');
        }

        // Update stats in real-time
        updateStats();

        // Check if paragraph is completed
        if (charIndex >= char.length) {
            completeTest();
        }
    }
    else {
        clearInterval(timer);
        input.value = '';
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        time.innerText = timeLeft;
        updateStats();
        
        // Add urgency when time is running low
        if (timeLeft <= 10) {
            time.parentElement.style.color = '#ff4444';
            time.parentElement.style.animation = 'pulse 1s infinite';
        }
    } 
    else {
        completeTest();
    }
}

// New function to update stats in real-time
function updateStats() {
    const timeElapsed = maxTime - timeLeft;
    
    if (timeElapsed > 0) {
        const wpmVal = Math.round(((charIndex - mistake) / 5) / (timeElapsed / 60));
        wpm.innerText = wpmVal >= 0 ? wpmVal : 0;
    }
    
    accuracy = totalTyped > 0 ? Math.round(((totalTyped - mistake) / totalTyped) * 100) : 100;
    mistakes.innerText = mistake;
    cpm.innerText = charIndex - mistake;
    accuracySpan.innerText = accuracy + '%';
}

// New function to handle test completion
function completeTest() {
    clearInterval(timer);
    input.disabled = true;
    isTyping = false;
    isPaused = false;
    pauseBtn.style.display = 'none'; // Hide pause button when test is complete
    pauseBtn.textContent = 'Pause';
    pauseBtn.classList.remove('paused');
    
    const timeElapsed = maxTime - timeLeft;
    const finalWpm = timeElapsed > 0 ? Math.round(((charIndex - mistake) / 5) / (timeElapsed / 60)) : 0;
    const finalCpm = timeElapsed > 0 ? Math.round((charIndex - mistake) / (timeElapsed / 60)) : 0;
    
    wpm.innerText = finalWpm;
    cpm.innerText = finalCpm;
    
    // Show completion message with stats
    let message = `🎉 Test Complete! 
    WPM: ${finalWpm} | CPM: ${finalCpm} | Accuracy: ${accuracy}%`;
    
    if (finalWpm >= 60) {
        message += " - Excellent typing speed! 🚀";
        showMessage(message, "success");
    } else if (finalWpm >= 40) {
        message += " - Good typing speed! 👍";
        showMessage(message, "success");
    } else {
        message += " - Keep practicing to improve! 💪";
        showMessage(message, "warning");
    }
    
    // Enable input after showing results
    setTimeout(() => {
        input.disabled = false;
    }, 2000);
}

// Sound feedback function
function playSound(type) {
    // Create audio context for sound feedback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    } else {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Message display function
function showMessage(text, type = 'info') {
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        document.querySelector('.wrapper').insertBefore(messageDiv, document.querySelector('.content-box'));
    }
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function hideMessage() {
    const messageDiv = document.querySelector('.message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}

function reset(){
    console.log("Reset function called!"); // Debug log
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistake = totalTyped = 0;
    accuracy = 100;
    isTyping = false;
    isPaused = false;
    input.value = '';
    input.disabled = false;
    time.innerText = timeLeft;
    
    // Reset pause button and wrapper state
    const wrapper = document.querySelector('.wrapper');
    pauseBtn.textContent = 'Pause';
    pauseBtn.classList.remove('paused');
    pauseBtn.style.display = 'none'; // Hide pause button until typing starts
    wrapper.classList.remove('paused');
    
    // Reset styling
    time.parentElement.style.color = '';
    time.parentElement.style.animation = '';

    mistakes.innerText = 0;
    wpm.innerText = 0;
    cpm.innerText = 0;
    accuracySpan.innerText = '100%';
    
    hideMessage();
    
    // Add animation to the reset
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
}

// Pause/Resume functionality
function togglePause() {
    if (!isTyping) return; // Can't pause if not typing
    
    const wrapper = document.querySelector('.wrapper');
    
    if (isPaused) {
        // Resume
        isPaused = false;
        timer = setInterval(initTimer, 1000);
        input.disabled = false;
        input.focus();
        pauseBtn.textContent = 'Pause';
        pauseBtn.classList.remove('paused');
        wrapper.classList.remove('paused');
        showMessage("Test resumed! Continue typing...", "info");
        setTimeout(() => hideMessage(), 2000);
    } else {
        // Pause
        isPaused = true;
        clearInterval(timer);
        input.disabled = true;
        pauseBtn.textContent = 'Resume';
        pauseBtn.classList.add('paused');
        wrapper.classList.add('paused');
        showMessage("Test paused. Click Resume to continue.", "warning");
    }
}

input.addEventListener("input", initTyping);

// Add event listeners with error checking
if (btn) {
    btn.addEventListener("click", reset);
    console.log("Reset button event listener attached");
} else {
    console.error("Reset button not found!");
}

if (pauseBtn) {
    pauseBtn.addEventListener("click", togglePause);
    console.log("Pause button event listener attached");
} else {
    console.error("Pause button not found!");
}

// Add keyboard shortcuts and additional interactivity
document.addEventListener('keydown', (e) => {
    // Escape key to reset
    if (e.key === 'Escape') {
        reset();
    }
    
    // Enter key to start new test when current is complete
    if (e.key === 'Enter' && (!isTyping || charIndex >= typingText.querySelectorAll('span').length)) {
        reset();
    }
    
    // Spacebar to pause/resume (when Ctrl is held)
    if (e.key === ' ' && e.ctrlKey && isTyping) {
        e.preventDefault();
        togglePause();
    }
    
    // Prevent backspace from going back in browser
    if (e.key === 'Backspace' && e.target === input && !isPaused) {
        e.preventDefault();
        // Allow backspace only if not at the beginning
        if (charIndex > 0 && input.value.length > 0) {
            input.value = input.value.slice(0, -1);
            charIndex--;
            
            // Update visual feedback
            const chars = typingText.querySelectorAll('span');
            chars[charIndex].classList.remove('correct', 'incorrect');
            chars.forEach(c => c.classList.remove('active'));
            chars[charIndex].classList.add('active');
            
            // Recalculate stats
            if (totalTyped > 0) totalTyped--;
            updateStats();
        }
    }
});

// Add focus management
window.addEventListener('load', () => {
    input.focus();
});

// Prevent context menu on typing area
typingText.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

loadParagraph();