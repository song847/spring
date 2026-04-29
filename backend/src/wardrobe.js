const fs = require('fs');
const path = require('path');
const JimpModule = require('jimp');
const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;
const { intToRGBA, rgbaToInt } = JimpModule;

const WARDROBE_DIR = path.join(__dirname, '../uploads/wardrobe');

if (!fs.existsSync(WARDROBE_DIR)) {
  fs.mkdirSync(WARDROBE_DIR, { recursive: true });
}

const categories = ['上衣', '下装', '鞋子', '连衣裙'];
const subCategories = {
  '上衣': ['短袖', '长袖', '卫衣', '毛衣', '外套', '衬衫', 'T恤', '夹克', '针织衫', '吊带', '背心', '风衣', '羽绒服', '西装', 'POLO衫', '开衫', '牛仔外套'],
  '下装': ['长裤', '短裤', '裙子', '牛仔裤', '运动裤', '阔腿裤', '紧身裤', '半身裙', '百褶裙', 'A字裙', '工装裤', '休闲裤', '西装裤', '牛仔裙'],
  '鞋子': ['运动鞋', '休闲鞋', '高跟鞋', '靴子', '凉鞋', '拖鞋', '板鞋', '马丁靴', '皮鞋', '帆布鞋'],
  '连衣裙': ['短裙', '长裙', '吊带裙', '连衣裙', '衬衫裙', '针织裙', '西装裙', '碎花裙', '雪纺裙', '牛仔裙']
};

const colors = ['黑色', '白色', '灰色', '蓝色', '红色', '粉色', '绿色', '黄色', '紫色', '棕色', '米色', '橙色', '青色', '金色', '银色', '驼色', '藏蓝', '酒红', '墨绿', '其他'];

const styles = ['休闲', '正式', '运动', '甜美', '复古', '街头', '优雅', '简约', '日系', '韩系', '欧美', '可爱'];

const occasions = ['日常', '工作', '约会', '运动', '派对', '旅行', '商务', '婚礼', '校园'];

const colorDefinitions = {
  black: { name: '黑色', hRange: [350, 360], sRange: [0, 100], vRange: [0, 30] },
  white: { name: '白色', hRange: [0, 360], sRange: [0, 30], vRange: [90, 100] },
  gray: { name: '灰色', hRange: [0, 360], sRange: [0, 40], vRange: [30, 85] },
  blue: { name: '蓝色', hRange: [180, 250], sRange: [40, 100], vRange: [30, 90] },
  red: { name: '红色', hRange: [0, 15], sRange: [50, 100], vRange: [40, 95] },
  pink: { name: '粉色', hRange: [330, 360], sRange: [30, 70], vRange: [60, 95] },
  green: { name: '绿色', hRange: [100, 160], sRange: [30, 100], vRange: [30, 90] },
  yellow: { name: '黄色', hRange: [40, 60], sRange: [50, 100], vRange: [60, 95] },
  purple: { name: '紫色', hRange: [250, 320], sRange: [30, 100], vRange: [30, 90] },
  brown: { name: '棕色', hRange: [15, 40], sRange: [30, 80], vRange: [20, 70] },
  beige: { name: '米色', hRange: [25, 50], sRange: [10, 40], vRange: [70, 95] },
  orange: { name: '橙色', hRange: [20, 40], sRange: [50, 100], vRange: [50, 95] },
  cyan: { name: '青色', hRange: [160, 180], sRange: [40, 100], vRange: [40, 95] },
  gold: { name: '金色', hRange: [40, 55], sRange: [60, 100], vRange: [70, 95] },
  silver: { name: '银色', hRange: [0, 360], sRange: [0, 25], vRange: [75, 95] },
  camel: { name: '驼色', hRange: [25, 40], sRange: [25, 50], vRange: [55, 80] },
  navy: { name: '藏蓝', hRange: [210, 230], sRange: [70, 100], vRange: [20, 50] },
  wine: { name: '酒红', hRange: [340, 360], sRange: [40, 70], vRange: [25, 55] },
  darkgreen: { name: '墨绿', hRange: [120, 150], sRange: [50, 80], vRange: [20, 50] },
  other: { name: '其他', hRange: [0, 360], sRange: [0, 100], vRange: [0, 100] }
};

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function rgbToLab(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const fx = X > 0.008856 ? Math.pow(X, 1/3) : 7.787 * X + 16/116;
  const fy = Y > 0.008856 ? Math.pow(Y, 1/3) : 7.787 * Y + 16/116;
  const fz = Z > 0.008856 ? Math.pow(Z, 1/3) : 7.787 * Z + 16/116;
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function classifyColorByHsv(h, s, v) {
  if (v < 20) return 'black';
  if (v > 92 && s < 12) return 'white';
  if (s < 12 && v >= 30 && v <= 88) return 'gray';
  
  if (h >= 180 && h <= 250 && s >= 35) {
    if (v < 35 && s >= 70) return 'navy';
    return 'blue';
  }
  
  if ((h >= 0 && h <= 15) || (h >= 340 && h <= 360)) {
    if (s >= 45) {
      if (v > 65) return 'pink';
      if (v >= 25 && v <= 55 && s >= 40 && s <= 70) return 'wine';
      return 'red';
    } else if (s >= 20 && v > 70) {
      return 'pink';
    }
  }
  
  if (h >= 100 && h <= 160 && s >= 25) {
    if (v >= 20 && v <= 50 && s >= 50 && s <= 80) return 'darkgreen';
    return 'green';
  }
  
  if (h >= 40 && h <= 60 && s >= 45) {
    if (v >= 70 && s >= 60) return 'gold';
    return 'yellow';
  }
  
  if (h >= 250 && h <= 320 && s >= 25) return 'purple';
  
  if (h >= 15 && h <= 45) {
    if (s >= 30 && v <= 65) return 'brown';
    if (s >= 10 && s <= 35 && v >= 70) return 'beige';
    if (s >= 25 && s <= 50 && v >= 55 && v <= 80) return 'camel';
    if (s >= 45) return 'orange';
  }
  
  if (h >= 160 && h <= 180 && s >= 35) return 'cyan';
  
  if (s < 20 && v >= 72) return 'gray';
  
  if (h >= 210 && h <= 230 && s >= 65 && v <= 45) return 'navy';
  
  if ((h >= 340 && h <= 360) && s >= 40 && s <= 70 && v >= 25 && v <= 55) return 'wine';
  
  if (h >= 120 && h <= 150 && s >= 45 && s <= 80 && v >= 20 && v <= 50) return 'darkgreen';
  
  return 'other';
}

function findNearestColor(r, g, b) {
  const lab = rgbToLab(r, g, b);
  let minDist = Infinity;
  let nearest = 'other';
  
  for (const [key, color] of Object.entries(colorDefinitions)) {
    if (key === 'other') continue;
    const sampleRgb = getSampleRgb(key);
    const sampleLab = rgbToLab(sampleRgb.r, sampleRgb.g, sampleRgb.b);
    const dist = Math.sqrt(
      Math.pow(lab.L - sampleLab.L, 2) +
      Math.pow(lab.a - sampleLab.a, 2) +
      Math.pow(lab.b - sampleLab.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = key;
    }
  }
  
  return colorDefinitions[nearest]?.name || '其他';
}

function getSampleRgb(colorName) {
  const samples = {
    black: { r: 20, g: 20, b: 20 },
    white: { r: 255, g: 255, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    blue: { r: 30, g: 144, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    pink: { r: 255, g: 182, b: 193 },
    green: { r: 0, g: 128, b: 0 },
    yellow: { r: 255, g: 255, b: 0 },
    purple: { r: 128, g: 0, b: 128 },
    brown: { r: 139, g: 69, b: 19 },
    beige: { r: 245, g: 222, b: 179 },
    orange: { r: 255, g: 165, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    gold: { r: 255, g: 215, b: 0 },
    silver: { r: 192, g: 192, b: 192 },
    camel: { r: 193, g: 154, b: 107 },
    navy: { r: 0, g: 0, b: 128 },
    wine: { r: 128, g: 0, b: 0 },
    darkgreen: { r: 0, g: 100, b: 0 }
  };
  return samples[colorName] || { r: 128, g: 128, b: 128 };
}

function applyAdaptiveGaussianBlur(image, width, height) {
  let noiseLevel = estimateNoiseLevel(image, width, height);
  let blurRadius = Math.max(1, Math.floor(noiseLevel / 15));
  return image.blur(blurRadius);
}

function estimateNoiseLevel(image, width, height) {
  let noiseSum = 0;
  let count = 0;
  
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const rightPixel = x < width - 1 ? intToRGBA(image.getPixelColor(x + 1, y)) : pixel;
      const downPixel = y < height - 1 ? intToRGBA(image.getPixelColor(x, y + 1)) : pixel;
      
      const diffRight = Math.abs(pixel.r - rightPixel.r) + Math.abs(pixel.g - rightPixel.g) + Math.abs(pixel.b - rightPixel.b);
      const diffDown = Math.abs(pixel.r - downPixel.r) + Math.abs(pixel.g - downPixel.g) + Math.abs(pixel.b - downPixel.b);
      
      noiseSum += diffRight + diffDown;
      count += 2;
    }
  }
  
  return count > 0 ? noiseSum / count : 0;
}

function correctBacklight(image, width, height) {
  let darkPixelCount = 0;
  let brightPixelCount = 0;
  let totalPixels = 0;
  
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      if (brightness < 30) darkPixelCount++;
      else if (brightness > 230) brightPixelCount++;
      totalPixels++;
    }
  }
  
  const darkRatio = darkPixelCount / totalPixels;
  const brightRatio = brightPixelCount / totalPixels;
  
  if (darkRatio > 0.4) {
    return image.brightness(0.3);
  } else if (brightRatio > 0.3) {
    return image.brightness(-0.2).contrast(0.2);
  }
  
  return image;
}

function enhanceContrastMultiScale(image, width, height) {
  return image.contrast(0.15);
}

function applyGammaCorrection(image, width, height, gamma) {
  if (typeof image.gamma === 'function') {
    return image.gamma(gamma);
  } else {
    return image.brightness(gamma - 1);
  }
}

function preprocessImage(image, width, height) {
  let result = applyAdaptiveGaussianBlur(image, width, height);
  result = correctBacklight(result, width, height);
  result = enhanceContrastMultiScale(result, width, height);
  
  let avgBrightness = 0;
  let count = 0;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const pixel = intToRGBA(result.getPixelColor(x, y));
      avgBrightness += (pixel.r * 299 + pixel.g * 587 + pixel.b * 114) / 1000;
      count++;
    }
  }
  avgBrightness /= count;
  
  if (avgBrightness < 50) {
    result = applyGammaCorrection(result, width, height, 0.7);
  } else if (avgBrightness > 200) {
    result = applyGammaCorrection(result, width, height, 1.3);
  }
  
  return result;
}

