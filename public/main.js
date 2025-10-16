// ============================================================================
// BIẾN TOÀN CỤC
// ============================================================================

// Biến từ file gốc
let isEffectRunning = false;
const GEMINI_API_KEY = "AIzaSyAQYySJmfqoky_pWP_Doa9Hxqm3KPcwc1M";

let originalStudentRows = [];
let duckMode = false;
let duckMoving = false;

// Biến timer được cập nhật
let timerInterval;
let elapsedTime = 0; // Thời gian đã chạy (cho chế độ START)
let countdownTime = 300; // Thời gian đếm ngược mặc định (10 phút = 600 giây)
let isRunning = false;
let isCountdownMode = false; // true = đếm ngược, false = đếm lên
let warningPlayed = false; // Đã phát cảnh báo chưa
let startTime;

// Biến cho vòng quay (được mở rộng)
let wheelSectors = [
    "Nhân đôi điểm", "Chia đôi điểm", "Thêm lượt quay",
    "Còn 1 điểm cộng", "2 điểm cộng", "1 điểm trừ",
    "1 điểm cộng", "Quyền đi vệ sinh", "2 điểm cộng"
];

let wheelColors = [
    "#FFCCCB", "#FFC107", "#4CAF50",
    "#2196F3", "#FF6699", "#FF0000",
    "#8CCCEC", "#7A8B8B", "#8470FF"
];

// Biến chat từ file gốc
let conversationHistory = [];

// Danh sách các hình nền cho từng chủ đề
const backgroundImages = {
    default: "",
    Anime1: "/bg/anime1.jpg",
    Anime2: "/bg/anime2.jpg",
    Anime3: "/bg/anime3.jpg",
    Anime4: "/bg/anime4.jpg",
    Anime5: "/bg/anime5.jpg",
    Anime6: "/bg/anime6.jpg",
    Space1: "/bg/Space1.jpg",
    Space2: "/bg/Space2.jpg",
    Space3: "/bg/Space3.jpg",
    Space4: "/bg/Space4.jpg",
    Space5: "/bg/Space5.gif",
    Winter: "/bg/Winter.jpg",
    Valley: "/bg/Valley.jpg",
    Forest: "/bg/Forest.jpg",
};

// ============================================================================
// KHỞI TẠO CHÍNH
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Bắt đầu khởi tạo...');
        
        // Khởi tạo bộ đếm thời gian
        updateTimerDisplay();
        
        // Khởi tạo sự kiện cho các nút điều khiển bộ đếm
        document.getElementById("start")?.addEventListener("click", startTimer);
        document.getElementById("down")?.addEventListener("click", startCountdown);
        document.getElementById("set")?.addEventListener("click", showTimeSetModal);
        document.getElementById("stop")?.addEventListener("click", stopTimer);
        
        // Khởi tạo vòng quay (kết hợp cả modal)
        initializeWheel();
        initializeWheelModal();
        
        // Khởi tạo chế độ bí mật
        initializeSecretMode();
        
        // Khởi tạo tính năng chọn lớp học
        initializeClassSelection();
        
        // Khởi tạo tính năng chat AI
        initializeChatInterface();
        
        // Khởi tạo tính năng tạo nhóm
        initializeGroupCreation();

        // Khởi tạo modal cài đặt thời gian
        initializeTimeSetModal();

        // Khởi tạo bộ đếm nâng cao
        new AdvancedVisitorCounter();

        // Show Reset Button
        showResetButton();


        // Thêm tính năng phát hiện tab được focus lại
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && isRunning) {
                // Khi tab được focus lại, force update ngay lập tức
                if (isCountdownMode) {
                    // Trigger update cho countdown
                    const currentTime = Date.now();
                    // Logic update sẽ được xử lý trong setInterval
                } else {
                    // Trigger update cho count up
                    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                    updateTimerDisplay();
                }
                console.log('Tab được focus lại, đồng bộ thời gian');
            }
        });

        
        
        // Khởi tạo sự kiện cho nút random
        // Thay thế phần xử lý audio trong hàm random button
        document.getElementById("randomButton")?.addEventListener("click", function() {
            const backgroundMusic = document.getElementById("backgroundMusic");
            if (backgroundMusic && backgroundMusic.src && backgroundMusic.src !== window.location.href) {
                // Thêm xử lý lỗi và user interaction check
                backgroundMusic.play().catch(error => {
                    console.log("Không thể phát nhạc nền:", error.message);
                    // Có thể thêm thông báo cho user nhấp vào để bật âm thanh
                });
            }
            
            if (duckMode) {
                runFunnyDuckAnimation();
            } else {
                selectRandomStudentWithEffect();
            }
        });

        
        // Khởi tạo sự kiện cho chọn chủ đề
        document.getElementById("themes")?.addEventListener("change", changeTheme);
        
        // Khởi tạo sự kiện cho chọn nhạc nền
        document.getElementById("musicSelect")?.addEventListener("change", changeBackgroundMusic);
        
        // Áp dụng theme và music mặc định
        const themeSelect = document.getElementById("themes");
        const musicSelect = document.getElementById("musicSelect");
        if (themeSelect) changeTheme.call(themeSelect);
        if (musicSelect) changeBackgroundMusic.call(musicSelect);
        
        // Khởi tạo sự kiện cho tải file danh sách học sinh
        document.getElementById("fileInput")?.addEventListener("change", handleFileUpload);
        
        // Khởi tạo duck mode
        initializeDuckMode();
        
        // Khởi tạo chat
        initializeChat();
        cleanupHistory();
        
        console.log('Khởi tạo thành công!');
    } catch (error) {
        console.error('Lỗi khởi tạo:', error);
    }
});

