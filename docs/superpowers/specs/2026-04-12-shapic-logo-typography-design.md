# Shapic Left Sidebar Logo Typography Design

## Summary

Left sidebar의 "Shapic" 텍스트를 단순 텍스트에서 로고 타이포그래피 스타일로 변경한다. 둥근 느낌의 Nunito 폰트를 적용하고 프라이머리 컬러로 브랜드 아이덴티티를 강화한다.

## Current State

- **파일**: `src/renderer/src/components/layout/left-panel.tsx:10`
- **폰트**: Outfit (본문과 동일)
- **크기**: `text-xs` (12px)
- **굵기**: `font-semibold` (600)
- **색상**: `text-text-primary` (#1a1d26)
- **자간**: `tracking-tight`
- **아이콘**: 20x20 앱 아이콘이 텍스트 왼쪽에 위치

## Design

### 변경 사항

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 폰트 | Outfit | Nunito (로고 텍스트만) |
| 크기 | `text-xs` (12px) | `text-sm` (14px) |
| 굵기 | `font-semibold` (600) | `font-bold` (700) |
| 색상 | `text-text-primary` (#1a1d26) | `text-primary` (#4361ee) |
| 자간 | `tracking-tight` | `tracking-normal` |
| 아이콘 | 유지 | 유지 (변경 없음) |

### 구현 범위

1. **Google Fonts에 Nunito 추가** — `src/renderer/index.html`에 Nunito 폰트 import 추가 (weight: 700)
2. **Tailwind 폰트 설정** — `src/renderer/src/index.css`의 `@theme`에 Nunito용 font-family 변수 추가
3. **로고 텍스트 스타일 변경** — `left-panel.tsx`의 span 클래스를 새로운 스타일로 교체

### 변경하지 않는 것

- 본문 폰트 (Outfit 유지)
- 앱 아이콘 (크기, 위치 동일)
- 사이드바 레이아웃/구조
- 다른 컴포넌트의 스타일

## Files to Modify

1. `src/renderer/index.html` — Nunito 폰트 import 추가
2. `src/renderer/src/index.css` — `--font-logo` 변수 추가
3. `src/renderer/src/components/layout/left-panel.tsx` — 로고 span 스타일 변경
