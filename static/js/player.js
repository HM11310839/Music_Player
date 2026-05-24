first = 0;
class VideoPlayer {
    constructor() {
        this.videoElement = document.getElementById('videoPlayer');
        this.videoListElement = document.getElementById('videoList');
        this.audioListElement = document.getElementById('audioList');
        this.currentVideoTitle = document.getElementById('currentVideoTitle');
        this.currentLyricForeign = document.getElementById('currentLyricForeign');
        this.currentLyricChinese = document.getElementById('currentLyricChinese');
        this.debugInfo = document.getElementById('debugInfo');
        this.lyricTitle = document.getElementById('Lyric');
        this.lyricContainer = document.getElementById('lyricContainer');
        this.shuffleButtonInfo = document.getElementById('shuffleButtonInfo');

        this.videos = [];
        this.audios = [];
        this.video_lyrics_foreign = [];
        this.video_lyrics_chinese = [];
        this.audio_lyrics_foreign = [];
        this.audio_lyrics_chinese = [];

        this.currentIndex = 0;
        this.currentMode = 'audio'; //video, audio
        this.playMode = 'shuffle'; // sequential, loop, shuffle
        this.isPlaying = false;
        this.shuffledListVideo = [];
        this.shuffledListAudio = [];
        this.init();
    }

