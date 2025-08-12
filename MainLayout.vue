<template>
  <q-layout view="lHh Lpr lFf" class="shadow-2 rounded-borders">
    <q-header elevated class="cute-header">
      <q-toolbar class="header-toolbar">
        <q-avatar>
          <img src="data:image/png;base64,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">
        </q-avatar>

        <q-toolbar-title class="header-main-title">
          Paws & Preferences: Find Your Favourite Kitty
        </q-toolbar-title>

        <div class="cute-app-title">
          🐱 Cute Cat Swiper 💕
        </div>

        <q-btn flat round dense icon="whatshot" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <!-- Route's page will be loaded here -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.cute-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.header-toolbar {
  position: relative;
  align-items: center;
  justify-content: space-between;
}

.header-main-title {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-right: auto;
}

.cute-app-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-family: 'Comic Sans MS', cursive, sans-serif;
  animation: bounce 2s infinite;
  white-space: nowrap;
  z-index: 10;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  40% {
    transform: translate(-50%, -50%) translateY(-8px);
  }
  60% {
    transform: translate(-50%, -50%) translateY(-4px);
  }
}


@media (max-width: 768px) {
  .header-main-title {
    font-size: 0.8rem;
  }

  .cute-app-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .header-main-title {
    display: none;
  }

  .cute-app-title {
    font-size: 1.2rem;
    position: static;
    transform: none;
  }

  .header-toolbar {
    justify-content: space-around;
  }
}
</style>
