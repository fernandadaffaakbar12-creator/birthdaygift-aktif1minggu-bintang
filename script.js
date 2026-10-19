// ==========================================
// BACKGROUND KERLAP-KERLIP BINTANG & SHOOTING STARS
// ==========================================
(function initStarfield() {
    function setupCanvas() {
        const canvas = document.getElementById('starfield-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let stars = [];
        let shootingStars = [];
        let animationFrameId = null;
        let lastTime = performance.now();
        let nextShootingStarTime = performance.now() + 2000;

        // Palette warna bintang (putih berlian murni & kristal cemerlang pada langit hitam pekat)
        const STAR_COLORS = [
            { r: 255, g: 255, b: 255 }, // Putih murni
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 255, b: 255 },
            { r: 245, g: 250, b: 255 }, // Putih keperakan
            { r: 255, g: 250, b: 235 }  // Putih kristal hangat
        ];

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            generateStars();
        }

        function generateStars() {
            stars = [];
            // Kerapatan bintang adaptif: ~130 di HP kecil, hingga ~260 di layar laptop/desktop besar
            const count = Math.min(Math.max(Math.floor((width * height) / 5000), 130), 260);

            for (let i = 0; i < count; i++) {
                const colorObj = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
                const typeRoll = Math.random();
                let radius, isSparkle, hasAura;

                if (typeRoll < 0.65) {
                    // Bintang mikro / debu galaksi halus
                    radius = 0.65 + Math.random() * 0.6;
                    isSparkle = false;
                    hasAura = false;
                } else if (typeRoll < 0.88) {
                    // Bintang sedang dengan halo lembut
                    radius = 1.3 + Math.random() * 0.9;
                    isSparkle = false;
                    hasAura = true;
                } else {
                    // Bintang hero berkilau 4-titik (cross flare)
                    radius = 2.4 + Math.random() * 1.4;
                    isSparkle = true;
                    hasAura = true;
                }

                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    baseRadius: radius,
                    r: colorObj.r,
                    g: colorObj.g,
                    b: colorObj.b,
                    baseAlpha: 0.2 + Math.random() * 0.35,
                    maxAlpha: 0.85 + Math.random() * 0.15,
                    twinkleSpeed: 0.015 + Math.random() * 0.035,
                    phase: Math.random() * Math.PI * 2,
                    isSparkle: isSparkle,
                    hasAura: hasAura,
                    sparkleAngle: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.005,
                    vx: (Math.random() - 0.5) * 0.035,
                    vy: (Math.random() - 0.5) * 0.035
                });
            }
        }

        function createShootingStar() {
            const startX = Math.random() * (width * 0.9);
            const startY = Math.random() * (height * 0.35);
            const angle = (Math.PI / 180) * (32 + Math.random() * 16);
            const speed = 11 + Math.random() * 6;
            const length = 80 + Math.random() * 60;

            shootingStars.push({
                x: startX,
                y: startY,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                length: length,
                speed: speed,
                opacity: 1,
                fadeSpeed: 0.02 + Math.random() * 0.015,
                trailWidth: 1.5 + Math.random() * 0.8
            });
        }

        function drawSparkle(x, y, radius, alpha, angle, r, g, b) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            const armLength = radius * (2.8 + Math.sin(angle * 2) * 0.5);
            const armWidth = Math.max(0.6, radius * 0.3);

            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, armLength);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = grad;

            // Sayap vertikal
            ctx.beginPath();
            ctx.moveTo(0, -armLength);
            ctx.quadraticCurveTo(armWidth, 0, armWidth * 0.2, 0);
            ctx.quadraticCurveTo(armWidth, 0, 0, armLength);
            ctx.quadraticCurveTo(-armWidth, 0, -armWidth * 0.2, 0);
            ctx.quadraticCurveTo(-armWidth, 0, 0, -armLength);
            ctx.fill();

            // Sayap horizontal
            ctx.beginPath();
            ctx.moveTo(-armLength, 0);
            ctx.quadraticCurveTo(0, armWidth, 0, armWidth * 0.2);
            ctx.quadraticCurveTo(0, armWidth, armLength, 0);
            ctx.quadraticCurveTo(0, -armWidth, 0, -armWidth * 0.2);
            ctx.quadraticCurveTo(0, -armWidth, -armLength, 0);
            ctx.fill();

            ctx.restore();
        }

        function render(currentTime) {
            lastTime = currentTime;
            ctx.clearRect(0, 0, width, height);

            // 1. Gambar bintang berkelap-kelip
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                s.phase += s.twinkleSpeed;
                if (s.phase > Math.PI * 2) s.phase -= Math.PI * 2;

                if (s.isSparkle) {
                    s.sparkleAngle += s.rotSpeed;
                }

                s.x += s.vx;
                s.y += s.vy;
                if (s.x < 0) s.x = width;
                else if (s.x > width) s.x = 0;
                if (s.y < 0) s.y = height;
                else if (s.y > height) s.y = 0;

                const sinVal = (Math.sin(s.phase) + 1) * 0.5;
                const alpha = s.baseAlpha + (s.maxAlpha - s.baseAlpha) * sinVal;
                const currentR = s.baseRadius * (0.85 + 0.3 * sinVal);

                // Halo lembut untuk bintang bercahaya
                if (s.hasAura && alpha > 0.35) {
                    const haloRadius = currentR * 3;
                    const haloGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloRadius);
                    haloGrad.addColorStop(0, `rgba(${s.r}, ${s.g}, ${s.b}, ${alpha * 0.45})`);
                    haloGrad.addColorStop(0.5, `rgba(${s.r}, ${s.g}, ${s.b}, ${alpha * 0.15})`);
                    haloGrad.addColorStop(1, `rgba(${s.r}, ${s.g}, ${s.b}, 0)`);

                    ctx.beginPath();
                    ctx.arc(s.x, s.y, haloRadius, 0, Math.PI * 2);
                    ctx.fillStyle = haloGrad;
                    ctx.fill();
                }

                // Efek 4-point cross sparkle (✦) untuk bintang hero
                if (s.isSparkle && alpha > 0.4) {
                    drawSparkle(s.x, s.y, currentR, alpha * 0.85, s.sparkleAngle, s.r, s.g, s.b);
                }

                // Titik bintang
                ctx.beginPath();
                ctx.arc(s.x, s.y, currentR, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.r}, ${s.g}, ${s.b}, ${alpha})`;
                ctx.fill();
            }

            // 2. Bintang jatuh berkala
            if (currentTime > nextShootingStarTime) {
                createShootingStar();
                nextShootingStarTime = currentTime + 3500 + Math.random() * 3200;
            }

            // 3. Render bintang jatuh
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];

                ss.x += ss.dx;
                ss.y += ss.dy;
                ss.opacity -= ss.fadeSpeed;

                if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                const tailX = ss.x - (ss.dx / ss.speed) * ss.length;
                const tailY = ss.y - (ss.dy / ss.speed) * ss.length;

                const trailGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
                trailGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
                trailGrad.addColorStop(0.6, `rgba(255, 255, 255, ${ss.opacity * 0.45})`);
                trailGrad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(ss.x, ss.y);
                ctx.strokeStyle = trailGrad;
                ctx.lineWidth = ss.trailWidth;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Inti kepala bintang jatuh
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, ss.trailWidth * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        }

        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 150);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            } else {
                lastTime = performance.now();
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(render);
                }
            }
        });

        resize();
        animationFrameId = requestAnimationFrame(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCanvas);
    } else {
        setupCanvas();
    }
})();

// ==========================================
// 0. ANIMASI LOADING "I LOVE YOU" MEMBENTUK HATI
// ==========================================
(function () {
    const PARTICLE_COUNT = 80;
    const LOVE_TEXTS = ['nia', 'i love u', 'oktaviani', 'ily', '♡', 'luv u', 'cantik', 'nia'];

    // Parametric heart shape formula
    function heartX(t) {
        return 16 * Math.pow(Math.sin(t), 3);
    }
    function heartY(t) {
        return -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    }

    function mulaiAnimasiLoading() {
        const container = document.getElementById('love-particles-container');
        const loadingScreen = document.getElementById('love-loading-screen');
        const tapText = document.getElementById('loading-tap-text');
        if (!container || !loadingScreen) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const centerX = vw / 2;
        const centerY = vh / 2;
        const scale = Math.min(vw, vh) * 0.018;

        const particles = [];

        // Generate heart shape target positions (relative to center)
        const heartPoints = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const t = (i / PARTICLE_COUNT) * Math.PI * 2;
            heartPoints.push({
                x: heartX(t) * scale,
                y: heartY(t) * scale - 20
            });
        }

        // Build all particles in a document fragment (single DOM insert)
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const el = document.createElement('span');
            el.classList.add('love-particle');
            el.textContent = LOVE_TEXTS[Math.floor(Math.random() * LOVE_TEXTS.length)];

            const fontSize = 8 + Math.random() * 6;
            el.style.fontSize = fontSize + 'px';

            // All particles start at center, use transform for positioning
            el.style.left = centerX + 'px';
            el.style.top = centerY + 'px';

            // Scatter offset from center (bottom area)
            const scatterX = -centerX + Math.random() * vw;
            const scatterY = vh * 0.1 + Math.random() * vh * 0.4;
            const rotation = -30 + Math.random() * 60;

            // Random color
            const colors = [
                'rgba(255, 182, 193, 0.9)',
                'rgba(255, 150, 180, 0.85)',
                'rgba(255, 200, 220, 0.8)',
                'rgba(220, 160, 255, 0.7)',
                'rgba(255, 255, 255, 0.6)',
                'rgba(255, 130, 170, 0.9)'
            ];
            el.style.color = colors[Math.floor(Math.random() * colors.length)];

            fragment.appendChild(el);
            particles.push({
                el: el,
                scatterX: scatterX,
                scatterY: scatterY,
                rotation: rotation,
                heartX: heartPoints[i].x,
                heartY: heartPoints[i].y
            });
        }

        container.appendChild(fragment);

        // Phase 1: Show scattered particles with staggered fade-in
        requestAnimationFrame(() => {
            particles.forEach((p, i) => {
                setTimeout(() => {
                    p.el.style.transform = 'translate(' + p.scatterX + 'px, ' + p.scatterY + 'px) rotate(' + p.rotation + 'deg)';
                    p.el.classList.add('scattered');
                }, 50 + i * 12);
            });
        });

        // Phase 2: Float particles upward slightly (1.5s)
        setTimeout(() => {
            particles.forEach(p => {
                const driftX = p.scatterX + (-40 + Math.random() * 80);
                const driftY = p.scatterY - (20 + Math.random() * 60);
                p.el.style.transform = 'translate(' + driftX + 'px, ' + driftY + 'px) rotate(' + (p.rotation * 0.5) + 'deg)';
            });
        }, 1500);

        // Phase 3: Form the heart shape (3s)
        setTimeout(() => {
            particles.forEach((p, i) => {
                const staggerDelay = (i / PARTICLE_COUNT) * 1000;
                p.el.style.transitionDuration = '2.5s';
                p.el.style.transitionDelay = staggerDelay + 'ms';

                setTimeout(() => {
                    p.el.style.transform = 'translate(' + p.heartX + 'px, ' + p.heartY + 'px) rotate(0deg) scale(1)';
                    p.el.classList.remove('scattered');
                    p.el.classList.add('formed');
                }, 30);
            });
        }, 3000);

        // Phase 4: Add glow pulse & sparkles after heart is formed (6.5s)
        setTimeout(() => {
            particles.forEach((p, i) => {
                p.el.classList.add('glow-pulse');
            });

            buatSparkles(container, heartPoints, centerX, centerY);
            if (tapText) tapText.classList.add('show');
        }, 6500);

        // Click/tap to dismiss with planet transition
        let bisaDismiss = false;
        setTimeout(() => { bisaDismiss = true; }, 6000);
        loadingScreen.addEventListener('click', function () {
            if (!bisaDismiss) return;
            bisaDismiss = false;

            if (tapText) tapText.classList.remove('show');

            // Phase A: SUCK particles into the center
            particles.forEach((p) => {
                p.el.style.transitionDuration = '0.8s';
                p.el.style.transitionDelay = (Math.random() * 150) + 'ms';
                p.el.style.transitionTimingFunction = 'cubic-bezier(0.5, 0, 1, 0.5)';
                p.el.style.transform = 'translate(0px, 0px) scale(0) rotate(180deg)';
                p.el.style.opacity = '0';
            });

            // Phase B: Fade out screen
            setTimeout(() => {
                loadingScreen.style.transition = 'opacity 1s ease';
                loadingScreen.style.opacity = '0';
            }, 800);

            // Phase C: Show PIN screen instead of landing page
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                const pinScreen = document.getElementById('pin-screen');
                if (pinScreen) {
                    pinScreen.style.display = 'flex';
                    // Delay sedikit agar transisi CSS jalan
                    setTimeout(() => {
                        pinScreen.classList.add('active');
                    }, 50);
                }
            }, 1800);
        });

        // ==========================================
        // PIN VALIDATION LOGIC (Pop-Up Notifikasi)
        // ==========================================
        const pinInput = document.getElementById('pin-input');
        const pinPopupOverlay = document.getElementById('pin-popup-overlay');
        const pinPopupBox = document.getElementById('pin-popup-box');
        const pinPopupImg = document.getElementById('pin-popup-img');
        const pinPopupEmoji = document.getElementById('pin-popup-emoji');
        const pinPopupMsg = document.getElementById('pin-popup-msg');
        const pinPopupClose = document.getElementById('pin-popup-close');

        // DEFAULT PIN: Silakan ubah angka ini jika ingin PIN lain
        const SECRET_PIN = "1320";

        let pinAttempt = 0;
        let popupTimeout = null;

        // Konfigurasi pesan & tampilan setiap percobaan salah
        const wrongConfigs = [
            {
                // Percobaan pertama: tampilkan foto kucing
                showCat: true,
                emoji: '',
                message: 'Masa udah lupa tanggal lahir aku?',
                buttonText: 'Iya iya maaf 😭'
            },
            {
                // Percobaan kedua: foto kucing marah
                showCat: true,
                catSrc: 'img/cat-angry.png',
                emoji: '',
                message: 'Serius lupa?!\nYaudah coba lagi deh.',
                buttonText: 'Sekali lagi 🙏'
            },
            {
                // Percobaan ketiga+: foto kucing thumbs up
                showCat: true,
                catSrc: 'img/cat-thumbsup.png',
                emoji: '',
                message: 'Kalau masih salah,\nketerlaluan sih.',
                buttonText: 'Ampun 😭'
            }
        ];

        function showPinPopup(config, isSuccess) {
            // Bersihkan timeout sebelumnya
            if (popupTimeout) clearTimeout(popupTimeout);

            // Reset semua state
            pinPopupBox.classList.remove('popup-success', 'shake-popup');
            pinPopupImg.classList.remove('wiggle-cat', 'hidden-img');
            pinPopupEmoji.classList.remove('show-emoji');
            pinPopupEmoji.textContent = '';

            if (isSuccess) {
                // Tampilan sukses — pakai foto kucing senang
                pinPopupImg.src = 'img/cat-success.png';
                pinPopupImg.classList.remove('hidden-img');
                pinPopupBox.classList.add('popup-success');
                pinPopupMsg.textContent = config.message;
                pinPopupClose.textContent = config.buttonText;
                setTimeout(() => {
                    pinPopupImg.classList.add('wiggle-cat');
                }, 400);
            } else {
                // Tampilan salah
                if (config.showCat) {
                    // Tampilkan gambar kucing + animasi wiggle
                    pinPopupImg.src = config.catSrc || 'img/cat-warning.png';
                    pinPopupImg.classList.remove('hidden-img');
                    setTimeout(() => {
                        pinPopupImg.classList.add('wiggle-cat');
                    }, 400);
                } else {
                    // Sembunyikan gambar, tampilkan emoji
                    pinPopupImg.classList.add('hidden-img');
                    pinPopupEmoji.textContent = config.emoji;
                    pinPopupEmoji.classList.add('show-emoji');
                    // Tambah padding atas karena tidak ada gambar yang menonjol
                    pinPopupBox.style.paddingTop = '30px';
                }

                pinPopupMsg.textContent = config.message;
                pinPopupClose.textContent = config.buttonText;

                // Shake animation setelah muncul
                setTimeout(() => {
                    pinPopupBox.classList.add('shake-popup');
                }, 500);
            }

            // Tampilkan pop-up
            pinPopupOverlay.classList.add('show-popup');
        }

        function closePinPopup() {
            pinPopupOverlay.classList.remove('show-popup');
            if (popupTimeout) clearTimeout(popupTimeout);
            // Reset padding
            pinPopupBox.style.paddingTop = '';
        }

        // Event listener untuk tombol tutup
        if (pinPopupClose) {
            pinPopupClose.addEventListener('click', closePinPopup);
        }

        // Tutup pop-up dengan klik overlay (di luar box)
        if (pinPopupOverlay) {
            pinPopupOverlay.addEventListener('click', function (e) {
                if (e.target === pinPopupOverlay) {
                    closePinPopup();
                }
            });
        }

        if (pinInput) {
            pinInput.addEventListener('input', function () {
                if (pinInput.value.length === 4) {
                    // Delay sedikit agar digit terakhir terasa diketik
                    setTimeout(() => {
                        if (pinInput.value === SECRET_PIN) {
                            // PIN BENAR
                            showPinPopup({
                                message: 'Valid!\nLanjut yaa~',
                                buttonText: 'Lanjut 💕'
                            }, true);

                            const proceedAfterPin = () => {
                                closePinPopup();
                                setTimeout(() => {
                                    const pinScreen = document.getElementById('pin-screen');
                                    pinScreen.classList.remove('active');

                                    setTimeout(() => {
                                        pinScreen.style.display = 'none';
                                        if (typeof window.startMiniGame === 'function') {
                                            window.startMiniGame();
                                        } else {
                                            const landingPage = document.getElementById('landing-page');
                                            if (landingPage) landingPage.style.display = '';
                                        }
                                    }, 1000);
                                }, 300);
                            };

                            // Auto-close dan lanjut setelah 2 detik
                            popupTimeout = setTimeout(proceedAfterPin, 2000);

                            // Juga lanjut saat tombol diklik
                            pinPopupClose.onclick = proceedAfterPin;
                        } else {
                            // PIN SALAH
                            const configIndex = Math.min(pinAttempt, wrongConfigs.length - 1);
                            showPinPopup(wrongConfigs[configIndex], false);
                            pinAttempt++;

                            pinInput.classList.add('shake-animation');
                            setTimeout(() => pinInput.classList.remove('shake-animation'), 400);
                            pinInput.value = '';

                            // Reset tombol close ke default
                            pinPopupClose.onclick = closePinPopup;
                        }
                    }, 150);
                }
            });
        }
    }

    function buatSparkles(container, heartPoints, centerX, centerY) {
        const sparkleInterval = setInterval(() => {
            const sparkle = document.createElement('div');
            sparkle.classList.add('heart-sparkle');

            const randomPoint = heartPoints[Math.floor(Math.random() * heartPoints.length)];
            const offsetX = -15 + Math.random() * 30;
            const offsetY = -15 + Math.random() * 30;

            sparkle.style.left = (centerX + randomPoint.x + offsetX) + 'px';
            sparkle.style.top = (centerY + randomPoint.y + offsetY) + 'px';
            sparkle.style.animation = 'sparkleFloat ' + (1.5 + Math.random() * 1.5) + 's ease-out forwards';

            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 3000);
        }, 400);

        document.getElementById('love-loading-screen').addEventListener('click', () => {
            clearInterval(sparkleInterval);
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mulaiAnimasiLoading);
    } else {
        mulaiAnimasiLoading();
    }
})();

// ==========================================
// 1. FUNGSI FOTO MEMBESAR (LIGHTBOX) & PEMUTAR MUSIK
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const daftarFoto = document.querySelectorAll('.gallery-scroll img, .polaroid, .planet-card');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalIframe = document.getElementById('modal-iframe'); // Panggil elemen iframe
    const modalCaption = document.getElementById('modal-caption');

    if (daftarFoto.length > 0 && modal && modalImg) {
        daftarFoto.forEach(foto => {
            foto.addEventListener('click', function () {

                // Reset layar setiap kali diklik
                if (modalCaption) modalCaption.innerText = "";
                modalImg.style.display = 'block'; // Tampilkan foto sebagai default
                modalIframe.style.display = 'none'; // Sembunyikan musik sebagai default
                modalIframe.src = ""; // Kosongkan lagu sebelumnya

                // A. JIKA YANG DIKLIK ADALAH KARTU LAGU/VIDEO (Punya data-embed)
                if (this.classList.contains('planet-card') && this.hasAttribute('data-embed')) {
                    modalImg.style.display = 'none'; // Sembunyikan foto
                    modalIframe.style.display = 'block'; // Tampilkan alat musik/video

                    let embedUrl = this.getAttribute('data-embed');

                    // Hapus class lama
                    modalIframe.classList.remove('iframe-spotify', 'iframe-youtube', 'iframe-facebook', 'iframe-tiktok');

                    // Deteksi platform untuk penyesuaian rasio (16:9 untuk YouTube, Kotak untuk Spotify, 9:16 untuk Facebook/TikTok)
                    if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
                        modalIframe.classList.add('iframe-youtube');
                        if (embedUrl.includes('watch?v=')) {
                            const ytId = embedUrl.split('watch?v=')[1].split('&')[0];
                            embedUrl = `https://www.youtube.com/embed/${ytId}`;
                        } else if (embedUrl.includes('youtu.be/')) {
                            const ytId = embedUrl.split('youtu.be/')[1].split('?')[0];
                            embedUrl = `https://www.youtube.com/embed/${ytId}`;
                        }
                    } else if (embedUrl.includes('spotify.com')) {
                        modalIframe.classList.add('iframe-spotify');
                    } else if (embedUrl.includes('facebook.com')) {
                        modalIframe.classList.add('iframe-facebook');
                    } else if (embedUrl.includes('tiktok.com')) {
                        modalIframe.classList.add('iframe-tiktok');
                        // Otomatis ubah URL TikTok biasa (misal https://www.tiktok.com/@user/video/1234567890) ke embed player jika belum
                        const tiktokMatch = embedUrl.match(/(?:video\/|player\/v1\/|embed\/v2\/)(\d+)/);
                        if (tiktokMatch && tiktokMatch[1] && !embedUrl.includes('/player/v1/')) {
                            embedUrl = `https://www.tiktok.com/player/v1/${tiktokMatch[1]}`;
                        }
                    }

                    modalIframe.src = embedUrl; // Masukkan link

                    const customCaption = this.getAttribute('data-caption');
                    const teksCaption = customCaption ? customCaption : this.querySelector('.planet-caption').innerText;
                    if (modalCaption) modalCaption.innerText = teksCaption;
                }
                // B. JIKA YANG DIKLIK ADALAH KARTU 3D BIASA (Bukan Lagu)
                else if (this.classList.contains('planet-card')) {
                    modalImg.src = this.querySelector('img').src;
                    modalImg.style.aspectRatio = "1 / 1";
                    modalImg.style.objectFit = "cover";

                    const customCaption = this.getAttribute('data-caption');
                    const teksCaption = customCaption ? customCaption : this.querySelector('.planet-caption').innerText;
                    if (modalCaption) modalCaption.innerText = teksCaption;
                }
                // C. JIKA YANG DIKLIK ADALAH POLAROID
                else if (this.classList.contains('polaroid')) {
                    modalImg.src = this.querySelector('img').src;
                    modalImg.style.aspectRatio = "1 / 1";
                    modalImg.style.objectFit = "cover";

                    const caption = this.querySelector('.caption');
                    if (modalCaption && caption) modalCaption.innerText = caption.innerText;
                }
                // D. JIKA YANG DIKLIK ADALAH GALERI CINTA
                else {
                    modalImg.src = this.src;
                    modalImg.style.aspectRatio = "1 / 1";
                    modalImg.style.objectFit = "cover";
                }

                modal.classList.add('show-modal');
            });
        });
    }

    const semuaTeksKetikan = document.querySelectorAll('.typing-text');
    semuaTeksKetikan.forEach(el => {
        el.setAttribute('data-teks', el.innerHTML);
        el.innerHTML = '';
    });
});

