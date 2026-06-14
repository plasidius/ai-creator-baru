import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey:   "AIzaSyBvYXgVj9ByCqnSQlWrnlOhcQQswmJQSiY",

  authDomain: "ai-creator.firebaseapp.com",

  projectId: "ai-creator",

  storageBucket: "ai-creator.appspot.com",

  messagingSenderId: "123456",

  appId: "1:123456:web:xxxx"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);