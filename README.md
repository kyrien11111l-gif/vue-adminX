# AdminX

AdminX 是一个基于 Vue 3 的后台管理项目，使用 TypeScript 和 Vite 构建。项目提供登录与会话恢复、动态菜单、路由权限、响应式布局、主题设置，以及订单、数据查询和履约报表等管理页面。

项目默认使用仓库内置 Mock 数据，安装依赖后即可启动。需要接入真实服务时，可通过环境变量关闭 Mock，并沿用现有请求层和接口类型。

## 技术栈

- Vue 3、TypeScript、Vite
- Vue Router、Pinia
- Element Plus、`@element-plus/icons-vue`
- Tailwind CSS、Sass、NProgress
- Vitest、Vue Test Utils、happy-dom

## 快速开始

运行环境要求：Node.js `>=22.12.0`，pnpm `>=10`。

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm typecheck  # TypeScript 与 Vue 类型检查
pnpm lint       # ESLint 检查，禁止 warning 和 error
pnpm test       # 运行 Vitest 测试
pnpm build      # 类型检查后执行生产构建
pnpm preview    # 预览生产构建
```

## Mock 账号

开发环境默认启用 Mock，可以使用以下账号登录：

| 账号 | 密码 | 可访问范围 |
| --- | --- | --- |
| `admin` | `123456` | 全部菜单、用户新增按钮和权限验证页面 |
| `auditor` | `123456` | 工作台、订单、数据查询、履约报表和审计记录；用户与角色页面无权限 |

## 环境变量

环境变量位于 `.env.development` 和 `.env.production`：

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_USE_MOCK` | 是否使用内置 Mock 请求 | `true` |
| `VITE_API_PROXY_URL` | API 请求前缀 | `/api` |
| `VITE_WATERMARK_ENABLED` | 是否显示页面水印 | `true` |
| `VITE_WATERMARK_CONTENT` | 水印内容 | `AdminX` |

切换真实接口时，将对应环境中的 `VITE_USE_MOCK` 设置为 `false`，并让 `VITE_API_PROXY_URL` 指向可用的 API 前缀。请求统一通过 `src/services/request.ts` 发出，默认携带 Bearer token，并处理超时、取消、统一响应和 401。

接口响应使用以下结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 主要功能

- 登录、Token 会话恢复、退出登录和 401 统一处理。
- 动态菜单与动态路由，根据权限过滤菜单和页面访问范围。
- 403、404、初始化失败和动态页面组件缺失等错误页面。
- 侧边、顶部、双列和混合四种导航布局，支持移动端导航抽屉。
- 面包屑、页面 Tabs、布局设置、水印、浏览器全屏和内容最大化。
- 浅色、暗黑、跟随系统和主题色切换，并持久化布局设置。
- 工作台、用户管理、角色管理、订单管理、数据查询、履约时效报表和审计记录。
- 内嵌白名单页面、全屏页面、外部链接菜单和多层级菜单。
- 可复用的 `QueryForm`、`CommonTable`、`TableToolbar`、`PageContainer` 和权限组件。
- 数据查询支持组合筛选、分页、行选择、表格密度、列显隐、列排序、列固定、列宽调整、详情查看和 CSV 导出。

## 路由与权限语义

- `/login` 和 `/whiteList` 是无需登录的白名单路由。
- 已注册但当前角色无权限的地址进入 `/403`。
- 动态菜单已注册但找不到页面组件时进入 `notMatch` 页面。
- 不存在于静态路由和动态菜单中的地址进入 `/404`。
- 刷新或直接访问动态地址时，用户、菜单和权限会并发恢复，并在恢复完成后重新匹配原地址。
- 退出登录或接口返回 401 时，会清理 Token、用户信息、权限、Tabs 和动态路由。
- 登录回跳只接受站内绝对路径，拒绝外部地址、协议相对地址和递归登录地址。

## 目录结构

```text
src/
├── api/                  # 登录、用户、菜单、权限与业务查询接口
├── components/           # CommonTable、QueryForm、TableToolbar 等通用组件
├── config/               # 布局、路由和菜单图标配置
├── directives/           # 权限指令
├── hooks/                # 全屏、响应式布局、主题和表格设置 Hook
├── layout/               # 页面壳、导航、Header、Tabs 和设置抽屉
├── mocks/                # Mock 账号、菜单和业务数据
├── router/               # 静态路由、动态路由和导航守卫
├── services/             # 请求封装、超时、取消和响应处理
├── store/                # Pinia stores
├── styles/               # Tailwind 入口、全局 Sass 和主题样式
├── types/                # API、菜单、权限、布局和业务类型
├── utils/                # 会话、导航、菜单、主题和通用工具
└── views/                # 登录、工作台、系统管理和错误页面
tests/                    # Vitest 单元测试
```

## Mock 接口

内置 Mock 当前覆盖以下接口：

- `POST /login`
- `GET /user/info`
- `GET /menus`
- `GET /permissions`
- `POST /query`
- `POST /orders`
- `POST /fulfillment-report`

用户、角色和审计页面中的部分新增、编辑、权限配置等操作目前仅展示界面反馈，尚未连接写入接口。接入后端时，请在 `src/api` 中补充对应接口，并同步更新类型、权限和 Mock 数据。

## 开发与验证

修改 Vue、TypeScript、路由、状态或权限相关代码后，建议执行：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

新增页面或菜单时，请同步检查动态路由、菜单权限、Mock 数据、类型定义和对应测试。