// Fungsi Menutup Layar & Mematikan Lagu
function tutupModal() {
    const modal = document.getElementById('image-modal');
    const modalIframe = document.getElementById('modal-iframe');

    if (modal) {
        modal.classList.remove('show-modal');
        // KUNCI PENTING: Mengosongkan src agar lagu berhenti berputar saat ditutup
        if (modalIframe) {
            modalIframe.src = "";
        }
    }
}

// ==========================================
// 2. FUNGSI KADO & PEMUTAR MUSIK LATAR
// ==========================================
function bukaKado() {
    buatHujanBunga();

    const flash = document.getElementById('flash-light');
    if (flash) flash.classList.add('flash-active');

    // --- MULAI MUSIK & MUNCULKAN POP-UP ---
    const bgMusic = document.getElementById('bg-music');
    const musicPopup = document.getElementById('music-popup');

    // Putar musiknya
    if (bgMusic) {
        bgMusic.play().catch(error => {
            console.log("Browser memblokir autoplay, tidak masalah.");
        });
    }

    // Munculkan notifikasi pop-up dari bawah layar
    if (musicPopup) {
        setTimeout(() => {
            musicPopup.classList.add('show-music');
        }, 1000);
    }
    // --------------------------------------

    setTimeout(() => {
        const landingPage = document.getElementById('landing-page');
        const mainContent = document.getElementById('main-content');

        if (landingPage) landingPage.style.display = 'none';
        if (mainContent) mainContent.classList.remove('hidden');

        jalankanAnimasiScroll();
    }, 450);
}

