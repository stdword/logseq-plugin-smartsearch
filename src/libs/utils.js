export async function parseContent(content) {
  // Remove properties.
  content = content.replace(/^.+:: .+$/gm, "").trim()

  // Replace block refs with their content.
  let match
  while ((match = /(?:\(\()(?!\()([^\)]+)\)\)/g.exec(content)) != null) {
    const start = match.index
    const end = start + match[0].length
    const refUUID = match[1]
    try {
      const refBlock = await logseq.Editor.getBlock(refUUID)
      if (refBlock == null) break
      const refFirstLine = refBlock.content.match(/.*/)[0]
      const refContent = await parseContent(refFirstLine)
      content = `${content.substring(0, start)}${refContent}${content.substring(
        end,
      )}`
    } catch (err) {
      // ignore err
      break
    }
  }

  return content.trim()
}

export async function persistBlockUUID(block) {
  if (block.properties?.id == null) {
    const content = (await logseq.Editor.getBlock(block.uuid)).content
    await logseq.Editor.updateBlock(
      block.uuid,
      `${content}\nid:: ${block.uuid}`,
    )
  }
}