function extractClothingRegion(image, width, height) {
  const mask = createClothingMask(image, width, height);
  const pixels = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y][x] > 0) {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        pixels.push({ r: pixel.r, g: pixel.g, b: pixel.b });
      }
    }
  }
  
  if (pixels.length < 100) {
    for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y++) {
      for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        const brightness = (pixel.r + pixel.g + pixel.b) / 3;
        if (brightness > 15 && brightness < 240) {
          pixels.push({ r: pixel.r, g: pixel.g, b: pixel.b });
        }
      }
    }
  }
  
  return pixels;
}

function createClothingMask(image, width, height) {
  const mask = Array(height).fill(null).map(() => Array(width).fill(0));
  
  const edgeThreshold = 40;
  const minRegionSize = 500;
  
  let edgeImage = Array(height).fill(null).map(() => Array(width).fill(0));
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const left = intToRGBA(image.getPixelColor(x - 1, y));
      const right = intToRGBA(image.getPixelColor(x + 1, y));
      const up = intToRGBA(image.getPixelColor(x, y - 1));
      const down = intToRGBA(image.getPixelColor(x, y + 1));
      
      const dx = Math.abs(pixel.r - left.r) + Math.abs(pixel.g - left.g) + Math.abs(pixel.b - left.b) +
                Math.abs(pixel.r - right.r) + Math.abs(pixel.g - right.g) + Math.abs(pixel.b - right.b);
      const dy = Math.abs(pixel.r - up.r) + Math.abs(pixel.g - up.g) + Math.abs(pixel.b - up.b) +
                Math.abs(pixel.r - down.r) + Math.abs(pixel.g - down.g) + Math.abs(pixel.b - down.b);
      
      edgeImage[y][x] = (dx + dy) > edgeThreshold ? 1 : 0;
    }
  }
  
  const visited = Array(height).fill(null).map(() => Array(width).fill(false));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y][x] && edgeImage[y][x] === 0) {
        const region = [];
        const queue = [{ x, y }];
        
        while (queue.length > 0) {
          const { x: cx, y: cy } = queue.shift();
          if (cx < 0 || cx >= width || cy < 0 || cy >= height || visited[cy][cx] || edgeImage[cy][cx] === 1) continue;
          
          visited[cy][cx] = true;
          region.push({ x: cx, y: cy });
          
          queue.push({ x: cx - 1, y: cy });
          queue.push({ x: cx + 1, y: cy });
          queue.push({ x: cx, y: cy - 1 });
          queue.push({ x: cx, y: cy + 1 });
        }
        
        if (region.length > minRegionSize && region.length < width * height * 0.95) {
          for (const { x: rx, y: ry } of region) {
            mask[ry][rx] = 1;
          }
        }
      }
    }
  }
  
  for (let y = Math.floor(height * 0.05); y < Math.floor(height * 0.95); y++) {
    for (let x = Math.floor(width * 0.05); x < Math.floor(width * 0.95); x++) {
      if (mask[y][x] === 1) {
        let count = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && mask[ny][nx] === 1) {
              count++;
            }
          }
        }
        if (count > 10) {
          mask[y][x] = 2;
        }
      }
    }
  }
  
  return mask;
}

function detectPrintPattern(pixels) {
  if (!pixels || pixels.length < 100) {
    return { hasPattern: false, patternType: '纯色', patternDensity: 0 };
  }
  
  let colorVariance = 0;
  let colorCount = {};
  
  for (const pixel of pixels) {
    const key = `${pixel.r},${pixel.g},${pixel.b}`;
    colorCount[key] = (colorCount[key] || 0) + 1;
  }
  
  const avgCount = pixels.length / Object.keys(colorCount).length;
  
  if (Object.keys(colorCount).length > pixels.length * 0.15) {
    const sortedColors = Object.values(colorCount).sort((a, b) => b - a);
    const topColors = sortedColors.slice(0, 5);
    const topRatio = topColors.reduce((a, b) => a + b, 0) / pixels.length;
    
    if (topRatio < 0.6) {
      const stripeScore = detectStripes(pixels, pixels.length);
      const checkScore = detectCheckPattern(pixels, pixels.length);
      
      if (stripeScore > 0.7) {
        return { hasPattern: true, patternType: '条纹', patternDensity: stripeScore };
      } else if (checkScore > 0.6) {
        return { hasPattern: true, patternType: '格子', patternDensity: checkScore };
      } else {
        return { hasPattern: true, patternType: '印花', patternDensity: 0.7 };
      }
    } else if (Object.keys(colorCount).length > pixels.length * 0.08) {
      return { hasPattern: true, patternType: '拼色', patternDensity: 0.5 };
    }
  }
  
  return { hasPattern: false, patternType: '纯色', patternDensity: 0 };
}

function detectStripes(pixels, totalPixels) {
  let transitions = 0;
  const sortedPixels = [...pixels].sort((a, b) => {
    const lumA = (a.r + a.g + a.b) / 3;
    const lumB = (b.r + b.g + b.b) / 3;
    return lumA - lumB;
  });
  
  for (let i = 1; i < sortedPixels.length; i++) {
    const lum1 = (sortedPixels[i - 1].r + sortedPixels[i - 1].g + sortedPixels[i - 1].b) / 3;
    const lum2 = (sortedPixels[i].r + sortedPixels[i].g + sortedPixels[i].b) / 3;
    if (Math.abs(lum1 - lum2) > 30) transitions++;
  }
  
  return Math.min(1, transitions / (totalPixels * 0.02));
}

