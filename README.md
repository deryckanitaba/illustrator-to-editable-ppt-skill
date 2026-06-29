# Illustrator 转可编辑 PPT Skill

这是一个面向 Codex 用户、设计师和 PPT 从业者的 Adobe Illustrator `.ai` 画板转 PowerPoint `.pptx` skill。这里的 `.ai` 指 Illustrator 文件格式，不指人工智能。它的目标不是把页面截图塞进 PPT，而是尽量把页面拆成可维护的 PPT 结构：非文字元素以透明 PNG 分层保留，文字重建为可编辑 PPT 文本框，并尽量保持页面尺寸、位置、字体、字号、颜色、换行和对齐方式一致。

## 解决的问题

设计稿常常在 Illustrator 中完成，但最终交付需要 PowerPoint 或 WPS。直接截图会丢失可编辑文字，手工重排又耗时且容易错位。本 skill 提供一套半自动流程，让 Illustrator 画板转换为更接近源文件的可编辑 PPT 页面。

## 适用场景

- Illustrator 画板需要交付为 PPT 或 WPS 演示文稿。
- 页面里有大量装饰图形、图标、背景和可编辑文字。
- 希望保留画板真实尺寸，而不是套用默认 16:9 模板。
- 需要后续在 PowerPoint/WPS 中修改文字内容、字体、颜色或排版。
- 需要批量处理多个 Illustrator 画板，并逐页人工验收。

## 工作原理

1. `export_artboard.jsx` 在 Illustrator 中读取当前活动文档和目标画板。
2. 非文字对象默认按顶层对象或组导出为透明 PNG layer；当检测到复合渐变、剪切、PluginItem 或非 Normal 混合等复杂外观时，默认 `auto` 模式会把非文字 artwork 在完整上下文中合成为一张透明 PNG，以优先保证渐变颜色和视觉一致性。
3. 文字对象不导出为图片，而是记录内容、位置、字体、字号、颜色、段落对齐、字符 run，以及必要时的 PPT 原生文字渐变元数据。
4. `build_pptx.py` 根据 `manifest.json` 创建 PPT，按 Illustrator 画板尺寸设置页面大小。
5. PNG layer 或 full-context 非文字图按坐标放入 PPT，文字按 metadata 重建为可编辑文本框；路径查找器/复合形状制作的渐变字会尽量转换为 PPT 原生文字渐变，而不是用纯色文字覆盖。
6. `verify_pptx.py` 检查页面尺寸、图片数量、文本框数量、字体标记、换行标记和不应出现的发光/模糊效果。

## 安装

准备环境：

- Adobe Illustrator，可运行 JSX 脚本。
- Python 3.10 或更高版本。
- Python 依赖：

```bash
pip install python-pptx
```

安装为 Codex skill：

```bash
mkdir -p ~/.codex/skills
cp -R illustrator-to-editable-ppt-skill ~/.codex/skills/illustrator-to-editable-ppt
```

Windows 用户也可以把本仓库目录复制到自己的 Codex skills 目录中，目录名可保持为 `illustrator-to-editable-ppt`。

## 使用步骤

1. 用 Illustrator 打开源 `.ai` 文件，并确认它是当前活动文档。
2. 复制 `scripts/export_artboard.jsx` 到工作目录。
3. 设置目标画板和导出目录：

```javascript
var ARTBOARD_INDEX = 0;
var OUT_DIR = 'exports/artboard_001';
```

也可以用环境变量覆盖；`AI_TO_PPT_APPEARANCE_MODE` 可选 `auto`、`layers`、`full-context`，`AI_TO_PPT_TEXT_GRADIENT_MODE` 可选 `auto`、`off`：

```bash
AI_TO_PPT_ARTBOARD_INDEX=0 AI_TO_PPT_OUT_DIR=exports/artboard_001 AI_TO_PPT_APPEARANCE_MODE=auto AI_TO_PPT_TEXT_GRADIENT_MODE=auto illustrator export_artboard.jsx
```

实际的 Illustrator 可执行文件路径因系统和安装位置不同，请使用你本机的 Illustrator 启动方式。

4. Illustrator 弹出脚本安全确认时，点击继续。
5. 检查导出目录是否包含 `manifest.json` 和 `images/layer_001.png` 等透明 PNG。
6. 生成 PPT：

```bash
python scripts/build_pptx.py --manifest exports/artboard_001/manifest.json --out output/artboard_001.pptx
```

7. 验证 PPT：

```bash
python scripts/verify_pptx.py output/artboard_001.pptx --manifest exports/artboard_001/manifest.json --show-fonts
```

8. 用 PowerPoint 或 WPS 打开输出文件，人工比对源 Illustrator 页面。

## 字体映射

脚本默认优先使用 Illustrator 导出的 `fontFamily` 和 `fontFullName`。如果 PowerPoint 或 WPS 无法识别某个 PostScript 字体名，可以提供一个 JSON 字体映射文件：

```json
{
  "SourcePostScriptName": "PowerPoint Font Family"
}
```

然后运行：

```bash
python scripts/build_pptx.py --manifest exports/artboard_001/manifest.json --out output/artboard_001.pptx --font-map-json font-map.json
```

请不要把商业字体文件提交到公开仓库。

## 已知限制

- 转换结果依赖本机 Illustrator、PowerPoint/WPS 和已安装字体。
- 复杂混合模式、透明度、蒙版、渐变网格、特效和部分嵌套剪切组可能需要人工检查；默认 `auto` 模式会对复合渐变等复杂外观使用 full-context 非文字合成，视觉更稳，但非文字对象分层会减少。
- 路径查找器/复合形状渐变字会使用启发式规则标记为 PPT 原生文字渐变；复杂字体、特殊效果和个别换行仍需人工检查，本工具不承诺所有 Illustrator 文件都能自动得到完全一致的结果。
- PPT 字体渲染与 Illustrator 不完全一致，可能出现轻微换行或字距差异。
- 竖排文字、路径文字、区域文字的极端形态可能需要额外适配。
- 当前流程偏向单画板逐页导出；批量处理可在此基础上扩展。

## 验收标准

- PPT 页面尺寸与 Illustrator 画板尺寸一致。
- PNG 层数与 `manifest.json` 中的 image 数一致；如果 `manifest.exportMode` 是 `full-context`，非文字 artwork 会是一张保真合成图。
- 可编辑文本框数量与 `manifest.json` 中的 text 数一致。
- 文字可以在 PowerPoint/WPS 中直接编辑，标记出的渐变字应使用 PPT 原生文字渐变。
- 文本框无填充、无描边、无发光、无模糊。
- 文本框开启自动换行，不应出现 `wrap="none"`。
- 居中、右对齐和常规左对齐与源文件一致。
- 字体、字号、颜色、换行和层级经过人工抽样确认。
- 复杂字体、特殊效果和个别换行经过人工检查。

## 示例输出说明

`examples/` 目录默认只保留占位说明。公开仓库不应附带任何客户源文件、截图、`.ai`/PDF/PPT 或商业字体。你可以在本地自行加入脱敏示例，并确保示例素材具有公开发布权限。

## 隐私与版权提醒

- 不要提交客户 `.ai`、`.pdf`、`.pptx`、截图、Logo、品牌素材或未授权图片。
- 不要提交字体文件，尤其是商业字体。
- 不要提交导出缓存、临时 PNG、错误日志、环境变量或任何 Token/密钥。
- 发布前请重新扫描仓库，确认不存在本地绝对路径和私有项目名称。

## License

MIT
