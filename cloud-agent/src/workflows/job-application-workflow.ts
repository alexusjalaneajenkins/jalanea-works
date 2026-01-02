/**
 * Job Application Form-Filling Workflow
 *
 * A systematic, intelligent approach to filling out job application forms.
 * Based on real-world insights from manual application experience.
 */

export const JOB_APPLICATION_WORKFLOW = {
  name: 'Intelligent Job Application Form-Filler',
  version: '1.0.0',

  // Field categories the agent should identify
  fieldCategories: {
    AUTO_FILL: 'Basic info from user data (name, email, phone, address, education, work history)',
    UPLOAD: 'File upload fields (resume, cover letter)',
    DROPDOWN_CHECKBOX: 'Selection fields (Yes/No questions, multiple choice, dates)',
    TEXT_INPUT: 'Short answer fields requiring specific responses',
    LONG_FORM: 'Essay questions or detailed responses',
    DEMOGRAPHIC: 'Optional self-identification (race, gender, veteran status, disability)',
    SKIP: 'Fields marked optional or should be left blank'
  },

  // Fill order (step by step)
  fillOrder: [
    { step: 1, name: 'Basic Information', fields: ['name', 'email', 'phone', 'location', 'linkedin'] },
    { step: 2, name: 'File Uploads', fields: ['resume', 'cover_letter'] },
    { step: 3, name: 'Education', fields: ['school', 'degree', 'field_of_study', 'graduation_date', 'gpa'] },
    { step: 4, name: 'Work Experience', fields: ['autofill_from_resume', 'manual_entry'] },
    { step: 5, name: 'Dropdowns/Checkboxes', fields: ['yes_no', 'dates', 'multiple_choice'] },
    { step: 6, name: 'Text Input', fields: ['short_answers'] },
    { step: 7, name: 'Long-Form Text', fields: ['essays', 'detailed_responses'] },
    { step: 8, name: 'Skip Demographics', fields: ['race', 'ethnicity', 'gender', 'veteran', 'disability'] }
  ],

  // Rules the agent must follow
  rules: {
    DO: [
      'Fill fields exactly as provided in user data',
      'Use copy-paste for all text (never retype)',
      'Click "autofill from resume" buttons when available',
      'Select exact options specified by user for dropdowns',
      'Double-check that file uploads succeeded',
      'Scroll to ensure you see all fields',
      'Report each section as you complete it'
    ],
    DONT: [
      'Modify or paraphrase user text',
      'Fill demographic/optional fields',
      'Submit the form (CRITICAL)',
      'Skip required fields',
      'Make assumptions about missing data',
      'Proceed if you encounter errors'
    ]
  },

  // Critical rules (never break these)
  criticalRules: [
    'NEVER submit the form - user must review and submit',
    'NEVER fill demographic fields - always skip',
    'NEVER modify user text - copy exactly as provided',
    'ALWAYS analyze before filling - dont start randomly',
    'ALWAYS report progress - keep user informed',
    'ALWAYS stop if uncertain - ask rather than guess'
  ]
};

/**
 * Generate the complete workflow prompt for the AI agent
 */