function detectCheckPattern(pixels, totalPixels) {
  const colorGroups = {};
  
  for (const pixel of pixels) {
    const key = `${Math.round(pixel.r / 32)},${Math.round(pixel.g / 32)},${Math.round(pixel.b / 32)}`;
    colorGroups[key] = (colorGroups[key] || 0) + 1;
  }
  
  const groupCounts = Object.values(colorGroups).sort((a, b) => b - a);
  if (groupCounts.length >= 2 && groupCounts.length <= 6) {
    const ratio = groupCounts[0] / groupCounts[1];
    if (ratio > 0.5 && ratio < 2) {
      return 0.7;
    }
  }
  
  return 0;
}

function analyzeColors(pixels) {
  if (!pixels || pixels.length === 0) {
    return { mainColor: '其他', secondaryColors: [], accentColors: [], hasPattern: false, patternType: '纯色', patternDensity: 0 };
  }
  
  const patternInfo = detectPrintPattern(pixels);
  
  const clusters = [];
  const clusterCount = Math.min(12, Math.floor(pixels.length / 30));
  
  if (pixels.length >= clusterCount) {
    const shuffled = [...pixels].sort(() => Math.random() - 0.5);
    let centroids = shuffled.slice(0, clusterCount);
    let clusterGroups = Array(clusterCount).fill(null).map(() => []);
    
    for (let iteration = 0; iteration < 20; iteration++) {
      clusterGroups = Array(clusterCount).fill(null).map(() => []);
      
      for (const pixel of pixels) {
        let minDist = Infinity;
        let idx = 0;
        for (let i = 0; i < centroids.length; i++) {
          const dist = Math.sqrt(
            Math.pow(pixel.r - centroids[i].r, 2) +
            Math.pow(pixel.g - centroids[i].g, 2) +
            Math.pow(pixel.b - centroids[i].b, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            idx = i;
          }
        }
        clusterGroups[idx].push(pixel);
      }
      
      let changed = false;
      for (let i = 0; i < centroids.length; i++) {
        if (clusterGroups[i].length === 0) continue;
        const newR = Math.round(clusterGroups[i].reduce((sum, p) => sum + p.r, 0) / clusterGroups[i].length);
        const newG = Math.round(clusterGroups[i].reduce((sum, p) => sum + p.g, 0) / clusterGroups[i].length);
        const newB = Math.round(clusterGroups[i].reduce((sum, p) => sum + p.b, 0) / clusterGroups[i].length);
        
        if (Math.abs(centroids[i].r - newR) + Math.abs(centroids[i].g - newG) + Math.abs(centroids[i].b - newB) > 1) {
          centroids[i] = { r: newR, g: newG, b: newB };
          changed = true;
        }
      }
      
      if (!changed) break;
    }
    
    clusters.push(...clusterGroups.map((group, index) => ({
      color: centroids[index],
      count: group.length,
      pixels: group
    })));
  }
  
  clusters.sort((a, b) => b.count - a.count);
  
  let mainColor = 'other';
  let maxConfidence = 0;
  
  for (const cluster of clusters) {
    if (cluster.count < pixels.length * 0.015) continue;
    
    const { h, s, v } = rgbToHsv(cluster.color.r, cluster.color.g, cluster.color.b);
    const colorName = classifyColorByHsv(h, s, v);
    
    if (colorName !== 'other') {
      const saturationBonus = s > 15 ? (s > 40 ? 1.4 : 1.15) : 1;
      const brightnessPenalty = (v < 15 || v > 90) ? 0.7 : 1;
      const confidence = (cluster.count / pixels.length) * saturationBonus * brightnessPenalty;
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        mainColor = colorName;
      }
    }
  }
  
  if (mainColor === 'other' && clusters.length > 0) {
    mainColor = findNearestColor(clusters[0].color.r, clusters[0].color.g, clusters[0].color.b);
    if (typeof mainColor === 'string' && !colorDefinitions[mainColor]) {
      mainColor = 'other';
    }
  }
  
  const secondaryColors = [];
  const accentColors = [];
  
  for (let i = 1; i < Math.min(5, clusters.length); i++) {
    const cluster = clusters[i];
    if (cluster.count > pixels.length * 0.05) {
      const { h, s, v } = rgbToHsv(cluster.color.r, cluster.color.g, cluster.color.b);
      let colorName = classifyColorByHsv(h, s, v);
      if (colorName === 'other') {
        colorName = findNearestColor(cluster.color.r, cluster.color.g, cluster.color.b);
      }
      const mainColorName = typeof mainColor === 'string' ? colorDefinitions[mainColor]?.name || mainColor : '其他';
      const colorNameValue = typeof colorName === 'string' ? colorDefinitions[colorName]?.name || colorName : colorName;
      if (colorNameValue !== mainColorName && !secondaryColors.includes(colorNameValue)) {
        if (cluster.count > pixels.length * 0.12) {
          secondaryColors.push(colorNameValue);
        } else {
          accentColors.push(colorNameValue);
        }
      }
    }
  }
  
  const finalMainColor = typeof mainColor === 'string' ? colorDefinitions[mainColor]?.name || mainColor : '其他';
  
  return {
    mainColor: finalMainColor,
    secondaryColors,
    accentColors,
    hasPattern: patternInfo.hasPattern,
    patternType: patternInfo.patternType,
    patternDensity: patternInfo.patternDensity
  };
}

function detectClothingFeatures(image) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  const features = {
    aspectRatio: width / height,
    neckline: '未知',
    sleeve: '未知',
    fit: '常规',
    length: '常规',
    closure: '套头',
    hasHood: false,
    hasPockets: false,
    hasButtons: false,
    fabricType: '棉质'
  };
  
  features.hasHood = detectHood(image, width, height);
  features.hasPockets = detectPockets(image, width, height);
  features.hasButtons = detectButtons(image, width, height);
  features.fabricType = detectFabric(image, width, height);
  
  const sleeveAnalysis = analyzeSleeves(image, width, height);
  features.sleeve = sleeveAnalysis;
  
  const fitScore = analyzeFit(image, width, height);
  features.fit = fitScore;
  
  if (features.aspectRatio < 0.55) {
    features.length = '长款';
  } else if (features.aspectRatio > 1.3) {
    features.length = '短款';
  } else if (features.aspectRatio > 1.0 && features.aspectRatio <= 1.3) {
    features.length = '短款';
  } else {
    features.length = '常规';
  }
  
  features.neckline = detectNeckline(image, width, height);
  
  return features;
}

function detectHood(image, width, height) {
  const topRegion = Math.floor(height * 0.12);
  let hoodScore = 0;
  let sampleCount = 0;
  
  for (let y = 0; y < topRegion; y++) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      if (brightness > 30 && brightness < 220) {
        hoodScore++;
      }
      sampleCount++;
    }
  }
  
  return hoodScore / sampleCount > 0.3;
}

function detectPockets(image, width, height) {
  const lowerRegion = Math.floor(height * 0.6);
  let pocketScore = 0;
  
  for (let y = lowerRegion; y < height; y++) {
    for (let x = Math.floor(width * 0.15); x < Math.floor(width * 0.85); x++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const rightPixel = x < width - 10 ? intToRGBA(image.getPixelColor(x + 10, y)) : pixel;
      const diff = Math.abs(pixel.r - rightPixel.r) + Math.abs(pixel.g - rightPixel.g) + Math.abs(pixel.b - rightPixel.b);
      if (diff > 80) pocketScore++;
    }
  }
  
  return pocketScore > height * width * 0.002;
}

function detectButtons(image, width, height) {
  let buttonCount = 0;
  
  for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.7); y++) {
    for (let x = Math.floor(width * 0.45); x < Math.floor(width * 0.55); x++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      if (brightness > 50 && brightness < 200) {
        let isButton = true;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const npixel = intToRGBA(image.getPixelColor(nx, ny));
              const nbrightness = (npixel.r + npixel.g + npixel.b) / 3;
              if (Math.abs(brightness - nbrightness) > 40) {
                isButton = false;
                break;
              }
            }
          }
          if (!isButton) break;
        }
        if (isButton) buttonCount++;
      }
    }
  }
  
  return buttonCount > 3;
}

