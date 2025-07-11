// Firestore 데이터베이스에 접속하기 위한 라이브러리를 가져옵니다.
import admin from 'firebase-admin';

// Vercel 환경변수에 저장된 비밀 키를 이용해 Firebase에 접속합니다.
// 이 부분은 한 번만 실행되어야 합니다.
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK 초기화에 실패했습니다:', error);
}

// Firestore 데이터베이스에 대한 참조를 만듭니다.
const db = admin.firestore();

/**
 * /api/coupons 주소로 요청이 오면 이 함수가 실행됩니다.
 */
export default async function handler(req, res) {
  try {
    // 1. 우리가 정한 경로에서 쿠폰 컬렉션을 찾습니다.
    const couponsRef = db.collection('public').doc('data').collection('coupons');
    
    // 2. 해당 컬렉션의 모든 문서를 가져옵니다.
    const snapshot = await couponsRef.get();

    // 3. 문서가 하나도 없으면 빈 목록을 반환합니다.
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // 4. 가져온 문서들을 웹사이트가 원하는 형식으로 가공합니다.
    const couponList = [];
    snapshot.forEach(doc => {
      const couponData = doc.data();
      // 'code' 필드가 있는 데이터만 처리합니다.
      if (couponData && couponData.code) {
        couponList.push({
          // 데이터베이스에 name 필드가 따로 없으므로, code 값을 이름으로 함께 사용합니다.
          name: couponData.code,
          code: couponData.code
        });
      }
    });

    // 5. 최종 가공된 쿠폰 목록을 웹사이트에 전달합니다.
    res.status(200).json(couponList);

  } catch (error) {
    // 중간에 오류가 발생하면, 서버 로그에 기록하고 에러 메시지를 보냅니다.
    console.error('Firestore에서 데이터를 가져오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}