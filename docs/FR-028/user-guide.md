# FR-028 User Guide: Admin Approval System

## Overview

The Admin Approval System allows group administrators to designate certain tasks as requiring approval before they can be marked as completed. This provides an extra layer of oversight for important or sensitive tasks.

---

## For Group Administrators

### Creating Approval-Required Tasks

When creating a new task, you have the option to mark it as requiring approval:

1. Navigate to your group's task page
2. Click **"Create Task"** or **"Add Task"**
3. Fill in the task details (name, difficulty, due date, etc.)
4. Check the **"Requires Approval"** checkbox
5. Click **"Create"**

**Result:** The task will be created with a amber warning icon (⚠️) indicating it requires approval before completion.

### What Makes a Task "Approval-Required"?

- Only group admins can create tasks with approval requirements
- Members can work on the task and update its status
- Members **cannot** mark the task as "Completed"
- Members must submit the task for your review by setting status to "Waiting for Approval"
- Only you (as admin) can mark the task as "Completed"

### Approving Tasks

When a member completes work on an approval-required task:

1. The member sets the task status to **"Waiting for Approval"**
2. You'll see the task with this status in your task list
3. Review the task completion criteria
4. If approved, change the status to **"Completed"**
5. If not approved, you can:
   - Change status back to **"In Progress"**
   - Add a comment explaining what needs correction (if comments are available)
   - Reassign the task if needed

### Filtering Approval Tasks

Use the task filter dropdown to view:
- **"Requires Approval"** - See only tasks that need admin approval
- **"Standard Tasks"** - See regular tasks without approval requirements
- **"All Tasks"** - Default view showing everything

### Editing Approval Requirements

You can change whether a task requires approval at any time:

1. Open the task details or edit form
2. Check or uncheck **"Requires Approval"**
3. Save the task

**Note:** All changes to approval requirements are logged in the task history.

---

## For Group Members

### Working on Approval-Required Tasks

Tasks that require approval are marked with an amber warning icon (⚠️). Here's how to work with them:

#### Starting Work

1. Select the task from the task list
2. Change status to **"In Progress"** when you begin
3. Complete the work according to task requirements

#### Submitting for Approval

When you've finished the work:

1. Open the task
2. Change the status to **"Waiting for Approval"**
3. The task is now flagged for admin review
4. You cannot change the status to "Completed" yourself

#### Available Status Options

For approval-required tasks, you can set the status to:
- **Not Started** - Task hasn't been begun
- **In Progress** - Currently working on it
- **Waiting for Approval** - Work completed, awaiting admin review

**Note:** The "Completed" status is only available to group administrators for approval-required tasks.

### If Your Approval Request is Denied

If an admin changes the status back to "In Progress":

1. Check task history or comments for feedback
2. Make the requested corrections
3. Submit for approval again by setting status to "Waiting for Approval"

### Creating Regular Tasks

You can still create regular tasks (without approval requirements) as before:

1. Create a task normally
2. Leave **"Requires Approval"** unchecked
3. You'll be able to mark the task as completed yourself

---

## Use Cases

### When to Use Approval-Required Tasks

✅ **Good use cases:**
- Financial transactions or budget approvals
- Sensitive data handling
- Quality control checkpoints
- Client-facing deliverables
- Regulatory compliance tasks
- Learning/training verification

❌ **Probably not needed:**
- Routine daily tasks
- Personal to-do items
- Low-risk activities
- Tasks assigned to admins

### Example Scenarios

#### Scenario 1: Monthly Budget Review

**Admin creates task:**
- Name: "Review January budget report"
- Assigned to: Finance team member
- Difficulty: 7
- ✅ **Requires Approval** (checked)

**Member workflow:**
1. Member prepares budget report
2. Member sets status to "Waiting for Approval"
3. Admin reviews report
4. Admin marks as "Completed" or requests revisions

#### Scenario 2: Client Presentation