function detectFabric(image, width, height) {
  let denimScore = 0;
  let knitScore = 0;
  let cottonScore = 0;
  let silkScore = 0;
  let woolScore = 0;
  
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      const saturation = rgbToHsv(pixel.r, pixel.g, pixel.b).s;
      
      if (pixel.b > pixel.r + 20 && pixel.b > pixel.g + 20 && saturation > 20) {
        denimScore++;
      } else if (saturation < 25 && brightness > 50 && brightness < 200) {
        knitScore++;
      } else if (brightness > 100 && saturation < 30) {
        cottonScore++;
      } else if (brightness > 150 && saturation < 20) {
        silkScore++;
      } else if (brightness < 100 && saturation < 30) {
        woolScore++;
      }
    }
  }
  
  const maxScore = Math.max(denimScore, knitScore, cottonScore, silkScore, woolScore);
  if (denimScore === maxScore && denimScore > 0) return '牛仔';
  if (knitScore === maxScore && knitScore > 0) return '针织';
  if (silkScore === maxScore && silkScore > 0) return '丝绸';
  if (woolScore === maxScore && woolScore > 0) return '羊毛';
  return '棉质';
}

function analyzeSleeves(image, width, height) {
  const armRegions = [
    { startX: 0, endX: Math.floor(width * 0.15) },
    { startX: Math.floor(width * 0.85), endX: width }
  ];
  
  let hasLeftSleeve = false;
  let hasRightSleeve = false;
  let sleeveLengthLeft = 0;
  let sleeveLengthRight = 0;
  
  for (const region of armRegions) {
    let pixelCount = 0;
    let darkPixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = region.startX; x < region.endX; x++) {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        const brightness = (pixel.r + pixel.g + pixel.b) / 3;
        if (brightness < 200) {
          darkPixelCount++;
        }
        pixelCount++;
      }
    }
    
    const darkRatio = darkPixelCount / pixelCount;
    if (darkRatio > 0.1) {
      if (region.startX === 0) {
        hasLeftSleeve = true;
        sleeveLengthLeft = darkPixelCount;
      } else {
        hasRightSleeve = true;
        sleeveLengthRight = darkPixelCount;
      }
    }
  }
  
  if (!hasLeftSleeve && !hasRightSleeve) {
    return '无袖';
  }
  
  const avgSleeveLength = (sleeveLengthLeft + sleeveLengthRight) / 2;
  const expectedFullLength = width * height * 0.15;
  
  if (avgSleeveLength < expectedFullLength * 0.3) {
    return '短袖';
  } else if (avgSleeveLength < expectedFullLength * 0.7) {
    return '七分袖';
  } else {
    return '长袖';
  }
}

function analyzeFit(image, width, height) {
  const verticalSamples = [];
  
  for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x += Math.floor(width * 0.1)) {
    let minY = height;
    let maxY = 0;
    
    for (let y = 0; y < height; y++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      if (brightness < 200) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    
    verticalSamples.push(maxY - minY);
  }
  
  const avgHeight = verticalSamples.reduce((a, b) => a + b, 0) / verticalSamples.length;
  const aspectRatio = width / height;
  
  if (aspectRatio > 1.3 && avgHeight < height * 0.6) {
    return '修身';
  } else if (aspectRatio < 0.7 && avgHeight > height * 0.8) {
    return '宽松';
  } else if (aspectRatio < 0.6) {
    return '宽松';
  } else if (aspectRatio > 1.5) {
    return '修身';
  } else {
    return '常规';
  }
}

function detectNeckline(image, width, height) {
  const topEdge = Math.floor(height * 0.15);
  let centerTopBrightness = 0;
  let edgeBrightness = 0;
  let centerCount = 0;
  let edgeCount = 0;
  
  for (let y = 0; y < topEdge; y++) {
    for (let x = Math.floor(width * 0.25); x < Math.floor(width * 0.75); x++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      
      if (x >= Math.floor(width * 0.45) && x <= Math.floor(width * 0.55)) {
        centerTopBrightness += brightness;
        centerCount++;
      } else {
        edgeBrightness += brightness;
        edgeCount++;
      }
    }
  }
  
  centerTopBrightness /= centerCount;
  edgeBrightness /= edgeCount;
  
  if (centerTopBrightness > edgeBrightness + 50) {
    return 'V领';
  } else if (centerTopBrightness > edgeBrightness + 20) {
    return '方领';
  } else if (edgeBrightness < 80) {
    return '高领';
  } else if (edgeBrightness < 120) {
    return '半高领';
  } else {
    return '圆领';
  }
}

function calculateTextureScore(image, width, height) {
  let textureScore = 0;
  let totalPixels = 0;
  
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const rightPixel = x < width - 1 ? intToRGBA(image.getPixelColor(x + 1, y)) : pixel;
      const downPixel = y < height - 1 ? intToRGBA(image.getPixelColor(x, y + 1)) : pixel;
      
      textureScore += Math.abs(pixel.r - rightPixel.r) + Math.abs(pixel.g - rightPixel.g) + Math.abs(pixel.b - rightPixel.b);
      textureScore += Math.abs(pixel.r - downPixel.r) + Math.abs(pixel.g - downPixel.g) + Math.abs(pixel.b - downPixel.b);
      totalPixels++;
    }
  }
  
  return totalPixels > 0 ? textureScore / (totalPixels * 765) : 0;
}

function isClothingImage(image) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  if (width < 50 || height < 50) return { isClothing: false, confidence: 0, reason: '图片尺寸过小' };
  
  let edgeCount = 0;
  let totalPixels = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  
  const step = Math.max(1, Math.floor(Math.min(width, height) / 25));
  
  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const leftPixel = intToRGBA(image.getPixelColor(Math.max(0, x - step), y));
      const upPixel = intToRGBA(image.getPixelColor(x, Math.max(0, y - step)));
      
      const diffX = Math.abs(pixel.r - leftPixel.r) + Math.abs(pixel.g - leftPixel.g) + Math.abs(pixel.b - leftPixel.b);
      const diffY = Math.abs(pixel.r - upPixel.r) + Math.abs(pixel.g - upPixel.g) + Math.abs(pixel.b - upPixel.b);
      
      if (diffX > 50 || diffY > 50) edgeCount++;
      
      const brightness = (pixel.r * 299 + pixel.g * 587 + pixel.b * 114) / 1000;
      if (brightness < 30) darkPixels++;
      else if (brightness > 230) brightPixels++;
      
      totalPixels++;
    }
  }
  
  const edgeDensity = edgeCount / totalPixels;
  const darkRatio = darkPixels / totalPixels;
  const brightRatio = brightPixels / totalPixels;
  
  let isClothing = true;
  let confidence = 0.5;
  let reason = '';
  
  const humanShapeScore = checkHumanShape(image, width, height);
  const clothingTextureScore = checkClothingTexture(image, width, height);
  const hasStraightEdges = checkStraightEdges(image, width, height);
  
  const combinedScore = (humanShapeScore * 0.4 + clothingTextureScore * 0.3 + hasStraightEdges * 0.3);
  
  if (edgeDensity < 0.02) {
    isClothing = false;
    confidence = 0.1;
    reason = '图像边缘特征不足';
  } else if (darkRatio > 0.85 || brightRatio > 0.85) {
    isClothing = false;
    confidence = 0.2;
    reason = '图像过暗或过曝';
  } else if (combinedScore < 0.2) {
    isClothing = false;
    confidence = 0.25;
    reason = '未检测到服装形状特征';
  }
  
  if (isClothing) {
    confidence = Math.min(1, 0.4 + edgeDensity * 0.4 + combinedScore * 0.2);
  }
  
  return { isClothing, confidence, reason };
}

function checkClothingTexture(image, width, height) {
  let textureScore = 0;
  let sampleCount = 0;
  
  const samplePoints = [
    { x: Math.floor(width * 0.2), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.5), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.8), y: Math.floor(height * 0.3) },
    { x: Math.floor(width * 0.2), y: Math.floor(height * 0.6) },
    { x: Math.floor(width * 0.5), y: Math.floor(height * 0.6) },
    { x: Math.floor(width * 0.8), y: Math.floor(height * 0.6) }
  ];
  
  for (const point of samplePoints) {
    if (point.x >= 0 && point.x < width && point.y >= 0 && point.y < height) {
      const pixel = intToRGBA(image.getPixelColor(point.x, point.y));
      const brightness = (pixel.r + pixel.g + pixel.b) / 3;
      
      if (brightness > 20 && brightness < 240) {
        textureScore++;
      }
      sampleCount++;
    }
  }
  
  return sampleCount > 0 ? textureScore / sampleCount : 0.5;
}