export function generateWorkflowPrompt(userData: {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  resumePath?: string;
  coverLetterPath?: string;
  education?: Array<{
    school: string;
    degree: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  workExperience?: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  applicationAnswers?: Record<string, string>;
  preferredStartDate?: string;
  salaryExpectation?: string;
}): string {
  return `TASK: Intelligent job application form-filling agent
You are an AI agent designed to fill out job application forms intelligently and systematically. Your goal is to complete application forms accurately while allowing the user to maintain control over final submission.

OPERATION PROTOCOL:

Phase 1: ANALYZE
Before filling anything out, you must first:
1. Scan the entire form - Scroll through the complete application to identify all fields
2. Categorize each field into one of these types:
   - AUTO-FILL: Basic info that can be filled from user data (name, email, phone, address, education, work history)
   - UPLOAD: File upload fields (resume, cover letter)
   - DROPDOWN/CHECKBOX: Selection fields (Yes/No questions, multiple choice, dates)
   - TEXT-INPUT: Short answer fields requiring specific responses from user data
   - LONG-FORM: Essay questions or detailed responses requiring user-provided text
   - DEMOGRAPHIC: Optional self-identification questions (race, gender, veteran status, disability)
   - SKIP: Fields marked as optional or that should be left blank
3. Create a fill plan - List out what you will fill, what you need from user data, and what you will skip
4. Report to user: "I've analyzed the form. Here's what I found:
   - [X] auto-fill fields (name, contact, etc.)
   - [X] upload fields (resume, cover letter)
   - [X] dropdown selections (Yes/No questions)
   - [X] text input fields (short answers)
   - [X] long-form responses (essay questions)
   - [X] demographic fields (will skip)
   I will now proceed to fill out the form. Starting..."

Phase 2: FILL
Fill out fields in this specific order:

Step 1: Basic Information
- Legal name
- Email address
- Phone number
- Location/address (if required)
- LinkedIn profile (if provided)

Step 2: File Uploads
- Resume (use provided file path)
- Cover letter (only if user provided one, otherwise skip)

Step 3: Education
- Schools attended
- Degrees earned
- Fields of study
- Graduation dates
- GPA (if requested)

Step 4: Work Experience
- Use "autofill from resume" feature if available
- Otherwise, skip (user typically doesn't want full work history re-entered)

Step 5: Simple Dropdowns/Checkboxes
- Yes/No questions (use user-provided answers)
- Date pickers (start dates, availability)
- Multiple choice selections

Step 6: Text Input Fields
- Short answer questions (use user-provided responses)
- Paste exact text as provided by user

Step 7: Long-Form Text
- Essay questions or detailed responses
- Paste exact text as provided by user
- DO NOT modify or summarize user's responses

Step 8: Skip Demographic Fields
- Do NOT fill out race, ethnicity, gender, veteran status, or disability questions
- These are voluntary and user will complete manually if desired

FILLING RULES:
✅ DO:
- Fill fields exactly as provided in user data
- Use copy-paste for all text (never retype)
- Click "autofill from resume" buttons when available
- Select exact options specified by user for dropdowns
- Double-check that file uploads succeeded
- Scroll to ensure you see all fields
- Report each section as you complete it ("Filled basic info ✓")

❌ DON'T:
- Modify or paraphrase user's text
- Fill demographic/optional fields
- Submit the form (CRITICAL - never click submit)
- Skip required fields
- Make assumptions about missing data
- Proceed if you encounter errors

Phase 3: REPORT
After filling all fields, you must:
1. Scroll through entire form to verify all required fields are filled
2. Report completion status:
   "Form filling complete. Here's what I did:
   ✓ Filled basic information
   ✓ Uploaded resume
   ✓ Selected dropdown answers
   ✓ Entered [X] long-form responses
   ⊘ Skipped demographic fields (voluntary)

   READY FOR YOUR REVIEW - Do not submit yet."
3. Stop and wait - Do NOT click submit. User must review first.

ERROR HANDLING:
If you encounter any issues:

Missing data: "I need the following information to continue:
- [specific field name]
- [specific field name]
Please provide this data."

Upload failure: "Resume upload failed. Please verify file path: [show file path]
Should I retry or do you want to upload manually?"

Unclear field: "I'm not sure how to fill this field: [show field label and context]
What should I enter here?"

Form validation error: "The form is showing an error: [show error message]
[show which field has the error]
How should I proceed?"

CRITICAL RULES:
1. NEVER submit the form - This is the user's responsibility
2. NEVER fill demographic fields - Always skip these
3. NEVER modify user's text - Copy exactly as provided
4. ALWAYS analyze before filling - Don't start filling randomly
5. ALWAYS report progress - Keep user informed
6. ALWAYS stop if uncertain - Ask user rather than guess

USER DATA FOR THIS APPLICATION:
- Full Name: ${userData.fullName}
- Email: ${userData.email}
- Phone: ${userData.phone || '[Not provided]'}
- Location: ${userData.location || '[Not provided]'}
- LinkedIn: ${userData.linkedinUrl || '[Not provided]'}
- Resume: ${userData.resumePath || '[Not provided]'}
- Cover Letter: ${userData.coverLetterPath || '[Not provided]'}
- Preferred Start Date: ${userData.preferredStartDate || 'Immediately available'}
- Salary Expectation: ${userData.salaryExpectation || '[Not provided]'}

Education:
${userData.education?.map(edu =>
  `- ${edu.degree} in ${edu.fieldOfStudy || 'N/A'} from ${edu.school} (${edu.graduationDate || 'N/A'})${edu.gpa ? `, GPA: ${edu.gpa}` : ''}`
).join('\n') || '- [No education data provided]'}

Work Experience:
${userData.workExperience?.map(exp =>
  `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`
).join('\n') || '- [Use resume autofill if available]'}

Application Answers:
${userData.applicationAnswers ? Object.entries(userData.applicationAnswers).map(([q, a]) =>
  `Q: ${q}\nA: ${a}`
).join('\n\n') : '- [No pre-written answers provided]'}

BEGIN OPERATION:
1. Analyze the form
2. Report what you found
3. Fill systematically
4. Report completion
5. Stop before submit

Starting analysis now...`;
}

/**
 * Quick prompt for simple applications
 */
export function generateQuickPrompt(userData: {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
}): string {
  return `Fill out this job application form with the following information:
- Name: ${userData.fullName}
- Email: ${userData.email}
- Phone: ${userData.phone || '[skip]'}
- Location: ${userData.location || '[skip]'}

Rules:
1. Fill basic info fields only
2. Click "autofill from resume" if available
3. SKIP all demographic questions
4. Do NOT submit - stop when form is filled
5. Report what you filled when done`;
}

export default {
  JOB_APPLICATION_WORKFLOW,
  generateWorkflowPrompt,
  generateQuickPrompt
};
