# nonlocalhost

Self-hosted ngrok/localtunnel 대체 서비스. `bun tunnel <port> --subdomain <name>` 하나로
로컬 머신의 포트를 `https://<name>.<your-domain>`으로 공개한다. 포트포워딩 없이 클라이언트가
서버로 아웃바운드 WebSocket을 열어서 요청을 릴레이하는 구조라 NAT/방화벽 뒤에서도 동작한다.

회원가입 없이 seed admin 계정 하나만 존재하는 개인용 서비스로 설계했다.

## 아키텍처

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
- **apps/cli** — 로컬 머신에서 실행하는 터널 클라이언트. `bun build --compile`로 단일 바이너리로도
  배포 가능.
- **packages/db** — SQLite(`bun:sqlite`) + Drizzle ORM 스키마/마이그레이션.
- **packages/shared** — `AppError`, 터널 WS 프로토콜 타입 (api·cli 공용).
- **packages/middleware** — 대시보드 로그인 세션용 Hono JWT 미들웨어.

## 요구 사항

- [Bun](https://bun.sh) 1.3+
- 리버스 프록시(Caddy 등)로 와일드카드 서브도메인을 이 서비스로 라우팅할 수 있는 도메인
  - `<도메인>`과 `*.<도메인>` 둘 다 이 서버를 가리켜야 한다
  - TLS는 Caddy의 [on-demand TLS](https://caddyserver.com/docs/caddyfile/options#on-demand-tls)를
    쓰면 서브도메인이 연결될 때마다 인증서를 자동 발급받을 수 있다 (아래 예시 참고)

## 로컬 개발

```bash
bun install

# API 서버 (:3000)
cp apps/api/.env.example apps/api/.env   # 필요한 값 채우기
cd apps/api && bun run --watch src/index.ts

# 대시보드 (:5173, /api를 :3000으로 프록시)
cd apps/web && bun run dev
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

## 배포 (Docker)

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

## 사용법

CLI는 `bun run apps/cli/src/index.ts ...`로 바로 실행해도 되고, `cd apps/cli && bun link` 한 뒤
`nonlocalhost` 명령으로 어디서든 실행해도 된다 (아래 예시는 `nonlocalhost`로 표기).
`bun build --compile`로 단일 바이너리를 만들어서 배포할 수도 있다:

```bash
cd apps/cli && bun run build   # dist/nonlocalhost
```

1. 대시보드에 로그인(`ADMIN_SEED`로 만든 계정) → "CLI 토큰" 섹션에서 토큰 발급
2. 로컬 머신에서 계정 정보를 한 번 저장한다 (토큰을 인자로 넘기지 않으면 화면에 안 보이게
   입력받으므로 쉘 히스토리에 안 남는다):
   ```bash
   nonlocalhost login --server <도메인>
   # Token (hidden): 발급받은 토큰 붙여넣기
   ```
   `--server`에는 스킴(`https://`, `wss://`) 없이 `PUBLIC_BASE_DOMAIN` 값만 넣는다 (예:
   `tunnel.example.com`). 토큰/서버는 `~/.config/nonlocalhost/config.json`에 `0600` 권한으로
   저장된다.
3. 터널을 시작한다:
   ```bash
   nonlocalhost <포트> --subdomain <이름> --save
   ```
   `--save`는 최초 1회만 필요하고, 포트/서브도메인을 현재 디렉토리의 `.nonlocalhost.json`에
   저장한다 (시크릿이 아니라 커밋해도 무방). 이후에는 같은 디렉토리에서 인자 없이
   `nonlocalhost`만 실행해도 저장된 계정/프로젝트 설정을 그대로 사용한다.
4. 연결되면 `https://<이름>.<도메인>`으로 어디서든(다른 네트워크 포함) 접속 가능. 토큰이
   잘못됐거나 서브도메인이 이미 쓰이는 중이면 무한 재시도 없이 바로 종료하고 원인을 알려준다.
   `Ctrl+C`로 정상 종료할 수 있다.

### Vite 사용 시

CLI가 연결에 성공하면 필요한 `vite.config.ts` 설정 스니펫을 콘솔에 같이 출력해준다
(`server.allowedHosts`, `server.hmr.host`). Vite dev 서버는 기본적으로 알려지지 않은 Host
헤더를 막기 때문에 이 설정이 없으면 접속은 되지만 페이지가 안 뜬다.

## 프로토콜

CLI와 서버는 컨트롤 WebSocket(`/_ws/tunnel`) 위에서 바이너리 프레임을 주고받는다:
`[4바이트 BE 헤더 길이][UTF-8 JSON 헤더][나머지 = raw body bytes]`. 자세한 프레임 정의는
`packages/shared/src/tunnel-protocol.ts` 참고.
