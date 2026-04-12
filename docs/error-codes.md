# 에러 코드 목록

Shapic의 모든 에러 코드와 메시지를 정리한 문서입니다.
에러 코드는 `src/shared/errors.ts`에서 관리됩니다.

## 코드 형식

`{도메인}_{대상}_{동사_과거형}` (예: `IMAGE_METADATA_READ_FAILED`)

## IMAGE 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `IMAGE_METADATA_READ_FAILED` | 이미지 메타데이터를 읽을 수 없습니다 | Sharp에서 이미지의 width/height를 읽지 못한 경우 |
| `IMAGE_PRESET_RESOLVE_FAILED` | 프리셋 맞춤 모드에는 프리셋이 필요합니다 | preset-fit 리사이즈 모드에서 프리셋 없이 호출 |
| `IMAGE_LOAD_FAILED` | 이미지를 불러올 수 없습니다 | 이미지 파일을 로드하는 과정에서 실패 |
| `IMAGE_PROCESS_FAILED` | 이미지 처리에 실패했습니다 | 배치 처리 중 예상치 못한 에러 |
| `IMAGE_PREVIEW_FAILED` | 미리보기 생성에 실패했습니다 | 미리보기 생성 중 실패 |
| `IMAGE_RESIZE_FAILED` | 이미지 리사이즈에 실패했습니다 | Sharp resize 단계 실패 |
| `IMAGE_ENCODE_FAILED` | 이미지 인코딩에 실패했습니다 | JPEG/WebP 인코딩 단계 실패 |
| `IMAGE_SAVE_FAILED` | 이미지 저장에 실패했습니다 | 출력 파일 쓰기 실패 |

## FRAME 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `FRAME_SIZE_READ_FAILED` | 프레임 적용을 위한 이미지 크기를 읽을 수 없습니다 | 프레임 합성 시 리사이즈된 이미지의 메타데이터를 읽지 못한 경우 |
| `FRAME_RENDER_FAILED` | 프레임 렌더링에 실패했습니다 | SVG→PNG 변환 또는 프레임 합성(extend/composite) 단계 실패 |

## EXIF 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `EXIF_PARSE_FAILED` | EXIF 데이터를 읽을 수 없습니다 | EXIF 파싱 실패 (경고 수준, 앱 동작에 영향 없음) |

## PRESET 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `PRESET_LOOKUP_FAILED` | 프리셋을 찾을 수 없습니다 | electron-store에서 해당 ID의 커스텀 프리셋을 찾지 못한 경우 |
| `PRESET_LIST_FAILED` | 프리셋 목록을 불러올 수 없습니다 | 커스텀 프리셋 목록 조회 실패 |
| `PRESET_SAVE_FAILED` | 프리셋 저장에 실패했습니다 | 커스텀 프리셋 저장 실패 |
| `PRESET_DELETE_FAILED` | 프리셋 삭제에 실패했습니다 | 커스텀 프리셋 삭제 실패 |

## DIALOG 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `DIALOG_OPEN_FILE_FAILED` | 파일 선택 대화상자를 열 수 없습니다 | OS 파일 선택 다이얼로그 호출 실패 |
| `DIALOG_OPEN_FOLDER_FAILED` | 폴더 선택 대화상자를 열 수 없습니다 | OS 폴더 선택 다이얼로그 호출 실패 |

## APP 도메인

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `APP_WINDOW_LOOKUP_FAILED` | 앱 창을 찾을 수 없습니다 | BrowserWindow.fromWebContents()가 null을 반환한 경우 |
| `APP_VERSION_FAILED` | 앱 버전 정보를 가져올 수 없습니다 | app.getVersion() 호출 실패 |
| `APP_UNKNOWN_ERROR` | 알 수 없는 오류가 발생했습니다 | 분류되지 않은 에러의 폴백 |

## 에러 추가 규칙

1. `src/shared/errors.ts`의 `ERROR_CODES`에 새 코드 추가
2. `ERROR_MESSAGES`에 한글 메시지 추가
3. 코드에서 `new AppError(ERROR_CODES.XXX)` 또는 `new AppError(ERROR_CODES.XXX, context)`로 사용
4. 이 문서(`docs/error-codes.md`)에 행 추가
