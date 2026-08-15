import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, serverTimestamp } from 'firebase/firestore';

/* ═══════════════════════════════════════════════════════════
   Firebase Config — غيّر البيانات دي بالبيانات بتاعتك
   من Firebase Console → Project Settings → General → Your apps
   ═══════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyD placeholder - غيّرني",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase init failed:', e.message);
}

/* ═══════════════════════════════════════════════════════════
   إضافة مطعم جديد
   ═══════════════════════════════════════════════════════════ */
export async function addRestaurant(data) {
  if (!db) throw new Error('Firebase not connected');
  const docRef = await addDoc(collection(db, 'restaurants'), {
    name: data.name || '',
    address: data.address || '',
    owner: data.owner || '',
    phone: data.phone || '',
    cuisine: data.cuisine || '',
    notes: data.notes || '',
    imagePlace: data.imagePlace || null,
    imageMenu: data.imageMenu || null,
    lat: data.lat || null,
    lng: data.lng || null,
    status: 'pending',
    rating: 0,
    verified: false,
    addedAt: serverTimestamp(),
  });
  return docRef.id;
}

/* ═══════════════════════════════════════════════════════════
   جلب المطاعم المُصدّقة
   ═══════════════════════════════════════════════════════════ */
export async function getApprovedRestaurants() {
  if (!db) return [];
  const q = query(
    collection(db, 'restaurants'),
    where('status', '==', 'approved'),
    orderBy('addedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* ═══════════════════════════════════════════════════════════
   جلب كل المطاعم (للأدمن)
   ═══════════════════════════════════════════════════════════ */
export async function getAllRestaurants() {
  if (!db) return [];
  const q = query(collection(db, 'restaurants'), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { db };
