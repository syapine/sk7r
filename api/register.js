import fetch from 'node-fetch';

export default async function handler(req, res) {
   if (req.method !== 'POST') {
    return res.status(405).json({ message: 'POST 요청만 가능합니다.' });
  }

  const { uid, coupon } = req.body;

  if (!uid || !coupon) {
    return res.status(400).json({ message: 'UID와 쿠폰 코드가 필요합니다.' });
  }

  try {
        const netmarbleResponse = await fetch('https://coupon.netmarble.com/api/v1/coupon/use', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_code: 'tskgb', // 세븐나이츠 리버스 게임 코드 (예시)
        coupon_code: coupon,
        user_id: uid,
      }),
    });

        const result = await netmarbleResponse.json();

    
    res.status(netmarbleResponse.status).json(result);

  } catch (error) {
   
    console.error('넷마블 서버 통신 중 오류:', error); // 디버깅을 위해 에러 로그 추가
    res.status(500).json({ message: '서버 통신 중 오류 발생', error: error.message });
  }
}