// ============================================================================
// BỘ ĐẾM THỜI GIAN
// ============================================================================

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;
    
    let displayTime;
    
    if (isCountdownMode) {
        displayTime = Math.max(0, countdownTime);
        timerElement.classList.add('countdown');
        // timerElement.classList.remove('warning'); // Reset warning khi cập nhật
        
        // Cảnh báo khi còn 5 giây cuối
        // if (displayTime <= 5 && displayTime > 0 && !warningPlayed && isRunning) {
        //     playWarningSound();
        //     warningPlayed = true;
        //     timerElement.classList.add('warning');
        // }
        
        // // Khi hết giờ
        // if (displayTime === 0 && isRunning) {
        //     stopTimer();
        //     playAlarmSound();
        //     timerElement.classList.remove('warning');
        // }
    } else {
        displayTime = elapsedTime;
        timerElement.classList.remove('countdown', 'warning');
    }
    
    const hours = String(Math.floor(displayTime / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((displayTime % 3600) / 60)).padStart(2, "0");
    const seconds = String(Math.floor(displayTime % 60)).padStart(2, "0");
    
    timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function startTimer() {
    if (isRunning) return;
    
    console.log('Bắt đầu timer - Chế độ đếm lên');
    isCountdownMode = false;
    isRunning = true;
    warningPlayed = false;
    
    // Sử dụng thời gian thực thay vì đếm từng giây
    startTime = Date.now() - (elapsedTime * 1000);
    
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay();
    }, 100); // Cập nhật mỗi 100ms
}

function startCountdown() {
    if (isRunning) return;
    
    console.log('Bắt đầu đếm ngược từ:', countdownTime);
    isCountdownMode = true;
    isRunning = true;
    warningPlayed = false;

    // Lưu thời điểm bắt đầu và thời gian kết thúc
    const startTime = Date.now();
    const endTime = startTime + (countdownTime * 1000);
    
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = Math.max(0, Math.ceil((endTime - currentTime) / 1000));
        
        // Cập nhật hiển thị
        const timerElement = document.getElementById("timer");
        if (timerElement) {
            // Cảnh báo khi còn 5 giây cuối
            if (remainingTime <= 5 && remainingTime > 0 && !warningPlayed) {
                playWarningSound();
                warningPlayed = true;
                timerElement.classList.add('warning');
            }
            
            const hours = String(Math.floor(remainingTime / 3600)).padStart(2, "0");
            const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0");
            const seconds = String(Math.floor(remainingTime % 60)).padStart(2, "0");
            
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
        
        if (remainingTime <= 0) {
            stopTimer();
            playAlarmSound();
        }
    }, 100); // Kiểm tra mỗi 100ms để chính xác hơn
}

function stopTimer() {
    // if (!isRunning) return; // Chỉ dừng khi đang chạy
    
    console.log('Dừng timer');
    clearInterval(timerInterval);
    isRunning = false;
    warningPlayed = false; // Reset cảnh báo
    
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.classList.remove('warning');
    }
}



function showTimeSetModal() {
    const modal = document.getElementById("timeSetModal");
    const hoursInput = document.getElementById("setHours");
    const minutesInput = document.getElementById("setMinutes");
    const secondsInput = document.getElementById("setSeconds");
    
    // Hiển thị thời gian hiện tại được cài đặt
    const hours = Math.floor(countdownTime / 3600);
    const minutes = Math.floor((countdownTime % 3600) / 60);
    const seconds = countdownTime % 60;
    
    if (hoursInput) hoursInput.value = hours;
    if (minutesInput) minutesInput.value = minutes;
    if (secondsInput) secondsInput.value = seconds;
    
    if (modal) modal.style.display = "flex";
}

function saveTimeSettings() {
    const hoursInput = document.getElementById("setHours");
    const minutesInput = document.getElementById("setMinutes");
    const secondsInput = document.getElementById("setSeconds");
    
    if (!hoursInput || !minutesInput || !secondsInput) return;
    
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    // Tính tổng thời gian theo giây
    countdownTime = (hours * 3600) + (minutes * 60) + seconds;
    
    // THÊM: Chuyển sang chế độ countdown và cập nhật hiển thị ngay
    isCountdownMode = true;
    updateTimerDisplay();
    
    // Đóng modal
    const modal = document.getElementById("timeSetModal");
    if (modal) modal.style.display = "none";
    
    // console.log(`Đã cài đặt thời gian: ${hours}:${minutes}:${seconds}`);
    // alert(`Đã cài đặt thời gian: ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`);
}

function initializeTimeSetModal() {
    const closeModal = document.getElementById("closeTimeModal");
    const saveTimeSet = document.getElementById("saveTimeSet");
    const timeSetModal = document.getElementById("timeSetModal");

    if (closeModal) {
        closeModal.addEventListener("click", function() {
            if (timeSetModal) timeSetModal.style.display = "none";
        });
    }

    if (saveTimeSet) {
        saveTimeSet.addEventListener("click", saveTimeSettings);
    }

    // Đóng modal khi click bên ngoài
    if (timeSetModal) {
        timeSetModal.addEventListener("click", function(e) {
            if (e.target === timeSetModal) {
                timeSetModal.style.display = "none";
            }
        });
    }
}

function playWarningSound() {
    try {
        const audio = new Audio("Sound/bell.mp3");
        audio.play().catch(() => console.log("Không thể phát âm thanh cảnh báo"));
    } catch (error) {
        console.log("Lỗi phát âm thanh cảnh báo:", error);
    }
}

// function playAlarmSound() {
//     try {
//         const audio = new Audio("Sound/alarm.mp3");
//         audio.play().catch(() => console.log("Không thể phát âm thanh"));
//     } catch (error) {
//         console.log("Lỗi phát âm thanh:", error);
//     }
// }

// ============================================================================
// DUCK MODE
// ============================================================================

