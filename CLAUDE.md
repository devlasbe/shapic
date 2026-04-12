# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 개발 명령어

```bash
pnpm dev        # 개발 모드 실행 (Vite HMR + Electron)
pnpm build      # 프로덕션 빌드 (main/preload/renderer)
pnpm package    # 빌드 + 앱 패키징 (macOS dmg, Windows zip)
```

테스트 프레임워크, 린터, 포매터는 설정되어 있지 않음. TypeScript `strict: true`로 타입 안전성 확보.

## 환경 요구사항

- Node.js 22+, pnpm 필수
- `.npmrc`에서 `@img/*` hoist 설정 — Sharp 네이티브 모듈 링킹에 필요
- 의존성 설치: `pnpm install`

## 아키텍처

Electron 3프로세스 구조:

- **Main** (`src/main/`) — Node.js 런타임. 윈도우 관리, IPC 핸들러, Sharp 기반 이미지 처리
- **Preload** (`src/preload/`) — `contextBridge`로 `window.api` 노출. 렌더러의 Node.js 직접 접근 차단
- **Renderer** (`src/renderer/`) — React 19 + Tailwind CSS 4 UI. Zustand으로 전역 상태 관리

### 데이터 흐름

```
사용자 → 렌더러 UI → window.api (preload) → IPC invoke → Main 프로세스 → Sharp 처리
                                                                ↓
렌더러 UI ← Zustand 스토어 업데이트 ← IPC 이벤트 (progress/complete) ←┘
```

### IPC 채널 규칙

모든 IPC 채널은 `도메인:동작` 패턴: `image:load`, `image:process`, `image:preview`, `preset:list`, `preset:save`, `preset:delete`, `dialog:openFile`, `dialog:openFolder`. 새 IPC 추가 시 이 패턴을 따를 것.

핸들러는 `src/main/ipc/` 디렉토리에 도메인별 파일로 분리되어 있고, `index.ts`에서 일괄 등록.

### 이미지 처리 파이프라인

`src/main/services/`에 핵심 로직 집중:
- `image-processor.ts` — 리사이즈/인코딩 파이프라인, 배치 처리 (세마포어 기반 동시 실행)
- `frame-renderer.ts` — EXIF 정보 프레임 SVG 생성 및 합성
- `exif-reader.ts` — EXIF 파싱 + 필드별 폴백 체인

### 상태 관리

단일 Zustand 스토어 (`src/renderer/src/stores/app-store.ts`)로 앱 전체 상태 관리: 이미지 목록, 선택 상태, 처리 옵션, 진행률, 커스텀 프리셋.

## 핵심 타입 패턴

`ResizeModeType` (`src/shared/types.ts`)은 판별 유니온(discriminated union)으로 `kind` 필드 기반 6개 분기: `preset-fit`, `aspect-ratio`, `long-side`, `short-side`, `width`, `height`. 새 리사이즈 모드 추가 시 이 패턴을 따르고 `resolveResizeOptions()`에 분기 추가.

## 프로젝트 언어

UI 텍스트, 커밋 메시지, 문서 모두 한글로 작성.

## 스킬 라우팅

이미지 변환/리사이즈/프레임/EXIF 관련 작업 시 `shapic-image-pipeline` 스킬을 반드시 참조할 것. Sharp 파이프라인의 분기 로직, 프레임 치수 공식, EXIF 폴백 체인 등 코드만으로는 파악하기 어려운 설계 의도가 정리되어 있음.

## 크로스 플랫폼

macOS와 Windows 양쪽 모두 지원하는 앱이므로, 기능 추가/수정 시 반드시 두 플랫폼을 고려할 것. 파일 경로 구분자(`/` vs `\`), 네이티브 메뉴, 타이틀바, 다이얼로그 동작 등 OS별 차이에 주의.

## 에러 처리 규칙

모든 에러는 `src/shared/errors.ts`에서 코드-메시지 쌍으로 관리. 새 에러 추가 시 반드시 다음을 따를 것:

1. `ERROR_CODES`에 `{도메인}_{대상}_{동사_과거형}` 형식으로 코드 추가
2. `ERROR_MESSAGES`에 한글 메시지 추가
3. Main 프로세스에서는 `new AppError(ERROR_CODES.XXX, context?)` 사용
4. Renderer에서 IPC 호출 시 반드시 try-catch로 감싸고, 사용자 피드백이 필요한 경우 `showErrorToast(message)` 호출
5. `docs/error-codes.md`에 새 에러 코드 문서화

에러 메시지는 반드시 한글로 작성. 영어 에러 메시지 금지. 에러 코드 자체(상수명)만 영어.
