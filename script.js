document.addEventListener('DOMContentLoaded', () => {
    const flashcard = document.querySelector('.flashcard');
    const knowBtn = document.querySelector('.know-btn');
    const dontKnowBtn = document.querySelector('.dont-know-btn');
    const currentCardSpan = document.querySelector('.current-card');
    const totalCardsSpan = document.querySelector('.total-cards');
    const flashcardInner = document.querySelector('.flashcard-inner');

    // Sample flashcards data (you can replace this with your own data)
    const flashcards = [
        {
            question: "What is the capital of France?",
            answer: "Paris"
        },
        {
            question: "What is the largest planet in our solar system?",
            answer: "Jupiter"
        },
        {
            question: "Who painted the Mona Lisa?",
            answer: "Leonardo da Vinci"
        }
    ];

    let currentCardIndex = 0;
    let isFlipped = false;

    // Initialize progress tracking
    const progressKey = 'flashcardProgress';
    let progress = JSON.parse(localStorage.getItem(progressKey)) || {
        known: [],
        review: [],
        lastStudy: null
    };

    // Update total cards count
    totalCardsSpan.textContent = flashcards.length;

    // Function to update card content
    function updateCard() {
        const card = flashcards[currentCardIndex];
        document.querySelector('.flashcard-front p').textContent = card.question;
        document.querySelector('.flashcard-back p').textContent = card.answer;
        currentCardSpan.textContent = currentCardIndex + 1;
        
        // Reset card to front side
        if (isFlipped) {
            flashcard.classList.remove('flipped');
            isFlipped = false;
        }
    }

    // Function to flip card
    function flipCard() {
        isFlipped = !isFlipped;
        flashcard.classList.toggle('flipped');
        // Reset tilt effect when flipping
        flashcardInner.style.transform = isFlipped ? 
            'rotateY(180deg)' : 
            'rotateY(0deg)';
    }

    // Function to show confetti
    function showConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Function to log progress
    function logProgress(action) {
        const timestamp = new Date().toISOString();
        const cardData = {
            cardIndex: currentCardIndex,
            timestamp: timestamp,
            question: flashcards[currentCardIndex].question
        };

        if (action === 'known') {
            progress.known.push(cardData);
            console.log('Card marked as KNOWN! 🧠✅');
            showConfetti();
        } else {
            progress.review.push(cardData);
            console.log('Card marked for REVIEW! ⚠️');
        }

        progress.lastStudy = timestamp;
        localStorage.setItem(progressKey, JSON.stringify(progress));
    }

    // Function to navigate cards
    function navigateCards(direction) {
        if (direction === 'next' && currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            updateCard();
        } else if (direction === 'prev' && currentCardIndex > 0) {
            currentCardIndex--;
            updateCard();
        }
    }

    // 3D tilt effect
    function handleMouseMove(e) {
        if (isFlipped) return; // Don't apply tilt when card is flipped
        
        const rect = flashcard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        flashcardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handleMouseLeave() {
        if (!isFlipped) {
            flashcardInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        }
    }

    // Event Listeners
    flashcard.addEventListener('click', (e) => {
        e.preventDefault();
        flipCard();
    });

    flashcard.addEventListener('mousemove', handleMouseMove);
    flashcard.addEventListener('mouseleave', handleMouseLeave);

    knowBtn.addEventListener('click', () => {
        logProgress('known');
        navigateCards('next');
    });

    dontKnowBtn.addEventListener('click', () => {
        logProgress('review');
        navigateCards('next');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                flipCard();
                break;
            case 'ArrowRight':
                navigateCards('next');
                break;
            case 'ArrowLeft':
                navigateCards('prev');
                break;
            case 'KeyK':
                logProgress('known');
                navigateCards('next');
                break;
            case 'KeyR':
                logProgress('review');
                navigateCards('next');
                break;
        }
    });

    // Initialize first card
    updateCard();
});
