import os, json, io, re, sys

class CodePackagePythonFS:
    def __init__(self, baseDir):
        self.repo = baseDir.split('/')[-1]
        self.baseDir = baseDir

    def fetchFile(self, url):
        try:
            with io.open(self.baseDir + url, 'r') as file:
                return file.read()
        except Exception as e:
            jb = globals().get('jb')
            if jb:
                jb.logException(e, 'python utils load file', {'url': url})
            else:
                print(f"python utils - error loading {url}", file=sys.stderr)

    def fetchJSON(self, url):
        return json.loads(self.fetchFile(url))

    def fileSymbols(self, path):
        try:
            return [self.fileContent(path) for path in self.getFilesInDir(path) if path.endswith('.js')]
        except Exception as e:
            return []

    def getFilesInDir(self, dirPath):
        files = []
        for file in sorted(os.listdir(f"{self.baseDir}/{dirPath}")):
            path = f"{dirPath}/{file}"
            if os.path.isdir(f"{self.baseDir}/{path}"):
                files.extend(self.getFilesInDir(path))
            else:
                files.append(path)
        return files

    def fileContent(self, path):
        with io.open(f"{self.baseDir}/{path}", 'r') as file:
            content = file.read()
            return {
                'path': f'/{path}',
                'dsl': self.unique([match[1] for match in re.findall(r'^(jb\.)?dsl\(\'([^\']+)\'', content)]),
                'pluginDsl': self.unique([match[1] for match in re.findall(r'^(jb\.)?pluginDsl\(\'([^\']+)\'', content)]),
                'ns': self.unique([match[1] for match in re.findall(r'^(jb\.)?component\(\'([^\']+)\'', content)]),
                'libs': self.unique([match[1] for match in re.findall(r'^(jb\.)?extension\(\'([^\']+)\'', content)]),
                'using': self.unique([item.strip() for match in re.findall(r'^(jb\.)?using\(\'([^\']+)\'', content) for item in match[1].split(',')]),
            }

    @staticmethod
    def unique(lst):
        return list(set(lst))


class JBHost:
    def __init__(self):
        self.jbReactDir = JBHost.find_jb_react()

    def getProcessArgument(self, argName):
        for arg in sys.argv:
            if arg.startswith('-' + argName + ':'):
                return arg.split(':')[1]
            if arg == '-' + argName:
                return True
        return ''

    def log(self, *args):
        print(*args)

    def codePackageFromJson(self, _package):
        if _package is None or _package == {'$': 'defaultPackage'}:
            return CodePackagePythonFS(JBHost.find_jb_react())
        if _package.get('$') == 'fileSystem':
            return CodePackagePythonFS(_package.get('baseDir'))
        
    def find_jb_react():
        path = os.getcwd()
        match = re.search(r'projects/jb-react(.*)$', path)
        if match:
            return path if len(match.group(1)) == 0 else path[0:-len(match.group(1))]
    
jbHost = JBHost()
globals()['jbHost'] = jbHost
