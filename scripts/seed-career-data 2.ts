/**
 * Seed script for career paths and skills data
 *
 * Usage:
 *   npx tsx scripts/seed-career-data.ts
 *
 * This script:
 * 1. Reads JSON files from src/data/career-mappings/
 * 2. Inserts career paths and skills into Supabase
 * 3. Creates the program-to-career and program-to-skill mappings
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Type definitions matching our JSON structure
interface CareerPathInput {
  title: string
  title_es: string
  salary_min: number
  salary_max: number
  growth: string
}

interface SkillInput {
  name: string
  category: string
}

interface ProgramInput {
  name: string
  degree_type: string
  career_paths: CareerPathInput[]
  skills: SkillInput[]
}

interface SchoolData {
  school: string
  programs: ProgramInput[]
}

// Map school names to IDs (handles variations in naming)
const schoolNameToId: Record<string, string> = {
  'Valencia College': 'valencia',
  'University of Central Florida': 'ucf',
  'Seminole State College': 'seminole',
  'Seminole State College of Florida': 'seminole',
  'Orange Technical College': 'orange',
  'Full Sail University': 'fullsail',
}

// Generate a program key from the program name
function generateProgramKey(schoolId: string, programName: string): string {
  const cleanName = programName
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove degree type in parentheses
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores

  return `${schoolId}_${cleanName}`
}

// Normalize growth rate to match our enum
function normalizeGrowthRate(growth: string): string {
  const normalized = growth.toLowerCase().replace(/\s+/g, ' ').trim()

  const mapping: Record<string, string> = {
    'very high': 'very high',
    'high': 'high',
    'moderate-high': 'moderate-high',
    'moderate': 'moderate',
    'low-moderate': 'low-moderate',
    'low': 'low',
  }

  return mapping[normalized] || 'moderate'
}

// Normalize skill category
function normalizeSkillCategory(category: string): string {
  const normalized = category.toLowerCase().replace(/\s+/g, '_').trim()

  const mapping: Record<string, string> = {
    'technical': 'technical',
    'soft_skill': 'soft_skill',
    'tool': 'tool',
    'process': 'process',
  }

  return mapping[normalized] || 'technical'
}

async function seedSchoolData(schoolData: SchoolData) {
  const schoolName = schoolData.school
  const schoolId = schoolNameToId[schoolName]

  if (!schoolId) {
    console.error(`Unknown school: ${schoolName}`)
    return
  }

  console.log(`\n📚 Seeding data for ${schoolName} (${schoolData.programs.length} programs)...`)

  let careerPathsInserted = 0
  let skillsInserted = 0
  let mappingsCreated = 0

  for (const program of schoolData.programs) {
    const programKey = generateProgramKey(schoolId, program.name)
    console.log(`  📖 Processing: ${program.name} → ${programKey}`)

    // Insert career paths
    for (const careerPath of program.career_paths) {
      // Check if career path already exists
      const { data: existingPath } = await supabase
        .from('career_paths')
        .select('id')
        .eq('title', careerPath.title)
        .single()

      let careerPathId: string

      if (existingPath) {
        careerPathId = existingPath.id
      } else {
        // Insert new career path
        const { data: newPath, error } = await supabase
          .from('career_paths')
          .insert({
            title: careerPath.title,
            title_es: careerPath.title_es,
            salary_min: careerPath.salary_min,
            salary_max: careerPath.salary_max,
            growth_rate: normalizeGrowthRate(careerPath.growth),
          })
          .select('id')
          .single()

        if (error) {
          console.error(`    ❌ Error inserting career path: ${careerPath.title}`, error.message)
          continue
        }

        careerPathId = newPath.id
        careerPathsInserted++
      }

      // Create program-to-career mapping
      const { error: mappingError } = await supabase
        .from('program_career_paths')
        .upsert({
          program_key: programKey,
          school: schoolId,
          career_path_id: careerPathId,
          relevance_score: 100,
        }, {
          onConflict: 'program_key,school,career_path_id'
        })

      if (mappingError) {
        console.error(`    ❌ Error creating career mapping:`, mappingError.message)
      } else {
        mappingsCreated++
      }
    }

    // Insert skills
    for (const skill of program.skills) {
      // Check if skill already exists
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .single()

      let skillId: string

      if (existingSkill) {
        skillId = existingSkill.id
      } else {
        // Insert new skill
        const { data: newSkill, error } = await supabase
          .from('skills')
          .insert({
            name: skill.name,
            category: normalizeSkillCategory(skill.category),
          })
          .select('id')
          .single()

        if (error) {
          console.error(`    ❌ Error inserting skill: ${skill.name}`, error.message)
          continue
        }

        skillId = newSkill.id
        skillsInserted++
      }

      // Create program-to-skill mapping
      const { error: mappingError } = await supabase
        .from('program_skills')
        .upsert({
          program_key: programKey,
          school: schoolId,
          skill_id: skillId,
        }, {
          onConflict: 'program_key,school,skill_id'
        })

      if (mappingError) {
        console.error(`    ❌ Error creating skill mapping:`, mappingError.message)
      } else {
        mappingsCreated++
      }
    }
  }

  console.log(`  ✅ ${schoolName} complete:`)
  console.log(`     - ${careerPathsInserted} new career paths`)
  console.log(`     - ${skillsInserted} new skills`)
  console.log(`     - ${mappingsCreated} mappings created`)
}

async function main() {
  console.log('🚀 Starting career data seed...\n')

  const dataDir = path.join(process.cwd(), 'src', 'data', 'career-mappings')

  // Check if directory exists
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`)
    process.exit(1)
  }

  // Get all JSON files
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('No JSON files found in', dataDir)
    process.exit(0)
  }

  console.log(`Found ${files.length} school data file(s): ${files.join(', ')}`)

  for (const file of files) {
    const filePath = path.join(dataDir, file)
    console.log(`\n📁 Loading ${file}...`)

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const schoolData: SchoolData = JSON.parse(content)
      await seedSchoolData(schoolData)
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }

  console.log('\n✅ Seed complete!')
}

main().catch(console.error)
