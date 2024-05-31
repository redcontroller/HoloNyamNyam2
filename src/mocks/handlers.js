// msw가 사용되는 사례
// - API 아직 안나옴, 원하는 형태의 데이터가 아님, 에러를 발생시키고 싶을 때
// - ex) 상품명이 10자 이상인 경우 테스트, 판매중단된 상품 또는 성인 상품 목록, 500 에러 발생 시 화면 확인
import { http, HttpResponse } from 'msw';
import { BASE_URL } from '../api/baseUrl';

export const handlers = [
  // http.post(`${BASE_URL}/user/login`, async ({ request }) => {
  //   const info = await request.formData();
  //   window.console.log('Logging in as "%s"', info.get('username'));
  // }),

  http.get(`${BASE_URL}/user/login`, () => {
    // HttpResponse.json({ id: 'abc-123' }),
    window.console.log('Captured a "GET /posts" request');
  }),
];

// export const login = async ({ email, password }) => {
//   try {
//     const res = await axios.post(
//       `${BASE_URL}/user/login`,
//       {
//         user: {
//           email: email,
//           password: password,
//         },
//       },
//       {
//         headers: {
//           'Content-type': 'application/json',
//         },
//       },
//     );
//     return res;
//   } catch (err) {
//     console.error('API 응답에 실패하였습니다.', err);
//   }
// };