function checkStraightEdges(image, width, height) {
  let verticalEdges = 0;
  let horizontalEdges = 0;
  let checkedCount = 0;
  
  for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.8); y += Math.floor(height / 20)) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x += Math.floor(width / 20)) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const rightPixel = x < width - 1 ? intToRGBA(image.getPixelColor(x + 1, y)) : pixel;
      const downPixel = y < height - 1 ? intToRGBA(image.getPixelColor(x, y + 1)) : pixel;
      
      const hDiff = Math.abs(pixel.r - rightPixel.r) + Math.abs(pixel.g - rightPixel.g) + Math.abs(pixel.b - rightPixel.b);
      const vDiff = Math.abs(pixel.r - downPixel.r) + Math.abs(pixel.g - downPixel.g) + Math.abs(pixel.b - downPixel.b);
      
      if (hDiff > 80) horizontalEdges++;
      if (vDiff > 80) verticalEdges++;
      checkedCount++;
    }
  }
  
  const edgeRatio = (verticalEdges + horizontalEdges) / (checkedCount * 2);
  return edgeRatio > 0.02 ? 1 : 0;
}

function checkHumanShape(image, width, height) {
  const centerX = Math.floor(width / 2);
  const topThird = Math.floor(height / 3);
  const bottomThird = Math.floor(height * 2 / 3);
  
  let topBrightness = 0;
  let bottomBrightness = 0;
  let centerBrightness = 0;
  let topCount = 0;
  let bottomCount = 0;
  let centerCount = 0;
  
  for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
    for (let y = 0; y < topThird; y++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      topBrightness += (pixel.r + pixel.g + pixel.b) / 3;
      topCount++;
    }
    for (let y = bottomThird; y < height; y++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      bottomBrightness += (pixel.r + pixel.g + pixel.b) / 3;
      bottomCount++;
    }
    for (let y = topThird; y < bottomThird; y++) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      centerBrightness += (pixel.r + pixel.g + pixel.b) / 3;
      centerCount++;
    }
  }
  
  if (topCount > 0) topBrightness /= topCount;
  if (bottomCount > 0) bottomBrightness /= bottomCount;
  if (centerCount > 0) centerBrightness /= centerCount;
  
  const hasShape = Math.abs(topBrightness - centerBrightness) > 20 || 
                   Math.abs(bottomBrightness - centerBrightness) > 20;
  
  return hasShape;
}

function detectClothingType(image, colorAnalysis) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const aspectRatio = width / height;
  
  const features = detectClothingFeatures(image);
  const shapeFeatures = analyzeClothingShape(image, width, height);
  
  let category = '上衣';
  let subCategory = 'T恤';
  
  const isWorn = checkIfWorn(image, width, height);
  
  if (!isWorn) {
    const staticType = classifyStaticClothing(image, width, height, features);
    category = staticType.category;
    subCategory = staticType.subCategory;
  } else {
    if (aspectRatio < 0.6) {
      if (shapeFeatures.hasDressShape) {
        category = '连衣裙';
        subCategory = height < width * 1.6 ? '短裙' : '长裙';
      } else if (shapeFeatures.hasSkirtShape) {
        category = '下装';
        subCategory = '半身裙';
      } else {
        category = '连衣裙';
        subCategory = '长裙';
      }
    } else if (aspectRatio < 0.85 && height > width * 1.1) {
      if (shapeFeatures.hasSkirtShape) {
        category = '下装';
        subCategory = '半身裙';
      } else if (shapeFeatures.hasDressShape) {
        category = '连衣裙';
        subCategory = '连衣裙';
      } else {
        category = '上衣';
        subCategory = '外套';
      }
    } else if (aspectRatio > 1.4) {
      category = '下装';
      if (height < width * 0.55) {
        subCategory = '短裤';
      } else if (features.fabricType === '牛仔') {
        subCategory = '牛仔裤';
      } else if (shapeFeatures.hasWideLeg) {
        subCategory = '阔腿裤';
      } else {
        subCategory = '长裤';
      }
    } else if (aspectRatio >= 1.0 && aspectRatio <= 1.4) {
      category = '上衣';
      if (features.hasHood) {
        subCategory = '卫衣';
      } else if (features.sleeve === '短袖') {
        subCategory = 'T恤';
      } else if (features.sleeve === '长袖') {
        subCategory = features.neckline === '衬衫领' ? '衬衫' : '毛衣';
      } else {
        subCategory = 'T恤';
      }
    } else {
      category = '上衣';
      if (features.hasHood) {
        subCategory = '卫衣';
      } else if (features.sleeve === '长袖') {
        subCategory = '衬衫';
      } else if (features.fabricType === '牛仔') {
        subCategory = '牛仔外套';
      } else if (features.fabricType === '针织') {
        subCategory = '针织衫';
      } else {
        subCategory = 'T恤';
      }
    }
  }
  
  if (features.hasHood && category === '上衣') {
    subCategory = '卫衣';
  }
  if (features.fabricType === '牛仔' && category === '上衣') {
    subCategory = '牛仔外套';
  }
  if (features.fabricType === '针织' && category === '上衣') {
    subCategory = '针织衫';
  }
  
  return {
    category,
    subCategory,
    features
  };
}

function checkIfWorn(image, width, height) {
  let skinPixels = 0;
  let totalPixels = 0;
  
  for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y += 4) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x += 4) {
      const pixel = intToRGBA(image.getPixelColor(x, y));
      const r = pixel.r, g = pixel.g, b = pixel.b;
      
      if (r > 180 && g > 140 && b > 100 && 
          r > g && g > b && 
          r - g < 40 && g - b < 40) {
        skinPixels++;
      }
      totalPixels++;
    }
  }
  
  return skinPixels > totalPixels * 0.02;
}

function analyzeClothingShape(image, width, height) {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const aspectRatio = width / height;
  
  let hasDressShape = false;
  let hasSkirtShape = false;
  let hasWideLeg = false;
  
  const topWidth = measureWidthAtY(image, width, height, Math.floor(height * 0.2));
  const waistWidth = measureWidthAtY(image, width, height, Math.floor(height * 0.5));
  const bottomWidth = measureWidthAtY(image, width, height, Math.floor(height * 0.8));
  
  if (waistWidth < topWidth * 0.85 && bottomWidth > waistWidth * 1.2) {
    hasSkirtShape = true;
  }
  
  if (aspectRatio < 0.7 && height > width * 1.5) {
    hasDressShape = true;
  }
  
  if (bottomWidth > topWidth * 1.3) {
    hasWideLeg = true;
  }
  
  return { hasDressShape, hasSkirtShape, hasWideLeg };
}

function measureWidthAtY(image, width, height, y) {
  let leftEdge = 0;
  let rightEdge = width - 1;
  
  for (let x = 0; x < width; x++) {
    const pixel = intToRGBA(image.getPixelColor(x, y));
    const brightness = (pixel.r + pixel.g + pixel.b) / 3;
    if (brightness > 20 && brightness < 240) {
      leftEdge = x;
      break;
    }
  }
  
  for (let x = width - 1; x >= 0; x--) {
    const pixel = intToRGBA(image.getPixelColor(x, y));
    const brightness = (pixel.r + pixel.g + pixel.b) / 3;
    if (brightness > 20 && brightness < 240) {
      rightEdge = x;
      break;
    }
  }
  
  return rightEdge - leftEdge;
}

