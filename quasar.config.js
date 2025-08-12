/* quasar.config.js */
import { configure } from 'quasar/wrappers'

export default configure(function (/* ctx */) {
  return {
    supportTS: false,

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    build: {
      vueRouterMode: 'hash', // important for GitHub Pages
      publicPath: '/Netizen_Experience/', // change this to match your repo name
      distDir: 'dist/spa'
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: []
    },

    animations: 'all',

    sourceFiles: {
      rootComponent: 'src/App.vue',
      router: 'src/router/index'
    }
  }
})
