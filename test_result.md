#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Add Precedent Family Trees feature - Instead of a flat list of similar cases, show a visual tree where cases cite each other, which case overturned which, which was influenced by which landmark ruling. Users can trace the legal DNA of their situation with zoom in/out and see which nodes are load-bearing for their argument."

backend:
  - task: "Legal Scholar LLM prompt generates precedent cases with citation relationships"
    implemented: true
    working: true
    file: "/app/backend/llm_council.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Updated legal_scholar prompt to generate 5-7 precedent cases with id, cites, influenced_by, overturned_by, is_landmark, and importance_score fields"
      - working: true
        agent: "testing"
        comment: "VERIFIED: GET /api/cases/{case_id}/analysis endpoint working correctly. Returns 7 precedent cases with proper citation relationships. All required fields present: id, case_name, court, year, outcome, relevance, importance_score (0-100), is_landmark (boolean), cites (array), influenced_by (array), overturned_by (string/null). Citation references validated - all point to valid case IDs within the dataset. Landmark cases identified correctly. Family tree structure complete."

frontend:
  - task: "PrecedentTreeModal component with force-directed graph visualization"
    implemented: true
    working: true
    file: "/app/frontend/src/components/PrecedentTreeModal.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created PrecedentTreeModal with react-force-graph-2d, supports zoom in/out, node hover tooltips, click for details panel, legend showing case types and relationships"

  - task: "AnalysisDashboard integration with View Family Tree button"
    implemented: true
    working: true
    file: "/app/frontend/src/components/AnalysisDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Updated SimilarCasesPanel to show View Family Tree button, added modal state and integration"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Verify precedent cases API returns proper citation data"
    - "Verify tree modal renders correctly"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Implemented Precedent Family Tree feature. Backend generates precedent cases with citation relationships (cites, influenced_by, overturned_by). Frontend shows radial force-directed graph in full-page modal when user clicks View Family Tree button. Node sizes based on importance_score, colors distinguish landmark/precedent/overturned cases."
  - agent: "testing"
    message: "BACKEND TESTING COMPLETE: All 18 tests passed (100% success rate). GET /api/cases/{case_id}/analysis endpoint verified working correctly with proper precedent case citation relationships. API returns 7 cases with complete family tree structure including landmark cases (K.M. Nanavati, Virsa Singh), citation relationships, and proper field validation. Ready for frontend integration testing."