    async init() {
        await this.loadVideos();
        await this.loadAudios();
        this.setupEventListeners();
        this.updateModeButtons();
        this.setupDragAndDrop();
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos');
            this.videos = await response.json();
            const response1 = await fetch('/api/video_lyrics_foreign');
            this.video_lyrics_foreign = await response1.json();
            const response2 = await fetch('/api/video_lyric_chinese');
            this.video_lyrics_chinese = await response2.json()

            this.shuffledListVideo = [...this.videos];
            this.shuffleVideos();
            this.renderVideoList();

            if (this.currentMode == 'video') {
                first = Math.floor(Math.random() * (this.videos.length - 1));
                if (this.videos.length > 0) {
                    this.loadVideo(first);
                }
            }

        } catch (error) {
            console.error('加载视频列表失败:', error);
        }
    }

    renderVideoList() {
        if (this.videos.length === 0) {
            if (this.currentMode == 'video') {
                this.currentMode = 'audio';
            }
            this.videoListElement.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-video-slash"></i>
                    <p>文件夹中没有视频文件</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.videos.forEach((video, index) => {
            const isActive = (index === this.currentIndex && this.currentMode == 'video');
            html += `
                <div class="video-item ${isActive ? 'active' : ''}" data-index="${index}">
                    <div>
                        <i class="fas fa-file-video"></i>
                        ${video}
                    </div>
                    <button class="delete-btn" onclick="player.deleteVideo(\`${video}\`)">
                        <!--修复日志：需用\`\`代替''，否则遇到如I can't wait等会报错-->
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        this.videoListElement.innerHTML = html;

        // 添加点击事件
        document.querySelectorAll('.video-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.loadVideo(index);
                }
            });
        });
    }

    async loadAudios() {
        try {
            const response = await fetch('/api/audios');
            this.audios = await response.json();
            const response1 = await fetch('/api/audio_lyrics_foreign');
            this.audio_lyrics_foreign = await response1.json();
            const response2 = await fetch('/api/audio_lyric_chinese');
            this.audio_lyrics_chinese = await response2.json()

            this.shuffledListAudio = [...this.audios];
            this.shuffleAudios();
            this.renderAudioList();
            if (this.currentMode == 'audio') {
                first = Math.floor(Math.random() * (this.audios.length - 1));
                if (this.audios.length > 0) {
                    this.loadAudio(first);
                }
            }

        } catch (error) {
            console.error('加载音频列表失败:', error);
        }
    }

    renderAudioList() {
        if (this.audios.length === 0) {
            if (this.currentMode == 'audio') {
                this.currentMode = 'video';
            }
            this.audioListElement.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-video-slash"></i>
                    <p>文件夹中没有音频文件</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.audios.forEach((audio, index) => {
            const isActive = (index === this.currentIndex && this.currentMode == 'audio');
            html += `
                <div class="audio-item ${isActive ? 'active' : ''}" data-index="${index}">
                    <div>
                        <i class="fas fa-file-audio"></i>
                        ${audio}
                    </div>
                    <button class="delete-btn" onclick="player.deleteAudio(\`${audio}\`)">
                        <!--修复日志：需用\`\`代替''，否则遇到如I can't wait等会报错-->
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        this.audioListElement.innerHTML = html;

        // 添加点击事件
        document.querySelectorAll('.audio-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.loadAudio(index);
                }
            });
        });
    }

    async loadVideo(index) {
        if (index < 0 || index >= this.videos.length) return;

        this.currentIndex = index;
        this.currentMode = 'video';
        const videoFile = this.videos[index];

        this.videoElement.src = `/video/${encodeURIComponent(videoFile)}`;
        this.currentVideoTitle.textContent = videoFile;
        this.showLyric()
        this.debugMode()

        // 更新列表高亮
        document.querySelectorAll('.video-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // 自动播放
        const autoPlay = document.getElementById('autoPlayNext').checked;
        if (autoPlay) {
            await this.videoElement.play();
            this.isPlaying = true;
            this.updatePlayButton();
        }
    }

    async loadAudio(index) {
        if (index < 0 || index >= this.audios.length) return;

        this.currentIndex = index;
        this.currentMode = 'audio';
        const audioFile = this.audios[index];

        //
        this.videoElement.src = `/audio/${encodeURIComponent(audioFile)}`;
        //获取封面图片
        const coverResponse = await fetch(`/api/audio_cover/${audioFile}`);
        const coverData = await coverResponse.json();
        const coverUrl = coverData.cover_url;
        this.videoElement.poster = coverUrl;
        //

        this.currentVideoTitle.textContent = audioFile;
        this.showLyric()
        this.debugMode()

        // 更新列表高亮
        document.querySelectorAll('.audio-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // 自动播放
        const autoPlay = document.getElementById('autoPlayNext').checked;
        if (autoPlay) {
            await this.videoElement.play();
            this.isPlaying = true;
            this.updatePlayButton();
        }
    }


    showLyric() {
        const showLyric = document.getElementById('showLyric').checked;
        if (showLyric){
            this.lyricContainer.style = "";
            const index = this.currentIndex;
            if (this.currentMode == 'video') {
                const videoFile = this.videos[index];
                const lf = this.video_lyrics_foreign[index];
                const lc = this.video_lyrics_chinese[index];
                const lyricTitle = "Lyric for " + videoFile;
                this.lyricTitle.innerHTML = lyricTitle;
                this.currentLyricForeign.innerHTML = lf;
                this.currentLyricChinese.innerHTML = lc;
            }
            else {
                const audioFile = this.audios[index];
                const lf = this.audio_lyrics_foreign[index];
                const lc = this.audio_lyrics_chinese[index];
                const lyricTitle = "Lyric for " + audioFile;
                this.lyricTitle.innerHTML = lyricTitle;
                this.currentLyricForeign.innerHTML = lf;
                this.currentLyricChinese.innerHTML = lc;
            }
        }
        else{
            this.lyricTitle.innerHTML = "";
            this.currentLyricForeign.innerHTML = "";
            this.currentLyricChinese.innerHTML = "";
            this.lyricContainer.style = "display:none";
        }
    }

    getNextIndex(indexNow) {
        let nextIndex;
        if (this.currentMode == 'video') {
            switch (this.playMode) {
                case 'sequential':
                    nextIndex = (indexNow + 1) % this.videos.length;
                    break;
                case 'loop':
                    nextIndex = indexNow;
                    break;
                case 'shuffle':
                    const currentVideo = this.videos[indexNow];
                    const shuffledIndex = this.shuffledListVideo.indexOf(currentVideo);
                    nextIndex = this.videos.indexOf(this.shuffledListVideo[(shuffledIndex + 1) % this.shuffledListVideo.length]);
                    break;
            }
            return nextIndex;
        }
        else {
            switch (this.playMode) {
                    case 'sequential':
                        nextIndex = (indexNow + 1) % this.audios.length;
                        break;
                    case 'loop':
                        nextIndex = indexNow;
                        break;
                    case 'shuffle':
                        const currentAudio = this.audios[indexNow];
                        const shuffledIndex = this.shuffledListAudio.indexOf(currentAudio);
                        nextIndex = this.audios.indexOf(this.shuffledListAudio[(shuffledIndex + 1) % this.shuffledListAudio.length]);
                        break;
                }
                return nextIndex;
        }
    }

    debugMode() {
        const debugMode = document.getElementById('debugMode').checked;
        if (debugMode){
            const nextLength = 5
            if (this.currentMode == 'video') {
                let info = ""
                    + "  Now index:<br>"
                    + this.videos[this.currentIndex] + " (" + this.currentIndex + ")<br>"
                    + "  Next play:<br>";
                let nextIndex = this.currentIndex;
                for (var i = 1; i <= nextLength; i++){
                    nextIndex = this.getNextIndex(nextIndex);
                    info = info + this.videos[nextIndex] + " (" + nextIndex + ")<br>";
                }
                info += "<br>";
                this.debugInfo.innerHTML = info;
                this.shuffleButtonInfo.innerHTML = "刷新播放列表";
                console.log("Now index:" + this.currentIndex + ":" + this.videos[this.currentIndex]);
            }
            else {
                let info = ""
                    + "  Now index:<br>"
                    + this.audios[this.currentIndex] + " (" + this.currentIndex + ")<br>"
                    + "  Next play:<br>";
                let nextIndex = this.currentIndex;
                for (var i = 1; i <= nextLength; i++){
                    nextIndex = this.getNextIndex(nextIndex);
                    info = info + this.audios[nextIndex] + " (" + nextIndex + ")<br>";
                }
                info += "<br>";
                this.debugInfo.innerHTML = info;
                this.shuffleButtonInfo.innerHTML = "刷新播放列表";
                console.log("Now index:" + this.currentIndex + ":" + this.audios[this.currentIndex]);
            }

            console.log("Video list:\n" + this.videos);
            console.log("Video shuffled:\n" + this.shuffledListVideo);
            console.log("Audio list:\n" + this.audios);
            console.log("Audio shuffled:\n" + this.shuffledListAudio);
        }
        else{
            this.debugInfo.innerHTML = "";
            this.shuffleButtonInfo.innerHTML = "";
        }
    }

    async playNext() {
        const autoPlayNext = document.getElementById('autoPlayNext').checked;
        if (!autoPlayNext) return;

        let nextIndex;

        if (this.currentMode == 'video') {
            switch (this.playMode) {
                case 'sequential':
                    nextIndex = (this.currentIndex + 1) % this.videos.length;
                    break;
                case 'loop':
                    nextIndex = this.currentIndex; // 播放同一个视频
                    break;
                case 'shuffle':
                    const currentVideo = this.videos[this.currentIndex];
                    const shuffledIndex = this.shuffledListVideo.indexOf(currentVideo);
                    nextIndex = this.videos.indexOf(
                        this.shuffledListVideo[(shuffledIndex + 1) % this.shuffledListVideo.length]
                    );
                    break;
            }
        }
        else {
            switch (this.playMode) {
                case 'sequential':
                    nextIndex = (this.currentIndex + 1) % this.audios.length;
                    break;
                case 'loop':
                    nextIndex = this.currentIndex; // 播放同一个视频
                    break;
                case 'shuffle':
                    const currentAudio = this.audios[this.currentIndex];
                    const shuffledIndex = this.shuffledListAudio.indexOf(currentAudio);
                    nextIndex = this.audios.indexOf(
                        this.shuffledListAudio[(shuffledIndex + 1) % this.shuffledListAudio.length]
                    );
                    break;
            }
        }


        const deltaTmin = 0;
        const deltaTmax = 0;
        if (this.currentMode == 'video') {
            setTimeout(()=>{this.loadVideo(nextIndex);},Math.floor(Math.random() * (deltaTmax - deltaTmin + 1)) + deltaTmin);
        }
        else {
            setTimeout(()=>{this.loadAudio(nextIndex);},Math.floor(Math.random() * (deltaTmax - deltaTmin + 1)) + deltaTmin);
        }
    }

    playPrev() {
        let prevIndex;

        if (this.currentMode == 'video'){
            switch (this.playMode) {
                case 'sequential':
                    prevIndex = (this.currentIndex - 1 + this.videos.length) % this.videos.length;
                    break;
                case 'loop':
                    prevIndex = this.currentIndex;
                    break;
                case 'shuffle':
                    const currentVideo = this.videos[this.currentIndex];
                    const shuffledIndex = this.shuffledListVideo.indexOf(currentVideo);
                    prevIndex = this.videos.indexOf(
                        this.shuffledListVideo[(shuffledIndex - 1 + this.shuffledListVideo.length) % this.shuffledListVideo.length]
                    );
                    break;
            }
        }
        else {
            switch (this.playMode) {
                case 'sequential':
                    prevIndex = (this.currentIndex - 1 + this.audios.length) % this.audios.length;
                    break;
                case 'loop':
                    prevIndex = this.currentIndex;
                    break;
                case 'shuffle':
                    const currentAudio = this.audios[this.currentIndex];
                    const shuffledIndex = this.shuffledListAudio.indexOf(currentAudio);
                    prevIndex = this.audios.indexOf(
                        this.shuffledListAudio[(shuffledIndex - 1 + this.shuffledListAudio.length) % this.shuffledListAudio.length]
                    );
                    break;
            }
        }

        if (this.currentMode == 'video') {
            this.loadVideo(prevIndex);
        }
        else {
            this.loadAudio(prevIndex)
        }
    }

    shuffleVideos() {
        for (let i = this.shuffledListVideo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledListVideo[i], this.shuffledListVideo[j]] = [this.shuffledListVideo[j], this.shuffledListVideo[i]];
        }
    }
    shuffleAudios() {
        for (let i = this.shuffledListAudio.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledListAudio[i], this.shuffledListAudio[j]] = [this.shuffledListAudio[j], this.shuffledListAudio[i]];
        }
    }


    togglePlayPause() {
        if (this.videoElement.paused) {
            this.videoElement.play();
            this.isPlaying = true;
        } else {
            this.videoElement.pause();
            this.isPlaying = false;
        }
        this.updatePlayButton();
    }

    updatePlayButton() {
        const icon = this.isPlaying ? 'fa-pause' : 'fa-play';
        document.querySelector('#playPauseBtn i').className = `fas ${icon}`;
    }

    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.playMode) {
                btn.classList.add('active');
            }
        });
    }

    async deleteVideo(filename) {
        if (!confirm(`确定要删除 "${filename}" 吗？`)) return;

        try {
            const response = await fetch(`/api/delete/video/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadVideos();
            } else {
                const error = await response.json();
                alert('删除失败: ' + error.error);
            }
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    }

    async uploadVideo(files) {
        const uploadArea = document.getElementById('uploadAreaVideo');

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload/video', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('上传成功:', result.filename);
                } else {
                    alert(`上传失败: ${result.error}`);
                }
            } catch (error) {
                alert(`上传失败: ${error.message}`);
            }
        }

        // 重新加载视频列表
        await this.loadVideos();
        uploadArea.style.background = '';
    }

    async deleteAudio(filename) {
        if (!confirm(`确定要删除 "${filename}" 吗？`)) return;

        try {
            const response = await fetch(`/api/delete/audio/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadAudios();
            } else {
                const error = await response.json();
                alert('删除失败: ' + error.error);
            }
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    }

    async uploadAudio(files) {
        const uploadArea = document.getElementById('uploadAreaAudio');

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload/audio', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('上传成功:', result.filename);
                } else {
                    alert(`上传失败: ${result.error}`);
                }
            } catch (error) {
                alert(`上传失败: ${error.message}`);
            }
        }

        // 重新加载音频列表
        await this.loadAudios();
        uploadArea.style.background = '';
    }

    setupEventListeners() {
        // 播放/暂停按钮
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 上一个/下一个按钮
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.playPrev();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.playNext();
        });

        // 全屏按钮
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (this.videoElement.requestFullscreen) {
                this.videoElement.requestFullscreen();
            }
        });

        // 音量控制
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.videoElement.volume = e.target.value;
            document.getElementById('muteAudio').checked = e.target.value > 0;
        });

        // 静音控制
        document.getElementById('muteAudio').addEventListener('change', (e) => {
            this.videoElement.muted = !e.target.checked;
            if (e.target.checked) {
                document.getElementById('volumeSlider').value = this.videoElement.volume;
            }
        });

        // 进度条
        document.getElementById('progressBar').addEventListener('input', (e) => {
            const time = (e.target.value / 100) * this.videoElement.duration;
            this.videoElement.currentTime = time;
        });

        // 视频时间更新
        this.videoElement.addEventListener('timeupdate', () => {
            const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100 || 0;
            document.getElementById('progressBar').value = progress;

            // 更新时间显示
            document.getElementById('currentTime').textContent =
                this.formatTime(this.videoElement.currentTime);
            document.getElementById('totalTime').textContent =
                this.formatTime(this.videoElement.duration);
        });

        // 视频播放结束
        this.videoElement.addEventListener('ended', () => {
            this.playNext();
        });

        // 播放模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playMode = btn.dataset.mode;
                if (this.playMode === 'shuffle') {
                    this.shuffleVideos();
                }
                this.updateModeButtons();
            });
        });

        // 刷新按钮
        document.getElementById('refreshBtnVideo').addEventListener('click', () => {
            this.loadVideos();
        });

        // 刷新按钮
        document.getElementById('refreshBtnAudio').addEventListener('click', () => {
            this.loadAudios();
        });


        // 文件上传
        document.getElementById('fileInputVideo').addEventListener('change', (e) => {
            this.uploadVideo(e.target.files);
            e.target.value = ''; // 重置input
        });
        // 文件上传
        document.getElementById('fileInputAudio').addEventListener('change', (e) => {
            this.uploadAudio(e.target.files);
            e.target.value = ''; // 重置input
        });


        //显示歌词
        document.getElementById('showLyric').addEventListener('click', () => {
            this.showLyric();
        });

        //调试模式
        document.getElementById('debugMode').addEventListener('click', () => {
            this.debugMode();
        });

        //刷新播放列表
        document.getElementById('shuffleButton').addEventListener('click', () => {
            if (this.currentMode == 'video') {
                this.shuffleVideos();
            }
            else {
                this.shuffleAudios();
            }
            this.debugMode();
        });
    }

    setupDragAndDrop() {
        const uploadArea1 = document.getElementById('uploadAreaVideo');
        const fileInput1 = document.getElementById('fileInputVideo');

        uploadArea1.addEventListener('click', () => {
            fileInput1.click();
        });

        uploadArea1.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea1.style.background = '#ecf0f1';
        });

        uploadArea1.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea1.style.background = '';
        });

        uploadArea1.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea1.style.background = '';

            const files = e.dataTransfer.files;
            const videoFiles = Array.from(files).filter(file =>
                file.type.startsWith('video/') ||
                ['.mp4', '.avi', '.mov', '.mkv', '.webm'].some(ext =>
                    file.name.toLowerCase().endsWith(ext))
            );

            if (videoFiles.length > 0) {
                this.uploadVideo(videoFiles);
            } else {
                alert('请拖放视频文件（MP4, AVI, MOV, MKV, WebM）');
            }
        });

        const uploadArea2 = document.getElementById('uploadAreaAudio');
        const fileInput2 = document.getElementById('fileInputAudio');

        uploadArea2.addEventListener('click', () => {
            fileInput2.click();
        });

        uploadArea2.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea2.style.background = '#ecf0f1';
        });

        uploadArea2.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea2.style.background = '';
        });

        uploadArea2.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea2.style.background = '';

            const files = e.dataTransfer.files;
            const audioFiles = Array.from(files).filter(file =>
                file.type.startsWith('audio/') ||
                ['.mp3', '.wav'].some(ext =>
                    file.name.toLowerCase().endsWith(ext))
            );

            if (audioFiles.length > 0) {
                this.uploadAudio(audioFiles);
            } else {
                alert('请拖放音频文件（MP3, WAV）');
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 初始化播放器
const player = new VideoPlayer();
