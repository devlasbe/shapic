---
name: shapic-image-pipeline
description: Use when modifying or debugging image conversion, resize, frame, or EXIF logic in the Shapic project - covers the full Sharp-based processing pipeline, format-specific encoding, frame geometry, and all conditional branches
---

# Shapic Image Pipeline Reference

## Overview

Sharp 기반 이미지 변환 파이프라인의 핵심 로직과 특수 분기 처리를 정리한 레퍼런스. 변환 관련 코드 수정/디버깅 시 참조.

**핵심 파일:**
- `src/main/services/image-processor.ts` — 변환 파이프라인 전체
- `src/main/services/frame-renderer.ts` — EXIF 프레임 렌더링/합성
- `src/main/services/exif-reader.ts` — EXIF 파싱 + 폴백 체인

## Pipeline Flow

```
loadImageMetadata (메타데이터 + EXIF 로드)
        ↓
resolveResizeOptions (리사이즈 모드 → width/height/options 결정)
        ↓
프레임 게이트 판정 (3조건 AND)
        ↓
aspect-ratio 프레임 높이 초과 보정 (해당 시)
        ↓
adjustForFrame (프레임 공간 차감)
        ↓
sharp pipeline: rotate() → resize() → [applyFrame()] → jpeg/webp encode → toFile
```

## Format Encoding Branch

`processImage()`와 `generatePreview()`에서 출력 포맷에 따라 인코딩 설정이 분기된다.

| 설정 | JPEG | WebP |
|------|------|------|
| 코덱 | `mozjpeg: true` | 기본 |
| 압축 노력 | — | `effort: 4` |
| 서브샘플링 | — | `smartSubsample: true` (프리뷰 제외) |
| 확장자 | `.jpg` | `.webp` |

**주의:** `generatePreview()`에서는 WebP에 `smartSubsample` 미적용 — 프리뷰 속도 최적화 목적.

## Resize Modes (6 Branches)

`resolveResizeOptions()` — `ResizeModeType`의 `kind`별 분기:

| kind | 동작 | fit | withoutEnlargement | 특수 처리 |
|------|------|-----|-------------------|-----------|
| `preset-fit` | 프리셋 width/height 사용 | cover/contain/fill/inside/outside | `false` | contain 시 흰색 배경 |
| `aspect-ratio` | 프리셋 긴 변 기준 비율 스케일 | inside | `false` | — |
| `long-side` | 긴 변을 pixels로 제한 | inside | `true` | — |
| `short-side` | 짧은 변을 pixels로 제한 | outside | `true` | — |
| `width` | 너비 고정, 높이 auto | inside | `true` | — |
| `height` | 높이 고정, 너비 auto | inside | `true` | — |

### contain 모드 투명도 처리

`preset-fit`에서 `fit === 'contain'`일 때만 흰색 배경(`r:255, g:255, b:255, alpha:1`) 추가. PNG 등 투명 이미지의 여백을 흰색으로 채우는 역할. 다른 fit 모드에서는 배경 불필요.

## Frame Application Gate (3-Condition AND)

프레임 적용 여부를 결정하는 3단계 게이트 (`processImage()`, `generatePreview()` 공통):

1. `frameStyle !== 'none'` — 프레임 스타일이 활성화되어 있는가
2. `readExif()` 결과가 null이 아닌가 — EXIF 데이터가 존재하는가
3. `hasExifForFrame()` — 표시할 카메라 정보(cameraBrand, cameraModel, lens, aperture, shutterSpeed, iso, focalLength 중 하나 이상)가 있는가

**3개 조건 모두 충족해야 프레임 적용.** 하나라도 불충족 시 프레임 없이 정상 처리 (에러 아님, silent skip).

## Aspect-Ratio + Frame Height Overflow Fix

`aspect-ratio` 모드에서 width 제약으로 리사이즈할 때, 프레임 수직 오버헤드(보더 + 프레임바)를 포함한 총 높이가 maxSide를 초과하면 **width 제약 → height 제약으로 자동 전환**한다.

