#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files that use SelectTrigger or SelectContent
const grepCommand = 'grep -r "SelectTrigger\\|SelectContent" frontend/src --include="*.jsx" --include="*.js" -l';
const files = execSync(grepCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files with SelectTrigger/SelectContent usage`);

files.forEach(filePath => {
  try {
    console.log(`Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove SelectTrigger and SelectContent from imports
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"][^'"]+['"];?/g;
    content = content.replace(importRegex, (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      const filteredImports = importList.filter(imp =>
        !imp.includes('SelectTrigger') &&
        !imp.includes('SelectContent') &&
        !imp.includes('SelectValue')
      );

      if (filteredImports.length !== importList.length) {
        modified = true;
        return match.replace(imports, filteredImports.join(', '));
      }
      return match;
    });

    // Fix Select components - remove SelectTrigger and SelectContent wrappers
    const selectRegex = /<Select([^>]*)>\s*<SelectTrigger[^>]*>\s*<SelectValue[^>]*\/>\s*<\/SelectTrigger>\s*<SelectContent>\s*([\s\S]*?)\s*<\/SelectContent>\s*<\/Select>/g;

    content = content.replace(selectRegex, (match, selectProps, selectContent) => {
      modified = true;

      // Extract className from SelectTrigger if it exists
      const triggerMatch = match.match(/<SelectTrigger[^>]*className="([^"]*)"[^>]*>/);
      const className = triggerMatch ? triggerMatch[1] : '';

      // Extract placeholder from SelectValue if it exists
      const placeholderMatch = match.match(/<SelectValue[^>]*placeholder="([^"]*)"[^>]*\/>/);
      const placeholder = placeholderMatch ? placeholderMatch[1] : '';

      // Build new Select component
      let newSelect = `<Select${selectProps}`;
      if (className) {
        newSelect += ` className="${className}"`;
      }
      if (placeholder) {
        newSelect += ` placeholder="${placeholder}"`;
      }
      newSelect += `>\n${selectContent}\n</Select>`;

      return newSelect;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Select component fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Test the application');
console.log('3. Check for any remaining SelectTrigger/SelectContent usage');
