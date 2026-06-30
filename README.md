<img width="1797" height="986" alt="AI 截图" src="https://github.com/user-attachments/assets/a87176bd-b5a5-47b9-8223-fa053485bc77" /># Illustrator to Editable PPT Skill

> Convert Adobe Illustrator `.ai` artboards into editable PowerPoint `.pptx` slides.
> 图形以独立透明 PNG 图层保留，文字重建为 PowerPoint 原生文本框。

<img width="1734" height="912" alt="屏幕录制 2026-06-29 " src="https://github.com/user-attachments/assets/e7107a8a-ffaa-4722-811c-20b8a005d402" />

![Editable PowerPoint demo](assets/demo/03-edit-text.gif)

**这不是普通 PDF 转 PPT。**

它从 Adobe Illustrator `.ai` 源文件读取画板、文字和对象信息，目标不是让 PPT “能打开”，而是尽量让它在后续修改时仍然保持正常的文字结构、版式关系和视觉效果。

---

## 为什么需要这个工作流

普通 PDF 转 PPT 的结果，很多时候只是“看起来有文本框”。

常见问题包括：

* 背景和设计元素与原稿存在明显差异；
* 文字经过图像识别后重新生成，字体、字号、换行和对齐容易偏移；
* 一段文字被拆成很多零散文本框，严重时甚至一字一框；
* 页面尺寸被强制套进默认 16:9，原稿比例发生变化；
* 改一行文字后，整页版式开始失控。

这个 skill 处理的是另一件事：

> 让 Illustrator 画板尽量变成一份后续仍然敢改的 PPT。

---

## 效果示例

<table>
<tr>
<td width="50%" align="center">

### Illustrator 源文件

<img width="1797" height="986" alt="AI 截图" src="https://github.com/user-attachments/assets/2bc7f2e4-151a-4c84-8156-1d5cd1d0b5f1" />

<img src="assets/demo/01-ai-source.png" alt="Illustrator source artboard">

</td>
<td width="50%" align="center">

### 生成后的可编辑 PPT

<img src="assets/demo/02-ppt-editable-text.png" alt="Editable text in PowerPoint or WPS">

</td>
</tr>
</table>

上图中的 PPT 标题可以直接选中、改字、调整字体和字号，而不是一张整页截图或 OCR 拆分后的零散文本。

---

## 它保留了什么

| Illustrator 内容   | PPT 输出方式          | 后续可操作性          |
| ---------------- | ----------------- | --------------- |
| 普通文字 `TextFrame` | PowerPoint 原生文本框  | 可改字、改字体、改字号、改颜色 |
| 图片、图标、装饰图形       | 独立透明 PNG 图层       | 可移动、缩放、替换、删除    |
| 画板尺寸             | 根据原始画板推导 PPT 页面尺寸 | 不强制套默认 16:9     |
| 左对齐、居中、右对齐       | 映射为对应的 PPT 段落对齐方式 | 保持原始阅读关系        |
| 复杂图形效果           | 作为视觉图层保留          | 视觉优先，必要时人工检查    |

注意：PNG 图层指的是独立图片对象，不代表 PNG 内部像素会变成可编辑矢量。

---

## 工作方式

1. 在 Illustrator 中打开目标 `.ai` 文件，并确认它是当前活动文档。
2. 选择需要导出的画板序号。第一张画板为 `0`。
3. 运行 `scripts/export_artboard.jsx`。
4. 非文字对象按原始对象导出为透明 PNG 图层。
5. 文字单独导出字体、字号、颜色、位置、换行与对齐信息。
6. 使用 `scripts/build_pptx.py` 生成 `.pptx`。
7. 使用 `scripts/verify_pptx.py` 做结构校验。
8. 在 PowerPoint 或 WPS 中人工检查字体、换行、层级和视觉一致性。

---

## 快速使用

### 1. 准备源文件

* 打开 Adobe Illustrator `.ai` 文件；
* 确认目标文件处于当前活动状态；
* 确认需要的字体已经安装；
* 确认要转换的画板序号。

### 2. 导出 Illustrator 画板

编辑 `scripts/export_artboard.jsx` 顶部参数：

```jsx
ARTBOARD_INDEX = 0;
OUT_DIR = "your/export/path";
```

然后在 Illustrator 中执行该 JSX 脚本。

### 3. 生成 PPTX

```powershell
python scripts/build_pptx.py --manifest <导出目录>/manifest.json --out <输出文件>.pptx
```

### 4. 校验输出结果

```powershell
python scripts/verify_pptx.py <输出文件>.pptx --manifest <导出目录>/manifest.json --show-fonts
```

---

## 验收标准

输出 PPT 不应只是“一张能打开的画面”。

至少应检查：

* PPT 页面尺寸是否与 Illustrator 画板一致；
* 非文字元素是否保留为多个独立 PNG 图层，而不是整页截图；
* 可读取的 Illustrator 文本是否已重建为 PowerPoint 文本框；
* 文字是否可以在 PowerPoint/WPS 中直接编辑；
* 左对齐、居中、右对齐是否与原稿一致；
* 字体、字号、颜色、换行和层级是否经过人工抽样确认；
* 文本框是否无填充、无描边、无发光、无模糊，并正常自动换行；
* 复杂字体、特殊效果和个别换行是否已人工检查。

更详细的工作流和问题处理方式见：

* [workflow.md](references/workflow.md)
* [pitfalls.md](references/pitfalls.md)
* [user-checklist.md](references/user-checklist.md)

---

## 已知限制

* 该 skill 面向 Adobe Illustrator `.ai` 源文件，不是通用 PDF 转 PPT 工具。
* 已转曲的文字不会自动恢复为可编辑文本，只能作为视觉图层保留。
* 缺失字体可能导致 PPT/WPS 出现字体替换、换行变化或视觉偏差。
* 复杂透明效果、混合模式、滤镜、特殊描边和部分文字效果，可能无法完整映射为 PowerPoint 原生对象。
* 当前版本经过 Windows 环境下的 Illustrator、PowerPoint/WPS 测试；不同版本的软件仍可能存在渲染差异。
* 输出后必须进行人工检查，不建议未经验证直接交付客户。

---

## 示例与隐私

本仓库不包含任何客户 `.ai`、`.pdf`、`.pptx`、品牌素材、商业字体或未授权图片。

`assets/demo/` 中的示例仅应使用自制、脱敏或明确获得公开授权的素材。

发布或提交前，请确认：

* 不包含客户项目名称、Logo、截图或数据；
* 不包含字体文件；
* 不包含导出缓存、临时 PNG、日志、`.env`、Token 或密钥；
* 不包含本机绝对路径和私人目录名称。

---

## License

MIT License. See [LICENSE](LICENSE).
