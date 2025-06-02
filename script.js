// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const project = formData.get('project');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Simulate form submission
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('Thank you for your message! I\'ll get back to you soon.');
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Add scroll effect to navigation
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        nav.style.background = 'rgba(12, 12, 12, 0.98)';
    } else {
        nav.style.background = 'rgba(12, 12, 12, 0.95)';
    }
    
    lastScrollY = currentScrollY;
});

// Custom Video Player Modal functionality
document.querySelectorAll('.video-item').forEach(item => {
    item.addEventListener('click', function() {
        const videoSrc = this.getAttribute('data-video');
        openCustomVideoModal(videoSrc);
    });
});

function openCustomVideoModal(videoSrc) {
    // Create modal overlay if it doesn't exist
    let modalOverlay = document.getElementById('customVideoModalOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'customVideoModalOverlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <button class="close-btn" onclick="closeCustomVideoModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="video-container">
                <div class="video-player">
                    <video id="videoElement" preload="metadata">
                        <source src="${videoSrc}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    
                    <div class="controls" id="videoControls">
                        <div class="seek-container" onclick="seekVideo(event)">
                            <div class="seek-bar" id="seekBar">
                                <div class="seek-handle" id="seekHandle"></div>
                            </div>
                        </div>
                        
                        <div class="control-buttons">
                            <button class="control-btn play-btn" id="playBtn" onclick="togglePlay()">
                                <i class="fas fa-play"></i>
                            </button>
                            
                            <div class="volume-container">
                                <button class="control-btn volume-btn" id="volumeBtn" onclick="toggleMute()">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                                <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100" oninput="changeVolume(this.value)">
                            </div>
                            
                            <div class="time-display">
                                <span id="currentTime">0:00</span>
                                <span class="time-divider">/</span>
                                <span id="duration">0:00</span>
                            </div>
                            
                            <div class="spacer"></div>
                            
                            <button class="control-btn fullscreen-btn" onclick="toggleFullscreen()">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        
        // Initialize the video player
        initializeVideoPlayer();
    } else {
        // Update video source if modal exists
        const videoElement = modalOverlay.querySelector('#videoElement');
        videoElement.src = videoSrc;
        videoElement.load();
    }
    
    // Show the modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Autoplay video when modal is shown and update play button icon
    const videoElement = modalOverlay.querySelector('#videoElement');
    const playBtn = modalOverlay.querySelector('#playBtn');
    
    videoElement.play().then(() => {
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }).catch(err => {
        console.log('Autoplay prevented:', err);
    });
}

function closeCustomVideoModal() {
    const modalOverlay = document.getElementById('customVideoModalOverlay');
    if (modalOverlay) {
        const video = modalOverlay.querySelector('#videoElement');
        video.pause();
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Video player functions (from videoplayer.html)
function initializeVideoPlayer() {
    const video = document.getElementById('videoElement');
    const playBtn = document.getElementById('playBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const seekBar = document.getElementById('seekBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const seekHandle = document.getElementById('seekHandle');
    
    let isDragging = false;
    let isSeeking = false;
    let animationId = null;
    let lastVolumeBeforeMute = 100;
    
    function togglePlay() {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            startProgressAnimation();
        } else {
            video.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    }
    
    function toggleMute() {
        if (video.muted) {
            video.muted = false;
            video.volume = lastVolumeBeforeMute / 100;
            volumeSlider.value = lastVolumeBeforeMute;
            updateVolumeButton(lastVolumeBeforeMute);
        } else {
            lastVolumeBeforeMute = video.volume * 100;
            video.muted = true;
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            volumeSlider.value = 0;
        }
    }
    
    function changeVolume(value) {
        const volumeValue = parseInt(value);
        video.volume = volumeValue / 100;
        video.muted = volumeValue === 0;
        updateVolumeButton(volumeValue);
        if (volumeValue > 0) {
            lastVolumeBeforeMute = volumeValue;
        }
    }
    
    function updateVolumeButton(value) {
        if (value == 0) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (value < 50) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    function seekVideo(e) {
        if (!isSeeking) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        }
    }
    
    function handleSeekStart(e) {
        isSeeking = true;
        isDragging = true;
        seekBar.classList.add('dragging');
        document.querySelector('.seek-container').classList.add('dragging');
        updateSeekPosition(e);
        e.preventDefault();
    }
    
    function handleSeekMove(e) {
        if (isSeeking) {
            updateSeekPosition(e);
        }
    }
    
    function handleSeekEnd() {
        if (isSeeking) {
            isSeeking = false;
            isDragging = false;
            seekBar.classList.remove('dragging');
            document.querySelector('.seek-container').classList.remove('dragging');
            if (!video.paused) {
                video.play();
            }
        }
    }
    
    function updateSeekPosition(e) {
        const seekContainer = document.querySelector('.seek-container');
        const rect = seekContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        seekBar.style.width = (pos * 100) + '%';
        video.currentTime = pos * video.duration;
        updateTimeDisplays();
    }
    
    function updateProgress() {
        if (!isDragging && video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            seekBar.style.width = progress + '%';
        }
    }
    
    function startProgressAnimation() {
        function animate() {
            if (!video.paused && !video.ended) {
                updateProgress();
                updateTimeDisplays();
                animationId = requestAnimationFrame(animate);
            }
        }
        animationId = requestAnimationFrame(animate);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function updateTimeDisplays() {
        currentTimeDisplay.textContent = formatTime(video.currentTime);
        if (video.duration) {
            durationDisplay.textContent = formatTime(video.duration);
        }
    }
    
    function toggleFullscreen() {
        const modalOverlay = document.getElementById('customVideoModalOverlay');
        if (!document.fullscreenElement) {
            modalOverlay.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Event listeners
    video.addEventListener('timeupdate', () => {
        if (!animationId) {
            updateProgress();
            updateTimeDisplays();
        }
    });
    
    video.addEventListener('loadedmetadata', () => {
        updateTimeDisplays();
    });
    
    video.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    video.addEventListener('play', () => {
        startProgressAnimation();
    });
    
    video.addEventListener('pause', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    // Draggable seek bar event listeners
    seekBar.addEventListener('mousedown', handleSeekStart);
    seekHandle.addEventListener('mousedown', handleSeekStart);
    document.addEventListener('mousemove', handleSeekMove);
    document.addEventListener('mouseup', handleSeekEnd);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('customVideoModalOverlay')?.classList.contains('active')) {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyM':
                    toggleMute();
                    break;
                case 'KeyF':
                    toggleFullscreen();
                    break;
                case 'Escape':
                    closeCustomVideoModal();
                    break;
            }
        }
    });
    
    // Make functions available globally
    window.togglePlay = togglePlay;
    window.toggleMute = toggleMute;
    window.changeVolume = changeVolume;
    window.seekVideo = seekVideo;
    window.toggleFullscreen = toggleFullscreen;
    window.closeCustomVideoModal = closeCustomVideoModal;
}

document.getElementById('logo')?.addEventListener('click', () => {
    // Reload current page with #home hash forcibly
    location.href = window.location.pathname + window.location.search + '#home';
    location.reload(); // This reloads the page with the new hash
});

// Close modal when clicking outside the video
window.addEventListener('click', function(event) {
    const modalOverlay = document.getElementById('customVideoModalOverlay');
    if (event.target === modalOverlay) {
        closeCustomVideoModal();
    }
});