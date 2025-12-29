# 📘 학교 시험 분석 앱 사용 가이드

이 문서는 다른 컴퓨터 환경에서 이 앱을 다운로드하고 실행하는 방법을 안내합니다.
이 앱은 별도의 서버 설치가 필요 없는 **웹 애플리케이션(HTML/JS)**입니다.

---

## 1. 준비물 (Prerequisites)
앱을 실행하거나 수정하기 위해 아래 프로그램들이 필요합니다.

*   **웹 브라우저**: Chrome, Edge, Safari 등 (최신 버전 권장)
*   **Git**: 프로젝트를 다운로드받기 위해 필요합니다. ([설치 링크](https://git-scm.com/downloads))
*   **Visual Studio Code (권장)**: 코드를 수정하거나 편리하게 실행하기 위해 추천합니다. ([설치 링크](https://code.visualstudio.com/))

---

## 2. 프로젝트 가져오기 (Download)

터미널(CMD, PowerShell, Mac Terminal)을 열고 아래 명령어를 입력하여 프로젝트를 내 컴퓨터로 복사합니다.

```bash
# 원하는 폴더로 이동 (예: 바탕화면)
cd Desktop

# 프로젝트 복제 (Clone)
git clone https://github.com/snake77-kor/exam-analysis-app.git

# 폴더 안으로 이동
cd exam-analysis-app
```

---

## 3. 앱 실행하기 (Run)

이 앱은 정적 웹사이트이므로 서버를 켜지 않아도 실행할 수 있습니다.

### 방법 A: 간단 실행 (일반 사용자)
1. 폴더 안에 있는 **`index.html`** 파일을 찾습니다.
2. 파일을 **더블 클릭**하면 브라우저가 열리며 앱이 실행됩니다.

### 방법 B: VS Code에서 실행 (개발/수정 시)
1. VS Code에서 `File > Open Folder`를 눌러 `exam-analysis-app` 폴더를 엽니다.
2. `index.html` 파일을 엽니다.
3. (확장 프로그램 `Live Server`가 설치되어 있다면) 우측 하단의 **'Go Live'** 버튼을 클릭합니다.
   - *팁: 이렇게 하면 코드를 수정할 때마다 자동으로 새로고침됩니다.*

---

## 4. 수정 사항 저장 및 공유 (Git)

코드를 수정한 뒤 GitHub에 다시 올리려면 다음 순서로 진행하세요.

```bash
# 1. 변경된 파일 확인
git status

# 2. 변경 사항을 저장소에 담기 (Staging)
git add .

# 3. 설명과 함께 저장 (Commit)
git commit -m "수정된 내용에 대한 설명"

# 4. GitHub에 업로드 (Push)
git push origin main
```

---

## ❓ 자주 묻는 질문

**Q. `npm install`이나 `pip install`은 안 해도 되나요?**
A. 네, 이 앱은 순수 HTML/CSS/JavaScript로 만들어져 있어 별도의 라이브러리 설치가 필요 없습니다.

**Q. 화면이 깨져 보여요.**
A. 브라우저 창의 크기를 조절해보거나, `style.css` 파일이 같은 폴더에 잘 있는지 확인해주세요.
