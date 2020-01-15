import * as firebase from 'firebase/app';
import 'firebase/auth';

const authorize = {
  signInBtn: document.querySelector('.header--sign_in'),
  userBox: document.querySelector('.header--user_box'),
  avatar: document.querySelector('.user_box--avatar'),
  name: document.querySelector('.user_box--name'),
  provider: null,

  firebaseConfig: {
    apiKey: 'AIzaSyBfJeV-yRdzp5CY7MLDK76QqpclWGTw7-k',
    authDomain: 'piskel-clone-4c2d5.firebaseapp.com',
    databaseURL: 'https://piskel-clone-4c2d5.firebaseio.com',
    projectId: 'piskel-clone-4c2d5',
    storageBucket: 'piskel-clone-4c2d5.appspot.com',
    messagingSenderId: '14734687056',
    appId: '1:14734687056:web:82ae04ba0c6284cdbc8a55',
    measurementId: 'G-W0M0HD2LRL',
  },

  initFirebase() {
    authorize.provider = new firebase.auth.GoogleAuthProvider();
    firebase.initializeApp(authorize.firebaseConfig);

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        user.providerData.forEach((profile) => {
          authorize.toggleLoginButtons();
          authorize.name.innerText = `${profile.displayName}`;
          authorize.avatar.style.backgroundImage = `url(${profile.photoURL})`;
        });
      }
    });
  },

  signIn() {
    firebase
      .auth()
      .signInWithPopup(authorize.provider)
      .then()
      .catch((error) => new Error(error));
  },

  signOut() {
    firebase
      .auth()
      .signOut()
      .then()
      .catch((error) => new Error(error));

    authorize.toggleLoginButtons();
  },

  addButtonsListeners() {
    document.querySelector('.header').addEventListener('click', ({ target }) => {
      if (target === authorize.signInBtn) {
        authorize.signIn();
      }

      if (target.closest('.user_box--sign_out')) {
        authorize.signOut();
      }
    });
  },

  toggleLoginButtons() {
    authorize.userBox.classList.toggle('header--user_box-hidden');
    authorize.signInBtn.classList.toggle('header--sign_in-hidden');
  },

  init() {
    authorize.initFirebase();
    authorize.addButtonsListeners();
  },
};

export default authorize;
