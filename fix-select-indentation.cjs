#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing Select component indentation issues...\n');

// Get all files that use Select
const grepCommand = 'grep -r "<Select" frontend/src --include="*.jsx" --include="*.js" -l';
const files = execSync(grepCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

console.log(`📁 Found ${files.length} files with Select usage\n`);

let totalFixed = 0;

files.forEach((filePath, index) => {
  try {
    console.log(`[${index + 1}/${files.length}] Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix indentation issues with SelectItem
    const patterns = [
      // Pattern 1: SelectItem without proper indentation after Select
      /<Select([^>]*)>\s*\n<SelectItem/g,
      // Pattern 2: SelectItem without proper indentation before closing Select
      /<SelectItem([^>]*)>\s*\n<\/Select>/g,
      // Pattern 3: Multiple SelectItem without proper indentation
      /<SelectItem([^>]*)>\s*\n<SelectItem/g
    ];

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern, (match, props) => {
        modified = true;
        if (match.includes('<Select')) {
          return match.replace('<SelectItem', '              <SelectItem');
        } else if (match.includes('</Select>')) {
          return match.replace('<SelectItem', '              <SelectItem').replace('</Select>', '            </Select>');
        } else {
          return match.replace('<SelectItem', '              <SelectItem');
        }
      });
      if (newContent !== content) {
        content = newContent;
      }
    });

    // Fix specific indentation issues
    content = content.replace(/<Select([^>]*)>\s*\n<SelectItem/g, '<Select$1>\n              <SelectItem');
    content = content.replace(/<SelectItem([^>]*)>\s*\n<\/Select>/g, '<SelectItem$1>\n            </Select>');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Select indentation fixes completed!`);
console.log(`📊 Files fixed: ${totalFixed}`);
