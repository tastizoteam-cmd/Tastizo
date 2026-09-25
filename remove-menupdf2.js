const fs = require('fs');
const path = 'frontend/src/modules/Food/pages/restaurant/Onboarding.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Hydration
content = content.replace(/[\s]*const restoredMenuPdf = await getFileFromDB\("menuPdf"\)/g, '');
content = content.replace(/[\s]*menuPdf:[\s]*restoredMenuPdf \|\|[\s]*\(typeof localData\.step2\.menuPdf === "string" \|\| localData\.step2\.menuPdf\?\.url[\s]*\? localData\.step2\.menuPdf[\s]*: null\),/g, '');

// 2. Validation
content = content.replace(/[\s]*if \(!step2\.menuPdf\) \{[\s]*errors\.push\("Menu PDF is required"\)[\s]*\} else \{[\s]*const isValidMenuPdf =[\s]*isUploadableFile\(step2\.menuPdf\) \|\|[\s]*\(step2\.menuPdf\?\.url && typeof step2\.menuPdf\.url === "string"\) \|\|[\s]*\(typeof step2\.menuPdf === "string" && step2\.menuPdf\.trim\(\)\)[\s]*if \(!isValidMenuPdf\) \{[\s]*errors\.push\("Please upload a valid menu PDF"\)[\s]*\}[\s]*\}/g, '');

// 3. Submit
content = content.replace(/[\s]*if \(!isUploadableFile\(step2\.menuPdf\)\) \{[\s]*throw new Error\("Menu PDF is required"\)[\s]*\}[\s]*formData\.append\("menuPdf", step2\.menuPdf\)/g, '');

// 4. Update Profile
content = content.replace(/[\s]*menuPdfPayload,/g, '');
content = content.replace(/[\s]*resolveMenuPdfForProfileUpdate\(step2\.menuPdf\),/g, '');
content = content.replace(/[\s]*if \(menuPdfPayload\) \{[\s]*updatePayload\.menuPdf = menuPdfPayload[\s]*\}/g, '');

// 5. Functions
content = content.replace(/[\s]*await persistMenuPdfToDB\(step2\.menuPdf \|\| null\)/g, '');
content = content.replace(/[\s]*const handleMenuPdfSelected[\s\S]*?persistMenuPdfToDB\(file\)[\s]*\}/g, '');
content = content.replace(/[\s]*const handleRemoveMenuPdf[\s\S]*?persistMenuPdfToDB\(null\)[\s]*\}/g, '');
content = content.replace(/[\s]*const resolveMenuPdfForProfileUpdate[\s\S]*?return getPersistedImagePayload\(value\)[\s]*\}/g, '');

fs.writeFileSync(path, content);
console.log('Fixed');
