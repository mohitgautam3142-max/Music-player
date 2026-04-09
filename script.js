var app = new Vue({
  el: '#app',
  data: {
    tracks: [
      {
        name: 'Weightless',
        artist: 'Marconi Union',
        cover: 'https://picsum.photos/seed/track1/300/300',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        favorited: false
      },
      {
        name: 'River Flows in You',
        artist: 'Yiruma',
        cover: 'https://picsum.photos/seed/track2/300/300',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        favorited: false
      },
      {
        name: 'Experience',
        artist: 'Ludovico Einaudi',
        cover: 'https://picsum.photos/seed/track3/300/300',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        favorited: false
      },
      {
        name: 'Clair de Lune',
        artist: 'Claude Debussy',
        cover: 'https://picsum.photos/seed/track4/300/300',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        favorited: false
      }
    ],
    currentTrackIndex: 0,
    isTimerPlaying: false,
    duration: '0:00',
    currentTime: '0:00',
    barWidth: '0%',
    transitionName: 'scale-out',
    audio: null
  },
  computed: {
    currentTrack: function () {
      return this.tracks[this.currentTrackIndex];
    }
  },
  methods: {
    initAudio: function () {
      if (this.audio) {
        this.audio.pause();
        this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
        this.audio.removeEventListener('loadedmetadata', this.onMetaLoaded);
        this.audio.removeEventListener('ended', this.onEnded);
      }
      this.audio = new Audio(this.currentTrack.url);
      this.audio.addEventListener('timeupdate', this.onTimeUpdate);
      this.audio.addEventListener('loadedmetadata', this.onMetaLoaded);
      this.audio.addEventListener('ended', this.onEnded);
      this.barWidth = '0%';
      this.currentTime = '0:00';
      this.duration = '0:00';
    },
    onMetaLoaded: function () {
      this.duration = this.formatTime(this.audio.duration);
    },
    onTimeUpdate: function () {
      var current = this.audio.currentTime;
      var total = this.audio.duration;
      if (total) {
        this.barWidth = (current / total * 100) + '%';
      }
      this.currentTime = this.formatTime(current);
    },
    onEnded: function () {
      this.nextTrack();
    },
    formatTime: function (secs) {
      if (isNaN(secs)) return '0:00';
      var m = Math.floor(secs / 60);
      var s = Math.floor(secs % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    },
    play: function () {
      if (!this.audio) {
        this.initAudio();
      }
      if (this.isTimerPlaying) {
        this.audio.pause();
        this.isTimerPlaying = false;
      } else {
        this.audio.play();
        this.isTimerPlaying = true;
      }
    },
    prevTrack: function () {
      this.transitionName = 'scale-in';
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.initAudio();
      if (this.isTimerPlaying) {
        this.audio.play();
      }
    },
    nextTrack: function () {
      this.transitionName = 'scale-out';
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      this.initAudio();
      if (this.isTimerPlaying) {
        this.audio.play();
      }
    },
    favorite: function () {
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[this.currentTrackIndex].favorited;
    },
    clickProgress: function (e) {
      if (!this.audio) return;
      var progressBar = this.$refs.progress.querySelector('.progress__bar');
      var rect = progressBar.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      this.audio.currentTime = ratio * this.audio.duration;
    }
  },
  mounted: function () {
    this.initAudio();
  }
});
