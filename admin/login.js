import { auth } from "../firebase/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');
  if (!email || !password) return alert('Ievadi e-pastu un paroli');
  btn.disabled = true; btn.textContent = 'Pieslēdzas...';
  try { await signInWithEmailAndPassword(auth, email, password); location.href = 'admin.html'; }
  catch (err) { console.error(err); alert('Nepareizi dati'); btn.disabled = false; btn.textContent = 'Pieslēgties'; }
});
