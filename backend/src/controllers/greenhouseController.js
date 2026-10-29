import fs from 'fs';
import path from 'path';
import { GreenhouseJobApplication } from '../models/GreenhouseJobApplication.js';
import { greenhouseService } from '../services/greenhouse.service.js';

// Get Dashboard Metrics & Analytics
export const getGreenhouseDashboard = async (req, res) => {
  try {
    const metrics = await greenhouseService.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Greenhouse dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// List Applied Jobs with Filtering & Search
export const getApplications = async (req, res) => {
  try {
    const { status, search, board, date, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (board && board !== 'ALL') {
      filter.board_token = board.toLowerCase();
    }

    if (date) {
      filter.daily_batch_date = date;
    }

    if (req.query.is_india !== undefined && req.query.is_india !== 'ALL') {
      filter.is_india_role = req.query.is_india === 'true';
    }

    if (req.query.channel && req.query.channel !== 'ALL') {
      filter.apply_channel = req.query.channel;
    }

    if (req.query.outreach_status && req.query.outreach_status !== 'ALL') {
      filter.outreach_status = req.query.outreach_status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tech_stack: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [applications, total] = await Promise.all([
      GreenhouseJobApplication.find(filter)
        .sort({ applied_at: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      GreenhouseJobApplication.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Single Application Details
export const getApplicationById = async (req, res) => {
  try {
    const app = await GreenhouseJobApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application record not found' });
    }
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Application Status & Notes
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, interview_round } = req.body;
    const app = await GreenhouseJobApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application record not found' });
    }

    if (status) app.status = status;
    if (notes !== undefined) app.notes = notes;
    if (interview_round) {
      app.interview_rounds.push(interview_round);
      if (app.status === 'APPLIED') app.status = 'INTERVIEW';
    }

    await app.save();
    res.json({ success: true, data: app, message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Application Record
export const deleteApplication = async (req, res) => {
  try {
    const app = await GreenhouseJobApplication.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, message: 'Application record removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Live Greenhouse Board Explorer: Query live jobs for any board token
export const exploreBoardJobs = async (req, res) => {
  try {
    const { boardToken = 'stripe', keyword = '', content = false } = req.query;
    const cleanToken = boardToken.trim().toLowerCase();

    const jobs = await greenhouseService.fetchBoardJobs(cleanToken, { content: content === 'true' });

    // Check which ones are already applied
    const appliedJobIds = new Set(
      (await GreenhouseJobApplication.find({ board_token: cleanToken }, 'job_id')).map(a => String(a.job_id))
    );

    let filtered = jobs;
    if (keyword) {
      const kLower = keyword.toLowerCase();
      filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(kLower) ||
        (j.department && j.department.toLowerCase().includes(kLower)) ||
        (j.location && j.location.toLowerCase().includes(kLower))
      );
    }

    const annotatedJobs = filtered.map(j => ({
      ...j,
      isApplied: appliedJobIds.has(String(j.id))
    }));

    res.json({
      success: true,
      boardToken: cleanToken,
      companyName: greenhouseService.formatCompanyName(cleanToken),
      totalJobsOnBoard: jobs.length,
      filteredCount: annotatedJobs.length,
      jobs: annotatedJobs
    });
  } catch (error) {
    console.error('Explore board error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 1-Click Apply to a Single Job
export const applySingleJob = async (req, res) => {
  try {
    const { boardToken, jobId, force = false } = req.body;
    if (!boardToken || !jobId) {
      return res.status(400).json({ success: false, error: 'boardToken and jobId are required' });
    }

    const result = await greenhouseService.applyToJob({
      boardToken,
      jobId,
      force
    });

    res.json(result);
  } catch (error) {
    console.error('Apply single job error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Trigger Daily 20 Jobs Auto-Apply Cycle
export const triggerDailyCycle = async (req, res) => {
  try {
    const { targetCount = 20, force = false } = req.body;

    // Run cycle
    const result = await greenhouseService.runDaily20JobCycle({
      targetCount: parseInt(targetCount, 10) || 20,
      force: force === true || force === 'true'
    });

    res.json(result);
  } catch (error) {
    console.error('Daily cycle error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Candidate Profile & Resume Status
export const getCandidateProfile = async (req, res) => {
  try {
    const profile = await greenhouseService.getCandidateProfile();
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Candidate Profile
export const updateCandidateProfile = async (req, res) => {
  try {
    const profile = await greenhouseService.saveCandidateProfile(req.body);
    res.json({ success: true, data: profile, message: 'Candidate profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload Resume File
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded' });
    }

    const uploadsDir = path.resolve('uploads', 'resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFilename = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destinationPath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(destinationPath, req.file.buffer);

    // Update candidate profile
    const currentProfile = await greenhouseService.getCandidateProfile();
    const updated = await greenhouseService.saveCandidateProfile({
      ...currentProfile,
      resume_filename: req.file.originalname,
      resume_path: destinationPath,
      resume_uploaded_at: new Date()
    });

    res.json({
      success: true,
      message: `Resume "${req.file.originalname}" uploaded and set as active application file!`,
      data: updated
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Download Current Resume
export const downloadResume = async (req, res) => {
  try {
    const profile = await greenhouseService.getCandidateProfile();
    if (!profile.resume_path || !fs.existsSync(profile.resume_path)) {
      // Return a generated sample if file not uploaded yet
      const sample = await greenhouseService.ensureResumeFile(profile);
      return res.download(sample.path, sample.filename);
    }
    res.download(profile.resume_path, profile.resume_filename || 'resume.pdf');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Dispatch Direct Recruiter Outreach Email
export const sendOutreachEmail = async (req, res) => {
  try {
    const { applicationId, recipientEmail, subject, customBody } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, error: 'applicationId is required' });
    }

    const result = await greenhouseService.sendDirectOutreach({
      applicationId,
      recipientEmail,
      subject,
      customBody
    });

    res.json(result);
  } catch (error) {
    console.error('Send outreach email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

