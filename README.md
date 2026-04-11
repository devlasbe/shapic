<h1>
  <img src="./resources/icon.png" width="28" alt="Shapic" />
  Shapic
</h1>

SNS 플랫폼에 최적화된 이미지 리사이즈 & 최적화 데스크톱 앱

![Shapic 스크린샷](./resources/screenshot.png)

## 주요 기능

- **SNS 프리셋** — Instagram, Facebook, X(Twitter), YouTube, TikTok, LinkedIn 등 33개 내장 프리셋
- **커스텀 프리셋** — 원하는 크기/포맷/품질로 직접 프리셋 생성
- **다양한 리사이즈 모드** — 프리셋 맞춤(Cover/Contain), 비율 유지, 긴쪽/짧은쪽/너비/높이 기준
- **EXIF 프레임** — 카메라·렌즈·촬영 정보를 미니멀 화이트 프레임으로 자동 삽입
- **일괄 처리** — 여러 이미지를 한 번에 변환, 실시간 진행률 표시
- **실시간 미리보기** — 설정 변경 시 결과물 즉시 확인, 압축률 표시
- **포맷 변환** — JPEG(mozjpeg) / WebP 출력, 품질 조절 가능
- **다양한 입력 포맷** — JPG, PNG, WebP, HEIF, HEIC, TIFF 지원

## 다운로드

> 첫 릴리즈 준비 중입니다.

| 플랫폼 | 다운로드 |
|--------|---------|
| macOS (Apple Silicon) | [Shapic-x.x.x-arm64.dmg](https://github.com/lasbe/shapic/releases/latest) |
| macOS (Intel) | [Shapic-x.x.x-x64.dmg](https://github.com/lasbe/shapic/releases/latest) |
| Windows | [Shapic-x.x.x-setup.exe](https://github.com/lasbe/shapic/releases/latest) |

## 사용법

### 1. 이미지 불러오기

앱 중앙 영역에 이미지를 드래그 앤 드롭하거나, 클릭하여 파일을 선택합니다.

### 2. 설정

우측 패널에서 리사이즈 옵션을 설정합니다.

1. **프리셋 선택** — SNS 플랫폼별 프리셋 또는 커스텀 프리셋
2. **리사이즈 모드** — 프리셋 맞춤(Cover/Contain), 비율 유지 등
3. **출력 포맷** — JPEG 또는 WebP, 품질 슬라이더로 조절
4. **EXIF 프레임** — 촬영 정보가 있는 이미지에 자동 프레임 적용
5. **출력 폴더** — 변환된 이미지가 저장될 위치 선택

### 3. 변환

- **단일 변환** — 선택한 이미지 1장만 변환
- **일괄 변환** — 불러온 모든 이미지를 한 번에 변환

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Electron 41 |
| 프론트엔드 | React 19, TypeScript |
| 스타일링 | Tailwind CSS 4 |
| 상태 관리 | Zustand |
| 이미지 처리 | Sharp |
| EXIF 파싱 | exif-reader |
| 빌드 | Electron Vite, Electron Builder |
| 패키지 매니저 | pnpm |

## 로컬 실행

### 요구 사항

- Node.js 22+
- pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/lasbe/shapic.git
cd shapic

# 의존성 설치
pnpm install

# 개발 모드 실행
pnpm dev
```

### 빌드 & 패키징

```bash
# 프로덕션 빌드
pnpm build

# 앱 패키징 (dmg / exe)
pnpm package
```

## 프로젝트 구조

```
src/
├── main/               # Electron 메인 프로세스
│   ├── ipc/            # IPC 핸들러 (이미지, 프리셋, 다이얼로그)
│   └── services/       # 이미지 처리, EXIF 파싱, 프레임 렌더링
├── preload/            # Preload 스크립트 (API 브릿지)
├── renderer/           # React 프론트엔드
│   └── src/
│       ├── components/ # UI 컴포넌트 (레이아웃, 설정, 프리뷰 등)
│       ├── hooks/      # 커스텀 훅
│       ├── presets/    # 기본 프리셋 정의
│       ├── stores/     # Zustand 상태 관리
│       ├── types/      # 타입 정의
│       └── utils/      # 유틸리티
└── shared/             # 메인/렌더러 공유 모듈 (타입, 상수, 프리셋)
```

## 라이선스

이 프로젝트는 [GPL-3.0 라이선스](./LICENSE)로 배포됩니다.
