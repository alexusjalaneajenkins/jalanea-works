/**
 * Generates supabase/seed.sql from JSON career data files
 *
 * Usage: node scripts/generate-seed-sql.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = './src/data/career-mappings';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

// Map school names to IDs
const schoolNameToId = {
  'Valencia College': 'valencia',
  'University of Central Florida': 'ucf',
  'Seminole State College': 'seminole',
  'Seminole State College of Florida': 'seminole',
  'Orange Technical College': 'orange',
  'Full Sail University': 'fullsail',
};

// Normalize growth rate
function normalizeGrowth(g) {
  const map = {
    'very high': 'very high',
    'high': 'high',
    'moderate-high': 'moderate-high',
    'moderate': 'moderate',
    'low-moderate': 'low-moderate',
    'low': 'low'
  };
  return map[g.toLowerCase().trim()] || 'moderate';
}

// Normalize skill category
function normalizeCat(c) {
  const map = {
    'technical': 'technical',
    'soft_skill': 'soft_skill',
    'soft skill': 'soft_skill',
    'tool': 'tool',
    'process': 'process'
  };
  return map[c.toLowerCase().replace(/\s+/g, '_')] || 'technical';
}

// Generate program key
function genKey(schoolId, name) {
  return schoolId + '_' + name.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

// Escape single quotes for SQL
function esc(s) {
  if (!s) return '';
  return s.replace(/'/g, "''");
}

let sql = '-- Career Data Seed File\n';
sql += '-- Generated from JSON files in src/data/career-mappings/\n';
sql += '-- Run with: supabase db seed\n\n';

// Track unique career paths and skills
const careerPaths = new Map();
const skills = new Map();
const programCareerLinks = [];
const programSkillLinks = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  const schoolId = schoolNameToId[data.school];

  if (!schoolId) {
    console.error('Unknown school:', data.school);
    continue;
  }

  console.log(`Processing ${data.school}: ${data.programs.length} programs`);

  for (const program of data.programs) {
    const programKey = genKey(schoolId, program.name);

    // Process career paths
    for (const cp of program.career_paths) {
      const cpKey = cp.title.toLowerCase();
      if (!careerPaths.has(cpKey)) {
        careerPaths.set(cpKey, {
          title: cp.title,
          title_es: cp.title_es || '',
          salary_min: cp.salary_min || 0,
          salary_max: cp.salary_max || 0,
          growth_rate: normalizeGrowth(cp.growth || 'moderate')
        });
      }
      programCareerLinks.push({ programKey, schoolId, careerTitle: cp.title });
    }

    // Process skills
    for (const sk of program.skills) {
      const skKey = sk.name.toLowerCase();
      if (!skills.has(skKey)) {
        skills.set(skKey, {
          name: sk.name,
          category: normalizeCat(sk.category || 'technical')
        });
      }
      programSkillLinks.push({ programKey, schoolId, skillName: sk.name });
    }
  }
}

// Generate career_paths inserts
sql += '-- Insert career paths (' + careerPaths.size + ' unique)\n';
sql += 'INSERT INTO career_paths (title, title_es, salary_min, salary_max, growth_rate) VALUES\n';
const cpValues = Array.from(careerPaths.values()).map(cp =>
  `  ('${esc(cp.title)}', '${esc(cp.title_es)}', ${cp.salary_min}, ${cp.salary_max}, '${cp.growth_rate}')`
);
sql += cpValues.join(',\n') + '\nON CONFLICT DO NOTHING;\n\n';

// Generate skills inserts
sql += '-- Insert skills (' + skills.size + ' unique)\n';
sql += 'INSERT INTO skills (name, category) VALUES\n';
const skValues = Array.from(skills.values()).map(sk =>
  `  ('${esc(sk.name)}', '${sk.category}')`
);
sql += skValues.join(',\n') + '\nON CONFLICT (name) DO NOTHING;\n\n';

// Generate program_career_paths inserts
sql += '-- Insert program to career path mappings (' + programCareerLinks.length + ' links)\n';
sql += 'INSERT INTO program_career_paths (program_key, school, career_path_id)\n';
sql += 'SELECT links.program_key, links.school, cp.id\n';
sql += 'FROM (VALUES\n';
const pcpValues = programCareerLinks.map(l =>
  `  ('${esc(l.programKey)}', '${l.schoolId}', '${esc(l.careerTitle)}')`
);
sql += pcpValues.join(',\n');
sql += '\n) AS links(program_key, school, career_title)\n';
sql += 'JOIN career_paths cp ON cp.title = links.career_title\n';
sql += 'ON CONFLICT (program_key, school, career_path_id) DO NOTHING;\n\n';

// Generate program_skills inserts
sql += '-- Insert program to skill mappings (' + programSkillLinks.length + ' links)\n';
sql += 'INSERT INTO program_skills (program_key, school, skill_id)\n';
sql += 'SELECT links.program_key, links.school, sk.id\n';
sql += 'FROM (VALUES\n';
const psValues = programSkillLinks.map(l =>
  `  ('${esc(l.programKey)}', '${l.schoolId}', '${esc(l.skillName)}')`
);
sql += psValues.join(',\n');
sql += '\n) AS links(program_key, school, skill_name)\n';
sql += 'JOIN skills sk ON sk.name = links.skill_name\n';
sql += 'ON CONFLICT (program_key, school, skill_id) DO NOTHING;\n';

// Write to file
fs.writeFileSync('./supabase/seed.sql', sql);

console.log('\n✅ Generated supabase/seed.sql');
console.log(`   Career paths: ${careerPaths.size}`);
console.log(`   Skills: ${skills.size}`);
console.log(`   Program-Career links: ${programCareerLinks.length}`);
console.log(`   Program-Skill links: ${programSkillLinks.length}`);
console.log('\nRun with: supabase db seed');