- 조건: `willApplyFrame && resizeMode.kind === 'aspect-ratio' && width != null && height == null`
- 판정: 추정 이미지 높이 + 보더 2개 + 프레임 높이 > width이면 전환
- 동작: `height = width`, `width = null`로 스왑

`processImage()`와 `generatePreview()` 양쪽에 동일 로직 존재.

## Frame Dimension Adjustment (3 Branches)

`adjustForFrame()` — 프레임 공간을 목표 치수에서 차감. 치수 지정 방식에 따라 3분기:

### Branch 1: 양쪽 치수 지정 (preset-fit)
`calcFrameLayout()`으로 innerWidth, innerHeight, borderWidth 계산. 내부 치수 < 1이면 프레임 포기.

### Branch 2: 너비만 지정
수평 프레임 공간만 차감: `innerWidth = width - 2 * borderWidth`. 높이는 null (auto).

### Branch 3: 높이만 지정
`constrainFrameByHeight()` 호출 — 2-pass 추정 필요 (아래 참조).

## Two-Pass Frame Height Estimation

`constrainFrameByHeight()` — 높이만 지정 시 프레임 오버헤드를 정확히 계산하기 위한 2-pass 알고리즘.

**문제:** 프레임 보더/높이가 이미지 너비에 비례 → 너비를 모르면 프레임 크기를 모름 → 높이에서 얼마를 빼야 하는지 모름.

**해법:**
1. **1차 추정:** 목표 높이로부터 이미지 너비 추정 → 보더/프레임 높이 계산 → 내부 높이 산출
2. **2차 보정:** 1차 내부 높이로 다시 너비 계산 → 보더/프레임 재계산 → 최종 내부 높이

내부 높이 < 1이면 프레임 포기 (`frameBorderWidth = 0` 반환).

## Frame Rendering

`applyFrame()` — 리사이즈된 이미지에 EXIF 프레임을 합성:

1. SVG로 카메라 정보 텍스트 생성 (카메라 | 조리개 | 셔터 | ISO | 초점거리)
2. SVG → PNG 변환 (프레임 내부 합성은 항상 PNG)
3. `sharp.extend()`로 사방 흰색 보더 추가 (하단은 보더 + 프레임바 높이)
4. `sharp.composite()`로 프레임바 PNG를 하단에 합성 (`blend: 'over'`)

**프레임 치수 공식** (`calcFrameDimensions()`):
- 프레임 높이: `clamp(imageWidth * 0.05, 32, 200)`
- 폰트 크기: `clamp(frameHeight * 0.23, 8, 48)`
- 보더 너비: `max(8, imageWidth * 0.015)`

## EXIF Fallback Chains

`readExif()` — 필드별 폴백:

| 필드 | 1차 소스 | 폴백 | 변환 |
|------|---------|------|------|
| 조리개 | `FNumber` | `ApertureValue` | 폴백 시 `2^(value/2)` 변환 |
| 날짜 | `DateTimeOriginal` | `DateTime` | Date 객체 → ISO, string → 그대로 |
| ISO | `ISOSpeedRatings` | `PhotographicSensitivity` | — |
| 셔터속도 | `ExposureTime` | — | `≥1s` → `Ns`, `<1s` → `1/N` |

EXIF 파싱 실패 시 `null` 반환 (console.warn 로그만 남김).

## Output Filename Deduplication

`buildOutputPathMap()` — 배치 처리 시 출력 파일명 중복 방지:

- 패턴: `{basename}_shapic.{jpg|webp}`
- 기존 파일과 **case-insensitive** 비교
- 중복 시 `{basename}_shapic (n).{ext}` — n은 1부터 자동 증가
- 배치 내 동일 이름도 카운터(`nameCounters` Map)로 관리

## Batch Processing

`processBatch()` — 배치 이미지 변환:

- 동시 실행: `Math.min(4, os.cpus().length)` (세마포어 패턴)
- 개별 이미지 에러 시 해당 이미지만 실패 처리, 나머지 계속 진행
- IPC 진행률: `image:progress` (processing/success/error), `image:complete` (최종 결과)
