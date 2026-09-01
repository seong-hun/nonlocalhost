# nonlocalhost

Self-hosted ngrok/localtunnel 대체 서비스. `bunx nonlocalhost <port> --subdomain <name>` 하나로
로컬 머신의 포트를 `https://<name>.<your-domain>`으로 공개한다. 포트포워딩 없이 클라이언트가
서버로 아웃바운드 WebSocket을 열어서 요청을 릴레이하는 구조라 NAT/방화벽 뒤에서도 동작한다.

회원가입 없이 seed admin 계정 하나만 존재하는 개인용 서비스로 설계했다.

---

## 사용법 (다른 프로젝트에서 터널 클라이언트로 쓰기)

npm에 배포된 CLI라, 레포를 클론할 필요 없이 아무 프로젝트 디렉토리에서나 바로 실행한다.

```bash
bunx nonlocalhost <포트> --subdomain <이름>
# 또는
npx nonlocalhost <포트> --subdomain <이름>
```

전역 설치도 가능:

```bash
bun add -g nonlocalhost   # 또는: npm install -g nonlocalhost
nonlocalhost <포트> --subdomain <이름>
```

업데이트는 `bun update -g nonlocalhost` / `npm update -g nonlocalhost`.

### 1. 로그인

대시보드에 로그인(`ADMIN_SEED`로 만든 계정) → "CLI 토큰" 섹션에서 토큰 발급 후:

```bash
bunx nonlocalhost login
```

server / token(입력값 화면에 안 보임) / subdomain(선택) / port(선택)를 순서대로 물어보는
인터랙티브 프롬프트가 뜬다. 이미 저장된 값이 있으면 기본값으로 채워져 있어서 그냥 엔터만 치면
재사용되고, 새 값을 입력하면 그 값으로 덮어쓴다. `--token`/`--server`/`--subdomain`/`--port`
플래그로 특정 항목만 바로 지정해서 프롬프트를 건너뛸 수도 있다.

```bash
bunx nonlocalhost login --subdomain other-name   # subdomain만 변경
```

`--server`에는 스킴(`https://`, `wss://`) 없이 `PUBLIC_BASE_DOMAIN` 값만 넣는다 (예:
`tunnel.example.com`). server/token은 `~/.config/nonlocalhost/config.json`에 `0600` 권한으로
저장된다. subdomain/port를 처음 저장하는 순간 프로젝트 디렉토리에 `.nonlocalhost/` 폴더가
생기는데(supabase CLI의 `.temp/project-ref`와 같은 방식), 여기엔 랜덤 ref 하나만 담긴
`project-ref` 파일과 그 폴더 전체를 무시하는 `.gitignore`가 자동으로 들어있어 커밋될 일이
없다. 실제 subdomain/port 값은 이 ref를 키로 `~/.config/nonlocalhost/projects/<ref>.json`에
저장되므로, 프로젝트 디렉토리를 옮기거나 이름을 바꿔도 설정이 유지되고 git clone으로 새로
받으면(=ref가 없으면) 새 프로젝트로 취급된다.

### 2. 터널 시작

```bash
bunx nonlocalhost <포트> --subdomain <이름>
# 또는 명시적으로
bunx nonlocalhost start --port <포트> --subdomain <이름>
```

로그인 시 subdomain/port까지 저장해뒀다면 인자 없이 그대로 재사용된다:

```bash
bunx nonlocalhost
# 또는
bunx nonlocalhost start
```

연결되면 `https://<이름>.<도메인>`으로 어디서든(다른 네트워크 포함) 접속 가능. 토큰이 잘못됐거나
서브도메인이 이미 쓰이는 중이면 무한 재시도 없이 바로 종료하고 원인을 알려준다. `Ctrl+C`로 정상
종료할 수 있다.

전체 옵션은 `bunx nonlocalhost --help` 참고.

#### Vite 사용 시

CLI가 연결에 성공하면 필요한 `vite.config.ts` 설정 스니펫을 콘솔에 같이 출력해준다
(`server.allowedHosts`, `server.hmr.host`). Vite dev 서버는 기본적으로 알려지지 않은 Host
헤더를 막기 때문에 이 설정이 없으면 접속은 되지만 페이지가 안 뜬다.

---

## 서버 운영

이 저장소를 clone해서 직접 서비스를 띄우고 관리하는 쪽 문서. 위의 "사용법"은 이 서버에 붙는
클라이언트 입장의 문서이니, 서버를 운영할 게 아니라면 여기부터는 몰라도 된다.

### 아키텍처

```
인터넷 → Caddy(도메인, *.도메인, on-demand TLS)
       → apps/api (Hono, Bun.serve)
           Host == BASE_DOMAIN                → 대시보드 SPA + REST API
           Host == *.BASE_DOMAIN               → registry 조회 → WS로 요청 릴레이
           /_ws/tunnel                          → CLI 클라이언트 컨트롤 WebSocket
       ↕ wss (아웃바운드)
     apps/cli (로컬 머신에서 실행) → 로컬에서 돌고 있는 서버
```

- **apps/api** — Hono + Bun. REST API(인증/터널/토큰), 바이너리 프레이밍 WS 프로토콜로 공개
  HTTP 요청을 CLI 클라이언트에게 릴레이, 프로덕션에서는 대시보드 정적 파일도 같이 서빙한다.
