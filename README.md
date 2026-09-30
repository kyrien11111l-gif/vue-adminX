# AdminX

AdminX 是从只读 React 项目 `E:\work\admin` 迁移出的独立 Vue 3 后台管理演示项目。页面行为、接口契约与权限语义沿用原项目，目录职责参考 pure-admin-thin；所有新代码只写入当前目录。

## 运行环境与版本

- Node.js 22.22.2
- pnpm 10.33.2
- Vue 3.5.43、Vue Router 5.3.1、Pinia 4.0.3
- Element Plus 2.14.6、`@element-plus/icons-vue` 2.3.2
- Vite 8.3.1、TypeScript 6.0.3、Vue TSC 3.3.11
- Tailwind CSS 4.3.3、Sass 1.105.0、NProgress 0.2.0
- ESLint 10.11.0、Vitest 5.0.2、Vue Test Utils 2.5.1、happy-dom 20.14.5

版本被精确锁定在 `package.json` 和 `pnpm-lock.yaml` 中。

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview
```

## 演示账号

| 账号 | 密码 | 权限 |
|---|---|---|
| `admin` | `123456` | 全部纳入页面、用户新增按钮、隐藏的 notMatch 验证路由 |
| `auditor` | `123456` | 工作台、数据查询、审计直达页；用户和角色页面直达时进入 403 |

默认使用内置 Mock。`.env.development` 中 `VITE_USE_MOCK=true`；切换真实后端时改为 `false`，并通过 `VITE_API_BASE_URL` 指定 API 前缀。请求契约集中在 `src/api`，统一响应为 `{ code, message, data }`。

## 目录职责

```text
src/
├── api/                       # 登录、会话、菜单、权限与查询接口
├── components/query-form/     # el-row/el-col 驱动的跨页面查询表单
├── config/                    # 布局常量、路由常量与菜单图标映射
├── hooks/                     # 响应式、浏览器全屏、系统主题 Hook
├── layout/
│   ├── components/            # Header、菜单、Tabs、设置、移动导航等
│   └── hooks/                 # 仅布局使用的导航状态 Hook
├── mocks/                     # 两个账号、动态菜单与查询数据
├── router/dynamic/            # 动态路由生成、注册与清理
├── router/guards/             # 登录恢复、权限与错误语义守卫
├── services/                  # 会话初始化、退出与 401 合并处理
├── store/modules/             # Pinia Options Stores
├── styles/                    # Tailwind 入口、Sass 全局样式与主题
├── types/                     # API、菜单、权限、布局与查询类型
├── utils/http/                # 请求、超时、取消、Bearer token、Mock 切换
└── views/                     # 页面
```

页面表格直接使用 `el-table`、`el-table-column` 和 `el-pagination`。工程中没有通用表格组件，也没有 `useTable` 一类 Hook。

## 功能对应关系

| 原功能 | Vue 实现位置 | 当前验证方式 |
|---|---|---|
| 启动 Loading 与早期主题 | `src/main.ts`、`src/utils/startupLoading.ts`、`src/utils/theme.ts` | 首开和刷新可见；首个有效页面渲染后移除；单测覆盖 DOM 清理入口 |
| 登录、会话恢复、401 与退出 | `views/login`、`services`、auth/user stores | admin、auditor 登录与退出回跳已在浏览器验证 |
| 动态路由、菜单与访问权限 | `router/dynamic`、`router/guards`、permission store | auditor 菜单过滤、直达用户页 403、未知路由 404 已验证 |
| 403 / 404 / notMatch | `views/error` | 路由语义分离；notMatch 由 `/system/missing` 隐藏动态菜单验证 |
| 白名单与全屏路由 | `views/white-list`、`views/fullscreen` | 无壳路由独立实现，白名单不初始化会话 |
| 四种导航与移动抽屉 | `src/layout` | 侧边、顶部、双列、混合切换已验证；375/768/1024 断点已验证 |
| Header、面包屑、Tabs、设置、水印 | `layout/components`、tabs/layout stores | 页面切换、标签持久化、设置抽屉与水印交互已验证 |
| 浅色、暗黑、跟随系统、主题色 | layout store、`useSystemTheme`、Element Plus dark variables | 暗黑与跟随系统的 `html.dark`、设置持久化已验证 |
| 浏览器全屏与内容最大化 | `useFullscreen`、SettingsDrawer | 使用 Fullscreen API；Esc 通过 `fullscreenchange` 同步状态 |
| queryForm | `components/query-form` | el-row/el-col、受控值、输入/选择/日期/范围/自定义字段、展开、重置、异步选项和事件；组件测试通过 |
| 用户管理 | `views/system/user` | 单张直接表格、查询、每页 5 条、按钮权限与演示反馈 |
| 角色管理 | `views/system/role` | 单组统计卡与直接表格，不分页 |
| 审计记录 | `views/system/audit` | auditor 可直达，导出按钮提供待接入提示 |
| 数据查询 | `views/system/query` | 组合与表头筛选、分页、选择、密度、列显隐/顺序/固定/宽度、详情、刷新与 CSV |
| NProgress | `router/progress.ts`、全局守卫 | beforeEach 启动，afterEach/onError 结束并清理启动遮罩 |

## queryForm 约定

`QueryForm` 根布局使用 `el-row`，字段和操作区均使用 `el-col`，默认响应式列宽为 `xs=24`、`sm=12`、`xl=6`。字段联合类型包含 `input`、`select`、`date`、`dateRange`、`custom`；支持 `v-model`、初始值、受控展开、异步选项缓存和重复请求合并、字段级错误、查询/重置/值变化事件，以及自定义字段和额外操作插槽。

## 权限与错误语义

- `/login`、`/whiteList` 是白名单。
- 已知路由但权限不足进入 403。
- 动态菜单已注册但页面组件缺失进入 notMatch。
- 不存在于菜单和静态路由的地址进入 404。
- 刷新或直接输入动态 URL 时，会话信息、菜单与权限并发恢复并去重，然后重新匹配原地址。
- 退出或 401 会清除会话、用户、权限、Tabs 和动态路由。
- 登录回跳只接受站内绝对路径，拒绝协议相对地址、外部地址和递归登录地址。

## 已执行的验证

2026-09-29 在 Node.js 22.22.2 / pnpm 10.33.2 环境执行：

- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 warning / 0 error。
- `pnpm test`：通过，5 个测试文件、8 个测试。
- `pnpm build`：通过。
- 浏览器：admin 登录、查询数据加载与关键词筛选、退出回跳；auditor 登录、菜单过滤、直达用户页进入 403、未知路由 404。
- 浏览器：四种布局切换、暗黑/跟随系统/浅色切换、设置持久化、375/768/1024 响应式导航。
- 浏览器：启动遮罩在刷新后正常清理；查询页提供 1000 条 Mock 数据，默认每页 20 条，可切换 20 / 50 / 100 / 200 条。

## 纳入、排除与差异

已纳入登录、工作台、用户、角色、审计、查询、全屏、白名单、403、404、notMatch，以及布局、主题、权限、菜单、Tabs、Mock、Loading 和路由进度。

明确排除 `virtualQuery`、`tanstack`、`tableTest` 及其专属接口、Mock、组件、测试与依赖；未引入 React、Ant Design、Zustand、SimpleBar、TanStack Table 或虚拟表格依赖。

仍存在的差异：

- 当前业务数据来自 Mock；用户/角色/审计的写操作仅展示“演示功能/待接入”反馈，没有虚构本地 CRUD。
- `index.html` 保持标准 Vite 入口，因此最早主题应用点是 `main.ts` 开始执行；没有在 HTML 解析阶段注入主题脚本。
- 内嵌页面使用同源白名单页，避免第三方站点的 `frame-ancestors` / `X-Frame-Options` 导致演示不可用；外链能力通过独立的 Vue 官网菜单验证。
- 生产构建仍提示 Element Plus 主包 chunk 超过 Vite 的默认 500 kB 建议值，不影响构建或运行；后续可按部署缓存策略进一步拆分 vendor chunk。
