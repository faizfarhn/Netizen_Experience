<template>
  <q-page class="flex flex-center bg-gradient">



    <div v-if="loading" class="loading-container">
      <q-spinner-hearts color="pink" size="4em" />
      <div class="loading-text">Loading adorable cats... 🐾</div>
    </div>

    <div v-else-if="currentIndex < cats.length" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">{{ currentIndex }} / {{ cats.length }}</div>
    </div>


    <div v-if="!loading && currentIndex < cats.length" class="card-container">
      <div class="card-stack">
        <transition-group name="card" tag="div">
          <div
            v-for="(cat, index) in visibleCats"
            :key="`cat-${currentIndex + index}`"
            class="cat-card"
            :class="{ 'dragging': dragState.isDragging && index === 0 }"
            :style="cardStyle(index)"
            @mousedown="startDrag($event, index)"
            @touchstart="startDrag($event, index)"
            @mousemove="onDrag($event, index)"
            @touchmove="onDrag($event, index)"
            @mouseup="endDrag($event, index)"
            @touchend="endDrag($event, index)"
            @mouseleave="endDrag($event, index)"
          >
            <div class="card-content">
              <q-img
                :src="cat"
                :ratio="4/5"
                spinner-color="pink"
                class="cat-image"
                @error="handleImageError"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-pink text-white">
                    😿 Shy Cat
                  </div>
                </template>
              </q-img>


              <div
                class="swipe-indicator"
                :class="swipeIndicatorClass"
                :style="{ opacity: swipeIndicatorOpacity }"
              >
                {{ swipeIndicatorText }}
              </div>
            </div>

            <div class="card-actions">
              <q-btn
                round
                size="lg"
                class="action-btn dislike-btn"
                @click="swipeCard('left')"
                :disabled="dragState.isDragging"
              >
                <div class="btn-content">
                  <div class="btn-icon">❌</div>
                  <div class="btn-label">Nope</div>
                </div>
              </q-btn>

              <q-btn
                round
                size="lg"
                class="action-btn like-btn"
                @click="swipeCard('right')"
                :disabled="dragState.isDragging"
              >
                <div class="btn-content">
                  <div class="btn-icon">💖</div>
                  <div class="btn-label">Love</div>
                </div>
              </q-btn>
            </div>
          </div>
        </transition-group>
      </div>
    </div>


    <div v-else-if="!loading" class="summary-container">
      <div class="summary-content">
        <div class="summary-title">🎉 Purrfect Results! 🎉</div>

        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-number">{{ likedCats.length }}</div>
            <div class="stat-label">Cats Loved</div>
          </div>
          <div class="stat-divider">of</div>
          <div class="stat-item">
            <div class="stat-number">{{ cats.length }}</div>
            <div class="stat-label">Total Cats</div>
          </div>
        </div>

        <div class="percentage-text">
          {{ Math.round((likedCats.length / cats.length) * 100) }}% Love Rate! 😸
        </div>

        <div v-if="likedCats.length > 0" class="liked-cats-grid">
          <div class="grid-title">Your Favorite Cats 💕</div>
          <div class="cats-grid">
            <div
              v-for="(cat, i) in likedCats"
              :key="'liked-' + i"
              class="liked-cat-item"
              @click="showCatDetail(cat)"
            >
              <q-img
                :src="cat"
                class="liked-cat-img"
                :ratio="1"
              />
            </div>
          </div>
        </div>

        <div v-else class="no-likes">
          <div class="no-likes-text">😿 No cats stole your heart this time!</div>
          <div class="no-likes-subtext">Maybe you're just hard to please? 😉</div>
        </div>

        <q-btn
          color="primary"
          size="lg"
          rounded
          class="reset-btn"
          @click="resetApp"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          Find More Cats!
        </q-btn>
      </div>
    </div>


    <div class="floating-hearts-container">
      <transition-group name="heart" tag="div">
        <div
          v-for="heart in floatingHearts"
          :key="heart.id"
          class="floating-heart"
          :style="{ left: heart.x + 'px', top: heart.y + 'px' }"
        >
          {{ heart.emoji }}
        </div>
      </transition-group>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CatSlide',
  data() {
    return {
      cats: [],
      likedCats: [],
      currentIndex: 0,
      loading: true,
      dragState: {
        isDragging: false,
        startX: 0,
        currentX: 0,
        startY: 0,
        currentY: 0
      },
      floatingHearts: [],
      heartId: 0
    }
  },
  computed: {
    visibleCats() {
      return this.cats.slice(this.currentIndex, this.currentIndex + 2)
    },
    progressPercentage() {
      return this.cats.length > 0 ? (this.currentIndex / this.cats.length) * 100 : 0
    },
    swipeIndicatorOpacity() {
      if (!this.dragState.isDragging) return 0
      const deltaX = this.dragState.currentX - this.dragState.startX
      return Math.min(Math.abs(deltaX) / 100, 1)
    },
    swipeIndicatorClass() {
      const deltaX = this.dragState.currentX - this.dragState.startX
      return {
        'like-indicator': deltaX > 50,
        'dislike-indicator': deltaX < -50
      }
    },
    swipeIndicatorText() {
      const deltaX = this.dragState.currentX - this.dragState.startX
      if (deltaX > 50) return 'LOVE! 💕'
      if (deltaX < -50) return 'NOPE 💔'
      return ''
    }
  },
  async mounted() {
    await this.loadCats()
  },
  methods: {
    async loadCats() {
      this.loading = true

      try {
        const promises = Array(10).fill().map(async () => {
          const response = await axios.get('https://cataas.com/cat?json=true')
          let url = response.data.url
          if (!url.startsWith('http')) {
            url = `https://cataas.com${url}`
          }
          return url
        })

        this.cats = await Promise.all(promises)
      } catch (error) {
        console.error('Error fetching cats:', error)
        console.error('Error fetching cats:', error)

        alert('😿 Cats are being shy! Try refreshing the page.')
      } finally {
        this.loading = false
      }
    },

    swipeCard(direction) {
      if (this.currentIndex >= this.cats.length) return

      if (direction === 'right') {
        this.likedCats.push(this.cats[this.currentIndex])
        this.createFloatingHearts()
        this.playLikeAnimation()
      } else {
        this.playDislikeAnimation()
      }

      this.currentIndex++
      this.resetDragState()
    },

    startDrag(event, index) {
      if (index !== 0) return

      event.preventDefault()
      this.dragState.isDragging = true

      const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
      const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY

      this.dragState.startX = clientX
      this.dragState.currentX = clientX
      this.dragState.startY = clientY
      this.dragState.currentY = clientY
    },

    onDrag(event, index) {
      if (!this.dragState.isDragging || index !== 0) return

      event.preventDefault()
      const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
      const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY

      this.dragState.currentX = clientX
      this.dragState.currentY = clientY
    },

    endDrag(event, index) {
      if (!this.dragState.isDragging || index !== 0) return

      const deltaX = this.dragState.currentX - this.dragState.startX

      if (deltaX > 100) {
        this.swipeCard('right')
      } else if (deltaX < -100) {
        this.swipeCard('left')
      } else {
        this.resetDragState()
      }
    },

    resetDragState() {
      this.dragState.isDragging = false
      this.dragState.startX = 0
      this.dragState.currentX = 0
      this.dragState.startY = 0
      this.dragState.currentY = 0
    },

    cardStyle(index) {
      const baseStyle = {
        zIndex: 10 - index,
        position: 'absolute',
        top: 0,
        left: 0
      }

      if (index === 0 && this.dragState.isDragging) {
        const deltaX = this.dragState.currentX - this.dragState.startX
        const deltaY = this.dragState.currentY - this.dragState.startY
        const rotation = deltaX * 0.1

        return {
          ...baseStyle,
          transform: `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`,
          transition: 'none',
          zIndex: 20
        }
      } else if (index === 0) {

        return {
          ...baseStyle,
          transform: 'translateX(0px) translateY(0px) scale(1)',
          zIndex: 10
        }
      } else if (index === 1) {

        return {
          ...baseStyle,
          transform: 'translateX(0px) translateY(10px) scale(0.95)',
          zIndex: 5,
          opacity: 0.8
        }
      }
      return baseStyle
    },

    createFloatingHearts() {
      const hearts = ['💖', '💕', '💗', '💘', '💝']

      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const heart = {
            id: this.heartId++,
            emoji: hearts[Math.floor(Math.random() * hearts.length)],
            x: Math.random() * (window.innerWidth - 50),
            y: window.innerHeight - 100
          }

          this.floatingHearts.push(heart)

          setTimeout(() => {
            const index = this.floatingHearts.findIndex(h => h.id === heart.id)
            if (index > -1) {
              this.floatingHearts.splice(index, 1)
            }
          }, 2000)
        }, i * 100)
      }
    },

    playLikeAnimation() {

      const feedback = document.createElement('div')
      feedback.innerHTML = '💖 Aww!'
      feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 107, 157, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 10000;
        pointer-events: none;
        animation: fadeInOut 1.5s ease-out forwards;
      `


      if (!document.getElementById('feedback-styles')) {
        const style = document.createElement('style')
        style.id = 'feedback-styles'
        style.textContent = `
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
          }
        `
        document.head.appendChild(style)
      }

      document.body.appendChild(feedback)
      setTimeout(() => document.body.removeChild(feedback), 1500)
    },

    playDislikeAnimation() {
      // Create a simple visual feedback without requiring Notify plugin
      const feedback = document.createElement('div')
      feedback.innerHTML = '🥲 Not your type?'
      feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 10000;
        pointer-events: none;
        animation: fadeInOut 1.5s ease-out forwards;
      `

      document.body.appendChild(feedback)
      setTimeout(() => document.body.removeChild(feedback), 1500)
    },

    showCatDetail(catUrl) {
      this.$q.dialog({
        title: 'Your Favorite Cat! 😻',
        message: `<div style="text-align: center; margin: 20px 0;"><img src="${catUrl}" style="max-width: 200px; border-radius: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"><br><br>This little furry friend stole your heart!</div>`,
        html: true,
        ok: 'Close'
      }).onOk(() => {

      })
    },

    handleImageError() {
      console.log('Image failed to load')
    },

    resetApp() {
      this.currentIndex = 0
      this.likedCats = []
      this.floatingHearts = []
      this.resetDragState()
      this.loadCats()
    }
  }
}
</script>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.app-title {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 100;
  animation: bounce 2s infinite;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-10px); }
  60% { transform: translateX(-50%) translateY(-5px); }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: white;
}

