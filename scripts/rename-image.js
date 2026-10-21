// scripts/rename-image.js
const fs = require('fs');
const path = require('path');

const oldName = process.argv[2];
const newName = process.argv[3];

if (!oldName || !newName) {
  console.error("Usage: npm run rename <old-image-name> <new-image-name>");
  process.exit(1);
}

const dataDir = path.join(__dirname, '../data');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Simple string replace (handles paths like "images/old.jpg" or "/images/old.jpg")
      const regex = new RegExp(oldName, 'g');
      const updatedContent = content.replace(regex, newName);

      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent);
        console.log(`✅ Updated: ${file}`);
      }
    }
  }
}

console.log(`Searching for "${oldName}" across all JSON files...`);
processDirectory(dataDir);
console.log(`🚀 Done! All references updated to "${newName}".`);