<h1>
  <img src="./resources/icon.png" width="28" alt="Shapic" />
  Shapic
</h1>

SNS 플랫폼에 최적화된 이미지 리사이즈 & 최적화 데스크톱 앱

## 왜 만들었나

고화소 사진을 Instagram 등 SNS에 그대로 올리면 플랫폼의 자동 압축과 리사이즈로 화질이 뭉개집니다. 업로드 전에 플랫폼 규격에 맞게 직접 리사이즈하면 화질 저하를 최소화할 수 있지만, 이를 위해 매번 Photoshop 같은 무거운 도구를 실행하는 건 비효율적입니다. Shapic은 드래그 앤 드롭만으로 SNS 최적화 리사이즈를 완료할 수 있도록 설계된 경량 데스크톱 앱입니다.

![Shapic 스크린샷](https://github.com/user-attachments/assets/d5e47772-d508-4124-a7f9-35af62e4e046)

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

| 플랫폼                | 다운로드                                                       |
| --------------------- | -------------------------------------------------------------- |
| macOS (Apple Silicon) | [다운로드](https://github.com/devlasbe/shapic/releases/latest) |
| macOS (Intel)         | [다운로드](https://github.com/devlasbe/shapic/releases/latest) |
| Windows               | [다운로드](https://github.com/devlasbe/shapic/releases/latest) |

## macOS 설치 안내

현재 Shapic은 Apple 공증을 받지 않은 상태이므로, 처음 실행 시 보안 경고가 표시됩니다.

1. 다운로드한 `.dmg` 파일을 열고 Shapic을 Applications 폴더로 드래그
2. Shapic을 실행하면 **"확인할 수 없는 개발자"** 경고가 표시됨
3. **시스템 설정 → 개인정보 보호 및 보안** 으로 이동
4. 하단의 **"그래도 열기"** 버튼 클릭
5. 이후부터는 정상적으로 실행됩니다

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

| 분류          | 기술                            |
| ------------- | ------------------------------- |
| 프레임워크    | Electron 41                     |
| 프론트엔드    | React 19, TypeScript            |
| 스타일링      | Tailwind CSS 4                  |
| 상태 관리     | Zustand                         |
| 이미지 처리   | Sharp                           |
| EXIF 파싱     | exif-reader                     |
| 빌드          | Electron Vite, Electron Builder |
| 패키지 매니저 | pnpm                            |

## 로컬 실행

### 요구 사항

- Node.js 22+
- pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/devlasbe/shapic.git
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