function classifyStaticClothing(image, width, height, features) {
  const aspectRatio = width / height;
  const shapeFeatures = analyzeClothingShape(image, width, height);
  
  let category = '上衣';
  let subCategory = 'T恤';
  
  if (aspectRatio < 0.55) {
    if (shapeFeatures.hasDressShape) {
      category = '连衣裙';
      subCategory = height < width * 1.8 ? '短裙' : '长裙';
    } else if (shapeFeatures.hasSkirtShape) {
      category = '下装';
      subCategory = '半身裙';
    } else {
      category = '连衣裙';
      subCategory = '长裙';
    }
  } else if (aspectRatio >= 0.55 && aspectRatio < 0.8) {
    if (shapeFeatures.hasSkirtShape) {
      category = '下装';
      subCategory = '半身裙';
    } else if (features.hasHood) {
      category = '上衣';
      subCategory = '卫衣';
    } else if (features.fabricType === '牛仔') {
      category = '上衣';
      subCategory = '牛仔外套';
    } else {
      category = '上衣';
      subCategory = '外套';
    }
  } else if (aspectRatio >= 1.4) {
    category = '下装';
    if (height < width * 0.55) {
      subCategory = '短裤';
    } else if (features.fabricType === '牛仔') {
      subCategory = '牛仔裤';
    } else if (shapeFeatures.hasWideLeg) {
      subCategory = '阔腿裤';
    } else {
      subCategory = '长裤';
    }
  } else {
    category = '上衣';
    if (features.hasHood) {
      subCategory = '卫衣';
    } else if (features.sleeve === '短袖') {
      subCategory = 'T恤';
    } else if (features.sleeve === '长袖') {
      subCategory = features.neckline === '衬衫领' ? '衬衫' : '毛衣';
    } else if (features.fabricType === '针织') {
      subCategory = '针织衫';
    } else {
      subCategory = 'T恤';
    }
  }
  
  return { category, subCategory };
}

async function analyzeClothingImage(imagePath) {
  try {
    let image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    image = preprocessImage(image, width, height);
    
    const clothingCheck = isClothingImage(image);
    if (!clothingCheck.isClothing) {
      console.log(`非服装图片检测，置信度: ${clothingCheck.confidence.toFixed(2)}, 原因: ${clothingCheck.reason}`);
      return { 
        isClothing: false, 
        confidence: clothingCheck.confidence,
        reason: clothingCheck.reason,
        error: '图片内容不是服装' 
      };
    }
    
    const foregroundPixels = extractClothingRegion(image, width, height);
    const colorAnalysis = foregroundPixels ? analyzeColors(foregroundPixels) : { 
      mainColor: '其他', 
      secondaryColors: [], 
      accentColors: [],
      hasPattern: false, 
      patternType: '纯色',
      patternDensity: 0 
    };
    
    const typeResult = detectClothingType(image, colorAnalysis);
    
    console.log(`服装识别结果: 类别=${typeResult.category}, 子类别=${typeResult.subCategory}`);
    console.log(`颜色分析: 主色=${colorAnalysis.mainColor}, 辅色=${colorAnalysis.secondaryColors.join(', ')}, 点缀色=${colorAnalysis.accentColors.join(', ')}, 图案=${colorAnalysis.patternType}`);
    
    return {
      isClothing: true,
      confidence: clothingCheck.confidence,
      category: typeResult.category,
      subCategory: typeResult.subCategory,
      mainColor: colorAnalysis.mainColor,
      secondaryColors: colorAnalysis.secondaryColors,
      accentColors: colorAnalysis.accentColors,
      hasPattern: colorAnalysis.hasPattern,
      patternType: colorAnalysis.patternType,
      patternDensity: colorAnalysis.patternDensity,
      features: typeResult.features,
      reason: '成功识别为服装'
    };
  } catch (error) {
    console.error('服装分析失败:', error);
    return { isClothing: false, confidence: 0, error: '分析失败', reason: '图片处理错误' };
  }
}

const colorHarmony = {
  '黑色': { complementary: ['白色', '米色', '银色'], analogous: ['深灰', '深蓝', '深紫'], triadic: ['白色', '红色', '黄色'], tetradic: ['白色', '蓝色', '黄色', '粉色'] },
  '白色': { complementary: ['黑色', '深灰'], analogous: ['米色', '浅灰', '淡粉'], triadic: ['黑色', '灰色', '深蓝色'], tetradic: ['黑色', '蓝色', '粉色', '绿色'] },
  '灰色': { complementary: ['橙色', '黄色'], analogous: ['黑色', '白色', '深蓝色'], triadic: ['橙色', '蓝色', '粉色'], tetradic: ['橙色', '蓝色', '粉色', '黄色'] },
  '蓝色': { complementary: ['橙色', '黄色'], analogous: ['青色', '紫色', '深蓝'], triadic: ['橙色', '绿色', '红色'], tetradic: ['橙色', '黄色', '紫色', '粉色'] },
  '红色': { complementary: ['绿色', '青色'], analogous: ['橙色', '粉色', '深红色'], triadic: ['绿色', '蓝色', '紫色'], tetradic: ['绿色', '紫色', '橙色', '青色'] },
  '粉色': { complementary: ['绿色', '深绿'], analogous: ['红色', '紫色', '淡紫'], triadic: ['绿色', '橙色', '蓝色'], tetradic: ['绿色', '紫色', '蓝色', '灰色'] },
  '绿色': { complementary: ['红色', '粉色'], analogous: ['青色', '黄色', '深绿'], triadic: ['红色', '紫色', '橙色'], tetradic: ['红色', '橙色', '蓝色', '紫色'] },
  '黄色': { complementary: ['紫色', '深蓝'], analogous: ['橙色', '绿色', '米色'], triadic: ['紫色', '蓝色', '红色'], tetradic: ['紫色', '绿色', '红色', '橙色'] },
  '紫色': { complementary: ['黄色', '橙色'], analogous: ['蓝色', '粉色', '深紫'], triadic: ['黄色', '橙色', '绿色'], tetradic: ['黄色', '绿色', '红色', '蓝色'] },
  '棕色': { complementary: ['蓝色', '青色'], analogous: ['米色', '橙色', '深棕'], triadic: ['蓝色', '紫色', '绿色'], tetradic: ['蓝色', '绿色', '粉色', '橙色'] },
  '米色': { complementary: ['深蓝', '深绿'], analogous: ['白色', '棕色', '浅黄'], triadic: ['深蓝', '绿色', '紫色'], tetradic: ['深蓝', '紫色', '橙色', '绿色'] },
  '橙色': { complementary: ['蓝色', '紫色'], analogous: ['红色', '黄色', '棕色'], triadic: ['蓝色', '紫色', '绿色'], tetradic: ['蓝色', '绿色', '粉色', '紫色'] },
  '青色': { complementary: ['红色', '橙色'], analogous: ['蓝色', '绿色', '白色'], triadic: ['红色', '紫色', '黄色'], tetradic: ['红色', '橙色', '黄色', '紫色'] },
  '金色': { complementary: ['黑色', '深紫'], analogous: ['黄色', '橙色', '棕色'], triadic: ['黑色', '蓝色', '紫色'], tetradic: ['黑色', '紫色', '蓝色', '绿色'] },
  '银色': { complementary: ['黑色', '深灰'], analogous: ['白色', '灰色', '淡蓝'], triadic: ['黑色', '蓝色', '粉色'], tetradic: ['黑色', '粉色', '蓝色', '黄色'] },
  '驼色': { complementary: ['蓝色', '紫色'], analogous: ['棕色', '米色', '橙色'], triadic: ['蓝色', '紫色', '绿色'], tetradic: ['蓝色', '绿色', '粉色', '橙色'] },
  '藏蓝': { complementary: ['橙色', '黄色'], analogous: ['蓝色', '青色', '黑色'], triadic: ['橙色', '绿色', '红色'], tetradic: ['橙色', '黄色', '粉色', '绿色'] },
  '酒红': { complementary: ['绿色', '青色'], analogous: ['红色', '紫色', '棕色'], triadic: ['绿色', '蓝色', '橙色'], tetradic: ['绿色', '橙色', '蓝色', '紫色'] },
  '墨绿': { complementary: ['红色', '橙色'], analogous: ['绿色', '青色', '深蓝色'], triadic: ['红色', '紫色', '黄色'], tetradic: ['红色', '黄色', '蓝色', '紫色'] },
  '其他': { complementary: ['白色', '黑色'], analogous: ['灰色', '米色'], triadic: ['白色', '黑色', '灰色'], tetradic: ['白色', '黑色', '灰色', '米色'] }
};

const styleMatching = {
  '休闲': ['休闲', '运动', '街头', '日系', '简约', '韩系'],
  '正式': ['正式', '简约', '优雅', '欧美', '复古'],
  '运动': ['休闲', '运动', '街头', '日系'],
  '甜美': ['甜美', '日系', '韩系', '优雅', '简约', '可爱'],
  '复古': ['复古', '优雅', '欧美', '简约'],
  '街头': ['街头', '运动', '休闲', '日系'],
  '优雅': ['优雅', '正式', '复古', '甜美'],
  '简约': ['简约', '正式', '休闲', '优雅'],
  '日系': ['日系', '休闲', '甜美', '街头'],
  '韩系': ['韩系', '甜美', '休闲', '简约'],
  '欧美': ['欧美', '正式', '优雅', '复古'],
  '可爱': ['可爱', '甜美', '日系', '韩系']
};