function initializeDuckMode() {
    const duckCheckbox = document.getElementById('duckMode');
    const funnyDuck = document.getElementById('funnyDuck');
    const randomButton = document.getElementById('randomButton');

    if (duckCheckbox && funnyDuck && randomButton) {
        duckCheckbox.addEventListener('change', function() {
            duckMode = this.checked;
            funnyDuck.style.display = duckMode ? 'block' : 'none';
            if (!duckMode) {
                funnyDuck.style.left = '';
                funnyDuck.style.top = '';
            }

            if (duckMode) {
                // Đặt vịt cạnh nút random
                const btnRect = randomButton.getBoundingClientRect();
                funnyDuck.style.position = 'absolute';
                funnyDuck.style.left = (btnRect.right + 10) + 'px';
                funnyDuck.style.top = (btnRect.top - 10) + 'px';
            }
        });
    }
}

// ============================================================================
// VÒNG QUAY
// ============================================================================

function initializeWheel() {
    const wheelCanvas = document.getElementById("wheelCanvas");
    if (!wheelCanvas) return;
    
    const ctx = wheelCanvas.getContext("2d");
    const spinButton = document.getElementById("spinButton");
    const changeButton = document.getElementById("changeButton");

    // Vẽ vòng quay ban đầu
    drawWheel();

    // Gắn sự kiện cho nút quay
    if (spinButton) {
        spinButton.addEventListener("click", spinWheel);
    }

    // Gắn sự kiện cho nút change
    if (changeButton) {
        changeButton.addEventListener("click", function() {
            const modal = document.getElementById("wheelModal");
            const wheelDataTextarea = document.getElementById("wheelData");
            
            // Hiển thị dữ liệu hiện tại trong textarea
            if (wheelDataTextarea) {
                wheelDataTextarea.value = wheelSectors.join("\n");
            }
            
            if (modal) modal.style.display = "flex";
        });
    }
}

function drawWheel() {
    const wheelCanvas = document.getElementById("wheelCanvas");
    if (!wheelCanvas) return;
    
    const ctx = wheelCanvas.getContext("2d");
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = wheelCanvas.width / 2 - 10;
    const angleStep = (2 * Math.PI) / wheelSectors.length;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    for (let i = 0; i < wheelSectors.length; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + angleStep;

        // Vẽ sector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = "center";
        ctx.textBaseline="middle"
        ctx.fillStyle = "#000";
        ctx.font = "bold 17px TimeNeWRoman";

        
        // Chia text thành nhiều dòng nếu cần
        const text = wheelSectors[i];
        const maxWidth = radius * 0.8;
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0] || "";

        for (let j = 1; j < words.length; j++) {
            const testLine = currentLine + ' ' + words[j];
            const metrics = ctx.measureText(testLine);
            if (metrics.width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = words[j];
            }
        }
        lines.push(currentLine);

        // Vẽ từng dòng
        const lineHeight = 14;
        const startY = -(lines.length - 1) * lineHeight / 2;
        for (let k = 0; k < lines.length; k++) {
            ctx.fillText(lines[k], radius * 0.6, startY + k * lineHeight);
        }
        
        ctx.restore();
    }
}

