# LinguaAtlas Mobile

Ứng dụng di động chính thức của LinguaAtlas, xây dựng bằng **Expo SDK 53 + React Native + Expo Router v5 + NativeWind v4 (Tailwind CSS)**.

## Tính năng

### Học viên (student)
- **Dashboard**: XP goal, streak, thống kê học tập, cân bằng 4 kỹ năng
- **Khoá học**: danh sách đã đăng ký + khám phá, đăng ký, lộ trình bài học
- **Học bài**: nội dung markdown, ảnh minh hoạ, badge kỹ năng, quiz inline tự chấm (≥60% tự hoàn thành)
- **Bài kiểm tra cuối khoá**: làm bài, kết quả pass/fail, giữ điểm cao nhất
- **Từ điển**: tra cứu real-time, xem nghĩa, phiên âm, ví dụ, lưu từ
- **Từ vựng**: sổ tay đã lưu với mastery bar, lọc cần ôn
- **Flashcards**: ôn tập giãn cách (Again/Hard/Good/Easy), lật thẻ
- **Cá nhân**: đổi ngôn ngữ học, dark mode, chuyển workspace theo vai trò

### Giảng viên (instructor)
- Tổng quan studio: số liệu khoá học, học viên, tiến độ
- Quản lý khoá học: tạo mới, gửi duyệt / rút về nháp, xem ghi chú từ chối của admin
- **Course Studio**: kỹ năng đào tạo (6 loại), CRUD bài giảng (ảnh, video, skill, markdown), ngân hàng câu hỏi quiz cho từng bài, tạo đề thi cuối khoá
### Admin
- Tổng quan hệ thống: người dùng, khoá học, hoạt động, đăng ký mới
- **Duyệt khoá học**: hàng chờ pending, duyệt xuất bản / từ chối kèm ghi chú bắt buộc
- Quản lý người dùng: tìm kiếm, lọc role, đổi vai trò, xoá
- Quản lý ngôn ngữ: bật/tắt, thống kê

## Kiến trúc

```
mobile/
├── app/                    # Expo Router — file-based routes
│   ├── _layout.tsx         # Root: providers (Query, Auth, SafeArea)
│   ├── login.tsx|register.tsx
│   ├── (student)/          # 5 tabs: dashboard, courses, dictionary, vocabulary, profile
│   │   ├── course-[slug] / lesson-[id] / exam-[id] / flashcards
│   ├── (instructor)/       # 3 tabs + studio-[id]
│   └── (admin)/            # 4 tabs
├── src/
│   ├── lib/api.ts          # API client — full typed mirror của web
│   ├── lib/auth.tsx        # AuthProvider context
│   ├── lib/store.ts        # Zustand (language, theme)
│   └── components/         # UI primitives + QuizBlock, LessonContent, modals
├── tailwind.config.js      # NativeWind + design tokens (đồng bộ web)
└── global.css              # CSS variables light/dark giống web 1:1
```

## Auth trên mobile

Mobile không dùng được HttpOnly cookie nên:
1. Mọi request gửi header `X-Client-Type: mobile`
2. Login/register/refresh trả thêm `refresh_token` trong JSON body (chỉ khi header mobile có mặt)
3. Token lưu **expo-secure-store** (Keychain / Keystore)
4. Refresh rotation: gọi `POST /api/auth/refresh` với body `{"refresh_token": "..."}` — backend rotate và trả cặp token mới
5. Logout gửi refresh_token trong body để revoke cả family

## Chạy dự án

```bash
cd mobile
npm install

# Dev — cần backend chạy ở localhost:8080
EXPO_PUBLIC_BASE_URL=http://localhost:8080 npx expo start

# Android emulator (host machine = 10.0.2.2)
EXPO_PUBLIC_BASE_URL=http://10.0.2.2:8080 npx expo start --android

# Build production (EAS)
eas build --platform all
```

### Biến môi trường
| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `EXPO_PUBLIC_BASE_URL` | `http://localhost:8080` | Backend API URL |

> Android emulator không dùng được `localhost` (trỏ về chính emulator) — dùng `10.0.2.2`. Thiết bị thật cần IP LAN của máy (ví dụ `http://192.168.1.10:8080`).

## Kiểm thử đã thực hiện

- `tsc --noEmit`: 0 lỗi
- `expo export --platform android`: bundle thành công (Hermes bytecode)
- Backend: `go build` + `go vet` + `go test ./internal/auth/` PASS
- Smoke test API: mobile login/refresh/logout qua body, token reuse bị chặn, web cookie flow không đổi