function buatHujanBunga() {
    const container = document.getElementById('flower-rain');
    if (!container) return;

    const bungaPilihan = ['🌸', '🌺', '🌷', '✨', '💖'];

    for (let i = 0; i < 40; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        petal.innerText = bungaPilihan[Math.floor(Math.random() * bungaPilihan.length)];
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
        petal.style.animationDelay = (Math.random() * 1) + 's';

        container.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, 6000);
    }
}

// ==========================================
// 3. FUNGSI SENSOR SCROLL & MESIN TIK BERURUTAN
// ==========================================
function jalankanAnimasiScroll() {
    const elemenScroll = document.querySelectorAll('.show-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!entry.target.classList.contains('is-visible')) {
                    entry.target.classList.add('is-visible');
                    mulaiKetikanBerurutan(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -35% 0px"
    });

    elemenScroll.forEach((el) => observer.observe(el));
}

async function mulaiKetikanBerurutan(slideTarget) {
    const teksKetikan = slideTarget.querySelectorAll('.typing-text');

    await new Promise(resolve => setTimeout(resolve, 3500));

    for (let i = 0; i < teksKetikan.length; i++) {
        const el = teksKetikan[i];
        const teksAsli = el.getAttribute('data-teks');

        if (teksAsli) {
            await ketikTeks(el, teksAsli);
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }

    // Tampilkan pulsating heart dengan fade in setelah semua teks selesai diketik
    const heart = slideTarget.querySelector('.pulsating-heart');
    if (heart) {
        heart.classList.add('heart-visible');
    }
}

function ketikTeks(elemen, teks) {
    return new Promise(resolve => {
        let index = 0;
        elemen.innerHTML = '';

        function ketik() {
            if (index < teks.length) {
                elemen.innerHTML += teks.charAt(index);
                index++;
                setTimeout(ketik, 35);
            } else {
                elemen.classList.add('typing-done');
                resolve();
            }
        }

        ketik();
    });
}

// ==========================================
// 4. FUNGSI TOGGLE PLAY/PAUSE MUSIK (SPOTIFY STYLE)
// ==========================================
function toggleMusic() {
    const bgMusic = document.getElementById('bg-music');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');

    if (!bgMusic) return;

    if (bgMusic.paused) {
        bgMusic.play().catch(console.error);
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
    } else {
        bgMusic.pause();
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
    }
}

// ==========================================
// 5. FUNGSI MENYEMBUNYIKAN POP-UP MUSIK SAAT SCROLL
// ==========================================
function hideMusicPopup() {
    const musicPopup = document.getElementById('music-popup');
    const showMusicBtn = document.getElementById('show-music-btn');
    if (musicPopup) {
        musicPopup.classList.remove('show-music');
    }
    if (showMusicBtn) {
        showMusicBtn.classList.add('show-btn');
    }
}

function showMusicPopup() {
    const musicPopup = document.getElementById('music-popup');
    const showMusicBtn = document.getElementById('show-music-btn');
    if (musicPopup) {
        musicPopup.classList.add('show-music');
    }
    if (showMusicBtn) {
        showMusicBtn.classList.remove('show-btn');
    }
}

// Auto-hide pop-up musik saat user mulai scroll
(function () {
    let sudahDisembunyikan = false;

    window.addEventListener('scroll', function () {
        const musicPopup = document.getElementById('music-popup');

        // Hanya sembunyikan jika pop-up sedang tampil dan belum pernah disembunyikan oleh scroll
        if (!sudahDisembunyikan && musicPopup && musicPopup.classList.contains('show-music')) {
            hideMusicPopup();
            sudahDisembunyikan = true;
        }
    });

    // Reset flag saat pop-up ditampilkan kembali lewat tombol 🎵
    const originalShowMusicPopup = showMusicPopup;
    showMusicPopup = function () {
        sudahDisembunyikan = false;
        originalShowMusicPopup();
    };
    // Pasang ulang ke window agar onclick di HTML tetap berfungsi
    window.showMusicPopup = showMusicPopup;
})();

// ==========================================
// SCRATCH CARD (ERASER EFFECT) + GALLERY UNLOCK LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const canvases = document.querySelectorAll('.scratch-canvas');
    const galleryScroll = document.querySelector('.gallery-scroll');
    const galleryHint = document.getElementById('gallery-hint');
    const gallerySlider = document.getElementById('gallery-slider');
    const gallerySliderThumb = document.getElementById('gallery-slider-thumb');

    const totalCanvases = canvases.length;
    const clearedSet = new Set();
    let galleryUnlocked = false;

    function updateSlider() {
        if (!gallerySliderThumb || !galleryScroll) return;
        const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
        if (maxScroll > 0) {
            const scrollPercent = galleryScroll.scrollLeft / maxScroll;
            const trackWidth = gallerySliderThumb.parentElement.clientWidth;
            const thumbWidth = gallerySliderThumb.clientWidth;
            const maxLeft = trackWidth - thumbWidth;
            gallerySliderThumb.style.left = (scrollPercent * maxLeft) + 'px';
        }
    }

    function scrollToCard(cardIndex) {
        if (!galleryScroll) return;
        const cards = galleryScroll.querySelectorAll('.scratch-card');
        if (cardIndex < cards.length) {
            const card = cards[cardIndex];
            // Hitung posisi scroll secara manual agar card berada di tengah container
            // Ini menghindari scrollIntoView yang bisa menggeser seluruh halaman di HP
            const containerWidth = galleryScroll.clientWidth;
            const cardLeft = card.offsetLeft;
            const cardWidth = card.offsetWidth;
            const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

            // Sementara aktifkan scroll agar bisa geser
            galleryScroll.style.overflowX = 'auto';
            galleryScroll.scrollTo({ left: targetScroll, behavior: 'smooth' });
            // Kunci lagi setelah scroll selesai
            setTimeout(() => {
                if (!galleryUnlocked) {
                    galleryScroll.style.overflowX = 'hidden';
                }
                updateSlider();
            }, 600);
        }
    }

    // Tampilkan slider dari awal
    if (gallerySlider) {
        gallerySlider.classList.add('slider-visible');
    }

    function checkCanvasCleared(canvas, index) {
        if (clearedSet.has(index)) return;

        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentCount = 0;
        let sampledCount = 0;

        for (let i = 3; i < pixels.length; i += 8) {
            sampledCount++;
            if (pixels[i] === 0) transparentCount++;
        }

        const ratio = transparentCount / sampledCount;
        if (ratio > 0.45) {
            clearedSet.add(index);

            // Tambahkan class scratched ke kartu agar efek fade-in aktif
            const card = canvas.closest('.scratch-card');
            if (card) {
                card.classList.add('scratched');
            }

            // Fade out sisa canvas
            canvas.style.transition = 'opacity 0.5s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.pointerEvents = 'none';
            }, 500);

            // Update hint
            if (galleryHint) {
                galleryHint.textContent = '✨ Foto ' + clearedSet.size + ' dari ' + totalCanvases + ' terbuka ✨';
            }

            // Cek apakah semua sudah dibersihkan
            if (clearedSet.size >= totalCanvases) {
                // Semua selesai — unlock untuk geser bebas
                galleryUnlocked = true;
                if (galleryScroll) {
                    galleryScroll.classList.add('gallery-unlocked');
                    galleryScroll.style.overflowX = 'auto';
                    galleryScroll.style.touchAction = 'pan-x pan-y';
                    // Sync slider saat scroll bebas
                    galleryScroll.addEventListener('scroll', updateSlider);
                }
                if (galleryHint) {
                    galleryHint.textContent = 'Semua foto sudah terbuka! Geser kesamping untuk melihatnya';
                    galleryHint.classList.add('hint-unlocked');
                }
            } else {
                // Auto-scroll ke foto berikutnya
                setTimeout(() => {
                    scrollToCard(index + 1);
                }, 700);
            }
        }
    }

    canvases.forEach((canvas, index) => {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let brushRadius = 25;
        let drawMoveCount = 0;

        setTimeout(() => {
            canvas.width = 220;
            canvas.height = Math.round(220 * 16 / 9);

            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < 200; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 1.5,
                    0, Math.PI * 2
                );
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(255,182,193,0.8)';
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'destination-out';

            const startPosition = (e) => {
                isDrawing = true;
                drawMoveCount = 0;
                draw(e);
            };

            const endPosition = () => {
                isDrawing = false;
                ctx.beginPath();
                // Cek setiap kali selesai menggosok
                checkCanvasCleared(canvas, index);
            };

            const draw = (e) => {
                if (!isDrawing) return;

                let clientX, clientY;
                if (e.type.includes('touch')) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                const canvasRect = canvas.getBoundingClientRect();
                // Scale koordinat dari ukuran tampilan CSS ke ukuran internal canvas
                const scaleX = canvas.width / canvasRect.width;
                const scaleY = canvas.height / canvasRect.height;
                const x = (clientX - canvasRect.left) * scaleX;
                const y = (clientY - canvasRect.top) * scaleY;

                ctx.lineWidth = brushRadius * 2;
                ctx.lineCap = 'round';
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);

                // Juga cek selama menggosok setiap 15 gerakan
                drawMoveCount++;
                if (drawMoveCount % 15 === 0) {
                    checkCanvasCleared(canvas, index);
                }
            };

            canvas.addEventListener('mousedown', startPosition);
            canvas.addEventListener('mouseup', endPosition);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseleave', endPosition);

            canvas.addEventListener('touchstart', startPosition, { passive: true });
            canvas.addEventListener('touchend', endPosition);
            canvas.addEventListener('touchmove', (e) => {
                if (isDrawing) e.preventDefault();
                draw(e);
            }, { passive: false });

        }, 500);
    });
});

