// Firestore 데이터베이스에 접속하기 위한 라이브러리를 가져옵니다.
import admin from 'firebase-admin';

// Vercel 환경변수에 저장된 비밀 키를 이용해 Firebase에 접속합니다.
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

const db = admin.firestore();

/**
 * /api/coupons 주소로 요청이 오면 이 함수가 실행됩니다.
 */
export default async function handler(req, res) {
  // ==================== 디버깅 로그 1 ====================
  console.log("'/api/coupons' 요청 시작됨.");

  try {
    const couponsRef = db.collection('public').doc('data').collection('coupons');
    
    // ==================== 디버깅 로그 2 ====================
    console.log("Firestore 경로 'public/data/coupons'에서 데이터 가져오기 시도.");

    const snapshot = await couponsRef.get();

    // ==================== 디버깅 로그 3 ====================
    // 데이터베이스에서 찾은 문서의 개수를 로그로 남깁니다.
    console.log(`총 ${snapshot.size}개의 쿠폰 문서를 찾았습니다.`);

    if (snapshot.empty) {
      console.log("찾은 문서가 없으므로, 빈 배열 []을 응답합니다.");
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

    // ==================== 디버깅 로그 4 ====================
    console.log(`최종적으로 ${couponList.length}개의 쿠폰을 배열에 담아 응답합니다.`);
    res.status(200).json(couponList);

  } catch (error) {
    // ==================== 디버깅 로그 5 ====================
    console.error('핸들러 함수 실행 중 심각한 오류 발생:', error);
    res.status(500).json({ message: '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}