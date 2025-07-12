import admin from 'firebase-admin';

// Firebase Admin SDK 초기화 (이하 동일)
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

export default async function handler(req, res) {
  // CORS 허용 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://ryapne.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ▼▼▼ 이 부분을 추가하면 좋습니다 ▼▼▼
  // 브라우저가 본 요청을 보내기 전에 보내는 '사전 요청(OPTIONS)'에 대한 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  try {
    // ## 바로 이 경로가 수정된 부분입니다. ##
    const couponsRef = db.collection('artifacts').doc('appid').collection('public').doc('data').collection('coupons');
    
    const snapshot = await couponsRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const couponList = [];
    snapshot.forEach(doc => {
      const couponData = doc.data();
      if (couponData && couponData.code) {
        couponList.push({
          name: couponData.code,
          code: couponData.code
        });
      }
    });

    res.status(200).json(couponList);

  } catch (error) {
    console.error('Firestore에서 데이터를 가져오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}