// ==========================================
// FITUR TIUP LILIN 🎂 (Press & Hold)
// ==========================================
let holdTime = 0;
let holdInterval = null;
let holdCurrentStage = 0;
let holdListenersAttached = false;
let holdStartFn = null;
let holdStopFn = null;

const STAGE_1_DURATION = 6000;  // 6 detik untuk tahap 1
const STAGE_2_DURATION = 13000; // 13 detik total (7 detik tambahan) untuk tahap 2

function bukaHalamanLilin() {
    const candlePage = document.getElementById('candle-page');
    if (!candlePage) return;

    // Reset state
    holdTime = 0;
    holdCurrentStage = 0;
    holdListenersAttached = false;

    // Tampilkan halaman
    candlePage.classList.add('active');

    // Buat sparkle background
    buatSparkleBackground(candlePage);

    // Fade in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            candlePage.classList.add('visible');
        });
    });
}

function tutupHalamanLilin() {
    const candlePage = document.getElementById('candle-page');
    const msg = document.getElementById('candle-message');
    const btn = document.getElementById('btn-mulai-tiup');
    const tapHint = document.getElementById('tap-hint');
    const flames = document.querySelectorAll('.candle-flame');
    const progressBar = document.getElementById('hold-progress-bar');
    const progressFill = document.getElementById('hold-progress-fill');
    const cakeContainer = document.querySelector('.cake-container');

    if (!candlePage) return;

    // Stop hold interval
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }

    // Hapus event listeners
    hapusHoldListeners(candlePage);

    // Fade out
    candlePage.classList.remove('visible');

    setTimeout(() => {
        candlePage.classList.remove('active');

        // Reset semua state
        holdTime = 0;
        holdCurrentStage = 0;

        if (msg) {
            msg.textContent = '';
            msg.className = 'candle-message';
        }

        if (btn) btn.classList.remove('hidden-btn');

        if (tapHint) {
            tapHint.textContent = '';
            tapHint.className = 'tap-hint';
        }

        if (progressBar) progressBar.classList.remove('show-bar');
        if (progressFill) progressFill.style.width = '0%';
        if (cakeContainer) cakeContainer.classList.remove('holding');

        // Reset api lilin
        flames.forEach(flame => {
            flame.classList.remove('dimming', 'extinguished');
            flame.style.animationDuration = '';
        });

        // Hapus sparkle elements
        const sparkles = candlePage.querySelectorAll('.candle-sparkle');
        sparkles.forEach(s => s.remove());
    }, 800);
}

