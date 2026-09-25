const fs = require('fs');
const path = 'Frontend/src/modules/Food/pages/restaurant/Onboarding.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove hydration of menuPdf
content = content.replace(/const restoredMenuPdf = await getFileFromDB\("menuPdf"\)[\r\n\s]+/, '');
content = content.replace(/menuPdf:[\s\S]*?restoredMenuPdf \|\|[\s\S]*?\(typeof localData\.step2\.menuPdf === "string" \|\| localData\.step2\.menuPdf\?\.url[\s\S]*?\? localData\.step2\.menuPdf[\s\S]*?: null\),[\r\n\s]+/, '');

// 2. Remove saving of menuPdf
content = content.replace(/await persistMenuPdfToDB\(step2\.menuPdf \|\| null\)[\r\n\s]+/, '');

// 3. Remove validation of menuPdf
content = content.replace(/if \(!step2\.menuPdf\) \{[\s\S]*?errors\.push\("Menu PDF is required"\)[\s\S]*?\} else \{[\s\S]*?const isValidMenuPdf =[\s\S]*?isUploadableFile\(step2\.menuPdf\) \|\|[\s\S]*?\(step2\.menuPdf\?\.url && typeof step2\.menuPdf\.url === "string"\) \|\|[\s\S]*?\(typeof step2\.menuPdf === "string" && step2\.menuPdf\.trim\(\)\)[\s\S]*?if \(!isValidMenuPdf\) \{[\s\S]*?errors\.push\("Please upload a valid menu PDF"\)[\s\S]*?\}[\s\S]*?\}[\r\n\s]+/, '');

fs.writeFileSync(path, content);
console.log("Success");