- **apps/web** — Vite + TypeScript + Tailwind + React 대시보드. 터널 목록/상태, CLI 토큰 발급.
- **apps/cli** — 로컬 머신에서 실행하는 터널 클라이언트. npm에 `nonlocalhost`로 배포되며
  (`cli-v*` 태그 push 시 GitHub Actions가 빌드/publish), `bun build --compile`로 단일
  바이너리로도 배포 가능.
- **packages/db** — SQLite(`bun:sqlite`) + Drizzle ORM 스키마/마이그레이션.
- **packages/shared** — `AppError`, 터널 WS 프로토콜 타입 (api·cli 공용).
- **packages/middleware** — 대시보드 로그인 세션용 Hono JWT 미들웨어.

### 요구 사항

- [Bun](https://bun.sh) 1.3+
- 리버스 프록시(Caddy 등)로 와일드카드 서브도메인을 이 서비스로 라우팅할 수 있는 도메인
  - `<도메인>`과 `*.<도메인>` 둘 다 이 서버를 가리켜야 한다
  - TLS는 Caddy의 [on-demand TLS](https://caddyserver.com/docs/caddyfile/options#on-demand-tls)를
    쓰면 서브도메인이 연결될 때마다 인증서를 자동 발급받을 수 있다 (아래 예시 참고)

### 로컬 개발

```bash
bun install

# API 서버 (:3000)
cp apps/api/.env.example apps/api/.env   # 필요한 값 채우기
cd apps/api && bun run --watch src/index.ts

# 대시보드 (:5173, /api를 :3000으로 프록시)
cd apps/web && bun run dev

# CLI (레포 안에서 직접 실행/수정할 때)
bun run apps/cli/src/index.ts <포트> --subdomain <이름>
```

CLI를 수정했다면 `apps/cli/package.json`의 `version`을 올리고 `cli-v<version>` 태그를 push하면
`.github/workflows/publish-cli.yml`이 빌드해서 npm에 publish한다 (예: `0.1.1` → 태그
`cli-v0.1.1`).

publish는 장수명 토큰(`NPM_TOKEN`) 없이 **npm Trusted Publishing(OIDC)**으로 인증한다.
최초 1회 설정이 필요하다:

1. (패키지가 아직 없다면) 로컬에서 한 번 수동으로 publish해서 `nonlocalhost` 패키지를 만든다 —
   `npm login` 후 CI 워크플로우의 "Strip workspace-only fields" 단계와 동일하게
   `apps/cli/package.json`을 정리하고 `npm publish --access public`
2. https://www.npmjs.com → 해당 패키지 → Settings → **Trusted Publisher** → GitHub Actions 선택
   → Organization/user: `seong-hun`, Repository: `nonlocalhost`,
   Workflow filename: `publish-cli.yml` (정확히 일치해야 함) 입력 후 저장
3. 이후로는 `cli-v<version>` 태그 push만 하면 별도 시크릿 없이 자동 publish된다

로컬에서 번들 결과만 확인하고 싶으면:

```bash
cd apps/cli && bun run bundle   # dist/index.js 생성 (git엔 커밋 안 함)
```

DB 마이그레이션:

```bash
cd packages/db
bun run db:generate   # 스키마 변경 후 마이그레이션 파일 생성
bun run db:migrate    # 적용
```

테스트/린트:

```bash
bun test
bun run lint
bun run check:fix   # biome 자동 수정
```

### 배포 (Docker)

```bash
cp .env.example .env   # PUBLIC_BASE_DOMAIN, JWT_SECRET, ADMIN_SEED 등 채우기
docker compose build
docker compose up -d
```

`.env`에서 채워야 하는 값:

| 변수 | 설명 |
| --- | --- |
| `PUBLIC_BASE_DOMAIN` | 예: `tunnel.example.com`. 이 도메인과 `*.`+이 도메인이 서버로 라우팅돼야 함 |
| `JWT_SECRET` | 대시보드 로그인 세션 서명용 (32자 이상 랜덤 문자열) |
| `ADMIN_SEED` | `이메일:비밀번호`. 컨테이너 기동 시 관리자 계정이 없으면 생성, 있으면 동기화 |
| `ALLOWED_ORIGIN` | 대시보드가 서빙되는 origin (CORS) |

`docker-compose.yml`은 이미 떠 있는 Caddy가 쓰는 `caddy_network`(external)에 조인한다.
컨테이너 이름(`nonlocalhost-api`)으로 Caddy에서 리버스 프록시하면 된다.

Caddyfile 예시:

```caddyfile
{
    on_demand_tls {
        ask http://nonlocalhost-api:3000/internal/tls-ask
    }
}

tunnel.example.com, *.tunnel.example.com {
    encode zstd gzip
    tls you@example.com {
        on_demand
    }
    reverse_proxy nonlocalhost-api:3000
}
```

`/internal/tls-ask`는 요청받은 도메인이 베이스 도메인이거나 DB에 등록된 서브도메인일 때만 200을
돌려줘서, 임의 서브도메인으로 인증서를 남발시키는 걸 막는다.

### 프로토콜

CLI와 서버는 컨트롤 WebSocket(`/_ws/tunnel`) 위에서 바이너리 프레임을 주고받는다:
`[4바이트 BE 헤더 길이][UTF-8 JSON 헤더][나머지 = raw body bytes]`. 자세한 프레임 정의는
`packages/shared/src/tunnel-protocol.ts` 참고.
