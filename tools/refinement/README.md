# 全场景精修 v1

当前网页默认启用精修，设置 →「精修模型与材质」可随时关闭。URL `?refinement=on` / `?refinement=off` 可覆盖本地偏好。当前副本预览端口 4214；4183 属于另一份旧项目，未修改它。

## 实际范围

对当前网页完整场景进行清点：约 550 个 Mesh（异步装饰加载后数量会变化），344 种不同几何。包括法堂、山门、莲池和环道、月光庭院、供器、蒲团、问心席、许愿树及人物。

Blender 对 72 种共享几何生成倒角或曲面细分结果；浏览器验收实际替换 188 个 Mesh。77 种 PBR 材质按木材、石材、布料、皮肤、金属、水面和植物分别调整粗糙度与微表面。树叶增加 UV，用于叶面细节。不是每个网格都重建：扫描佛像、树木枝叶、蒙皮人物保留既有拓扑，主要处理表面；阴影平面、粒子、文字与特殊着色器保持原样。1 个建筑色带几何因面数预算保留原网格，但参与材质处理。

人物骨骼、蒙皮、动画剪辑、对象身份、父子层级、位置、碰撞计算及交互事件均不替换。新几何仅赋值到原 Mesh.geometry；保留原 Geometry 以支持恢复。求签预览的后建克隆也支持恢复。

## 文件

- `public/refinement/geometry.bin`：Blender 输出的本地坐标几何增量，约 7.5 MiB，包含位置、法线、UV、顶点颜色和索引。
- `public/refinement/manifest.json`：按原几何内容摘要匹配的索引；不会依赖每次加载变化的 UUID。
- `public/refinement/refinement.js`：资源加载、场景注册、替换、回退和资源释放。
- `public/refinement/materials.js`：保留原颜色与法线贴图、动画 shader 的表面调整。
- `tools/refinement/export.cjs` 与 `refine.py`：从网页导出原模型并使用 Blender 构建网格包。
- Blender 工作台：`全场景-网格精修工作台.blend`（本地保留，不随仓库分发）。这是共享几何的修饰器工作台，网格位于各自局部原点，不是完整带贴图的场景排布文件。此前带贴图法堂底稿仍然保留。

## 验收

- `npm test`：12 项通过，包含状态协议、求签规则和 AI 模拟接口。
- `smoke.cjs`：模型替换、26 个蒙皮 Mesh 和骨骼保持不变、原材质对象保持不变、原版完整恢复、后建克隆恢复、键盘行走。
- `wish-flow.cjs`：绕池寻路、两次许愿、挂牌、卡片保存、区分木牌、刷新重读。
- `ritual-flow.cjs`：礼佛、对话、摇签、掷筊、领签、解签及保存。
- `mobile.cjs`：390×844 触摸点击树干、打开表单。
- `fallback.cjs`：精修资产返回 503 时保留原场景。
- 同机位原版／精修截图在 `screenshots/`。

本机未配置 DeepSeek 密钥，浏览器对话、解签与卡片走现有参考模式；真实模型服务未验证。CPU 提交耗时不等于 GPU 帧率。当前视角抽样 draw calls 均为 147，三角形从 1,450,878 到 1,466,262；完整结果见 `performance-results.json`。尚未做真机低端手机长时测试。

## 构建

本机运行当前项目 `PORT=4214 npm start`，然后执行 `node tools/refinement/export.cjs`，再执行 `/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python tools/refinement/refine.py`。导出必须使用 `refinement=off`，避免对已经替换的网格再次处理。Playwright 路径在脚本中指向本机现有安装，换机器时需要修改。

网页精修前完整备份由维护者在本地保留，不随仓库分发。
