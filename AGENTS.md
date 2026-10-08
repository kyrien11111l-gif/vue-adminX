# AdminX Agent Guide

## 项目概览

AdminX 是一个 Vue 3 后台管理演示项目，使用 TypeScript、Vite、Vue Router、Pinia、Element Plus、Tailwind CSS 和 Sass。项目默认使用内置 Mock 数据，接口契约和权限语义集中在当前仓库内维护。

除非用户明确要求，不要修改仓库外的项目，也不要从旧的 React 项目复制实现。当前仓库是独立项目。

## 常用命令

使用 Node.js 22+ 和 pnpm 10+：

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动开发服务器
pnpm typecheck     # vue-tsc 类型检查
pnpm lint          # ESLint，要求零 warning / error
pnpm test          # Vitest 测试
pnpm build         # 类型检查后执行生产构建
pnpm preview       # 预览生产构建
```

完成代码修改后，至少运行与修改范围相关的测试；涉及 TypeScript、Vue 或路由/状态时，运行 `pnpm typecheck`、`pnpm lint` 和 `pnpm test`。

## 目录职责

```text
src/
├── api/                       # 登录、用户、菜单、权限与查询接口封装
├── components/                # 可复用 Vue 组件
├── config/                    # 布局、路由与菜单图标配置
├── hooks/                     # 通用响应式 Hook
├── layout/                    # 页面壳、导航、Header、Tabs、设置抽屉
├── mocks/                     # Mock 请求和演示账号数据
├── router/                    # 静态路由、动态路由和导航守卫
├── services/                  # HTTP 请求层：request、types、统一导出
├── store/                     # Pinia stores
├── styles/                    # Tailwind 与全局 Sass 样式
├── types/                     # API、菜单、权限、布局和查询类型
├── utils/                     # 会话工具及通用工具函数
└── views/                     # 页面级 Vue 组件
```

当前请求相关文件位于 `src/services`：

- `src/services/index.ts`：请求层公共导出。
- `src/services/request.ts`：请求、超时、取消、Bearer token、Mock 切换和统一响应处理。
- `src/services/types.ts`：请求配置和参数类型。

会话相关文件位于 `src/utils`：

- `src/utils/session.ts`：清理会话和退出登录。
- `src/utils/sessionInitialization.ts`：并发恢复用户、菜单和权限。
- `src/utils/unauthorized.ts`：合并重复的 401 处理。

## 导入与编码约定

- 使用 `@/*` 访问 `src/*`，例如 `@/services`、`@/store`、`@/types`。
- API 模块从 `@/services` 导入 `request`；不要重新实现请求、超时或 token 逻辑。
- 需要会话、退出或 401 行为时，从对应的 `@/utils/*` 模块导入。
- 遵守严格 TypeScript 配置：避免 `any`，处理 `undefined`、空值和索引访问；类型导入使用 `import type`。
- Vue 单文件组件保持 `template`、`script`、`style` 的顺序，并沿用现有组件风格。
- 不要为了消除类型错误关闭 `strict`、`noUnusedLocals` 或其他既有检查。
- 保持现有换行、缩进和单引号风格，修改尽量局部化。

## 业务语义

- `/login` 和 `/whiteList` 是白名单路由，不依赖已初始化的会话。
- 已知路由但权限不足进入 403；不存在于菜单和静态路由的地址进入 404。
- 动态菜单已注册但页面组件缺失进入 notMatch。
- 刷新或直接访问动态 URL 时，用户、菜单和权限会并发恢复并去重。
- 退出登录或 401 时，必须清理 token、用户、权限、Tabs 和动态路由。
- 登录回跳只接受站内绝对路径，不允许外部地址、协议相对地址或递归登录地址。
- 默认环境使用 Mock；真实后端通过环境变量关闭 Mock 并配置 API 前缀。不要在没有后端契约的情况下虚构 CRUD 行为。

## 测试与修改流程

1. 先定位相关页面、API、store、router 和测试，确认现有行为。
2. 优先复用已有组件、类型、store 和工具，不重复创建等价抽象。
3. 修改后补充或更新对应的 Vitest 测试；涉及 UI 行为时优先使用现有 `@vue/test-utils` 和 `happy-dom` 配置。
4. 检查是否需要同步更新路由、菜单、权限和 Mock 数据。
5. 运行必要的验证命令，并在结果中说明未运行的检查。

## 边界

- 不要修改 `node_modules`、`dist` 或 `design-system`，除非用户明确要求。
- 不要引入 React、Ant Design、Zustand、TanStack Table 或虚拟表格依赖；这些不属于当前项目范围。
- 不要提交密钥、真实账号密码或新的环境文件。
- 不要执行破坏性 Git 操作，例如 `git reset --hard` 或覆盖用户已有改动。
