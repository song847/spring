const axios = require('axios');

function generateMockResults(query) {
  const mockData = [
    {
      title: `关于「${query}」的搜索结果 - 百度百科`,
      url: `https://baike.baidu.com/item/${encodeURIComponent(query)}`,
      description: `「${query}」是一个常见的搜索关键词。在这里您可以了解到关于${query}的详细信息，包括定义、特点、相关知识等内容。`
    },
    {
      title: `${query} - 维基百科，自由的百科全书`,
      url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      description: `维基百科关于${query}的条目，提供全面、中立的信息介绍。`
    },
    {
      title: `${query} - 知乎`,
      url: `https://www.zhihu.com/search?q=${encodeURIComponent(query)}`,
      description: `知乎上关于${query}的讨论和问答，汇聚了众多网友的见解和经验分享。`
    },
    {
      title: `${query} - 百度搜索`,
      url: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
      description: `在百度上搜索「${query}」，获取更多相关信息和资源。`
    },
    {
      title: `${query} - 搜狗搜索`,
      url: `https://www.sogou.com/web?query=${encodeURIComponent(query)}`,
      description: `搜狗搜索为您提供关于${query}的最新资讯和相关内容。`
    }
  ];
  return mockData;
}

async function webSearch(req, res) {
  const { query } = req.query;
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ success: false, error: '请输入搜索关键词' });
  }

  const startTime = Date.now();

  const formattedResults = generateMockResults(query);
  
  res.json({
    success: true,
    query,
    results: formattedResults,
    total: formattedResults.length,
    source: 'Direct',
    latency: Date.now() - startTime,
    note: '点击搜索结果链接可跳转到外部搜索引擎获取更多信息'
  });
}

module.exports = { webSearch };