function hapusHoldListeners(candlePage) {
    if (holdListenersAttached && holdStartFn && holdStopFn) {
        candlePage.removeEventListener('mousedown', holdStartFn);
        candlePage.removeEventListener('mouseup', holdStopFn);
        candlePage.removeEventListener('mouseleave', holdStopFn);
        candlePage.removeEventListener('touchstart', holdStartFn);
        candlePage.removeEventListener('touchend', holdStopFn);
        candlePage.removeEventListener('touchcancel', holdStopFn);
        holdListenersAttached = false;
    }
}

function buatSparkleBackground(container) {
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('candle-sparkle');
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = (Math.random() * 3) + 's';
        sparkle.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        container.appendChild(sparkle);
    }
}

function mulaiTiupLilin() {
    const btn = document.getElementById('btn-mulai-tiup');
    const tapHint = document.getElementById('tap-hint');
    const candlePage = document.getElementById('candle-page');
    const progressBar = document.getElementById('hold-progress-bar');

    if (!btn || !candlePage) return;

    // Sembunyikan tombol
    btn.classList.add('hidden-btn');

    // Tampilkan progress bar & hint
    if (progressBar) progressBar.classList.add('show-bar');
    if (tapHint) {
        tapHint.textContent = 'Tekan dan tahan layar untuk meniup lilin';
        tapHint.className = 'tap-hint show-hint';
    }

    // Reset hold state
    holdTime = 0;
    holdCurrentStage = 0;

    // Setup hold event listeners
    holdStartFn = function (e) {
        // Jangan proses jika klik tombol kembali
        if (e.target.closest('.btn-back-candle')) return;
        // Jangan proses jika sudah selesai
        if (holdCurrentStage >= 3) return;

        e.preventDefault();
        startHolding();
    };

    holdStopFn = function () {
        if (holdCurrentStage >= 3) return;
        stopHolding();
    };

    candlePage.addEventListener('mousedown', holdStartFn);
    candlePage.addEventListener('mouseup', holdStopFn);
    candlePage.addEventListener('mouseleave', holdStopFn);
    candlePage.addEventListener('touchstart', holdStartFn, { passive: false });
    candlePage.addEventListener('touchend', holdStopFn);
    candlePage.addEventListener('touchcancel', holdStopFn);
    holdListenersAttached = true;
}