function spinWheel() {
    const wheelCanvas = document.getElementById("wheelCanvas");
    if (!wheelCanvas || wheelCanvas.spinning) return;
    
    wheelCanvas.spinning = true;

    const audio = new Audio("Sound/spin.mp3");
    audio.play();
    
    const totalTime = 10000; // Tổng thời gian quay
    const segmentAngle = 360 / wheelSectors.length; // Góc của mỗi đoạn
    
    // Chọn ngẫu nhiên kết quả
    const selectedIndex = Math.floor(Math.random() * wheelSectors.length);
    
    // Tính toán góc quay chính xác
    const completeRotations = 5; // Số vòng quay đầy đủ
    const targetAngle = 180 - (selectedIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = completeRotations * 360 + targetAngle;

    let currentRotation = 0;
    let elapsedTime = 0;
    const intervalTime = 16;

    const spinInterval = setInterval(() => {
        elapsedTime += intervalTime;
        const progress = elapsedTime / totalTime;
        
        if (progress >= 1) {
            clearInterval(spinInterval);
            wheelCanvas.spinning = false;
            audio.pause();
            
            // Đảm bảo vị trí cuối cùng chính xác
            wheelCanvas.style.transform = `rotate(${finalRotation}deg)`;
            
            const result = wheelSectors[selectedIndex];
            console.log("Kết quả quay vòng:", result);
            
            // Đảm bảo đọc kết quả sau khi quay xong
            setTimeout(() => {
                speak(result);
            }, 0);
        } else {
            // Hiệu ứng chuyển động mượt mà
            const easing = easeOut(progress);
            currentRotation = finalRotation * easing;
            wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;
        }
    }, intervalTime);
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================================================
// MODAL VÒNG QUAY
// ============================================================================

function initializeWheelModal() {
    const closeModal = document.getElementById("closeModal");
    const saveWheelData = document.getElementById("saveWheelData");
    const wheelModal = document.getElementById("wheelModal");
    const wheelDataTextarea = document.getElementById("wheelData");

    if (closeModal) {
        closeModal.addEventListener("click", function() {
            if (wheelModal) wheelModal.style.display = "none";
        });
    }

    if (saveWheelData) {
        saveWheelData.addEventListener("click", function() {
            const inputData = document.getElementById("wheelData");
            if (!inputData) return;
            
            const data = inputData.value.trim();
            if (!data) {
                alert("Vui lòng nhập dữ liệu!");
                return;
            }

            // Cập nhật dữ liệu vòng quay
            wheelSectors = data.split("\n")
                .map(item => item.trim())
                .filter(item => item.length > 0);
            
            // Tạo màu ngẫu nhiên
            wheelColors = wheelSectors.map(() => 
                "#" + Math.floor(Math.random() * 16777215).toString(16)
            );

            // Vẽ lại vòng quay
            drawWheel();
            
            if (wheelModal) wheelModal.style.display = "none";
            // alert("Đã cập nhật vòng quay thành công!");
        });
    }

    // Đóng modal khi click bên ngoài
    if (wheelModal) {
        wheelModal.addEventListener("click", function(e) {
            if (e.target === wheelModal) {
                wheelModal.style.display = "none";
            }
        });
    }
}

// ============================================================================
// CHẾ ĐỘ BÍ MẬT
// ============================================================================

function initializeSecretMode() {
    const secretModeCheckbox = document.getElementById('secretMode');
    if (!secretModeCheckbox) return;

    secretModeCheckbox.addEventListener('change', function() {
        const studentListDiv = document.getElementById('studentList');
        if (!studentListDiv) return;

        if (this.checked) {
            // Shuffle và render lại danh sách
            const shuffled = shuffleArray(originalStudentRows);
            studentListDiv.innerHTML = '';
            shuffled.forEach(row => {
                if (row.length > 0) {
                    const studentDiv = document.createElement('div');
                    studentDiv.textContent = 'CHOOSE ME🙋';
                    studentDiv.dataset.name = row[0];
                    studentDiv.className = 'student secret-mode';
                    studentListDiv.appendChild(studentDiv);
                }
            });
        } else {
            // Render lại đúng thứ tự gốc
            studentListDiv.innerHTML = '';
            originalStudentRows.forEach(row => {
                if (row.length > 0) {
                    const studentDiv = document.createElement('div');
                    studentDiv.textContent = row[0];
                    studentDiv.className = 'student';
                    studentListDiv.appendChild(studentDiv);
                }
            });
        }
    });
}


// ============================================================================
// BỘ ĐẾM TRUY CẬP
// ============================================================================
class AdvancedVisitorCounter {
    constructor() {
        this.init();
    }
    
    init() {
        this.updateTotalVisits();
        this.updateTodayVisits();
        this.updateLastVisitTime();
        this.animateNumbers();
        this.simulateOnlineUsers();
    }
    
    updateTotalVisits() {
        let totalVisits = localStorage.getItem('totalVisits') || 0;
        totalVisits = parseInt(totalVisits) + 1;
        localStorage.setItem('totalVisits', totalVisits);
        
        this.animateCounter('totalVisits', totalVisits);
    }
    
    updateTodayVisits() {
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        let todayVisits = 0;
        
        if (lastVisitDate === today) {
            todayVisits = parseInt(localStorage.getItem('todayVisits') || 0) + 1;
        } else {
            todayVisits = 1;
        }
        
        localStorage.setItem('todayVisits', todayVisits);
        localStorage.setItem('lastVisitDate', today);
        
        this.animateCounter('todayVisits', todayVisits);
    }
    
    updateLastVisitTime() {
        const now = new Date();
        const lastVisitElement = document.getElementById('lastVisitTime');
        
        if (lastVisitElement) {
            lastVisitElement.textContent = now.toLocaleString('vi-VN');
        }
    }
    
    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let currentValue = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue).toLocaleString();
        }, 30);
    }
    
    animateNumbers() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach((num, index) => {
            setTimeout(() => {
                num.style.animation = 'countUp 1s ease-out';
            }, index * 200);
        });
    }
    
    simulateOnlineUsers() {
        // Mô phỏng số người online (1-5 người)
        const onlineElement = document.getElementById('onlineUsers');
        if (onlineElement) {
            const randomOnline = Math.floor(Math.random() * 5) + 1;
            this.animateCounter('onlineUsers', randomOnline);
        }
    }
}


// ============================================================================
// Bộ đếm thời gian thực với API
// ============================================================================
class RealtimeVisitorCounter {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.init();
    }
    
    async init() {
        try {
            await this.recordVisit();
            await this.updateCounters();
            this.startRealTimeUpdates();
        } catch (error) {
            console.error('Lỗi khởi tạo counter:', error);
            this.fallbackToLocal();
        }
    }
    
    async recordVisit() {
        const response = await fetch(`${this.apiEndpoint}/visit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            })
        });
        
        return response.json();
    }
    
    async updateCounters() {
        const response = await fetch(`${this.apiEndpoint}/stats`);
        const data = await response.json();
        
        this.animateCounter('totalVisits', data.total);
        this.animateCounter('todayVisits', data.today);
        this.animateCounter('onlineUsers', data.online);
    }
    
    startRealTimeUpdates() {
        // Cập nhật mỗi 30 giây
        setInterval(() => {
            this.updateCounters();
        }, 30000);
    }
    
    fallbackToLocal() {
        // Fallback về localStorage nếu API không hoạt động
        new AdvancedVisitorCounter();
    }
    
    animateCounter(elementId, targetValue) {
        // Sử dụng hàm animate từ class trước
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const difference = targetValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        
        let step = 0;
        const timer = setInterval(() => {
            step++;
            currentValue += stepValue;
            
            if (step >= steps) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(currentValue).toLocaleString();
        }, 50);
    }
}

// Sử dụng với API endpoint
// new RealtimeVisitorCounter('https://yourapi.com/api/counter');

// ============================================================================
// Reset counter (chỉ admin)
// ============================================================================


function saveDetailedStats() {
    const stats = {
        visit: {
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`
        }
    };
    
    const allStats = JSON.parse(localStorage.getItem('detailedStats') || '[]');
    allStats.push(stats);
    
    // Giữ chỉ 100 records gần nhất
    if (allStats.length > 100) {
        allStats.splice(0, allStats.length - 100);
    }
    
    localStorage.setItem('detailedStats', JSON.stringify(allStats));
}

