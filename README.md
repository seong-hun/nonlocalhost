# nonlocalhost

Self-hosted ngrok/localtunnel 대체 서비스. `bunx github:seong-hun/nonlocalhost#master <port> --subdomain <name>`
하나로 로컬 머신의 포트를 `https://<name>.<your-domain>`으로 공개한다. 포트포워딩 없이 클라이언트가
서버로 아웃바운드 WebSocket을 열어서 요청을 릴레이하는 구조라 NAT/방화벽 뒤에서도 동작한다.

회원가입 없이 seed admin 계정 하나만 존재하는 개인용 서비스로 설계했다.

---

## 사용법 (다른 프로젝트에서 터널 클라이언트로 쓰기)

레포를 클론할 필요 없이, 아무 프로젝트 디렉토리에서나 `bunx`로 바로 실행한다.

```bash
bunx github:seong-hun/nonlocalhost#master <포트> --subdomain <이름>
```

> **`#master`를 꼭 붙일 것.** ref 없이 `github:owner/repo`만 쓰면 bun이 최초 설치 시점의 커밋을
> 로컬 캐시(`~/.bun/install/cache`)에 영구히 박아두고, 이후엔 GitHub에 재검증 요청조차 안 보낸다
> — 레포에 새 커밋이 올라가도 계속 옛날 버전이 실행된다. `#master`처럼 ref를 명시하면 실행할
> 때마다 GitHub API로 그 브랜치의 최신 커밋을 확인하고 받아온다. 이미 ref 없이 실행해서 캐시가
> 박혀버렸다면 `rm -rf ~/.bun/install/cache/nonlocalhost ~/.bun/install/cache/@GH@seong-hun-nonlocalhost-*`
> 로 지우고 다시 실행하면 된다.

전역 설치도 가능:

```bash
bun add -g github:seong-hun/nonlocalhost#master
nonlocalhost <포트> --subdomain <이름>
```

전역 설치는 그 시점의 커밋으로 고정되므로, 업데이트하려면 같은 명령으로 다시 설치하거나
`bun update -g`를 실행한다.

private 레포이므로 실행 환경에 이 저장소에 대한 git 인증(SSH 키 등)이 설정돼 있어야 한다.

### 1. 로그인

대시보드에 로그인(`ADMIN_SEED`로 만든 계정) → "CLI 토큰" 섹션에서 토큰 발급 후:

```bash
bunx github:seong-hun/nonlocalhost#master login
```

server / token(입력값 화면에 안 보임) / subdomain(선택) / port(선택)를 순서대로 물어보는
인터랙티브 프롬프트가 뜬다. 이미 저장된 값이 있으면 기본값으로 채워져 있어서 그냥 엔터만 치면
재사용되고, 새 값을 입력하면 그 값으로 덮어쓴다. `--token`/`--server`/`--subdomain`/`--port`
플래그로 특정 항목만 바로 지정해서 프롬프트를 건너뛸 수도 있다.

```bash
bunx github:seong-hun/nonlocalhost#master login --subdomain other-name   # subdomain만 변경
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
bunx github:seong-hun/nonlocalhost#master <포트> --subdomain <이름>
# 또는 명시적으로
bunx github:seong-hun/nonlocalhost#master start --port <포트> --subdomain <이름>
```

로그인 시 subdomain/port까지 저장해뒀다면 인자 없이 그대로 재사용된다:

```bash
bunx github:seong-hun/nonlocalhost#master
# 또는
bunx github:seong-hun/nonlocalhost#master start
```

연결되면 `https://<이름>.<도메인>`으로 어디서든(다른 네트워크 포함) 접속 가능. 토큰이 잘못됐거나
서브도메인이 이미 쓰이는 중이면 무한 재시도 없이 바로 종료하고 원인을 알려준다. `Ctrl+C`로 정상
종료할 수 있다.

전체 옵션은 `bunx github:seong-hun/nonlocalhost#master --help` 참고.

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
- **apps/cli** — 로컬 머신에서 실행하는 터널 클라이언트. `apps/cli/dist/index.js`로 번들링돼
  있어서 `bunx`/`bun add -g`로 git에서 바로 설치 가능하고, `bun build --compile`로 단일
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

CLI를 수정했다면 다른 프로젝트에서 `bunx`로 받는 번들도 갱신해야 한다:

```bash
cd apps/cli && bun run bundle   # dist/index.js 재생성, 커밋 필요
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
