const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['.git', 'node_modules', 'dist', 'build', '.next', '.cache', 'scratch'];
const ALLOWED_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.md', '.cjs', '.mjs', '.txt'];

function walkAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                walkAndReplace(fullPath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (ALLOWED_EXTS.includes(ext) || file === '.env') {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let newContent = content;
                    
                    newContent = newContent.replace(/tastizo/g, 'tastizo');
                    newContent = newContent.replace(/Tastizo/g, 'Tastizo');
                    newContent = newContent.replace(/Tastizo/g, 'Tastizo');
                    newContent = newContent.replace(/TASTIZO/g, 'TASTIZO');
                    
                    if (content !== newContent) {
                        fs.writeFileSync(fullPath, newContent, 'utf8');
                        console.log(`Replaced in ${fullPath}`);
                    }
                } catch (e) {
                    console.error(`Error reading/writing ${fullPath}: ${e.message}`);
                }
            }
        }
    }
}

walkAndReplace(__dirname);