// Thêm vào file main.js
function showResetButton() {
    // Hiện button reset khi nhấn Ctrl + Shift + R
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.style.display = resetBtn.style.display === 'none' ? 'inline-block' : 'none';
                console.log('Reset button toggled');
            }
        }
    });
}

// Cập nhật hàm resetCounter với confirm đẹp hơn
function resetCounter() {
    // Tạo confirm dialog tùy chỉnh
    const confirmDialog = document.createElement('div');
    confirmDialog.innerHTML = `
        <div class="custom-confirm-overlay">
            <div class="custom-confirm-box">
                <h3>⚠️ Xác nhận xóa dữ liệu</h3>
                <p>Bạn có chắc muốn reset tất cả dữ liệu thống kê?</p>
                <div class="confirm-buttons">
                    <button id="confirmYes" class="confirm-btn yes-btn">Có, xóa hết</button>
                    <button id="confirmNo" class="confirm-btn no-btn">Không</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Xử lý sự kiện
    document.getElementById('confirmYes').onclick = function() {
        localStorage.removeItem('totalVisits');
        localStorage.removeItem('todayVisits');
        localStorage.removeItem('lastVisitDate');
        localStorage.removeItem('detailedStats');
        document.body.removeChild(confirmDialog);
        location.reload();
    };
    
    document.getElementById('confirmNo').onclick = function() {
        document.body.removeChild(confirmDialog);
    };
}

// ============================================================================
// LỰA CHỌN LỚP HỌC
// ============================================================================

function initializeClassSelection() {
    const classListSelect = document.getElementById('classListSelect');
    const fileInput = document.getElementById('fileInput');
    const fileUploadContainer = document.querySelector('.file-upload');
    
    if (!fileUploadContainer || !fileInput) return;

    // Ẩn input file ban đầu
    fileInput.style.display = 'none';

    // Thêm select box vào container nếu chưa có
    if (!classListSelect) {
        const selectContainer = document.createElement('div');
        selectContainer.className = 'class-select-container';
        selectContainer.innerHTML = `
            <select id="classListSelect">
                <option value="">-- Chọn lớp học --</option>
            </select>
        `;
        fileUploadContainer.insertBefore(selectContainer, fileInput);
    }

    // Lấy lại tham chiếu sau khi có thể đã tạo mới
    const updatedClassListSelect = document.getElementById('classListSelect');

    // Tải danh sách lớp
    fetch('/api/listclass')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải danh sách lớp');
            }
            return response.json();
        })
        .then(data => {
            if (data.files && data.files.length > 0) {
                // Xóa các option cũ (trừ option đầu tiên)
                while (updatedClassListSelect.options.length > 1) {
                    updatedClassListSelect.remove(1);
                }

                // Thêm các lớp học vào select
                data.files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file;
                    option.textContent = file.replace('.xlsx', '').replace('.xls', '');
                    updatedClassListSelect.appendChild(option);
                });

                // Thêm tùy chọn "Chọn file khác"
                const otherOption = document.createElement('option');
                otherOption.value = 'other';
                otherOption.textContent = 'Another...';
                updatedClassListSelect.appendChild(otherOption);
            } else {
                console.log('Không tìm thấy file Excel trong thư mục ListClass');
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách lớp:', error);
        });

    // Xử lý hiện/ẩn chọn file khác
    updatedClassListSelect.addEventListener("change", function() {
        const selectedValue = this.value;
        const fileLabel = document.querySelector(".file-label");

        if (selectedValue === "other") {
            if (fileLabel) fileLabel.style.display = "inline-block";
        } else {
            if (fileLabel) fileLabel.style.display = "none";
        }
    });

    // Xử lý khi chọn lớp
    updatedClassListSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            fileInput.style.display = 'block';
            fileInput.click();
        } else if (this.value !== '') {
            fileInput.style.display = 'none';
            loadClassData(this.value);
        }
    });
}

function loadClassData(filename) {
    fetch(`/api/listclass/${filename}`)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            displayStudentList(rows);
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu lớp:', error);
        });
}

function displayStudentList(rows) {
    const studentListDiv = document.getElementById('studentList');
    if (!studentListDiv) return;

    studentListDiv.innerHTML = '';
    // Lưu lại thứ tự gốc (bỏ dòng tiêu đề)
    originalStudentRows = rows.slice(1);

    rows.forEach((row, index) => {
        if (index > 0 && row.length > 0) {
            const studentDiv = document.createElement('div');
            studentDiv.textContent = row[0];
            studentDiv.className = 'student';
            studentListDiv.appendChild(studentDiv);
        }
    });
}

function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        displayStudentList(rows);
    };
    reader.readAsArrayBuffer(file);
}

// ============================================================================
// CHỌN HỌC SINH NGẪU NHIÊN
// ============================================================================

function selectRandomStudentWithEffect() {
    const students = document.querySelectorAll(".student:not(.selected)");
    if (students.length === 0) {
        alert("Hãy import danh sách học sinh trước!");
        return;
    }

    // Ngăn nhấn random khi hiệu ứng đang chạy
    if (isEffectRunning) return;
    isEffectRunning = true;

    
    const totalDuration = 7500;
    const stepDuration = 400;

    // Reset trạng thái ban đầu
    students.forEach(student => student.classList.remove("highlight-yellow"));

    // Hiệu ứng chạy nền vàng lần lượt
    const highlightInterval = setInterval(() => {
        students.forEach(student => student.classList.remove("highlight-yellow"));
        
        // Chọn ngẫu nhiên học sinh để highlight
        const randomIndex = Math.floor(Math.random() * students.length);
        students[randomIndex].classList.add("highlight-yellow");
    }, stepDuration);

    // Sau 7 giây, chuyển sang nhấp nháy 3 học sinh
    setTimeout(() => {
        clearInterval(highlightInterval);
        // Reset lại trạng thái nền cho tất cả
        students.forEach(student => student.classList.remove("highlight-yellow"));

        // Chọn 3 học sinh để nhấp nháy
        const unselectedStudents = Array.from(students);
        const selectedStudents = [];

        while (selectedStudents.length < 3 && unselectedStudents.length > 0) {
            const randomIndex = Math.floor(Math.random() * unselectedStudents.length);
            const selectedStudent = unselectedStudents.splice(randomIndex, 1)[0];
            selectedStudents.push(selectedStudent);
        }

        // Hiển thị tên thật của 3 học sinh được chọn trong chế độ bí mật
        if (document.getElementById('secretMode').checked) {
            selectedStudents.forEach(student => {
                if (student.dataset.name) {
                    student.textContent = student.dataset.name;
                }
            });
        }

        // Nhấp nháy chậm ở 3 học sinh
        selectedStudents.forEach(student => {
            student.classList.add("slow-highlight");
        });

        // Sau 5 giây nữa, chọn 1 học sinh cuối cùng
        setTimeout(() => {
            // Chọn ngẫu nhiên 1 học sinh từ 3 học sinh vừa nhấp nháy
            const finalSelectedStudent = selectedStudents[Math.floor(Math.random() * selectedStudents.length)];

            // Reset trạng thái tất cả học sinh
            students.forEach(student => student.classList.remove("slow-highlight"));

            // Đảm bảo hiển thị tên thật của học sinh được chọn trong chế độ bí mật
            if (document.getElementById('secretMode').checked && finalSelectedStudent.dataset.name) {
                finalSelectedStudent.textContent = finalSelectedStudent.dataset.name;
            }

            // Đánh dấu học sinh được chọn
            finalSelectedStudent.classList.add("selected");
            finalSelectedStudent.style.backgroundColor = "red";

            // Hiệu ứng pháo hoa
            const rect = finalSelectedStudent.getBoundingClientRect();
            createFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);

            // Thêm hiệu ứng bay cho tên học sinh
            const flyingName = document.createElement("div");
            flyingName.className = "flying-name";
            flyingName.textContent = finalSelectedStudent.textContent;
            document.body.appendChild(flyingName);
            flyingName.style.left = `${rect.left + rect.width / 2}px`;
            flyingName.style.top = `${rect.top}px`;
            setTimeout(() => {
                flyingName.remove();
            }, 4000);

            // Gắn hình ảnh vui nhộn
            const emojiImage = document.createElement("img");
            emojiImage.className = "emoji-image";
            emojiImage.src = "/bg/troll3.gif";
            emojiImage.alt = "Hình ảnh vui nhộn";
            document.body.appendChild(emojiImage);

            // Điều chỉnh vị trí hình ảnh ngay phía trên tên
            emojiImage.style.position = "absolute";
            emojiImage.style.left = `${rect.left + rect.width / 2 - emojiImage.width / 2}px`;
            emojiImage.style.top = `${rect.top - emojiImage.height - 10}px`;
            setTimeout(() => {
                emojiImage.remove();
            }, 3300);

            // Đọc tên học sinh
            const studentName = finalSelectedStudent.textContent;
            console.log("Đọc tên học sinh:", studentName);
            speak(studentName);

            // Kết thúc hiệu ứng
            isEffectRunning = false;
        }, 7000);
    }, totalDuration);
}

function createFireworks(x, y) {
    for (let i = 0; i < 10; i++) {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;
        firework.style.animationDelay = `${Math.random()}s`;
        document.body.appendChild(firework);
        setTimeout(() => {
            firework.remove();
        }, 1000);
    }
}

function runFunnyDuckAnimation() {
    if (duckMoving) return;
    duckMoving = true;
    
    const funnyDuck = document.getElementById('funnyDuck');
    const studentListDiv = document.getElementById('studentList');
    const students = Array.from(document.querySelectorAll(".student:not(.selected)"));

    if (!funnyDuck || !studentListDiv || students.length === 0) {
        duckMoving = false;
        alert("Hãy import danh sách học sinh trước!");
        return;
    }

    // Đảm bảo vịt dùng position: fixed
    funnyDuck.style.display = 'block';
    funnyDuck.style.position = 'fixed';

    // Lấy vùng danh sách học sinh
    const listRect = studentListDiv.getBoundingClientRect();
    const duckWidth = funnyDuck.offsetWidth;
    const duckHeight = funnyDuck.offsetHeight;

    // Đặt vịt ở vị trí ngẫu nhiên ban đầu
    function randomPos() {
        const x = listRect.left + Math.random() * (listRect.width - duckWidth);
        const y = listRect.top + Math.random() * (listRect.height - duckHeight);
        return {x, y};
    }

    // Hàm di chuyển vịt mượt đến vị trí mới
    function moveDuckSmoothly(toX, toY, duration = 1200, cb) {
        const fromX = parseFloat(funnyDuck.style.left) || listRect.left;
        const fromY = parseFloat(funnyDuck.style.top) || listRect.top;
        const start = performance.now();
        
        function animateDuck(now) {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / duration);
            const currentX = fromX + (toX - fromX) * t;
            const currentY = fromY + (toY - fromY) * t;
            
            funnyDuck.style.left = `${currentX}px`;
            funnyDuck.style.top = `${currentY}px`;
            
            if (t < 1) {
                requestAnimationFrame(animateDuck);
            } else if (cb) {
                cb();
            }
        }
        requestAnimationFrame(animateDuck);
    }

    // Đặt vịt ở vị trí random đầu tiên
    const first = randomPos();
    funnyDuck.style.left = `${first.x}px`;
    funnyDuck.style.top = `${first.y}px`;

    // Số lần di chuyển
    const totalDuration = 12000;
    const stepDuration = 1200;
    const steps = Math.floor(totalDuration / stepDuration);
    let currentStep = 0;

    function nextMove() {
        if (currentStep < steps) {
            const pos = randomPos();
            moveDuckSmoothly(pos.x, pos.y, stepDuration, () => {
                currentStep++;
                nextMove();
            });
        } else {
            // Dừng lại trên một học sinh
            const chosenIdx = Math.floor(Math.random() * students.length);
            const chosenStudent = students[chosenIdx];
            const studentRect = chosenStudent.getBoundingClientRect();
            const finalX = studentRect.left + studentRect.width/2 - duckWidth/2;
            const finalY = studentRect.top + chosenStudent.offsetHeight - duckHeight;

            moveDuckSmoothly(finalX, finalY, 1200, () => {
                // Nháy tên học sinh
                students.forEach(s => s.classList.remove('selected'));
                chosenStudent.classList.add('selected');
                
                if (document.getElementById('secretMode').checked && chosenStudent.dataset.name) {
                    chosenStudent.textContent = chosenStudent.dataset.name;
                }

                // Đọc tên
                const name = chosenStudent.textContent;
                speak(name);
                duckMoving = false;
            });
        }
    }
    nextMove();
}

// ============================================================================
// THEME VÀ MUSIC
// ============================================================================

function changeTheme() {
    const selectedTheme = this.value;
    if (backgroundImages[selectedTheme]) {
        const imagePath = backgroundImages[selectedTheme];
        
        const img = new Image();
        img.src = imagePath;
        img.onload = function() {
            document.body.style.backgroundImage = `url('${imagePath}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        };
        img.onerror = function() {
            console.error(`Hình nền không tồn tại: ${imagePath}`);
            document.body.style.backgroundImage = '';
        };
    } else {
        document.body.style.backgroundImage = '';
    }
}

