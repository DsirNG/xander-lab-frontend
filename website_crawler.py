import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
import time
import re

class WebsiteCrawler:
    def __init__(self, url, output_folder='fooror_website'):
        self.base_url = url
        self.output_folder = output_folder
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def create_folder_structure(self, file_path):
        """创建文件夹结构"""
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
    
    def download_file(self, url, local_path):
        """下载文件到本地路径"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            self.create_folder_structure(local_path)
            
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print(f"✓ 下载成功: {url} -> {local_path}")
            return True
        except Exception as e:
            print(f"✗ 下载失败: {url} - {str(e)}")
            return False
    
    def get_local_path(self, url):
        """将URL转换为本地文件路径（不包含查询参数）"""
        parsed = urlparse(url)
        path = parsed.path
        
        if not path or path == '/':
            return os.path.join(self.output_folder, 'index.html')
        
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
    
    def fix_html_paths(self, html_content):
        """修复HTML中的资源路径：转换为相对路径并移除查询参数"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 修复CSS链接
        for link in soup.find_all('link', href=True):
            original_href = link['href']
            if original_href.startswith('http'):
                # 外部链接保持不变
                continue
            # 移除开头的斜杠和查询参数
            clean_path = self.remove_query_params(original_href).lstrip('/')
            link['href'] = clean_path
            
        # 修复JS链接
        for script in soup.find_all('script', src=True):
            original_src = script['src']
            if original_src.startswith('http') and not original_src.startswith(self.base_url):
                # 外部链接保持不变
                continue
            if original_src.startswith('http'):
                # 本站链接，转换为相对路径
                parsed = urlparse(original_src)
                clean_path = parsed.path.lstrip('/')
                script['src'] = clean_path
            else:
                # 相对链接，移除查询参数
                clean_path = self.remove_query_params(original_src).lstrip('/')
                script['src'] = clean_path
                
        # 修复图片链接
        for img in soup.find_all('img', src=True):
            original_src = img['src']
            if original_src.startswith('http') and not original_src.startswith(self.base_url):
                continue
            if original_src.startswith('http'):
                parsed = urlparse(original_src)
                clean_path = parsed.path.lstrip('/')
                img['src'] = clean_path
            else:
                clean_path = self.remove_query_params(original_src).lstrip('/')
                img['src'] = clean_path
        
        return str(soup)
    
    def parse_css_resources(self, css_content, css_url):
        """从CSS内容中提取资源链接"""
        resources = []
        
        # 提取 url() 中的资源
        url_pattern = r'url\(["\']?([^"\')]+)["\']?\)'
        urls = re.findall(url_pattern, css_content)
        
        for url in urls:
            # 跳过data URI
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
    
    def fix_css_paths(self, css_content):
        """修复CSS中的资源路径：移除查询参数"""
        # 修复 url() 中的路径
        def replace_url(match):
            url = match.group(1)
            if url.startswith('data:') or url.startswith('http'):
                return match.group(0)
            # 移除查询参数
            clean_url = url.split('?')[0]
            quote = match.group(0)[4]  # 获取原始的引号字符
            if quote in ['"', "'"]:
                return f'url({quote}{clean_url}{quote})'
            return f'url({clean_url})'
        
        css_content = re.sub(r'url\((["\']?)([^"\')]+)\1\)', 
                            lambda m: f'url({m.group(1)}{m.group(2).split("?")[0]}{m.group(1)})',
                            css_content)
        
        return css_content
    
    def crawl(self):
        """开始爬取网站"""
        print(f"开始爬取网站: {self.base_url}")
        print(f"保存目录: {self.output_folder}\n")
        
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
        
        # 先不保存HTML，等所有资源下载完后再修复路径并保存
        original_html = html_content
        
        # 解析HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 收集所有资源链接
        resources = {
            'css': [],
            'js': [],
            'images': [],
            'fonts': [],
            'other': []
        }
        
        # 查找CSS文件
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href')
            if href:
                full_url = urljoin(self.base_url, href)
                resources['css'].append(full_url)
        
        # 查找CSS中的 @import 和 style标签
        for style in soup.find_all('style'):
            # 这里可以进一步解析内联CSS中的@import
            pass
        
        # 查找JS文件
        for script in soup.find_all('script', src=True):
            src = script.get('src')
            if src:
                full_url = urljoin(self.base_url, src)
                resources['js'].append(full_url)
        
        # 查找图片
        for img in soup.find_all('img', src=True):
            src = img.get('src')
            if src:
                full_url = urljoin(self.base_url, src)
                resources['images'].append(full_url)
        
        # 查找背景图片和其他资源
        for tag in soup.find_all(style=True):
            style_content = tag.get('style', '')
            # 简单提取url()中的内容
            urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', style_content)
            for url in urls:
                full_url = urljoin(self.base_url, url)
                resources['images'].append(full_url)
        
        # 下载CSS文件并解析其中的资源
        print("\n开始下载CSS文件...")
        css_resources = []
        for url in resources['css']:
            local_path = self.get_local_path(url)
            if self.download_file(url, local_path):
                # 读取CSS内容并解析其中的资源
                try:
                    with open(local_path, 'r', encoding='utf-8') as f:
                        css_content = f.read()
                    
                    # 提取CSS中的资源
                    css_res = self.parse_css_resources(css_content, url)
                    css_resources.extend(css_res)
                    
                    # 修复CSS中的路径
                    fixed_css = self.fix_css_paths(css_content)
                    with open(local_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_css)
                    
                except Exception as e:
                    print(f"  解析CSS文件失败: {local_path} - {str(e)}")
            
            time.sleep(0.5)  # 避免请求过快
        
        print("\n开始下载JS文件...")
        for url in resources['js']:
            local_path = self.get_local_path(url)
            self.download_file(url, local_path)
            time.sleep(0.5)
        
        print("\n开始下载图片文件...")
        for url in set(resources['images']):  # 使用set去重
            local_path = self.get_local_path(url)
            self.download_file(url, local_path)
            time.sleep(0.5)
        
        # 下载CSS中引用的资源（字体、图片等）
        if css_resources:
            print(f"\n开始下载CSS中引用的资源（共{len(set(css_resources))}个）...")
            for url in set(css_resources):
                local_path = self.get_local_path(url)
                self.download_file(url, local_path)
                time.sleep(0.5)
        
        # 修复HTML路径并保存
        print("\n正在修复HTML中的资源路径...")
        fixed_html = self.fix_html_paths(original_html)
        main_html_path = os.path.join(self.output_folder, 'index.html')
        with open(main_html_path, 'w', encoding='utf-8') as f:
            f.write(fixed_html)
        print(f"✓ 已保存并修复主页面: {main_html_path}")
        
        print(f"\n爬取完成！文件保存在: {os.path.abspath(self.output_folder)}")
        print(f"总计下载:")
        print(f"  - CSS文件: {len(resources['css'])}")
        print(f"  - JS文件: {len(resources['js'])}")
        print(f"  - 图片文件: {len(set(resources['images']))}")
        print(f"  - CSS资源文件: {len(set(css_resources))}")


if __name__ == '__main__':
    # 配置
    target_url = 'https://kn.group/'
    output_folder = 'fooror_website2'
    
    # 创建爬虫并开始爬取
    crawler = WebsiteCrawler(target_url, output_folder)
    crawler.crawl()
    
    print("\n注意: 此脚本仅供学习研究使用，请遵守网站的使用条款和版权规定。")