function startHolding() {
    const cakeContainer = document.querySelector('.cake-container');
    const tapHint = document.getElementById('tap-hint');

    if (cakeContainer) cakeContainer.classList.add('holding');
    if (tapHint) tapHint.className = 'tap-hint'; // Sembunyikan hint saat menekan

    // Jika belum masuk tahap 1, langsung masuk
    if (holdCurrentStage === 0) {
        holdCurrentStage = 1;
        tampilkanTahap1();
    }

    // Mulai interval untuk menambah holdTime
    if (holdInterval) clearInterval(holdInterval);
    holdInterval = setInterval(() => {
        holdTime += 50;
        updateProgress();
        cekTransisiTahap();
    }, 50);
}

function stopHolding() {
    const cakeContainer = document.querySelector('.cake-container');
    const tapHint = document.getElementById('tap-hint');

    if (cakeContainer) cakeContainer.classList.remove('holding');

    // Stop interval
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }

    // Tampilkan hint untuk menekan lagi (jika belum selesai)
    if (holdCurrentStage > 0 && holdCurrentStage < 3 && tapHint) {
        tapHint.textContent = '🌬️ Tekan dan tahan lagi untuk melanjutkan';
        tapHint.className = 'tap-hint show-hint';
    }
}

function updateProgress() {
    const progressFill = document.getElementById('hold-progress-fill');
    if (!progressFill) return;

    const percent = Math.min((holdTime / STAGE_2_DURATION) * 100, 100);
    progressFill.style.width = percent + '%';
}

function cekTransisiTahap() {
    // Transisi dari tahap 1 ke tahap 2
    if (holdCurrentStage === 1 && holdTime >= STAGE_1_DURATION) {
        holdCurrentStage = 2;
        tampilkanTahap2();
    }

    // Transisi dari tahap 2 ke tahap 3 (selesai)
    if (holdCurrentStage === 2 && holdTime >= STAGE_2_DURATION) {
        holdCurrentStage = 3;
        stopHolding();
        tampilkanTahap3();
    }
}

function tampilkanTahap1() {
    const msg = document.getElementById('candle-message');
    const flames = document.querySelectorAll('.candle-flame');

    if (msg) {
        msg.textContent = 'Lilin mulai ditiup...';
        msg.className = 'candle-message show-msg';
    }

    // Api bergoyang lebih kencang tapi belum mati
    flames.forEach(flame => {
        flame.style.animationDuration = '0.15s';
    });
}

function tampilkanTahap2() {
    const msg = document.getElementById('candle-message');
    const flames = document.querySelectorAll('.candle-flame');

    if (msg) {
        msg.className = 'candle-message'; // fade out dulu
        setTimeout(() => {
            msg.textContent = 'Make a wish, Berdoa dulu yaa.. ';
            msg.className = 'candle-message show-msg';
        }, 400);
    }

    // Api mulai redup
    flames.forEach(flame => {
        flame.classList.add('dimming');
    });
}

function tampilkanTahap3() {
    const msg = document.getElementById('candle-message');
    const tapHint = document.getElementById('tap-hint');
    const flames = document.querySelectorAll('.candle-flame');
    const candlePage = document.getElementById('candle-page');
    const progressBar = document.getElementById('hold-progress-bar');

    // Sembunyikan hint & progress
    if (tapHint) {
        tapHint.textContent = '';
        tapHint.className = 'tap-hint';
    }
    if (progressBar) {
        setTimeout(() => { progressBar.classList.remove('show-bar'); }, 500);
    }

    // Fade out pesan sebelumnya
    if (msg) msg.className = 'candle-message';

    // Matikan api satu per satu
    flames.forEach((flame, index) => {
        setTimeout(() => {
            flame.classList.remove('dimming');
            flame.classList.add('extinguished');
        }, index * 400);
    });

    // Setelah semua api mati
    setTimeout(() => {
        buatConfetti();

        setTimeout(() => {
            if (msg) {
                msg.textContent = 'Semoga apa yang kamu doakan dan inginkan segera terlaksana yaa, Aamiin 🤍';
                msg.className = 'candle-message show-msg final-msg';
            }
        }, 600);
    }, flames.length * 400 + 500);

    // Hapus event listeners karena sudah selesai
    if (candlePage) hapusHoldListeners(candlePage);
}

function buatConfetti() {
    const colors = [
        '#ff6b81', '#ffb6c1', '#a55eea', '#6c5ce7', '#ffd700',
        '#ff9ff3', '#f368e0', '#ffffff', '#00d2d3', '#ff6348',
        '#7bed9f', '#ffa502', '#ff4757', '#2ed573', '#eccc68',
        '#ff7eb3', '#c56cf0', '#17c0eb', '#ffc312'
    ];
    const shapes = ['circle', 'rect', 'star', 'heart', 'ribbon'];
    const animStyles = ['', 'confetti-swirl', 'confetti-zigzag'];

    function burstWave(count, delayBase) {
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');

            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const animStyle = animStyles[Math.floor(Math.random() * animStyles.length)];
            const size = 5 + Math.random() * 10;

            if (animStyle) confetti.classList.add(animStyle);

            if (shape === 'star') {
                confetti.classList.add('confetti-star');
                confetti.textContent = '⭐';
                confetti.style.fontSize = (10 + Math.random() * 8) + 'px';
            } else if (shape === 'heart') {
                confetti.classList.add('confetti-heart');
                confetti.textContent = '💖';
                confetti.style.fontSize = (8 + Math.random() * 8) + 'px';
            } else if (shape === 'ribbon') {
                confetti.classList.add('confetti-ribbon');
                confetti.style.width = (3 + Math.random() * 4) + 'px';
                confetti.style.height = (14 + Math.random() * 12) + 'px';
                confetti.style.background = color;
                confetti.style.borderRadius = '1px';
            } else if (shape === 'rect') {
                confetti.style.width = size + 'px';
                confetti.style.height = (size * 0.5) + 'px';
                confetti.style.background = color;
                confetti.style.borderRadius = '2px';
            } else {
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.background = color;
                confetti.style.borderRadius = '50%';
            }

            // Wider spread across the entire screen
            confetti.style.left = (5 + Math.random() * 90) + 'vw';
            confetti.style.top = '-15px';
            confetti.style.animationDuration = (2.5 + Math.random() * 3) + 's';
            confetti.style.animationDelay = (delayBase + Math.random() * 1.2) + 's';

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 8000 + delayBase * 1000);
        }
    }

    // Gelombang 1: Ledakan utama
    burstWave(60, 0);

    // Gelombang 2: Ledakan kedua setelah 0.8 detik
    setTimeout(() => burstWave(50, 0), 800);

    // Gelombang 3: Hujan confetti lanjutan
    setTimeout(() => burstWave(40, 0), 2000);
}

