# Mockerview - 면접 연습 모바일 웹 애플리케이션

## 프로젝트 소개

모바일 친화적인 웹 애플리케이션은 개인이 독립적으로 면접 기술을 연습할 수 있도록 설계되었습니다. 사용자는 맞춤형 면접 질문을 생성하고, 무작위 면접 프롬프트를 받으며, 자기 검토를 위해 응답을 녹음할 수 있습니다.

## 기술 스택

-   **프론트엔드**: React
-   **언어**: TypeScript
-   **UI 라이브러리**: Material-UI (MUI)
-   **상태 관리**: 로컬 스토리지
-   **배포**: Vercel

## 주요 기능

### 1. 질문 목록 페이지

-   맞춤형 면접 질문 생성
-   질문을 로컬 스토리지에 저장
-   기존 질문 수정 및 삭제
-   향후 데이터베이스 통합 준비

### 2. 랜덤 질문 페이지

-   사용자가 생성한 질문 목록에서 무작위 면접 질문 생성
-   인터랙티브 "질문하기" 버튼
-   면접 질문의 음성 시뮬레이션
-   면접 응답 녹음
-   질문 키와 함께 로컬 스토리지에 녹음 저장

### 3. 녹음 기록 페이지

-   이전 면접 질문 확인
-   녹음된 응답 재생
-   녹음된 면접 삭제 옵션

## 계획된 개선 사항

-   지속적인 질문 저장을 위한 데이터베이스 통합
-   사용자 인증
-   고급 녹음 및 재생 기능

## 로컬 개발 설정

### 필수 조건

-   Node.js (v18+)
-   npm 또는 yarn

### 설치 단계

1. 저장소 클론
2. 종속성 설치

```bash
npm install
# 또는
yarn install
```

3. 개발 서버 시작

```bash
npm run dev
# 또는
yarn run dev
```

## 배포

Vercel을 통한 간편하고 빠른 호스팅

## 향후 로드맵

-   [ ] 데이터베이스 백엔드 구현
-   [ ] 사용자 인증 추가
-   [ ] 녹음 기능 개선
-   [ ] UI/UX 향상

## 라이선스

## 회고

이번 프로젝트를 진행하면서 여러 가지 배운 점들을 정리해보았습니다.

-   [SpeechSynthesisUtterance](https://thread-gorgonzola-1b0.notion.site/SpeechSynthesisUtterance-1afc13ea807d8065949dc745a98a0ce4)
-   [MediaRecorder](https://thread-gorgonzola-1b0.notion.site/MediaRecorder-1afc13ea807d80fd8183df21c0b10f41)
-   [맥북과 아이폰 디버깅](https://thread-gorgonzola-1b0.notion.site/1afc13ea807d80efb935f8590ed0003f)