const categoryMatching = {
  '上衣': { '下装': ['同色系搭配', '对比色搭配', '邻近色搭配'], '鞋子': ['中性色搭配', '点缀色搭配'] },
  '下装': { '上衣': ['同色系搭配', '对比色搭配', '邻近色搭配'], '鞋子': ['同色系搭配', '对比色搭配'] },
  '鞋子': { '上衣': ['中性色搭配', '点缀色搭配', '同色系搭配'], '下装': ['同色系搭配', '对比色搭配', '邻近色搭配'] },
  '连衣裙': { '鞋子': ['同色系搭配', '对比色搭配', '中性色搭配'] }
};

const styleCategoryRules = {
  '上衣': {
    '短袖T恤': ['短裤', '短裙', '牛仔裤', '运动裤'],
    '长袖T恤': ['长裤', '牛仔裤', '裙子'],
    '卫衣': ['运动裤', '牛仔裤', '短裤'],
    '毛衣': ['长裤', '牛仔裤', '裙子'],
    '外套': ['长裤', '牛仔裤', '裙子'],
    '衬衫': ['长裤', '牛仔裤', '裙子', '半身裙'],
    'T恤': ['牛仔裤', '短裤', '运动裤'],
    '夹克': ['牛仔裤', '长裤', '短裤'],
    '针织衫': ['长裤', '裙子', '牛仔裤'],
    '吊带': ['短裙', '短裤', '半身裙'],
    '背心': ['长裤', '短裤', '裙子'],
    '风衣': ['长裤', '裙子', '牛仔裤'],
    '羽绒服': ['长裤', '牛仔裤', '裙子'],
    '西装': ['长裤', '半身裙', '西装裤'],
    'POLO衫': ['牛仔裤', '休闲裤', '短裤'],
    '开衫': ['长裤', '裙子', '牛仔裤'],
    '牛仔外套': ['牛仔裤', '长裙', '短裙']
  },
  '下装': {
    '长裤': ['长袖T恤', '卫衣', '毛衣', '外套', '衬衫', '夹克', '针织衫'],
    '短裤': ['短袖T恤', '衬衫', '背心', 'POLO衫'],
    '裙子': ['短袖T恤', '长袖T恤', '衬衫', '外套', '针织衫'],
    '牛仔裤': ['短袖T恤', '长袖T恤', '卫衣', 'T恤', '衬衫', '夹克', '牛仔外套'],
    '运动裤': ['卫衣', 'T恤', '运动外套'],
    '阔腿裤': ['短袖T恤', '衬衫', '针织衫', '外套'],
    '紧身裤': ['长袖T恤', '卫衣', '毛衣', '外套'],
    '半身裙': ['短袖T恤', '长袖T恤', '衬衫', '针织衫', '外套'],
    '百褶裙': ['衬衫', '针织衫', '背心'],
    'A字裙': ['衬衫', '针织衫', '短袖T恤'],
    '工装裤': ['T恤', '衬衫', '夹克'],
    '休闲裤': ['衬衫', 'T恤', 'POLO衫'],
    '西装裤': ['衬衫', '西装', '针织衫'],
    '牛仔裙': ['T恤', '衬衫', '牛仔外套']
  },
  '鞋子': {
    '运动鞋': ['运动裤', '牛仔裤', '短裤'],
    '休闲鞋': ['牛仔裤', '长裤', '短裤', '裙子'],
    '高跟鞋': ['裙子', '长裤', '连衣裙', '半身裙'],
    '靴子': ['长裤', '牛仔裤', '裙子', '长裙'],
    '凉鞋': ['短裤', '裙子', '连衣裙', '半身裙'],
    '拖鞋': ['短裤'],
    '板鞋': ['牛仔裤', '运动裤', '短裤'],
    '马丁靴': ['牛仔裤', '长裙', '短裤'],
    '皮鞋': ['西装裤', '长裤', '半身裙'],
    '帆布鞋': ['牛仔裤', '短裤', '休闲裤']
  },
  '连衣裙': {
    '短裙': ['高跟鞋', '凉鞋', '休闲鞋'],
    '长裙': ['高跟鞋', '靴子', '休闲鞋'],
    '吊带裙': ['凉鞋', '高跟鞋', '牛仔外套'],
    '连衣裙': ['高跟鞋', '休闲鞋', '凉鞋'],
    '衬衫裙': ['高跟鞋', '休闲鞋', '凉鞋'],
    '针织裙': ['高跟鞋', '靴子', '休闲鞋'],
    '西装裙': ['高跟鞋', '皮鞋'],
    '碎花裙': ['凉鞋', '休闲鞋'],
    '雪纺裙': ['凉鞋', '高跟鞋'],
    '牛仔裙': ['T恤', '衬衫', '牛仔外套']
  }
};

function calculateMatchScore(selectedItem, candidateItem, occasion = null) {
  let score = 0;
  
  if (selectedItem.category === candidateItem.category) {
    return 0;
  }
  
  if (categoryMatching[selectedItem.category] && categoryMatching[selectedItem.category][candidateItem.category]) {
    score += 30;
  }
  
  const harmonyColors = [
    ...(colorHarmony[selectedItem.color]?.complementary || []),
    ...(colorHarmony[selectedItem.color]?.analogous || []),
    ...(colorHarmony[selectedItem.color]?.triadic || []),
    ...(colorHarmony[selectedItem.color]?.tetradic || [])
  ];
  
  if (harmonyColors.includes(candidateItem.color)) {
    score += 40;
  } else if (selectedItem.color === candidateItem.color) {
    score += 25;
  }
  
  if (selectedItem.style && candidateItem.style) {
    const matchedStyles = styleMatching[selectedItem.style] || [];
    if (matchedStyles.includes(candidateItem.style)) {
      score += 20;
    }
  }
  
  if (selectedItem.subCategory && candidateItem.subCategory) {
    const recommended = styleCategoryRules[selectedItem.category]?.[selectedItem.subCategory] || [];
    if (recommended.includes(candidateItem.subCategory)) {
      score += 30;
    }
  }
  
  const occasionFactor = {
    '日常': 1.0,
    '工作': 1.2,
    '约会': 1.1,
    '运动': 1.3,
    '派对': 1.1,
    '旅行': 1.0,
    '商务': 1.2,
    '婚礼': 1.1,
    '校园': 1.0
  };
  
  if (occasion && occasionFactor[occasion]) {
    score *= occasionFactor[occasion];
  }
  
  return Math.min(100, score);
}

function recommendMatch(selectedItem, occasion = null) {
  const wardrobe = loadWardrobe();
  const candidates = wardrobe.filter(item => item.id !== selectedItem.id);
  
  const scoredCandidates = candidates.map(item => ({
    ...item,
    score: calculateMatchScore(selectedItem, item, occasion)
  })).filter(item => item.score > 20);
  
  scoredCandidates.sort((a, b) => b.score - a.score);
  
  const neededCategories = {
    '上衣': ['下装', '鞋子'],
    '下装': ['上衣', '鞋子'],
    '鞋子': ['上衣', '下装'],
    '连衣裙': ['鞋子']
  };
  
  const needed = neededCategories[selectedItem.category] || [];
  const result = [];
  
  for (const category of needed) {
    const matched = scoredCandidates.find(c => c.category === category);
    if (matched) {
      result.push(matched);
    }
  }
  
  return result.slice(0, 2);
}