function changeBackgroundMusic() {
    const selectedMusic = this.value;
    const backgroundMusic = document.getElementById("backgroundMusic");
    if (selectedMusic) {
        backgroundMusic.src = `/Sound/${selectedMusic}.mp3`;
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

// ============================================================================
// CHAT AI
// ============================================================================

function initializeChatInterface() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) chatContainer.classList.add('chat-collapsed');

    const toggleChat = document.getElementById('toggleChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKey = document.getElementById('saveApiKey');

    // Xử lý sự kiện xóa lịch sử
    const clearHistoryBtn = document.getElementById('clearHistory');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearChatHistory);
    }

    // Mở/đóng khung chat
    if (toggleChat) {
        toggleChat.addEventListener('click', function() {
            chatContainer.classList.toggle('chat-collapsed');
            toggleChat.textContent = chatContainer.classList.contains('chat-collapsed') ? '▼' : '▲';
        });
    }

    // Lưu API key
    if (saveApiKey) {
        saveApiKey.addEventListener('click', function() {
            const newApiKey = apiKeyInput.value;
            if (newApiKey && newApiKey !== '********') {
                localStorage.setItem('openai_api_key', newApiKey);
                apiKey = newApiKey;
                apiKeyInput.value = '********';
                addMessage('API key đã được lưu', 'ai-message');
            }
        });
    }

    // Xử lý sự kiện gửi tin nhắn
    if (sendMessage) {
        sendMessage.addEventListener('click', sendChatMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Khởi tạo khung chat
    if (chatMessages && chatMessages.children.length === 0) {
        addMessage('Xin chào! Tôi là trợ lý AI của thầy Quảng. Bạn cần giúp gì?', 'ai-message');
    }

    // Theme toggle
    const toggleThemeBtn = document.getElementById('toggleTheme');
    if (toggleThemeBtn) {
        const savedTheme = localStorage.getItem('chatTheme') || 'light';
        document.querySelector('.chat-container').classList.add(savedTheme + '-mode');
        
        toggleThemeBtn.addEventListener('click', function() {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer.classList.contains('dark-mode')) {
                chatContainer.classList.remove('dark-mode');
                chatContainer.classList.add('light-mode');
                localStorage.setItem('chatTheme', 'light');
            } else {
                chatContainer.classList.remove('light-mode');
                chatContainer.classList.add('dark-mode');
                localStorage.setItem('chatTheme', 'dark');
            }
        });
    }
}


