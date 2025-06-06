addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
  });

  async function handleRequest(request) {
  const url = 'https://raw.githubusercontent.com/EhTagTranslation/DatabaseReleases/refs/heads/master/db.text.json';
  const kvKey = 'tag'; // KV 存储的键

  // 尝试从 KV 中获取数据
  let processedContent = await tag.get(kvKey);

  // 如果 KV 中没有数据，则从 URL 获取并处理数据
  if (!processedContent) {
  const response = await fetch(url);
  const content = await response.text();

  // 进行文本处理
  processedContent = content
  .replace(/^.+(.{85}"parody")/, '$1')
  .replace(/\{"namespace":"([^"]+).*?"data"../g, '"$1,')
  .replace(/,"intro":"[^"]*","links":"[^"]*"/g, '')
  .replace(/..\{"name":"([^"]+)"\}/g, '│$1')
  .replace(/,"/g, '\n')
  .replace(/..\{"name":"(.+?).\n.+\n.+/g, '│$1')
  .replace(/\\/g, '')
  .replace(/(\}|])\}/g, '');

  // 将处理后的数据存储到 KV 中，设置过期时间为一周
  await tag.put(kvKey, processedContent, { expirationTtl: 604800 });
  }

  // 返回处理后的内容
  return new Response(processedContent, {
  headers: {
  'Content-Type': 'text/plain'
  }
  });
  }