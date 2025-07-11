import admin from 'firebase-admin';

// Firebase Admin SDK 초기화 (기존과 동일)
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK 초기화 실패:', error);
}

const db = admin.firestore();

// 이 함수는 데이터베이스의 모든 최상위 컬렉션 목록을 가져옵니다.
export default async function handler(req, res) {
  try {
    console.log("최상위 컬렉션 목록을 가져옵니다...");
    
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);

    console.log("찾은 최상위 컬렉션:", collectionIds);

    res.status(200).json({ root_collections: collectionIds });

  } catch (error) {
    console.error('컬렉션 목록을 가져오는 중 오류 발생:', error);
    res.status(500).json({ message: '컬렉션 목록을 가져오는 데 실패했습니다.', error: error.message });
  }
}