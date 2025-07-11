// 1. 필요한 도구(node-fetch)를 신형 방식(import)으로 불러옵니다.
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 2. 웹사이트에서 보낸 UID와 쿠폰 코드를 받습니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'POST 요청만 가능합니다.' });
  }

  const { uid, coupon } = req.body;

  if (!uid || !coupon) {
    return res.status(400).json({ message: 'UID와 쿠폰 코드가 필요합니다.' });
  }

  try {
    // 3. 넷마블 쿠폰 등록 서버에 대신 요청을 보냅니다.
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

    // 4. 넷마블 서버의 응답을 그대로 받아옵니다.
    const result = await netmarbleResponse.json();

    // 5. 결과를 원래 웹사이트에 전달합니다.
    res.status(netmarbleResponse.status).json(result);

  } catch (error) {
    // 6. 중간에 문제가 생기면 오류를 반환합니다.
    console.error('넷마블 서버 통신 중 오류:', error); // 디버깅을 위해 에러 로그 추가
    res.status(500).json({ message: '서버 통신 중 오류 발생', error: error.message });
  }
}