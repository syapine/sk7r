/**
 * 이 파일은 Firebase Cloud Functions에 배포될 백엔드 서버 코드입니다.
 * * 필요한 라이브러리:
 * - firebase-functions: Firebase Functions를 만들기 위한 기본 라이브러리
 * - cors: 다른 도메인(GitHub Pages)에서의 요청을 허용하기 위한 라이브러리 (CORS 처리)
 * - axios: 넷마블 서버에 HTTP 요청을 보내기 위한 라이브러리
 * * 배포 전 터미널에서 아래 명령어를 실행하여 라이브러리를 설치해야 합니다.
 * npm install firebase-functions cors axios
 */

const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// 넷마블 세븐나이츠 키우기 쿠폰 등록 API 엔드포인트
const NETMARBLE_COUPON_API_URL = "https://coupon.netmarble.com/api/coupon/tskgb/use";

exports.registerNetmarbleCoupon = functions
    .region("asia-northeast3") // 서울 리전에서 함수 실행
    .https.onRequest((req, res) => {
        // CORS preflight 요청을 처리합니다.
        cors(req, res, async () => {
            // POST 요청만 허용합니다.
            if (req.method !== "POST") {
                return res.status(405).json({ success: false, message: "POST 요청만 허용됩니다." });
            }

            const { uid, couponCode } = req.body;

            // 필수 파라미터가 있는지 확인합니다.
            if (!uid || !couponCode) {
                return res.status(400).json({ success: false, message: "UID와 쿠폰 코드가 필요합니다." });
            }

            try {
                // 넷마블 서버에 보낼 데이터 형식 (application/x-www-form-urlencoded)
                const params = new URLSearchParams();
                params.append('pid', uid);
                params.append('coupon', couponCode);

                // axios를 사용하여 넷마블 서버에 POST 요청을 보냅니다.
                const netmarbleResponse = await axios.post(NETMARBLE_COUPON_API_URL, params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Referer': 'https://coupon.netmarble.com/tskgb', // 실제 요청처럼 보이게 Referer 추가
                        'X-Requested-With': 'XMLHttpRequest' // AJAX 요청임을 명시
                    }
                });

                // 넷마블 서버의 응답을 클라이언트에게 그대로 전달합니다.
                // 넷마블 응답 형식 예시: { "result": "SUCCESS", "result_message": "쿠폰이 정상적으로 지급되었습니다." }
                // 성공 여부를 판단하여 클라이언트에 더 명확한 정보를 전달합니다.
                if (netmarbleResponse.data && netmarbleResponse.data.result === 'SUCCESS') {
                    res.status(200).json({ 
                        success: true, 
                        message: netmarbleResponse.data.result_message 
                    });
                } else {
                    res.status(400).json({ 
                        success: false, 
                        message: netmarbleResponse.data.result_message || "넷마블 서버에서 오류가 발생했습니다."
                    });
                }

            } catch (error) {
                console.error("넷마블 API 요청 중 오류 발생:", error.response ? error.response.data : error.message);
                res.status(500).json({ 
                    success: false, 
                    message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
                });
            }
        });
    });