.loading-text {
  font-size: 1.3rem;
  font-weight: 500;
}

.progress-container {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  z-index: 99;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d, #4ecdc4);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
}

.card-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
}

.card-stack {
  position: relative;
  width: 320px;
  height: 500px;
  perspective: 1000px;
}

.cat-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 25px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  cursor: grab;
  user-select: none;
  transition: transform 0.3s ease, opacity 0.3s ease;

  &.dragging {
    cursor: grabbing;
    transition: none;
  }
}

.card-content {
  position: relative;
  height: 400px;
}

.cat-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  pointer-events: none;
  z-index: 10;

  &.like-indicator {
    color: #4ecdc4;
    background: rgba(78, 205, 196, 0.2);
  }

  &.dislike-indicator {
    color: #ff6b9d;
    background: rgba(255, 107, 157, 0.2);
  }
}

.card-actions {
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  height: 100px;
}

.action-btn {
  width: 70px !important;
  height: 70px !important;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;

  &.dislike-btn {
    background: linear-gradient(135deg, #ff6b9d, #ff8a80) !important;
    color: white !important;
  }

  &.like-btn {
    background: linear-gradient(135deg, #4ecdc4, #44a08d) !important;
    color: white !important;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3) !important;
  }

  &:active {
    transform: scale(0.95);
  }
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.btn-icon {
  font-size: 1.5rem;
}

.btn-label {
  font-size: 0.8rem;
  font-weight: 500;
}

.summary-container {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  color: white;
  text-align: center;
  animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 30px;
}

.summary-title {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #ff6b9d;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.summary-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #4ecdc4;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
}

.stat-divider {
  font-size: 1.5rem;
  opacity: 0.6;
}

.percentage-text {
  font-size: 1.3rem;
  margin-bottom: 30px;
  color: #ffc371;
}

.liked-cats-grid {
  margin-bottom: 30px;
}

.grid-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #ff6b9d;
}

.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding: 10px;
  border-radius: 15px;
  background: rgba(255,255,255,0.05);
}

.liked-cat-item {
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.liked-cat-img {
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.no-likes {
  margin-bottom: 30px;
}

.no-likes-text {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.no-likes-subtext {
  font-size: 1rem;
  opacity: 0.7;
}

.reset-btn {
  font-size: 1.1rem !important;
  padding: 12px 30px !important;
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3) !important;
  }
}

.floating-hearts-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.floating-heart {
  position: absolute;
  font-size: 2rem;
  z-index: 1001;
}

.heart-enter-active {
  transition: all 2s ease-out;
}

.heart-enter-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.heart-enter-to {
  opacity: 0;
  transform: translateY(-200px) scale(1.5);
}

.card-enter-active,
.card-leave-active {
  transition: all 0.5s ease;
}

.card-leave-to {
  opacity: 0;
  transform: translateX(-150%) rotate(-15deg);
}

// Mobile responsiveness
@media (max-width: 480px) {
  .app-title {
    font-size: 2rem;
    top: 20px;
  }

  .progress-container {
    top: 80px;
    width: 280px;
  }

  .card-stack {
    width: 280px;
    height: 450px;
  }

  .summary-container {
    padding: 10px;
  }

  .summary-content {
    padding: 20px;
  }
}
</style>