function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return;

    // HIỂN THỊ TIN NHẮN USER NGAY LẬP TỨC - KHÔNG LƯU VÀO HISTORY
    addMessage(message, 'user-message', false);
    
    // Xóa nội dung input
    chatInput.value = '';
    
    // Thêm vào history SAU KHI hiển thị
    conversationHistory.push({role: 'user', content: message});
    
    // Lưu history
    saveHistory();
    
    // Gọi API
    callAI(conversationHistory);
}




function addMessage(text, className, saveToHistory = true) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    const messageId = `msg-${Date.now()}`;
    messageDiv.id = messageId;

    // Tạo container cho nội dung tin nhắn
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Xử lý nội dung tin nhắn
    if (className === 'ai-message') {
        try {
            // Xử lý Markdown nếu có thư viện
            if (typeof marked !== 'undefined') {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                text = text.replace(urlRegex, function(url) {
                    return `[${url}](${url})`;
                });
                
                let formattedText = marked.parse(text);
                if (typeof DOMPurify !== 'undefined') {
                    formattedText = DOMPurify.sanitize(formattedText);
                }
                formattedText = formattedText.replace(/<a/g, '<a target="_blank"');
                messageContent.innerHTML = formattedText;
            } else {
                messageContent.textContent = text;
            }
        } catch (error) {
            console.error('Lỗi khi xử lý Markdown:', error);
            messageContent.textContent = text;
        }
    } else {
        messageContent.textContent = text;
    }

    messageDiv.appendChild(messageContent);
    
    // Thêm timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    messageDiv.appendChild(timestamp);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Lưu vào lịch sử nếu cần (KHÔNG lưu loading message)
    if (saveToHistory && text !== 'Đang suy nghĩ...') {
        if (className === 'ai-message') {
            conversationHistory.push({role: 'assistant', content: text});
        } else if (className === 'user-message') {
            conversationHistory.push({role: 'user', content: text});
        }
    }

    return messageId;
}




