import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs, unquote, quote
import time
import re
import hashlib


class WebsiteCrawler:
    def __init__(self, url, output_folder='crawled_website'):
        self.base_url = url
        self.parsed_base = urlparse(url)
        self.base_origin = f"{self.parsed_base.scheme}://{self.parsed_base.netloc}"
        self.output_folder = output_folder
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        # 已下载的URL集合，避免重复下载
        self.downloaded_urls = set()
        # 资源路径映射：原始绝对路径 -> 相对于output_folder的本地路径
        self.path_mapping = {}
        # 站点资源前缀：检测到的绝对路径前缀（如 /b/a/ecom-website/.../）
        self.detected_prefixes = set()

    def create_folder_structure(self, file_path):
        """创建文件夹结构"""
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

    def download_file(self, url, local_path):
        """下载文件到本地路径，支持去重"""
        # 标准化URL用于去重
        normalized_url = url.split('?')[0].split('#')[0]
        if normalized_url in self.downloaded_urls:
            return True
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            self.create_folder_structure(local_path)

            with open(local_path, 'wb') as f:
                f.write(response.content)
            
            self.downloaded_urls.add(normalized_url)
            
            # 记录路径映射（同时保存原始路径和解码后的路径）
            parsed = urlparse(url)
            original_path = parsed.path
            decoded_path = unquote(original_path)
            rel_path = os.path.relpath(local_path, self.output_folder).replace('\\', '/')
            self.path_mapping[original_path] = rel_path
            if decoded_path != original_path:
                self.path_mapping[decoded_path] = rel_path
            
            print(f"  [OK] 下载成功: {url}")
            return True
        except Exception as e:
            print(f"  [FAIL] 下载失败: {url} - {str(e)}")
            return False

    def get_local_path(self, url):
        """将URL转换为本地文件路径（不包含查询参数）"""
        parsed = urlparse(url)
        path = parsed.path

        if not path or path == '/':
            return os.path.join(self.output_folder, 'index.html')

        # URL解码路径（如 %5Blocale%5D -> [locale]）
        path = unquote(path)

        # 移除开头的斜杠
        if path.startswith('/'):
            path = path[1:]

        # 如果没有文件扩展名，假设是HTML
        if not os.path.splitext(path)[1]:
            path = os.path.join(path, 'index.html')

        return os.path.join(self.output_folder, path)

    def remove_query_params(self, url):
        """移除URL中的查询参数"""
        parsed = urlparse(url)
        return parsed.path

    def is_same_origin(self, url):
        """判断URL是否属于同一源"""
        if url.startswith('//'):
            return False
        if url.startswith('http'):
            parsed = urlparse(url)
            return parsed.netloc == self.parsed_base.netloc
        return True  # 相对路径属于同一源

    def absolute_to_relative(self, url_path):
        """将绝对路径转换为相对路径（移除开头的斜杠和查询参数，并URL解码）"""
        if not url_path:
            return url_path
        # 移除查询参数和hash
        clean = url_path.split('?')[0].split('#')[0]
        # URL解码（如 %5Blocale%5D -> [locale]）
        clean = unquote(clean)
        # 移除开头的斜杠
        return clean.lstrip('/')

    def detect_resource_prefixes(self, html_content):
        """从HTML内容中检测资源前缀路径（如 /b/a/ecom-website/.../）"""
        # 检测script src、link href中的公共前缀
        prefixes = []
        
        # 提取所有资源路径
        src_pattern = r'(?:src|href)=["\']([^"\']+)["\']'
        paths = re.findall(src_pattern, html_content)
        
        for path in paths:
            if path.startswith('/') and not path.startswith('//'):
                # 提取到_next/之前的前缀
                next_idx = path.find('/_next/')
                if next_idx > 0:
                    prefix = path[:next_idx + 1]
                    prefixes.append(prefix)
        
        # 找最常见的前缀
        if prefixes:
            from collections import Counter
            counter = Counter(prefixes)
            for prefix, count in counter.most_common():
                self.detected_prefixes.add(prefix)
                print(f"  检测到资源前缀: {prefix} (出现{count}次)")

    # ========== HTML 路径修复 ==========
    
    def fix_html_paths(self, html_content):
        """修复HTML中的所有资源路径"""
        soup = BeautifulSoup(html_content, 'html.parser')

        # 1. 修复 <link> 标签 (href)
        for link in soup.find_all('link', href=True):
            link['href'] = self._fix_attr_path(link['href'])

        # 2. 修复 <script> 标签 (src)
        for script in soup.find_all('script', src=True):
            script['src'] = self._fix_attr_path(script['src'])

        # 3. 修复 <img> 标签 (src, srcset, data-src)
        for img in soup.find_all('img'):
            if img.get('src'):
                img['src'] = self._fix_attr_path(img['src'])
            if img.get('data-src'):
                img['data-src'] = self._fix_attr_path(img['data-src'])
            if img.get('srcset'):
                img['srcset'] = self._fix_srcset(img['srcset'])

        # 4. 修复 <source> 标签 (src, srcset)
        for source in soup.find_all('source'):
            if source.get('src'):
                source['src'] = self._fix_attr_path(source['src'])
            if source.get('srcset'):
                source['srcset'] = self._fix_srcset(source['srcset'])

        # 5. 修复 <video> 和 <audio> 标签
        for media in soup.find_all(['video', 'audio']):
            if media.get('src'):
                media['src'] = self._fix_attr_path(media['src'])
            if media.get('poster'):
                media['poster'] = self._fix_attr_path(media['poster'])

        # 6. 修复 <a> 标签中指向本站资源的链接
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            # 只修复指向下载资源的链接
            if href.startswith('/') and not href.startswith('//'):
                if any(ext in href.lower() for ext in ['.js', '.css', '.png', '.jpg', '.svg', '.woff', '.json']):
                    a_tag['href'] = self._fix_attr_path(href)

        # 7. 修复内联 <style> 标签中的路径
        for style_tag in soup.find_all('style'):
            if style_tag.string:
                style_tag.string = self._fix_css_content(style_tag.string)

        # 8. 修复内联 <script> 标签中的绝对路径引用（如 self.__next_f.push 数据）
        for script in soup.find_all('script'):
            if not script.get('src') and script.string:
                script.string = self._fix_inline_script_paths(script.string)

        # 9. 修复行内 style 属性中的 url()
        for tag in soup.find_all(style=True):
            style_content = tag.get('style', '')
            if 'url(' in style_content:
                tag['style'] = self._fix_css_content(style_content)

        return str(soup)

    def _fix_attr_path(self, url):
        """修复单个HTML属性中的URL路径"""
        if not url or url.startswith('data:') or url.startswith('#') or url.startswith('javascript:'):
            return url
        
        # 外部链接（不属于本站）保持不变
        if url.startswith('http') and not self.is_same_origin(url):
            return url
        
        # 协议相对URL保持不变
        if url.startswith('//'):
            return url
        
        # 本站绝对URL，提取路径部分
        if url.startswith('http') and self.is_same_origin(url):
            parsed = urlparse(url)
            return self.absolute_to_relative(parsed.path)
        
        # 以/开头的绝对路径，转为相对路径
        if url.startswith('/'):
            return self.absolute_to_relative(url)
        
        # 已经是相对路径，URL解码并清理查询参数
        clean = url.split('?')[0].split('#')[0]
        return unquote(clean)

    def _fix_srcset(self, srcset):
        """修复srcset属性中的多个URL"""
        parts = []
        for item in srcset.split(','):
            item = item.strip()
            if not item:
                continue
            tokens = item.split()
            if tokens:
                tokens[0] = self._fix_attr_path(tokens[0])
            parts.append(' '.join(tokens))
        return ', '.join(parts)

    def _fix_inline_script_paths(self, script_content):
        """修复内联脚本中的绝对路径引用"""
        if not script_content:
            return script_content
        
        # 修复转义的绝对路径（如 JSON 中的 \"/assets/fonts/...\"）
        # 和普通绝对路径
        
        # 对于检测到的资源前缀，替换为相对路径
        for prefix in self.detected_prefixes:
            # 处理JSON转义格式 (\\/ 或 \/)
            escaped_prefix = prefix.replace('/', '\\/')
            double_escaped = prefix.replace('/', '\\\\/')
            
            # 替换双转义 (\\/)
            if double_escaped in script_content:
                relative_escaped = escaped_prefix[2:]  # 去掉开头的 \/
                script_content = script_content.replace(double_escaped, relative_escaped)
            
            # 替换单转义 (\/)
            if escaped_prefix in script_content:
                relative_escaped = escaped_prefix[2:]  # 去掉开头的 \/
                script_content = script_content.replace(escaped_prefix, relative_escaped)
        
        # 修复常见的绝对路径模式（如 '/assets/fonts/...'）
        # 通用替换：对于以/开头的路径，在引号内的
        def replace_quoted_abs_path(match):
            quote_char = match.group(1)
            path = match.group(2)
            # 检查路径映射（包括解码后的路径）
            clean_path = path.split('?')[0]
            decoded_path = unquote(clean_path)
            if clean_path in self.path_mapping:
                return f"{quote_char}{self.path_mapping[clean_path]}{quote_char}"
            if decoded_path in self.path_mapping:
                return f"{quote_char}{self.path_mapping[decoded_path]}{quote_char}"
            # 如果是资源路径（有文件扩展名），转为相对路径
            if re.search(r'\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf|json|webp|ico|mp4|webm)(\?|$)', path):
                relative = self.absolute_to_relative(path)
                return f"{quote_char}{relative}{quote_char}"
            return match.group(0)
        
        # 匹配引号内以/开头的路径（但排除 // 开头的协议相对路径和API路径）
        script_content = re.sub(
            r"""(['\"])(\/(?!\/|api\/|graphql)[a-zA-Z0-9_\-\.\/\%\[\]@]+\.[a-zA-Z0-9]+(?:\?[^'\"]*)?)\1""",
            replace_quoted_abs_path,
            script_content
        )
        
        return script_content

    # ========== CSS 路径修复 ==========

    def _fix_css_content(self, css_content, css_file_path=None):
        """修复CSS内容中的所有url()路径"""
        def replace_url(match):
            quote = match.group(1)
            url = match.group(2)

            if url.startswith('data:') or url.startswith('http') or url.startswith('//'):
                return match.group(0)

            # 绝对路径，转为相对路径
            if url.startswith('/'):
                clean_path = url.split('?')[0]
                
                # 先查路径映射
                if clean_path in self.path_mapping:
                    mapped = self.path_mapping[clean_path]
                    if css_file_path:
                        # CSS文件中需要计算相对于CSS文件位置的路径
                        css_dir = os.path.dirname(css_file_path)
                        mapped_full = os.path.join(self.output_folder, mapped)
                        mapped = os.path.relpath(mapped_full, css_dir).replace('\\', '/')
                    return f'url({quote}{mapped}{quote})'
                
                # 尝试按文件名查找（处理字体等资源可能在不同路径下）
                filename = os.path.basename(clean_path)
                found = self._find_file_by_name(filename)
                if found:
                    if css_file_path:
                        css_dir = os.path.dirname(css_file_path)
                        found_full = os.path.join(self.output_folder, found)
                        found = os.path.relpath(found_full, css_dir).replace('\\', '/')
                    return f'url({quote}{found}{quote})'
                
                # 兜底：直接去掉开头的/
                relative = self.absolute_to_relative(url)
                return f'url({quote}{relative}{quote})'

            # 相对路径，只移除查询参数
            clean_url = url.split('?')[0]
            if clean_url != url:
                return f'url({quote}{clean_url}{quote})'
            return match.group(0)

        return re.sub(r'url\((["\']?)([^"\')]+)\1\)', replace_url, css_content)

    def _find_file_by_name(self, filename):
        """根据文件名在输出目录中查找文件（支持哈希文件名模糊匹配）"""
        if not filename:
            return None
        
        file_base = os.path.splitext(filename)[0]
        file_ext = os.path.splitext(filename)[1].lower()
        
        for root, dirs, files in os.walk(self.output_folder):
            for f in files:
                f_base = os.path.splitext(f)[0]
                f_ext = os.path.splitext(f)[1].lower()
                # 精确匹配
                if f == filename:
                    return os.path.relpath(os.path.join(root, f), self.output_folder).replace('\\', '/')
                # 模糊匹配：文件名包含原始名且扩展名相同
                if file_base in f_base and f_ext == file_ext:
                    return os.path.relpath(os.path.join(root, f), self.output_folder).replace('\\', '/')
        return None

    # ========== JS 路径修复 ==========

    def fix_js_paths(self, js_content, js_file_path=None):
        """修复JS文件中的绝对路径"""
        
        # 1. 修复 webpack publicPath: t.p="/.../" 或 __webpack_public_path__=".../"
        # 这是最关键的修复：将绝对公共路径改为相对路径
        # 更精确的匹配：确保是赋值语句，且路径以/开头
        js_content = re.sub(
            r'(\.p\s*=\s*["\'])(/[^"\']*)(["\'])',
            lambda m: f'{m.group(1)}{m.group(2).lstrip("/")}{m.group(3)}',
            js_content
        )
        js_content = re.sub(
            r'(__webpack_public_path__\s*=\s*["\'])(/[^"\']*)(["\'])',
            lambda m: f'{m.group(1)}{m.group(2).lstrip("/")}{m.group(3)}',
            js_content
        )
        
        # 2. 修复 Next.js assetPrefix（更精确的匹配）
        js_content = re.sub(
            r'(assetPrefix\s*[=:]\s*["\'])(/[^"\']*)(["\'])',
            lambda m: f'{m.group(1)}{m.group(2).lstrip("/")}{m.group(3)}',
            js_content
        )
        
        # 3. 修复 Next.js deploymentId/buildId 相关的路径拼接
        # 检测到的前缀路径（只在引号内的路径字符串中替换）
        for prefix in self.detected_prefixes:
            relative_prefix = prefix.lstrip('/')
            # 只在引号内的路径中替换，且确保是完整的路径字符串
            # 匹配模式：引号 + 前缀 + 路径内容 + 引号
            def replace_prefix(match, p=prefix, rp=relative_prefix):
                full_path = match.group(2)
                if full_path.startswith(p):
                    return f'{match.group(1)}{rp}{full_path[len(p):]}{match.group(3)}'
                return match.group(0)
            
            js_content = re.sub(
                r'(["\'])(' + re.escape(prefix) + r'[^"\']*)(["\'])',
                replace_prefix,
                js_content
            )
        
        return js_content

    # ========== 资源提取 ==========

    def parse_css_resources(self, css_content, css_url):
        """从CSS内容中提取资源链接"""
        resources = []

        # 提取 url() 中的资源
        url_pattern = r'url\(["\']?([^"\')]+)["\']?\)'
        urls = re.findall(url_pattern, css_content)

        for url in urls:
            if url.startswith('data:'):
                continue
            full_url = urljoin(css_url, url)
            resources.append(full_url)

        # 提取 @import 语句
        import_pattern = r'@import\s+["\']([^"\']+)["\']'
        imports = re.findall(import_pattern, css_content)

        for imp in imports:
            full_url = urljoin(css_url, imp)
            resources.append(full_url)

        return resources

    def extract_inline_style_resources(self, style_content, base_url):
        """从内联样式中提取资源URL"""
        resources = {'fonts': [], 'images': []}
        
        url_pattern = r'url\(["\']?([^"\')]+)["\']?\)'
        urls = re.findall(url_pattern, style_content)
        
        for url in urls:
            if url.startswith('data:'):
                continue
            full_url = urljoin(base_url, url)
            if any(ext in url.lower() for ext in ['.woff', '.woff2', '.ttf', '.otf', '.eot']):
                resources['fonts'].append(full_url)
            else:
                resources['images'].append(full_url)
        
        return resources

    # ========== 主流程 ==========

    def crawl(self):
        """开始爬取网站"""
        print(f"=" * 60)
        print(f"开始爬取网站: {self.base_url}")
        print(f"保存目录: {self.output_folder}")
        print(f"=" * 60)

        # 创建输出文件夹
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)

        # 下载主页面
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            html_content = response.text
        except Exception as e:
            print(f"无法访问主页面: {e}")
            return

        original_html = html_content

        # 检测资源前缀
        print("\n[1/8] 分析页面资源结构...")
        self.detect_resource_prefixes(html_content)

        # 解析HTML
        soup = BeautifulSoup(html_content, 'html.parser')

        # 收集所有资源链接
        resources = {
            'css': [],
            'js': [],
            'images': [],
            'fonts': [],
            'preloads': [],
            'other': []
        }

        # 查找 CSS 文件（包括 data-precedence 的）
        for link in soup.find_all('link'):
            href = link.get('href')
            if not href:
                continue
            rel = link.get('rel', [])
            if isinstance(rel, list):
                rel_str = ' '.join(rel)
            else:
                rel_str = rel
            
            if 'stylesheet' in rel_str or link.get('data-precedence'):
                full_url = urljoin(self.base_url, href)
                resources['css'].append(full_url)
            elif 'preload' in rel_str:
                full_url = urljoin(self.base_url, href)
                resources['preloads'].append(full_url)
            elif any(k in rel_str for k in ['icon', 'shortcut', 'apple-touch-icon', 'manifest']):
                # 下载 favicon、icon、manifest 等资源
                full_url = urljoin(self.base_url, href)
                if self.is_same_origin(full_url) or not href.startswith('http'):
                    resources['other'].append(full_url)

        # 查找内联样式中的资源
        for style in soup.find_all('style'):
            style_content = style.string
            if style_content:
                inline_res = self.extract_inline_style_resources(style_content, self.base_url)
                resources['fonts'].extend(inline_res['fonts'])
                resources['images'].extend(inline_res['images'])

        # 查找 JS 文件
        for script in soup.find_all('script', src=True):
            src = script.get('src')
            if src:
                full_url = urljoin(self.base_url, src)
                resources['js'].append(full_url)

        # 查找图片
        for img in soup.find_all('img'):
            # src 属性
            src = img.get('src')
            if src:
                full_url = urljoin(self.base_url, src)
                resources['images'].append(full_url)
            # data-src 属性（懒加载）
            data_src = img.get('data-src')
            if data_src:
                full_url = urljoin(self.base_url, data_src)
                resources['images'].append(full_url)
            # srcset 属性
            srcset = img.get('srcset')
            if srcset:
                for item in srcset.split(','):
                    item = item.strip()
                    if item:
                        url_part = item.split()[0]
                        full_url = urljoin(self.base_url, url_part)
                        resources['images'].append(full_url)

        # 查找 <source> 标签
        for source in soup.find_all('source'):
            src = source.get('src')
            if src:
                full_url = urljoin(self.base_url, src)
                resources['images'].append(full_url)
            srcset = source.get('srcset')
            if srcset:
                for item in srcset.split(','):
                    item = item.strip()
                    if item:
                        url_part = item.split()[0]
                        full_url = urljoin(self.base_url, url_part)
                        resources['images'].append(full_url)

        # 查找 <video> poster
        for video in soup.find_all('video'):
            poster = video.get('poster')
            if poster:
                full_url = urljoin(self.base_url, poster)
                resources['images'].append(full_url)

        # 查找行内 style 属性中的背景图片等
        for tag in soup.find_all(style=True):
            style_content = tag.get('style', '')
            urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', style_content)
            for url in urls:
                if not url.startswith('data:'):
                    full_url = urljoin(self.base_url, url)
                    resources['images'].append(full_url)

        # 打印资源统计
        print(f"\n  发现资源:")
        print(f"    CSS: {len(resources['css'])}")
        print(f"    JS:  {len(resources['js'])}")
        print(f"    图片: {len(set(resources['images']))}")
        print(f"    字体: {len(set(resources['fonts']))}")
        print(f"    预加载: {len(resources['preloads'])}")

        # ===== 下载所有资源 =====

        # 下载CSS文件
        print(f"\n[2/8] 下载CSS文件 ({len(resources['css'])}个)...")
        css_resources = []
        for url in resources['css']:
            local_path = self.get_local_path(url)
            if self.download_file(url, local_path):
                try:
                    with open(local_path, 'r', encoding='utf-8') as f:
                        css_content = f.read()
                    css_res = self.parse_css_resources(css_content, url)
                    css_resources.extend(css_res)
                except Exception as e:
                    print(f"    解析CSS失败: {str(e)}")
            time.sleep(0.3)

        # 下载JS文件
        print(f"\n[3/8] 下载JS文件 ({len(resources['js'])}个)...")
        for url in resources['js']:
            local_path = self.get_local_path(url)
            self.download_file(url, local_path)
            time.sleep(0.3)

        # 下载图片
        unique_images = set(resources['images'])
        print(f"\n[4/8] 下载图片文件 ({len(unique_images)}个)...")
        for url in unique_images:
            local_path = self.get_local_path(url)
            self.download_file(url, local_path)
            time.sleep(0.3)

        # 下载字体
        unique_fonts = set(resources['fonts'])
        if unique_fonts:
            print(f"\n[5/8] 下载字体文件 ({len(unique_fonts)}个)...")
            for url in unique_fonts:
                local_path = self.get_local_path(url)
                self.download_file(url, local_path)
                time.sleep(0.3)

        # 下载其他资源（manifest、favicon、icon等）
        if resources['other']:
            print(f"\n[5.5/8] 下载其他资源 ({len(resources['other'])}个)...")
            for url in resources['other']:
                local_path = self.get_local_path(url)
                self.download_file(url, local_path)
                time.sleep(0.3)

        # 下载CSS中引用的资源
        unique_css_resources = set(css_resources) - self.downloaded_urls
        if unique_css_resources:
            print(f"\n[6/8] 下载CSS引用的资源 ({len(unique_css_resources)}个)...")
            for url in unique_css_resources:
                local_path = self.get_local_path(url)
                self.download_file(url, local_path)
                time.sleep(0.3)

        # ===== 修复所有文件中的路径 =====

        # 修复CSS文件中的路径
        print(f"\n[7/8] 修复资源文件中的路径...")
        self._fix_all_css_files()
        self._fix_all_js_files()

        # 修复HTML并保存
        print(f"\n[8/8] 修复HTML路径并保存...")
        fixed_html = self.fix_html_paths(original_html)
        main_html_path = os.path.join(self.output_folder, 'index.html')
        with open(main_html_path, 'w', encoding='utf-8') as f:
            f.write(fixed_html)
        print(f"  [OK] 已保存: {main_html_path}")

        # 打印总结
        print(f"\n{'=' * 60}")
        print(f"爬取完成！文件保存在: {os.path.abspath(self.output_folder)}")
        print(f"总计下载: {len(self.downloaded_urls)} 个文件")
        print(f"{'=' * 60}")

    def _fix_all_css_files(self):
        """修复所有已下载CSS文件中的路径"""
        for root, dirs, files in os.walk(self.output_folder):
            for filename in files:
                if filename.endswith('.css'):
                    filepath = os.path.join(root, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                        fixed = self._fix_css_content(content, filepath)
                        if fixed != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(fixed)
                            print(f"  [OK] 修复CSS: {os.path.relpath(filepath, self.output_folder)}")
                    except Exception as e:
                        print(f"  [FAIL] 修复CSS失败: {filename} - {str(e)}")

    def _fix_all_js_files(self):
        """修复所有已下载JS文件中的路径"""
        for root, dirs, files in os.walk(self.output_folder):
            for filename in files:
                if filename.endswith('.js'):
                    filepath = os.path.join(root, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                        fixed = self.fix_js_paths(content, filepath)
                        if fixed != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(fixed)
                            print(f"  [OK] 修复JS: {os.path.relpath(filepath, self.output_folder)}")
                    except Exception as e:
                        print(f"  [FAIL] 修复JS失败: {filename} - {str(e)}")


if __name__ == '__main__':
    # 配置
    target_url = 'https://ouraring.com/'
    output_folder = 'fooror_website3'

    # 创建爬虫并开始爬取
    crawler = WebsiteCrawler(target_url, output_folder)
    crawler.crawl()

    print("\n注意: 此脚本仅供学习研究使用，请遵守网站的使用条款和版权规定。")
