import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBCrJtROGq2jaHlBJz5lbfMckBX1x9N-DU',
  authDomain: 'listacompras-cb9c2.firebaseapp.com',
  projectId: 'listacompras-cb9c2',
  storageBucket: 'listacompras-cb9c2.firebasestorage.app',
  messagingSenderId: '513870335959',
  appId: '1:513870335959:web:555e8fb05593d8a5d34592'
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