function callAI(history) {
    const recentMessages = history.slice(-10);
    const loadingId = addMessage('Đang suy nghĩ...', 'ai-message', false);

    // Sử dụng endpoint mới
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: recentMessages.map(msg => ({
                parts: [{ text: msg.content }],
                role: msg.role === "user" ? "user" : "model"
            }))
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Xóa loading message
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiMessage = data.candidates[0].content.parts[0].text;
            // Thêm tin nhắn AI mới
            addMessage(aiMessage, 'ai-message', true);
            saveHistory();
        } else if (data.error) {
            addMessage(`Lỗi API: ${data.error.message}`, 'ai-message', false);
        } else {
            addMessage('Không nhận được phản hồi từ AI', 'ai-message', false);
        }
    })
    .catch(error => {
        // Xóa loading message
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        
        console.error('AI API Error:', error);
        addMessage(`Lỗi kết nối: ${error.message}`, 'ai-message', false);
    });
}


// ============================================================================
// TẠO NHÓM
// ============================================================================

function initializeGroupCreation() {
    const createGroupsButton = document.getElementById('createGroups');
    if (createGroupsButton) {
        createGroupsButton.addEventListener('click', function() {
            const groupSize = parseInt(document.getElementById('groupSize').value);
            if (isNaN(groupSize) || groupSize < 2) {
                alert('Vui lòng nhập số người trong nhóm hợp lệ (ít nhất 2)');
                return;
            }

            const students = Array.from(document.querySelectorAll('.student:not(.selected)'))
                .map(student => {
                    return document.getElementById('secretMode').checked ?
                        student.dataset.name || student.textContent :
                        student.textContent;
                });

            if (students.length < groupSize) {
                alert(`Không đủ học sinh để tạo nhóm (cần ít nhất ${groupSize} học sinh)`);
                return;
            }

            // Trộn ngẫu nhiên danh sách học sinh
            const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
            
            // Chia thành các nhóm
            const groups = [];
            for (let i = 0; i < shuffledStudents.length; i += groupSize) {
                groups.push(shuffledStudents.slice(i, i + groupSize));
            }

            // Hiển thị các nhóm
            displayGroups(groups);
        });
    }
}

function displayGroups(groups) {
    const groupsContainer = document.getElementById('groupsContainer');
    if (!groupsContainer) return;

    groupsContainer.innerHTML = '';

    groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group';

        const groupHeader = document.createElement('h4');
        groupHeader.textContent = `Nhóm ${index + 1}`;
        groupDiv.appendChild(groupHeader);

        const membersList = document.createElement('ul');
        group.forEach(student => {
            const memberItem = document.createElement('li');
            memberItem.textContent = student;
            membersList.appendChild(memberItem);
        });
        groupDiv.appendChild(membersList);
        groupsContainer.appendChild(groupDiv);
    });

    // Tạo hiệu ứng cho các nhóm
    const groupElements = document.querySelectorAll('.group');
    groupElements.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('group-appear');
        }, index * 200);
    });
}

// ============================================================================
// CHAT HISTORY
// ============================================================================

function initializeChat() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        try {
            conversationHistory = JSON.parse(savedHistory);
            conversationHistory = conversationHistory.filter(msg =>
                msg.content !== 'Đang suy nghĩ...'
            );

            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                conversationHistory.forEach(msg => {
                    addMessage(msg.content, msg.role === 'user' ? 'user-message' : 'ai-message', false);
                });
            }
            saveHistory();
        } catch (error) {
            console.error("Lỗi khi khôi phục lịch sử chat:", error);
            conversationHistory = [];
        }
    }
}

function saveHistory() {
    const uniqueMessages = [];
    const seenContents = new Set();
    
    for (const msg of conversationHistory) {
        if (msg.content === 'Đang suy nghĩ...') continue;
        
        const key = `${msg.role}:${msg.content}`;
        if (!seenContents.has(key)) {
            seenContents.add(key);
            uniqueMessages.push(msg);
        }
    }
    
    conversationHistory = uniqueMessages;
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

function clearChatHistory() {
    localStorage.removeItem('chatHistory');
    conversationHistory = [];
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        addMessage('Lịch sử trò chuyện đã được xóa. Tôi là trợ lý AI của thầy Quảng. Bạn cần giúp gì?', 'ai-message');
    }
}

function cleanupHistory() {
    conversationHistory = conversationHistory.filter(msg =>
        msg.content !== 'Đang suy nghĩ...'
    );
    saveHistory();
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            addMessage(msg.content, msg.role === 'user' ? 'user-message' : 'ai-message', false);
        });
    }
}

// ============================================================================
// HÀM HỖ TRỢ
// ============================================================================

function speak(text) {
    if (!text) return;
    
    if ('speechSynthesis' in window) {
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = 'vi-VN';
        utter.rate = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    } else {
        const ttsAudio = document.getElementById("ttsAudio");
        if (!ttsAudio) {
            const newAudio = document.createElement("audio");
            newAudio.id = "ttsAudio";
            document.body.appendChild(newAudio);
        }
        
        const audioElement = document.getElementById("ttsAudio") || new Audio();
        audioElement.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
        audioElement.play().catch(() => {});
    }
}



console.log('Main.js loaded successfully');