**Admin creates task:**
- Name: "Prepare Q1 client presentation"
- Assigned to: Marketing member
- Difficulty: 8
- ✅ **Requires Approval** (checked)

**Member workflow:**
1. Member creates presentation
2. Member sets status to "Waiting for Approval"
3. Admin reviews presentation quality
4. Admin either approves (Completed) or requests changes (back to In Progress)

#### Scenario 3: Regular Cleaning Task

**Any member creates task:**
- Name: "Weekly office cleaning"
- Assigned to: Facility team
- Difficulty: 3
- ❌ **Requires Approval** (unchecked)

**Result:** Member can mark as completed without admin review.

---

## Visual Indicators

### Approval Icon

Tasks requiring approval display an **amber warning icon (⚠️)** next to the task name:

- **Small size** - In task lists
- **Medium size** - In task cards
- **Large size** - In task detail views

Hover over the icon to see: **"Requires admin approval"**

### Status Colors

- **Not Started** - Gray
- **In Progress** - Blue
- **Waiting for Approval** - Amber (🟡)
- **Completed** - Green

---

## Frequently Asked Questions

### Can I remove the approval requirement from a task?

**Yes**, if you're a group admin. Edit the task and uncheck "Requires Approval". The task will immediately become a standard task.

### What happens if a member tries to mark an approval task as completed?

The system will prevent this action and display an error: "Only group admins can complete tasks that require approval."

### Can I see who approved a task?

Yes, task history logs show when approval requirements were added, when tasks were submitted for approval, and who marked them as completed.

### Do existing tasks require approval?

No, existing tasks automatically have approval requirements turned off to maintain current behavior.

### Can observers see approval-required tasks?

Yes, observers can view approval-required tasks but cannot change their status.

### What if no admin is available to approve my task?

The task will remain in "Waiting for Approval" status. Contact your group admin or escalate through your team's communication channels.

### Can I filter by approval status?

Yes, use the task filter to show:
- Only approval-required tasks
- Only standard tasks
- All tasks (default)

### Will approval-required tasks show in my task count/stats?

Yes, they count toward all normal metrics (pending tasks, completed tasks, difficulty points, etc.).

---

## Troubleshooting

### Issue: I can't create a task with approval requirements

**Solution:** Only group administrators can create approval-required tasks. Check your role in the group settings.

### Issue: The "Waiting for Approval" status doesn't appear

**Solution:** This status only appears if:
1. The task has `requiresApproval` set to true
2. You're viewing as a group member or admin

### Issue: I accidentally created a task with approval requirements

**Solution:** Edit the task and uncheck "Requires Approval" (admin only). Or delete and recreate the task.

### Issue: Admin can't mark task as completed

**Solution:** Ensure:
1. You're logged in as a group admin
2. The task is in "Waiting for Approval" or another valid status
3. Your browser cache is current (refresh the page)

---

## Admin Best Practices

1. **Be Clear**: Communicate approval criteria upfront
2. **Be Responsive**: Review approval requests promptly
3. **Provide Feedback**: If rejecting, explain what needs improvement
4. **Use Sparingly**: Only require approval when truly necessary
5. **Document Standards**: Create written guidelines for approval criteria
6. **Set Expectations**: Let members know typical approval turnaround time

---

## Member Best Practices

1. **Review Requirements**: Understand approval criteria before starting
2. **Double-Check Work**: Verify completeness before submitting for approval
3. **Submit When Ready**: Don't submit for approval if you know work is incomplete
4. **Respond to Feedback**: Address admin comments or corrections promptly
5. **Communicate Issues**: If unclear on requirements, ask admin before submitting

---

## Support

For technical issues or questions about the approval system:
1. Check this user guide
2. Review the API documentation (for developers)
3. Contact your system administrator
4. File a bug report if you encounter unexpected behavior

---

**Last Updated:** January 2024  
**Feature Release:** FR-028 Admin Approval System