function getMatchReason(selectedItem, matchedItem) {
  const reasons = [];
  
  if (selectedItem.color && matchedItem.color) {
    const harmony = colorHarmony[selectedItem.color];
    if (harmony) {
      if (harmony.complementary.includes(matchedItem.color)) {
        reasons.push(`${matchedItem.color}是${selectedItem.color}的互补色，对比强烈`);
      } else if (harmony.analogous.includes(matchedItem.color)) {
        reasons.push(`${matchedItem.color}是${selectedItem.color}的邻近色，搭配和谐`);
      } else if (harmony.triadic.includes(matchedItem.color)) {
        reasons.push(`${matchedItem.color}与${selectedItem.color}形成三色系搭配`);
      } else if (harmony.tetradic.includes(matchedItem.color)) {
        reasons.push(`${matchedItem.color}与${selectedItem.color}形成四色系搭配`);
      } else if (selectedItem.color === matchedItem.color) {
        reasons.push(`同色系${selectedItem.color}搭配，简约大方`);
      }
    }
  }
  
  if (selectedItem.subCategory && matchedItem.subCategory) {
    const recommended = styleCategoryRules[selectedItem.category]?.[selectedItem.subCategory] || [];
    if (recommended.includes(matchedItem.subCategory)) {
      reasons.push(`${selectedItem.subCategory}搭配${matchedItem.subCategory}是经典组合`);
    }
  }
  
  if (selectedItem.style && matchedItem.style) {
    const matchedStyles = styleMatching[selectedItem.style] || [];
    if (matchedStyles.includes(matchedItem.style)) {
      reasons.push(`${selectedItem.style}风格与${matchedItem.style}风格搭配协调`);
    }
  }
  
  return reasons.length > 0 ? reasons : ['搭配和谐美观'];
}

function generateSmartRecommendation(occasion = '日常') {
  const wardrobe = loadWardrobe();
  
  if (wardrobe.length < 3) {
    return [];
  }
  
  const occasionOutfits = {
    '日常': [
      { categories: ['上衣', '下装', '鞋子'], style: '休闲' },
      { categories: ['连衣裙', '鞋子'], style: '简约' }
    ],
    '工作': [
      { categories: ['上衣', '下装', '鞋子'], style: '正式' },
      { categories: ['连衣裙', '鞋子'], style: '优雅' }
    ],
    '约会': [
      { categories: ['上衣', '下装', '鞋子'], style: '甜美' },
      { categories: ['连衣裙', '鞋子'], style: '优雅' }
    ],
    '运动': [
      { categories: ['上衣', '下装', '鞋子'], style: '运动' }
    ],
    '派对': [
      { categories: ['连衣裙', '鞋子'], style: '甜美' },
      { categories: ['上衣', '下装', '鞋子'], style: '优雅' }
    ],
    '旅行': [
      { categories: ['上衣', '下装', '鞋子'], style: '休闲' },
      { categories: ['连衣裙', '鞋子'], style: '简约' }
    ],
    '商务': [
      { categories: ['上衣', '下装', '鞋子'], style: '正式' }
    ],
    '婚礼': [
      { categories: ['连衣裙', '鞋子'], style: '优雅' }
    ],
    '校园': [
      { categories: ['上衣', '下装', '鞋子'], style: '休闲' },
      { categories: ['连衣裙', '鞋子'], style: '甜美' }
    ]
  };
  
  const outfitTemplates = occasionOutfits[occasion] || occasionOutfits['日常'];
  
  for (const template of outfitTemplates) {
    const matchedItems = [];
    const usedIds = new Set();
    
    for (const category of template.categories) {
      const available = wardrobe.filter(item => item.category === category && !usedIds.has(item.id));
      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        matchedItems.push(available[randomIndex]);
        usedIds.add(available[randomIndex].id);
      }
    }
    
    if (matchedItems.length === template.categories.length) {
      return matchedItems;
    }
  }
  
  return [];
}

function loadWardrobe() {
  try {
    const data = fs.readFileSync(path.join(WARDROBE_DIR, 'wardrobe.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveWardrobe(items) {
  fs.writeFileSync(path.join(WARDROBE_DIR, 'wardrobe.json'), JSON.stringify(items, null, 2));
}

async function uploadClothes(req, res) {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, error: '请上传图片' });
    }
    
    const image = req.files.image;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(image.mimetype)) {
      return res.status(400).json({ success: false, error: '只支持图片格式' });
    }
    
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(image.name);
    const imagePath = path.join(WARDROBE_DIR, uniqueName);
    
    await image.mv(imagePath);
    
    const analysis = await analyzeClothingImage(imagePath);
    
    if (!analysis.isClothing) {
      fs.unlinkSync(imagePath);
      return res.json({ success: false, error: analysis.error || '无法识别为服装图片', reason: analysis.reason });
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: req.body.name || '未命名',
      category: req.body.category || analysis.category,
      subCategory: req.body.subCategory || analysis.subCategory,
      color: req.body.color || analysis.mainColor,
      secondaryColors: analysis.secondaryColors || [],
      accentColors: analysis.accentColors || [],
      style: req.body.style || '休闲',
      occasion: req.body.occasion || '日常',
      imageUrl: `/uploads/wardrobe/${uniqueName}`,
      hasPattern: analysis.hasPattern || false,
      patternType: analysis.patternType || '纯色',
      features: analysis.features || {},
      confidence: analysis.confidence || 0,
      createdAt: new Date().toISOString()
    };
    
    const wardrobe = loadWardrobe();
    wardrobe.push(newItem);
    saveWardrobe(wardrobe);
    
    res.json({ 
      success: true, 
      item: newItem,
      detectedColor: analysis.mainColor,
      detectedCategory: analysis.category,
      detectedSubCategory: analysis.subCategory,
      usedColor: newItem.color,
      usedCategory: newItem.category,
      usedSubCategory: newItem.subCategory
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ success: false, error: '上传失败' });
  }
}

function getWardrobeItems(req, res) {
  const wardrobe = loadWardrobe();
  res.json({ success: true, items: wardrobe });
}

function deleteWardrobeItem(req, res) {
  try {
    const id = req.params.id;
    let wardrobe = loadWardrobe();
    const itemIndex = wardrobe.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: '物品不存在' });
    }
    
    const item = wardrobe[itemIndex];
    const imagePath = path.join(__dirname, '../', item.imageUrl);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    wardrobe.splice(itemIndex, 1);
    saveWardrobe(wardrobe);
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ success: false, error: '删除失败' });
  }
}

function recommendMatches(req, res) {
  try {
    const itemId = req.query.itemId;
    const occasion = req.query.occasion || '日常';
    
    if (!itemId) {
      return res.status(400).json({ success: false, error: '请选择一件衣服' });
    }
    
    const wardrobe = loadWardrobe();
    const selectedItem = wardrobe.find(item => item.id === itemId);
    
    if (!selectedItem) {
      return res.status(404).json({ success: false, error: '未找到选中的衣服' });
    }
    
    const matchedItems = recommendMatch(selectedItem, occasion);
    
    const colorHarmonyInfo = colorHarmony[selectedItem.color] || {};
    const colorRecommendations = [
      { type: '互补色', colors: colorHarmonyInfo.complementary || [] },
      { type: '邻近色', colors: colorHarmonyInfo.analogous || [] },
      { type: '三色系', colors: colorHarmonyInfo.triadic || [] },
      { type: '四色系', colors: colorHarmonyInfo.tetradic || [] }
    ];
    
    res.json({
      success: true,
      selectedItem,
      matchedItems,
      colorRecommendations
    });
  } catch (error) {
    console.error('推荐失败:', error);
    res.status(500).json({ success: false, error: '推荐失败' });
  }
}

function smartRecommend(req, res) {
  try {
    const occasion = req.query.occasion || '日常';
    const recommendations = generateSmartRecommendation(occasion);
    
    res.json({
      success: true,
      recommendations,
      occasion
    });
  } catch (error) {
    console.error('智能推荐失败:', error);
    res.status(500).json({ success: false, error: '智能推荐失败' });
  }
}

function updateWardrobeItem(req, res) {
  try {
    const id = req.params.id;
    const updates = req.body;
    
    let wardrobe = loadWardrobe();
    const itemIndex = wardrobe.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: '物品不存在' });
    }
    
    wardrobe[itemIndex] = { ...wardrobe[itemIndex], ...updates, updatedAt: new Date().toISOString() };
    saveWardrobe(wardrobe);
    
    res.json({ success: true, item: wardrobe[itemIndex] });
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({ success: false, error: '更新失败' });
  }
}

function getCategories(req, res) {
  res.json({
    success: true,
    categories: categories,
    subCategories: subCategories,
    colors: colors,
    styles: styles,
    occasions: occasions
  });
}

module.exports = {
  uploadClothes,
  getWardrobeItems,
  deleteWardrobeItem,
  recommendMatches,
  smartRecommend,
  updateWardrobeItem,
  getCategories,
  analyzeClothingImage
};