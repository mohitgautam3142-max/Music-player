var app = new Vue({
  el: '#app',
  data: {
    tracks: [],
    currentTrackIndex: 0,
    isTimerPlaying: false,
    duration: '0:00',
    currentTime: '0:00',
    barWidth: '0%',
    transitionName: 'scale-out',
    audio: null,
    loading: true,
    error: null
  },
  computed: {
    currentTrack: function () {
      return this.tracks[this.currentTrackIndex] || null;
    }
  },
  methods: {
    fetchSongs: function () {
      var self = this;
      self.loading = true;
      self.error = null;

      fetch('https://saavn.dev/api/search/songs?query=arijit+singh&limit=10')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var results = data.data && data.data.results ? data.data.results : [];
          var parsed = [];

          results.forEach(function (song) {
            var audioUrl = '';
            if (song.downloadUrl && song.downloadUrl.length > 0) {
              var best = song.downloadUrl[song.downloadUrl.length - 1];
              audioUrl = best.url;
            }

            var coverUrl = '';
            if (song.image && song.image.length > 0) {
              var bestImg = song.image[song.image.length - 1];
              coverUrl = bestImg.url;
            }

            if (audioUrl) {
              parsed.push({
                name: song.name || 'Unknown',
                artist: song.artists && song.artists.primary && song.artists.primary.length > 0
                  ? song.artists.primary.map(function (a) { return a.name; }).join(', ')
                  : 'Arijit Singh',
                cover: coverUrl || 'https://picsum.photos/seed/arijit/300/300',
                url: audioUrl,
                favorited: false
              });
            }
          });

          if (parsed.length === 0) {
            self.error = 'No songs found. Try again.';
          } else {
            self.tracks = parsed;
            self.initAudio();
          }
          self.loading = false;
        })
        .catch(function (err) {
          self.error = 'Failed to load songs. Check your internet connection.';
          self.loading = false;
          console.error(err);
        });
    },

    initAudio: function () {
      if (!this.currentTrack) return;
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
      if (!this.audio || !this.currentTrack) return;
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
      var wasPlaying = this.isTimerPlaying;
      this.isTimerPlaying = false;
      this.initAudio();
      if (wasPlaying) {
        this.audio.play();
        this.isTimerPlaying = true;
      }
    },

    nextTrack: function () {
      this.transitionName = 'scale-out';
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      var wasPlaying = this.isTimerPlaying;
      this.isTimerPlaying = false;
      this.initAudio();
      if (wasPlaying) {
        this.audio.play();
        this.isTimerPlaying = true;
      }
    },

    favorite: function () {
      if (!this.currentTrack) return;
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[this.currentTrackIndex].favorited;
    },

    clickProgress: function (e) {
      if (!this.audio || !this.currentTrack) return;
      var progressBar = this.$refs.progress.querySelector('.progress__bar');
      var rect = progressBar.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      this.audio.currentTime = ratio * this.audio.duration;
    }
  },

  mounted: function () {
    this.fetchSongs();
  }
});