// ==========================================
// 8. MINI GAME: TANGKAP 10 BOUQUET
// ==========================================
(function () {
    let canvas, ctx;
    let animId = null;
    let isRunning = false;
    let lastTime = 0;

    let score = 0;
    const TARGET_SCORE = 10;

    // Audio Context & Sound Synthesizer
    let gameAudioCtx = null;

    function getGameAudioContext() {
        if (!gameAudioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                gameAudioCtx = new AudioCtx();
            }
        }
        if (gameAudioCtx && gameAudioCtx.state === 'suspended') {
            gameAudioCtx.resume();
        }
        return gameAudioCtx;
    }

    function playCatchSound(currentScore) {
        try {
            const ctxA = getGameAudioContext();
            if (!ctxA) return;
            const now = ctxA.currentTime;

            // Skala nada pentatonik naik semakin tinggi bouquet terkumpul
            const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
            const freq = scale[Math.min(currentScore - 1, scale.length - 1)] || 659.25;

            const osc = ctxA.createOscillator();
            const gain = ctxA.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq * 0.7, now);
            osc.frequency.exponentialRampToValueAtTime(freq, now + 0.035);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.1);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(ctxA.destination);

            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) { }
    }

    function playBombSound() {
        try {
            const ctxA = getGameAudioContext();
            if (!ctxA) return;
            const now = ctxA.currentTime;

            // 1. Dentuman lucu "POOF"
            const osc = ctxA.createOscillator();
            const gain = ctxA.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.25);

            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(ctxA.destination);

            osc.start(now);
            osc.stop(now + 0.3);

            // 2. Efek kartun lucu "womp womp" turun
            const slideOsc = ctxA.createOscillator();
            const slideGain = ctxA.createGain();

            slideOsc.type = 'sine';
            slideOsc.frequency.setValueAtTime(340, now + 0.05);
            slideOsc.frequency.exponentialRampToValueAtTime(80, now + 0.45);

            slideGain.gain.setValueAtTime(0.001, now);
            slideGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
            slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

            slideOsc.connect(slideGain);
            slideGain.connect(ctxA.destination);

            slideOsc.start(now + 0.05);
            slideOsc.stop(now + 0.5);
        } catch (e) { }
    }

    function playWinSound() {
        try {
            const ctxA = getGameAudioContext();
            if (!ctxA) return;
            const now = ctxA.currentTime;

            // Arpeggio ceria kemenangan: Do - Mi - Sol - Do - Mi
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, idx) => {
                const time = now + idx * 0.1;
                const osc = ctxA.createOscillator();
                const gain = ctxA.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.001, time);
                gain.gain.linearRampToValueAtTime(0.22, time + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

                osc.connect(gain);
                gain.connect(ctxA.destination);

                osc.start(time);
                osc.stop(time + 0.4);
            });
        } catch (e) { }
    }

    // Gambar preloaded
    const imgCat = new Image();
    imgCat.src = 'img/game-cat.png';

    const imgBouquet = new Image();
    imgBouquet.src = 'img/game-bouquet.png';

    // Karakter Kucing
    const cat = {
        x: 0,
        y: 0,
        width: 90,
        height: 90,
        targetX: 0,
        tilt: 0,
        scaleX: 1,
        scaleY: 1
    };

    let items = []; // Bouquet & bom yang sedang jatuh
    let particles = []; // Partikel ledakan
    let confetti = []; // Hujan confetti kemenangan
    let lastSpawnTime = 0;
    let spawnInterval = 820; // ms per kemunculan

    let feedbackOverlay = null;

    function resizeCanvas() {
        if (!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Skala kucing responsif dan proporsional terhadap layar HP/desktop
        cat.width = Math.min(105, Math.max(76, canvas.width * 0.23));
        cat.height = cat.width;
        cat.y = canvas.height - cat.height - 12;

        if (cat.targetX === 0) {
            cat.targetX = (canvas.width - cat.width) / 2;
            cat.x = cat.targetX;
        }
    }

    function showFeedback(text, type, x, y) {
        if (!feedbackOverlay) return;
        const el = document.createElement('div');
        el.className = `game-floating-msg ${type}`;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        feedbackOverlay.appendChild(el);
        setTimeout(() => el.remove(), 920);
    }

    function triggerScreenShake() {
        const wrapper = document.getElementById('game-canvas-wrapper');
        if (!wrapper) return;
        wrapper.classList.remove('shake-active');
        void wrapper.offsetWidth; // Force reflow
        wrapper.classList.add('shake-active');
        setTimeout(() => wrapper.classList.remove('shake-active'), 450);
    }

    function createPetalExplosion(x, y) {
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 70 + Math.random() * 130;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 45,
                color: Math.random() > 0.5 ? '#ffb6c1' : '#ff7eb3',
                size: 4 + Math.random() * 5,
                alpha: 1,
                life: 0.65 + Math.random() * 0.3
            });
        }
    }

    function createBombExplosion(x, y) {
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 180;
            const colors = ['#ff4757', '#ffa502', '#ff6b81', '#ffffff', '#2f3542'];
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 5 + Math.random() * 6,
                alpha: 1,
                life: 0.75 + Math.random() * 0.35
            });
        }
    }

    function createConfetti() {
        confetti = [];
        const colors = ['#ff7eb3', '#ffb6c1', '#ffd166', '#06d6a0', '#118ab2', '#ffffff'];
        for (let i = 0; i < 75; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 160,
                vx: (Math.random() - 0.5) * 80,
                vy: 110 + Math.random() * 140,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 6 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 8
            });
        }
    }

    function handlePointer(clientX) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const posX = clientX - rect.left - (cat.width / 2);
        cat.targetX = Math.max(5, Math.min(canvas.width - cat.width - 5, posX));
    }

    const onTouchMove = (e) => {
        if (e.touches && e.touches[0]) {
            handlePointer(e.touches[0].clientX);
        }
    };

    const onMouseMove = (e) => {
        handlePointer(e.clientX);
    };

    const onKeyDown = (e) => {
        if (!isRunning) return;
        const speed = 35;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            cat.targetX = Math.max(5, cat.targetX - speed);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            cat.targetX = Math.min(canvas.width - cat.width - 5, cat.targetX + speed);
        }
    };

    function updateHUD() {
        const scoreDisplay = document.getElementById('game-score-display');
        const progressBar = document.getElementById('game-progress-bar');
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
            scoreDisplay.classList.add('bump');
            setTimeout(() => scoreDisplay.classList.remove('bump'), 200);
        }
        if (progressBar) {
            const pct = Math.min(100, (score / TARGET_SCORE) * 100);
            progressBar.style.width = `${pct}%`;
        }
    }

    function spawnItem(timestamp) {
        if (timestamp - lastSpawnTime < spawnInterval) return;
        lastSpawnTime = timestamp;

        // 72% bouquet, 28% bom
        const isBomb = Math.random() < 0.28;
        const size = isBomb ? Math.min(46, canvas.width * 0.115) : Math.min(52, canvas.width * 0.135);

        items.push({
            type: isBomb ? 'bomb' : 'bouquet',
            x: 15 + Math.random() * (canvas.width - size - 30),
            y: -size - 10,
            width: size,
            height: size,
            speed: (isBomb ? 195 : 175) + Math.random() * 65,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 2 + Math.random() * 2
        });
    }

    function drawBomb(x, y, size) {
        const r = size / 2;
        const cx = x + r;
        const cy = y + r;

        // Badan bom hitam metalik mengkilap
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        grad.addColorStop(0, '#57606f');
        grad.addColorStop(0.3, '#2f3542');
        grad.addColorStop(1, '#1e272e');

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Kilau putih di atas bola bom
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Leher bom di atas
        ctx.fillStyle = '#747d8c';
        ctx.fillRect(cx - r * 0.2, cy - r * 0.95, r * 0.4, r * 0.2);

        // Tali sumbu bom melengkung
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.9);
        ctx.quadraticCurveTo(cx + r * 0.4, cy - r * 1.3, cx + r * 0.6, cy - r * 1.1);
        ctx.strokeStyle = '#d2dae2';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Percikan api sumbu berkedip
        ctx.beginPath();
        ctx.arc(cx + r * 0.6, cy - r * 1.1, 3.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? '#ffa502' : '#ff4757';
        ctx.fill();
    }

    function gameLoop(timestamp) {
        if (!isRunning) return;

        if (!lastTime) lastTime = timestamp;
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawning item baru jika belum menang
        if (score < TARGET_SCORE) {
            spawnItem(timestamp);
        }

        // Lerp posisi dan tilt kucing
        const dx = cat.targetX - cat.x;
        cat.x += dx * 0.28;
        cat.tilt = Math.max(-0.1, Math.min(0.1, dx * 0.003));
        cat.scaleX += (1 - cat.scaleX) * 0.18;
        cat.scaleY += (1 - cat.scaleY) * 0.18;

        // Area tangkapan kucing (di bagian atas cakar/sweater kucing)
        const catchBox = {
            x: cat.x + cat.width * 0.12,
            y: cat.y - 8,
            width: cat.width * 0.76,
            height: cat.height * 0.5
        };

        // Update & Render Items
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speed * dt;
            item.wobblePhase += item.wobbleSpeed * dt;
            const wobbleX = Math.sin(item.wobblePhase) * 10;

            const itemCenterX = item.x + wobbleX + item.width / 2;
            const itemCenterY = item.y + item.height / 2;

            // Cek tabrakan dengan kucing
            const hit = (
                itemCenterX >= catchBox.x &&
                itemCenterX <= catchBox.x + catchBox.width &&
                itemCenterY >= catchBox.y &&
                itemCenterY <= catchBox.y + catchBox.height
            );

            if (hit) {
                if (item.type === 'bouquet') {
                    // TANGKAP BOUQUET!
                    score = Math.min(TARGET_SCORE, score + 1);
                    playCatchSound(score);
                    createPetalExplosion(itemCenterX, itemCenterY);
                    showFeedback('+1 🌸', 'positive', itemCenterX, itemCenterY - 10);

                    // Squash & stretch kucing kegirangan
                    cat.scaleX = 1.18;
                    cat.scaleY = 0.82;

                    updateHUD();

                    if (score >= TARGET_SCORE) {
                        onWin();
                    }
                } else {
                    // KENA BOM!
                    score = 0;
                    playBombSound();
                    createBombExplosion(itemCenterX, itemCenterY);
                    triggerScreenShake();
                    showFeedback('BOOM! Reset ke 0 💥😭', 'negative', itemCenterX, itemCenterY - 15);

                    // Kucing goyang shock
                    cat.scaleX = 0.85;
                    cat.scaleY = 1.25;

                    updateHUD();
                }

                items.splice(i, 1);
                continue;
            }

            // Hapus jika lewat batas bawah
            if (item.y > canvas.height + 60) {
                items.splice(i, 1);
                continue;
            }

            // Render Item
            ctx.save();
            ctx.translate(item.x + wobbleX + item.width / 2, item.y + item.height / 2);
            if (item.type === 'bouquet') {
                ctx.rotate(Math.sin(item.wobblePhase) * 0.15);
                ctx.drawImage(imgBouquet, -item.width / 2, -item.height / 2, item.width, item.height);
            } else {
                ctx.rotate(Math.sin(item.wobblePhase) * 0.1);
                drawBomb(-item.width / 2, -item.height / 2, item.width);
            }
            ctx.restore();
        }

        // Render Kucing
        ctx.save();
        ctx.translate(cat.x + cat.width / 2, cat.y + cat.height / 2);
        ctx.rotate(cat.tilt);
        ctx.scale(cat.scaleX, cat.scaleY);
        ctx.drawImage(imgCat, -cat.width / 2, -cat.height / 2, cat.width, cat.height);
        ctx.restore();

        // Update & Render Partikel
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 120 * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life);

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Update & Render Confetti Kemenangan
        if (confetti.length > 0) {
            for (let i = confetti.length - 1; i >= 0; i--) {
                const c = confetti[i];
                c.y += c.vy * dt;
                c.x += c.vx * dt;
                c.rotation += c.rotSpeed * dt;

                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rotation);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.7);
                ctx.restore();

                if (c.y > canvas.height + 30) {
                    c.y = -20;
                    c.x = Math.random() * canvas.width;
                }
            }
        }

        animId = requestAnimationFrame(gameLoop);
    }

    function onWin() {
        playWinSound();
        createConfetti();

        // Tampilkan modal menang setelah delay sejenak
        setTimeout(() => {
            const winOverlay = document.getElementById('game-win-overlay');
            if (winOverlay) {
                winOverlay.style.display = 'flex';
            }
        }, 500);
    }

    function startMiniGame() {
        const miniGameScreen = document.getElementById('mini-game-screen');
        if (!miniGameScreen) return;

        canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        feedbackOverlay = document.getElementById('game-feedback-overlay');

        // Reset state game
        score = 0;
        items = [];
        particles = [];
        confetti = [];
        updateHUD();

        const winOverlay = document.getElementById('game-win-overlay');
        if (winOverlay) winOverlay.style.display = 'none';

        miniGameScreen.style.display = 'flex';
        setTimeout(() => miniGameScreen.classList.add('active'), 20);

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Bind Controls (Mobile Touch + Desktop Mouse & Keyboard)
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchstart', onTouchMove, { passive: true });
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('keydown', onKeyDown);

        isRunning = true;
        lastTime = 0;
        lastSpawnTime = 0;

        // Unmute audio context saat game dibuka
        getGameAudioContext();

        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(gameLoop);
    }

    function selesaiMiniGame() {
        isRunning = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }

        window.removeEventListener('resize', resizeCanvas);
        if (canvas) {
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchstart', onTouchMove);
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('keydown', onKeyDown);

        const miniGameScreen = document.getElementById('mini-game-screen');
        if (miniGameScreen) {
            miniGameScreen.classList.remove('active');
            setTimeout(() => {
                miniGameScreen.style.display = 'none';

                // Tampilkan halaman landing bouquet cuking
                const landingPage = document.getElementById('landing-page');
                if (landingPage) {
                    landingPage.style.display = '';
                    landingPage.style.opacity = '0';
                    setTimeout(() => {
                        landingPage.style.transition = 'opacity 0.8s ease';
                        landingPage.style.opacity = '1';
                    }, 50);
                }
            }, 500);
        }
    }

    // Export global functions
    window.startMiniGame = startMiniGame;
    window.selesaiMiniGame = selesaiMiniGame;
})();
