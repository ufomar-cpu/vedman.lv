import { auth, db, storage } from "../firebase/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

onAuthStateChanged(auth, user => { if (!user) location.href = 'login.html'; });
document.getElementById('logoutBtn').addEventListener('click', async () => { await signOut(auth); location.href = 'login.html'; });

document.getElementById('objectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const files = [...document.getElementById('images').files];
  const imageUrls = [];
  for (const file of files) {
    const imageRef = ref(storage, `objects/${Date.now()}-${file.name}`);
    await uploadBytes(imageRef, file);
    imageUrls.push(await getDownloadURL(imageRef));
  }
  await addDoc(collection(db, 'objects'), {
    title: title.value,
    category: category.value,
    city: city.value,
    description: description.value,
    images: imageUrls,
    created: Date.now()
  });
  alert('Objekts saglabāts');
  e.target.reset();
});
